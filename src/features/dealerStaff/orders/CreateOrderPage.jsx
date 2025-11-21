import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, CheckCircle, Trash2, ShoppingCart, CheckCircle2, ArrowRight, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
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
import { useGetAllStoreStocksQuery } from '../../../api/admin/storeStockApi';
import { useCreateDraftOrderMutation, useConfirmOrderMutation, useDeleteOrderMutation, useGetOrderByIdQuery } from '../../../api/dealerStaff/orderApi';
import { useCreateQuoteMutation, useGetQuoteByOrderIdQuery, useUpdateQuoteMutation } from '../../../api/dealerStaff/quotationApi';
import { useCreateContractMutation } from '../../../api/dealerStaff/contractApi';
import { formatCurrency } from '../../../utils/formatters';

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
  const { data: promotionsData } = useGetAllPromotionsQuery();
  const { data: storeStocksData } = useGetAllStoreStocksQuery();
  
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
  
  // Load existing quote data if in edit mode - DISABLED since order data contains everything
  // const { data: existingQuoteData, isLoading: loadingExistingQuote } = useGetQuoteByOrderIdQuery(
  //   existingOrderId,
  //   { skip: !editMode || !existingOrderId }
  // );
  
  // Use order data directly since it contains all quote information
  const existingQuoteData = editMode && location.state?.orderData ? {
    data: location.state.orderData
  } : null;
  const loadingExistingQuote = false;

  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  const models = Array.isArray(modelsData?.data) ? modelsData.data : [];
  const modelColors = Array.isArray(modelColorsData?.data) ? modelColorsData.data : [];
  const promotions = Array.isArray(promotionsData?.data) ? promotionsData.data : [];
  const storeStocks = Array.isArray(storeStocksData?.data) ? storeStocksData.data : [];

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
        const loadedOrderDetails = orderData.getOrderDetailsResponses.map(detail => ({
          modelId: detail.modelId,
          colorId: detail.colorId,
          quantity: detail.quantity,
          promotionId: detail.promotionId || 0,
          modelName: detail.modelName,
          colorName: detail.colorName,
          price: detail.unitPrice
        }));
        setOrderDetails(loadedOrderDetails);
      }
      
      // Set license plate service
      const hasLicensePlate = orderData.getOrderDetailsResponses?.some(detail => detail.licensePlateFee > 0) || false;
      setIncludeLicensePlate(hasLicensePlate);
      
     
    }
  }, [editMode, location.state?.orderData, customers]);
  
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

  // Get available colors for selected model
  const availableColors = useMemo(() => {
    if (!currentProduct.modelId) return [];
    return modelColors.filter(mc => mc.modelId === currentProduct.modelId);
  }, [currentProduct.modelId, modelColors]);

  // Get available promotions (filter active only)
  const availablePromotions = useMemo(() => {
    return promotions.filter(p => p.status === 'ACTIVE' || p.isActive);
  }, [promotions]);

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
      setStockInfo({
        available: stock.quantity > 0,
        quantity: stock.quantity || 0
      });
    } else {
      setStockInfo({
        available: false,
        quantity: 0
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
      const newProduct = {
        ...currentProduct,
        modelName: selectedModel?.modelName,
        colorName: selectedColor?.colorName || selectedColor?.name,
        price: selectedColor?.price
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

    try {
      // Prepare data for API
      const quoteData = {
        orderId,
        orderDetails: orderDetails.map(item => ({
          modelId: item.modelId,
          colorId: item.colorId,
          quantity: item.quantity,
          promotionId: item.promotionId || 0
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
      setOrderSummary(response?.data || response);
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
      await confirmOrder(orderId).unwrap();
      setCurrentStep(4);
      toast.success('Đã xác nhận đơn hàng thành công!');
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi xác nhận đơn hàng');
    }
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
        toast.success(contractData?.message || 'Đã tạo hợp đồng thành công!');
        // Navigate to contracts page with contractId
        navigate(`/dealer-staff/contracts?contractId=${contractId}`);
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
                            });
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

                      {/* Color Selection */}
                      {currentProduct.modelId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Màu sắc <span className="text-red-500">*</span>
                          </label>
                          {availableColors.length === 0 ? (
                            <div className="text-center py-4 text-slate-500">
                              Không có màu nào cho mẫu xe này
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3">
                              {availableColors.map((color) => {
                                const colorId = color.id || color.colorId;
                                const isSelected = currentProduct.colorId === colorId;
                                return (
                                  <motion.div
                                    key={colorId}
                                    onClick={() => {
                                      setCurrentProduct({ ...currentProduct, colorId: colorId });
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                      "p-4 border-2 rounded-lg cursor-pointer transition-all",
                                      isSelected
                                        ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
                                        : 'border-slate-200 hover:border-blue-300'
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className="w-10 h-10 rounded-full border-2 border-slate-300 flex-shrink-0"
                                        style={{ backgroundColor: color.colorCode || color.hexCode || '#ccc' }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900">
                                          {color.colorName || color.name}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                          {formatCurrency(color.price)}
                                        </p>
                                      </div>
                                      {isSelected && (
                                        <CheckCircle className="text-blue-600 flex-shrink-0" size={20} />
                                      )}
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Stock Info */}
                      {stockInfo && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg",
                            stockInfo.available
                              ? "bg-green-50 text-green-800"
                              : "bg-red-50 text-red-800"
                          )}
                        >
                          {stockInfo.available ? (
                            <>
                              <CheckCircle size={20} />
                              <span className="text-sm font-medium">
                                Còn hàng: {stockInfo.quantity} sản phẩm
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={20} />
                              <span className="text-sm font-medium">
                                Hết hàng
                              </span>
                            </>
                          )}
                        </motion.div>
                      )}

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
                          onChange={(e) => setCurrentProduct({ ...currentProduct, quantity: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>

                      {/* Promotion (Optional) */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Khuyến mãi (tùy chọn)
                        </label>
                        <select
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          value={currentProduct.promotionId || 0}
                          onChange={(e) => setCurrentProduct({ ...currentProduct, promotionId: parseInt(e.target.value) || 0 })}
                        >
                          <option value={0}>-- Không áp dụng khuyến mãi --</option>
                          {availablePromotions.map((promo) => (
                            <option key={promo.promotionId} value={promo.promotionId}>
                              {promo.promotionName || promo.name} - {promo.discountPercentage}%
                            </option>
                          ))}
                        </select>
                      </div>

                      
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

                  {/* Added Products List */}
                  {orderDetails.length > 0 && (
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

                      {/* License Plate Service */}
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeLicensePlate}
                            onChange={(e) => setIncludeLicensePlate(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            Bao gồm dịch vụ đăng ký biển số
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
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
                      <div className="space-y-2">
                        {orderSummary?.getOrderDetailsResponses?.map((detail, index) => (
                          <div key={index} className="p-4 bg-slate-50 rounded-lg">
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
                                {detail.registrationFee > 0 && (
                                  <p className="text-sm text-slate-600">
                                    Phí đăng ký: {formatCurrency(detail.registrationFee)}
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
                      </div>
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
                    Mã đơn hàng: <span className="font-semibold">#{orderId}</span>
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleViewOrder} variant="outline">
                      Xem đơn hàng
                    </Button>
                    <Button onClick={handleCreateContract}>
                      <ArrowRight size={20} className="mr-2" />
                      Tạo hợp đồng
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
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-8">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="text-primary" size={24} />
                <h3 className="text-lg font-bold text-slate-900">
                  Tóm tắt đơn hàng
                </h3>
              </div>
              
              <div className="space-y-4">
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
                    {orderDetails.length} sản phẩm
                  </p>
                </div>

                {/* Pricing - CHỈ hiển thị khi ở step 3 */}
                {currentStep === 3 && orderSummary && (
                  <>
                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">
                        Tổng thanh toán
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Tổng tiền hàng:</span>
                          <span className="font-medium">{formatCurrency(orderSummary.totalPrice)}</span>
                        </div>
                        {orderSummary.totalLicensePlateFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tổng phí biển số:</span>
                            <span className="font-medium">{formatCurrency(orderSummary.totalLicensePlateFee)}</span>
                          </div>
                        )}
                        {orderSummary.totalRegistrationFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Tổng phí đăng ký:</span>
                            <span className="font-medium">{formatCurrency(orderSummary.totalRegistrationFee)}</span>
                          </div>
                        )}
                        {orderSummary.totalPromotionAmount > 0 && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Tổng giảm giá:</span>
                            <span className="font-medium">-{formatCurrency(orderSummary.totalPromotionAmount)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-base">
                          TỔNG THANH TOÁN:
                        </span>
                        <span className="font-bold text-primary text-xl">
                          {formatCurrency(orderSummary.totalPayment)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons in Sidebar */}
                {currentStep === 1 && (
                  <div className="mt-6 pt-4 border-t border-slate-200">
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
                  <div className="mt-6 pt-4 border-t border-slate-200">
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
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <button
                      onClick={handleConfirmOrder}
                      disabled={confirmingOrder}
                      className={cn(
                        "w-full px-4 py-3 rounded-lg font-semibold transition-colors",
                        confirmingOrder
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                          : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      )}
                    >
                      {confirmingOrder ? 'Đang xác nhận...' : 'Xác nhận đơn hàng'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {currentStep < 4 && currentStep > 1 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <Button
              onClick={handleBack}
              disabled={currentStep === 1}
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
