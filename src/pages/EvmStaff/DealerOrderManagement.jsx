import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllTransactionsThunk,
  updateTransactionThunk,
} from '../../store/slices/inventoryTransactionSlice';
import { getAllStoreStocksThunk } from '../../store/slices/store-stockSlice';
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

  // Lọc các orders đã được Manager duyệt (status = APPROVED)
  const approvedOrders = useMemo(() => {
    console.log('📊 All transactions (EVM):', transactions);
    return transactions.filter(t => {
      let isApproved = false;
      
      if (t.status) {
        // Nếu có status field, check APPROVED
        isApproved = (t.status || '').toUpperCase() === 'APPROVED';
      } else {
        // Workaround: Nếu không có status, coi như APPROVED nếu:
        // - unitBasePrice = 0 (chưa được EVM Staff nhập giá)
        // - totalPrice = 0 (chưa được tính)
        // - importQuantity > 0 (có số lượng đề xuất)
        // - deliveryDate có giá trị (đã được Staff tạo request)
        const hasQuantity = t.importQuantity && t.importQuantity > 0;
        const notProcessed = (t.unitBasePrice === 0 || t.unitBasePrice === null) && 
                            (t.totalPrice === 0 || t.totalPrice === null);
        const hasDeliveryDate = t.deliveryDate != null;
        
        // Thêm điều kiện: check xem có storeStockId không (request hợp lệ)
        isApproved = hasQuantity && notProcessed && hasDeliveryDate && t.storeStockId;
      }
      
      console.log(`Transaction ${t.inventoryId}:`, { 
        status: t.status,
        unitBasePrice: t.unitBasePrice,
        totalPrice: t.totalPrice,
        importQuantity: t.importQuantity,
        deliveryDate: t.deliveryDate,
        storeStockId: t.storeStockId,
        isApproved 
      });
      
      return isApproved;
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
          unitBasePrice: unit,
          importQuantity: qty,
          discountPercentage: discount,
          totalPrice: total,
          deposit,
          dept,
          status: 'PROCESSING',
          transactionDate: new Date().toISOString()
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
    if (!window.confirm('Bạn có chắc chắn muốn từ chối đơn hàng này?')) {
      return;
    }

    try {
      await dispatch(updateTransactionThunk({
        inventoryId: order.inventoryId || order.id,
        payload: { status: 'REJECTED' }
      })).unwrap();
      dispatch(showSuccess({ message: 'Đã từ chối đơn hàng' }));
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể từ chối đơn hàng' }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng từ đại lý</h1>
          <p className="text-gray-600">Xử lý yêu cầu nhập hàng đã được Manager duyệt</p>
        </div>

        {/* Orders from Dealers */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Đơn hàng chờ xử lý ({approvedOrders.length})
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
                {approvedOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                      Không có đơn hàng nào chờ xử lý
                    </td>
                  </tr>
                )}
                {approvedOrders.map((order) => {
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
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {order.status || 'APPROVED'}
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
                  <label className="block text-sm text-gray-700 mb-1">Giá nhập (USD) *</label>
                  <input 
                    type="number" 
                    value={processData.unitBasePrice} 
                    onChange={(e) => setProcessData({ ...processData, unitBasePrice: e.target.value })} 
                    className="w-full border rounded px-3 py-2" 
                    required 
                    min="0"
                    step="0.01"
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
                  <label className="block text-sm text-gray-700 mb-1">Đặt cọc (USD)</label>
                  <input 
                    type="number" 
                    value={processData.deposit} 
                    onChange={(e) => setProcessData({ ...processData, deposit: e.target.value })} 
                    className="w-full border rounded px-3 py-2" 
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {processData.unitBasePrice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-medium">
                        ${(parseFloat(processData.unitBasePrice || 0) * selectedOrder.importQuantity * (1 - (parseFloat(processData.discountPercentage || 0) / 100))).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đã cọc:</span>
                      <span className="font-medium">${parseFloat(processData.deposit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className="text-gray-900 font-medium">Còn nợ:</span>
                      <span className="font-bold text-blue-900">
                        ${(parseFloat(processData.unitBasePrice || 0) * selectedOrder.importQuantity * (1 - (parseFloat(processData.discountPercentage || 0) / 100)) - parseFloat(processData.deposit || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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

