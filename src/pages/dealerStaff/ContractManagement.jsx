import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  fetchOrdersByStatus
} from '../../store/slices/orderSlice';
import { 
  createContractFromOrderThunk
} from '../../store/slices/contractSlice';
import { 
  Search, 
  Eye, 
  FilePlus, 
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  ShoppingCart
} from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

function ContractManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, getStoreId } = useAuth();
  
  const { orders, loading } = useSelector((state) => state.orders);
  const { loading: contractLoading } = useSelector((state) => state.contracts);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [creatingContractForOrder, setCreatingContractForOrder] = useState(null);
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

  // Load confirmed orders on mount
  useEffect(() => {
    dispatch(fetchOrdersByStatus('CONFIRMED'));
  }, [dispatch]);

  // Filter orders by search and storeId
  const currentStoreId = user?.storeId || getStoreId();
  const filteredOrders = sortOrders(
    (orders || []).filter(order => {
      // Filter by storeId
      if (currentStoreId) {
        const belongsToStore = order.storeId === currentStoreId ||
          (order.getOrderDetailsResponses || []).some(detail => 
            detail.storeStock?.storeId === currentStoreId
          );
        if (!belongsToStore) return false;
      }
      
      // Filter by search term
      return order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase());
    }),
    sortMode
  );

  // Handlers
  const handleViewOrder = (order) => {
    // Navigate to order details or open modal
    navigate(`/dealer-staff/view-orders`);
  };

  const handleCreateContract = async (order) => {
    if (!order) return;

    try {
      setCreatingContractForOrder(order.orderId);
      
      // Call API to create contract
      const result = await dispatch(createContractFromOrderThunk(order.orderId)).unwrap();
      
      console.log('Contract created:', result);
      
      // Extract contractId from result
      const contractId = result.contractId || result.data?.contractId;
      
      // Show success message
      setSuccessMessage(`Đã tạo hợp đồng thành công cho đơn ${order.orderCode}!`);
      
      // Navigate to view contracts page after short delay
      setTimeout(() => {
        navigate('/dealer-staff/view-contracts', {
          state: {
            message: `Đã tạo hợp đồng thành công cho đơn ${order.orderCode}!`,
            contractId: contractId
          }
        });
      }, 1500);
      
    } catch (error) {
      console.error('Error creating contract:', error);
      setErrorMessage('Không thể tạo hợp đồng: ' + (error.message || error));
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setCreatingContractForOrder(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="h-8 w-8 text-emerald-600 mr-3" />
              Tạo Hợp đồng
            </h1>
            <p className="text-gray-600 mt-1">
              Danh sách đơn hàng đã xác nhận - Chọn đơn để tạo hợp đồng
            </p>
          </div>
          <div className="w-64">
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
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng, khách hàng, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Đang tải đơn hàng...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-4">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không có đơn hàng nào đã xác nhận</p>
            <p className="text-gray-400 text-sm mt-2">Các đơn hàng đã xác nhận sẽ xuất hiện ở đây</p>
          </div>
        ) : (
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
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng thanh toán
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
                      <div className="text-sm text-gray-500">{order.customerPhone || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.staffName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Đã xác nhận
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {(order.totalPayment || 0).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Tooltip content="Xem chi tiết đơn hàng" placement="top">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </Tooltip>
                        
                        <Tooltip content="Tạo hợp đồng" placement="top">
                          <button
                            onClick={() => handleCreateContract(order)}
                            disabled={creatingContractForOrder === order.orderId}
                            className="text-blue-600 hover:text-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {creatingContractForOrder === order.orderId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FilePlus className="h-4 w-4" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContractManagement;