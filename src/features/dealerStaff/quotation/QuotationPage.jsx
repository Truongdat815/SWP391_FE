import { useState, useMemo } from 'react';
import { Search, Plus, FileText, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import { useCreateQuoteMutation } from '../../../api/dealerStaff/quotationApi';
import { useGetAllCustomersQuery, useGetCustomerByPhoneQuery } from '../../../api/dealerStaff/customerApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { useGetAllColorsQuery } from '../../../api/evmStaff/colorApi';
import { useGetAllModelColorsQuery } from '../../../api/evmStaff/productApi';
import { useGetAllPromotionsQuery } from '../../../api/dealerManager/promotionApi';

const QuotationPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Tìm khách hàng, 2: Chọn sản phẩm, 3: Xem báo giá
  const [formData, setFormData] = useState({
    phone: '',
    customerId: null,
    orderDetails: [],
    includeLicensePlateService: false,
  });
  const [currentOrderDetail, setCurrentOrderDetail] = useState({
    modelId: '',
    colorId: '',
    quantity: 1,
  });

  const { data: customersData } = useGetAllCustomersQuery();
  const { data: modelsData } = useGetAllModelsQuery();
  const { data: colorsData } = useGetAllColorsQuery();
  const { data: modelColorsData } = useGetAllModelColorsQuery();
  const { data: promotionsData } = useGetAllPromotionsQuery();
  const [createQuote, { isLoading: isCreating }] = useCreateQuoteMutation();
  const { data: customerByPhoneData } = useGetCustomerByPhoneQuery(formData.phone, {
    skip: !formData.phone || formData.phone.length < 10,
  });

  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  const models = Array.isArray(modelsData?.data) ? modelsData.data : [];
  const colors = Array.isArray(colorsData?.data) ? colorsData.data : [];
  const modelColors = Array.isArray(modelColorsData?.data) ? modelColorsData.data : [];
  const promotions = Array.isArray(promotionsData?.data) ? promotionsData.data : [];

  // Kiểm tra lỗi 401
  const isUnauthorized = error?.status === 401;

  // Tìm khách hàng theo số điện thoại
  const foundCustomer = customerByPhoneData?.data;

  const handleSearchCustomer = () => {
    if (foundCustomer) {
      setFormData({ ...formData, customerId: foundCustomer.customerId });
      setStep(2);
    }
  };

  const handleAddProduct = () => {
    if (currentOrderDetail.modelId && currentOrderDetail.colorId) {
      const modelColor = modelColors.find(
        (mc) =>
          mc.modelId === parseInt(currentOrderDetail.modelId) &&
          mc.colorId === parseInt(currentOrderDetail.colorId)
      );
      if (modelColor) {
        setFormData({
          ...formData,
          orderDetails: [
            ...formData.orderDetails,
            {
              ...currentOrderDetail,
              modelId: parseInt(currentOrderDetail.modelId),
              colorId: parseInt(currentOrderDetail.colorId),
              unitPrice: modelColor.price,
            },
          ],
        });
        setCurrentOrderDetail({ modelId: '', colorId: '', quantity: 1 });
      }
    }
  };

  const handleRemoveProduct = (index) => {
    setFormData({
      ...formData,
      orderDetails: formData.orderDetails.filter((_, i) => i !== index),
    });
  };

  const calculateTotal = () => {
    const subtotal = formData.orderDetails.reduce(
      (sum, detail) => sum + (parseFloat(detail.unitPrice) || 0) * (detail.quantity || 1),
      0
    );
    // TODO: Áp dụng promotion nếu có
    return subtotal;
  };

  const handleCreateQuote = async (e) => {
    e.preventDefault();
    if (!formData.customerId || formData.orderDetails.length === 0) {
      alert('Vui lòng chọn khách hàng và ít nhất một sản phẩm');
      return;
    }
    try {
      const result = await createQuote({
        orderId: null,
        orderDetails: formData.orderDetails.map((detail) => ({
          modelId: detail.modelId,
          colorId: detail.colorId,
          quantity: detail.quantity,
          unitPrice: detail.unitPrice,
        })),
        includeLicensePlateService: formData.includeLicensePlateService,
      }).unwrap();
      alert('Tạo báo giá thành công!');
      setIsCreateModalOpen(false);
      setStep(1);
      setFormData({
        phone: '',
        customerId: null,
        orderDetails: [],
        includeLicensePlateService: false,
      });
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo báo giá');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const selectedModel = models.find((m) => m.modelId === parseInt(currentOrderDetail.modelId));
  const availableColors = useMemo(() => {
    if (!currentOrderDetail.modelId || !Array.isArray(modelColors) || !Array.isArray(colors)) return [];
    return modelColors
      .filter((mc) => mc.modelId === parseInt(currentOrderDetail.modelId))
      .map((mc) => colors.find((c) => c.colorId === mc.colorId))
      .filter(Boolean);
  }, [currentOrderDetail.modelId, modelColors, colors]);

  if (isUnauthorized) {
    return (
      <DealerStaffLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-yellow-600 text-lg font-medium">
            ⚠️ Bạn chưa đăng nhập hoặc token đã hết hạn
          </div>
          <div className="text-gray-600 text-sm">
            Vui lòng đăng nhập để truy cập các tính năng này.
          </div>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đi đến trang đăng nhập
          </a>
        </div>
      </DealerStaffLayout>
    );
  }

  return (
    <DealerStaffLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tạo Báo Giá</h1>
            <p className="text-gray-600 mt-1">Tạo báo giá cho khách hàng</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Tạo Báo Giá Mới
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Hướng dẫn:</strong> Tìm khách hàng theo số điện thoại, chọn sản phẩm và tạo báo giá.
          </p>
        </div>
      </div>

      {/* Create Quote Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setStep(1);
          setFormData({
            phone: '',
            customerId: null,
            orderDetails: [],
            includeLicensePlateService: false,
          });
        }}
        title="Tạo Báo Giá"
        size="xl"
      >
        <form onSubmit={handleCreateQuote} className="space-y-6">
          {/* Step 1: Tìm khách hàng */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bước 1: Tìm khách hàng</h3>
              <Input
                label="Số điện thoại"
                type="tel"
                placeholder="Nhập số điện thoại khách hàng"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              {foundCustomer && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Tìm thấy:</strong> {foundCustomer.fullName} - {foundCustomer.phone}
                  </p>
                </div>
              )}
              {formData.phone && !foundCustomer && formData.phone.length >= 10 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">Không tìm thấy khách hàng. Bạn có muốn tạo mới?</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-2"
                    onClick={() => navigate('/dealer-staff/customers?action=create&phone=' + formData.phone)}
                  >
                    Tạo khách hàng mới
                  </Button>
                </div>
              )}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={handleSearchCustomer}
                  className="flex-1"
                  disabled={!foundCustomer}
                >
                  Tiếp theo
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Chọn sản phẩm */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bước 2: Chọn sản phẩm</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mẫu xe *
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentOrderDetail.modelId}
                    onChange={(e) =>
                      setCurrentOrderDetail({ ...currentOrderDetail, modelId: e.target.value, colorId: '' })
                    }
                    required
                  >
                    <option value="">Chọn mẫu xe</option>
                    {models.map((model) => (
                      <option key={model.modelId} value={model.modelId}>
                        {model.modelName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Màu sắc *
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentOrderDetail.colorId}
                    onChange={(e) => setCurrentOrderDetail({ ...currentOrderDetail, colorId: e.target.value })}
                    required
                    disabled={!currentOrderDetail.modelId}
                  >
                    <option value="">Chọn màu</option>
                    {availableColors.map((color) => (
                      <option key={color.colorId} value={color.colorId}>
                        {color.colorName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Số lượng"
                  type="number"
                  min="1"
                  value={currentOrderDetail.quantity}
                  onChange={(e) =>
                    setCurrentOrderDetail({ ...currentOrderDetail, quantity: parseInt(e.target.value) || 1 })
                  }
                  required
                />
                {currentOrderDetail.modelId && currentOrderDetail.colorId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá</label>
                    <div className="px-4 py-2 border rounded-lg bg-gray-50">
                      {new Intl.NumberFormat('vi-VN').format(
                        modelColors.find(
                          (mc) =>
                            mc.modelId === parseInt(currentOrderDetail.modelId) &&
                            mc.colorId === parseInt(currentOrderDetail.colorId)
                        )?.price || 0
                      )}{' '}
                      VND
                    </div>
                  </div>
                )}
              </div>
              <Button type="button" onClick={handleAddProduct} disabled={!currentOrderDetail.modelId || !currentOrderDetail.colorId}>
                Thêm sản phẩm
              </Button>

              {/* Danh sách sản phẩm đã chọn */}
              {formData.orderDetails.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Sản phẩm đã chọn:</h4>
                  <div className="space-y-2">
                    {formData.orderDetails.map((detail, index) => {
                      const model = models.find((m) => m.modelId === detail.modelId);
                      const color = colors.find((c) => c.colorId === detail.colorId);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">
                              {model?.modelName} - {color?.colorName}
                            </p>
                            <p className="text-sm text-gray-600">
                              SL: {detail.quantity} x {new Intl.NumberFormat('vi-VN').format(detail.unitPrice)} VND
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            Xóa
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Quay lại
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1"
                  disabled={formData.orderDetails.length === 0}
                >
                  Xem báo giá
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Xem báo giá */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Bước 3: Xem báo giá</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">{new Intl.NumberFormat('vi-VN').format(calculateTotal())} VND</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Tổng cộng:</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(calculateTotal())} VND</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="licensePlate"
                  checked={formData.includeLicensePlateService}
                  onChange={(e) => setFormData({ ...formData, includeLicensePlateService: e.target.checked })}
                />
                <label htmlFor="licensePlate" className="text-sm text-gray-700">
                  Bao gồm dịch vụ đăng ký biển số
                </label>
              </div>
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Quay lại
                </Button>
                <Button type="submit" className="flex-1" disabled={isCreating}>
                  {isCreating ? 'Đang tạo...' : 'Tạo Báo Giá'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </DealerStaffLayout>
  );
};

export default QuotationPage;

