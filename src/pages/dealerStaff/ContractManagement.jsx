import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  fetchOrdersByStatus
} from '../../store/slices/orderSlice';
import { 
  createContractFromOrderThunk,
  fetchAllContractsThunk
} from '../../store/slices/contractSlice';
import { 
  Search, 
  Eye, 
  FilePlus, 
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  ShoppingCart,
  List,
  Upload,
  X
} from 'lucide-react';
import ViewContracts from './ViewContracts';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

function ContractManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, success, showError, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'view'
  
  const { orders, loading } = useSelector((state) => state.orders);
  const { contracts, loading: contractLoading } = useSelector((state) => state.contracts);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [creatingContractForOrder, setCreatingContractForOrder] = useState(null);
  const [selectedOrderIdForContract, setSelectedOrderIdForContract] = useState(null);
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

  // Load confirmed orders and contracts on mount
  useEffect(() => {
    dispatch(fetchOrdersByStatus('CONFIRMED'));
    dispatch(fetchAllContractsThunk());
  }, [dispatch]);

  // Check if we should switch to view tab from navigation state
  // Also handle orderId from ViewOrders navigation
  useEffect(() => {
    if (location.state?.tab === 'view') {
      setActiveTab('view');
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
    
    // Nếu có orderId từ navigation state (từ ViewOrders), tự động chọn đơn hàng đó
    if (location.state?.orderId && location.state?.tab === 'create') {
      setActiveTab('create');
      const orderId = location.state.orderId;
      
      // Tìm đơn hàng trong danh sách
      const targetOrder = orders?.find(order => 
        String(order.orderId) === String(orderId)
      );
      
      if (targetOrder) {
        // Highlight đơn hàng được chọn
        setSelectedOrderIdForContract(orderId);
        
        // Scroll to the order after a short delay to ensure DOM is updated
        setTimeout(() => {
          const element = document.getElementById(`order-row-${orderId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
      
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location, orders]);

  // Create map of orderId -> contract for quick lookup
  const ordersWithContracts = {};
  if (contracts && contracts.length > 0) {
    contracts.forEach(contract => {
      if (contract.orderId) {
        ordersWithContracts[contract.orderId] = contract;
      }
    });
  }

  // Format order code to ORD-01, ORD-02, ...
  const formatOrderCode = (orderCode, orderId) => {
    if (orderCode) {
      // If orderCode already has format, extract number or use as is
      const match = orderCode.match(/ORD-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        return `ORD-${String(num).padStart(2, '0')}`;
      }
      // Try to extract number from orderCode
      const numMatch = orderCode.match(/(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        return `ORD-${String(num).padStart(2, '0')}`;
      }
    }
    // Fallback to orderId
    if (orderId) {
      const num = parseInt(orderId, 10);
      return `ORD-${String(num).padStart(2, '0')}`;
    }
    return orderCode || 'N/A';
  };

  // Format contract code to CTR-01, CTR-02, ...
  const formatContractCode = (contractCode, contractId) => {
    if (contractCode) {
      // If contractCode already has format, extract number or use as is
      const match = contractCode.match(/CTR-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        return `CTR-${String(num).padStart(2, '0')}`;
      }
      // Try to extract number from contractCode
      const numMatch = contractCode.match(/(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        return `CTR-${String(num).padStart(2, '0')}`;
      }
    }
    // Fallback to contractId
    if (contractId) {
      const num = parseInt(contractId, 10);
      return `CTR-${String(num).padStart(2, '0')}`;
    }
    return contractCode || 'N/A';
  };

  // Filter orders by search and ensure only CONFIRMED orders without contracts are shown
  const filteredOrders = sortOrders(
    (orders || []).filter(order => 
      // Only show CONFIRMED orders
      order.status?.toUpperCase() === 'CONFIRMED' &&
      // Exclude orders that already have contracts
      !ordersWithContracts[order.orderId] &&
      // Filter by search term
      (order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    sortMode
  );

  // Handlers
  const handleViewOrder = (order) => {
    // Navigate to order management page with view tab
    navigate(`/dealer-staff/order-management`, { state: { tab: 'view' } });
  };

  const handleCreateContract = async (order) => {
    if (!order) return;

    // Validation: Check if order already has contract
    const existingContract = ordersWithContracts[order.orderId];
    if (existingContract) {
      const formattedOrderCode = formatOrderCode(order.orderCode, order.orderId);
      const formattedContractCode = formatContractCode(existingContract.contractCode, existingContract.contractId);
      showError(`Đơn hàng ${formattedOrderCode} đã có hợp đồng ${formattedContractCode}. Vui lòng xem hợp đồng hiện tại.`);
      return;
    }

    // Validation: Check if order is CONFIRMED
    if (order.status?.toUpperCase() !== 'CONFIRMED') {
      showError('Chỉ có thể tạo hợp đồng cho đơn hàng đã xác nhận (CONFIRMED).');
      return;
    }

    try {
      setCreatingContractForOrder(order.orderId);
      
      // Call API to create contract
      const result = await dispatch(createContractFromOrderThunk(order.orderId)).unwrap();
      
      console.log('Contract created:', result);
      
      // Extract contractId and contractCode from result
      const contractId = result.contractId || result.data?.contractId;
      const contractCode = result.contractCode || result.data?.contractCode;
      
      // Refresh contracts list
      await dispatch(fetchAllContractsThunk());
      
      // Show success message with both order code and contract code
      const formattedOrderCode = formatOrderCode(order.orderCode, order.orderId);
      const formattedContractCode = formatContractCode(contractCode, contractId);
      success(`Đã tạo hợp đồng ${formattedContractCode} thành công cho đơn hàng ${formattedOrderCode}!`);
      
      // Switch to view contracts tab after short delay
      setTimeout(() => {
        setActiveTab('view');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating contract:', error);
      showError('Không thể tạo hợp đồng: ' + (error.message || error));
    } finally {
      setCreatingContractForOrder(null);
    }
  };

  // Create Contract Tab Content
  const CreateContractTab = () => (
    <div className="max-w-7xl mx-auto">

      {/* Thông báo khi được navigate từ ViewOrders */}
      {location.state?.orderId && location.state?.orderData && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start">
          <FileText className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">Đang tạo hợp đồng cho đơn hàng</h4>
            <p className="text-sm text-blue-800">
              Đơn hàng: <strong>{location.state.orderData.orderCode || `ORD-${location.state.orderId}`}</strong>
              {location.state.orderData.customerName && (
                <> - Khách hàng: <strong>{location.state.orderData.customerName}</strong></>
              )}
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Đơn hàng đã được highlight bên dưới. Vui lòng kiểm tra thông tin và nhấn "Tạo hợp đồng" để tiếp tục.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedOrderIdForContract(null);
              window.history.replaceState({}, document.title);
            }}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="Đóng thông báo"
          >
            <X className="h-4 w-4" />
          </button>
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
            <p className="text-gray-500 text-lg">Không có đơn hàng nào cần tạo hợp đồng</p>
            
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
                    Hợp đồng
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
                  <tr 
                    key={order.orderId} 
                    id={`order-row-${order.orderId}`}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedOrderIdForContract === order.orderId 
                        ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' 
                        : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatOrderCode(order.orderCode, order.orderId)}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const contract = ordersWithContracts[order.orderId];
                        if (contract) {
                          return (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Đã có
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Chưa có
                            </span>
                          );
                        }
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {(order.totalPayment || 0).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-emerald-600 hover:text-emerald-900 transition-colors"
                          title="Xem chi tiết đơn hàng"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {(() => {
                          const hasContract = ordersWithContracts[order.orderId];
                          if (hasContract) {
                            return (
                              <button
                                onClick={() => setActiveTab('view')}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Đơn hàng đã có hợp đồng"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            );
                          } else {
                            return (
                              <button
                                onClick={() => handleCreateContract(order)}
                                disabled={creatingContractForOrder === order.orderId}
                                className="text-blue-600 hover:text-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Tạo hợp đồng"
                              >
                                {creatingContractForOrder === order.orderId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <FilePlus className="h-4 w-4" />
                                  )}
                                </button>
                            );
                          }
                        })()}
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
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex space-x-2 border-b border-gray-200 pb-2">
          <motion.button
            onClick={() => setActiveTab('create')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center px-6 py-3 font-medium rounded-lg transition-all ${
              activeTab === 'create'
                ? 'text-emerald-600 bg-emerald-50 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FilePlus className={`h-5 w-5 mr-2 ${activeTab === 'create' ? 'text-emerald-600' : 'text-gray-500'}`} />
            Tạo hợp đồng
          </motion.button>
          
          <motion.button
            onClick={() => setActiveTab('view')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center px-6 py-3 font-medium rounded-lg transition-all ${
              activeTab === 'view'
                ? 'text-emerald-600 bg-emerald-50 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <List className={`h-5 w-5 mr-2 ${activeTab === 'view' ? 'text-emerald-600' : 'text-gray-500'}`} />
            Danh sách hợp đồng
          </motion.button>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'create' ? <CreateContractTab /> : <ViewContracts />}
      </motion.div>
      </div>
    </div>
  );
}

export default ContractManagement;