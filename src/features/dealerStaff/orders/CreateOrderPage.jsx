import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, CheckCircle, Trash2, ShoppingCart, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight, AlertCircle, FileText } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Stepper from '../../../components/ui/Stepper';
import Button from '../../../components/ui/Button';
import LoadingSkeleton, { SkeletonList } from '../../../components/shared/LoadingSkeleton';
import { useToast } from '../../../components/ui/Toast';
import { useGetAllCustomersQuery } from '../../../api/dealerStaff/customerApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { useGetAllModelColorsQuery } from '../../../api/evmStaff/productApi';
import { useGetAllPromotionsQuery } from '../../../api/dealerManager/promotionApi';
import { useGetStoreStocksQuery } from '../../../api/dealerStaff/storeStockApi';
import { useCreateDraftOrderMutation, useConfirmOrderMutation, useDeleteOrderMutation, useGetOrderByIdQuery, useGetOrderDetailsQuery } from '../../../api/dealerStaff/orderApi';
import { useCreateQuoteMutation, useGetQuoteByOrderIdQuery, useUpdateQuoteMutation } from '../../../api/dealerStaff/quotationApi';
import { useCreateContractMutation } from '../../../api/dealerStaff/contractApi';
import { useGetAllStoresQuery, useGetStoreByNameQuery } from '../../../api/admin/storeApi';
import { formatCurrency } from '../../../utils/formatters';
import { generateQuoteHtml } from './QuoteTemplate';
import { useSelector } from 'react-redux';

