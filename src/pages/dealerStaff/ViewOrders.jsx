import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { getContractById } from '../../api/contractService';
import { getAllPayments, filterPaymentsByContract } from '../../api/paymentService';
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
import Pagination from '../../components/ui/Pagination';
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

function ViewOrders({ defaultStatusFilter = 'all', activeTab = 'all', ordersWithContracts: parentOrdersWithContracts = {}, readOnly = false }) {
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
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [ordersWithContracts, setOrdersWithContracts] = useState({}); // Map orderId -> contract
  const [creatingContract, setCreatingContract] = useState(null);
  const [showContractImageModal, setShowContractImageModal] = useState(false);
  const [contractImage, setContractImage] = useState(null);
  const [loadingContractImage, setLoadingContractImage] = useState(false);
  const [contractInfo, setContractInfo] = useState(null);
  const [allPayments, setAllPayments] = useState([]);
  // Sort mode - always newest (auto sorted)
  const sortMode = 'newest';
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
  const locationStateRef = React.useRef(null);
  
  useEffect(() => {
    // Only process if location state has actually changed
    if (location.state && location.state !== locationStateRef.current) {
      locationStateRef.current = location.state;
      
      if (location.state.message) {
        success(location.state.message);
      }
      
      // If coming from create/edit order, force reload orders after short delay
      if (location.state.newOrderId || location.state.success) {
        console.log('Force reloading orders after create/update...');
        setTimeout(() => {
          // Always fetch all orders after create/update to ensure fresh data
          // The date filter will be reapplied automatically by the filter effect
          dispatch(fetchOrders());
        }, 300);
      }
      
      // Clear the location state immediately to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch]); // Only depend on location state

  // Use ref to prevent duplicate API calls for contracts
  const hasFetchedContractsRef = useRef(false);
  const hasFetchedPaymentsRef = useRef(false);

  // Fetch contracts on mount
  useEffect(() => {
    // Only fetch once
    if (hasFetchedContractsRef.current) {
      return;
    }
    
    hasFetchedContractsRef.current = true;
    dispatch(fetchAllContractsThunk());
  }, [dispatch]);

  // Fetch payments on mount
  useEffect(() => {
    // Only fetch once
    if (hasFetchedPaymentsRef.current) {
      return;
    }
    
    hasFetchedPaymentsRef.current = true;
    const fetchPayments = async () => {
      try {
        const response = await getAllPayments();
        const paymentsData = Array.isArray(response) ? response : (response?.data || []);
        setAllPayments(paymentsData);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };
    fetchPayments();
  }, []);

  // Map contracts to orders - use parent prop if available, otherwise use Redux
  useEffect(() => {
    if (Object.keys(parentOrdersWithContracts).length > 0) {
      setOrdersWithContracts(parentOrdersWithContracts);
    } else if (contracts && contracts.length > 0) {
      const contractMap = {};
      contracts.forEach(contract => {
        if (contract.orderId) {
          contractMap[contract.orderId] = contract;
        }
      });
      setOrdersWithContracts(contractMap);
    }
  }, [contracts, parentOrdersWithContracts]);

  // Initial fetch: only fetch once on mount
  const hasInitialFetchRef = React.useRef(false);
  
  useEffect(() => {
    // Fetch once on mount
    if (!hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;
      dispatch(fetchOrders());
    }
  }, [dispatch]); // Only run once on mount
  
  // Fetch orders when date filter changes
  const prevDateFilterRef = React.useRef({ startDate: '', endDate: '' });
  
  useEffect(() => {
    const prevFilter = prevDateFilterRef.current;
    const hasDateFilter = startDate && endDate;
    const hadDateFilter = prevFilter.startDate && prevFilter.endDate;
    
    // Skip if dates haven't actually changed
    if (prevFilter.startDate === startDate && prevFilter.endDate === endDate) {
      return;
    }
    
    // If date filter was cleared, fetch all orders
    if (hadDateFilter && !hasDateFilter) {
      dispatch(fetchOrders());
    }
    // If date filter is set (and changed), fetch with filter
    else if (hasDateFilter) {
      dispatch(fetchOrdersByDateRange({ startDate, endDate }));
    }
    
    // Update ref for next comparison
    prevDateFilterRef.current = { startDate, endDate };
  }, [dispatch, startDate, endDate]); // Only react to date filter changes
  
  // Update local orders state when Redux orders change
  // Use useMemo to prevent unnecessary updates
  useEffect(() => {
    if (reduxOrders && Array.isArray(reduxOrders)) {
      // Only update if orders actually changed to prevent unnecessary re-renders
      const ordersArray = reduxOrders;
      setOrders(ordersArray);
      // Don't update filteredOrders here, let the filtering effect handle it
    } else if (!reduxOrders || !Array.isArray(reduxOrders)) {
      setOrders([]);
    }
  }, [reduxOrders]);


  // Update status filter when prop changes (from parent tab change)
  useEffect(() => {
    setStatusFilter(defaultStatusFilter);
  }, [defaultStatusFilter]);

  // Helper function to check if order is fully paid
  const isOrderFullyPaid = useCallback((order) => {
    // Check if order has FULLY_PAID status
    const orderStatus = (order.status || '').toUpperCase();
    if (orderStatus === 'FULLY_PAID') {
      return true;
    }

    // Check payment status through contract
    const contract = ordersWithContracts[order.orderId];
    if (!contract) {
      return false; // No contract means no payment yet
    }

    // Calculate paid amount from payments
    const contractPayments = filterPaymentsByContract(
      allPayments,
      contract.contractId,
      contract.contractCode
    );

    // Sum only completed payments
    const paidAmount = contractPayments
      .filter(payment => payment.status === 'COMPLETED' || payment.status === 'SUCCESS' || payment.status === 'PAID')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Get total payment amount
    const totalPayment = contract.totalPayment || order.totalPayment || order.totalPrice || 0;

    // Check if fully paid (with small tolerance for floating point errors)
    return paidAmount >= totalPayment - 0.01;
  }, [ordersWithContracts, allPayments]);

  // Update filtered orders when orders or search term changes (client-side search only)
  // Memoize the filtering logic to prevent unnecessary recalculations
  useEffect(() => {
    if (!orders || orders.length === 0) {
      setFilteredOrders([]);
      return;
    }
    
    let filtered = Array.isArray(orders) ? [...orders] : [];
    
    // If activeTab is 'cancelled', show only CANCELLED orders
    // If activeTab is 'completed', show only fully paid orders
    // Otherwise, exclude CANCELLED by default (unless 'all' tab)
    if (activeTab === 'cancelled') {
      filtered = filtered.filter(order => {
        const status = (order.status || '').toUpperCase();
        return status === 'CANCELLED';
      });
    } else if (activeTab === 'completed') {
      // Only show orders that are fully paid
      filtered = filtered.filter(order => {
        return isOrderFullyPaid(order);
      });
    } else {
      // Show all orders except CANCELLED (including orders that have been converted to contracts)
      // This ensures orders remain visible even after being converted to contracts
      filtered = filtered.filter(order => {
        const status = (order.status || '').toUpperCase();
        // Include all statuses except CANCELLED to show orders even after contract creation
        return status !== 'CANCELLED';
      });
    }

    // Filter by search term (client-side)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        const customerName = order.customerName || order.customer?.fullName || '';
        const orderId = (order.orderId || '').toString();
        const orderNumber = order.orderNumber || '';
        const orderCode = order.orderCode || '';
        const customerPhone = order.customerPhone || '';
        
        return (
          customerName.toLowerCase().includes(searchLower) ||
          orderId.includes(searchTerm) ||
          orderNumber.toLowerCase().includes(searchLower) ||
          orderCode.toLowerCase().includes(searchLower) ||
          customerPhone.includes(searchTerm)
        );
      });
    }

    // Sort orders: if statusFilter is selected, prioritize that status first
    let sorted = sortOrders(filtered, sortMode);
    
    // If a specific status is selected, filter by that status only (but not for 'completed' tab)
    if (statusFilter !== 'all' && activeTab !== 'cancelled' && activeTab !== 'completed') {
      const selectedStatusUpper = statusFilter.toUpperCase();
      // Filter by status - only show matching status
      sorted = sorted.filter(order => {
        const orderStatus = (order.status || '').toUpperCase();
        return orderStatus === selectedStatusUpper;
      });
    }

    setFilteredOrders(sorted);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [searchTerm, orders, sortMode, statusFilter, activeTab, isOrderFullyPaid]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    if (!status) return 'Không xác định';
    const upperStatus = status.toUpperCase();
    const statusMap = {
      'PENDING': 'Chờ xử lý',
      'DRAFT': 'Bản nháp',
      'ACCEPTED': 'Đã chấp nhận',
      'APPROVED': 'Đã duyệt',
      'CONFIRMED': 'Đã xác nhận',
      'CONTRACT_PENDING': 'Chờ ký hợp đồng',
      'CONTRACT_SIGNED': 'Đã ký hợp đồng',
      'FILE_UPLOADED': 'Đã upload',
      'PAYMENT_CONFIRMED': 'Đã thanh toán',
      'FULLY_PAID': 'Đã thanh toán đủ',
      'SHIPPING': 'Đang vận chuyển',
      'IN_TRANSIT': 'Đang vận chuyển',
      'COMPLETED': 'Đã hoàn thành',
      'DELIVERED': 'Đã giao hàng',
      'FINISH': 'Hoàn thành',
      'REJECTED': 'Đã từ chối',
      'CANCELLED': 'Đã hủy',
      'CANCELED': 'Đã hủy',
      'PROCESSING': 'Đang xử lý'
    };
    return statusMap[upperStatus] || status;
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
      
      // Show success message
      success(`Đã tạo hợp đồng thành công cho đơn hàng ${order.orderCode || 'N/A'}`);
      
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

  // Handle viewing contract image from order's urlContractFile (direct URL)
  const handleViewContractImageFromOrder = (imageUrl, order) => {
    try {
      setShowContractImageModal(true);
      setContractImage(imageUrl);
      
      // Set contract info from order
      const contract = ordersWithContracts[order.orderId];
      if (contract) {
        setContractInfo(contract);
      } else {
        // Create minimal contract info from order
        setContractInfo({
          contractCode: order.orderCode || order.orderId || 'N/A',
          orderCode: order.orderCode,
          customerName: order.customerName,
          contractDate: order.orderDate
        });
      }
    } catch (err) {
      console.error('Error displaying contract image:', err);
      showError('Không thể hiển thị ảnh hợp đồng');
      setShowContractImageModal(false);
    }
  };

  // Handle viewing contract image by calling API
  const handleViewContractImage = async (contractId) => {
    try {
      setLoadingContractImage(true);
      setShowContractImageModal(true);
      
      // Call API /api/contracts/{id} to get contract
      const contractData = await getContractById(contractId);
      
      // Extract contract info
      const contract = contractData?.data || contractData;
      setContractInfo(contract);
      
      // Get signed contract image URL
      const imageUrl = contract?.signedContractFileUrl || contract?.contractFileUrl;
      
      if (imageUrl) {
        setContractImage(imageUrl);
      } else {
        showError('Hợp đồng này chưa có ảnh đã ký');
        setShowContractImageModal(false);
      }
    } catch (err) {
      console.error('Error loading contract image:', err);
      showError('Không thể tải ảnh hợp đồng: ' + (err.message || err));
      setShowContractImageModal(false);
    } finally {
      setLoadingContractImage(false);
    }
  };

  const handleCloseContractImageModal = () => {
    setShowContractImageModal(false);
    setContractImage(null);
    setContractInfo(null);
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

      <div className="w-full">
        {/* Loading State - Only show on initial load */}
        {loading && (!reduxOrders || reduxOrders.length === 0) && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
            <span className="text-gray-600 text-sm">Đang tải danh sách đơn hàng...</span>
          </div>
        )}

        {/* Filters - Always show even when loading to prevent layout shift */}
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

        {/* Orders Table - Show skeleton during initial load */}
        {loading && (!reduxOrders || reduxOrders.length === 0) ? (
          <div className="py-6">
            <TableSkeleton rows={5} />
          </div>
        ) : filteredOrders.length === 0 ? (
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
        ) : (
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
                {paginatedOrders.map((order) => (
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
                    <td className="px-3 py-2.5 whitespace-nowrap text-center">
                      {(() => {
                        // Check if order has urlContractFile (from API response)
                        const hasUrlContractFile = order.urlContractFile && order.urlContractFile !== 'null' && order.urlContractFile.trim() !== '';
                        
                        // Check if contract exists and has signed image (fallback)
                        const contract = ordersWithContracts[order.orderId];
                        const hasContractImage = contract && (contract.signedContractFileUrl || contract.contractFileUrl);
                        
                        // Show button if order has urlContractFile or contract has image
                        if (hasUrlContractFile || hasContractImage) {
                          return (
                            <button
                              onClick={() => {
                                // If order has urlContractFile, use it directly; otherwise get from contract
                                if (hasUrlContractFile) {
                                  handleViewContractImageFromOrder(order.urlContractFile, order);
                                } else if (contract) {
                                  handleViewContractImage(contract.contractId);
                                }
                              }}
                              className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Đã có
                            </button>
                          );
                        } else {
                          // Show "-" centered if no contract image
                          return (
                            <span className="inline-block text-center text-xs font-semibold text-gray-400">
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
                        <motion.button
                          onClick={() => handleViewDetails(order)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-200"
                          title="Chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </motion.button>
                        
                        {!readOnly && (
                          <>
                            {/* Nút Xác nhận đơn hàng - chỉ hiện khi đơn hàng DRAFT */}
                            {order.status?.toUpperCase() === 'DRAFT' && (
                              <motion.button
                                onClick={() => handleConfirmOrder(order.orderId)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-200"
                                title="Xác nhận"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </motion.button>
                            )}
                            
                            {/* Nút Tạo hợp đồng - chỉ hiện khi đơn hàng CONFIRMED và chưa có hợp đồng */}
                            {order.status?.toUpperCase() === 'CONFIRMED' && !ordersWithContracts[order.orderId] && (
                              <motion.button
                                onClick={() => handleCreateContract(order)}
                                disabled={creatingContract === order.orderId}
                                whileHover={{ scale: creatingContract === order.orderId ? 1 : 1.1 }}
                                whileTap={{ scale: creatingContract === order.orderId ? 1 : 0.9 }}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Tạo hợp đồng"
                              >
                                {creatingContract === order.orderId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <FileText className="h-4 w-4" />
                                )}
                              </motion.button>
                            )}
                            
                            {/* Nút Xem hợp đồng - khi đã có hợp đồng */}
                            {order.status?.toUpperCase() === 'CONFIRMED' && ordersWithContracts[order.orderId] && (
                              <motion.button
                                onClick={() => navigate('/dealer-staff/contract-management')}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all border border-green-200"
                                title="Xem hợp đồng"
                              >
                                <FileText className="h-4 w-4" />
                              </motion.button>
                            )}
                            
                            {/* Nút Xóa đơn hàng - chỉ hiện khi đơn hàng có trạng thái DRAFT (bản nháp) */}
                            {order.status?.toUpperCase() === 'DRAFT' && (
                              <motion.button
                                onClick={() => handleDeleteOrder(order.orderId, order.status)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-200"
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {filteredOrders.length > 0 && !loading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredOrders.length}
            showInfo={true}
          />
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

      {/* Modal for Contract Signed Image */}
      <AnimatePresence>
        {showContractImageModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={handleCloseContractImageModal}
          >
            {loadingContractImage ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center bg-white rounded-lg p-8"
              >
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
                <span className="text-gray-600 font-medium">Đang tải ảnh hợp đồng...</span>
              </motion.div>
            ) : contractImage ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                onClick={(e) => e.stopPropagation()}
                className="relative inline-block max-w-[90vw] max-h-[90vh]"
              >
                {/* Close Button - positioned close to image */}
                <button
                  onClick={handleCloseContractImageModal}
                  className="absolute -top-2 -right-2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-all shadow-lg"
                >
                  <X className="h-5 w-5" />
                </button>
                
                {/* Image */}
                <img 
                  src={contractImage} 
                  alt="Hợp đồng đã ký"
                  className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    console.error('Error loading contract image:', e);
                    showError('Không thể tải ảnh hợp đồng. URL có thể không hợp lệ.');
                    setContractImage(null);
                  }}
                  onLoad={(e) => {
                    // Image loaded successfully
                    const img = e.target;
                    // Ensure image fits within viewport
                    const maxWidth = window.innerWidth * 0.9;
                    const maxHeight = window.innerHeight * 0.9;
                    
                    if (img.naturalWidth > maxWidth || img.naturalHeight > maxHeight) {
                      const ratio = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
                      img.style.maxWidth = `${img.naturalWidth * ratio}px`;
                      img.style.maxHeight = `${img.naturalHeight * ratio}px`;
                    }
                  }}
                />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col items-center justify-center bg-white rounded-lg p-12"
              >
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Không có ảnh hợp đồng</h4>
                <p className="text-sm text-gray-600 text-center max-w-md">
                  Hợp đồng này chưa có ảnh đã ký. Vui lòng upload ảnh hợp đồng đã ký trước khi xem.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewOrders;