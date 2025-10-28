import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchOrders, 
  fetchOrderById, 
  updateOrderStatusById, 
  deleteOrderById 
} from '../../store/slices/orderSlice';
import { 
  fetchOrderDetailsByOrderId 
} from '../../store/slices/orderDetailSlice';
import Tooltip from '@/components/ui/Tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

function ViewOrders() {
  const dispatch = useDispatch();
  
  // Redux state
  const { orders, loading, error } = useSelector((state) => state.orders);
  const { selectedOrderDetails, loading: detailsLoading } = useSelector((state) => state.orderDetails);
  
  // Local state
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchOrders } from '../../store/slices/orderSlice';
// Order details are included in getOrderById response
import { updateOrderStatus, deleteOrder, getOrderById } from '../../api/orderService';
import { Loader2, AlertCircle, CheckCircle, Edit, Trash2, FileText, Package } from 'lucide-react';

function ViewOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { orders: reduxOrders, loading, error } = useSelector((state) => state.orders);
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load orders on mount
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Mock data - trong thực tế sẽ lấy từ API
  const mockOrders = [
    {
      id: 1,
      orderNumber: 'ORD-001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0123456789',
      customerEmail: 'nguyenvana@email.com',
      orderDate: '2024-01-15',
      status: 'pending',
      totalAmount: 320000000,
      contractId: 'CONTRACT-001',
      items: [
        { name: 'Electra Ascent', quantity: 1, unitPrice: 320000000, total: 320000000 }
      ],
      notes: 'Đơn hàng từ báo giá BQ-001',
      originalQuoteId: 'BQ-001'
    },
    {
      id: 2,
      orderNumber: 'ORD-002', 
      customerName: 'Trần Thị B',
      customerPhone: '0987654321',
      customerEmail: 'tranthib@email.com',
      orderDate: '2024-01-16',
      status: 'confirmed',
      totalAmount: 450000000,
      contractId: 'CONTRACT-002',
      items: [
        { name: 'Electra GrandTour', quantity: 1, unitPrice: 450000000, total: 450000000 }
      ],
      notes: 'Đơn hàng từ báo giá BQ-002',
      originalQuoteId: 'BQ-002'
    },
    {
      id: 3,
      orderNumber: 'ORD-003',
      customerName: 'Lê Văn C',
      customerPhone: '0111222333',
      customerEmail: 'levanc@email.com',
      orderDate: '2024-01-17',
      status: 'processing',
      totalAmount: 280000000,
      contractId: 'CONTRACT-003',
      items: [
        { name: 'Electra CityLink', quantity: 1, unitPrice: 280000000, total: 280000000 }
      ],
      notes: 'Đơn hàng từ báo giá BQ-003',
      originalQuoteId: 'BQ-003'
    },
    {
      id: 4,
      orderNumber: 'ORD-004',
      customerName: 'Phạm Thị D',
      customerPhone: '0333444555',
      customerEmail: 'phamthid@email.com',
      orderDate: '2024-01-18',
      status: 'completed',
      totalAmount: 680000000,
      contractId: 'CONTRACT-004',
      items: [
        { name: 'Electra Summit', quantity: 1, unitPrice: 680000000, total: 680000000 }
      ],
      notes: 'Đơn hàng từ báo giá BQ-004',
      originalQuoteId: 'BQ-004'
    }
  ];

  // Show success message from location state and reload orders
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      // If coming from create/edit order, force reload orders after short delay
      if (location.state?.newOrderId || location.state?.success) {
        console.log('Force reloading orders after create/update...');
        // Small delay to ensure backend has processed the order
        setTimeout(() => {
          dispatch(fetchOrders());
        }, 300);
      }
      
      // Clear the location state
      window.history.replaceState({}, document.title);
    }
  }, [location, dispatch]);

  // Fetch orders from API on mount
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);
  
  // Update local orders state when Redux orders change
  useEffect(() => {
    if (reduxOrders && Array.isArray(reduxOrders)) {
      setOrders(reduxOrders);
      setFilteredOrders(reduxOrders);
    }
  }, [reduxOrders]);

  // Update filtered orders when orders or filters change
  useEffect(() => {
    console.log('📦 Orders from Redux:', orders);
    console.log('📦 Is Array?', Array.isArray(orders));
    
    if (!orders) return;
    
    let filtered = Array.isArray(orders) ? [...orders] : [];
    console.log('📦 Filtered orders:', filtered);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => {
        const customerName = order.customerName || order.customer?.fullName || '';
        const orderId = (order.orderId || '').toString();
        const orderNumber = order.orderNumber || '';
        
        return (
          customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          orderId.includes(searchTerm) ||
          orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      filtered = filtered.filter(order => 
        (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerPhone || '').includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        const orderStatus = order.status || order.orderStatus || '';
        return orderStatus.toLowerCase() === statusFilter.toLowerCase();
      });
      filtered = filtered.filter(order => 
        (order.status || '').toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'pending':
      case 'chờ duyệt':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'đã xác nhận':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
      case 'đang xử lý':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
      case 'hoàn thành':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'pending': return 'Chờ duyệt';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
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
    
    // Fetch order details
    if (order.orderId) {
      try {
        await dispatch(fetchOrderDetailsByOrderId(order.orderId));
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
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
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatusById({ orderId, status: newStatus })).unwrap();
      setSuccessMessage(`Đã cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"!`);
      
      // Refresh orders list
      dispatch(fetchOrders());
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
      // Call API to update order status
      await updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.orderId === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      setSuccessMessage(`Đã cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"!`);
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
      await dispatch(deleteOrderById(orderId)).unwrap();
      setSuccessMessage('Đã xóa đơn hàng thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Calculate total from order details
  const calculateOrderTotal = (orderDetails) => {
    if (!orderDetails || orderDetails.length === 0) return 0;
    
    return orderDetails.reduce((sum, detail) => {
      const unitPrice = detail.unitPrice || 0;
      const quantity = detail.quantity || 0;
      return sum + (unitPrice * quantity);
    }, 0);
      await deleteOrder(orderId);
      
      // Remove from local state
      setOrders(prev => prev.filter(order => order.orderId !== orderId));
      
      setSuccessMessage('Đã xóa đơn hàng thành công!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting order:', error);
      setErrorMessage('Không thể xóa đơn hàng');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleCreateContract = (order) => {
    navigate(`/dealer-staff/order-summary/${order.orderId}`, {
      state: {
        fromViewOrders: true
      }
    });
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
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h2>
            <p className="text-gray-600 mt-1">Danh sách các đơn hàng đã tạo</p>
          </div>
        </div>

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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Đang tải danh sách đơn hàng...</span>
          </div>
        )}

        {/* Filters */}
        {!loading && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
        </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Đang tải danh sách đơn hàng...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
        {/* Orders Table */}
        {!loading && (
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
                  Mã hợp đồng
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.contractId || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap gap-2">
                      <Tooltip content="Xem thông tin chi tiết đơn hàng và hợp đồng" placement="top">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-emerald-600 hover:text-emerald-900 transition-colors flex items-center"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Chi tiết
                        </button>
                      </Tooltip>
                      
                      {order.status?.toUpperCase() === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleEditOrder(order.orderId)}
                            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Sửa
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.orderId, 'APPROVED')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Phê duyệt đơn hàng"
                          >
                            Phê duyệt
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.orderId)}
                            className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                            title="Xóa đơn hàng"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Xóa
                          </button>
                        </>
                      )}
                      
                      {order.status?.toUpperCase() === 'APPROVED' && !order.contractId && (
                        <button
                          onClick={() => handleCreateContract(order)}
                          className="text-blue-600 hover:text-blue-900 transition-colors font-semibold flex items-center"
                          title="Tạo hợp đồng"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Tạo Hợp Đồng
                        </button>
                      )}
                      
                      {order.status?.toUpperCase() === 'PROCESSING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.orderId, 'COMPLETED')}
                          className="text-green-600 hover:text-green-900 transition-colors"
                        >
                          Hoàn thành
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

        {!loading && filteredOrders.length === 0 && (
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
        ) : (
          /* Orders Table */
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
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber || `ORD-${order.orderId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerName || order.customer?.fullName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.customerPhone || order.customer?.phone || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status || order.orderStatus)}`}>
                        {getStatusText(order.status || order.orderStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Tooltip content="Xem chi tiết đơn hàng" placement="top">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        </Tooltip>
                        {/* Note: Dealer Staff không có quyền xóa đơn hàng (405 Method Not Allowed) */}
                        {/* Chỉ Manager/Admin mới được xóa */}
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
              className="w-11/12 md:w-3/4 lg:w-1/2 p-5 border shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chi tiết đơn hàng - {selectedOrder.orderNumber || `ORD-${selectedOrder.orderId}`}
                  Chi tiết đơn hàng - {selectedOrder.orderCode || `ORD-${selectedOrder.orderId}`}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tên khách hàng</label>
                      <p className="text-sm text-gray-900">
                        {selectedOrder.customerName || selectedOrder.customer?.fullName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                      <p className="text-sm text-gray-900">
                        {selectedOrder.customerPhone || selectedOrder.customer?.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">
                        {selectedOrder.customerEmail || selectedOrder.customer?.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày tạo đơn hàng</label>
                      <p className="text-sm text-gray-900">
                        {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên khách hàng</label>
                    <p className="text-sm text-gray-900">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <p className="text-sm text-gray-900">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedOrder.customerEmail || 'Chưa có'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày tạo đơn hàng</label>
                    <p className="text-sm text-gray-900">{selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Chi tiết sản phẩm</h4>
                  
                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-600 mr-2" />
                      <span className="text-sm text-gray-600">Đang tải chi tiết...</span>
                    </div>
                  ) : selectedOrderDetails && selectedOrderDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-sm font-medium text-gray-700">Sản phẩm</th>
                            <th className="text-left py-2 text-sm font-medium text-gray-700">Màu sắc</th>
                            <th className="text-left py-2 text-sm font-medium text-gray-700">Số lượng</th>
                            <th className="text-left py-2 text-sm font-medium text-gray-700">Đơn giá</th>
                            <th className="text-left py-2 text-sm font-medium text-gray-700">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedOrderDetails.map((detail, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 text-sm text-gray-900">{detail.modelName || 'N/A'}</td>
                              <td className="py-2 text-sm text-gray-900">{detail.colorName || 'N/A'}</td>
                              <td className="py-2 text-sm text-gray-900">{detail.quantity || 0}</td>
                              <td className="py-2 text-sm text-gray-900">
                                {(detail.unitPrice || 0).toLocaleString('vi-VN')} VNĐ
                              </td>
                              <td className="py-2 text-sm text-gray-900">
                                {((detail.unitPrice || 0) * (detail.quantity || 0)).toLocaleString('vi-VN')} VNĐ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Không có chi tiết sản phẩm
                    </p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Tổng tiền:</span>
                    <span className="text-xl font-bold text-emerald-600">
                      {calculateOrderTotal(selectedOrderDetails).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status || selectedOrder.orderStatus)}`}>
                      {getStatusText(selectedOrder.status || selectedOrder.orderStatus)}
                    </span>
                  </div>
              {/* Product Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Package className="h-5 w-5 text-emerald-600 mr-2" />
                  Chi tiết sản phẩm
                </h4>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                    <span className="text-gray-600">Đang tải chi tiết...</span>
                  </div>
                ) : selectedOrderDetails.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-sm font-medium text-gray-700">Sản phẩm</th>
                          <th className="text-center py-2 text-sm font-medium text-gray-700">SL</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-700">Đơn giá</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-700">Phí</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-700">VAT</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-700">Giảm giá</th>
                          <th className="text-right py-2 text-sm font-medium text-gray-700">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrderDetails.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 text-sm">
                              <div className="font-medium text-gray-900">{item.modelName || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{item.colorName || ''}</div>
                            </td>
                            <td className="text-center py-3 text-sm text-gray-900 font-medium">{item.quantity || 0}</td>
                            <td className="text-right py-3 text-sm text-gray-900">
                              {(item.unitPrice || 0).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="text-right py-3 text-sm text-gray-600">
                              {((item.licensePlateFee || 0) + (item.registrationFee || 0)).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="text-right py-3 text-sm text-gray-600">
                              {(item.vatAmount || 0).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="text-right py-3 text-sm text-red-600">
                              -{(item.discountAmount || 0).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="text-right py-3 text-sm font-bold text-emerald-600">
                              {(item.totalPrice || 0).toLocaleString('vi-VN')}đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-2">Chưa có sản phẩm trong đơn hàng</p>
                    {selectedOrder.status?.toUpperCase() === 'DRAFT' && (
                      <button
                        onClick={() => {
                          handleEditOrder(selectedOrder.orderId);
                          handleCloseModal();
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Thêm sản phẩm ngay →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Tổng tiền:</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {(selectedOrder.totalPayment || selectedOrder.totalPrice || 0).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p><strong>Mã đơn hàng:</strong> {selectedOrder.orderCode || `ORD-${selectedOrder.orderId}`}</p>
                  <p><strong>Mã hợp đồng:</strong> {selectedOrder.contractId || 'Chưa có'}</p>
                  <p><strong>Nhân viên:</strong> {selectedOrder.staffName || 'N/A'}</p>
                  <p><strong>Cửa hàng:</strong> {selectedOrder.storeName || 'N/A'}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <motion.button
                    onClick={handleCloseModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Đóng
                  </motion.button>
                </div>
              {/* Status Editor */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3">Thay đổi trạng thái</h4>
                <div className="flex items-center gap-4">
                  <select
                    value={selectedOrder.status || 'DRAFT'}
                    onChange={(e) => {
                      if (window.confirm(`Bạn có chắc muốn đổi trạng thái thành "${getStatusText(e.target.value)}"?`)) {
                        handleUpdateStatus(selectedOrder.orderId, e.target.value);
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="DRAFT">Nháp</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã phê duyệt</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                  <span className={`px-3 py-2 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  💡 Chọn trạng thái mới từ dropdown để cập nhật
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                {/* Status Actions - LEFT SIDE */}
                <div className="flex gap-2">
                  {selectedOrder.status?.toUpperCase() === 'DRAFT' && (
                    <>
                      <motion.button
                        onClick={() => {
                          handleEditOrder(selectedOrder.orderId);
                          handleCloseModal();
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Chỉnh sửa
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          handleUpdateStatus(selectedOrder.orderId, 'APPROVED');
                          handleCloseModal();
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Phê duyệt
                      </motion.button>
                    </>
                  )}
                  
                  {selectedOrder.status?.toUpperCase() === 'APPROVED' && !selectedOrder.contractId && (
                    <motion.button
                      onClick={() => {
                        handleCreateContract(selectedOrder);
                        handleCloseModal();
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Tạo Hợp Đồng
                    </motion.button>
                  )}
                  
                  {selectedOrder.status?.toUpperCase() === 'PROCESSING' && (
                    <motion.button
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.orderId, 'COMPLETED');
                        handleCloseModal();
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Hoàn thành
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ViewOrders;

