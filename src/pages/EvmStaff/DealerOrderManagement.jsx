import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllTransactionsThunk,
  updateTransactionThunk,
  deleteTransactionThunk,
} from '../../store/slices/inventoryTransactionSlice';
import { getAllStoreStocksThunk, updateStockQuantityThunk } from '../../store/slices/store-stockSlice';
import { showError, showSuccess, showWarning } from '../../store/slices/snackbarSlice';

function DealerOrderManagement() {
  const dispatch = useDispatch();

  const transactions = useSelector((s) => s.inventoryTransactions.items);
  const storeStocks = useSelector((s) => s.storeStocks.items);

  const [processModal, setProcessModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processData, setProcessData] = useState({
    unitBasePrice: '',
    discountPercentage: 0,
    deposit: 0,
  });

  useEffect(() => {
    dispatch(getAllTransactionsThunk());
    dispatch(getAllStoreStocksThunk());
  }, [dispatch]);

  // Lọc các orders chưa xử lý (PENDING hoặc REQUESTED)
  // Có thể từ Manager hoặc Dealer Staff
  const pendingOrders = useMemo(() => {
    return transactions.filter(t => {
      const hasQuantity = t.importQuantity && t.importQuantity > 0;
      const hasDeliveryDate = t.deliveryDate != null;
      const hasStoreStock = t.storeStockId != null;
      
      // Kiểm tra status: PENDING hoặc REQUESTED
      let isPending = false;
      if (t.status) {
        const statusUpper = (t.status || '').toUpperCase();
        isPending = statusUpper === 'PENDING' || statusUpper === 'REQUESTED';
      } else {
        // Fallback: Nếu không có status, kiểm tra giá
        isPending = (t.unitBasePrice === 0 || t.unitBasePrice === null) && 
                    (t.totalPrice === 0 || t.totalPrice === null);
      }
      
      return hasQuantity && isPending && hasDeliveryDate && hasStoreStock;
    });
  }, [transactions]);

  // Lọc các orders đang xử lý (đã approve nhưng chưa complete)
  const processingOrders = useMemo(() => {
    return transactions.filter(t => {
      const statusUpper = t.status ? (t.status || '').toUpperCase() : '';
      
      // Đơn đang xử lý: có status PROCESSING hoặc đã có giá nhưng chưa COMPLETED
      if (statusUpper === 'PROCESSING') {
        return true;
      }
      
      // Fallback: Đã có giá nhưng chưa complete
      const hasPrice = t.unitBasePrice && t.unitBasePrice > 0;
      const hasTotalPrice = t.totalPrice && t.totalPrice > 0;
      const notCompleted = statusUpper !== 'COMPLETED' && statusUpper !== 'FINISH';
      
      return hasPrice && hasTotalPrice && notCompleted;
    });
  }, [transactions]);

  const handleOpenProcess = (order) => {
    setSelectedOrder(order);
    setProcessData({
      unitBasePrice: order.unitBasePrice || '',
      discountPercentage: order.discountPercentage || 0,
      deposit: order.deposit || 0,
    });
    setProcessModal(true);
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!processData.unitBasePrice) {
      dispatch(showWarning({ message: 'Vui lòng nhập giá nhập' }));
      return;
    }

    const unit = parseFloat(processData.unitBasePrice);
    const qty = selectedOrder.importQuantity;
    const discount = parseFloat(processData.discountPercentage) || 0;
    const total = unit * qty * (1 - discount / 100);
    const deposit = parseFloat(processData.deposit) || 0;
    const dept = total - deposit;

    try {
      await dispatch(updateTransactionThunk({
        inventoryId: selectedOrder.inventoryId || selectedOrder.id,
        payload: {
          ...selectedOrder, // Giữ nguyên tất cả fields
          unitBasePrice: unit,
          importQuantity: qty,
          discountPercentage: discount,
          totalPrice: total,
          deposit,
          dept,
          transactionDate: new Date().toISOString(),
          status: 'PROCESSING' // Set status khi approve
        }
      })).unwrap();
      dispatch(showSuccess({ message: '✅ Đã duyệt đơn hàng và bắt đầu xử lý!' }));
      setProcessModal(false);
      setSelectedOrder(null);
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể xử lý đơn hàng' }));
    }
  };

  const handleReject = async (order) => {
    if (!window.confirm(`Bạn có chắc chắn muốn từ chối đơn hàng #${order.inventoryId || order.id}? Đơn hàng sẽ bị xóa và không được cập nhật vào kho.`)) {
      return;
    }

    try {
      // Có thể update status thành REJECTED hoặc xóa luôn
      // Ở đây ta xóa để clean data (backend có thể không hỗ trợ REJECTED status)
      await dispatch(deleteTransactionThunk(order.inventoryId || order.id)).unwrap();
      dispatch(showSuccess({ message: '❌ Đã từ chối đơn hàng. Đơn hàng đã bị xóa.' }));
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể từ chối đơn hàng' }));
    }
  };

  const handleComplete = async (order) => {
    if (!window.confirm(`Xác nhận đơn hàng #${order.inventoryId || order.id} đã giao xong và cập nhật ${order.importQuantity} xe vào kho?`)) {
      return;
    }

    try {
      // Bước 1: Cập nhật số lượng trong store_stock
      const currentStock = storeStocks.find(s => s.stockId === order.storeStockId);
      if (currentStock) {
        const newQuantity = currentStock.quantity + order.importQuantity;
        
        await dispatch(updateStockQuantityThunk({
          stockId: order.storeStockId,
          quantity: newQuantity
        })).unwrap();
        
        // Bước 2: Update transaction với status COMPLETED
        // Thay vì xóa, ta update status để Manager có thể xem lại lịch sử
        try {
          await dispatch(updateTransactionThunk({
            inventoryId: order.inventoryId || order.id,
            payload: {
              ...order,
              status: 'COMPLETED' // hoặc 'FINISH'
            }
          })).unwrap();
        } catch (updateError) {
          // Nếu backend không hỗ trợ update status, xóa transaction
          await dispatch(deleteTransactionThunk(order.inventoryId || order.id)).unwrap();
        }
        
        dispatch(showSuccess({ 
          message: `✅ Hoàn thành đơn #${order.inventoryId || order.id}! Đã cập nhật +${order.importQuantity} xe vào kho (tổng: ${newQuantity} xe)` 
        }));
      } else {
        dispatch(showWarning({ 
          message: 'Không tìm thấy stock để cập nhật số lượng' 
        }));
      }

      // Refresh data
      dispatch(getAllTransactionsThunk());
      dispatch(getAllStoreStocksThunk());
      
    } catch (error) {
      dispatch(showError({ 
        message: error?.message || 'Không thể hoàn thành đơn hàng' 
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <motion.div 
          className="mb-6"
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
                    const statusUpper = order.status ? (order.status || '').toUpperCase() : '';
                    const isFromManager = statusUpper === 'PENDING';

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
                            className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1 ${
                              isFromManager 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                            animate={{ 
                              backgroundColor: isFromManager 
                                ? ['#f3e8ff', '#e9d5ff', '#f3e8ff']
                                : ['#fef3c7', '#fde68a', '#fef3c7']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {isFromManager ? '📋 Từ Manager' : '👤 Từ Staff'}
                          </motion.span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="inline-flex gap-2">
                            <motion.button 
                              onClick={() => handleOpenProcess(order)} 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Duyệt
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

        {/* Processing Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Đơn hàng đang xử lý ({processingOrders.length})
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Mã đơn</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Model • Màu</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Cửa hàng</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Số lượng</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Giá nhập</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Tổng tiền</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Còn nợ</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Trạng thái</th>
                  <th className="px-4 py-2 text-right text-sm text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processingOrders.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                      Không có đơn hàng nào đang xử lý
                    </td>
                  </tr>
                )}
                {processingOrders.map((order, index) => {
                  const stock = storeStocks.find(s => s.stockId === order.storeStockId);
                  
                  return (
                    <motion.tr 
                      key={order.inventoryId || order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ backgroundColor: '#f0fdf4' }}
                      className="hover:bg-green-50"
                    >
                      <td className="px-4 py-2 text-sm text-gray-900 font-medium">#{order.inventoryId || order.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {stock ? stock.storeName || `Store #${stock.storeId}` : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 font-medium">{order.importQuantity} xe</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {order.unitBasePrice?.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                        {order.totalPrice?.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-red-600">
                        {order.dept?.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <motion.span 
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium inline-flex items-center gap-1"
                          animate={{ 
                            backgroundColor: ['#f3e8ff', '#e9d5ff', '#f3e8ff']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang xử lý
                        </motion.span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <motion.button 
                          onClick={() => handleComplete(order)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded text-sm hover:from-green-700 hover:to-emerald-700 flex items-center gap-1 ml-auto shadow-lg"
                        >
                          <motion.svg 
                            className="w-4 h-4" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </motion.svg>
                          Hoàn thành
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Process Order Modal */}
      <AnimatePresence>
        {processModal && selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setProcessModal(false)}
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
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-6">
                <motion.div
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <motion.span
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      ✅
                    </motion.span>
                    Duyệt và xử lý đơn hàng
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Nhập giá và tính toán chi phí cho đơn hàng</p>
                </motion.div>
                <motion.button 
                  onClick={() => setProcessModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

            <form onSubmit={handleProcess} className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mã đơn:</span>
                  <span className="text-sm font-medium">#{selectedOrder.inventoryId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock ID:</span>
                  <span className="text-sm font-medium">{selectedOrder.storeStockId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Số lượng:</span>
                  <span className="text-sm font-medium">{selectedOrder.importQuantity} xe</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Giá nhập (VNĐ) *</label>
                  <input 
                    type="number" 
                    value={processData.unitBasePrice} 
                    onChange={(e) => setProcessData({ ...processData, unitBasePrice: e.target.value })} 
                    className="w-full border rounded px-3 py-2" 
                    required 
                    min="0"
                    step="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Chiết khấu (%)</label>
                  <input 
                    type="number" 
                    value={processData.discountPercentage} 
                    onChange={(e) => setProcessData({ ...processData, discountPercentage: e.target.value })} 
                    className="w-full border rounded px-3 py-2" 
                    min="0"
                    max="100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Đặt cọc (VNĐ)</label>
                  <input 
                    type="number" 
                    value={processData.deposit} 
                    onChange={(e) => setProcessData({ ...processData, deposit: e.target.value })} 
                    className="w-full border rounded px-3 py-2" 
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              {processData.unitBasePrice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-medium">
                        {(parseFloat(processData.unitBasePrice || 0) * selectedOrder.importQuantity * (1 - (parseFloat(processData.discountPercentage || 0) / 100))).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã cọc:</span>
                      <span className="font-medium">{parseFloat(processData.deposit || 0).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-gray-900 font-medium">Còn nợ:</span>
                      <span className="font-bold text-blue-900">
                        {(parseFloat(processData.unitBasePrice || 0) * selectedOrder.importQuantity * (1 - (parseFloat(processData.discountPercentage || 0) / 100)) - parseFloat(processData.deposit || 0)).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <motion.button 
                  type="button" 
                  onClick={() => setProcessModal(false)}
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </motion.button>
                <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.05, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg font-medium flex items-center gap-2"
                >
                  <motion.svg 
                    className="w-5 h-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                  Duyệt và xử lý
                </motion.button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DealerOrderManagement;

