import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchOrders, 
  updateOrderStatusById, 
  deleteOrderById 
} from '../../store/slices/orderSlice';
import { 
  fetchOrderDetailsByOrderId 
} from '../../store/slices/orderDetailSlice';
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
function OrderManagement() {
  // Modern UI hooks
  const { toast, success, error: showError, hideToast } = useToast();
  const { confirm, showConfirm } = useConfirm();
  
  const dispatch = useDispatch();
  
  // Redux state
  const { orders, loading, error } = useSelector((state) => state.orders);
  const { selectedOrderDetails, loading: detailsLoading } = useSelector((state) => state.orderDetails);
  
  // Local state
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Bulk delete state
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingCount, setDeletingCount] = useState(0);

  // Load orders on mount
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Update filtered orders when orders or filters change
  useEffect(() => {
    console.log('📦 Orders from Redux:', orders);
    
    if (!orders) return;
    
    let filtered = Array.isArray(orders) ? [...orders] : [];

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
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        const orderStatus = order.status || order.orderStatus || '';
        return orderStatus.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    setFilteredOrders(filtered);
    
    // Clear selections when filters change
    setSelectedOrderIds([]);
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
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatusById({ orderId, status: newStatus })).unwrap();
      success(`Đã cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"!`);
      
      // Refresh orders list
      dispatch(fetchOrders());
      
      setTimeout(() => success(''), 3000);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmed = await showConfirm({
      message: 'Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.',
      type: 'warning'
    });
    if (!confirmed) return;
    
    try {
      await dispatch(deleteOrderById(orderId)).unwrap();
      success('Đã xóa đơn hàng thành công!');
      
      // Refresh orders list
      dispatch(fetchOrders());
      
      setTimeout(() => success(''), 3000);
    } catch (error) {
      console.error('Error deleting order:', error);
      showError('Không thể xóa đơn hàng. Vui lòng thử lại.');
    }
  };

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredOrders.map(order => order.orderId);
      setSelectedOrderIds(allIds);
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrderIds(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  // Bulk delete handler (parallel deletion for speed)
  const handleBulkDelete = async () => {
    if (selectedOrderIds.length === 0) {
      showError('Vui lòng chọn ít nhất một đơn hàng để xóa.');
      return;
    }

    const confirmed = await showConfirm({
      message: `Bạn có chắc chắn muốn xóa ${selectedOrderIds.length} đơn hàng đã chọn? Hành động này không thể hoàn tác.`,
      type: 'warning'
    });
    if (!confirmed) return;

    setIsDeleting(true);
    setDeletingCount(selectedOrderIds.length);

    // Delete all orders in parallel for speed
    const deletePromises = selectedOrderIds.map(orderId => 
      dispatch(deleteOrderById(orderId))
        .unwrap()
        .then(() => ({ orderId, success: true }))
        .catch((error) => {
          console.error(`Error deleting order ${orderId}:`, error);
          return { orderId, success: false, error };
        })
    );

    // Wait for all deletions to complete
    const results = await Promise.all(deletePromises);
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    setIsDeleting(false);
    setDeletingCount(0);
    setSelectedOrderIds([]);

    // Show result message
    if (failCount === 0) {
      success(`Đã xóa thành công ${successCount} đơn hàng!`);
    } else {
      success(`Đã xóa ${successCount} đơn hàng. ${failCount} đơn hàng không thể xóa.`);
    }

    // Refresh orders list only once at the end
    dispatch(fetchOrders());

    setTimeout(() => success(''), 4000);
  };

  // Calculate total from order details
  const calculateOrderTotal = (orderDetails) => {
    if (!orderDetails || orderDetails.length === 0) return 0;
    
    return orderDetails.reduce((sum, detail) => {
      const unitPrice = detail.unitPrice || 0;
      const quantity = detail.quantity || 0;
      return sum + (unitPrice * quantity);
    }, 0);
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

<div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="h-8 w-8 mr-3 text-emerald-600" />
          Quản lý đơn hàng
        </h1>
        <p className="text-gray-600 mt-2">Quản lý và theo dõi tất cả đơn hàng của cửa hàng</p>
      </div>

      

      {/* Error Message */}
      {error && (
        <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Filters and Bulk Actions */}
        <div className="flex flex-col gap-4 mb-6">
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
                <option value="pending">Chờ duyệt</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Bulk Delete Button */}
          {selectedOrderIds.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <span className="text-sm text-red-700 font-medium">
                Đã chọn {selectedOrderIds.length} đơn hàng
              </span>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xóa {deletingCount} đơn hàng...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Xóa đã chọn
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Đang tải danh sách đơn hàng...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
                        
                      />
                      <span className="text-xs font-medium text-gray-600">Tất cả</span>
                    </div>
                  </th>
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
                  <tr 
                    key={order.orderId} 
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedOrderIds.includes(order.orderId) ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.orderId)}
                        onChange={() => handleSelectOrder(order.orderId)}
                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      />
                    </td>
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
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-emerald-600 hover:text-emerald-900 transition-colors"
                          
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.orderId)}
                          
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
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
              className="w-11/12 md:w-3/4 lg:w-1/2 p-5 border shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chi tiết đơn hàng - {selectedOrder.orderNumber || `ORD-${selectedOrder.orderId}`}
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

export default OrderManagement;

