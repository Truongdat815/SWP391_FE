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
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { 
  getAllTransactionsThunk,
  createTransactionThunk,
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
  const modelColorsStatus = useSelector((s) => s.modelColors.status);
  const modelColorsError = useSelector((s) => s.modelColors.error);
  const models = useSelector((s) => s.models.items);
  const modelsStatus = useSelector((s) => s.models.status);
  const modelsError = useSelector((s) => s.models.error);

  const [createModal, setCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    storeId: '',
    storeName: '',
    modelId: '',
    modelName: '',
    quantity: ''
  });

  const [updateQuantityModal, setUpdateQuantityModal] = useState(false);
  const [updatePriceModal, setUpdatePriceModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [updateQuantity, setUpdateQuantity] = useState('');
  const [updatePrice, setUpdatePrice] = useState('');
  const [requestData, setRequestData] = useState({
    storeStockId: '',
    stockInfo: null,
    importQuantity: '',
    deliveryDate: '',
    reason: ''
  });

  // Inventory view states (like Dealer Staff)
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModels, setExpandedModels] = useState(new Set());
  const [reportModal, setReportModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [reportData, setReportData] = useState({
    vehicleModel: '',
    color: '',
    currentStock: 0,
    requestedQuantity: 0,
    reason: '',
    priority: 'medium',
    expectedDelivery: ''
  });

  useEffect(() => {
    dispatch(getAllStoreStocksThunk());
    dispatch(getAllTransactionsThunk());
    dispatch(getAllModelColorsThunk());
    dispatch(getAllModelsThunk());
  }, [dispatch]);

  // Tính tổng giá tự động
  const selectedModel = models.find(m => String(m.modelId) === String(createData.modelId));
  const unitPrice = selectedModel?.price || 0;
  const totalPrice = unitPrice * (parseInt(createData.quantity) || 0);

  const myStoreId = user?.storeId;

  // Transform API data to match UI format (inventory view)
  useEffect(() => {
    if (storeStocksStatus === 'succeeded') {
      if (storeStocks.length > 0) {
        // Filter by my store
        const myStoreStocks = storeStocks.filter(s => s.storeId === myStoreId);
        
        // Group by model
        const groupedByModel = myStoreStocks.reduce((acc, stock) => {
          const modelName = stock.modelName;
          
          if (!acc[modelName]) {
            acc[modelName] = {
              id: stock.modelId,
              model: modelName,
              totalStock: 0,
              colors: []
            };
          }
          
          acc[modelName].totalStock += stock.quantity;
          acc[modelName].colors.push({
            color: stock.colorName,
            stock: stock.quantity,
            price: stock.priceOfStore,
            stockId: stock.stockId,
            storeName: stock.storeName,
            storeId: stock.storeId
          });
          
          return acc;
        }, {});
        
        const transformedInventory = Object.values(groupedByModel);
        setInventory(transformedInventory);
        setFilteredInventory(transformedInventory);
      } else {
        setInventory([]);
        setFilteredInventory([]);
      }
    }
  }, [storeStocks, storeStocksStatus, myStoreId]);

  // Filter inventory based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter(vehicle =>
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.colors.some(colorItem => 
          colorItem.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
          colorItem.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredInventory(filtered);
    }
  }, [searchTerm, inventory]);

  // Helper functions for inventory view
  const toggleExpanded = (modelId) => {
    const newExpanded = new Set(expandedModels);
    if (newExpanded.has(modelId)) {
      newExpanded.delete(modelId);
    } else {
      newExpanded.add(modelId);
    }
    setExpandedModels(newExpanded);
  };

  const getColorPreview = (colorName) => {
    const colorMap = {
      'Trắng Ngọc Trai': 'bg-white border border-gray-300',
      'Đen Bóng': 'bg-black',
      'Xanh Dương Đậm': 'bg-blue-800',
      'Đỏ Ruby': 'bg-red-600',
      'Bạc Metallic': 'bg-gray-400',
      'Xám Titan': 'bg-gray-600'
    };
    return colorMap[colorName] || 'bg-gray-300';
  };

  const handleReportToManager = (vehicle, colorItem) => {
    setSelectedVehicle(vehicle);
    setSelectedColor(colorItem);
    setReportData({
      vehicleModel: vehicle.model,
      color: colorItem.color,
      currentStock: colorItem.stock,
      requestedQuantity: 0,
      reason: '',
      priority: 'medium',
      expectedDelivery: ''
    });
    setReportModal(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    
    if (reportData.requestedQuantity <= 0) {
      dispatch(showWarning({ message: 'Vui lòng nhập số lượng cần đặt hàng lớn hơn 0!' }));
      return;
    }

    if (!reportData.reason.trim()) {
      dispatch(showWarning({ message: 'Vui lòng nhập lý do đặt hàng!' }));
      return;
    }

    if (!reportData.expectedDelivery) {
      dispatch(showWarning({ message: 'Vui lòng chọn ngày giao hàng dự kiến!' }));
      return;
    }

    try {
      // Map to inventory_transaction payload
      const payload = {
        inventoryId: 0,
        unitBasePrice: 0,
        importQuantity: parseInt(reportData.requestedQuantity),
        discountPercentage: 0,
        totalPrice: 0,
        deposit: 0,
        dept: 0,
        transactionDate: new Date().toISOString(),
        deliveryDate: new Date(reportData.expectedDelivery).toISOString(),
        storeStockId: selectedColor.stockId,
        status: 'PENDING' // Manager sends as PENDING to EVM
      };

      await dispatch(createTransactionThunk(payload)).unwrap();

      dispatch(showSuccess({ 
        message: `Đã gửi yêu cầu đặt hàng tới EVM! Mẫu xe: ${reportData.vehicleModel}, Màu: ${reportData.color}, Số lượng: ${reportData.requestedQuantity}` 
      }));

      // Refresh transactions
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể gửi yêu cầu đặt hàng' }));
      return;
    }
    
    setReportModal(false);
    setSelectedVehicle(null);
    setSelectedColor(null);
    setReportData({
      vehicleModel: '',
      color: '',
      currentStock: 0,
      requestedQuantity: 0,
      reason: '',
      priority: 'medium',
      expectedDelivery: ''
    });
  };

  const handleCloseReportModal = () => {
    setReportModal(false);
    setSelectedVehicle(null);
    setSelectedColor(null);
    setReportData({
      vehicleModel: '',
      color: '',
      currentStock: 0,
      requestedQuantity: 0,
      reason: '',
      priority: 'medium',
      expectedDelivery: ''
    });
  };

  const myStocks = useMemo(() => {
    return storeStocks.filter(s => s.storeId === myStoreId);
  }, [storeStocks, myStoreId]);

  const pendingRequests = useMemo(() => {
    const myStockIds = new Set(myStocks.map(s => s.stockId));
    const filtered = transactions.filter(t => {
      // Check status - PENDING hoặc REQUESTED (từ Dealer Staff)
      let isPending = false;
      if (t.status) {
        const statusUpper = (t.status || '').toUpperCase();
        isPending = statusUpper === 'PENDING' || statusUpper === 'REQUESTED';
      } else {
        // Fallback: unitBasePrice và totalPrice = 0 nghĩa là chưa được xử lý
        isPending = (t.unitBasePrice === 0 || t.unitBasePrice === null) && 
                    (t.totalPrice === 0 || t.totalPrice === null);
      }
      
      const belongsToMyStore = myStockIds.has(t.storeStockId) || (t.storeStock && t.storeStock.storeId === myStoreId);
      
      return isPending && belongsToMyStore;
    });
    
    return filtered;
  }, [transactions, myStocks, myStoreId]);

  // Lấy các request đã hoàn thành
  const completedRequests = useMemo(() => {
    const myStockIds = new Set(myStocks.map(s => s.stockId));
    return transactions.filter(t => {
      const statusUpper = t.status ? (t.status || '').toUpperCase() : '';
      const isCompleted = statusUpper === 'COMPLETED' || statusUpper === 'FINISH';
      const belongsToMyStore = myStockIds.has(t.storeStockId) || (t.storeStock && t.storeStock.storeId === myStoreId);
      return isCompleted && belongsToMyStore;
    });
  }, [transactions, myStocks, myStoreId]);

  // LUỒNG 2 CẤP: Manager chỉ xem, không approve/reject
  // EVM Staff sẽ xử lý trực tiếp các request từ Dealer Staff

  const openCreate = () => {
    setCreateData({
      storeId: user?.storeId || '',
      storeName: user?.storeName || '',
      modelId: '',
      modelName: '',
      quantity: ''
    });
    setCreateModal(true);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    
    if (!createData.modelId || !createData.quantity || parseInt(createData.quantity) <= 0) {
      dispatch(showWarning({ message: 'Vui lòng chọn model và nhập số lượng hợp lệ!' }));
      return;
    }

    if (!selectedModel) {
      dispatch(showError({ message: 'Không tìm thấy thông tin model!' }));
      return;
    }

    try {
      // Lấy màu mặc định từ model_colors (hoặc màu đầu tiên)
      const modelColor = modelColors.find(mc => String(mc.modelId) === String(createData.modelId));
      
      if (!modelColor) {
        dispatch(showError({ message: 'Model này chưa có màu sắc được cấu hình. Vui lòng liên hệ EVM.' }));
        return;
      }

      const payload = {
        stockId: 0,
        storeId: parseInt(createData.storeId),
        storeName: createData.storeName,
        modelId: parseInt(createData.modelId),
        modelName: createData.modelName,
        colorId: parseInt(modelColor.colorId),
        colorName: modelColor.colorName,
        priceOfStore: unitPrice, // Sử dụng giá từ model
        quantity: parseInt(createData.quantity)
      };
      
      await dispatch(createStoreStockThunk(payload)).unwrap();
      dispatch(showSuccess({ message: `Đã thêm ${createData.quantity} xe ${createData.modelName} vào kho. Tổng giá: ${totalPrice.toLocaleString('vi-VN')} VNĐ` }));
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

  // Handler tạo request gửi EVM
  const handleOpenRequest = (stock) => {
    setRequestData({
      storeStockId: stock.stockId,
      stockInfo: stock,
      importQuantity: '',
      deliveryDate: '',
      reason: ''
    });
    setRequestModal(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!requestData.importQuantity || parseInt(requestData.importQuantity) <= 0) {
      dispatch(showWarning({ message: 'Vui lòng nhập số lượng lớn hơn 0!' }));
      return;
    }

    if (!requestData.deliveryDate) {
      dispatch(showWarning({ message: 'Vui lòng chọn ngày giao hàng dự kiến!' }));
      return;
    }

    if (!requestData.reason.trim()) {
      dispatch(showWarning({ message: 'Vui lòng nhập lý do nhập hàng!' }));
      return;
    }

    try {
      const payload = {
        inventoryId: 0,
        unitBasePrice: 0,
        importQuantity: parseInt(requestData.importQuantity),
        discountPercentage: 0,
        totalPrice: 0,
        deposit: 0,
        dept: 0,
        transactionDate: new Date().toISOString(),
        deliveryDate: new Date(requestData.deliveryDate).toISOString(),
        storeStockId: requestData.storeStockId,
        status: 'PENDING'
      };

      await dispatch(createTransactionThunk(payload)).unwrap();
      dispatch(showSuccess({ 
        message: `✅ Đã gửi yêu cầu nhập hàng! ${requestData.stockInfo?.modelName} • ${requestData.stockInfo?.colorName}, Số lượng: ${requestData.importQuantity} xe` 
      }));
      
      setRequestModal(false);
      setRequestData({
        storeStockId: '',
        stockInfo: null,
        importQuantity: '',
        deliveryDate: '',
        reason: ''
      });
      
      // Refresh transactions
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể gửi yêu cầu nhập hàng' }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-gray-900">Quản lý kho đại lý</h1>
            <p className="text-gray-600">Quản lý tồn kho và gửi yêu cầu nhập hàng tới EVM</p>
          </motion.div>
          <div className="flex gap-3">
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
        </div>

        {/* Inventory View - Grouped by Model */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Theo dõi tồn kho</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm theo model, màu sắc, cửa hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="space-y-4">
            {filteredInventory.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                {/* Vehicle Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{vehicle.model}</h3>
                    <p className="text-gray-600">Tổng tồn: {vehicle.totalStock} xe</p>
                  </div>
                  <motion.button
                    onClick={() => toggleExpanded(vehicle.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <svg 
                      className={`h-4 w-4 mr-2 transition-transform ${expandedModels.has(vehicle.id) ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {expandedModels.has(vehicle.id) ? 'Ẩn chi tiết' : 'Xem chi tiết màu'}
                  </motion.button>
                </div>

                {/* Color Details Table */}
                {expandedModels.has(vehicle.id) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 overflow-hidden"
                  >
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Chi tiết màu sắc</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Màu sắc</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cửa hàng</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Số lượng tồn</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Giá bán (VNĐ)</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Thao tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {vehicle.colors.map((colorItem, index) => (
                              <tr key={index} className="hover:bg-gray-100">
                                <td className="py-3 px-4">
                                  <div className="flex items-center">
                                    <div className={`w-4 h-4 rounded-full mr-3 ${getColorPreview(colorItem.color)}`}></div>
                                    <span className="text-sm text-gray-900">{colorItem.color}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-900">{colorItem.storeName || `Store #${colorItem.storeId}`}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`text-sm font-medium ${
                                    colorItem.stock === 0 ? 'text-red-600' :
                                    colorItem.stock <= 3 ? 'text-yellow-600' :
                                    'text-green-600'
                                  }`}>
                                    {colorItem.stock} xe
                                    {colorItem.stock === 0 && ' (Hết hàng)'}
                                    {colorItem.stock > 0 && colorItem.stock <= 3 && ' (Sắp hết)'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-900">{colorItem.price.toLocaleString('vi-VN')} VNĐ</span>
                                </td>
                                <td className="py-3 px-4">
                                  <motion.button
                                    onClick={() => handleReportToManager(vehicle, colorItem)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium text-sm transition-colors"
                                    title="Đặt xe từ EVM"
                                  >
                                    Đặt xe
                                  </motion.button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          {filteredInventory.length === 0 && storeStocksStatus === 'succeeded' && (
            <div className="text-center py-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'Không tìm thấy xe nào' : 'Không có dữ liệu kho hàng'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Thử thay đổi từ khóa tìm kiếm.' 
                  : 'Kho hàng hiện tại chưa có xe nào.'
                }
              </p>
            </div>
          )}
        </motion.div>

        {/* Pending Requests */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Yêu cầu nhập hàng đang chờ</h2>
            <motion.div 
              className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⏳ Đang chờ EVM xử lý ({pendingRequests.length})
            </motion.div>
          </div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {pendingRequests.length === 0 && (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                        Không có yêu cầu nào đang chờ
                      </td>
                    </motion.tr>
                  )}
                  {pendingRequests.map((req, index) => {
                    const stock = myStocks.find(s => s.stockId === req.storeStockId);
                    const deliveryDate = req.deliveryDate ? new Date(req.deliveryDate).toLocaleDateString('vi-VN') : 'Chưa xác định';
                    const statusUpper = req.status ? (req.status || '').toUpperCase() : '';
                    
                    return (
                      <motion.tr 
                        key={req.inventoryId || req.id} 
                        className="hover:bg-gray-50"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="px-4 py-2 text-sm text-gray-900">#{req.inventoryId || req.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{req.storeStockId}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">{req.importQuantity} xe</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{deliveryDate}</td>
                        <td className="px-4 py-2 text-sm">
                          <motion.span 
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium inline-flex items-center gap-1"
                            animate={{ 
                              backgroundColor: ['#fef3c7', '#fde68a', '#fef3c7']
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Chờ EVM duyệt
                          </motion.span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Completed Requests */}
        {completedRequests.length > 0 && (
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Yêu cầu đã hoàn thành</h2>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">Mã</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">Model • Màu</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">Số lượng</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">Ngày hoàn thành</th>
                    <th className="px-4 py-2 text-left text-sm text-gray-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completedRequests.map((req, index) => {
                    const stock = myStocks.find(s => s.stockId === req.storeStockId);
                    return (
                      <motion.tr 
                        key={req.inventoryId || req.id} 
                        className="hover:bg-green-50"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="px-4 py-2 text-sm text-gray-900">#{req.inventoryId || req.id}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 font-medium">{req.importQuantity} xe</td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {req.transactionDate ? new Date(req.transactionDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            ✅ Hoàn thành
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

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
                        <motion.button 
                          onClick={() => handleOpenRequest(s)} 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 flex items-center gap-1"
                          title="Gửi yêu cầu nhập hàng tới EVM"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Gửi EVM
                        </motion.button>
                        <motion.button 
                          onClick={() => handleOpenUpdateQuantity(s)} 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          SL
                        </motion.button>
                        <motion.button 
                          onClick={() => handleOpenUpdatePrice(s)} 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-2 py-1 bg-amber-600 text-white rounded text-xs hover:bg-amber-700"
                        >
                          Giá
                        </motion.button>
                        <motion.button 
                          onClick={() => handleOpenDelete(s)} 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Xóa
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
              className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-2xl"
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
                  <label className="block text-sm text-gray-700 mb-1">Chọn Model xe <span className="text-red-500">*</span></label>
                  <select
                    value={createData.modelId}
                    onChange={(e) => {
                      const modelId = e.target.value;
                      const model = models.find(m => String(m.modelId) === modelId);
                      setCreateData({
                        ...createData,
                        modelId: modelId,
                        modelName: model?.modelName || ''
                      });
                    }}
                    className={`w-full border rounded px-3 py-2 ${
                      modelsStatus === 'loading' ? 'bg-gray-50 cursor-wait' : 
                      modelsStatus === 'failed' ? 'border-red-300' : 
                      'bg-white'
                    }`}
                    required
                    disabled={modelsStatus === 'loading'}
                  >
                    <option value="">
                      {modelsStatus === 'loading' 
                        ? '⏳ Đang tải danh sách...' 
                        : modelsStatus === 'failed'
                        ? '❌ Lỗi tải dữ liệu'
                        : models.length === 0
                        ? '⚠️ Không có dữ liệu'
                        : '-- Chọn model xe --'
                      }
                    </option>
                    {modelsStatus === 'succeeded' && models.length > 0 && models.map(model => (
                      <option key={model.modelId} value={model.modelId}>
                        {model.modelName} {model.price ? `(${model.price.toLocaleString('vi-VN')} VNĐ)` : ''}
                      </option>
                    ))}
                  </select>
                  {modelsStatus === 'loading' && (
                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tải danh sách model...
                    </p>
                  )}
                  {modelsStatus === 'failed' && modelsError && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {modelsError} - Vui lòng thử lại sau
                    </p>
                  )}
                  {modelsStatus === 'succeeded' && models.length === 0 && (
                    <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Chưa có model nào trong hệ thống
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Số lượng cần nhập <span className="text-red-500">*</span></label>
                  <motion.input
                    type="number"
                    min="1"
                    value={createData.quantity}
                    onChange={(e) => setCreateData({ ...createData, quantity: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                    whileFocus={{ scale: 1.02 }}
                    placeholder="Nhập số lượng xe"
                  />
                </div>
              </div>

              {/* Hiển thị thông tin giá tự động */}
              {selectedModel && createData.quantity && parseInt(createData.quantity) > 0 && (
                <motion.div 
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Thông tin giá tự động
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Model</label>
                      <p className="text-sm font-medium text-gray-900">{selectedModel.modelName}</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Giá đơn vị</label>
                      <p className="text-sm font-bold text-blue-600">{unitPrice.toLocaleString('vi-VN')} VNĐ/xe</p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Tổng giá</label>
                      <p className="text-lg font-bold text-purple-600">{totalPrice.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Số lượng:</span>
                      <span className="text-sm font-semibold text-gray-900">{createData.quantity} xe</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-700">Công thức:</span>
                      <span className="text-xs text-gray-600">{createData.quantity} × {unitPrice.toLocaleString('vi-VN')} = {totalPrice.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  </div>
                </motion.div>
              )}
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
              className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-md"
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
              className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-md"
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

      {/* Request Modal - Gửi yêu cầu nhập hàng tới EVM */}
      <AnimatePresence>
        {requestModal && requestData.stockInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setRequestModal(false)}
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
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                      📦
                    </motion.span>
                    Gửi yêu cầu nhập hàng tới EVM
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Yêu cầu sẽ được gửi tới EVM để duyệt và xử lý</p>
                </motion.div>
                <motion.button 
                  onClick={() => setRequestModal(false)} 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-6">
                {/* Stock Info */}
                <motion.div 
                  className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thông tin xe
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Model</label>
                      <p className="text-sm font-medium text-gray-900">{requestData.stockInfo.modelName}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Màu sắc</label>
                      <p className="text-sm font-medium text-gray-900">{requestData.stockInfo.colorName}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Tồn kho hiện tại</label>
                      <p className="text-sm font-medium text-gray-900">{requestData.stockInfo.quantity} xe</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Giá bán</label>
                      <p className="text-sm font-medium text-gray-900">
                        {requestData.stockInfo.priceOfStore?.toLocaleString('vi-VN')} VNĐ
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng cần nhập <span className="text-red-500">*</span>
                    </label>
                    <motion.input
                      type="number"
                      min="1"
                      value={requestData.importQuantity}
                      onChange={(e) => setRequestData({ ...requestData, importQuantity: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                      whileFocus={{ scale: 1.02 }}
                      placeholder="Nhập số lượng xe cần nhập"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày giao hàng dự kiến <span className="text-red-500">*</span>
                    </label>
                    <motion.input
                      type="date"
                      value={requestData.deliveryDate}
                      onChange={(e) => setRequestData({ ...requestData, deliveryDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                      whileFocus={{ scale: 1.02 }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do nhập hàng <span className="text-red-500">*</span>
                    </label>
                    <motion.textarea
                      value={requestData.reason}
                      onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                      required
                      whileFocus={{ scale: 1.01 }}
                      placeholder="Ví dụ: Tồn kho thấp, có đơn hàng lớn, nhu cầu khách hàng cao..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <motion.button 
                    type="button" 
                    onClick={() => setRequestModal(false)}
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
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg font-medium flex items-center gap-2"
                  >
                    <motion.svg 
                      className="w-5 h-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </motion.svg>
                    Gửi yêu cầu tới EVM
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
              className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-md"
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

      {/* Report/Order Modal */}
      <AnimatePresence>
        {reportModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseReportModal}
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
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Đặt hàng từ EVM
                </h3>
                <button
                  onClick={handleCloseReportModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                {/* Vehicle Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Thông tin xe</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mẫu xe</label>
                      <p className="text-sm text-gray-900">{reportData.vehicleModel}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${getColorPreview(reportData.color)}`}></div>
                        <p className="text-sm text-gray-900">{reportData.color}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tồn kho hiện tại</label>
                      <p className="text-sm text-gray-900">{reportData.currentStock} xe</p>
                    </div>
                  </div>
                </div>

                {/* Report Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng cần đặt hàng *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={reportData.requestedQuantity}
                      onChange={(e) => setReportData(prev => ({ ...prev, requestedQuantity: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mức độ ưu tiên *
                    </label>
                    <select
                      value={reportData.priority}
                      onChange={(e) => setReportData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="high">Cao - Cần đặt hàng ngay</option>
                      <option value="medium">Trung bình - Đặt hàng trong tuần</option>
                      <option value="low">Thấp - Có thể chờ đợi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày giao hàng dự kiến *
                    </label>
                    <input
                      type="date"
                      value={reportData.expectedDelivery}
                      onChange={(e) => setReportData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lý do đặt hàng *
                    </label>
                    <textarea
                      value={reportData.reason}
                      onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Nhập lý do đặt hàng..."
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <motion.button
                    type="button"
                    onClick={handleCloseReportModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
                  >
                    Gửi yêu cầu tới EVM
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

export default InventoryManagement;


