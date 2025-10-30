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
import { getOrderById } from '../../api/orderService';
import Tooltip from '@/components/ui/Tooltip';
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
  FilePlus
} from 'lucide-react';

function ViewOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redux state
  const { orders: reduxOrders, loading, error } = useSelector((state) => state.orders);
  const { selectedOrderDetails: reduxOrderDetails, loading: detailsLoading } = useSelector((state) => state.orderDetails);
  
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
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  // Thêm state và hàm sort
  const [sortMode, setSortMode] = useState('newest'); // 'newest' | 'oldest' | 'name-asc' | 'name-desc'
  const sortOrders = (arr, mode = 'newest') => {
    const getTime = (o) => new Date(o.orderDate || 0).getTime();
    const getId = (o) => Number(o.orderId || 0);
    const getName = (o) => (o.customerName || '').toLowerCase();
    const byNewest = (a, b) => (getTime(b) - getTime(a)) || (getId(b) - getId(a));
    const byOldest = (a, b) => (getTime(a) - getTime(b)) || (getId(a) - getId(b));
    const byNameAsc = (a, b) => getName(a).localeCompare(getName(b), 'vi');
    const byNameDesc = (a, b) => getName(b).localeCompare(getName(a), 'vi');
    const copy = [...arr];
    switch (mode) {
      case 'oldest': return copy.sort(byOldest);
      case 'name-asc': return copy.sort(byNameAsc);
      case 'name-desc': return copy.sort(byNameDesc);
      case 'newest':
      default: return copy.sort(byNewest);
    }
  };

  // Show success message from location state and reload orders
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(null), 5000);
      
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

  // Fetch orders from API based on filters (server-side filtering)
  useEffect(() => {
    // Only show DRAFT and CONFIRMED orders
    if (startDate && endDate) {
      dispatch(fetchOrdersByDateRange({ startDate, endDate }));
    } else if (statusFilter !== 'all') {
      dispatch(fetchOrdersByStatus(statusFilter));
    } else {
      // Fetch all orders, but we'll filter to DRAFT and CONFIRMED
      dispatch(fetchOrders());
    }
  }, [dispatch, statusFilter, startDate, endDate]);
  
  // Update local orders state when Redux orders change
  useEffect(() => {
    if (reduxOrders && Array.isArray(reduxOrders)) {
      setOrders(reduxOrders);
      setFilteredOrders(reduxOrders);
    }
  }, [reduxOrders]);

  // Update filtered orders when orders or search term changes (client-side search only)
  useEffect(() => {
    console.log('📦 Orders from Redux:', orders);
    console.log('📦 Is Array?', Array.isArray(orders));
    
    if (!orders) return;
    
    let filtered = Array.isArray(orders) ? [...orders] : [];
    
    // Only show DRAFT and CONFIRMED orders
    filtered = filtered.filter(order => {
      const status = order.status?.toUpperCase();
      return status === 'DRAFT' || status === 'CONFIRMED';
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

    setFilteredOrders(sortOrders(filtered, sortMode));
  }, [searchTerm, orders, sortMode]);

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
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'DRAFT': return 'Nháp';
      case 'PENDING': return 'Chờ duyệt';
      case 'APPROVED': return 'Đã phê duyệt';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PROCESSING': return 'Đang xử lý';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status || 'N/A';
    }
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
        console.log('✅ Found product details in order:', orderDetails);
        setSelectedOrderDetails(orderDetails);
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
      setSuccessMessage(`Đã cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"!`);
      
      // Refresh orders list
      dispatch(fetchOrders());
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
      setErrorMessage('Không thể cập nhật trạng thái đơn hàng');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleEditOrder = (orderId) => {
    navigate(`/dealer-staff/add-order-details/${orderId}`, {
      state: { 
        fromEdit: true  // Flag to indicate editing existing order
      }
    });
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này? Thao tác này không thể hoàn tác!')) {
      return;
    }
    
    try {
      // Dùng Redux thunk thay vì gọi trực tiếp API
      await dispatch(deleteOrderById(orderId)).unwrap();
      
      setSuccessMessage('Đã xóa đơn hàng thành công!');
      
      // Refresh orders list từ server
      if (startDate && endDate) {
        dispatch(fetchOrdersByDateRange({ startDate, endDate }));
      } else if (statusFilter !== 'all') {
        dispatch(fetchOrdersByStatus(statusFilter));
      } else {
        dispatch(fetchOrders());
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting order:', error);
      setErrorMessage('Không thể xóa đơn hàng: ' + error);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    if (!window.confirm('Xác nhận đơn hàng này? Đơn hàng sẽ chuyển từ DRAFT sang CONFIRMED.')) {
      return;
    }
    
    try {
      await dispatch(confirmOrderThunk(orderId)).unwrap();
      setSuccessMessage('Đã xác nhận đơn hàng thành công!');
      
      // Refresh orders list
      if (startDate && endDate) {
        dispatch(fetchOrdersByDateRange({ startDate, endDate }));
      } else if (statusFilter !== 'all') {
        dispatch(fetchOrdersByStatus(statusFilter));
      } else {
        dispatch(fetchOrders());
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error confirming order:', error);
      setErrorMessage('Không thể xác nhận đơn hàng: ' + error);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleCreateContract = (order) => {
    // Navigate to contract management page for creating contract
    navigate('/dealer-staff/contract-management');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {(error || errorMessage) && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{error || errorMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h2>
            <p className="text-gray-600 mt-1">Danh sách các đơn hàng đã tạo</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Đang tải danh sách đơn hàng...</span>
          </div>
        )}

        {/* Filters */}
        {!loading && (
          <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên khách hàng, mã đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="draft">Nháp</option>
                  <option value="approved">Đã phê duyệt</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              <div className="sm:w-60">
                <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="newest">Đơn hàng mới nhất</option>
                  <option value="oldest">Đơn hàng cũ nhất</option>
                  <option value="name-asc">Tên KH A → Z</option>
                  <option value="name-desc">Tên KH Z → A</option>
                </select>
              </div>
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="sm:w-auto px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Lọc theo ngày
              </button>
            </div>

            {/* Date Range Filter */}
            <AnimatePresence>
              {showDateFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onKeyDown={(e) => e.preventDefault()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                      placeholder="Chọn ngày"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onKeyDown={(e) => e.preventDefault()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                      placeholder="Chọn ngày"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Orders Table */}
        {!loading && filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đơn hàng nào</h3>
            <p className="mt-1 text-sm text-gray-500">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderCode || `ORD-${order.orderId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerName || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.customerPhone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(order.totalPayment || order.totalPrice || 0).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <Tooltip content="Xem thông tin chi tiết đơn hàng và hợp đồng" placement="top">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Chi tiết
                          </button>
                        </Tooltip>
                        
                        {order.status?.toUpperCase() === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCreateContract(order)}
                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                            title="Tạo hợp đồng"
                          >
                            <FilePlus className="h-4 w-4 mr-1" />
                            Tạo hợp đồng
                          </button>
                        )}
                        
                        {order.status?.toUpperCase() === 'DRAFT' && (
                          <button
                            onClick={() => handleConfirmOrder(order.orderId)}
                            className="text-green-600 hover:text-green-900 transition-colors font-semibold flex items-center"
                            title="Xác nhận đơn hàng"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Xác nhận
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteOrder(order.orderId)}
                          className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                          title="Xóa đơn hàng"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </button>
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
              className="w-full max-w-7xl p-6 border shadow-2xl rounded-2xl bg-white max-h-[95vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Receipt className="h-8 w-8 text-emerald-600" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      Chi tiết đơn hàng
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Mã: <span className="font-semibold ml-1">{selectedOrder.orderCode || `ORD-${selectedOrder.orderId}`}</span>
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Three Column Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Customer Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <User className="h-5 w-5 text-blue-600" />
                      <h4 className="font-bold text-blue-900">Thông tin khách hàng</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <UserCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-blue-700">Tên khách hàng</p>
                          <p className="text-sm font-semibold text-blue-900">{selectedOrder.customerName || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Phone className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-blue-700">Số điện thoại</p>
                          <p className="text-sm font-semibold text-blue-900">{selectedOrder.customerPhone || 'N/A'}</p>
                        </div>
                      </div>
                      {selectedOrder.customerEmail && (
                        <div className="flex items-start">
                          <Mail className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-blue-700">Email</p>
                            <p className="text-sm font-semibold text-blue-900 break-all">{selectedOrder.customerEmail}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Staff & Store Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      <h4 className="font-bold text-purple-900">Nhân viên & Cửa hàng</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <UserCircle className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-purple-700">Nhân viên phụ trách</p>
                          <p className="text-sm font-semibold text-purple-900">{selectedOrder.staffName || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <Building2 className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-purple-700">Cửa hàng</p>
                          <p className="text-sm font-semibold text-purple-900">{selectedOrder.storeName || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-bold text-emerald-900">Tổng quan tài chính</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-emerald-700">Tổng giá sản phẩm:</span>
                        <span className="text-sm font-semibold text-emerald-900">
                          {(selectedOrder.totalPrice || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-emerald-700">Thuế VAT:</span>
                        <span className="text-sm font-semibold text-orange-600">
                          +{(selectedOrder.totalTaxPrice || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-emerald-700">Khuyến mãi:</span>
                        <span className="text-sm font-semibold text-red-600">
                          -{(selectedOrder.totalPromotionAmount || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      <div className="pt-2 border-t-2 border-emerald-300">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-emerald-900">Tổng thanh toán:</span>
                          <span className="text-lg font-bold text-emerald-600">
                            {(selectedOrder.totalPayment || 0).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                    <h4 className="font-bold text-white flex items-center text-lg">
                      <ShoppingBag className="h-6 w-6 mr-2" />
                      Chi tiết sản phẩm
                    </h4>
                  </div>
                  
                  {loadingDetails ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
                      <span className="text-gray-600 font-medium">Đang tải chi tiết sản phẩm...</span>
                    </div>
                  ) : selectedOrderDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Sản phẩm
                            </th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Số lượng
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Đơn giá
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Phí đăng ký
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Phí biển số
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                              VAT
                            </th>
                            {selectedOrderDetails.some(item => item.promotionName) && (
                              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                                Khuyến mãi
                              </th>
                            )}
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Giảm giá
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                              Thành tiền
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {selectedOrderDetails.map((item, index) => (
                            <tr key={index} className="hover:bg-emerald-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                                    <Package className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{item.modelName || 'N/A'}</div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {item.colorName || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold">
                                  {item.quantity || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                {(item.unitPrice || 0).toLocaleString('vi-VN')}đ
                              </td>
                              <td className="px-6 py-4 text-right text-sm text-gray-600">
                                {(item.registrationFee || 0).toLocaleString('vi-VN')}đ
                              </td>
                              <td className="px-6 py-4 text-right text-sm text-gray-600">
                                {(item.licensePlateFee || 0).toLocaleString('vi-VN')}đ
                              </td>
                              <td className="px-6 py-4 text-right text-sm text-orange-600 font-semibold">
                                +{(item.vatAmount || 0).toLocaleString('vi-VN')}đ
                              </td>
                              {selectedOrderDetails.some(i => i.promotionName) && (
                                <td className="px-6 py-4 text-right text-xs">
                                  {item.promotionName ? (
                                    <span className="inline-flex items-center px-2 py-1 bg-pink-100 text-pink-800 rounded-full">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {item.promotionName}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              )}
                              <td className="px-6 py-4 text-right text-sm text-red-600 font-semibold">
                                {(item.discountAmount || 0) > 0 ? `-${(item.discountAmount || 0).toLocaleString('vi-VN')}đ` : '-'}
                              </td>
                              <td className="px-6 py-4 text-right text-base font-bold text-emerald-600">
                                {(item.totalPrice || 0).toLocaleString('vi-VN')}đ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                        <Package className="h-10 w-10 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Chưa có sản phẩm</h4>
                      <p className="text-gray-500 mb-4">Đơn hàng này chưa có sản phẩm nào</p>
                      {selectedOrder.status?.toUpperCase() === 'DRAFT' && (
                        <button
                          onClick={() => {
                            handleEditOrder(selectedOrder.orderId);
                            handleCloseModal();
                          }}
                          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Thêm sản phẩm ngay
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  {/* Status Actions - LEFT SIDE */}
                  <div className="flex gap-2">
                    {selectedOrder.status?.toUpperCase() === 'DRAFT' && (
                      <motion.button
                        onClick={() => {
                          handleConfirmOrder(selectedOrder.orderId);
                          handleCloseModal();
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center font-semibold"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Xác nhận đơn hàng
                      </motion.button>
                    )}
                  </div>
                  
                  {/* General Actions - RIGHT SIDE */}
                  <div className="flex space-x-4">
                    <motion.button
                      onClick={handleCloseModal}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Đóng
                    </motion.button>
                    <motion.button
                      onClick={() => window.print()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
                    >
                      In đơn hàng
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