import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllStoreStocksThunk,
  updateStockQuantityThunk,
  updateStockPriceThunk,
  deleteStoreStockThunk,
  createStoreStockThunk,
} from '../../store/slices/store-stockSlice';
import { getAllModelColorsThunk } from '../../store/slices/modelColorSlice';
import { 
  getAllTransactionsThunk,
  updateTransactionThunk,
  deleteTransactionThunk,
} from '../../store/slices/inventoryTransactionSlice';
import { showError, showSuccess, showWarning } from '../../store/slices/snackbarSlice';
import Tooltip from '@/components/ui/Tooltip';

function InventoryManagement() {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const storeStocks = useSelector((s) => s.storeStocks.items);
  const storeStocksStatus = useSelector((s) => s.storeStocks.status);
  const transactions = useSelector((s) => s.inventoryTransactions.items);
  const modelColors = useSelector((s) => s.modelColors.items);

  const [createModal, setCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    storeId: '',
    storeName: '',
    modelId: '',
    modelName: '',
    colorId: '',
    colorName: '',
    priceOfStore: '',
    quantity: ''
  });

  const [updateQuantityModal, setUpdateQuantityModal] = useState(false);
  const [updatePriceModal, setUpdatePriceModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [updatePrice, setUpdatePrice] = useState('');

  const [approveModal, setApproveModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveData, setApproveData] = useState({
    unitBasePrice: '',
    importQuantity: '',
    discountPercentage: 0,
    deposit: 0,
  });

  useEffect(() => {
    dispatch(getAllStoreStocksThunk());
    dispatch(getAllTransactionsThunk());
    dispatch(getAllModelColorsThunk());
  }, [dispatch]);

  const myStoreId = user?.storeId;

  const myStocks = useMemo(() => {
    return storeStocks.filter(s => s.storeId === myStoreId);
  }, [storeStocks, myStoreId]);

  const pendingRequests = useMemo(() => {
    console.log('📊 All transactions:', transactions);
    console.log('🏪 My store ID:', myStoreId);
    console.log('📦 My stock IDs:', myStocks.map(s => s.stockId));
    
    const myStockIds = new Set(myStocks.map(s => s.stockId));
    const filtered = transactions.filter(t => {
      // Check status - nếu backend trả về status field
      let isPending = false;
      if (t.status) {
        isPending = (t.status || '').toUpperCase() === 'REQUESTED';
      } else {
        // Workaround: Nếu không có status, coi như REQUESTED nếu unitBasePrice và totalPrice = 0
        // (tức là chưa được Manager duyệt)
        isPending = (t.unitBasePrice === 0 || t.unitBasePrice === null) && 
                    (t.totalPrice === 0 || t.totalPrice === null);
      }
      
      const belongsToMyStore = myStockIds.has(t.storeStockId) || (t.storeStock && t.storeStock.storeId === myStoreId);
      
      console.log(`Transaction ${t.inventoryId}:`, {
        status: t.status,
        unitBasePrice: t.unitBasePrice,
        totalPrice: t.totalPrice,
        isPending,
        storeStockId: t.storeStockId,
        belongsToMyStore,
        included: isPending && belongsToMyStore
      });
      
      return isPending && belongsToMyStore;
    });
    
    console.log('✅ Filtered pending requests:', filtered);
    return filtered;
  }, [transactions, myStocks, myStoreId]);

  const handleOpenApprove = (req) => {
    setSelectedRequest(req);
    setApproveData({
      unitBasePrice: req.unitBasePrice || '',
      importQuantity: req.importQuantity || '',
      discountPercentage: req.discountPercentage || 0,
      deposit: req.deposit || 0,
    });
    setApproveModal(true);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    // Manager chỉ cần duyệt để chuyển cho EVM Staff
    // EVM Staff sẽ nhập giá và số lượng sau
    try {
      await dispatch(updateTransactionThunk({
        inventoryId: selectedRequest.inventoryId || selectedRequest.id,
        payload: {
          status: 'APPROVED',
          // Giữ nguyên các thông tin từ nhân viên
          importQuantity: selectedRequest.importQuantity,
          deliveryDate: selectedRequest.deliveryDate
        }
      })).unwrap();
      dispatch(showSuccess({ message: 'Đã duyệt yêu cầu và chuyển cho EVM Staff xử lý' }));
      setApproveModal(false);
      setSelectedRequest(null);
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể duyệt yêu cầu' }));
    }
  };

  const handleReject = async (req) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối và xóa yêu cầu này?')) {
      return;
    }
    
    try {
      // Manager từ chối = xóa request luôn
      await dispatch(deleteTransactionThunk(req.inventoryId || req.id)).unwrap();
      dispatch(showSuccess({ message: 'Đã từ chối và xóa yêu cầu' }));
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể xóa yêu cầu' }));
    }
  };

  const openCreate = () => {
    setCreateData({
      storeId: user?.storeId || '',
      storeName: user?.storeName || '',
      modelId: '',
      modelName: '',
      colorId: '',
      colorName: '',
      priceOfStore: '',
      quantity: ''
    });
    setCreateModal(true);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        stockId: 0,
        storeId: parseInt(createData.storeId),
        storeName: createData.storeName,
        modelId: parseInt(createData.modelId),
        modelName: createData.modelName,
        colorId: parseInt(createData.colorId),
        colorName: createData.colorName,
        priceOfStore: parseFloat(createData.priceOfStore),
        quantity: parseInt(createData.quantity)
      };
      await dispatch(createStoreStockThunk(payload)).unwrap();
      dispatch(showSuccess({ message: 'Đã thêm xe vào kho' }));
      setCreateModal(false);
      dispatch(getAllStoreStocksThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể thêm xe vào kho' }));
    }
  };

  const handleOpenUpdateQuantity = (stock) => {
    setSelectedStock(stock);
    setUpdateQuantity(stock.quantity || '');
    setUpdateQuantityModal(true);
  };

  const handleSubmitUpdateQuantity = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateStockQuantityThunk({
        stockId: selectedStock.stockId,
        quantity: parseInt(updateQuantity)
      })).unwrap();
      dispatch(showSuccess({ message: 'Đã cập nhật số lượng' }));
      setUpdateQuantityModal(false);
      setSelectedStock(null);
      dispatch(getAllStoreStocksThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể cập nhật số lượng' }));
    }
  };

  const handleOpenUpdatePrice = (stock) => {
    setSelectedStock(stock);
    setUpdatePrice(stock.priceOfStore || '');
    setUpdatePriceModal(true);
  };

  const handleSubmitUpdatePrice = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateStockPriceThunk({
        stockId: selectedStock.stockId,
        priceOfStore: parseFloat(updatePrice)
      })).unwrap();
      dispatch(showSuccess({ message: 'Đã cập nhật giá' }));
      setUpdatePriceModal(false);
      setSelectedStock(null);
      dispatch(getAllStoreStocksThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể cập nhật giá' }));
    }
  };

  const handleOpenDelete = (stock) => {
    setSelectedStock(stock);
    setDeleteModal(true);
  };

  const handleSubmitDelete = async () => {
    try {
      await dispatch(deleteStoreStockThunk(selectedStock.stockId)).unwrap();
      dispatch(showSuccess({ message: 'Đã xóa khỏi kho' }));
      setDeleteModal(false);
      setSelectedStock(null);
      dispatch(getAllStoreStocksThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể xóa' }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý kho đại lý</h1>
            <p className="text-gray-600">Quản lý tồn kho và duyệt yêu cầu nhập hàng</p>
          </div>
          <motion.button 
            onClick={openCreate} 
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm xe vào kho
            </span>
          </motion.button>
        </div>

        {/* Pending Requests */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Yêu cầu nhập hàng từ nhân viên</h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Mã</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Stock ID</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Model • Màu</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">SL đề xuất</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Ngày giao dự kiến</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Trạng thái</th>
                  <th className="px-4 py-2 text-right text-sm text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">Không có yêu cầu nào</td>
                  </tr>
                )}
                {pendingRequests.map((req) => {
                  // Tìm stock tương ứng để lấy model/color name
                  const stock = myStocks.find(s => s.stockId === req.storeStockId);
                  const deliveryDate = req.deliveryDate ? new Date(req.deliveryDate).toLocaleDateString('vi-VN') : 'Chưa xác định';
                  
                  return (
                    <tr key={req.inventoryId || req.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{req.inventoryId || req.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{req.storeStockId}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{req.importQuantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{deliveryDate}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          {req.status || 'REQUESTED'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="inline-flex gap-2">
                          <button onClick={() => handleOpenApprove(req)} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700">Duyệt</button>
                          <button onClick={() => handleReject(req)} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Từ chối</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stocks Table (simple) */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Danh sách tồn kho (cửa hàng của bạn)</h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Stock ID</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Model</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Màu</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Cửa hàng</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Số lượng</th>
                  <th className="px-4 py-2 text-left text-sm text-gray-700">Giá</th>
                  <th className="px-4 py-2 text-right text-sm text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {storeStocksStatus === 'succeeded' && myStocks.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">Chưa có xe nào trong kho</td>
                  </tr>
                )}
                {storeStocksStatus === 'succeeded' && myStocks.map(s => (
                  <tr key={s.stockId}>
                    <td className="px-4 py-2 text-sm">{s.stockId}</td>
                    <td className="px-4 py-2 text-sm">{s.modelName}</td>
                    <td className="px-4 py-2 text-sm">{s.colorName}</td>
                    <td className="px-4 py-2 text-sm">{s.storeName || `Store #${s.storeId}`}</td>
                    <td className="px-4 py-2 text-sm">{s.quantity}</td>
                    <td className="px-4 py-2 text-sm">{s.priceOfStore?.toLocaleString('vi-VN')} VNĐ</td>
                    <td className="px-4 py-2 text-right">
                      <div className="inline-flex gap-2">
                        <button onClick={() => handleOpenUpdateQuantity(s)} className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Cập nhật SL</button>
                        <button onClick={() => handleOpenUpdatePrice(s)} className="px-2 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700">Cập nhật giá</button>
                        <button onClick={() => handleOpenDelete(s)} className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      <AnimatePresence>
        {approveModal && selectedRequest && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setApproveModal(false)}
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Duyệt yêu cầu nhập hàng</h3>
                <button onClick={() => setApproveModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            <form onSubmit={handleApprove} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Lưu ý:</strong> Khi bạn duyệt yêu cầu này, nó sẽ được chuyển đến EVM Staff để xử lý đặt hàng.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mã yêu cầu:</span>
                  <span className="text-sm font-medium text-gray-900">#{selectedRequest.inventoryId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock ID:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedRequest.storeStockId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Số lượng đề xuất:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedRequest.importQuantity} xe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ngày giao dự kiến:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedRequest.deliveryDate ? new Date(selectedRequest.deliveryDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <motion.button 
                  type="button" 
                  onClick={() => setApproveModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </motion.button>
                <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  Xác nhận duyệt
                </motion.button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Stock Modal */}
      <AnimatePresence>
        {createModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setCreateModal(false)}
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
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl"
            >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thêm xe vào kho</h3>
              <button onClick={() => setCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmitCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Cửa hàng</label>
                  <input type="text" value={`${createData.storeName || ''} (#${createData.storeId || ''})`} disabled className="w-full border rounded px-3 py-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Chọn Model_Color</label>
                  <select
                    value={`${createData.modelId}|${createData.colorId}`}
                    onChange={(e) => {
                      const [mId, cId] = e.target.value.split('|');
                      const mc = modelColors.find(x => String(x.modelId) === mId && String(x.colorId) === cId);
                      setCreateData({
                        ...createData,
                        modelId: mId,
                        modelName: mc?.modelName || '',
                        colorId: cId,
                        colorName: mc?.colorName || ''
                      });
                    }}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">-- Chọn model • màu --</option>
                    {modelColors.map(mc => (
                      <option key={mc.modelColorId || `${mc.modelId}-${mc.colorId}`}
                        value={`${mc.modelId}|${mc.colorId}`}
                      >
                        {mc.modelName} • {mc.colorName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Giá bán (VNĐ)</label>
                  <input type="number" value={createData.priceOfStore} onChange={(e) => setCreateData({ ...createData, priceOfStore: e.target.value })} className="w-full border rounded px-3 py-2" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Số lượng</label>
                  <input type="number" value={createData.quantity} onChange={(e) => setCreateData({ ...createData, quantity: e.target.value })} className="w-full border rounded px-3 py-2" required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <motion.button 
                  type="button" 
                  onClick={() => setCreateModal(false)} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </motion.button>
                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  Thêm
                </motion.button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Quantity Modal */}
      <AnimatePresence>
        {updateQuantityModal && selectedStock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setUpdateQuantityModal(false)}
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
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cập nhật số lượng</h3>
                <button onClick={() => setUpdateQuantityModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            <form onSubmit={handleSubmitUpdateQuantity} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedStock.modelName} • {selectedStock.colorName}
                </p>
                <label className="block text-sm text-gray-700 mb-1">Số lượng mới</label>
                <input 
                  type="number" 
                  value={updateQuantity} 
                  onChange={(e) => setUpdateQuantity(e.target.value)} 
                  className="w-full border rounded px-3 py-2" 
                  required 
                  min="0"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <motion.button 
                  type="button" 
                  onClick={() => setUpdateQuantityModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </motion.button>
                <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  Cập nhật
                </motion.button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Price Modal */}
      <AnimatePresence>
        {updatePriceModal && selectedStock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setUpdatePriceModal(false)}
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
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cập nhật giá bán</h3>
                <button onClick={() => setUpdatePriceModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            <form onSubmit={handleSubmitUpdatePrice} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedStock.modelName} • {selectedStock.colorName}
                </p>
                <label className="block text-sm text-gray-700 mb-1">Giá bán mới (VNĐ)</label>
                <input 
                  type="number" 
                  value={updatePrice} 
                  onChange={(e) => setUpdatePrice(e.target.value)} 
                  className="w-full border rounded px-3 py-2" 
                  required 
                  min="0"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <motion.button 
                  type="button" 
                  onClick={() => setUpdatePriceModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </motion.button>
                <motion.button 
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-lg"
                >
                  Cập nhật
                </motion.button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && selectedStock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal(false)}
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
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Xác nhận xóa</h3>
                <button onClick={() => setDeleteModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Bạn có chắc chắn muốn xóa xe <strong>{selectedStock.modelName} • {selectedStock.colorName}</strong> khỏi kho?
                </p>
                <div className="flex justify-end gap-3 pt-2">
                  <motion.button 
                    type="button" 
                    onClick={() => setDeleteModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </motion.button>
                  <motion.button 
                    onClick={handleSubmitDelete}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                  >
                    Xóa
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

export default InventoryManagement;


