import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllCustomersThunk } from '../../store/slices/customerSlice';
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { getAllStoreStocksThunk } from '../../store/slices/store-stockSlice';
import { createNewOrder } from '../../store/slices/orderSlice';
import { createOrderDetailThunk } from '../../store/slices/orderDetailSlice';
import { 
  Users, 
  Car,
  Palette,
  CheckCircle,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  Search,
  UserPlus,
  Package,
  DollarSign
} from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

function CreateOrder({ onBack }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { items: customers, loading: customersLoading } = useSelector((state) => state.customers);
  const { items: models, loading: modelsLoading } = useSelector((state) => state.models);
  const { items: storeStocks, loading: stocksLoading } = useSelector((state) => state.storeStocks);
  const { loading: orderLoading } = useSelector((state) => state.orders);
  const { loading: orderDetailLoading, error: orderDetailError } = useSelector((state) => state.orderDetails);
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load initial data
  useEffect(() => {
    dispatch(getAllCustomersThunk());
    dispatch(getAllModelsThunk());
    dispatch(getAllStoreStocksThunk());
  }, [dispatch]);

  // Get available colors for selected model from store stocks
  const getAvailableColors = () => {
    if (!selectedModel || !storeStocks) return [];
    
    // Lọc các stocks có cùng modelId và group theo colorId
    const colorMap = new Map();
    
    storeStocks.forEach(stock => {
      if (stock.modelId === selectedModel.modelId && stock.quantity > 0) {
        if (!colorMap.has(stock.colorId)) {
          colorMap.set(stock.colorId, {
            colorId: stock.colorId,
            colorName: stock.colorName,
            totalStock: stock.quantity
          });
        } else {
          // Nếu đã có, cộng thêm số lượng
          const existing = colorMap.get(stock.colorId);
          existing.totalStock += stock.quantity;
        }
      }
    });
    
    return Array.from(colorMap.values());
  };

  // Filter customers
  const filteredCustomers = (customers || []).filter(customer =>
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get stock for specific model and color
  const getStockQuantity = (modelId, colorId) => {
    const stock = storeStocks.find(s => 
      s.modelId === modelId && s.colorId === colorId
    );
    return stock ? stock.quantity : 0;
  };

  // Get storeStockId for specific model and color
  const getStoreStockId = (modelId, colorId) => {
    const stock = storeStocks.find(s => 
      s.modelId === modelId && s.colorId === colorId
    );
    return stock ? stock.stockId : null;
  };

  // Step 1: Select Customer
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCurrentStep(2);
    setError(null);
  };

  // Step 2: Select Model
  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setCurrentStep(3);
    setError(null);
  };

  // Step 3: Add item (color + quantity)
  const handleAddItem = (color, quantity) => {
    const stockQty = getStockQuantity(selectedModel.modelId, color.colorId);
    
    if (quantity > stockQty) {
      setError(`Không đủ tồn kho! Chỉ còn ${stockQty} xe.`);
      return;
    }

    // Get storeStockId
    const storeStockId = getStoreStockId(selectedModel.modelId, color.colorId);
    
    if (!storeStockId) {
      setError('Không tìm thấy thông tin kho cho sản phẩm này!');
      return;
    }

    // Check if item already exists
    const existingIndex = selectedItems.findIndex(
      item => item.storeStockId === storeStockId
    );

    if (existingIndex >= 0) {
      // Update quantity
      const newItems = [...selectedItems];
      newItems[existingIndex].quantity = quantity;
      setSelectedItems(newItems);
    } else {
      // Add new item
      setSelectedItems([...selectedItems, {
        storeStockId: storeStockId,
        modelId: selectedModel.modelId,
        colorId: color.colorId,
        modelName: selectedModel.modelName,
        colorName: color.colorName,
        quantity: quantity,
        unitPrice: selectedModel.price || 0,
        availableStock: stockQty
      }]);
    }
    setError(null);
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleContinueToConfirm = () => {
    if (selectedItems.length === 0) {
      setError('Vui lòng chọn ít nhất một sản phẩm!');
      return;
    }
    setCurrentStep(4);
  };

  // Step 4: Confirm and create order
  const handleConfirmOrder = async () => {
    try {
      setError(null);
      
      console.log('🚀 Step 1: Creating order for customer:', selectedCustomer);
      
      // Step 1: Create order
      const orderResult = await dispatch(createNewOrder({ 
        customerId: selectedCustomer.customerId 
      })).unwrap();
      
      console.log('✅ Order created:', orderResult);
      
      const orderData = orderResult.data || orderResult;
      const orderId = orderData.orderId || orderData.id;
      
      console.log('📝 Extracted orderId:', orderId);
      
      if (!orderId) {
        console.error('❌ No orderId in response:', orderResult);
        throw new Error('Không nhận được orderId từ server. Response: ' + JSON.stringify(orderResult));
      }

      // Step 2: Create order details
      const orderDetailsPayload = {
        orderId: orderId,
        orderDetails: selectedItems.map(item => ({
          modelId: item.modelId,
          colorId: item.colorId,
          quantity: item.quantity,
          promotionId: 0  // 0 = no promotion
        }))
      };
      
      console.log('🚀 Step 2: Creating order details:', orderDetailsPayload);

      const detailResult = await dispatch(createOrderDetailThunk(orderDetailsPayload)).unwrap();
      
      console.log('✅ Order details created:', detailResult);
      
      setSuccess('Tạo đơn hàng thành công!');
      
      // Navigate to add order details page immediately
      navigate(`/dealer-staff/add-order-details/${orderData.orderId}`, {
        state: { 
          orderData,
          customerInfo: customer 
        }
      });
      
    } catch (error) {
      console.error('❌ Error creating order:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      // Display user-friendly error
      let errorMessage = 'Không thể tạo đơn hàng. ';
      
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage += 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage += 'Bạn không có quyền thực hiện thao tác này.';
      } else if (error.message.includes('orderId')) {
        errorMessage += 'Lỗi khi tạo đơn hàng. ' + error.message;
      } else {
        errorMessage += error.message || 'Lỗi không xác định. Vui lòng thử lại.';
      }
      
      setError(errorMessage);
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity);
    }, 0);
  };

  // Go back
  const handleBack = () => {
    if (currentStep === 1) {
      if (onBack) onBack();
    } else {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Error/Success Messages */}
      {(error || orderDetailError) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <span className="text-red-700">{error || orderDetailError}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Chọn khách hàng', icon: Users },
            { num: 2, label: 'Chọn model xe', icon: Car },
            { num: 3, label: 'Chọn màu & số lượng', icon: Palette },
            { num: 4, label: 'Xác nhận đơn hàng', icon: CheckCircle }
          ].map((step, index) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentStep === step.num 
                    ? 'bg-emerald-600 text-white' 
                    : currentStep > step.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  currentStep >= step.num ? 'text-emerald-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < 3 && (
                <div className={`h-1 flex-1 mx-4 ${
                  currentStep > step.num ? 'bg-emerald-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        
        {/* STEP 1: Select Customer */}
        {currentStep === 1 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-emerald-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Chọn khách hàng</h2>
              </div>
              <Tooltip content="Thêm khách hàng mới" placement="left">
                <button
                  onClick={() => navigate('/dealer-staff/add-customer')}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Thêm mới
                </button>
              </Tooltip>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Customer List */}
            {customersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                <span>Đang tải...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không tìm thấy khách hàng
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.customerId}
                    onClick={() => handleCustomerSelect(customer)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="font-semibold text-gray-900">{customer.fullName}</div>
                    <div className="text-sm text-gray-600 mt-1">{customer.phone}</div>
                    <div className="text-sm text-gray-600">{customer.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Select Model */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center mb-6">
              <Car className="h-8 w-8 text-emerald-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Chọn model xe</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Khách hàng: <span className="font-semibold">{selectedCustomer?.fullName}</span>
                </p>
              </div>
            </div>

            {modelsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                <span>Đang tải...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {models.map((model) => (
                  <div
                    key={model.modelId}
                    onClick={() => handleModelSelect(model)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all"
                  >
                    <div className="font-semibold text-gray-900">{model.modelName}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      Giá: {model.price?.toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Select Color & Quantity */}
        {currentStep === 3 && (
          <div>
            <div className="flex items-center mb-6">
              <Palette className="h-8 w-8 text-emerald-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Chọn màu sắc và số lượng</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Model: <span className="font-semibold">{selectedModel?.modelName}</span>
                </p>
              </div>
            </div>

            {/* Available Colors */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Màu sắc có sẵn trong kho:</h3>
              {stocksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                  <span>Đang tải thông tin tồn kho...</span>
                </div>
              ) : getAvailableColors().length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>Không có màu nào trong kho cho model này</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getAvailableColors().map((color) => {
                    const stockQty = getStockQuantity(selectedModel.modelId, color.colorId);
                    const existingItem = selectedItems.find(
                      item => item.modelId === selectedModel.modelId && item.colorId === color.colorId
                    );
                    
                    return (
                      <div
                        key={color.colorId}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold text-gray-900">{color.colorName}</div>
                            <div className="text-sm text-gray-600">
                              <Package className="inline h-4 w-4 mr-1" />
                              Tồn kho: {stockQty} xe
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            max={stockQty}
                            defaultValue={existingItem?.quantity || 1}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            disabled={stockQty === 0}
                            id={`qty-${color.colorId}`}
                          />
                          <button
                            onClick={() => {
                              const qty = parseInt(document.getElementById(`qty-${color.colorId}`).value);
                              handleAddItem(color, qty);
                            }}
                            disabled={stockQty === 0}
                            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            {existingItem ? 'Cập nhật' : 'Thêm'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Sản phẩm đã chọn ({selectedItems.length})
                </h3>
                <div className="space-y-2">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.modelName} - {item.colorName}
                        </div>
                        <div className="text-sm text-gray-600">
                          Số lượng: {item.quantity} | Giá: {item.unitPrice?.toLocaleString('vi-VN')} VNĐ
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleContinueToConfirm}
                  className="w-full mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
                >
                  Tiếp tục
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Confirm Order */}
        {currentStep === 4 && (
          <div>
            <div className="flex items-center mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Xác nhận đơn hàng</h2>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Thông tin khách hàng</h3>
              <div className="text-sm text-gray-700">
                <p><strong>Tên:</strong> {selectedCustomer?.fullName}</p>
                <p><strong>SĐT:</strong> {selectedCustomer?.phone}</p>
                <p><strong>Email:</strong> {selectedCustomer?.email}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Chi tiết đơn hàng</h3>
              <div className="space-y-2">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex justify-between bg-white p-3 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {item.modelName} - {item.colorName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Số lượng: {item.quantity} x {item.unitPrice?.toLocaleString('vi-VN')} VNĐ
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {(item.quantity * item.unitPrice).toLocaleString('vi-VN')} VNĐ
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-emerald-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Tổng tiền:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {calculateTotal().toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmOrder}
              disabled={orderLoading || orderDetailLoading}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {(orderLoading || orderDetailLoading) ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Đang tạo đơn hàng...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Xác nhận tạo đơn hàng
                </>
              )}
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {currentStep === 1 ? 'Hủy' : 'Quay lại'}
          </button>
          
          <div className="text-sm text-gray-500">
            Bước {currentStep} / 4
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrder;
