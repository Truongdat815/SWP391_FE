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
import { getAllStores } from '../../api/storeService';
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
  CheckSquare,
  DollarSign,
  Receipt
} from 'lucide-react';

import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import StatusBadge from '../../components/ui/StatusBadge';
import ModernButton from '../../components/ui/ModernButton';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
import AnimatedSelect from '@/components/ui/AnimatedSelect';
import logoImage from '@/assets/images/logo.png';

// Helper function to convert number to Vietnamese words
const convertNumberToWords = (num) => {
  // Handle invalid input
  if (!num || num === 0 || isNaN(num)) return 'không đồng';
  
  // Ensure num is a number
  num = Number(num);
  if (num === 0) return 'không đồng';
  
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  
  const readGroup = (n) => {
    if (!n || n === 0 || isNaN(n)) return '';
    n = Number(n);
    if (n === 0) return '';
    
    let result = '';
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    const ten = Math.floor(remainder / 10);
    const one = remainder % 10;
    
    if (hundred > 0 && hundred < 10) {
      result += ones[hundred] + ' trăm ';
      if (ten === 0 && one > 0) {
        result += 'lẻ ';
      }
    }
    
    if (ten > 0 && ten < 10) {
      result += tens[ten] + ' ';
      if (ten === 1 && one > 0) {
        result += ones[one] + ' ';
      } else if (one > 0) {
        if (one === 5) {
          result += 'lăm ';
        } else if (one < 10) {
          result += ones[one] + ' ';
        }
      }
    } else if (one > 0 && one < 10) {
      if (hundred === 0) {
        // Only add "one" if there's no hundred part
        result += ones[one] + ' ';
      } else {
        // If there's a hundred part, add "lẻ" before one
        result += 'lẻ ' + ones[one] + ' ';
      }
    }
    
    return result.trim();
  };
  
  const millions = Math.floor(num / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const units = num % 1000;
  
  let result = '';
  
  if (millions > 0) {
    const millionStr = readGroup(millions);
    if (millionStr) {
      result += millionStr + ' triệu ';
    }
  }
  
  if (thousands > 0) {
    const thousandStr = readGroup(thousands);
    if (thousandStr) {
      result += thousandStr + ' nghìn ';
    }
  }
  
  if (units > 0) {
    const unitStr = readGroup(units);
    if (unitStr) {
      result += unitStr + ' ';
    }
  }
  
  const finalResult = result.trim();
  return finalResult ? (finalResult + ' đồng').replace(/  +/g, ' ') : 'không đồng';
};

function CreateOrder({ onBack }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { getStoreId, user } = useAuth();
  const { toast, success: showSuccess, showError: showToastError, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();
  
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
  const [orderResponse, setOrderResponse] = useState(null); // Store order response from API
  const [currentOrderId, setCurrentOrderId] = useState(null); // Store orderId when creating order
  const [orderDetailsResponse, setOrderDetailsResponse] = useState(null); // Store response from create/quote API
  const [storeInfo, setStoreInfo] = useState(null); // Store information
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Show confirmation snackbar
  const [pendingConfirmAction, setPendingConfirmAction] = useState(null); // Store pending confirm action
  
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
    
    // Load store information
    const loadStoreInfo = async () => {
      try {
        const currentStoreId = getStoreId();
        if (currentStoreId) {
          const storesResponse = await getAllStores();
          const stores = storesResponse?.data || storesResponse || [];
          const store = Array.isArray(stores) ? stores.find(s => String(s.storeId) === String(currentStoreId)) : null;
          if (store) {
            setStoreInfo({
              storeName: store.storeName || store.name,
              address: store.address,
              phone: store.phone,
              
            });
          }
        }
      } catch (error) {
        console.error('Error loading store info:', error);
      }
    };
    
    loadStoreInfo();
  }, [dispatch, getStoreId]);
  
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
      
      // Don't show success message - validation result box already shows "Sản phẩm hợp lệ"
      setSuccess(null);
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

  // Step 2: Add item to order - Only update local state, no API call
  const handleAddItem = async () => {
    if (!currentValidation || !currentValidation.isValid) {
      setError('Vui lòng kiểm tra sản phẩm trước khi thêm');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      
      let orderId = currentOrderId;
      
      // Step 1: Create order if not exists (only to get orderId, no quote API call)
      if (!orderId) {
        console.log('🚀 Creating order for customer:', selectedCustomer);
        const orderResult = await dispatch(createNewOrder({ 
          customerId: selectedCustomer.customerId 
        })).unwrap();
        
        const orderData = orderResult.data || orderResult;
        orderId = orderData.orderId || orderData.id;
        
        if (!orderId) {
          throw new Error('Không nhận được orderId từ server');
        }
        
        setCurrentOrderId(orderId);
        console.log('✅ Order created with ID:', orderId);
      }

      // Step 2: Update selectedItems with new/updated item (local state only)
      let updatedItems = [];
      const existingIndex = selectedItems.findIndex(
        item => item.modelId === currentValidation.modelId && item.colorId === currentValidation.colorId
      );

      if (existingIndex >= 0) {
        // Product already exists - increase quantity instead of replacing
        updatedItems = [...selectedItems];
        const existingItem = updatedItems[existingIndex];
        updatedItems[existingIndex] = {
          ...existingItem,
          modelId: currentValidation.modelId,
          colorId: currentValidation.colorId,
          quantity: existingItem.quantity + currentValidation.quantity, // Add to existing quantity
          promotionId: currentValidation.promotionId || existingItem.promotionId || 0,
          isValid: true,
          // Keep display info from validation
          modelName: currentValidation.modelName || existingItem.modelName,
          colorName: currentValidation.colorName || existingItem.colorName,
          promotionName: currentValidation.promotionName || existingItem.promotionName
        };
      } else {
        // Add new item
        updatedItems = [...selectedItems, {
          modelId: currentValidation.modelId,
          colorId: currentValidation.colorId,
          quantity: currentValidation.quantity,
          promotionId: currentValidation.promotionId || 0,
          isValid: true,
          // Add display info from validation
          modelName: currentValidation.modelName,
          colorName: currentValidation.colorName,
          promotionName: currentValidation.promotionName
        }];
      }

      // Filter duplicates by modelId+colorId combination
      const uniqueItems = [];
      const seenKeys = new Set();
      updatedItems.forEach(item => {
        const key = `${item.modelId}-${item.colorId}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueItems.push(item);
        }
      });
      
      setSelectedItems(uniqueItems);
      
      // Clear orderDetailsResponse since we haven't called quote API yet
      setOrderDetailsResponse(null);

      setSuccess(existingIndex >= 0 ? `Đã tăng số lượng sản phẩm lên ${uniqueItems[existingIndex].quantity}` : 'Đã thêm sản phẩm vào đơn hàng');

      // Reset form
      setFormData({
        modelId: '',
        colorId: '',
        quantity: 1,
        promotionId: 0
      });
      setCurrentValidation(null);
      dispatch(clearValidationResult());
      
    } catch (error) {
      console.error('❌ Error adding item:', error);
      setError('Không thể thêm sản phẩm: ' + (error.message || error));
    }
  };

  // Step 2: Remove item from order - Only update local state, no API call
  const handleRemoveItem = (index) => {
    try {
      setError(null);
      
      // Remove item from local state
      const updatedItems = selectedItems.filter((_, i) => i !== index);
      setSelectedItems(updatedItems);
      
      // Clear orderDetailsResponse since items have changed
      setOrderDetailsResponse(null);
      
      setSuccess('Đã xóa sản phẩm khỏi đơn hàng');
      
    } catch (error) {
      console.error('❌ Error removing item:', error);
      setError('Không thể xóa sản phẩm: ' + (error.message || error));
    }
  };

  // Generate HTML for printable order
  const generateOrderHTML = (orderData) => {
    // Use selectedItems to ensure we only show items the user actually selected
    // Map selectedItems to get full details from orderData.getOrderDetailsResponses
    let details = [];
    if (selectedItems && selectedItems.length > 0) {
      // Map selectedItems to get corresponding details from API response
      details = selectedItems.map(item => {
        // Find all matching details from API response (in case there are duplicates)
        const matchingDetails = orderData?.getOrderDetailsResponses?.filter(
          d => String(d.modelId) === String(item.modelId) && 
               String(d.colorId) === String(item.colorId)
        ) || [];
        
        // If multiple details found, aggregate them (sum quantities, prices, etc.)
        let detailFromResponse = null;
        if (matchingDetails.length > 0) {
          if (matchingDetails.length === 1) {
            // Single detail - use it directly
            detailFromResponse = matchingDetails[0];
          } else {
            // Multiple details - aggregate them
            detailFromResponse = {
              modelId: item.modelId,
              colorId: item.colorId,
              modelName: matchingDetails[0].modelName || item.modelName,
              colorName: matchingDetails[0].colorName || item.colorName,
              quantity: matchingDetails.reduce((sum, d) => sum + (d.quantity || 0), 0),
              unitPrice: matchingDetails[0].unitPrice || item.unitPrice || 0,
              registrationFee: matchingDetails.reduce((sum, d) => sum + (d.registrationFee || 0), 0),
              licensePlateFee: matchingDetails.reduce((sum, d) => sum + (d.licensePlateFee || 0), 0),
              promotionName: matchingDetails[0].promotionName || item.promotionName,
              discountAmount: matchingDetails.reduce((sum, d) => sum + (d.discountAmount || 0), 0),
              totalPrice: matchingDetails.reduce((sum, d) => sum + (d.totalPrice || 0), 0),
              vatAmount: matchingDetails.reduce((sum, d) => sum + (d.vatAmount || 0), 0)
            };
          }
        }
        
        // Always prioritize data from selectedItems (which has the correct updated values after quantity increase)
        // Use detail from response only as fallback for missing fields
        if (detailFromResponse) {
          return {
            ...detailFromResponse,
            // Override with selectedItems values (these are the most up-to-date)
            quantity: item.quantity, // Use quantity from selectedItems (correct updated value)
            totalPrice: item.totalPrice || detailFromResponse.totalPrice || 0,
            unitPrice: item.unitPrice || detailFromResponse.unitPrice || 0,
            vatAmount: item.vatAmount || detailFromResponse.vatAmount || 0,
            discountAmount: item.discountAmount || detailFromResponse.discountAmount || 0,
            registrationFee: item.registrationFee || detailFromResponse.registrationFee || 0,
            licensePlateFee: item.licensePlateFee || detailFromResponse.licensePlateFee || 0,
            promotionName: item.promotionName || detailFromResponse.promotionName,
            modelName: item.modelName || detailFromResponse.modelName,
            colorName: item.colorName || detailFromResponse.colorName
          };
        } else {
          // Use item data directly if no response found
          return {
            modelName: item.modelName,
            colorName: item.colorName,
            quantity: item.quantity,
            unitPrice: item.unitPrice || 0,
            registrationFee: item.registrationFee || 0,
            licensePlateFee: item.licensePlateFee || 0,
            promotionName: item.promotionName,
            discountAmount: item.discountAmount || 0,
            totalPrice: item.totalPrice || 0,
            vatAmount: item.vatAmount || 0
          };
        }
      });
    } else {
      // Fallback to orderData.getOrderDetailsResponses if selectedItems is empty
      details = orderData?.getOrderDetailsResponses || [];
    }
    
    const customerName = orderData?.customerName || selectedCustomer?.fullName || 'N/A';
    const customerPhone = orderData?.customerPhone || selectedCustomer?.phone || 'N/A';
    const orderCode = orderData?.orderCode || `#${orderData?.orderId || 'N/A'}`;
    const status = orderData?.status || 'DRAFT';
    const staffName = orderData?.staffName || user?.fullName || user?.username || 'N/A';
    // Use storeInfo first, then orderData.storeName, then fallback
    const storeName = storeInfo?.storeName || orderData?.storeName || 'N/A';
    const storeAddress = storeInfo?.address || orderData?.storeAddress || 'N/A';
    const storePhone = storeInfo?.phone || orderData?.storePhone || 'N/A';
    const storeEmail = storeInfo?.email || orderData?.storeEmail || 'N/A';
    const currentDate = new Date().toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đơn hàng ${orderCode}</title>
    <style>
        @page {
            size: A4;
            margin: 0.5cm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            background: white;
            padding: 0.5cm;
        }
        .header {
            text-align: center;
            margin-bottom: 0.6cm;
            padding-bottom: 0.4cm;
            border-bottom: 2px solid #000;
        }
        .header h1 {
            font-size: 18pt;
            margin-bottom: 0.2cm;
        }
        .header-info {
            font-size: 10pt;
            margin-top: 0.2cm;
        }
        .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.4cm;
            padding-bottom: 0.3cm;
            border-bottom: 1px solid #000;
        }
        .order-info-left h2 {
            font-size: 14pt;
            margin-bottom: 0.2cm;
        }
        .order-info-right {
            text-align: right;
        }
        .info-item {
            font-size: 10pt;
            margin: 0.1cm 0;
        }
        .customer-info {
            margin-bottom: 0.4cm;
            padding-bottom: 0.3cm;
            border-bottom: 1px solid #000;
        }
        .customer-info h3 {
            font-size: 12pt;
            margin-bottom: 0.2cm;
        }
        .customer-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.2cm;
            font-size: 10pt;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0.4cm;
            font-size: 10pt;
        }
        table th, table td {
            border: 1px solid #000;
            padding: 4px 3px;
            text-align: left;
        }
        table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }
        table td {
            text-align: center;
        }
        table td:first-child {
            text-align: center;
        }
        table td:nth-child(2) {
            text-align: left;
        }
        table td:last-child {
            text-align: right;
        }
        .totals {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 0.4cm;
        }
        .totals-box {
            width: 100%;
            max-width: 300px;
            border: 2px solid #000;
            padding: 0.3cm;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 0.1cm 0;
            font-size: 10pt;
        }
        .total-final {
            border-top: 2px solid #000;
            margin-top: 0.2cm;
            padding-top: 0.2cm;
            font-weight: bold;
            font-size: 12pt;
        }
        .total-words {
            border-top: 1px solid #000;
            margin-top: 0.2cm;
            padding-top: 0.2cm;
            font-size: 9pt;
            font-style: italic;
        }
        .signature {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1cm;
            margin-top: 0.5cm;
            padding-top: 0.3cm;
            border-top: 2px solid #000;
        }
        .signature-box {
            text-align: center;
        }
        .signature-box p:first-child {
            font-weight: bold;
            margin-bottom: 1.5cm;
        }
        .notes {
            margin-top: 0.3cm;
            padding-top: 0.2cm;
            border-top: 1px solid #000;
            font-size: 9pt;
            text-align: center;
        }
        @media print {
            body {
                padding: 0;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>ELECTRA VIETNAM</h1>
        <div class="header-info">
            <p><strong>CỬA HÀNG XE ĐIỆN ELECTRA</strong></p>
            <p>${storeName}</p>
            <p>Địa chỉ: ${storeAddress}</p>
            <p>Điện thoại: ${storePhone}</p>
        </div>
    </div>

    <div class="order-info">
        <div class="order-info-left">
            <h2>ĐƠN HÀNG</h2>
            <div class="info-item"><strong>Mã đơn hàng:</strong> ${orderCode}</div>
            <div class="info-item"><strong>Ngày tạo:</strong> ${currentDate}</div>
        </div>
        <div class="order-info-right">
            <h3>THÔNG TIN NHÂN VIÊN</h3>
            <div class="info-item"><strong>Nhân viên:</strong> ${staffName}</div>
            <div class="info-item"><strong>Cửa hàng:</strong> ${storeName}</div>
        </div>
    </div>

    <div class="customer-info">
        <h3>THÔNG TIN KHÁCH HÀNG</h3>
        <div class="customer-details">
            <div><strong>Họ và tên:</strong> ${customerName}</div>
            <div><strong>Số điện thoại:</strong> ${customerPhone}</div>
        </div>
    </div>

    <h3>CHI TIẾT ĐƠN HÀNG</h3>
    <table>
        <thead>
            <tr>
                <th>STT</th>
                <th>Sản phẩm</th>
                <th>Màu sắc</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Phí đăng ký</th>
                <th>Phí biển số</th>
                <th>Khuyến mãi</th>
                <th>Thành tiền</th>
            </tr>
        </thead>
        <tbody>
            ${details.map((detail, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>
                    ${detail.modelName || 'N/A'}
                    ${detail.promotionName ? `<div style="font-size: 9pt; color: #059669; margin-top: 2px;">KM: ${detail.promotionName}</div>` : ''}
                </td>
                <td>${detail.colorName || 'N/A'}</td>
                <td>${detail.quantity || 0}</td>
                <td>${(detail.unitPrice || 0).toLocaleString('vi-VN')}đ</td>
                <td>${(detail.registrationFee || 0).toLocaleString('vi-VN')}đ</td>
                <td>${(detail.licensePlateFee || 0).toLocaleString('vi-VN')}đ</td>
                <td>${detail.discountAmount > 0 ? `-${(detail.discountAmount || 0).toLocaleString('vi-VN')}đ` : '-'}</td>
                <td><strong>${(detail.totalPrice || 0).toLocaleString('vi-VN')}đ</strong></td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="totals">
        <div class="totals-box">
            <div class="total-row">
                <span>Tổng giá sản phẩm:</span>
                <span>${(orderData?.totalPrice || 0).toLocaleString('vi-VN')}đ</span>
            </div>
            <div class="total-row">
                <span>Phí dịch vụ + biển số:</span>
                <span>+${(orderData?.totalTaxPrice || 0).toLocaleString('vi-VN')}đ</span>
            </div>
            <div class="total-row">
                <span>Khuyến mãi:</span>
                <span>-${(orderData?.totalPromotionAmount || 0).toLocaleString('vi-VN')}đ</span>
            </div>
            <div class="total-row total-final">
                <span>TỔNG THANH TOÁN:</span>
                <span>${(orderData?.totalPayment || 0).toLocaleString('vi-VN')}đ</span>
            </div>
            <div class="total-words">
                <p><strong>Bằng chữ:</strong></p>
                <p>${convertNumberToWords(orderData?.totalPayment || 0)}</p>
            </div>
        </div>
    </div>

    <div class="signature">
        <div class="signature-box">
            <p>KHÁCH HÀNG</p>
            <p>(Ký, ghi rõ họ tên)</p>
        </div>
        <div class="signature-box">
            <p>NHÂN VIÊN BÁN HÀNG</p>
            <p>${staffName}</p>
        </div>
    </div>

    <div class="notes">
        <p><strong>Lưu ý:</strong> Đơn hàng này có giá trị pháp lý. Vui lòng kiểm tra kỹ thông tin trước khi ký xác nhận.</p>
    </div>

    <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; background: #059669; color: white; border: none; border-radius: 5px; cursor: pointer;">
            In đơn hàng
        </button>
    </div>
</body>
</html>
    `;
  };

  // Step 2: Continue to confirmation - Call API /orders/create/quote then generate HTML
  const handleContinueToConfirm = async () => {
    if (selectedItems.length === 0) {
      setError('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng!');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      
      let orderId = currentOrderId;
      
      // Step 1: Create order if not exists
      if (!orderId) {
        console.log('🚀 Creating order for customer:', selectedCustomer);
        const orderResult = await dispatch(createNewOrder({ 
          customerId: selectedCustomer.customerId 
        })).unwrap();
        
        const orderData = orderResult.data || orderResult;
        orderId = orderData.orderId || orderData.id;
        
        if (!orderId) {
          throw new Error('Không nhận được orderId từ server');
        }
        
        setCurrentOrderId(orderId);
        console.log('✅ Order created with ID:', orderId);
      }

      // Step 2: Call API /orders/create/quote with all selectedItems
      console.log('🚀 Calling /orders/create/quote with items:', selectedItems);
      const quoteResponse = await createOrderDetailsInBatch(orderId, selectedItems);
      console.log('✅ Quote response:', quoteResponse);

      // Extract response data
      const responseData = quoteResponse.data || quoteResponse;
      
      // Update selectedItems with response data for display
      if (responseData.getOrderDetailsResponses && responseData.getOrderDetailsResponses.length > 0) {
        const itemsWithResponse = selectedItems.map((item) => {
          // Find matching detail response by modelId and colorId
          const detailResponse = responseData.getOrderDetailsResponses.find(
            d => String(d.modelId) === String(item.modelId) && 
                 String(d.colorId) === String(item.colorId)
          );
          
          if (detailResponse) {
            return {
              ...item,
              modelName: detailResponse.modelName || item.modelName,
              colorName: detailResponse.colorName || item.colorName,
              unitPrice: detailResponse.unitPrice || item.unitPrice || 0,
              licensePlateFee: detailResponse.licensePlateFee || item.licensePlateFee || 0,
              registrationFee: detailResponse.registrationFee || item.registrationFee || 0,
              promotionName: detailResponse.promotionName || item.promotionName,
              discountAmount: detailResponse.discountAmount || item.discountAmount || 0,
              totalPrice: detailResponse.totalPrice || item.totalPrice || 0,
              vatAmount: detailResponse.vatAmount || item.vatAmount || 0
            };
          }
          return item;
        });
        
        setSelectedItems(itemsWithResponse);
      }

      // Store order details response for display in step 3
      const orderDetailsData = {
        orderId: responseData.orderId || orderId,
        orderCode: responseData.orderCode,
        status: responseData.status || 'DRAFT',
        getOrderDetailsResponses: responseData.getOrderDetailsResponses || [],
        totalPrice: responseData.totalPrice || 0,
        totalTaxPrice: responseData.totalTaxPrice || 0,
        totalPromotionAmount: responseData.totalPromotionAmount || 0,
        totalPayment: responseData.totalPayment || 0
      };
      
      setOrderDetailsResponse(orderDetailsData);

      // Step 3: Generate HTML content
      const htmlContent = generateOrderHTML(orderDetailsData);
      
      // Step 4: Open new window with order content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Auto focus on print window
        printWindow.focus();
        
        // Navigate to step 3 after opening print window
        setCurrentStep(3);
        setError(null);
      } else {
        setError('Không thể mở cửa sổ mới. Vui lòng kiểm tra cài đặt popup của trình duyệt.');
      }
      
    } catch (error) {
      console.error('❌ Error continuing to confirm:', error);
      setError('Không thể tạo báo giá đơn hàng: ' + (error.message || error));
    }
  };

  // Step 3: Save draft (no confirmation)
  const handleSaveDraft = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      // Validation frontend
      if (selectedItems.length === 0) {
        setError('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng');
        return;
      }
      
      // Use existing order if already created, otherwise create new one
      let orderId = currentOrderId;
      
      if (!orderId) {
        console.log('🚀 Creating order for customer:', selectedCustomer);
        const orderResult = await dispatch(createNewOrder({ 
          customerId: selectedCustomer.customerId 
        })).unwrap();
        
        const orderData = orderResult.data || orderResult;
        orderId = orderData.orderId || orderData.id;
        
        if (!orderId) {
          throw new Error('Không nhận được orderId từ server');
        }
        
        setCurrentOrderId(orderId);
      }

      // Order details should already be created via handleAddItem
      // Just use orderDetailsResponse if available
      if (orderDetailsResponse) {
        setOrderResponse({
          ...orderDetailsResponse,
          customerName: selectedCustomer?.fullName,
          customerPhone: selectedCustomer?.phone
        });
      } else {
        // If no orderDetailsResponse, refresh by calling API again
        const quoteResponse = await createOrderDetailsInBatch(orderId, selectedItems);
        const responseData = quoteResponse.data || quoteResponse;
        
        setOrderResponse({
          orderId: responseData.orderId || orderId,
          orderCode: responseData.orderCode,
          status: responseData.status || 'DRAFT',
          getOrderDetailsResponses: responseData.getOrderDetailsResponses || [],
          totalPrice: responseData.totalPrice || 0,
          totalTaxPrice: responseData.totalTaxPrice || 0,
          totalPromotionAmount: responseData.totalPromotionAmount || 0,
          totalPayment: responseData.totalPayment || 0,
          customerName: selectedCustomer?.fullName,
          customerPhone: selectedCustomer?.phone
        });
      }
      
      setSuccess('Lưu đơn hàng nháp thành công! Trạng thái: DRAFT');
      
      // Navigate to orders list after 2 seconds
      setTimeout(() => {
        navigate('/dealer-staff/order-management', { state: { tab: 'view' } });
      }, 2000);
      
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

  // Step 3: Confirm order (DRAFT → CONFIRMED) - Show confirmation snackbar
  const handleConfirmOrder = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      // Validation frontend
      if (selectedItems.length === 0) {
        setError('Vui lòng thêm ít nhất một sản phẩm vào đơn hàng');
        return;
      }
      
      // Ensure orderDetailsResponse exists (should be set from Step 2 when clicking "Tiếp tục")
      if (!orderDetailsResponse) {
        setError('Vui lòng quay lại bước trước và nhấn "Tiếp tục" để tạo báo giá đơn hàng trước khi xác nhận.');
        return;
      }
      
      // Use existing orderId from orderDetailsResponse or currentOrderId
      const orderId = orderDetailsResponse.orderId || currentOrderId;
      
      if (!orderId) {
        throw new Error('Không tìm thấy mã đơn hàng. Vui lòng thử lại.');
      }
      
      // Show confirmation snackbar
      const orderCode = orderDetailsResponse.orderCode || `#${orderId}`;
      setPendingConfirmAction({
        orderId,
        orderCode,
        customerName: selectedCustomer?.fullName,
        itemCount: selectedItems.length,
        totalPayment: orderDetailsResponse.totalPayment || 0
      });
      setShowConfirmDialog(true);
      
    } catch (error) {
      console.error('❌ Error preparing confirmation:', error);
      setError('Không thể chuẩn bị xác nhận đơn hàng: ' + (error.message || error));
    }
  };

  // Execute confirmation after user confirms in snackbar
  const executeConfirmOrder = async (orderId) => {
    try {
      setError(null);
      setSuccess(null);
      
      // Step 3: Confirm order (DRAFT → CONFIRMED)
      console.log('🚀 Confirming order:', orderId);
      
      const confirmResponse = await dispatch(confirmOrderThunk(orderId)).unwrap();
      
      console.log('✅ Order confirmed successfully:', confirmResponse);
      
      // Extract response data from confirmOrder
      const confirmData = confirmResponse.data || confirmResponse;
      
      // Store order response for display
      setOrderResponse({
        orderId: confirmData.orderId || orderId,
        orderCode: confirmData.orderCode || orderDetailsResponse?.orderCode,
        status: confirmData.status || 'CONFIRMED',
        getOrderDetailsResponses: confirmData.getOrderDetailsResponses || orderDetailsResponse?.getOrderDetailsResponses || [],
        totalPrice: confirmData.totalPrice || orderDetailsResponse?.totalPrice || 0,
        totalTaxPrice: confirmData.totalTaxPrice || orderDetailsResponse?.totalTaxPrice || 0,
        totalPromotionAmount: confirmData.totalPromotionAmount || orderDetailsResponse?.totalPromotionAmount || 0,
        totalPayment: confirmData.totalPayment || orderDetailsResponse?.totalPayment || 0,
        customerName: confirmData.customerName || selectedCustomer?.fullName,
        customerPhone: confirmData.customerPhone || selectedCustomer?.phone,
        staffName: confirmData.staffName,
        storeName: confirmData.storeName
      });
      
      setSuccess('Tạo và xác nhận đơn hàng thành công! Trạng thái: CONFIRMED');
      
      // Navigate to orders list after 2 seconds
      setTimeout(() => {
        navigate('/dealer-staff/order-management', { state: { tab: 'view' } });
      }, 2000);
      
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
    } else if (currentStep === 3) {
      // If going back from Step 3, reset all state to allow starting fresh
      setSelectedItems([]);
      setOrderDetailsResponse(null);
      setCurrentOrderId(null);
      setCurrentValidation(null);
      setFormData({
        modelId: '',
        colorId: '',
        quantity: 1,
        promotionId: 0
      });
      setError(null);
      setSuccess(null);
      setOrderResponse(null);
      setPendingConfirmAction(null);
      setShowConfirmDialog(false);
      dispatch(clearValidationResult());
      // Go back to Step 2 to add products again
      setCurrentStep(2);
    } else {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  return (
    <div>
      {/* Toast Notifications */}
      <Toast 
        show={toast.show} 
        type={toast.type} 
        message={toast.message} 
        onClose={hideToast}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        show={confirm.show}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />

      <div className="max-w-6xl mx-auto">
      {/* Error/Success Messages - Only show for step 1 and 3, step 2 shows below validation */}
      {currentStep !== 2 && error && (
        <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      
      {currentStep !== 2 && success && (
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
              <button
                onClick={() => navigate('/dealer-staff/customer-management?add=new')}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Thêm mới
              </button>
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

              {/* Validation Error/Success Messages - Show below validation result */}
              {currentStep === 2 && (
                <>
                  {error && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                      <span className="text-red-700">{error}</span>
                    </div>
                  )}
                  
                  {success && (
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-green-700">{success}</span>
                    </div>
                  )}
                </>
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

            {/* Selected Items List - Display from API response */}
            {selectedItems.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Sản phẩm đã chọn ({selectedItems.length})
                </h3>
                <div className="space-y-2 mb-3">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">
                            {item.modelName || 'N/A'} - {item.colorName || 'N/A'}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                            <div>
                              <span className="font-semibold">Số lượng:</span> {item.quantity || 0}
                            </div>
                            <div>
                              <span className="font-semibold">Đơn giá:</span> {(item.unitPrice || 0).toLocaleString('vi-VN')}đ
                            </div>
                            <div>
                              <span className="font-semibold">Phí đăng ký:</span> {(item.registrationFee || 0).toLocaleString('vi-VN')}đ
                            </div>
                            <div>
                              <span className="font-semibold">Phí biển số:</span> {(item.licensePlateFee || 0).toLocaleString('vi-VN')}đ
                            </div>
                            {item.promotionName && item.promotionName !== 'Không áp dụng' && (
                              <div>
                                <span className="font-semibold">Khuyến mãi:</span> {item.promotionName}
                              </div>
                            )}
                            {item.discountAmount > 0 && (
                              <div>
                                <span className="font-semibold">Giảm giá:</span> -{(item.discountAmount || 0).toLocaleString('vi-VN')}đ
                              </div>
                            )}
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-300">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-semibold text-gray-700">Thành tiền:</span>
                              <span className="text-base font-bold text-emerald-600">
                                {(item.totalPrice || 0).toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Order Summary from API Response */}
                {orderDetailsResponse && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-emerald-900">Tổng quan đơn hàng</h4>
                      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full font-semibold">
                        {orderDetailsResponse.orderCode || `#${orderDetailsResponse.orderId}`}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Tổng giá sản phẩm:</span>
                        <span className="font-semibold text-emerald-900">
                          {(orderDetailsResponse.totalPrice || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Phí dịch vụ + biển số:</span>
                        <span className="font-semibold text-orange-600">
                          +{(orderDetailsResponse.totalTaxPrice || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-emerald-700">Khuyến mãi:</span>
                        <span className="font-semibold text-red-600">
                          -{(orderDetailsResponse.totalPromotionAmount || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="pt-2 border-t border-emerald-300 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-emerald-900">Tổng thanh toán:</span>
                          <span className="text-lg font-bold text-emerald-600">
                            {(orderDetailsResponse.totalPayment || 0).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
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

        {/* STEP 3: Confirm Order - Simple Display */}
        {currentStep === 3 && (
          <div>
            <div className="flex items-center mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Xác nhận đơn hàng</h2>
            </div>

            {(orderResponse || orderDetailsResponse) && (
              <div className="space-y-4 mb-6">
                {/* Mã đơn hàng */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
                  <p className="text-xl font-bold text-emerald-600">
                    {(orderResponse || orderDetailsResponse)?.orderCode || `#${(orderResponse || orderDetailsResponse)?.orderId}`}
                  </p>
                </div>

                {/* Khách hàng */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Khách hàng</p>
                  <p className="text-base font-semibold text-gray-900">
                    {(orderResponse || orderDetailsResponse)?.customerName || selectedCustomer?.fullName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {(orderResponse || orderDetailsResponse)?.customerPhone || selectedCustomer?.phone || 'N/A'}
                  </p>
                </div>

                {/* Chi tiết đơn hàng */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Chi tiết đơn hàng</p>
                  <div className="space-y-2">
                    {selectedItems && selectedItems.length > 0 ? (
                      selectedItems.map((item, index) => (
                        <div key={`${item.modelId}-${item.colorId}-${index}`} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {item.modelName || 'N/A'} - {item.colorName || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Số lượng: {item.quantity || 0} | Giá: {(item.unitPrice || 0).toLocaleString('vi-VN')}đ
                            </p>
                            {item.promotionName && (
                              <p className="text-xs text-emerald-600">KM: {item.promotionName}</p>
                            )}
                          </div>
                          <p className="font-semibold text-gray-900 ml-4">
                            {(item.totalPrice || 0).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      ))
                    ) : (
                      ((orderResponse || orderDetailsResponse)?.getOrderDetailsResponses || []).map((detail, index) => (
                        <div key={index} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {detail.modelName || 'N/A'} - {detail.colorName || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              Số lượng: {detail.quantity || 0} | Giá: {(detail.unitPrice || 0).toLocaleString('vi-VN')}đ
                            </p>
                            {detail.promotionName && (
                              <p className="text-xs text-emerald-600">KM: {detail.promotionName}</p>
                            )}
                          </div>
                          <p className="font-semibold text-gray-900 ml-4">
                            {(detail.totalPrice || 0).toLocaleString('vi-VN')}đ
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Tổng thanh toán */}
                <div className="pt-4 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <p className="text-base font-bold text-gray-900">Tổng thanh toán:</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {((orderResponse || orderDetailsResponse)?.totalPayment || 0).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={handleConfirmOrder}
                disabled={orderLoading}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-semibold shadow-lg"
              >
                {orderLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Xác nhận đơn hàng
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Snackbar Dialog */}
        {showConfirmDialog && pendingConfirmAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Xác nhận đơn hàng
                  </h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium">Mã đơn hàng:</span> {pendingConfirmAction.orderCode}
                    </p>
                    <p>
                      <span className="font-medium">Khách hàng:</span> {pendingConfirmAction.customerName}
                    </p>
                    <p>
                      <span className="font-medium">Số lượng sản phẩm:</span> {pendingConfirmAction.itemCount}
                    </p>
                    <p>
                      <span className="font-medium">Tổng thanh toán:</span> {pendingConfirmAction.totalPayment.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="mt-2 text-orange-600 font-medium">
                      Đơn hàng sẽ chuyển sang trạng thái CONFIRMED và không thể chỉnh sửa.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setPendingConfirmAction(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmDialog(false);
                    await executeConfirmOrder(pendingConfirmAction.orderId);
                    setPendingConfirmAction(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 print:hidden">
          <button
            onClick={handleBack}
            disabled={orderLoading}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 print:hidden"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {currentStep === 1 ? 'Hủy' : 'Quay lại'}
          </button>
          
          <div className="text-sm text-gray-500 print:hidden">
            Bước {currentStep} / 3
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default CreateOrder;
