import { useState, useMemo } from 'react';
import { Search, Plus, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Button from '../../../components/ui/Button';
import { useGetAllCustomersQuery } from '../../../api/dealerStaff/customerApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { useGetAllModelColorsQuery } from '../../../api/evmStaff/productApi';
import { useCreateDraftOrderMutation } from '../../../api/dealerStaff/orderApi';

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Select Customer, 2: Select Product, 3: Review
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { data: customersData } = useGetAllCustomersQuery();
  const { data: modelsData } = useGetAllModelsQuery();
  const { data: modelColorsData } = useGetAllModelColorsQuery();
  const [createOrder, { isLoading: isCreating }] = useCreateDraftOrderMutation();

  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  const models = Array.isArray(modelsData?.data) ? modelsData.data : [];
  const modelColors = Array.isArray(modelColorsData?.data) ? modelColorsData.data : [];

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers.slice(0, 3);
    return customers.filter(c =>
      c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
    ).slice(0, 3);
  }, [customers, searchTerm]);

  // Get available colors for selected model
  const availableColors = useMemo(() => {
    if (!selectedModel) return [];
    return modelColors.filter(mc => mc.modelId === selectedModel.modelId);
  }, [selectedModel, modelColors]);

  // Calculate pricing
  const pricing = useMemo(() => {
    if (!selectedColor) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = selectedColor.price * quantity;
    const tax = subtotal * 0.1; // 10% VAT
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [selectedColor, quantity]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleNextStep = () => {
    if (step === 1 && selectedCustomer) {
      setStep(2);
    } else if (step === 2 && selectedModel && selectedColor) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedCustomer || !selectedModel || !selectedColor) {
      alert('Vui lòng hoàn tất tất cả các bước');
      return;
    }

    try {
      const orderData = {
        customerId: selectedCustomer.customerId,
        modelId: selectedModel.modelId,
        colorId: selectedColor.colorId,
        quantity,
        totalAmount: pricing.total,
      };
      await createOrder(orderData).unwrap();
      alert('Tạo đơn hàng thành công!');
      navigate('/dealer-staff/orders');
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const progressPercentage = (step / 4) * 100;

  return (
    <DealerStaffLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* PageHeading */}
        <div className="flex flex-wrap justify-between gap-3 items-center mb-6">
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-bold tracking-tight">Tạo Đơn Hàng Mới</h1>
        </div>

        {/* ProgressBar */}
        <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm mb-6">
          <div className="flex gap-6 justify-between items-center">
            <p className="text-slate-800 dark:text-slate-200 text-base font-medium leading-normal">
              Bước {step}/4: {step === 1 ? 'Chọn Khách Hàng' : step === 2 ? 'Chọn Sản Phẩm' : step === 3 ? 'Xác Nhận' : 'Hoàn Thành'}
            </p>
          </div>
          <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-2">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Steps */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm">
              {/* Step 1: Select Customer */}
              {step === 1 && (
                <>
                  <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight pb-4 border-b border-slate-200 dark:border-slate-800">
                    Chọn một khách hàng có sẵn hoặc tạo khách hàng mới
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    {/* SearchBar */}
                    <div className="flex-grow">
                      <label className="flex flex-col w-full">
                        <div className="flex w-full flex-1 items-stretch rounded-lg h-12">
                          <div className="text-slate-500 dark:text-slate-400 flex bg-slate-100 dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg">
                            <Search size={20} />
                          </div>
                          <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-slate-100 dark:bg-slate-800 h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 pl-2 text-sm font-normal leading-normal"
                            placeholder="Tìm kiếm theo tên hoặc SĐT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                      </label>
                    </div>
                    {/* Create New Button */}
                    <button className="flex items-center justify-center gap-2 h-12 px-6 bg-primary/10 dark:bg-primary/20 text-primary font-semibold rounded-lg hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                      <Plus size={20} />
                      <span>Tạo Khách Hàng Mới</span>
                    </button>
                  </div>

                  {/* Customer List */}
                  <div className="mt-6 space-y-3">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.customerId}
                        onClick={() => handleCustomerSelect(customer)}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedCustomer?.customerId === customer.customerId
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50'
                        }`}
                      >
                        <div className="flex-1 flex items-center gap-4">
                          <div className="bg-slate-300 dark:bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {customer.fullName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{customer.fullName}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{customer.phone}</p>
                          </div>
                        </div>
                        {selectedCustomer?.customerId === customer.customerId && (
                          <div className="text-primary">
                            <CheckCircle size={24} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Step 2: Select Product */}
              {step === 2 && (
                <>
                  <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight pb-4 border-b border-slate-200 dark:border-slate-800">
                    Chọn sản phẩm và màu sắc
                  </h2>
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Chọn mẫu xe
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={selectedModel?.modelId || ''}
                        onChange={(e) => {
                          const model = models.find(m => m.modelId === parseInt(e.target.value));
                          setSelectedModel(model || null);
                          setSelectedColor(null);
                        }}
                      >
                        <option value="">-- Chọn mẫu xe --</option>
                        {models.map((model) => (
                          <option key={model.modelId} value={model.modelId}>
                            {model.modelName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedModel && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Chọn màu sắc
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {availableColors.map((mc) => (
                            <div
                              key={mc.id}
                              onClick={() => setSelectedColor(mc)}
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedColor?.id === mc.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full border border-slate-300"
                                  style={{ backgroundColor: mc.colorCode || '#ccc' }}
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900 dark:text-white">{mc.colorName}</p>
                                  <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {new Intl.NumberFormat('vi-VN').format(mc.price)}đ
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Số lượng
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <>
                  <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight pb-4 border-b border-slate-200 dark:border-slate-800">
                    Xác nhận đơn hàng
                  </h2>
                  <div className="mt-6 space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Khách hàng</h3>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedCustomer?.fullName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{selectedCustomer?.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Sản phẩm</h3>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <p className="font-semibold text-slate-900 dark:text-white">{selectedModel?.modelName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Màu: {selectedColor?.colorName}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Số lượng: {quantity}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm sticky top-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-4">
                Tóm Tắt Đơn Hàng
              </h3>
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Khách hàng:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedCustomer?.fullName || 'Chưa chọn'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Sản phẩm:</span>
                  <span className="text-sm text-slate-400 dark:text-slate-500">
                    {selectedModel?.modelName || 'Chưa chọn'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Màu sắc:</span>
                  <span className="text-sm text-slate-400 dark:text-slate-500">
                    {selectedColor?.colorName || 'Chưa chọn'}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 my-4"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Tạm tính:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Intl.NumberFormat('vi-VN').format(pricing.subtotal)}đ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Thuế (VAT):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Intl.NumberFormat('vi-VN').format(pricing.tax)}đ
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Tổng cộng:</span>
                  <span className="font-bold text-primary">
                    {new Intl.NumberFormat('vi-VN').format(pricing.total)}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Quay Lại
          </button>
          {step < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={(step === 1 && !selectedCustomer) || (step === 2 && (!selectedModel || !selectedColor))}
              className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tiếp Tục
            </button>
          ) : (
            <button
              onClick={handleSubmitOrder}
              disabled={isCreating}
              className="px-8 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isCreating ? 'Đang tạo...' : 'Tạo Đơn Hàng'}
            </button>
          )}
        </div>
      </div>
    </DealerStaffLayout>
  );
};

export default CreateOrderPage;

