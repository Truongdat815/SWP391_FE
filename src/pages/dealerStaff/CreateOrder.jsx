import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllCustomersThunk } from '../../store/slices/customerSlice';
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { getAllColorsThunk } from '../../store/slices/colorSlice';
import { getAllModelColorsThunk } from '../../store/slices/modelColorSlice';
import { getAllStoreStocksThunk } from '../../store/slices/store-stockSlice';
import { fetchPromotions } from '../../store/slices/promotionSlice';
import { createNewOrder, confirmOrderThunk } from '../../store/slices/orderSlice';
import { clearValidationResult } from '../../store/slices/orderDetailSlice';
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
import AnimatedSelect from '@/components/ui/AnimatedSelect';

function CreateOrder({ onBack }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getStoreId, user } = useAuth();
  
  // Redux state
  const { items: customers, loading: customersLoading } = useSelector((state) => state.customers);
  const { items: models, loading: modelsLoading } = useSelector((state) => state.models);
  const { items: colors, status: colorsStatus } = useSelector((state) => state.colors);
  const { items: modelColors } = useSelector((state) => state.modelColors);
  const { items: storeStocks, status: storeStocksStatus } = useSelector((state) => state.storeStocks);
  const { promotions, loading: promotionsLoading } = useSelector((state) => state.promotions);
  const { loading: orderLoading } = useSelector((state) => state.orders);
  
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
  const [stockInfo, setStockInfo] = useState(null); // Stock info for model+color (without quantity)
  
  // Debounce timer ref
  const validationTimerRef = useRef(null);

  // Load initial data
  useEffect(() => {
    dispatch(getAllCustomersThunk());
    dispatch(getAllModelsThunk());
    dispatch(getAllColorsThunk());
    dispatch(getAllModelColorsThunk());
    dispatch(getAllStoreStocksThunk());
    dispatch(fetchPromotions());
  }, [dispatch]);
  
  // Filter store stocks by current user's storeId
  const currentStoreId = getStoreId();
  const filteredStoreStocks = useMemo(() => {
    if (!currentStoreId || !storeStocks || storeStocks.length === 0) {
      return [];
    }
    
    // Filter store-stocks by current storeId with flexible comparison
    return storeStocks.filter(stock => {
      const storeIdStr = String(stock.storeId);
      const storeIdNum = Number(stock.storeId);
      const currentStoreIdStr = String(currentStoreId);
      const currentStoreIdNum = Number(currentStoreId);
      
      return storeIdStr === currentStoreIdStr ||
             storeIdNum === currentStoreIdNum ||
             stock.storeId == currentStoreId; // Loose equality
    });
  }, [storeStocks, currentStoreId]);

  // Filter customers
  const filteredCustomers = (customers || []).filter(customer =>
    customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get colors filtered by selected model
  const getFilteredColors = () => {
    if (!formData.modelId || !colors || !modelColors) return [];
    
    // Get all colorIds associated with the selected modelId
    const modelColorIds = modelColors
      .filter(mc => String(mc.modelId) === String(formData.modelId))
      .map(mc => mc.colorId);
    
    // Filter colors that match the modelColorIds
    return colors.filter(color => 
      modelColorIds.some(mcColorId => String(color.colorId) === String(mcColorId))
    );
  };

  // Get promotions filtered by selected model
  const getFilteredPromotions = () => {
    if (!formData.modelId || !promotions) return [];
    
    // Filter promotions that apply to this model (modelId matches or modelId = 0 for all models)
    return promotions.filter(promo => 
      String(promo.modelId) === String(formData.modelId) || 
      promo.modelId === 0 // 0 = apply to all models
    );
  };

  // Get stock info for current model+color (without quantity validation)
  const getStockInfo = () => {
    if (!formData.modelId || !formData.colorId || !storeStocks || storeStocks.length === 0) {
      return null;
    }

    const currentStoreId = getStoreId();
    if (!currentStoreId) return null;

    const matchingStock = storeStocks.find(stock => 
      String(stock.modelId) === String(formData.modelId) &&
      String(stock.colorId) === String(formData.colorId) &&
      String(stock.storeId) === String(currentStoreId)
    );

    return matchingStock || null;
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
        : value,
      // Reset colorId and promotionId when modelId changes
      ...(name === 'modelId' && String(prev.modelId) !== String(value) ? { 
        colorId: '', 
        promotionId: 0 
      } : {})
    }));
    
    // Clear validation when form changes
    if (currentValidation) {
      setCurrentValidation(null);
      dispatch(clearValidationResult());
    }
  };

  // Step 2: Validate order detail (frontend validation from store-stocks)
  const handleValidate = useCallback(() => {
    // Basic validation
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
      
      // Check if store-stocks data is loaded
      if (storeStocksStatus === 'loading') {
        setError('Đang tải dữ liệu tồn kho, vui lòng đợi...');
        setIsValidating(false);
        return;
      }

      if (storeStocksStatus === 'failed' || !filteredStoreStocks || filteredStoreStocks.length === 0) {
        setError('Không thể tải dữ liệu tồn kho. Vui lòng thử lại.');
        setIsValidating(false);
        return;
      }

      // Get current user's storeId
      const currentStoreId = getStoreId();
      
      if (!currentStoreId) {
        setError('Không xác định được cửa hàng. Vui lòng đăng nhập lại.');
        setIsValidating(false);
        return;
      }

      // Find matching store-stock from filtered store-stocks
      // filteredStoreStocks already contains only stocks from current store
      const matchingStock = filteredStoreStocks.find(stock => 
        String(stock.modelId) === String(formData.modelId) &&
        String(stock.colorId) === String(formData.colorId)
      );
      
      if (!matchingStock) {
        setError('Sản phẩm này không có trong kho của cửa hàng. Vui lòng chọn sản phẩm khác.');
        setCurrentValidation(null);
        setIsValidating(false);
        return;
      }
      
      // Check quantity availability
      if (matchingStock.quantity < formData.quantity) {
        setError(`Số lượng tồn kho không đủ. Hiện có: ${matchingStock.quantity} xe. Vui lòng giảm số lượng hoặc chọn sản phẩm khác.`);
        setCurrentValidation(null);
        setIsValidating(false);
        return;
      }

      // Validate model-color combination exists
      const modelColorExists = modelColors.some(mc => 
        String(mc.modelId) === String(formData.modelId) &&
        String(mc.colorId) === String(formData.colorId)
      );

      if (!modelColorExists) {
        setError('Sự kết hợp model và màu sắc này không hợp lệ.');
        setCurrentValidation(null);
        setIsValidating(false);
        return;
      }

      // Get promotion info
      const promotion = formData.promotionId > 0 
        ? promotions.find(p => p.promotionId === formData.promotionId)
        : null;
      
      // Store validation result
      setCurrentValidation({
        modelId: formData.modelId,
        colorId: formData.colorId,
        quantity: formData.quantity,
        promotionId: formData.promotionId,
        modelName: getModelName(formData.modelId),
        colorName: getColorName(formData.colorId),
        promotionName: promotion ? promotion.promotionName : 'Không áp dụng',
        isValid: true,
        stockId: matchingStock.stockId,
        availableQuantity: matchingStock.quantity,
        price: matchingStock.priceOfStore
      });
      
      setSuccess('Sản phẩm hợp lệ! Bạn có thể thêm vào đơn hàng.');
    } catch (err) {
      setError(err.message || 'Không thể xác thực sản phẩm');
      setCurrentValidation(null);
    } finally {
      setIsValidating(false);
    }
  }, [formData, filteredStoreStocks, storeStocksStatus, getStoreId, modelColors, promotions, getModelName, getColorName, dispatch]);

  // Debounced validation function
  const debouncedValidate = useCallback(() => {
    // Clear existing timer
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    // Set new timer
    validationTimerRef.current = setTimeout(() => {
      handleValidate();
    }, 500); // 500ms debounce
  }, [handleValidate]);

  // Auto-validate when color is selected (if model and quantity already set)
  useEffect(() => {
    if (formData.modelId && formData.colorId && formData.quantity > 0) {
      debouncedValidate();
    }
    
    // Cleanup timer on unmount
    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, [formData.modelId, formData.colorId, formData.quantity, debouncedValidate]);

  // Update stock info when model and color are both selected
  useEffect(() => {
    if (formData.modelId && formData.colorId && filteredStoreStocks && filteredStoreStocks.length > 0) {
      // Find matching stock from filtered store-stocks (already filtered by storeId)
      const matchingStock = filteredStoreStocks.find(stock => 
        String(stock.modelId) === String(formData.modelId) &&
        String(stock.colorId) === String(formData.colorId)
      );
      
      setStockInfo(matchingStock || null);
    } else {
      setStockInfo(null);
    }
  }, [formData.modelId, formData.colorId, filteredStoreStocks]);

  // Handle quantity blur - auto validate
  const handleQuantityBlur = () => {
    if (formData.modelId && formData.colorId && formData.quantity > 0) {
      handleValidate();
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

  // Step 3: Save draft (no confirmation)
  const handleSaveDraft = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      console.log('🚀 Step 1: Creating order for customer:', selectedCustomer);
      
      // Step 1: Create order (status = DRAFT)
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

      // Step 2: Create order details (quote)
      console.log('🚀 Step 2: Creating order quote:', selectedItems);

      await createOrderDetailsInBatch(orderId, selectedItems);
      
      console.log('✅ Order details/quote created successfully');
      
      setSuccess('Lưu đơn hàng nháp thành công! Trạng thái: DRAFT');
      
      // Navigate to orders list
      setTimeout(() => {
        navigate('/dealer-staff/order-management', { state: { tab: 'view' } });
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error saving draft:', error);
      
      // Display user-friendly error
      let errorMessage = 'Không thể lưu đơn hàng nháp. ';
      
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

  // Step 3: Confirm order (DRAFT → CONFIRMED)
  const handleConfirmOrder = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      console.log('🚀 Step 1: Creating order for customer:', selectedCustomer);
      
      // Step 1: Create order (status = DRAFT)
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

      // Step 2: Create order details (quote)
      console.log('🚀 Step 2: Creating order quote:', selectedItems);

      await createOrderDetailsInBatch(orderId, selectedItems);
      
      console.log('✅ Order details/quote created successfully');
      
      // Step 3: Confirm order (DRAFT → CONFIRMED)
      console.log('🚀 Step 3: Confirming order...');
      
      await dispatch(confirmOrderThunk(orderId)).unwrap();
      
      console.log('✅ Order confirmed successfully');
      
      setSuccess('Tạo và xác nhận đơn hàng thành công! Trạng thái: CONFIRMED');
      
      // Navigate to orders list
      setTimeout(() => {
        navigate('/dealer-staff/order-management', { state: { tab: 'view' } });
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error confirming order:', error);
      
      // Display user-friendly error
      let errorMessage = 'Không thể xác nhận đơn hàng. ';
      
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
        <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Progress Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        
        {/* STEP 1: Select Customer */}
        {currentStep === 1 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-emerald-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Chọn khách hàng</h2>
              </div>
              <Tooltip content="Thêm khách hàng mới" placement="left">
                <button
                  onClick={() => navigate('/dealer-staff/customer-management?add=new')}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Thêm mới
                </button>
              </Tooltip>
            </div>

            {/* Search */}
            <div className="mb-3">
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
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                <span>Đang tải...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Không tìm thấy khách hàng
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.customerId}
                    onClick={() => handleCustomerSelect(customer)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all"
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
            <div className="flex items-center mb-4">
              <ShoppingCart className="h-8 w-8 text-emerald-600 mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Thêm sản phẩm vào đơn hàng</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Khách hàng: <span className="font-semibold">{selectedCustomer?.fullName}</span>
                </p>
              </div>
            </div>

            {/* Product Selection Form */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <h3 className="font-semibold text-gray-900 mb-3">Chọn sản phẩm</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model xe <span className="text-red-500">*</span>
                  </label>
                  <AnimatedSelect
                    name="modelId"
                    value={formData.modelId ? formData.modelId.toString() : ''}
                    onChange={handleFormChange}
                    placeholder="-- Chọn model --"
                    options={[
                      { value: '', label: '-- Chọn model --' },
                      ...models.map(model => ({
                        value: model.modelId.toString(),
                        label: model.modelName
                      }))
                    ]}
                    className="w-full"
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu sắc <span className="text-red-500">*</span>
                  </label>
                  <AnimatedSelect
                    name="colorId"
                    value={formData.colorId ? formData.colorId.toString() : ''}
                    onChange={handleFormChange}
                    placeholder="-- Chọn màu --"
                    disabled={!formData.modelId}
                    options={[
                      { value: '', label: '-- Chọn màu --' },
                      ...getFilteredColors().map(color => ({
                        value: color.colorId.toString(),
                        label: color.colorName
                      }))
                    ]}
                    className="w-full"
                  />
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
                    onBlur={handleQuantityBlur}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Promotion */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khuyến mãi
                  </label>
                  <AnimatedSelect
                    name="promotionId"
                    value={formData.promotionId ? formData.promotionId.toString() : '0'}
                    onChange={handleFormChange}
                    placeholder="Không áp dụng"
                    disabled={!formData.modelId}
                    options={[
                      { value: '0', label: 'Không áp dụng' },
                      ...getFilteredPromotions().map(promo => ({
                        value: promo.promotionId.toString(),
                        label: promo.promotionName
                      }))
                    ]}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Stock Info Display (when model+color selected, no quantity needed) */}
              {formData.modelId && formData.colorId && !currentValidation && (
                <>
                  {stockInfo ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start">
                        <Package className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-2">Thông tin tồn kho</h4>
                          <div className="text-sm text-blue-800 space-y-1">
                            <p><strong>Model:</strong> {getModelName(formData.modelId)}</p>
                            <p><strong>Màu:</strong> {getColorName(formData.colorId)}</p>
                            <p><strong>Tồn kho có sẵn:</strong> {stockInfo.quantity} xe</p>
                            {stockInfo.priceOfStore && (
                              <p><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stockInfo.priceOfStore)}</p>
                            )}
                            <p className="text-xs mt-2 text-blue-700">Nhập số lượng và nhấn ra ngoài để kiểm tra</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : filteredStoreStocks && filteredStoreStocks.length === 0 && storeStocks && storeStocks.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-yellow-900 mb-2">Không có trong kho</h4>
                          <div className="text-sm text-yellow-800">
                            <p>Sản phẩm <strong>{getModelName(formData.modelId)} - {getColorName(formData.colorId)}</strong> không có trong kho của cửa hàng hiện tại.</p>
                            <p className="text-xs mt-2">Vui lòng chọn sản phẩm khác hoặc liên hệ quản lý để nhập hàng.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Validation Result */}
              {currentValidation && currentValidation.isValid && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-start">
                    <CheckSquare className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900 mb-2">Sản phẩm hợp lệ</h4>
                      <div className="text-sm text-green-800 space-y-1">
                        <p><strong>Model:</strong> {currentValidation.modelName}</p>
                        <p><strong>Màu:</strong> {currentValidation.colorName}</p>
                        <p><strong>Số lượng:</strong> {currentValidation.quantity}</p>
                        <p><strong>Tồn kho có sẵn:</strong> {currentValidation.availableQuantity} xe</p>
                        {currentValidation.price && (
                          <p><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentValidation.price)}</p>
                        )}
                        <p><strong>Khuyến mãi:</strong> {currentValidation.promotionName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleAddItem}
                  disabled={!currentValidation || !currentValidation.isValid || isValidating}
                  className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm vào đơn
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Selected Items List */}
            {selectedItems.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Sản phẩm đã chọn ({selectedItems.length})
                </h3>
                <div className="space-y-2 mb-3">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
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
              <div className="text-center py-4 text-gray-500">
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
            <div className="flex items-center mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Xác nhận đơn hàng</h2>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <h3 className="font-semibold text-gray-900 mb-2">Thông tin khách hàng</h3>
              <div className="text-sm text-gray-700">
                <p><strong>Tên:</strong> {selectedCustomer?.fullName}</p>
                <p><strong>SĐT:</strong> {selectedCustomer?.phone}</p>
                <p><strong>Email:</strong> {selectedCustomer?.email}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <h3 className="font-semibold text-gray-900 mb-3">Chi tiết đơn hàng</h3>
              <div className="space-y-2">
                {selectedItems.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Lưu ý:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Lưu nháp:</strong> Tạo đơn hàng với trạng thái DRAFT, có thể chỉnh sửa sau.</li>
                    <li><strong>Xác nhận:</strong> Tạo và xác nhận đơn hàng với trạng thái CONFIRMED.</li>
                    <li>Giá và các thông tin chi tiết sẽ được hệ thống tự động tính toán.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons - 2 nút */}
            <div className="flex space-x-3">
              <button
                onClick={handleSaveDraft}
                disabled={orderLoading}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-semibold"
              >
                {orderLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Package className="h-5 w-5 mr-2" />
                    Lưu nháp (DRAFT)
                  </>
                )}
              </button>
              
              <button
                onClick={handleConfirmOrder}
                disabled={orderLoading}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-semibold"
              >
                {orderLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Xác nhận đơn hàng (CONFIRMED)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
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
