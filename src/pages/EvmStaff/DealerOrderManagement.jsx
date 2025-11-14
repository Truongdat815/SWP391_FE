import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  CreditCard,
  Truck,
  Package,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  Building2,
  RefreshCw
} from 'lucide-react';
import { 
  getAllTransactionsThunk,
  acceptTransactionThunk,
  rejectTransactionThunk,
  startShippingTransactionThunk,
  confirmPaymentTransactionThunk,
} from '../../store/slices/inventoryTransactionSlice';
import { getAllStoreStocksThunk } from '../../store/slices/store-stockSlice';
import { showError, showSuccess, showWarning } from '../../store/slices/snackbarSlice';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import PaymentReviewModal from '../../components/ui/PaymentReviewModal';
import OrderStatusStepper from '../../components/ui/OrderStatusStepper';
import ModernButton from '../../components/ui/ModernButton';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

function DealerOrderManagement() {
  const dispatch = useDispatch();
  
  const { toast, hideToast } = useToast();
  const { confirm, showConfirm } = useConfirm();

  const transactions = useSelector((s) => s.inventoryTransactions.items);
  const transactionsStatus = useSelector((s) => s.inventoryTransactions.status);
  const transactionsError = useSelector((s) => s.inventoryTransactions.error);
  const storeStocks = useSelector((s) => s.storeStocks.items);

  const [activeTab, setActiveTab] = useState('pending'); // pending, payment_review, processing, in_transit, completed
  const [paymentReviewModal, setPaymentReviewModal] = useState(false);
  const [selectedPaymentTransaction, setSelectedPaymentTransaction] = useState(null);

  useEffect(() => {
    // Initial load
    dispatch(getAllTransactionsThunk());
    dispatch(getAllStoreStocksThunk());

    // Auto-refresh transactions every 10 seconds to catch updates
    const refreshInterval = setInterval(() => {
      dispatch(getAllTransactionsThunk());
    }, 10000); // Refresh every 10 seconds

    // Also refresh when window regains focus (user switches back to tab)
    const handleFocus = () => {
      dispatch(getAllTransactionsThunk());
      dispatch(getAllStoreStocksThunk());
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch]);

  // Filter orders by status
  const pendingOrders = useMemo(() => {
    return transactions.filter(t => (t.status || '').toUpperCase() === 'PENDING');
  }, [transactions]);

  const paymentReviewOrders = useMemo(() => {
    return transactions.filter(t => (t.status || '').toUpperCase() === 'FILE_UPLOADED');
  }, [transactions]);

  const processingOrders = useMemo(() => {
    return transactions.filter(t => {
      const statusUpper = (t.status || '').toUpperCase();
      return statusUpper === 'CONFIRMED' || statusUpper === 'PAYMENT_CONFIRMED';
    });
  }, [transactions]);

  const inTransitOrders = useMemo(() => {
    return transactions.filter(t => (t.status || '').toUpperCase() === 'IN_TRANSIT');
  }, [transactions]);

  const completedOrders = useMemo(() => {
    return transactions.filter(t => {
      const statusUpper = (t.status || '').toUpperCase();
      return statusUpper === 'DELIVERED' || statusUpper === 'COMPLETED';
    });
  }, [transactions]);

  // Handle accept transaction
  const handleAccept = async (order) => {
    const confirmed = await showConfirm({
      message: `Bạn có chắc chắn muốn chấp nhận đơn hàng #${order.inventoryId || order.id}?`,
      type: 'info'
    });
    if (!confirmed) return;

    try {
      await dispatch(acceptTransactionThunk(order.inventoryId || order.id)).unwrap();
      
      // Refresh transactions to get updated status from server
      await dispatch(getAllTransactionsThunk()).unwrap();
      
      dispatch(showSuccess({ message: '✅ Đã chấp nhận đơn hàng!' }));
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể chấp nhận đơn hàng' }));
    }
  };

  // Handle reject transaction
  const handleReject = async (order) => {
    const confirmed = await showConfirm({
      message: `Bạn có chắc chắn muốn từ chối đơn hàng #${order.inventoryId || order.id}?`,
      type: 'warning'
    });
    if (!confirmed) return;

    try {
      await dispatch(rejectTransactionThunk(order.inventoryId || order.id)).unwrap();
      dispatch(showSuccess({ message: '❌ Đã từ chối đơn hàng.' }));
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể từ chối đơn hàng' }));
    }
  };

  // Handle start shipping
  const handleStartShipping = async (order) => {
    const confirmed = await showConfirm({
      message: `Xác nhận bắt đầu vận chuyển đơn hàng #${order.inventoryId || order.id}?`,
      type: 'info'
    });
    if (!confirmed) return;

    try {
      await dispatch(startShippingTransactionThunk(order.inventoryId || order.id)).unwrap();
      dispatch(showSuccess({ message: '🚚 Đã bắt đầu vận chuyển đơn hàng!' }));
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể bắt đầu vận chuyển' }));
    }
  };

  // Handle open payment review modal
  const handleOpenPaymentReview = (order) => {
    setSelectedPaymentTransaction(order);
    setPaymentReviewModal(true);
  };

  // Handle confirm payment
  const handleConfirmPayment = async (transaction) => {
    try {
      await dispatch(confirmPaymentTransactionThunk(transaction.inventoryId || transaction.id)).unwrap();
      dispatch(showSuccess({ message: '✅ Đã xác nhận thanh toán thành công!' }));
      setPaymentReviewModal(false);
      setSelectedPaymentTransaction(null);
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể xác nhận thanh toán' }));
      throw error;
    }
  };

  // Handle reject payment
  const handleRejectPayment = async (transaction) => {
    try {
      await dispatch(rejectTransactionThunk(transaction.inventoryId || transaction.id)).unwrap();
      dispatch(showSuccess({ message: '❌ Đã từ chối thanh toán.' }));
      setPaymentReviewModal(false);
      setSelectedPaymentTransaction(null);
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể từ chối thanh toán' }));
      throw error;
    }
  };

  // Get store stock info for transaction
  const getStockForTransaction = (transaction) => {
    return storeStocks.find(s => s.stockId === transaction.storeStockId);
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return '0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0';
    return Math.round(numPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Render order card
  const renderOrderCard = (order, index) => {
    const stock = getStockForTransaction(order);
    const statusUpper = (order.status || '').toUpperCase();
    
    return (
      <motion.div
        key={order.inventoryId || order.id || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Order Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Đơn hàng #{order.inventoryId || order.id}</h3>
                <p className="text-sm text-green-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {stock?.storeName || 'N/A'}
                </p>
              </div>
            </div>
            <StatusBadge status={order.status} size="md" />
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Order Status Stepper */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
            <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Tiến trình đơn hàng
            </h4>
            <OrderStatusStepper currentStatus={order.status} size="sm" />
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Model • Màu</p>
              <p className="text-sm font-bold text-gray-900">
                {stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Số lượng</p>
              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                <Package className="w-4 h-4" />
                {order.importQuantity} xe
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-2">Ngày đặt</p>
              <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                {order.orderDate 
                  ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          {/* Price Info */}
          {order.totalPrice > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Tổng giá trị:</span>
                <span className="text-lg font-bold text-emerald-600 flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  {formatPrice(order.totalPrice)} VNĐ
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {statusUpper === 'PENDING' && (
              <>
                <ModernButton
                  onClick={() => handleReject(order)}
                  variant="danger"
                  size="md"
                  icon={<XCircle className="w-4 h-4" />}
                >
                  Từ chối
                </ModernButton>
                <ModernButton
                  onClick={() => handleAccept(order)}
                  variant="success"
                  size="md"
                  icon={<CheckCircle className="w-4 h-4" />}
                >
                  Chấp nhận
                </ModernButton>
              </>
            )}
            {statusUpper === 'FILE_UPLOADED' && (
              <ModernButton
                onClick={() => handleOpenPaymentReview(order)}
                roleColor="blue"
                size="md"
                icon={<CreditCard className="w-4 h-4" />}
              >
                Xem biên lai
              </ModernButton>
            )}
            {(statusUpper === 'CONFIRMED' || statusUpper === 'PAYMENT_CONFIRMED') && (
              <ModernButton
                onClick={() => handleStartShipping(order)}
                roleColor="purple"
                size="md"
                icon={<Truck className="w-4 h-4" />}
              >
                Bắt đầu vận chuyển
              </ModernButton>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Toast 
          show={toast.show} 
          type={toast.type} 
          message={toast.message} 
          onClose={hideToast}
        />
        
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

        <PaymentReviewModal
          show={paymentReviewModal}
          transaction={selectedPaymentTransaction}
          storeStock={selectedPaymentTransaction ? getStockForTransaction(selectedPaymentTransaction) : null}
          onConfirm={handleConfirmPayment}
          onReject={handleRejectPayment}
          onClose={() => {
            setPaymentReviewModal(false);
            setSelectedPaymentTransaction(null);
          }}
        />

        {/* Header */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
              <Package className="w-8 h-8 text-white" />
            </div>
            Quản lý đơn hàng từ đại lý
          </h1>
          <p className="text-gray-600 mt-2 ml-[60px]">Xử lý yêu cầu nhập hàng từ Dealer Manager và Staff</p>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-100">Chờ xử lý</p>
                <p className="text-3xl font-bold mt-1">{pendingOrders.length}</p>
              </div>
              <Clock className="w-10 h-10 text-white/80" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-100">Xem biên lai</p>
                <p className="text-3xl font-bold mt-1">{paymentReviewOrders.length}</p>
              </div>
              <Upload className="w-10 h-10 text-white/80" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-100">Đang xử lý</p>
                <p className="text-3xl font-bold mt-1">{processingOrders.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-white/80" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-100">Vận chuyển</p>
                <p className="text-3xl font-bold mt-1">{inTransitOrders.length}</p>
              </div>
              <Truck className="w-10 h-10 text-white/80" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-xl p-5 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">Hoàn thành</p>
                <p className="text-3xl font-bold mt-1">{completedOrders.length}</p>
              </div>
              <Package className="w-10 h-10 text-white/80" />
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => setActiveTab('pending')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Chờ xử lý</span>
                {pendingOrders.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'pending' ? 'bg-white/30' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {pendingOrders.length}
                  </span>
                )}
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('payment_review')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'payment_review'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                <span>Xem biên lai</span>
                {paymentReviewOrders.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'payment_review' ? 'bg-white/30' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {paymentReviewOrders.length}
                  </span>
                )}
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('processing')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'processing'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Đang xử lý</span>
                {processingOrders.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'processing' ? 'bg-white/30' : 'bg-teal-100 text-teal-600'
                  }`}>
                    {processingOrders.length}
                  </span>
                )}
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('in_transit')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'in_transit'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Truck className="w-5 h-5" />
                <span>Vận chuyển</span>
                {inTransitOrders.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'in_transit' ? 'bg-white/30' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {inTransitOrders.length}
                  </span>
                )}
              </div>
            </motion.button>

            <motion.button
              onClick={() => setActiveTab('completed')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'completed'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package className="w-5 h-5" />
                <span>Hoàn thành</span>
                {completedOrders.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'completed' ? 'bg-white/30' : 'bg-green-100 text-green-600'
                  }`}>
                    {completedOrders.length}
                  </span>
                )}
              </div>
            </motion.button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {transactionsStatus === 'loading' ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : transactionsStatus === 'failed' ? (
                <div className="text-center py-16 bg-red-50 rounded-xl border border-red-200 p-6">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-red-900 mb-2">Không thể tải dữ liệu</h3>
                  <p className="text-red-700 mb-4">
                    {transactionsError?.includes('1004') || transactionsError?.includes('Không tìm thấy store')
                      ? 'Backend đang yêu cầu storeId nhưng EVM Staff không có storeId. Vui lòng liên hệ backend team để sửa API.'
                      : transactionsError || 'Đã xảy ra lỗi khi tải transactions'}
                  </p>
                  <ModernButton
                    onClick={() => dispatch(getAllTransactionsThunk())}
                    variant="primary"
                    size="md"
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    Thử lại
                  </ModernButton>
                </div>
              ) : pendingOrders.length === 0 ? (
                <EmptyState
                  title="Không có đơn hàng chờ xử lý"
                  description="Các đơn hàng mới sẽ xuất hiện ở đây"
                  icon="clock"
                  roleColor="green"
                />
              ) : (
                pendingOrders.map((order, index) => renderOrderCard(order, index))
              )}
            </motion.div>
          )}

          {activeTab === 'payment_review' && (
            <motion.div
              key="payment_review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {transactionsStatus === 'loading' ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : paymentReviewOrders.length === 0 ? (
                <EmptyState
                  title="Không có biên lai cần xem"
                  description="Các biên lai thanh toán cần duyệt sẽ xuất hiện ở đây"
                  icon="upload"
                  roleColor="green"
                />
              ) : (
                paymentReviewOrders.map((order, index) => renderOrderCard(order, index))
              )}
            </motion.div>
          )}

          {activeTab === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {transactionsStatus === 'loading' ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : processingOrders.length === 0 ? (
                <EmptyState
                  title="Không có đơn hàng đang xử lý"
                  description="Các đơn hàng đã xác nhận sẽ xuất hiện ở đây"
                  icon="check"
                  roleColor="green"
                />
              ) : (
                processingOrders.map((order, index) => renderOrderCard(order, index))
              )}
            </motion.div>
          )}

          {activeTab === 'in_transit' && (
            <motion.div
              key="in_transit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {transactionsStatus === 'loading' ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : inTransitOrders.length === 0 ? (
                <EmptyState
                  title="Không có đơn hàng đang vận chuyển"
                  description="Các đơn hàng đang giao sẽ xuất hiện ở đây"
                  icon="truck"
                  roleColor="green"
                />
              ) : (
                inTransitOrders.map((order, index) => renderOrderCard(order, index))
              )}
            </motion.div>
          )}

          {activeTab === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {transactionsStatus === 'loading' ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : completedOrders.length === 0 ? (
                <EmptyState
                  title="Chưa có đơn hàng hoàn thành"
                  description="Các đơn hàng đã giao thành công sẽ xuất hiện ở đây"
                  icon="package"
                  roleColor="green"
                />
              ) : (
                completedOrders.map((order, index) => renderOrderCard(order, index))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DealerOrderManagement;

