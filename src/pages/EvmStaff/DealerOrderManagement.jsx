import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

  // Lọc các orders chưa xử lý từ Dealer (unitBasePrice = 0)
  // LUỒNG 2 CẤP: Dealer Staff -> EVM Staff (bỏ Manager approval)
  const pendingOrders = useMemo(() => {
    console.log('📊 All transactions (EVM):', transactions);
    return transactions.filter(t => {
      // Hiển thị tất cả đơn chưa được EVM xử lý:
      // - unitBasePrice = 0 (chưa nhập giá)
      // - totalPrice = 0 (chưa tính)
      // - importQuantity > 0 (có số lượng)
      // - deliveryDate có giá trị (có ngày giao)
      // - storeStockId có giá trị (valid request)
      
      const hasQuantity = t.importQuantity && t.importQuantity > 0;
      const notProcessedYet = (t.unitBasePrice === 0 || t.unitBasePrice === null) && 
                              (t.totalPrice === 0 || t.totalPrice === null);
      const hasDeliveryDate = t.deliveryDate != null;
      const hasStoreStock = t.storeStockId != null;
      
      const shouldShow = hasQuantity && notProcessedYet && hasDeliveryDate && hasStoreStock;
      
      console.log(`Transaction ${t.inventoryId}:`, {
        unitBasePrice: t.unitBasePrice,
        totalPrice: t.totalPrice,
        importQuantity: t.importQuantity,
        deliveryDate: t.deliveryDate,
        storeStockId: t.storeStockId,
        shouldShow
      });
      
      return shouldShow;
    });
  }, [transactions]);

  // Lọc các orders đang xử lý (unitBasePrice > 0 nhưng chưa update stock)
  const processingOrders = useMemo(() => {
    return transactions.filter(t => {
      // Nếu có field status, dùng nó
      if (t.status && t.status.toUpperCase() === 'PROCESSING') {
        return true;
      }
      
      // Không có status: Đơn đang xử lý là đơn đã nhập giá (unitBasePrice > 0)
      // nhưng chưa hoàn thành (chưa update stock - ta không track được)
      // Tạm thời hiển thị tất cả đơn có unitBasePrice > 0
      const hasPrice = t.unitBasePrice && t.unitBasePrice > 0;
      const hasTotalPrice = t.totalPrice && t.totalPrice > 0;
      
      return hasPrice && hasTotalPrice;
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
          transactionDate: new Date().toISOString()
          // Không set status vì backend không có field này
        }
      })).unwrap();
      dispatch(showSuccess({ message: 'Đã xác nhận đơn hàng và bắt đầu xử lý' }));
      setProcessModal(false);
      setSelectedOrder(null);
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể xử lý đơn hàng' }));
    }
  };

  const handleReject = async (order) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối và xóa đơn hàng này?')) {
      return;
    }

    try {
      // Xóa request (vì không có status field để mark REJECTED)
      await dispatch(deleteTransactionThunk(order.inventoryId || order.id)).unwrap();
      dispatch(showSuccess({ message: 'Đã từ chối và xóa đơn hàng' }));
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể xóa đơn hàng' }));
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
        
        // Bước 2: Xóa transaction (vì không có status COMPLETED)
        // Transaction đã hoàn thành nhiệm vụ → xóa để clean data
        await dispatch(deleteTransactionThunk(order.inventoryId || order.id)).unwrap();
        
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng từ đại lý</h1>
          <p className="text-gray-600">Xử lý yêu cầu nhập hàng từ Dealer Staff</p>
        </div>

        {/* Pending Orders from Dealers */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Đơn hàng chờ xử lý ({pendingOrders.length})
          </h2>
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
                {pendingOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                      Không có đơn hàng nào chờ xử lý
                    </td>
                  </tr>
                )}
                {pendingOrders.map((order) => {
                  const stock = storeStocks.find(s => s.stockId === order.storeStockId);
                  const deliveryDate = order.deliveryDate 
                    ? new Date(order.deliveryDate).toLocaleDateString('vi-VN') 
                    : 'Chưa xác định';

                  return (
                    <tr key={order.inventoryId || order.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">#{order.inventoryId || order.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{order.storeStockId}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {stock ? stock.storeName || `Store #${stock.storeId}` : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{order.importQuantity} xe</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{deliveryDate}</td>
                      <td className="px-4 py-2 text-sm">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                          Chờ xử lý
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="inline-flex gap-2">
                          <button 
                            onClick={() => handleOpenProcess(order)} 
                            className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                          >
                            Xử lý
                          </button>
                          <button 
                            onClick={() => handleReject(order)} 
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Processing Orders */}
        <div>
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
                {processingOrders.map((order) => {
                  const stock = storeStocks.find(s => s.stockId === order.storeStockId);
                  
                  return (
                    <tr key={order.inventoryId || order.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">#{order.inventoryId || order.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {stock ? stock.storeName || `Store #${stock.storeId}` : 'N/A'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{order.importQuantity} xe</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {order.unitBasePrice?.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {order.totalPrice?.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-red-600">
                        {order.dept?.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button 
                          onClick={() => handleComplete(order)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1 ml-auto"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Hoàn thành
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Process Order Modal */}
      {processModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Xử lý đơn hàng</h3>
              <button onClick={() => setProcessModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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

              <div className="flex justify-end gap-3 pt-2 border-t">
                <button type="button" onClick={() => setProcessModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">
                  Xác nhận xử lý
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DealerOrderManagement;

