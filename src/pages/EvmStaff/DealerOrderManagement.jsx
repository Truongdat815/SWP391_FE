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
  RefreshCw,
  ArrowUpDown,
  X
} from 'lucide-react';
import { 
  getAllTransactionsThunk,
  acceptTransactionThunk,
  rejectTransactionThunk,
  startShippingTransactionThunk,
  confirmPaymentTransactionThunk,
} from '../../store/slices/inventoryTransactionSlice';
import { getAllStoreStocksThunk } from '../../store/slices/store-stockSlice';
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { getAllModelColorsThunk } from '../../store/slices/modelColorSlice';
import { showError, showSuccess, showWarning } from '../../store/slices/snackbarSlice';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
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
  const models = useSelector((s) => s.models.items);
  const modelColors = useSelector((s) => s.modelColors.items);

  // Tab state - load from localStorage or default to 'pending'
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('dealerOrderActiveTab');
    return savedTab || 'pending';
  });
  const [sortOrder, setSortOrder] = useState('updated'); // 'newest', 'oldest', or 'updated'
  
  // Save activeTab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('dealerOrderActiveTab', activeTab);
  }, [activeTab]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    // Initial load only - no auto-refresh, no polling
    dispatch(getAllTransactionsThunk());
    dispatch(getAllStoreStocksThunk());
    dispatch(getAllModelsThunk());
    dispatch(getAllModelColorsThunk());
  }, [dispatch]);

  // Filter and sort orders by status
  const pendingOrders = useMemo(() => {
    const filtered = transactions.filter(t => (t.status || '').toUpperCase() === 'PENDING');
    return [...filtered].sort((a, b) => {
      if (sortOrder === 'updated') {
        // Sort by updatedAt (most recent update first), fallback to createdAt
        const dateA = new Date(a.updatedAt || a.createdAt || a.orderDate || a.transactionDate || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || b.orderDate || b.transactionDate || 0).getTime();
        return dateB - dateA; // Most recently updated first
      } else if (sortOrder === 'newest') {
        // Sort by creation date (newest first)
        const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
        const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
        return dateB - dateA; // Newest first
      } else {
        // Sort by creation date (oldest first)
        const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
        const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
        return dateA - dateB; // Oldest first
      }
    });
  }, [transactions, sortOrder]);

  const paymentReviewOrders = useMemo(() => {
    const filtered = transactions.filter(t => (t.status || '').toUpperCase() === 'FILE_UPLOADED');
    return [...filtered].sort((a, b) => {
      if (sortOrder === 'updated') {
        const dateA = new Date(a.updatedAt || a.createdAt || a.orderDate || a.transactionDate || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || b.orderDate || b.transactionDate || 0).getTime();
        return dateB - dateA;
      } else if (sortOrder === 'newest') {
        const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
        const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
        return dateB - dateA;
      } else {
        const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
        const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
        return dateA - dateB;
      }
    });
  }, [transactions, sortOrder]);

  const processingOrders = useMemo(() => {
    const filtered = transactions.filter(t => {
      const statusUpper = (t.status || '').toUpperCase();
      return statusUpper === 'CONFIRMED' || statusUpper === 'PAYMENT_CONFIRMED';
    });
    return [...filtered].sort((a, b) => {
      if (sortOrder === 'updated') {
        const dateA = new Date(a.updatedAt || a.createdAt || a.orderDate || a.transactionDate || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || b.orderDate || b.transactionDate || 0).getTime();
        return dateB - dateA;
      } else if (sortOrder === 'newest') {
        const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
        const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
        return dateB - dateA;
      } else {
        const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
        const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
        return dateA - dateB;
      }
    });
  }, [transactions, sortOrder]);

  const inTransitOrders = useMemo(() => {
    const filtered = transactions.filter(t => (t.status || '').toUpperCase() === 'IN_TRANSIT');
    return [...filtered].sort((a, b) => {
      if (sortOrder === 'updated') {
        const dateA = new Date(a.updatedAt || a.createdAt || a.orderDate || a.transactionDate || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || b.orderDate || b.transactionDate || 0).getTime();
        return dateB - dateA;
      } else if (sortOrder === 'newest') {
        const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
        const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
        return dateB - dateA;
      } else {
        const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
        const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
        return dateA - dateB;
      }
    });
  }, [transactions, sortOrder]);

  const completedOrders = useMemo(() => {
    const filtered = transactions.filter(t => {
      const statusUpper = (t.status || '').toUpperCase();
      return statusUpper === 'DELIVERED' || statusUpper === 'COMPLETED';
    });
    return [...filtered].sort((a, b) => {
      if (sortOrder === 'updated') {
        const dateA = new Date(a.updatedAt || a.createdAt || a.orderDate || a.transactionDate || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || b.orderDate || b.transactionDate || 0).getTime();
        return dateB - dateA;
      } else if (sortOrder === 'newest') {
        const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
        const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
        return dateB - dateA;
      } else {
        const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
        const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
        return dateA - dateB;
      }
    });
  }, [transactions, sortOrder]);

  // Handle accept transaction
  const handleAccept = async (order) => {
    const confirmed = await showConfirm({
      message: `Bạn có chắc chắn muốn chấp nhận đơn hàng #${order.inventoryId || order.id}?`,
      type: 'info'
    });
    if (!confirmed) return;

    try {
      await dispatch(acceptTransactionThunk(order.inventoryId || order.id)).unwrap();
      dispatch(showSuccess({ message: '✅ Đã chấp nhận đơn hàng!' }));
      // No manual refresh - polling will update automatically
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
      // No manual refresh - polling will update automatically
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
      // No manual refresh - polling will update automatically
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể bắt đầu vận chuyển' }));
    }
  };

  // Handle confirm payment
  const handleConfirmPayment = async (transaction) => {
    const confirmed = await showConfirm({
      message: `Bạn có chắc chắn muốn xác nhận thanh toán cho đơn hàng #${transaction.inventoryId || transaction.id}?`,
      type: 'info'
    });
    if (!confirmed) return;

    try {
      await dispatch(confirmPaymentTransactionThunk(transaction.inventoryId || transaction.id)).unwrap();
      dispatch(showSuccess({ message: '✅ Đã xác nhận thanh toán thành công!' }));
      // No manual refresh - polling will update automatically
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể xác nhận thanh toán' }));
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

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `lúc ${hours}:${minutes} ${day} tháng ${month}, ${year}`;
  };

  // Handle open detail modal
  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  // Handle close detail modal
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  // Render order card (compact version)
  const renderOrderCard = (order, index) => {
    const stock = getStockForTransaction(order);
    const statusUpper = (order.status || '').toUpperCase();
    
    // Get model and color names from transaction
    const transactionModel = models.find(m => m.modelId === order.modelId);
    const transactionColor = modelColors.find(mc => 
      mc.modelId === order.modelId && 
      mc.colorId === order.colorId
    );
    const modelName = transactionModel?.modelName || stock?.modelName || 'N/A';
    const colorName = transactionColor?.colorName || stock?.colorName || 'N/A';
    
    return (
      <motion.div
        key={order.inventoryId || order.id || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => handleOpenDetail(order)}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      >
        {/* Compact Order Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <div>
                <h3 className="text-sm font-bold">Đơn hàng #{order.inventoryId || order.id}</h3>
                <p className="text-xs text-blue-100">
                  {formatDateTime(order.orderDate || order.createdAt || order.transactionDate)}
                </p>
              </div>
            </div>
            <StatusBadge status={order.status} size="sm" />
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Compact Order Status Stepper */}
          <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
            <OrderStatusStepper currentStatus={order.status} size="sm" />
          </div>

          {/* Compact Order Details */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Model • Màu</p>
              <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                {modelName} - {colorName}
              </p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Số lượng</p>
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Package className="w-3 h-3" />
                {order.importQuantity} xe
              </p>
            </div>
            <div className="bg-white rounded-lg p-2 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Tổng giá</p>
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatPrice(order.totalPrice || 0)} VNĐ
              </p>
            </div>
          </div>

          {/* Actions - only show for actionable statuses */}
          {(statusUpper === 'PENDING' || statusUpper === 'FILE_UPLOADED' || statusUpper === 'PAYMENT_CONFIRMED') && (
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
              {statusUpper === 'PENDING' && (
                <>
                  <ModernButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(order);
                    }}
                    variant="danger"
                    size="sm"
                    icon={<XCircle className="w-3 h-3" />}
                  >
                    Từ chối
                  </ModernButton>
                  <ModernButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(order);
                    }}
                    variant="success"
                    size="sm"
                    icon={<CheckCircle className="w-3 h-3" />}
                  >
                    Chấp nhận
                  </ModernButton>
                </>
              )}
              {statusUpper === 'FILE_UPLOADED' && (
                <ModernButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConfirmPayment(order);
                  }}
                  roleColor="teal"
                  size="sm"
                  icon={<CheckCircle className="w-3 h-3" />}
                >
                  Xác nhận thanh toán
                </ModernButton>
              )}
              {statusUpper === 'PAYMENT_CONFIRMED' && (
                <ModernButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartShipping(order);
                  }}
                  roleColor="purple"
                  size="sm"
                  icon={<Truck className="w-3 h-3" />}
                >
                  Bắt đầu vận chuyển
                </ModernButton>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Render detail modal
  const renderDetailModal = () => {
    if (!selectedOrder) return null;

    const stock = getStockForTransaction(selectedOrder);
    const statusUpper = (selectedOrder.status || '').toUpperCase();
    
    // Get model and color names
    const transactionModel = models.find(m => m.modelId === selectedOrder.modelId);
    const transactionColor = modelColors.find(mc => 
      mc.modelId === selectedOrder.modelId && 
      mc.colorId === selectedOrder.colorId
    );
    const modelName = transactionModel?.modelName || stock?.modelName || 'N/A';
    const colorName = transactionColor?.colorName || stock?.colorName || 'N/A';

    return (
      <AnimatePresence>
        {showDetailModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={handleCloseDetail}
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
              className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Đơn hàng #{selectedOrder.inventoryId || selectedOrder.id}</h3>
                      <p className="text-sm text-blue-100">
                        {formatDateTime(selectedOrder.orderDate || selectedOrder.createdAt || selectedOrder.transactionDate)}
                      </p>
                    </div>
                  </div>
                  {(statusUpper === 'DELIVERED' || statusUpper === 'COMPLETED') && (
                    <div className="px-4 py-2 bg-green-500 rounded-lg text-white font-semibold text-sm">
                      Đã giao hàng
                    </div>
                  )}
                  <button
                    onClick={handleCloseDetail}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Order Status Stepper */}
                <div className="bg-white rounded-xl p-5 border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Tiến trình đơn hàng
                  </h4>
                  <OrderStatusStepper currentStatus={selectedOrder.status} size="sm" />
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 mb-2">Model • Màu</p>
                    <p className="text-sm font-bold text-gray-900">
                      {modelName} - {colorName}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 mb-2">Số lượng</p>
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {selectedOrder.importQuantity} xe
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 mb-2">Ngày giao hàng</p>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-500">Chưa xác định</span>
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-500 mb-2">Tổng giá</p>
                    <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {formatPrice(selectedOrder.totalPrice || 0)} VNĐ
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                {selectedOrder.totalPrice > 0 && (selectedOrder.unitBasePrice || selectedOrder.discountPercentage > 0) && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      Chi tiết giá
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.unitBasePrice && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Đơn giá:</span>
                          <span className="font-medium text-gray-900">{formatPrice(selectedOrder.unitBasePrice)} VNĐ</span>
                        </div>
                      )}
                      {selectedOrder.totalBasePrice && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tổng cơ bản:</span>
                          <span className="font-medium text-gray-900">{formatPrice(selectedOrder.totalBasePrice)} VNĐ</span>
                        </div>
                      )}
                      {selectedOrder.discountPercentage > 0 && selectedOrder.totalBasePrice && (
                        <div className="flex justify-between text-sm text-orange-600">
                          <span>Giảm giá ({selectedOrder.discountPercentage}%):</span>
                          <span className="font-medium">
                            -{formatPrice(Math.round(selectedOrder.totalBasePrice * (selectedOrder.discountPercentage / 100)))} VNĐ
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t-2 border-emerald-200 flex justify-between">
                        <span className="text-sm font-bold text-gray-900">Tổng thanh toán:</span>
                        <span className="text-lg font-bold text-emerald-600">{formatPrice(selectedOrder.totalPrice)} VNĐ</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Completion Status */}
                {(statusUpper === 'DELIVERED' || statusUpper === 'COMPLETED') && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        Đã hoàn thành và cập nhật vào kho
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  {statusUpper === 'PENDING' && (
                    <>
                      <ModernButton
                        onClick={() => handleReject(selectedOrder)}
                        variant="danger"
                        size="md"
                        icon={<XCircle className="w-4 h-4" />}
                      >
                        Từ chối
                      </ModernButton>
                      <ModernButton
                        onClick={() => handleAccept(selectedOrder)}
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
                      onClick={() => handleConfirmPayment(selectedOrder)}
                      roleColor="teal"
                      size="md"
                      icon={<CheckCircle className="w-4 h-4" />}
                    >
                      Xác nhận thanh toán
                    </ModernButton>
                  )}
                  {statusUpper === 'PAYMENT_CONFIRMED' && (
                    <ModernButton
                      onClick={() => handleStartShipping(selectedOrder)}
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
          </motion.div>
        )}
      </AnimatePresence>
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

        {/* Order Detail Modal */}
        {renderDetailModal()}

        {/* Header */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                  <Package className="w-8 h-8 text-white" />
                </div>
                Quản lý đơn hàng từ đại lý
              </h1>
              <p className="text-gray-600 mt-2 ml-[60px]">Xử lý yêu cầu nhập hàng từ Dealer Manager và Staff</p>
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white text-sm min-w-[180px]"
              >
                <option value="updated">Cập nhật mới nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>
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
                <p className="text-sm font-medium text-amber-100">Xác nhận thanh toán</p>
                <p className="text-3xl font-bold mt-1">{paymentReviewOrders.length}</p>
              </div>
              <CreditCard className="w-10 h-10 text-white/80" />
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
                <CreditCard className="w-5 h-5" />
                <span>Xác nhận thanh toán</span>
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
                  title="Không có thanh toán cần xác nhận"
                  description="Các đơn hàng đã upload biên lai cần xác nhận sẽ xuất hiện ở đây"
                  icon="credit-card"
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