const STEPS = [
  { id: 'customer', label: 'Khách hàng', description: 'Chọn khách hàng' },
  { id: 'products', label: 'Sản phẩm', description: 'Thêm sản phẩm' },
  { id: 'review', label: 'Xác nhận', description: 'Kiểm tra đơn' },
  { id: 'complete', label: 'Hoàn thành', description: 'Tạo đơn' },
];

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Check if we're in edit mode
  const editMode = location.state?.editMode || false;
  const existingOrderId = location.state?.orderId || null;
  const startStep = location.state?.startStep || 1;

  // Step management
  const [currentStep, setCurrentStep] = useState(startStep);
  const [orderId, setOrderId] = useState(existingOrderId);
  const [orderCode, setOrderCode] = useState(null);
  const user = useSelector(state => state.auth.user);
  const [hasPrintedQuote, setHasPrintedQuote] = useState(false);

  // Step 1: Customer selection with pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPage, setCustomerPage] = useState(1);
  const customersPerPage = 10;

  // Step 2: Products - LOCAL STATE ONLY
  const [orderDetails, setOrderDetails] = useState([]);
  const [currentProduct, setCurrentProduct] = useState({
    modelId: null,
    colorId: null,
    quantity: 1,
    promotionId: 0,
  });
  const [includeLicensePlate, setIncludeLicensePlate] = useState(false);

  // Stock validation
  const [stockInfo, setStockInfo] = useState(null);

  // Pricing from backend (Step 3)
  const [orderSummary, setOrderSummary] = useState(null);

  // API queries
  const { data: customersData, isLoading: loadingCustomers } = useGetAllCustomersQuery();
  const { data: modelsData } = useGetAllModelsQuery();
  const { data: modelColorsData } = useGetAllModelColorsQuery();
  const { data: promotionsData, isLoading: loadingPromotions } = useGetAllPromotionsQuery();
  const { data: storeStocksData } = useGetStoreStocksQuery();
  const { data: storesData } = useGetAllStoresQuery();

  // Get store info from storeName
  const storeName = orderSummary?.storeName || user?.storeName;
  const { data: storeByNameData } = useGetStoreByNameQuery(storeName, {
    skip: !storeName,
  });

  // API mutations
  const [createDraftOrder, { isLoading: creatingOrder }] = useCreateDraftOrderMutation();
  const [createQuote, { isLoading: creatingQuote }] = useCreateQuoteMutation();
  const [updateQuote, { isLoading: updatingQuote }] = useUpdateQuoteMutation();
  const [confirmOrder, { isLoading: confirmingOrder }] = useConfirmOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const [createContract, { isLoading: creatingContract }] = useCreateContractMutation();

  // Load existing order data if in edit mode
  const { data: existingOrderData, isLoading: loadingExistingOrder } = useGetOrderByIdQuery(
    existingOrderId,
    { skip: !editMode || !existingOrderId }
  );

  // Get order details for step 3
  const { data: orderDetailsData, isLoading: loadingOrderDetails } = useGetOrderDetailsQuery(
    orderId,
    { skip: !orderId || currentStep !== 3 }
  );

  // Calculate totals from order details
  const calculatedTotals = useMemo(() => {
    if (!orderDetailsData?.data || !Array.isArray(orderDetailsData.data)) {
      return null;
    }

    const details = orderDetailsData.data;
    return {
      totalPrice: details.reduce((sum, d) => sum + (d.unitPrice * d.quantity), 0),
      totalLicensePlateFee: details.reduce((sum, d) => sum + (d.licensePlateFee || 0), 0),
      totalServiceFee: details.reduce((sum, d) => sum + (d.serviceFee || 0), 0),
      totalOtherTax: details.reduce((sum, d) => sum + (d.otherTax || 0), 0),
      totalOtherFees: details.reduce((sum, d) => sum + (d.otherFees || 0), 0),
      totalPromotionAmount: details.reduce((sum, d) => sum + (d.discountAmount || 0), 0),
      totalPayment: details.reduce((sum, d) => sum + (d.totalPrice || 0), 0),
    };
  }, [orderDetailsData]);

  // Load existing quote data if in edit mode - DISABLED since order data contains everything
  // const { data: existingQuoteData, isLoading: loadingExistingQuote } = useGetQuoteByOrderIdQuery(
  // existingOrderId,
  // { skip: !editMode || !existingOrderId }
  // );

  // Use order data directly since it contains all quote information
  const existingQuoteData = editMode && location.state?.orderData ? {
    data: location.state.orderData
  } : null;
  const loadingExistingQuote = false;

  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  const models = Array.isArray(modelsData?.data) ? modelsData.data : [];
  const modelColors = Array.isArray(modelColorsData?.data) ? modelColorsData.data : [];
  // Handle response format: { code: 200, data: [...] }
  // RTK Query wraps: { data: { code: 200, message: "...", data: [...] } }
  // Use same parsing as PromotionPage.jsx: promotionsData?.data?.data
  let promotions = [];
  if (promotionsData) {
    if (Array.isArray(promotionsData?.data?.data)) {
      promotions = promotionsData.data.data;
    } else if (Array.isArray(promotionsData?.data)) {
      promotions = promotionsData.data;
    } else if (Array.isArray(promotionsData)) {
      promotions = promotionsData;
    }
  }

  // Handle store stocks data from dealer staff API (which might be wrapped differently)
  const storeStocks = useMemo(() => {
    if (!storeStocksData) return [];
    if (Array.isArray(storeStocksData)) return storeStocksData;
    if (storeStocksData.data && Array.isArray(storeStocksData.data)) return storeStocksData.data;
    return [];
  }, [storeStocksData]);

  // Filter models based on store stock
  const availableModels = useMemo(() => {
    if (!storeStocks || storeStocks.length === 0) return [];

    // Get all modelIds that have stock > 0
    const modelIdsWithStock = new Set(
      storeStocks
        .filter(s => {
          const qty = s.availableStock !== undefined ? s.availableStock : s.quantity;
          return qty > 0;
        })
        .map(s => s.modelId)
    );

    return models.filter(m => modelIdsWithStock.has(m.modelId));
  }, [models, storeStocks]);

  // Filter and sort customers (newest first)
  const filteredCustomers = useMemo(() => {
    let filtered = customers;
    if (searchTerm) {
      filtered = customers.filter(c =>
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Create a copy of the array before sorting to avoid mutating read-only data
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  }, [customers, searchTerm]);

  // Paginate customers
  const totalCustomerPages = Math.ceil(filteredCustomers.length / customersPerPage);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (customerPage - 1) * customersPerPage;
    const endIndex = startIndex + customersPerPage;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, customerPage, customersPerPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCustomerPage(1);
  }, [searchTerm]);

  // Load existing order data when in edit mode
  useEffect(() => {
    if (editMode && location.state?.orderData) {
      const orderData = location.state.orderData;

      // Set customer data
      if (orderData.customerId && customers.length > 0) {
        const customer = customers.find(c => c.customerId === orderData.customerId);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }

      // Load existing products into local state
      if (orderData.getOrderDetailsResponses && orderData.getOrderDetailsResponses.length > 0) {
        const loadedOrderDetails = orderData.getOrderDetailsResponses.map(detail => {
          // Tìm giá tại cửa hàng từ storeStocks
          const storeStock = storeStocks.find(s =>
            s.modelId === detail.modelId &&
            (s.colorId === detail.colorId || s.color?.id === detail.colorId || s.color?.colorId === detail.colorId)
          );
          const storePrice = storeStock?.priceOfStore || detail.unitPrice || 0;

          return {
            modelId: detail.modelId,
            colorId: detail.colorId,
            quantity: detail.quantity,
            promotionId: detail.promotionId || 0,
            modelName: detail.modelName,
            colorName: detail.colorName,
            price: storePrice
          };
        });
        setOrderDetails(loadedOrderDetails);
      }

      // Set license plate service
      const hasLicensePlate = orderData.getOrderDetailsResponses?.some(detail => detail.licensePlateFee > 0) || false;
      setIncludeLicensePlate(hasLicensePlate);


    }
  }, [editMode, location.state?.orderData, customers, storeStocks]);

  // Set customer when customers data loads (for edit mode)
  useEffect(() => {
    if (editMode && location.state?.orderData && customers.length > 0 && !selectedCustomer) {
      const orderData = location.state.orderData;
      const customer = customers.find(c => c.customerId === orderData.customerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [editMode, location.state?.orderData, customers, selectedCustomer]);

  // Get available colors for selected model (filtered by stock)
  const availableColors = useMemo(() => {
    if (!currentProduct.modelId) return [];

    // Get colors for this model
    const colorsForModel = modelColors.filter(mc => mc.modelId === currentProduct.modelId);

    // Filter by stock
    return colorsForModel.filter(c => {
      const colorId = c.id || c.colorId;
      const stock = storeStocks.find(s =>
        s.modelId === currentProduct.modelId &&
        (s.colorId === colorId || s.color?.id === colorId || s.color?.colorId === colorId)
      );

      if (!stock) return false;
      const qty = stock.availableStock !== undefined ? stock.availableStock : stock.quantity;
      return qty > 0;
    });
  }, [currentProduct.modelId, modelColors, storeStocks]);

  // Get available promotions (filter active only, optionally filter by model if selected)
  // Note: promotionType can be null - we'll infer it from amount if needed
  const availablePromotions = useMemo(() => {
    if (!promotions || promotions.length === 0) {
      return [];
    }

    const filtered = promotions.filter(p => {
      // Check if promotion is active
      const isActive = p.active === true && p.manuallyDisabled === false;

      // If model is selected, show promotions for that model; otherwise show all active promotions
      if (currentProduct.modelId) {
        // Convert both to numbers for comparison (handle string/number mismatch)
        const promotionModelId = Number(p.modelId);
        const selectedModelId = Number(currentProduct.modelId);
        return isActive && promotionModelId === selectedModelId;
      }
      // No model selected - show all active promotions
      return isActive;
    });

    return filtered;
  }, [promotions, currentProduct.modelId]);

  // Get selected model info
  const selectedModel = useMemo(() => {
    return models.find(m => m.modelId === currentProduct.modelId);
  }, [models, currentProduct.modelId]);

  // Get selected color info
  const selectedColor = useMemo(() => {
    return availableColors.find(c => (c.id || c.colorId) === currentProduct.colorId);
  }, [availableColors, currentProduct.colorId]);

  // Check stock availability when model + color selected
  useEffect(() => {
    if (currentProduct.modelId && currentProduct.colorId) {
      checkStock();
    } else {
      setStockInfo(null);
    }
  }, [currentProduct.modelId, currentProduct.colorId]);

  const checkStock = () => {
    const stock = storeStocks.find(s =>
      s.modelId === currentProduct.modelId &&
      (s.colorId === currentProduct.colorId || s.color?.id === currentProduct.colorId || s.color?.colorId === currentProduct.colorId)
    );

    if (stock) {
      const available = stock.availableStock !== undefined ? stock.availableStock : stock.quantity;
      const total = stock.quantity || 0;
      const reserved = Math.max(0, total - available);

      setStockInfo({
        available: available > 0,
        quantity: available, // Use available stock for validation
        totalQuantity: total,
        reservedQuantity: reserved
      });
    } else {
      setStockInfo({
        available: false,
        quantity: 0,
        totalQuantity: 0,
        reservedQuantity: 0
      });
    }
  };

  // Get added product details for display
  const getProductDisplayInfo = (detail) => {
    const model = models.find(m => m.modelId === detail.modelId);
    const color = modelColors.find(c => (c.id || c.colorId) === detail.colorId);
    const promotion = promotions.find(p => p.promotionId === detail.promotionId);
    return { model, color, promotion };
  };

  // Step 1: Select Customer
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleNextToProducts = async () => {
    if (!selectedCustomer) {
      toast.error('Vui lòng chọn khách hàng');
      return;
    }

    try {
      // Create draft order
      const response = await createDraftOrder({ customerId: selectedCustomer.customerId }).unwrap();

      const newOrderId = response?.data?.orderId || response?.orderId;
      if (!newOrderId) {
        throw new Error('Không nhận được orderId từ server');
      }

      setOrderId(newOrderId);
      setCurrentStep(2);
      toast.success('Đã tạo đơn hàng nháp');
    } catch (error) {
      console.error('Error creating draft order:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    }
  };

  // Step 2: Add Products - SAVE TO LOCAL STATE ONLY
  const handleAddProduct = () => {
    if (!currentProduct.modelId || !currentProduct.colorId) {
      toast.error('Vui lòng chọn mẫu xe và màu sắc');
      return;
    }

    if (!stockInfo || !stockInfo.available) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    if (currentProduct.quantity > stockInfo.quantity) {
      toast.error(`Chỉ còn ${stockInfo.quantity} sản phẩm trong kho`);
      return;
    }

    // Validate promotion if selected (promotionType can be null, so we just check if promotion exists)
    if (currentProduct.promotionId && currentProduct.promotionId !== 0) {
      const selectedPromotion = promotions.find(p => p.promotionId === currentProduct.promotionId);
      if (!selectedPromotion) {
        toast.error('Khuyến mãi được chọn không hợp lệ. Vui lòng chọn lại khuyến mãi.');
        return;
      }
    }

    // Check if product with same model and color already exists
    const existingProductIndex = orderDetails.findIndex(
      item => item.modelId === currentProduct.modelId && item.colorId === currentProduct.colorId
    );

    if (existingProductIndex !== -1) {
      // Product exists, check if we can increase quantity
      const existingProduct = orderDetails[existingProductIndex];
      const newTotalQuantity = existingProduct.quantity + currentProduct.quantity;

      if (newTotalQuantity > stockInfo.quantity) {
        toast.error(`Không đủ hàng trong kho. Hiện có ${stockInfo.quantity} xe, bạn đã chọn ${existingProduct.quantity} xe`);
        return;
      }

      // Increase quantity
      const updatedOrderDetails = [...orderDetails];
      updatedOrderDetails[existingProductIndex] = {
        ...updatedOrderDetails[existingProductIndex],
        quantity: newTotalQuantity
      };
      setOrderDetails(updatedOrderDetails);
      toast.success(`Đã tăng số lượng sản phẩm (${newTotalQuantity} xe)`);
    } else {
      // Product doesn't exist, add new product
      // Tìm giá tại cửa hàng từ storeStocks
      const storeStock = storeStocks.find(s =>
        s.modelId === currentProduct.modelId &&
        (s.colorId === currentProduct.colorId || s.color?.id === currentProduct.colorId || s.color?.colorId === currentProduct.colorId)
      );
      const storePrice = storeStock?.priceOfStore || selectedColor?.price || 0;

      const newProduct = {
        ...currentProduct,
        modelName: selectedModel?.modelName,
        colorName: selectedColor?.colorName || selectedColor?.name,
        price: storePrice
      };
      setOrderDetails([...orderDetails, newProduct]);
      toast.success('Đã thêm sản phẩm vào đơn');
    }

    // Reset current product
    setCurrentProduct({
      modelId: null,
      colorId: null,
      quantity: 1,
      promotionId: 0,
    });
    setStockInfo(null);
  };

  const handleRemoveProduct = (index) => {
    setOrderDetails(orderDetails.filter((_, i) => i !== index));
    toast.success('Đã xóa sản phẩm');
  };

  // Step 2 to Step 3: Call API create/quote or update quote
  const handleAddToOrder = async () => {
    if (orderDetails.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }

    // Validate and clean promotions before sending to API
    // Backend throws error if promotionType is null, so we need to filter those out
    let hasInvalidPromotions = false;
    const cleanedOrderDetails = orderDetails.map(item => {
      if (item.promotionId && item.promotionId !== 0) {
        // Try to find promotion in current list (for current model)
        const promotion = promotions.find(p => p.promotionId === item.promotionId);
        // If not found in current list, it might be from a different model
        if (!promotion) {
          hasInvalidPromotions = true;
          return { ...item, promotionId: 0 };
        }
        // Backend requires promotionType to be non-null, so filter out null promotionType
        if (!promotion.promotionType || promotion.promotionType === '') {
          hasInvalidPromotions = true;
          return { ...item, promotionId: 0 };
        }
        // Valid promotion with promotionType - keep it
        return item;
      }
      return item;
    });

    if (hasInvalidPromotions) {
      toast.warning('Một số khuyến mãi không hợp lệ (thiếu loại khuyến mãi) đã được xóa để tránh lỗi.');
    }

    try {
      // Prepare data for API - use cleaned order details
      const quoteData = {
        orderId,
        orderDetails: cleanedOrderDetails.map(item => ({
          modelId: item.modelId,
          colorId: item.colorId,
          quantity: item.quantity,
          promotionId: (item.promotionId && item.promotionId !== 0) ? item.promotionId : 0
        })),
        includeLicensePlateService: includeLicensePlate,
      };

      // Use updateQuote if in edit mode, otherwise createQuote
      let response;
      if (editMode) {
        response = await updateQuote(quoteData).unwrap();
        toast.success('Đã cập nhật báo giá đơn hàng');
      } else {
        response = await createQuote(quoteData).unwrap();
        toast.success('Đã tính giá đơn hàng');
      }

      // Store the pricing info from backend
      const summaryData = response?.data || response;
      setOrderSummary(summaryData);

      // Lưu orderCode nếu có trong response
      const responseOrderCode = summaryData?.orderCode;
      if (responseOrderCode) {
        setOrderCode(responseOrderCode);
      }

      setCurrentStep(3);
    } catch (error) {
      console.error('Error creating quote:', error);
      const errorMessage = error?.data?.message || error?.message || 'Có lỗi xảy ra khi tính giá';

      // Check if error is about existing order details
      if (errorMessage.includes('order details') || errorMessage.includes('Order details')) {
        // Delete old draft order and create new one
        try {
          if (orderId) {
            await deleteOrder(orderId).unwrap();
          }

          // Create new draft order with same customer
          if (selectedCustomer?.customerId) {
            const newDraftResponse = await createDraftOrder({ customerId: selectedCustomer.customerId }).unwrap();
            const newOrderId = newDraftResponse?.data?.orderId || newDraftResponse?.orderId;

            if (newOrderId) {
              setOrderId(newOrderId);

              // Retry creating quote with new orderId
              const retryQuoteData = {
                orderId: newOrderId,
                orderDetails: orderDetails.map(item => ({
                  modelId: item.modelId,
                  colorId: item.colorId,
                  quantity: item.quantity,
                  promotionId: item.promotionId || 0
                })),
                includeLicensePlateService: includeLicensePlate,
              };

              const retryResponse = await createQuote(retryQuoteData).unwrap();
              setOrderSummary(retryResponse?.data || retryResponse);
              setCurrentStep(3);
              toast.success('Đã tính giá đơn hàng');
            } else {
              throw new Error('Không thể tạo đơn hàng mới');
            }
          } else {
            throw new Error('Không tìm thấy thông tin khách hàng');
          }
        } catch (retryError) {
          console.error('Error retrying quote creation:', retryError);
          toast.error(retryError?.data?.message || 'Có lỗi xảy ra khi tạo lại báo giá');
        }
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // Step 3: Confirm Order
  const handleConfirmOrder = async () => {
    try {
      const response = await confirmOrder(orderId).unwrap();
      // Lưu orderCode từ response
      const confirmedOrderCode = response?.data?.orderCode || response?.orderCode;
      if (confirmedOrderCode) {
        setOrderCode(confirmedOrderCode);
      }
      setCurrentStep(4);
      toast.success('Đã xác nhận đơn hàng thành công!');
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi xác nhận đơn hàng');
    }
  };

  const handleCreateQuoteHtml = () => {
    if (!orderDetailsData?.data || orderDetailsData.data.length === 0) {
      toast.error('Không có dữ liệu báo giá');
      return;
    }

    // Get store info - prioritize storeId from order, then fallback to storeName
    let store = null;
    const storeNameToFind = orderSummary?.storeName || user?.storeName;

    if (storesData?.data && Array.isArray(storesData.data)) {
      // Try by storeName
      if (storeNameToFind) {
        store = storesData.data.find(s => s.storeName === storeNameToFind);
      }
    }

    // Transform order details to match template format
    const transformedOrderDetails = orderDetailsData.data.map(detail => ({
      modelName: detail.modelName,
      colorName: detail.colorName,
      quantity: detail.quantity,
      unitPrice: detail.unitPrice,
      licensePlateFee: detail.licensePlateFee || 0,
      serviceFee: detail.serviceFee || 0,
      otherTax: detail.otherTax || 0,
      otherFees: detail.otherFees || 0,
      registrationFee: (detail.serviceFee || 0) + (detail.otherTax || 0) + (detail.otherFees || 0), // Keep for backward compatibility if needed
      promotionName: detail.promotionName,
      discountAmount: detail.discountAmount || 0,
      totalPrice: detail.totalPrice,
    }));

    // Create order summary object for template
    const orderForTemplate = {
      orderCode: orderCode || orderId,
      storeName: storeNameToFind,
      getOrderDetailsResponses: transformedOrderDetails,
      totalPrice: calculatedTotals?.totalPrice || 0,
      totalLicensePlateFee: calculatedTotals?.totalLicensePlateFee || 0,
      totalServiceFee: calculatedTotals?.totalServiceFee || 0,
      totalOtherTax: calculatedTotals?.totalOtherTax || 0,
      totalOtherFees: calculatedTotals?.totalOtherFees || 0,
      totalRegistrationFee: (calculatedTotals?.totalServiceFee || 0) + (calculatedTotals?.totalOtherTax || 0) + (calculatedTotals?.totalOtherFees || 0), // Keep for backward compatibility
      totalPromotionAmount: calculatedTotals?.totalPromotionAmount || 0,
      totalPayment: calculatedTotals?.totalPayment || 0,
    };

    // Debug log in development
    if (import.meta.env.DEV) {
      console.log('Store lookup:', {
        storeNameToFind,
        storeFound: !!store,
        storeAddress: store?.address,
        storePhone: store?.phone,
        orderForTemplate: orderForTemplate,
      });
    }

    const htmlContent = generateQuoteHtml(orderForTemplate, selectedCustomer, user, store);

    // Open new window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setHasPrintedQuote(true);
    } else {
      toast.error('Trình duyệt đã chặn cửa sổ bật lên. Vui lòng cho phép để xem báo giá.');
    }
  };

  const handleDeleteQuote = () => {
    // Xóa báo giá và quay lại step 2 để chỉnh sửa
    setOrderSummary(null);
    setHasPrintedQuote(false);
    setCurrentStep(2);
    toast.success('Đã xóa báo giá, bạn có thể chỉnh sửa lại sản phẩm');
  };

  const handleBack = () => {
    if (currentStep > 1 && currentStep < 4) {
      // If going back from step 3 to step 2, clear orderSummary (quote data)
      if (currentStep === 3) {
        setOrderSummary(null);
      }
      // If going back from step 2 to step 1, clear all local state
      if (currentStep === 2) {
        setOrderDetails([]);
        setSelectedCustomer(null);
        setOrderId(null);
        setOrderCode(null);
        setCurrentProduct({
          modelId: null,
          colorId: null,
          quantity: 1,
          promotionId: 0,
        });
        setIncludeLicensePlate(false);
        setStockInfo(null);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleViewOrder = () => {
    navigate(`/dealer-staff/orders`);
  };

  const handleCreateContract = async () => {
    if (!orderId) {
      toast.error('Không tìm thấy đơn hàng');
      return;
    }

    try {
      const response = await createContract({ orderId }).unwrap();
      const contractData = response?.data || response;
      const contractId = contractData?.contractId;

      if (contractId) {
        // toast.success(contractData?.message || 'Đã tạo hợp đồng thành công!'); // Disabled
        // Navigate to contracts page with contractId for highlighting
        navigate('/dealer-staff/contracts', {
          state: {
            highlightContractId: contractId,
            newContract: true
          }
        });
      } else {
        throw new Error('Không nhận được contractId từ server');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo hợp đồng');
    }
  };

  const handleCreateNewOrder = () => {
    // Reset all state
    setCurrentStep(1);
    setOrderId(null);
    setOrderCode(null);
    setSelectedCustomer(null);
    setOrderDetails([]);
    setCurrentProduct({
      modelId: null,
      colorId: null,
      quantity: 1,
      promotionId: 0,
    });
    setIncludeLicensePlate(false);
    setOrderSummary(null);
    setStockInfo(null);
    setCustomerPage(1);
  };

  const isAddProductDisabled = !currentProduct.modelId || !currentProduct.colorId || !stockInfo || !stockInfo.available;

  return (
    <DealerStaffLayout
      title="Tạo Đơn Hàng Mới"
      description="Tạo đơn hàng cho khách hàng theo quy trình 4 bước"
    >
      <div className="mx-auto max-w-[90rem] px-0 py-4 pl-10 pr-10 pt-8 space-y-4">

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={STEPS} currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Steps */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* STEP 1: SELECT CUSTOMER WITH PAGINATION */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-slate-900 text-xl font-bold pb-4 border-b border-slate-200">
                    Chọn khách hàng
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    {/* Search Bar */}
                    <div className="flex-grow">
                      <div className="flex w-full items-stretch rounded-lg h-12">
                        <div className="text-slate-500 flex bg-slate-100 items-center justify-center pl-4 rounded-l-lg">
                          <Search size={20} />
                        </div>
                        <input
                          className="form-input flex w-full min-w-0 flex-1 rounded-r-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-slate-100 h-full placeholder:text-slate-500 px-4 text-sm"
                          placeholder="Tìm kiếm theo tên, SĐT, email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    {/* Create New Button */}
                    <button
                      onClick={() => navigate('/dealer-staff/customers')}
                      className="flex items-center justify-center gap-2 h-12 px-6 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      <Plus size={20} />
                      <span>Tạo Khách Hàng</span>
                    </button>
                  </div>

                  {/* Customer List */}
                  <div className="mt-6 space-y-3">
                    {loadingCustomers ? (
                      <SkeletonList items={5} />
                    ) : paginatedCustomers.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        Không tìm thấy khách hàng
                      </div>
                    ) : (
                      paginatedCustomers.map((customer) => (
                        <motion.div
                          key={customer.customerId}
                          onClick={() => handleCustomerSelect(customer)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={cn(
                            "flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all",
                            selectedCustomer?.customerId === customer.customerId
                              ? 'border-blue-600 bg-blue-50 shadow-md'
                              : 'border-slate-200 hover:border-blue-300'
                          )}
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 truncate">
                              {customer.fullName}
                            </p>
                            <p className="text-sm text-slate-500 truncate">
                              {customer.phone} {customer.email && `• ${customer.email}`}
                            </p>
                          </div>
                          {selectedCustomer?.customerId === customer.customerId && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-blue-600 flex-shrink-0"
                            >
                              <CheckCircle size={24} />
                            </motion.div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {totalCustomerPages > 1 && (
                    <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                      <p className="text-sm text-slate-600">
                        Hiển thị {((customerPage - 1) * customersPerPage) + 1} - {Math.min(customerPage * customersPerPage, filteredCustomers.length)} trong số {filteredCustomers.length} khách hàng
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCustomerPage(p => Math.max(1, p - 1))}
                          disabled={customerPage === 1}
                          className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium">
                          {customerPage} / {totalCustomerPages}
                        </span>
                        <button
                          onClick={() => setCustomerPage(p => Math.min(totalCustomerPages, p + 1))}
                          disabled={customerPage === totalCustomerPages}
                          className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: ADD PRODUCTS */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Loading state for edit mode */}
                  {editMode && (loadingExistingOrder || loadingExistingQuote) && (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">Đang tải dữ liệu đơn hàng...</p>
                      </div>
                    </div>
                  )}

                  {/* Show content when not loading or not in edit mode */}
                  {(!editMode || (!loadingExistingOrder && !loadingExistingQuote)) && (
                    <>
                      {/* Product Form */}
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-slate-900 text-xl font-bold pb-4 border-b border-slate-200">
                          {editMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm vào đơn'}
                        </h2>

                        <div className="mt-6 space-y-4">
                          {/* First Row: Model and Color */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Model Selection */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Mẫu xe <span className="text-red-500">*</span>
                              </label>
                              <select
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={currentProduct.modelId || ''}
                                onChange={(e) => {
                                  setCurrentProduct({
                                    ...currentProduct,
                                    modelId: parseInt(e.target.value) || null,
                                    colorId: null,
                                    promotionId: 0, // Reset promotion when model changes
                                  });
                                }}
                              >
                                <option value="">-- Chọn mẫu xe --</option>
                                {availableModels.map((model) => (
                                  <option key={model.modelId} value={model.modelId}>
                                    {model.modelName}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Color Selection */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Màu sắc <span className="text-red-500">*</span>
                              </label>
                              {!currentProduct.modelId ? (
                                <div className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 text-center">
                                  Chọn mẫu xe trước
                                </div>
                              ) : availableColors.length === 0 ? (
                                <div className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 text-center">
                                  Không có màu nào
                                </div>
                              ) : (
                                <select
                                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  value={currentProduct.colorId || ''}
                                  onChange={(e) => {
                                    setCurrentProduct({ ...currentProduct, colorId: parseInt(e.target.value) || null });
                                  }}
                                >
                                  <option value="">-- Chọn màu sắc --</option>
                                  {availableColors.map((color) => {
                                    const colorId = color.id || color.colorId;
                                    // Tìm giá tại cửa hàng từ storeStocks
                                    const storeStock = storeStocks.find(s =>
                                      s.modelId === currentProduct.modelId &&
                                      (s.colorId === colorId || s.color?.id === colorId || s.color?.colorId === colorId)
                                    );
                                    const storePrice = storeStock?.priceOfStore || color.price || 0;
                                    return (
                                      <option key={colorId} value={colorId}>
                                        {color.colorName || color.name} - {formatCurrency(storePrice)}
                                      </option>
                                    );
                                  })}
                                </select>
                              )}
                            </div>
                          </div>

                          {/* Second Row: Quantity and Promotion */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Quantity */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Số lượng <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                max={stockInfo?.quantity || 999}
                                value={currentProduct.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  // If stock info is available, clamp the value
                                  if (stockInfo) {
                                    if (val > stockInfo.quantity) {
                                      setCurrentProduct({ ...currentProduct, quantity: stockInfo.quantity });
                                      toast.warning(`Chỉ còn ${stockInfo.quantity} xe có sẵn`);
                                    } else {
                                      setCurrentProduct({ ...currentProduct, quantity: Math.max(1, val) });
                                    }
                                  } else {
                                    setCurrentProduct({ ...currentProduct, quantity: Math.max(1, val) });
                                  }
                                }}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                            </div>

                            {/* Promotion (Optional) */}
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Khuyến mãi (tùy chọn)
                              </label>
                              {loadingPromotions ? (
                                <div className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-500 text-center">
                                  Đang tải khuyến mãi...
                                </div>
                              ) : availablePromotions.length === 0 ? (
                                <select
                                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  value={currentProduct.promotionId || 0}
                                  onChange={(e) => setCurrentProduct({ ...currentProduct, promotionId: parseInt(e.target.value) || 0 })}
                                >
                                  <option value={0}>-- Không có khuyến mãi --</option>
                                </select>
                              ) : (
                                <select
                                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  value={currentProduct.promotionId || 0}
                                  onChange={(e) => setCurrentProduct({ ...currentProduct, promotionId: parseInt(e.target.value) || 0 })}
                                >
                                  <option value={0}>-- Không áp dụng khuyến mãi --</option>
                                  {availablePromotions.map((promo) => {
                                    // Infer promotionType from amount if null
                                    // If amount <= 100, treat as percentage; otherwise as fixed amount
                                    const isPercentage = promo.promotionType === 'PERCENTAGE' ||
                                      (promo.promotionType == null && promo.amount <= 100);
                                    const discountText = isPercentage
                                      ? `${promo.amount}%`
                                      : formatCurrency(promo.amount);
                                    // Show model name if available to help user identify which model the promotion is for
                                    const modelInfo = promo.modelName ? ` (${promo.modelName})` : '';
                                    return (
                                      <option key={promo.promotionId} value={promo.promotionId}>
                                        {promo.promotionName}{modelInfo} - {discountText}
                                      </option>
                                    );
                                  })}
                                </select>
                              )}
                            </div>
                          </div>

                          {/* License Plate Service */}
                          <div className="mt-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={includeLicensePlate}
                                onChange={(e) => setIncludeLicensePlate(e.target.checked)}
                                className="w-4 h-4 text-primary bg-white border-slate-300 rounded focus:ring-primary/50 focus:ring-2"
                              />
                              <span className="text-sm font-medium text-slate-700">
                                Bao gồm dịch vụ đăng ký biển số
                              </span>

                            </label>
                            <p className="text-xs text-slate-400 mt-1 ml-7">
                              Dịch vụ hỗ trợ làm thủ tục đăng ký biển số xe
                            </p>
                          </div>

                          {/* Stock Info */}
                          {stockInfo && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                "flex flex-col gap-2 p-3 rounded-lg",
                                stockInfo.available
                                  ? "bg-green-50 text-green-800"
                                  : "bg-red-50 text-red-800"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {stockInfo.available ? (
                                  <>
                                    <CheckCircle size={20} />
                                    <span className="text-sm font-medium">
                                      Có sẵn: {stockInfo.quantity} xe
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle size={20} />
                                    <span className="text-sm font-medium">
                                      Hết hàng có sẵn
                                    </span>
                                  </>
                                )}
                              </div>


                            </motion.div>
                          )}


                          {/* Add Product Button */}
                          <button
                            onClick={handleAddProduct}
                            disabled={isAddProductDisabled}
                            className={cn(
                              "w-full px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2",
                              isAddProductDisabled
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                                : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                            )}
                          >
                            <Plus size={20} />
                            Thêm vào đơn hàng
                          </button>
                        </div>
                      </div>

                      {/* License Plate Service */}

                    </>
                  )}
                </motion.div>
              )}

              {/* STEP 3: REVIEW ORDER */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-slate-900 text-xl font-bold pb-4 border-b border-slate-200">
                    Xác nhận đơn hàng
                  </h2>

                  <div className="mt-6 space-y-6">
                    {/* Customer Info */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-600 mb-2">
                        Thông tin khách hàng
                      </h3>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="font-semibold text-slate-900">
                          {selectedCustomer?.fullName}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {selectedCustomer?.phone} {selectedCustomer?.email && `• ${selectedCustomer.email}`}
                        </p>
                        {selectedCustomer?.address && (
                          <p className="text-sm text-slate-600 mt-1">
                            {selectedCustomer.address}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Products from API Response */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-600 mb-2">
                        Sản phẩm đã chọn
                      </h3>
                      {loadingOrderDetails ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-slate-600">Đang tải chi tiết đơn hàng...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {orderDetailsData?.data?.map((detail, index) => (
                            <div key={detail.orderDetailId || index} className="p-4 bg-slate-50 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {detail.modelName}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    Màu: {detail.colorName} • Số lượng: {detail.quantity}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    Đơn giá: {formatCurrency(detail.unitPrice)}
                                  </p>
                                  {detail.licensePlateFee > 0 && (
                                    <p className="text-sm text-slate-600">
                                      Phí biển số: {formatCurrency(detail.licensePlateFee)}
                                    </p>
                                  )}
                                  {detail.serviceFee > 0 && (
                                    <p className="text-sm text-slate-600">
                                      Phí dịch vụ: {formatCurrency(detail.serviceFee)}
                                    </p>
                                  )}
                                  {detail.otherTax > 0 && (
                                    <p className="text-sm text-slate-600">
                                      Thuế khác: {formatCurrency(detail.otherTax)}
                                    </p>
                                  )}
                                  {detail.otherFees > 0 && (
                                    <p className="text-sm text-slate-600">
                                      Phí khác: {formatCurrency(detail.otherFees)}
                                    </p>
                                  )}
                                  {detail.promotionName && (
                                    <p className="text-sm text-green-600">
                                      Khuyến mãi: {detail.promotionName} (-{formatCurrency(detail.discountAmount)})
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-slate-900">
                                    {formatCurrency(detail.totalPrice)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!orderDetailsData?.data || orderDetailsData.data.length === 0) && (
                            <div className="text-center py-8 text-slate-500">
                              Không có sản phẩm nào
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}

              {/* STEP 4: COMPLETE */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white p-8 rounded-xl shadow-sm text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
                  >
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Đơn hàng đã được tạo thành công!
                  </h2>
                  <p className="text-slate-600 mb-8">
                    Mã đơn hàng: <span className="font-semibold">#{orderCode || orderId}</span>
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleViewOrder} variant="outline">
                      Xem đơn hàng
                    </Button>

                    <Button onClick={handleCreateNewOrder} variant="outline">
                      Tạo đơn mới
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm sticky top-8">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="text-primary" size={20} />
                <h3 className="text-base font-bold text-slate-900">
                  Tóm tắt đơn hàng
                </h3>
              </div>

              <div className="space-y-3">
                {/* Customer */}
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">
                    Khách hàng
                  </p>
                  <p className="font-medium text-slate-900">
                    {selectedCustomer?.fullName || 'Chưa chọn'}
                  </p>
                </div>

                {/* Products Count */}
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">
                    Số sản phẩm
                  </p>
                  <p className="font-medium text-slate-900">
                    {currentStep === 3 && orderDetailsData?.data
                      ? orderDetailsData.data.length
                      : orderDetails.length} sản phẩm
                  </p>
                </div>

                {/* Pricing - CHỈ hiển thị khi ở step 3 */}
                {currentStep === 3 && calculatedTotals && (
                  <>
                    <div className="border-t border-slate-200 pt-3">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">
                        Tổng thanh toán
                      </h4>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Tổng tiền hàng:</span>
                          <span className="font-medium">{formatCurrency(calculatedTotals.totalPrice)}</span>
                        </div>
                        {calculatedTotals.totalLicensePlateFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tổng phí biển số:</span>
                            <span className="font-medium">{formatCurrency(calculatedTotals.totalLicensePlateFee)}</span>
                          </div>
                        )}
                        {calculatedTotals.totalServiceFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tổng phí dịch vụ:</span>
                            <span className="font-medium">{formatCurrency(calculatedTotals.totalServiceFee)}</span>
                          </div>
                        )}
                        {calculatedTotals.totalOtherTax > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tổng thuế khác:</span>
                            <span className="font-medium">{formatCurrency(calculatedTotals.totalOtherTax)}</span>
                          </div>
                        )}
                        {calculatedTotals.totalOtherFees > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tổng phí khác:</span>
                            <span className="font-medium">{formatCurrency(calculatedTotals.totalOtherFees)}</span>
                          </div>
                        )}
                        {calculatedTotals.totalPromotionAmount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Tổng giảm giá:</span>
                            <span className="font-medium">-{formatCurrency(calculatedTotals.totalPromotionAmount)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-sm">
                          TỔNG THANH TOÁN:
                        </span>
                        <span className="font-bold text-primary text-lg">
                          {formatCurrency(calculatedTotals.totalPayment)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons in Sidebar */}
                {currentStep === 1 && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <button
                      onClick={handleNextToProducts}
                      disabled={!selectedCustomer || creatingOrder}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg font-semibold transition-colors",
                        !selectedCustomer || creatingOrder
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                          : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      )}
                    >
                      {creatingOrder ? 'Đang xử lý...' : 'Tiếp tục'}
                    </button>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <button
                      onClick={handleAddToOrder}
                      disabled={orderDetails.length === 0 || creatingQuote || updatingQuote}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg font-semibold transition-colors",
                        orderDetails.length === 0 || creatingQuote || updatingQuote
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                          : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      )}
                    >
                      {creatingQuote || updatingQuote ? 'Đang xử lý...' : (editMode ? 'Cập nhật báo giá' : 'Tạo báo giá')}
                    </button>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col gap-2">
                    <button
                      onClick={handleCreateQuoteHtml}
                      className="w-full px-4 py-3 rounded-lg font-semibold transition-colors bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2"
                    >
                      <FileText size={20} />
                      In báo giá
                    </button>
                    <button
                      onClick={handleDeleteQuote}
                      className="w-full px-4 py-3 rounded-lg font-semibold transition-colors bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 size={20} />
                      Xóa báo giá
                    </button>
                    <button
                      onClick={handleConfirmOrder}
                      disabled={confirmingOrder || !hasPrintedQuote}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg font-semibold transition-colors",
                        confirmingOrder || !hasPrintedQuote
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                          : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      )}
                      title={!hasPrintedQuote ? "Vui lòng in báo giá trước khi xác nhận" : ""}
                    >
                      {confirmingOrder ? 'Đang xác nhận...' : 'Xác nhận đơn hàng'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Added Products List - Below Sidebar */}
            {currentStep === 2 && orderDetails.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">
                    Sản phẩm đã thêm ({orderDetails.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {orderDetails.map((detail, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          {detail.modelName}
                        </p>
                        <p className="text-sm text-slate-600">
                          Màu: {detail.colorName} • SL: {detail.quantity}
                          {detail.price && ` • ${formatCurrency(detail.price)}`}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {currentStep === 2 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <Button
              onClick={handleBack}
              variant="outline"
            >
              Quay lại
            </Button>
          </div>
        )}
      </div>
    </DealerStaffLayout>
  );
};

export default CreateOrderPage;
