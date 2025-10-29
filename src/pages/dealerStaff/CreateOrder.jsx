import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllCustomersThunk } from '../../store/slices/customerSlice';
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { getAllColorsThunk } from '../../store/slices/colorSlice';
import { fetchPromotions } from '../../store/slices/promotionSlice';
import { createNewOrder } from '../../store/slices/orderSlice';
import { validateOrderDetailThunk, clearValidationResult } from '../../store/slices/orderDetailSlice';
import { createOrderDetailsInBatch } from '../../api/order-detailService';
import { 
  Users, 
  Car,
  CheckCircle,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  Search,
  UserPlus,
  Package,
  Tag,
  Plus,
  X,
  CheckSquare
} from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

function CreateOrder({ onBack }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { items: customers, loading: customersLoading } = useSelector((state) => state.customers);
  const { items: models, loading: modelsLoading } = useSelector((state) => state.models);
  const { items: colors, status: colorsStatus } = useSelector((state) => state.colors);
  const { promotions, loading: promotionsLoading } = useSelector((state) => state.promotions);
  const { loading: orderLoading } = useSelector((state) => state.orders);
  const { loading: orderDetailLoading, validationResult } = useSelector((state) => state.orderDetails);
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Step 2 form state
  const [formData, setFormData] = useState({
    modelId: '',
    colorId: '',
    quantity: 1,
    promotionId: 0
  });
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [currentValidation, setCurrentValidation] = useState(null);

  // Load initial data
  useEffect(() => {
    dispatch(getAllCustomersThunk());
    dispatch(getAllModelsThunk());
    dispatch(getAllColorsThunk());
    dispatch(fetchPromotions());
  }, [dispatch]);

  // Filter customers
  const filteredCustomers = (customers || []).filter(customer =>
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get colors filtered by selected model
  const getFilteredColors = () => {
    if (!formData.modelId || !colors) return [];
    // In real app, you might filter colors by model from model-color associations
    // For now, return all colors
    return colors;
  };

  // Get model name
  const getModelName = (modelId) => {
    const model = models.find(m => m.modelId === modelId);
    return model ? model.modelName : '';
  };

  // Get color name
  const getColorName = (colorId) => {
    const color = colors.find(c => c.colorId === colorId);
    return color ? color.colorName : '';
  };

  // Get promotion name
  const getPromotionName = (promotionId) => {
    if (promotionId === 0) return 'Không áp dụng';
    const promotion = promotions.find(p => p.promotionId === promotionId);
    return promotion ? promotion.promotionName : 'Không áp dụng';
  };

  // Step 1: Select Customer
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCurrentStep(2);
    setError(null);
  };

  // Step 2: Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'promotionId' || name === 'modelId' || name === 'colorId' || name === 'quantity' 
        ? parseInt(value) || 0 
        : value
    }));
    
    // Clear validation when form changes
    if (currentValidation) {
      setCurrentValidation(null);
      dispatch(clearValidationResult());
    }
  };

  // Step 2: Validate order detail
  const handleValidate = async () => {
    // Validation
    if (!formData.modelId) {
      setError('Vui lòng chọn model xe');
      return;
    }
    if (!formData.colorId) {
      setError('Vui lòng chọn màu sắc');
      return;
    }
    if (!formData.quantity || formData.quantity < 1) {
      setError('Số lượng phải lớn hơn 0');
      return;
    }

    try {
      setError(null);
      setIsValidating(true);
      
      const validationData = {
        modelId: formData.modelId,
        colorId: formData.colorId,
        quantity: formData.quantity,
        promotionId: formData.promotionId
      };

      const result = await dispatch(validateOrderDetailThunk(validationData)).unwrap();
      
      // Store validation result
      setCurrentValidation({
        ...validationData,
        modelName: result.data?.modelName || getModelName(formData.modelId),
        colorName: result.data?.colorName || getColorName(formData.colorId),
        promotionName: result.data?.promotionName || getPromotionName(formData.promotionId),
        isValid: true
      });
      
      setSuccess('Sản phẩm hợp lệ! Bạn có thể thêm vào đơn hàng.');
    } catch (err) {
      setError(err || 'Không thể xác thực sản phẩm');
      setCurrentValidation(null);
    } finally {
      setIsValidating(false);
    }
  };

  // Step 2: Add item to order
  const handleAddItem = () => {
    if (!currentValidation || !currentValidation.isValid) {
      setError('Vui lòng kiểm tra sản phẩm trước khi thêm');
      return;
    }

    // Check if item already exists
    const existingIndex = selectedItems.findIndex(
      item => item.modelId === currentValidation.modelId && item.colorId === currentValidation.colorId
    );

    if (existingIndex >= 0) {
      // Update quantity
      const newItems = [...selectedItems];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: currentValidation.quantity,
        promotionId: currentValidation.promotionId,
        promotionName: currentValidation.promotionName
      };
      setSelectedItems(newItems);
      setSuccess('Đã cập nhật sản phẩm trong đơn hàng');
    } else {
      // Add new item
      setSelectedItems([...selectedItems, currentValidation]);
      setSuccess('Đã thêm sản phẩm vào đơn hàng');
    }

    // Reset form
    setFormData({
      modelId: '',
      colorId: '',
      quantity: 1,
      promotionId: 0
    });
    setCurrentValidation(null);
    dispatch(clearValidationResult());
  };

  // Step 2: Remove item from order
  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
    setSuccess('Đã xóa sản phẩm khỏi đơn hàng');
  };

  // Step 2: Continue to confirmation
  const handleContinueToConfirm = () => {
    if (selectedItems.length === 0) {
      setError('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng!');
      return;
    }
    setCurrentStep(3);
    setError(null);
  };

  // Step 3: Confirm and create order
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
        throw new Error('Không nhận được orderId từ server');
      }

      // Step 2: Create order details
      console.log('🚀 Step 2: Creating order details:', selectedItems);

      await createOrderDetailsInBatch(orderId, selectedItems);
      
      console.log('✅ Order details created successfully');
      
      setSuccess('Tạo đơn hàng thành công!');
      
      // Navigate to orders list
      setTimeout(() => {
        navigate('/dealer-staff/view-orders');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error creating order:', error);
      
      // Display user-friendly error
      let errorMessage = 'Không thể tạo đơn hàng. ';
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage += 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
        errorMessage += 'Bạn không có quyền thực hiện thao tác này.';
      } else {
        errorMessage += error.message || 'Lỗi không xác định. Vui lòng thử lại.';
      }
      
      setError(errorMessage);
    }
  };

  // Go back
  const handleBack = () => {
    if (currentStep === 1) {
      if (onBack) onBack();
      else navigate(-1);
    } else {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
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
            { num: 2, label: 'Thêm sản phẩm', icon: ShoppingCart },
            { num: 3, label: 'Xác nhận đơn hàng', icon: CheckCircle }
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
              {index < 2 && (
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
              <div className="space-y-2 max-h-96 overflow-y-auto">
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

        {/* STEP 2: Add Order Details */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center mb-6">
              <ShoppingCart className="h-8 w-8 text-emerald-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Thêm sản phẩm vào đơn hàng</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Khách hàng: <span className="font-semibold">{selectedCustomer?.fullName}</span>
                </p>
              </div>
            </div>

            {/* Product Selection Form */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Chọn sản phẩm</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model xe <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="modelId"
                    value={formData.modelId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">-- Chọn model --</option>
                    {models.map(model => (
                      <option key={model.modelId} value={model.modelId}>
                        {model.modelName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu sắc <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="colorId"
                    value={formData.colorId}
                    onChange={handleFormChange}
                    disabled={!formData.modelId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">-- Chọn màu --</option>
                    {getFilteredColors().map(color => (
                      <option key={color.colorId} value={color.colorId}>
                        {color.colorName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Promotion */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khuyến mãi
                  </label>
                  <select
                    name="promotionId"
                    value={formData.promotionId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="0">Không áp dụng</option>
                    {promotions.map(promo => (
                      <option key={promo.promotionId} value={promo.promotionId}>
                        {promo.promotionName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Validation Result */}
              {currentValidation && currentValidation.isValid && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <CheckSquare className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 mb-2">Sản phẩm hợp lệ</h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <p><strong>Model:</strong> {currentValidation.modelName}</p>
                        <p><strong>Màu:</strong> {currentValidation.colorName}</p>
                        <p><strong>Số lượng:</strong> {currentValidation.quantity}</p>
                        <p><strong>Khuyến mãi:</strong> {currentValidation.promotionName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleValidate}
                  disabled={isValidating || orderDetailLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isValidating || orderDetailLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Kiểm tra sản phẩm
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleAddItem}
                  disabled={!currentValidation || !currentValidation.isValid}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm vào đơn
                </button>
              </div>
            </div>

            {/* Selected Items List */}
            {selectedItems.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Sản phẩm đã chọn ({selectedItems.length})
                </h3>
                <div className="space-y-3 mb-4">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.modelName} - {item.colorName}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Số lượng: {item.quantity} | Khuyến mãi: {item.promotionName}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={handleContinueToConfirm}
                  className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center font-semibold"
                >
                  Tiếp tục
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            )}

            {selectedItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-3 text-gray-400" />
                <p>Chưa có sản phẩm nào được thêm</p>
                <p className="text-sm mt-1">Vui lòng chọn và kiểm tra sản phẩm để thêm vào đơn hàng</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Confirm Order */}
        {currentStep === 3 && (
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
                  <div key={index} className="bg-white p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {item.modelName} - {item.colorName}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>Số lượng: {item.quantity}</p>
                          <p>Khuyến mãi: {item.promotionName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Lưu ý:</p>
                  <p>Giá và các thông tin chi tiết sẽ được hệ thống tự động tính toán sau khi tạo đơn hàng.</p>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmOrder}
              disabled={orderLoading}
              className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-semibold"
            >
              {orderLoading ? (
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
            disabled={orderLoading}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {currentStep === 1 ? 'Hủy' : 'Quay lại'}
          </button>
          
          <div className="text-sm text-gray-500">
            Bước {currentStep} / 3
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateOrder;
