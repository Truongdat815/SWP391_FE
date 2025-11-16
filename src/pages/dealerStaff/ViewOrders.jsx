import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  fetchOrders,
  fetchOrdersByStatus,
  fetchOrdersByDateRange,
  updateOrderStatusById, 
  deleteOrderById,
  confirmOrderThunk
} from '../../store/slices/orderSlice';
import { fetchAllContractsThunk, createContractFromOrderThunk } from '../../store/slices/contractSlice';
import { getOrderById } from '../../api/orderService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Eye, 
  Trash2, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  X,
  Package,
  Calendar,
  Filter,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  ShoppingBag,
  Building2,
  UserCircle,
  Receipt,
  Tag,
  CreditCard,
  Plus,
  FileText
} from 'lucide-react';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import StatusBadge from '../../components/ui/StatusBadge';
import ModernButton from '../../components/ui/ModernButton';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

// Helper function to aggregate order details with same modelId and colorId
const aggregateOrderDetails = (details) => {
  if (!details || details.length === 0) return [];
  
  console.log('🔍 Raw order details from backend:', details);
  
  const aggregatedMap = new Map();
  
  details.forEach((detail, index) => {
    // Ensure we have valid modelId and colorId - try multiple field name variations
    const modelId = String(detail.modelId || detail.model_id || detail.modelId || '');
    const colorId = String(detail.colorId || detail.color_id || detail.colorId || '');
    const key = `${modelId}-${colorId}`;
    
    console.log(`  Detail ${index}:`, {
      modelId,
      colorId,
      quantity: detail.quantity,
      totalPrice: detail.totalPrice || detail.total_price,
      unitPrice: detail.unitPrice || detail.unit_price,
      key
    });
    
    // Skip if missing required fields
    if (!modelId || !colorId || modelId === 'undefined' || colorId === 'undefined' || key === '-') {
      console.warn('⚠️ Skipping detail with invalid modelId/colorId:', detail);
      return;
    }
    
    if (aggregatedMap.has(key)) {
      // Aggregate with existing detail
      const existing = aggregatedMap.get(key);
      const newQuantity = (existing.quantity || 0) + (detail.quantity || 0);
      const unitPrice = existing.unitPrice || detail.unitPrice || detail.unit_price || 0;
      
      console.log(`  Aggregating: existing qty=${existing.quantity}, new qty=${detail.quantity}, total=${newQuantity}`);
      
      // Aggregate VAT (should be proportional to quantity)
      const newVatAmount = (existing.vatAmount || existing.vat_amount || 0) + (detail.vatAmount || detail.vat_amount || 0);
      
      // Aggregate discount (should be proportional to quantity)
      const newDiscountAmount = (existing.discountAmount || existing.discount_amount || 0) + (detail.discountAmount || detail.discount_amount || 0);
      
      // Fees should NOT be multiplied - take from first detail only (fees are per order, not per item)
      // Use the first detail's fees (existing), don't add from the new detail
      const licensePlateFee = existing.licensePlateFee || existing.license_plate_fee || 0;
      const registrationFee = existing.registrationFee || existing.registration_fee || 0;
      
      // Recalculate totalPrice from scratch to ensure it matches quantity=2 scenario:
      // totalPrice = (unitPrice * newQuantity) + VAT + fees - discount
      const subtotal = unitPrice * newQuantity;
      const newTotalPrice = subtotal + newVatAmount + licensePlateFee + registrationFee - newDiscountAmount;
      
      console.log(`  Recalculated: unitPrice=${unitPrice}, qty=${newQuantity}, subtotal=${subtotal}, VAT=${newVatAmount}, fees=${licensePlateFee + registrationFee}, discount=${newDiscountAmount}, totalPrice=${newTotalPrice}`);
      
      aggregatedMap.set(key, {
        ...existing,
        quantity: newQuantity,
        unitPrice: unitPrice,
        vatAmount: newVatAmount,
        discountAmount: newDiscountAmount,
        licensePlateFee: licensePlateFee, // Keep from first, don't sum
        registrationFee: registrationFee, // Keep from first, don't sum
        totalPrice: newTotalPrice // Recalculated to match quantity=2 scenario
      });
    } else {
      // First occurrence - keep as is, but normalize field names
      aggregatedMap.set(key, {
        ...detail,
        quantity: detail.quantity || 0,
        unitPrice: detail.unitPrice || detail.unit_price || 0,
        vatAmount: detail.vatAmount || detail.vat_amount || 0,
        discountAmount: detail.discountAmount || detail.discount_amount || 0,
        licensePlateFee: detail.licensePlateFee || detail.license_plate_fee || 0,
        registrationFee: detail.registrationFee || detail.registration_fee || 0,
        totalPrice: detail.totalPrice || detail.total_price || 0,
        modelId: modelId,
        colorId: colorId
      });
    }
  });
  
  const result = Array.from(aggregatedMap.values());
  console.log('✅ Aggregated result:', result);
  return result;
};

function ViewOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Modern UI hooks
  const { toast, success, error: showError, hideToast } = useToast();
  const { confirm, showConfirm } = useConfirm();
  
  // Redux state
  const { orders: reduxOrders, loading, error } = useSelector((state) => state.orders);
  const { selectedOrderDetails: reduxOrderDetails, loading: detailsLoading } = useSelector((state) => state.orderDetails);
  const { contracts } = useSelector((state) => state.contracts);
  
  // Local state
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [ordersWithContracts, setOrdersWithContracts] = useState({}); // Map orderId -> contract
  const [creatingContract, setCreatingContract] = useState(null);
  // Thêm state và hàm sort
  const [sortMode, setSortMode] = useState('newest'); // 'newest' | 'oldest'
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortOrders = (arr, mode = 'newest') => {
    const getTime = (o) => new Date(o.orderDate || 0).getTime();
    const getId = (o) => Number(o.orderId || 0);
    const getName = (o) => (o.customerName || '').toLowerCase();
    const getStatus = (o) => (o.status || '').toUpperCase();
    const byNewest = (a, b) => (getTime(b) - getTime(a)) || (getId(b) - getId(a));
    const byOldest = (a, b) => (getTime(a) - getTime(b)) || (getId(a) - getId(b));
    const byNameAsc = (a, b) => getName(a).localeCompare(getName(b), 'vi');
    const byNameDesc = (a, b) => getName(b).localeCompare(getName(a), 'vi');
    const byStatusAsc = (a, b) => getStatus(a).localeCompare(getStatus(b));
    const byStatusDesc = (a, b) => getStatus(b).localeCompare(getStatus(a));
    const copy = [...arr];
    switch (mode) {
      case 'oldest': return copy.sort(byOldest);
      case 'name-asc': return copy.sort(byNameAsc);
      case 'name-desc': return copy.sort(byNameDesc);
      case 'status-asc': return copy.sort(byStatusAsc);
      case 'status-desc': return copy.sort(byStatusDesc);
      case 'newest':
      default: return copy.sort(byNewest);
    }
  };

  // Show success message from location state and reload orders
  useEffect(() => {
    if (location.state?.message) {
      success(location.state.message);
      
      // If coming from create/edit order, force reload orders after short delay
      if (location.state?.newOrderId || location.state?.success) {
        console.log('Force reloading orders after create/update...');
        setTimeout(() => {
          dispatch(fetchOrders());
        }, 300);
      }
      
      // Clear the location state
      window.history.replaceState({}, document.title);
    }
  }, [location, dispatch]);

  // Fetch contracts on mount
  useEffect(() => {
    dispatch(fetchAllContractsThunk());
  }, [dispatch]);

  // Map contracts to orders
  useEffect(() => {
    if (contracts && contracts.length > 0) {
      const contractMap = {};
      contracts.forEach(contract => {
        if (contract.orderId) {
          contractMap[contract.orderId] = contract;
        }
      });
      setOrdersWithContracts(contractMap);
    }
  }, [contracts]);

  // Fetch orders from API based on filters (server-side filtering)
  useEffect(() => {
    // Always fetch all orders, we'll do client-side sorting by status
    if (startDate && endDate) {
      dispatch(fetchOrdersByDateRange({ startDate, endDate }));
    } else {
      // Fetch all orders, we'll sort by status on client-side
      dispatch(fetchOrders());
    }
  }, [dispatch, startDate, endDate]);
  
  // Update local orders state when Redux orders change
  useEffect(() => {
    if (reduxOrders && Array.isArray(reduxOrders)) {
      setOrders(reduxOrders);
      setFilteredOrders(reduxOrders);
    }
  }, [reduxOrders]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowStatusDropdown(false);
        setShowSortDropdown(false);
      }
    };

    if (showStatusDropdown || showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showStatusDropdown, showSortDropdown]);

  // Update filtered orders when orders or search term changes (client-side search only)
  useEffect(() => {
    console.log('📦 Orders from Redux:', orders);
    console.log('📦 Is Array?', Array.isArray(orders));
    
    if (!orders) return;
    
    let filtered = Array.isArray(orders) ? [...orders] : [];
    
    // Show all orders except CANCELLED (including orders that have been converted to contracts)
    // This ensures orders remain visible even after being converted to contracts
    filtered = filtered.filter(order => {
      const status = order.status?.toUpperCase();
      // Include all statuses except CANCELLED to show orders even after contract creation
      return status !== 'CANCELLED';
    });
    
    console.log('📦 Filtered orders:', filtered);

    // Filter by search term (client-side)
    if (searchTerm) {
      filtered = filtered.filter(order => {
        const customerName = order.customerName || order.customer?.fullName || '';
        const orderId = (order.orderId || '').toString();
        const orderNumber = order.orderNumber || '';
        const orderCode = order.orderCode || '';
        const customerPhone = order.customerPhone || '';
        
        return (
          customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orderId.includes(searchTerm) ||
          orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customerPhone.includes(searchTerm)
        );
      });
    }

    // Sort orders: if statusFilter is selected, prioritize that status first
    let sorted = sortOrders(filtered, sortMode);
    
    // If a specific status is selected, sort to show that status first
    if (statusFilter !== 'all') {
      const selectedStatusUpper = statusFilter.toUpperCase();
      sorted = sorted.sort((a, b) => {
        const aStatus = (a.status || '').toUpperCase();
        const bStatus = (b.status || '').toUpperCase();
        
        // If both have the selected status, maintain current sort order
        if (aStatus === selectedStatusUpper && bStatus === selectedStatusUpper) {
          return 0;
        }
        // If only a has the selected status, a comes first
        if (aStatus === selectedStatusUpper) return -1;
        // If only b has the selected status, b comes first
        if (bStatus === selectedStatusUpper) return 1;
        // If neither has the selected status, maintain current sort order
        return 0;
      });
    }

    setFilteredOrders(sorted);
  }, [searchTerm, orders, sortMode, statusFilter]);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    if (!status) return status || 'N/A';
    // Return status in English as from API response
    return status.toUpperCase();
  };


  const handleViewDetails = async (order) => {
    setSelectedOrder(order);
    setShowModal(true);
    setLoadingDetails(true);
    
    console.log('📦 Loading details for order:', order.orderId);
    
    try {
      // Refresh order data to get latest info with product details
      console.log('🔄 Refreshing order data...');
      const orderResponse = await getOrderById(order.orderId);
      const latestOrder = orderResponse.data || orderResponse;
      console.log('✅ Latest order data:', latestOrder);
      setSelectedOrder(latestOrder);
      
      // Backend returns product details in 'getOrderDetailsResponses' array
      const orderDetails = latestOrder.getOrderDetailsResponses || [];
      
      if (orderDetails.length === 0) {
        console.log('ℹ️ Order has no products yet');
        setSelectedOrderDetails([]);
      } else {
        // Aggregate details with same modelId and colorId (in case quantity was increased)
        const aggregatedDetails = aggregateOrderDetails(orderDetails);
        console.log('✅ Found product details in order:', orderDetails);
        console.log('✅ Aggregated details:', aggregatedDetails);
        setSelectedOrderDetails(aggregatedDetails);
      }
    } catch (error) {
      console.error('⚠️ Error loading order:', error);
      setSelectedOrderDetails([]);
      // Still set order even if refresh fails
      setSelectedOrder(order);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setSelectedOrderDetails([]);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatusById({ orderId, status: newStatus })).unwrap();
      success(`Đã cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"!`);
      
      // Refresh orders list
      dispatch(fetchOrders());
    } catch (err) {
      console.error('Error updating order status:', err);
      showError('Không thể cập nhật trạng thái đơn hàng');
    }
  };

  const handleEditOrder = (orderId) => {
    navigate(`/dealer-staff/add-order-details/${orderId}`, {
      state: { 
        fromEdit: true  // Flag to indicate editing existing order
      }
    });
  };

  const handleDeleteOrder = async (orderId, orderStatus) => {
    // Chỉ cho phép xóa đơn hàng có trạng thái NHÁP hoặc ĐÃ XÁC NHẬN
    const status = orderStatus?.toUpperCase();
    if (status !== 'DRAFT' && status !== 'CONFIRMED') {
      showError('Chỉ có thể xóa đơn hàng có trạng thái "Nháp" hoặc "Đã xác nhận"');
      return;
    }
    
    const confirmed = await showConfirm({
      title: 'Xác nhận xóa đơn hàng',
      message: 'Bạn có chắc muốn xóa đơn hàng này? Thao tác này không thể hoàn tác!',
      type: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy'
    });
    
    if (!confirmed) return;
    
    try {
      // Dùng Redux thunk thay vì gọi trực tiếp API
      await dispatch(deleteOrderById(orderId)).unwrap();
      
      success('Đã xóa đơn hàng thành công!');
      
      // Refresh orders list từ server
      if (startDate && endDate) {
        dispatch(fetchOrdersByDateRange({ startDate, endDate }));
      } else if (statusFilter !== 'all') {
        dispatch(fetchOrdersByStatus(statusFilter));
      } else {
        dispatch(fetchOrders());
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      showError('Không thể xóa đơn hàng: ' + err);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    const confirmed = await showConfirm({
      title: 'Xác nhận đơn hàng',
      message: 'Xác nhận đơn hàng này? Đơn hàng sẽ chuyển từ DRAFT sang CONFIRMED.',
      type: 'info',
      confirmText: 'Xác nhận',
      cancelText: 'Hủy'
    });
    
    if (!confirmed) return;
    
    try {
      const confirmResponse = await dispatch(confirmOrderThunk(orderId)).unwrap();
      console.log('✅ Order confirmed successfully:', confirmResponse);
      
      // Extract response data
      const confirmData = confirmResponse.data || confirmResponse;
      
      // Build success message with order info
      const orderCode = confirmData.orderCode || `#${confirmData.orderId || orderId}`;
      const status = confirmData.status || 'CONFIRMED';
      
      success(`Đã xác nhận đơn hàng ${orderCode} thành công! Trạng thái: ${status}`);
      
      // Refresh orders list
      if (startDate && endDate) {
        dispatch(fetchOrdersByDateRange({ startDate, endDate }));
      } else if (statusFilter !== 'all') {
        dispatch(fetchOrdersByStatus(statusFilter));
      } else {
        dispatch(fetchOrders());
      }
    } catch (err) {
      console.error('Error confirming order:', err);
      showError('Không thể xác nhận đơn hàng: ' + (err.message || err));
    }
  };

  const handleCreateContract = async (order) => {
    if (!order) return;
    
    // Check if order already has contract
    const existingContract = ordersWithContracts[order.orderId];
    if (existingContract) {
      showError(`Đơn hàng ${order.orderCode || 'N/A'} đã có hợp đồng ${existingContract.contractCode || 'N/A'}. Vui lòng xem hợp đồng hiện tại.`);
      return;
    }
    
    // Check if order is CONFIRMED
    if (order.status?.toUpperCase() !== 'CONFIRMED') {
      showError('Chỉ có thể tạo hợp đồng cho đơn hàng đã xác nhận (CONFIRMED).');
      return;
    }

    try {
      setCreatingContract(order.orderId);
      
      // Create contract
      const result = await dispatch(createContractFromOrderThunk(order.orderId)).unwrap();
      
      // Show success message with both order code and contract code
      const contractCode = result.contractCode || result.data?.contractCode;
      success(`Đã tạo hợp đồng ${contractCode || 'N/A'} thành công cho đơn hàng ${order.orderCode || 'N/A'}!`);
      
      // Refresh contracts and orders
      await dispatch(fetchAllContractsThunk());
      if (startDate && endDate) {
        dispatch(fetchOrdersByDateRange({ startDate, endDate }));
      } else if (statusFilter !== 'all') {
        dispatch(fetchOrdersByStatus(statusFilter));
      } else {
        dispatch(fetchOrders());
      }
      
      // Close modal if open and navigate to contract management
      setTimeout(() => {
        if (showModal) {
          setShowModal(false);
        }
        navigate('/dealer-staff/contract-management');
      }, 1500);
      
    } catch (err) {
      console.error('Error creating contract:', err);
      showError('Không thể tạo hợp đồng: ' + (err.message || err));
    } finally {
      setCreatingContract(null);
    }
  };

  return (
    <div className="w-full">
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

      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Quản lý đơn hàng</h2>
            <p className="text-gray-600 mt-0.5 text-xs">Danh sách các đơn hàng đã tạo</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
            <span className="text-gray-600 text-sm">Đang tải danh sách đơn hàng...</span>
          </div>
        )}

        {/* Filters */}
        {!loading && (
          <div className="space-y-2 mb-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên khách hàng, mã đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              {/* Status Filter Dropdown */}
              <div className="sm:w-48 relative dropdown-container">
                <motion.button
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowSortDropdown(false);
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-left flex items-center justify-between transition-all text-sm"
                >
                  <span className="text-gray-700 text-sm">
                    {statusFilter === 'all' ? 'Tất cả trạng thái' :
                     statusFilter === 'draft' ? 'DRAFT' :
                     statusFilter === 'approved' ? 'APPROVED' :
                     statusFilter === 'pending' ? 'PENDING' :
                     statusFilter === 'confirmed' ? 'CONFIRMED' :
                     statusFilter === 'processing' ? 'PROCESSING' :
                     statusFilter === 'completed' ? 'COMPLETED' :
                     statusFilter === 'cancelled' ? 'CANCELLED' : 'Tất cả trạng thái'}
                  </span>
                  <motion.svg
                    animate={{ rotate: showStatusDropdown ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>
                
                <AnimatePresence>
                  {showStatusDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ 
                        duration: 0.2,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden z-50 origin-top"
                    >
                      <div className="py-1 max-h-60 overflow-y-auto">
                        {[
                          { value: 'all', label: 'Tất cả trạng thái' },
                          { value: 'draft', label: 'DRAFT' },
                          { value: 'approved', label: 'APPROVED' },
                          { value: 'pending', label: 'PENDING' },
                          { value: 'confirmed', label: 'CONFIRMED' },
                          { value: 'processing', label: 'PROCESSING' },
                          { value: 'completed', label: 'COMPLETED' },
                          { value: 'cancelled', label: 'CANCELLED' }
                        ].map((option, index) => (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.2 }}
                            onClick={() => {
                              setStatusFilter(option.value);
                              setShowStatusDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-emerald-50 transition-colors ${
                              statusFilter === option.value 
                                ? 'bg-emerald-50 text-emerald-700 font-medium' 
                                : 'text-gray-700'
                            }`}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort Dropdown */}
              <div className="sm:w-60 relative dropdown-container">
                <motion.button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowStatusDropdown(false);
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-left flex items-center justify-between transition-all text-sm"
                >
                  <span className="text-gray-700 text-sm">
                    {sortMode === 'newest' ? 'Đơn hàng mới nhất' :
                     sortMode === 'oldest' ? 'Đơn hàng cũ nhất' : 'Đơn hàng mới nhất'}
                  </span>
                  <motion.svg
                    animate={{ rotate: showSortDropdown ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>
                
                <AnimatePresence>
                  {showSortDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ 
                        duration: 0.2,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden z-50 origin-top"
                    >
                      <div className="py-1">
                        {[
                          { value: 'newest', label: 'Đơn hàng mới nhất' },
                          { value: 'oldest', label: 'Đơn hàng cũ nhất' }
                        ].map((option, index) => (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.2 }}
                            onClick={() => {
                              setSortMode(option.value);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-emerald-50 transition-colors ${
                              sortMode === option.value 
                                ? 'bg-emerald-50 text-emerald-700 font-medium' 
                                : 'text-gray-700'
                            }`}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.button
                onClick={() => setShowDateFilter(!showDateFilter)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`sm:w-auto px-3 py-1.5 border rounded-lg transition-all flex items-center justify-center font-medium text-sm ${
                  showDateFilter 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <motion.div
                  animate={{ rotate: showDateFilter ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Calendar className="h-4 w-4 mr-1.5" />
                </motion.div>
                Lọc theo ngày
              </motion.button>
            </div>

            {/* Date Range Filter */}
            <AnimatePresence>
              {showDateFilter && (
                <motion.div
                  initial={{ opacity: 0, maxHeight: 0, y: -10 }}
                  animate={{ 
                    opacity: 1, 
                    maxHeight: 200,
                    y: 0
                  }}
                  exit={{ 
                    opacity: 0, 
                    maxHeight: 0, 
                    y: -10
                  }}
                  transition={{ 
                    opacity: { duration: 0.2 },
                    maxHeight: { 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 40,
                      mass: 0.5
                    },
                    y: { 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 40,
                      mass: 0.5
                    }
                  }}
                  style={{ 
                    overflow: 'hidden',
                    willChange: 'transform, opacity, max-height'
                  }}
                  className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
                >
                  <motion.div 
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ delay: 0.1, duration: 0.25, ease: "easeOut" }}
                    className="flex-1"
                  >
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Từ ngày
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        onKeyDown={(e) => e.preventDefault()}
                        className={`w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-shadow text-sm ${
                          startDate 
                            ? 'text-gray-900 [&::-webkit-datetime-edit-text]:opacity-100 [&::-webkit-datetime-edit-month-field]:opacity-100 [&::-webkit-datetime-edit-day-field]:opacity-100 [&::-webkit-datetime-edit-year-field]:opacity-100' 
                            : '[&::-webkit-datetime-edit-text]:opacity-0 [&::-webkit-datetime-edit-month-field]:opacity-0 [&::-webkit-datetime-edit-day-field]:opacity-0 [&::-webkit-datetime-edit-year-field]:opacity-0'
                        }`}
                        style={{ 
                          color: startDate ? '#111827' : 'transparent',
                          position: 'relative'
                        }}
                      />
                      {!startDate && (
                        <div className="absolute inset-0 flex items-center pointer-events-none px-2.5 text-gray-400 text-sm">
                          dd/mm/yyyy
                        </div>
                      )}
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ delay: 0.15, duration: 0.25, ease: "easeOut" }}
                    className="flex-1"
                  >
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Đến ngày
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        onKeyDown={(e) => e.preventDefault()}
                        className={`w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-shadow text-sm ${
                          endDate 
                            ? 'text-gray-900 [&::-webkit-datetime-edit-text]:opacity-100 [&::-webkit-datetime-edit-month-field]:opacity-100 [&::-webkit-datetime-edit-day-field]:opacity-100 [&::-webkit-datetime-edit-year-field]:opacity-100' 
                            : '[&::-webkit-datetime-edit-text]:opacity-0 [&::-webkit-datetime-edit-month-field]:opacity-0 [&::-webkit-datetime-edit-day-field]:opacity-0 [&::-webkit-datetime-edit-year-field]:opacity-0'
                        }`}
                        style={{ 
                          color: endDate ? '#111827' : 'transparent',
                          position: 'relative'
                        }}
                      />
                      {!endDate && (
                        <div className="absolute inset-0 flex items-center pointer-events-none px-2.5 text-gray-400 text-sm">
                          dd/mm/yyyy
                        </div>
                      )}
                    </div>
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ delay: 0.2, duration: 0.25, ease: "easeOut" }}
                    className="flex items-end gap-2"
                  >
                    <motion.button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                    >
                      Xóa bộ lọc
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Orders Table */}
        {!loading && filteredOrders.length === 0 ? (
          <div className="text-center py-6">
            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đơn hàng nào</h3>
            <p className="mt-1 text-xs text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Không tìm thấy đơn hàng phù hợp với bộ lọc.' 
                : 'Chưa có đơn hàng nào được tạo.'}
            </p>
          </div>
        ) : !loading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Hợp đồng
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderCode || 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.customerPhone || 'N/A'}</div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {(() => {
                        const contract = ordersWithContracts[order.orderId];
                        if (contract) {
                          return (
                            <button
                              onClick={() => navigate('/dealer-staff/contract-management')}
                              className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Đã có
                            </button>
                          );
                        } else if (order.status?.toUpperCase() === 'CONFIRMED') {
                          return (
                            <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-800">
                              Chưa có
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-400">
                              -
                            </span>
                          );
                        }
                      })()}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900">
                      {(order.totalPayment || order.totalPrice || 0).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-emerald-600 hover:text-emerald-900 transition-colors flex items-center text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Chi tiết
                        </button>
                        
                        {/* Nút Xác nhận đơn hàng - chỉ hiện khi đơn hàng DRAFT */}
                        {order.status?.toUpperCase() === 'DRAFT' && (
                          <button
                            onClick={() => handleConfirmOrder(order.orderId)}
                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Xác nhận
                          </button>
                        )}
                        
                        {/* Nút Tạo hợp đồng - chỉ hiện khi đơn hàng CONFIRMED và chưa có hợp đồng */}
                        {order.status?.toUpperCase() === 'CONFIRMED' && !ordersWithContracts[order.orderId] && (
                          <button
                            onClick={() => handleCreateContract(order)}
                            disabled={creatingContract === order.orderId}
                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            title="Tạo hợp đồng"
                          >
                            {creatingContract === order.orderId ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Đang tạo...
                              </>
                            ) : (
                              <>
                                <FileText className="h-3 w-3 mr-1" />
                                Tạo hợp đồng
                              </>
                            )}
                          </button>
                        )}
                        
                        {/* Nút Xem hợp đồng - khi đã có hợp đồng */}
                        {order.status?.toUpperCase() === 'CONFIRMED' && ordersWithContracts[order.orderId] && (
                          <button
                            onClick={() => navigate('/dealer-staff/contract-management')}
                            className="text-green-600 hover:text-green-900 transition-colors flex items-center text-xs"
                            title="Xem hợp đồng"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Xem hợp đồng
                          </button>
                        )}
                        
                        {/* Nút Xóa đơn hàng - chỉ hiện khi đơn hàng có trạng thái DRAFT hoặc CONFIRMED */}
                        {(order.status?.toUpperCase() === 'DRAFT' || order.status?.toUpperCase() === 'CONFIRMED') && (
                          <button
                            onClick={() => handleDeleteOrder(order.orderId, order.status)}
                            className="text-red-600 hover:text-red-900 transition-colors flex items-center text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Order Details */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-7xl p-4 border shadow-lg rounded-lg bg-white max-h-[95vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Receipt className="h-6 w-6 text-emerald-600" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Chi tiết đơn hàng
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <span className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      Mã: <span className="font-semibold ml-1">{selectedOrder.orderCode || 'N/A'}</span>
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Three Column Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Customer Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <h4 className="font-bold text-blue-900 text-sm">Thông tin khách hàng</h4>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-start">
                        <UserCircle className="h-3 w-3 text-blue-600 mr-1.5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-blue-700">Tên khách hàng</p>
                          <p className="text-xs font-semibold text-blue-900">{selectedOrder.customerName || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Phone className="h-3 w-3 text-blue-600 mr-1.5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-blue-700">Số điện thoại</p>
                          <p className="text-xs font-semibold text-blue-900">{selectedOrder.customerPhone || 'N/A'}</p>
                        </div>
                      </div>
                      {selectedOrder.customerEmail && (
                        <div className="flex items-start">
                          <Mail className="h-3 w-3 text-blue-600 mr-1.5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-blue-700">Email</p>
                            <p className="text-xs font-semibold text-blue-900 break-all">{selectedOrder.customerEmail}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Staff & Store Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      <h4 className="font-bold text-purple-900 text-sm">Nhân viên & Cửa hàng</h4>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-start">
                        <UserCircle className="h-3 w-3 text-purple-600 mr-1.5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-purple-700">Nhân viên phụ trách</p>
                          <p className="text-xs font-semibold text-purple-900">{selectedOrder.staffName || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Building2 className="h-3 w-3 text-purple-600 mr-1.5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-purple-700">Cửa hàng</p>
                          <p className="text-xs font-semibold text-purple-900">{selectedOrder.storeName || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                      <h4 className="font-bold text-emerald-900 text-sm">Tổng quan tài chính</h4>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-emerald-700">Tổng giá sản phẩm:</span>
                        <span className="text-xs font-semibold text-emerald-900">
                          {(selectedOrder.totalPrice || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-emerald-700">Phí dịch vụ và biển số:</span>
                        <span className="text-xs font-semibold text-orange-600">
                          +{(selectedOrder.totalTaxPrice || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-emerald-700">Khuyến mãi:</span>
                        <span className="text-xs font-semibold text-red-600">
                          -{(selectedOrder.totalPromotionAmount || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="pt-1.5 border-t-2 border-emerald-300">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-emerald-900">Tổng thanh toán:</span>
                          <span className="text-base font-bold text-emerald-600">
                            {(selectedOrder.totalPayment || 0).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5">
                    <h4 className="font-bold text-white flex items-center text-sm">
                      <ShoppingBag className="h-4 w-4 mr-1.5" />
                      Chi tiết sản phẩm
                    </h4>
                  </div>
                  
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                      <span className="text-gray-600 font-medium text-sm">Đang tải chi tiết sản phẩm...</span>
                    </div>
                  ) : selectedOrderDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Sản phẩm
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Số lượng
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Đơn giá
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Phí đăng ký
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Phí biển số
                            </th>
                            {selectedOrderDetails.some(item => item.promotionName) && (
                              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Khuyến mãi
                              </th>
                            )}
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Giảm giá
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Thành tiền
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {selectedOrderDetails.map((item, index) => (
                            <tr key={index} className="hover:bg-emerald-50 transition-colors">
                              <td className="px-3 py-2">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 flex-shrink-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
                                    <Package className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 text-sm">{item.modelName || 'N/A'}</div>
                                    <div className="text-xs text-gray-500 flex items-center">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {item.colorName || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold">
                                  {item.quantity || 0}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right text-xs font-semibold text-gray-900">
                                {(item.unitPrice || 0).toLocaleString('vi-VN')}đ
                              </td>
                              <td className="px-3 py-2 text-right text-xs text-gray-600">
                                {(item.registrationFee || 0).toLocaleString('vi-VN')}đ
                              </td>
                              <td className="px-3 py-2 text-right text-xs text-gray-600">
                                {(item.licensePlateFee || 0).toLocaleString('vi-VN')}đ
                              </td>
                              {selectedOrderDetails.some(i => i.promotionName) && (
                                <td className="px-3 py-2 text-right text-xs">
                                  {item.promotionName ? (
                                    <span className="inline-flex items-center px-2 py-0.5 bg-pink-100 text-pink-800 rounded-md">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {item.promotionName}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              )}
                              <td className="px-3 py-2 text-right text-xs text-red-600 font-semibold">
                                {(item.discountAmount || 0) > 0 ? `-${(item.discountAmount || 0).toLocaleString('vi-VN')}đ` : '-'}
                              </td>
                              <td className="px-3 py-2 text-right text-sm font-bold text-emerald-600">
                                {(item.totalPrice || 0).toLocaleString('vi-VN')}đ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-base font-semibold text-gray-900 mb-1.5">Chưa có sản phẩm</h4>
                      <p className="text-gray-500 mb-3 text-sm">Đơn hàng này chưa có sản phẩm nào</p>
                      {selectedOrder.status?.toUpperCase() === 'DRAFT' && (
                        <button
                          onClick={() => {
                            handleEditOrder(selectedOrder.orderId);
                            handleCloseModal();
                          }}
                          className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
                        >
                          <Plus className="h-4 w-4 mr-1.5" />
                          Thêm sản phẩm ngay
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Contract Section */}
                {selectedOrder && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Receipt className="h-4 w-4 text-purple-600" />
                      <h4 className="font-bold text-purple-900 text-sm">Thông tin hợp đồng</h4>
                    </div>
                    {(() => {
                      const contract = ordersWithContracts[selectedOrder.orderId];
                      if (contract) {
                        return (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-purple-700">Trạng thái:</span>
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Đã có hợp đồng
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-purple-700">Mã hợp đồng:</span>
                              <span className="text-xs font-semibold text-purple-900">
                                {contract.contractCode || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-purple-700">Đã upload chữ ký:</span>
                              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md ${
                                contract.signedContractFileUrl || contract.contractFileUrl
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {contract.signedContractFileUrl || contract.contractFileUrl ? (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Đã upload
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Chưa upload
                                  </>
                                )}
                              </span>
                            </div>
                            <motion.button
                              onClick={() => {
                                handleCloseModal();
                                navigate('/dealer-staff/contract-management');
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full mt-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-semibold text-sm"
                            >
                              <Receipt className="h-3 w-3 mr-1.5" />
                              Xem hợp đồng
                            </motion.button>
                          </div>
                        );
                      } else if (selectedOrder.status?.toUpperCase() === 'CONFIRMED') {
                        return (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-purple-700">Trạng thái:</span>
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-800">
                                Chưa có hợp đồng
                              </span>
                            </div>
                            <p className="text-xs text-purple-700">
                              Đơn hàng đã xác nhận. Bạn có thể tạo hợp đồng ngay bây giờ.
                            </p>
                            <motion.button
                              onClick={() => handleCreateContract(selectedOrder)}
                              disabled={creatingContract === selectedOrder.orderId}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-sm"
                            >
                              {creatingContract === selectedOrder.orderId ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                  Đang tạo...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3 mr-1.5" />
                                  Tạo hợp đồng
                                </>
                              )}
                            </motion.button>
                          </div>
                        );
                      } else {
                        return (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-purple-700">Trạng thái:</span>
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-400">
                                Chưa thể tạo
                              </span>
                            </div>
                            <p className="text-xs text-purple-600">
                              Vui lòng xác nhận đơn hàng trước khi tạo hợp đồng.
                            </p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  {/* Status Actions - LEFT SIDE */}
                  <div className="flex gap-2">
                    {selectedOrder?.status?.toUpperCase() === 'DRAFT' && (
                      <motion.button
                        onClick={() => {
                          handleConfirmOrder(selectedOrder.orderId);
                          handleCloseModal();
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center font-semibold text-sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Xác nhận đơn hàng
                      </motion.button>
                    )}
                  </div>
                  
                  {/* General Actions - RIGHT SIDE */}
                  <div className="flex space-x-3">
                    <motion.button
                      onClick={handleCloseModal}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      Đóng
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewOrders;