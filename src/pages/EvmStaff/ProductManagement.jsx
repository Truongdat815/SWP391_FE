import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllModelColorsThunk,
  createModelColorThunk,
  updateModelColorThunk,
  deleteModelColorThunk,
} from '@store/slices/modelColorSlice';
import { getAllModelsThunk } from '@store/slices/modelSlice';
import { getAllColorsThunk } from '@store/slices/colorSlice';
import Tooltip from '@/components/ui/Tooltip';

function ProductManagement() {
  const dispatch = useDispatch();
  const { items: modelColors, status } = useSelector((s) => s.modelColors);
  const { items: models } = useSelector((s) => s.models);
  const { items: colors } = useSelector((s) => s.colors);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [sortBy, setSortBy] = useState('modelName');
  const [sortOrder, setSortOrder] = useState('asc');

  const [formData, setFormData] = useState({
    modelId: '',
    colorId: '',
    imagePath: '',
  });

  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    dispatch(getAllModelColorsThunk());
    dispatch(getAllModelsThunk());
    dispatch(getAllColorsThunk());
  }, [dispatch]);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  const resetForm = () => {
    setFormData({ modelId: '', colorId: '', imagePath: '' });
    setEditingItem(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      modelId: item.modelId,
      colorId: item.colorId,
      imagePath: item.imagePath || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Get model and color details
      const selectedModel = models.find(m => m.modelId === parseInt(formData.modelId, 10));
      const selectedColor = colors.find(c => c.colorId === parseInt(formData.colorId, 10));

      const payload = {
        modelId: parseInt(formData.modelId, 10),
        modelName: selectedModel?.modelName || '',
        colorId: parseInt(formData.colorId, 10),
        colorName: selectedColor?.colorName || '',
        colorCode: selectedColor?.colorCode || '',
        imagePath: formData.imagePath.trim(),
      };

      if (editingItem) {
        // Update - use modelColorId
        payload.modelColorId = editingItem.modelColorId;
        await dispatch(updateModelColorThunk({ id: editingItem.modelColorId, data: payload })).unwrap();
        showNotification('success', 'Cập nhật sản phẩm thành công!');
      } else {
        await dispatch(createModelColorThunk(payload)).unwrap();
        showNotification('success', 'Tạo sản phẩm thành công!');
      }

      // Reload data
      await dispatch(getAllModelColorsThunk()).unwrap();

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      showNotification('error', err?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (item) => {
    const modelName = models.find(m => m.modelId === item.modelId)?.modelName || 'xe này';
    const colorName = colors.find(c => c.colorId === item.colorId)?.colorName || 'màu này';

    if (!window.confirm(`Xóa sản phẩm "${modelName} - ${colorName}"?`)) return;

    try {
      // Use modelColorId from item
      await dispatch(deleteModelColorThunk(item.modelColorId)).unwrap();
      showNotification('success', 'Đã xóa sản phẩm!');

      // Reload data
      await dispatch(getAllModelColorsThunk()).unwrap();
    } catch (err) {
      showNotification('error', err?.message || 'Không thể xóa sản phẩm');
    }
  };

  // Get model/color names and details
  const getModelName = (modelId) => {
    return models.find(m => m.modelId === modelId)?.modelName || `Model #${modelId}`;
  };

  const getModelDetails = (modelId) => {
    return models.find(m => m.modelId === modelId) || null;
  };

  const getColorName = (colorId) => {
    return colors.find(c => c.colorId === colorId)?.colorName || `Color #${colorId}`;
  };

  const getColorCode = (colorId) => {
    return colors.find(c => c.colorId === colorId)?.colorCode || '#CCCCCC';
  };

  // Enhanced filtering and sorting
  const filteredAndSortedItems = useMemo(() => {
    let filtered = modelColors.filter(item => {
      const modelName = getModelName(item.modelId).toLowerCase();
      const colorName = getColorName(item.colorId).toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm || 
        modelName.includes(searchLower) || 
        colorName.includes(searchLower) ||
        item.imagePath?.toLowerCase().includes(searchLower);

      const matchesModel = !filterModel || item.modelId === parseInt(filterModel, 10);
      const matchesColor = !filterColor || item.colorId === parseInt(filterColor, 10);

      return matchesSearch && matchesModel && matchesColor;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'modelName':
          aVal = getModelName(a.modelId).toLowerCase();
          bVal = getModelName(b.modelId).toLowerCase();
          break;
        case 'colorName':
          aVal = getColorName(a.colorId).toLowerCase();
          bVal = getColorName(b.colorId).toLowerCase();
          break;
        case 'hasImage':
          aVal = a.imagePath ? 1 : 0;
          bVal = b.imagePath ? 1 : 0;
          break;
        default:
          aVal = a[sortBy] || '';
          bVal = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [modelColors, searchTerm, filterModel, filterColor, sortBy, sortOrder, models, colors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 lg:p-8">
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg ${
              notification.type === 'success' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.message}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Quản lý sản phẩm
                  </h1>
                  <p className="text-gray-600 mt-1">Quản lý tổ hợp xe điện và màu sắc</p>
                </div>
              </div>
              <Tooltip content="Tạo tổ hợp sản phẩm mới từ mẫu xe và màu sắc" placement="bottom">
                <button
                  onClick={handleOpenCreate}
                  className="group px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm sản phẩm mới
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Advanced Filters & Controls */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Search */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo xe, màu hoặc hình ảnh..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Model Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dòng xe</label>
              <select
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50"
              >
                <option value="">Tất cả xe</option>
                {models.map(model => (
                  <option key={model.modelId} value={model.modelId}>
                    {model.modelName}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
              <select
                value={filterColor}
                onChange={(e) => setFilterColor(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50"
              >
                <option value="">Tất cả màu</option>
                {colors.map(color => (
                  <option key={color.colorId} value={color.colorId}>
                    {color.colorName}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50"
              >
                <option value="modelName-asc">Xe A-Z</option>
                <option value="modelName-desc">Xe Z-A</option>
                <option value="colorName-asc">Màu A-Z</option>
                <option value="colorName-desc">Màu Z-A</option>
                <option value="hasImage-desc">Có hình ảnh</option>
                <option value="hasImage-asc">Chưa có hình ảnh</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hiển thị</label>
              <div className="flex rounded-xl bg-gray-100 p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'cards' 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'table' 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Reset Filters Button */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterModel('');
                  setFilterColor('');
                  setSortBy('modelName');
                  setSortOrder('asc');
                }}
                className="w-full h-[48px] px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 flex items-center justify-center group"
                title="Xóa bộ lọc"
              >
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {status === 'loading' && modelColors.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Đang tải dữ liệu</h3>
              <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
            </div>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm nào</h3>
              <p className="text-gray-600 mb-6">Thử điều chỉnh bộ lọc hoặc thêm sản phẩm mới</p>
              <button
                onClick={handleOpenCreate}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Thêm sản phẩm đầu tiên
              </button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'cards' ? (
              // Cards View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredAndSortedItems.map((item, index) => (
                    <motion.div
                      key={item.modelColorId || `${item.modelId}-${item.colorId}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Card Image */}
                      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                        {item.imagePath ? (
                          <img 
                            src={item.imagePath} 
                            alt={`${getModelName(item.modelId)} - ${getColorName(item.colorId)}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Color Badge */}
                        <div className="absolute top-3 right-3">
                          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                            <div 
                              className="w-4 h-4 rounded-full border-2 border-white shadow"
                              style={{ backgroundColor: getColorCode(item.colorId) }}
                            />
                            <span className="text-sm font-medium text-gray-700">{getColorName(item.colorId)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{getModelName(item.modelId)}</h3>
                          <p className="text-sm text-gray-600">Màu {getColorName(item.colorId)}</p>
                        </div>

                        {/* Model Details */}
                        {(() => {
                          const modelDetails = getModelDetails(item.modelId);
                          return modelDetails ? (
                            <div className="mb-6 space-y-3">
                              {/* Price & Year */}
                              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                                <div>
                                  <p className="text-xs text-gray-600">Giá bán</p>
                                  <p className="text-lg font-bold text-emerald-600">${modelDetails.price?.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-600">Năm</p>
                                  <p className="text-lg font-bold text-gray-700">{modelDetails.modelYear}</p>
                                </div>
                              </div>

                              {/* Specs Grid */}
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Pin</span>
                                  </div>
                                  <p className="font-semibold text-gray-900">{modelDetails.batteryCapacity} kWh</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span>Tầm xa</span>
                                  </div>
                                  <p className="font-semibold text-gray-900">{modelDetails.range} km</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Công suất</span>
                                  </div>
                                  <p className="font-semibold text-gray-900">{modelDetails.powerHp} HP</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>0-100</span>
                                  </div>
                                  <p className="font-semibold text-gray-900">{modelDetails.acceleration}s</p>
                                </div>
                              </div>

                              {/* Body Type Badge */}
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  {modelDetails.bodyType}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                  {modelDetails.seatingCapacity} chỗ
                                </span>
                              </div>
                            </div>
                          ) : null;
                        })()}

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="flex-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              // Table View
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xe & Màu sắc</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thông số</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Giá & Năm</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Hình ảnh</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <AnimatePresence>
                        {filteredAndSortedItems.map((item, index) => {
                          const modelDetails = getModelDetails(item.modelId);
                          return (
                            <motion.tr 
                              key={item.modelColorId || `${item.modelId}-${item.colorId}-${index}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-emerald-50/50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="space-y-2">
                                  <div className="font-semibold text-gray-900">{getModelName(item.modelId)}</div>
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                                      style={{ backgroundColor: getColorCode(item.colorId) }}
                                    />
                                    <span className="text-sm text-gray-600">{getColorName(item.colorId)}</span>
                                  </div>
                                  {modelDetails && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                        {modelDetails.bodyType}
                                      </span>
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                        {modelDetails.seatingCapacity} chỗ
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {modelDetails ? (
                                  <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                      <span className="text-gray-600">Pin:</span>
                                      <span className="font-medium text-gray-900">{modelDetails.batteryCapacity} kWh</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                      </svg>
                                      <span className="text-gray-600">Tầm:</span>
                                      <span className="font-medium text-gray-900">{modelDetails.range} km</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                      <span className="text-gray-600">CS:</span>
                                      <span className="font-medium text-gray-900">{modelDetails.powerHp} HP</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-gray-600">0-100:</span>
                                      <span className="font-medium text-gray-900">{modelDetails.acceleration}s</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Chưa có dữ liệu</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {modelDetails ? (
                                  <div className="space-y-1">
                                    <div className="text-lg font-bold text-emerald-600">
                                      ${modelDetails.price?.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Năm {modelDetails.modelYear}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">N/A</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {item.imagePath ? (
                                  <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                      <img 
                                        src={item.imagePath} 
                                        alt={`${getModelName(item.modelId)} - ${getColorName(item.colorId)}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                        }}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Chưa có hình ảnh</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    onClick={() => handleOpenEdit(item)}
                                    className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item)}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {filteredAndSortedItems.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-lg rounded-xl border border-white/20">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    Hiển thị <span className="font-semibold text-emerald-600">{filteredAndSortedItems.length}</span> trong tổng số <span className="font-semibold">{modelColors.length}</span> sản phẩm
                  </span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Modern Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden border border-white/20"
            >
              {/* Modern Modal Header */}
              <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingItem ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {editingItem ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                      </h3>
                      <p className="text-emerald-100 mt-1">
                        {editingItem ? 'Cập nhật thông tin tổ hợp xe-màu' : 'Tạo tổ hợp xe điện và màu sắc mới'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 pointer-events-none"></div>
              </div>

              {/* Modern Modal Body */}
              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(95vh-200px)] bg-gradient-to-br from-gray-50/50 to-white/50">
                
                <div className="space-y-8">
                  
                  {/* Product Selection Section */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-100 rounded-xl">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Chọn sản phẩm</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Model Select */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Dòng xe <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.modelId}
                          onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                          required
                          disabled={!!editingItem}
                        >
                          <option value="">Chọn dòng xe</option>
                          {models.map(model => (
                            <option key={model.modelId} value={model.modelId}>
                              {model.modelName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Color Select */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Màu sắc <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.colorId}
                          onChange={(e) => setFormData({ ...formData, colorId: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                          required
                          disabled={!!editingItem}
                        >
                          <option value="">Chọn màu sắc</option>
                          {colors.map(color => (
                            <option key={color.colorId} value={color.colorId}>
                              {color.colorName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Color Preview */}
                    {formData.colorId && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: colors.find(c => c.colorId === parseInt(formData.colorId))?.colorCode || '#CCCCCC' }}
                          />
                          <span className="font-medium text-gray-700">
                            {colors.find(c => c.colorId === parseInt(formData.colorId))?.colorName || 'Màu không xác định'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image Section */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Hình ảnh sản phẩm</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Đường dẫn hình ảnh <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.imagePath}
                        onChange={(e) => setFormData({ ...formData, imagePath: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                        placeholder="VD: https://example.com/image.jpg hoặc /images/car1.jpg"
                        required
                      />
                    </div>

                    {/* Image Preview */}
                    {formData.imagePath && (
                      <div className="mt-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Xem trước hình ảnh
                        </label>
                        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden border-2 border-gray-300 shadow-inner">
                          <img
                            src={formData.imagePath}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modern Form Actions */}
                <div className="sticky bottom-0 bg-gradient-to-r from-gray-50/90 to-white/90 backdrop-blur-xl border-t border-white/20 p-6 mt-8 -mx-8 -mb-8">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingItem ? "M5 13l4 4L19 7" : "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"} />
                      </svg>
                      {editingItem ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductManagement;
