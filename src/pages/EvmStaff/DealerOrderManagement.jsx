import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllTransactionsThunk,
  acceptTransactionThunk,
  rejectTransactionThunk,
  startShippingTransactionThunk,
} from '../../store/slices/inventoryTransactionSlice';
import { getAllStoreStocksThunk } from '../../store/slices/store-stockSlice';
import { showError, showSuccess, showWarning } from '../../store/slices/snackbarSlice';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

function DealerOrderManagement() {
  const dispatch = useDispatch();
  
  const { toast, hideToast } = useToast();
  const { confirm, showConfirm } = useConfirm();

  const transactions = useSelector((s) => s.inventoryTransactions.items);
  const transactionsStatus = useSelector((s) => s.inventoryTransactions.status);
  const storeStocks = useSelector((s) => s.storeStocks.items);

  useEffect(() => {
    dispatch(getAllTransactionsThunk());
    dispatch(getAllStoreStocksThunk());
  }, [dispatch]);

  // Lọc các orders chưa xử lý (PENDING)
  const pendingOrders = useMemo(() => {
    return transactions.filter(t => {
      const statusUpper = (t.status || '').toUpperCase();
      return statusUpper === 'PENDING';
    });
  }, [transactions]);

  // Lọc các orders đã được accept (ACCEPTED/APPROVED/CONFIRMED)
  const acceptedOrders = useMemo(() => {
    const filtered = transactions.filter(t => {
      const statusUpper = (t.status || '').toUpperCase();
      const isAccepted = statusUpper === 'ACCEPTED' || 
                         statusUpper === 'APPROVED' || 
                         statusUpper === 'CONFIRMED';
      return isAccepted;
    });
    return filtered;
  }, [transactions]);

  // Lọc các orders đang vận chuyển (SHIPPING/IN_TRANSIT)
  const shippingOrders = useMemo(() => {
    return transactions.filter(t => {
      const statusUpper = (t.status || '').toUpperCase();
      return statusUpper === 'SHIPPING' || statusUpper === 'IN_TRANSIT';
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

  return (
    <div className="max-w-7xl mx-auto">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              🚗
            </motion.span>
            Quản lý đơn hàng từ đại lý
          </h1>
          <p className="text-gray-600 mt-1">Xử lý yêu cầu nhập hàng từ Manager và Dealer Staff</p>
        </motion.div>

        {/* Pending Orders from Dealers */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Đơn hàng chờ xử lý
            </h2>
            <motion.div
              className="text-sm text-gray-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⏳ {pendingOrders.length} đơn đang chờ
            </motion.div>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Mã đơn</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Stock ID</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Model • Màu</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Cửa hàng</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Số lượng</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Ngày giao dự kiến</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Trạng thái</th>
                  <th className="px-4 py-2 text-right text-sm text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {pendingOrders.length === 0 && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                        Không có đơn hàng nào chờ xử lý
                      </td>
                    </motion.tr>
                  )}
                  {pendingOrders.map((order, index) => {
                    const stock = storeStocks.find(s => s.stockId === order.storeStockId);
                    const deliveryDate = order.deliveryDate 
                      ? new Date(order.deliveryDate).toLocaleDateString('vi-VN') 
                      : 'Chưa xác định';

                    return (
                      <motion.tr 
                        key={order.inventoryId || order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#f9fafb' }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">#{order.inventoryId || order.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{order.storeStockId}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {stock ? stock.storeName || `Store #${stock.storeId}` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">{order.importQuantity} xe</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{deliveryDate}</td>
                        <td className="px-4 py-2 text-sm">
                          <motion.span 
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium inline-flex items-center gap-1"
                            animate={{ 
                              backgroundColor: ['#fef3c7', '#fde68a', '#fef3c7']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            ⏳ Chờ xử lý
                          </motion.span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="inline-flex gap-2">
                            <motion.button 
                              onClick={() => handleAccept(order)} 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Chấp nhận
                            </motion.button>
                            <motion.button 
                              onClick={() => handleReject(order)} 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Từ chối
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Accepted Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Đơn hàng đã chấp nhận ({acceptedOrders.length})
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Mã đơn</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Model • Màu</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Cửa hàng</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Số lượng</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Ngày giao dự kiến</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Trạng thái</th>
                  <th className="px-4 py-2 text-right text-sm text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {acceptedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                      Không có đơn hàng nào đã chấp nhận
                    </td>
                  </tr>
                ) : (
                  acceptedOrders.map((order, index) => {
                    const stock = storeStocks.find(s => s.stockId === order.storeStockId);
                    
                    return (
                      <motion.tr 
                        key={order.inventoryId || order.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#eff6ff' }}
                        className="hover:bg-blue-50"
                      >
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">#{order.inventoryId || order.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {stock ? stock.storeName || `Store #${stock.storeId}` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">{order.importQuantity} xe</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {order.deliveryDate 
                            ? new Date(order.deliveryDate).toLocaleDateString('vi-VN')
                            : 'Chưa xác định'
                          }
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            Đã chấp nhận
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <motion.button 
                            onClick={() => handleStartShipping(order)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 flex items-center gap-1 ml-auto"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Bắt đầu vận chuyển
                          </motion.button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Shipping Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Đơn hàng đang vận chuyển ({shippingOrders.length})
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Mã đơn</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Model • Màu</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Cửa hàng</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Số lượng</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Ngày giao dự kiến</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shippingOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      Không có đơn hàng nào đang vận chuyển
                    </td>
                  </tr>
                ) : (
                  shippingOrders.map((order, index) => {
                    const stock = storeStocks.find(s => s.stockId === order.storeStockId);
                    const statusUpper = (order.status || '').toUpperCase();
                    
                    return (
                      <motion.tr 
                        key={order.inventoryId || order.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: '#faf5ff' }}
                        className="hover:bg-purple-50"
                      >
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">#{order.inventoryId || order.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {stock ? stock.storeName || `Store #${stock.storeId}` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">{order.importQuantity} xe</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {order.deliveryDate 
                            ? new Date(order.deliveryDate).toLocaleDateString('vi-VN')
                            : 'Chưa xác định'
                          }
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <motion.span 
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium inline-flex items-center gap-1"
                            animate={{ 
                              backgroundColor: ['#f3e8ff', '#e9d5ff', '#f3e8ff']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            🚚 Đang vận chuyển
                          </motion.span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

    </div>
  );
}

export default DealerOrderManagement;

