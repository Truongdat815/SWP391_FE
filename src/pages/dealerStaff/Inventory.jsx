import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { getAllStoreStocksThunk, createStoreStockThunk, updateStockQuantityThunk, updateStockPriceThunk, deleteStoreStockThunk } from '../../store/slices/store-stockSlice';
import { createTransactionThunk } from '../../store/slices/inventoryTransactionSlice';
import { showSuccess, showError, showWarning } from '../../store/slices/snackbarSlice';

function Inventory() {
  const dispatch = useDispatch();
  const { user, getStoreId } = useAuth();
  
  // Redux state
  const storeStocks = useSelector((state) => state.storeStocks.items);
  const storeStocksStatus = useSelector((state) => state.storeStocks.status);
  const storeStocksError = useSelector((state) => state.storeStocks.error);
  
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModels, setExpandedModels] = useState(new Set());
  const [reportModal, setReportModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [updateQuantityModal, setUpdateQuantityModal] = useState(false);
  const [updatePriceModal, setUpdatePriceModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [reportData, setReportData] = useState({
    vehicleModel: '',
    color: '',
    currentStock: 0,
    requestedQuantity: 0,
    reason: '',
    priority: 'medium',
    expectedDelivery: ''
  });
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
  const [updateData, setUpdateData] = useState({
    newQuantity: '',
    newPrice: ''
  });

  // Fetch all store stocks from API
  useEffect(() => {
    dispatch(getAllStoreStocksThunk());
  }, [dispatch]);

  // Transform API data to match UI format
  useEffect(() => {
    if (storeStocksStatus === 'succeeded') {
      if (storeStocks.length > 0) {
        // Group by model
        const groupedByModel = storeStocks.reduce((acc, stock) => {
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
        // No data available
        setInventory([]);
        setFilteredInventory([]);
      }
    }
  }, [storeStocks, storeStocksStatus]);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

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
        status: 'REQUESTED'
      };

      await dispatch(createTransactionThunk(payload)).unwrap();

      dispatch(showSuccess({ 
        message: `Đã gửi yêu cầu đặt hàng! Mẫu xe: ${reportData.vehicleModel}, Màu: ${reportData.color}, Số lượng: ${reportData.requestedQuantity}` 
      }));
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

  const handleCloseModal = () => {
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

  // Create Store Stock handlers
  const handleOpenCreateModal = () => {
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

  const handleCloseCreateModal = () => {
    setCreateModal(false);
    setCreateData({
      storeId: '',
      storeName: '',
      modelId: '',
      modelName: '',
      colorId: '',
      colorName: '',
      priceOfStore: '',
      quantity: ''
    });
  };

  const handleCreateDataChange = (field, value) => {
    setCreateData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!createData.storeId || !createData.modelId || !createData.colorId || 
        !createData.priceOfStore || !createData.quantity) {
      dispatch(showWarning({ message: 'Vui lòng điền đầy đủ thông tin!' }));
      return;
    }

    if (parseFloat(createData.priceOfStore) <= 0) {
      dispatch(showWarning({ message: 'Giá bán phải lớn hơn 0!' }));
      return;
    }

    if (parseInt(createData.quantity) <= 0) {
      dispatch(showWarning({ message: 'Số lượng phải lớn hơn 0!' }));
      return;
    }

    try {
      // Prepare payload according to new API: modelId, colorId, priceOfStore, quantity
      const payload = {
        modelId: parseInt(createData.modelId),
        colorId: parseInt(createData.colorId),
        priceOfStore: parseFloat(createData.priceOfStore) || 0,
        quantity: parseInt(createData.quantity)
      };

      await dispatch(createStoreStockThunk(payload)).unwrap();
      
      dispatch(showSuccess({ message: 'Thêm xe vào kho thành công!' }));
      handleCloseCreateModal();
      
      // Refresh data
      dispatch(getAllStoreStocksThunk());
      
    } catch (error) {
      console.error('Error creating store stock:', error);
      dispatch(showError({ message: `Lỗi khi thêm xe vào kho: ${error.message || 'Có lỗi xảy ra'}` }));
    }
  };

  // Update handlers
  const handleOpenUpdateQuantity = (colorItem) => {
    setSelectedStock(colorItem);
    setUpdateData({ newQuantity: colorItem.stock.toString(), newPrice: '' });
    setUpdateQuantityModal(true);
  };

  const handleOpenUpdatePrice = (colorItem) => {
    setSelectedStock(colorItem);
    setUpdateData({ newQuantity: '', newPrice: colorItem.price.toString() });
    setUpdatePriceModal(true);
  };

  const handleOpenDelete = (colorItem) => {
    setSelectedStock(colorItem);
    setDeleteModal(true);
  };

  const handleCloseUpdateModals = () => {
    setUpdateQuantityModal(false);
    setUpdatePriceModal(false);
    setDeleteModal(false);
    setSelectedStock(null);
    setUpdateData({ newQuantity: '', newPrice: '' });
  };

  const handleUpdateQuantity = async (e) => {
    e.preventDefault();
    
    if (!updateData.newQuantity || parseInt(updateData.newQuantity) < 0) {
      dispatch(showWarning({ message: 'Vui lòng nhập số lượng hợp lệ!' }));
      return;
    }

    try {
      await dispatch(updateStockQuantityThunk({
        stockId: selectedStock.stockId,
        quantity: parseInt(updateData.newQuantity)
      })).unwrap();
      
      dispatch(showSuccess({ message: 'Cập nhật số lượng thành công!' }));
      handleCloseUpdateModals();
      dispatch(getAllStoreStocksThunk());
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      const errorMessage = error.message || 'Có lỗi xảy ra';
      dispatch(showError({ message: `Lỗi khi cập nhật số lượng: ${errorMessage}` }));
    }
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    
    if (!updateData.newPrice || parseFloat(updateData.newPrice) <= 0) {
      dispatch(showWarning({ message: 'Vui lòng nhập giá bán hợp lệ!' }));
      return;
    }

    try {
      await dispatch(updateStockPriceThunk({
        stockId: selectedStock.stockId,
        priceOfStore: parseFloat(updateData.newPrice)
      })).unwrap();
      
      dispatch(showSuccess({ message: 'Cập nhật giá bán thành công!' }));
      handleCloseUpdateModals();
      dispatch(getAllStoreStocksThunk());
      
    } catch (error) {
      console.error('Error updating price:', error);
      dispatch(showError({ message: `Lỗi khi cập nhật giá bán: ${error.message || 'Có lỗi xảy ra'}` }));
    }
  };

  const handleDeleteStock = async () => {
    if (!selectedStock) return;

    try {
      await dispatch(deleteStoreStockThunk(selectedStock.stockId)).unwrap();
      
      dispatch(showSuccess({ message: 'Xóa xe khỏi kho thành công!' }));
      handleCloseUpdateModals();
      dispatch(getAllStoreStocksThunk());
      
    } catch (error) {
      console.error('Error deleting stock:', error);
      dispatch(showError({ message: `Lỗi khi xóa xe khỏi kho: ${error.message || 'Có lỗi xảy ra'}` }));
    }
  };

  // Loading state
  if (storeStocksStatus === 'loading') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu kho hàng...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (storeStocksStatus === 'failed') {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
              <p className="text-gray-600 mb-4">{storeStocksError || 'Không thể tải dữ liệu kho hàng'}</p>
              <button
                onClick={() => dispatch(getAllStoreStocksThunk())}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
              <p className="text-gray-600">Theo dõi tồn kho tất cả cửa hàng và lập báo cáo đặt xe</p>
              {user && user.storeId && (
                <p className="text-sm text-emerald-600 mt-1">
                  Cửa hàng của bạn: {user.storeName || `Store #${user.storeId}`}
                </p>
              )}
            </div>
            {/* Dealer Staff cannot create stock */}
          </div>
        </div>

        {/* Search Bar */}

        <div className="mb-4">
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
              onChange={handleSearchChange}
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
                <button
                  onClick={() => toggleExpanded(vehicle.id)}
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
                </button>
              </div>

              {/* Color Details Table */}
              {expandedModels.has(vehicle.id) && (
                <div className="mt-4 overflow-hidden">
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
                                <div className="flex flex-wrap gap-1">
                                  {/* Dealer Staff: only request button */}
                                  <button
                                    onClick={() => handleReportToManager(vehicle, colorItem)}
                                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                    title="Báo cáo đặt hàng"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
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
                : 'Kho hàng hiện tại chưa có xe nào. Vui lòng liên hệ quản lý để thêm xe vào kho.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Create Store Stock Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Thêm xe vào kho
              </h3>
              <button
                onClick={handleCloseCreateModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitCreate} className="space-y-4">
              {/* Store Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin cửa hàng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Cửa hàng *
                    </label>
                    <input
                      type="number"
                      value={createData.storeId}
                      onChange={(e) => handleCreateDataChange('storeId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên cửa hàng *
                    </label>
                    <input
                      type="text"
                      value={createData.storeName}
                      onChange={(e) => handleCreateDataChange('storeName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin xe</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Model *
                    </label>
                    <input
                      type="number"
                      value={createData.modelId}
                      onChange={(e) => handleCreateDataChange('modelId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên model *
                    </label>
                    <input
                      type="text"
                      value={createData.modelName}
                      onChange={(e) => handleCreateDataChange('modelName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Màu sắc *
                    </label>
                    <input
                      type="number"
                      value={createData.colorId}
                      onChange={(e) => handleCreateDataChange('colorId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên màu sắc *
                    </label>
                    <input
                      type="text"
                      value={createData.colorName}
                      onChange={(e) => handleCreateDataChange('colorName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Price and Quantity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Giá bán và số lượng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá bán (VNĐ) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={createData.priceOfStore}
                      onChange={(e) => handleCreateDataChange('priceOfStore', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Ví dụ: 320000000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={createData.quantity}
                      onChange={(e) => handleCreateDataChange('quantity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Ví dụ: 5"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Thêm vào kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Quantity Modal */}
      {updateQuantityModal && selectedStock && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cập nhật số lượng
              </h3>
              <button
                onClick={handleCloseUpdateModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateQuantity} className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Thông tin xe</h4>
                <p className="text-sm text-gray-600">
                  <strong>Model:</strong> {selectedStock.modelName || 'N/A'}<br/>
                  <strong>Màu:</strong> {selectedStock.color}<br/>
                  <strong>Cửa hàng:</strong> {selectedStock.storeName || 'N/A'}<br/>
                  <strong>Số lượng hiện tại:</strong> {selectedStock.stock} xe
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng mới *
                </label>
                <input
                  type="number"
                  min="0"
                  value={updateData.newQuantity}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, newQuantity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseUpdateModals}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Price Modal */}
      {updatePriceModal && selectedStock && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cập nhật giá bán
              </h3>
              <button
                onClick={handleCloseUpdateModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdatePrice} className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Thông tin xe</h4>
                <p className="text-sm text-gray-600">
                  <strong>Model:</strong> {selectedStock.modelName || 'N/A'}<br/>
                  <strong>Màu:</strong> {selectedStock.color}<br/>
                  <strong>Cửa hàng:</strong> {selectedStock.storeName || 'N/A'}<br/>
                  <strong>Giá hiện tại:</strong> {selectedStock.price.toLocaleString('vi-VN')} VNĐ
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá bán mới (VNĐ) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={updateData.newPrice}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, newPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ví dụ: 320000000"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseUpdateModals}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && selectedStock && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-600">
                Xác nhận xóa
              </h3>
              <button
                onClick={handleCloseUpdateModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Thông tin xe sẽ bị xóa</h4>
                <p className="text-sm text-red-700">
                  <strong>Model:</strong> {selectedStock.modelName || 'N/A'}<br/>
                  <strong>Màu:</strong> {selectedStock.color}<br/>
                  <strong>Cửa hàng:</strong> {selectedStock.storeName || 'N/A'}<br/>
                  <strong>Số lượng:</strong> {selectedStock.stock} xe<br/>
                  <strong>Giá bán:</strong> {selectedStock.price.toLocaleString('vi-VN')} VNĐ
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                  <p className="text-sm text-yellow-800">
                    <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa xe này khỏi kho?
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseUpdateModals}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteStock}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa khỏi kho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Báo cáo đặt hàng cho Manager
              </h3>
              <button
                onClick={handleCloseModal}
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
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ví dụ: Khách hàng có nhu cầu cao, sắp hết hàng, có đơn hàng lớn..."
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;

