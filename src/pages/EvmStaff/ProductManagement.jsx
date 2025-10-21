import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllModelsThunk,
  createModelThunk,
  updateModelThunk,
  deleteModelThunk,
  getColorsByModelNameThunk,
  addColorToModelThunk,
  removeColorFromModelThunk,
} from '@store/slices/modelSlice';
import {
  getAllColorsThunk,
} from '@store/slices/colorSlice';
import ProductCard from '../../components/ProductCard';
import ModelFormWizard from '../../components/ModelFormWizard';
import { 
  getBodyTypeOptions, 
  formatPrice, 
  formatNumber,
  getModelImage
} from '../../utils/modelHelpers';

function ProductManagement({ onBack }) {
  const dispatch = useDispatch();
  const { items: models, status: modelStatus } = useSelector((s) => s.models);
  const { items: colors } = useSelector((s) => s.colors);

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBodyType, setFilterBodyType] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('modelName');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal States
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingModel, setViewingModel] = useState(null);

  // Color Management
  const [modelColorsMap, setModelColorsMap] = useState({});
  const [addingColorToModel, setAddingColorToModel] = useState(null);
  const [selectedColorId, setSelectedColorId] = useState('');

  // Notifications
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    dispatch(getAllModelsThunk());
    dispatch(getAllColorsThunk());
  }, [dispatch]);

  // Fetch colors for all models
  useEffect(() => {
    if (models.length > 0) {
      models.forEach((model) => {
        dispatch(getColorsByModelNameThunk(model.modelName))
          .unwrap()
          .then((response) => {
            const colors = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
            setModelColorsMap(prev => ({
              ...prev,
              [model.modelId]: colors
            }));
          })
          .catch(() => {
            setModelColorsMap(prev => ({
              ...prev,
              [model.modelId]: []
            }));
          });
      });
    }
  }, [models.length, dispatch]);

  // Filtered and sorted models
  const filteredModels = useMemo(() => {
    let filtered = models.filter(model => {
      const matchesSearch = !searchTerm || 
        model.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBodyType = !filterBodyType || model.bodyType === filterBodyType;
      
      const matchesYear = !filterYear || model.modelYear?.toString() === filterYear;
      
      const matchesPrice = (!filterPriceRange.min || (model.price || 0) >= filterPriceRange.min) &&
                          (!filterPriceRange.max || (model.price || 0) <= filterPriceRange.max);
      
      return matchesSearch && matchesBodyType && matchesYear && matchesPrice;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [models, searchTerm, filterBodyType, filterYear, filterPriceRange, sortBy, sortOrder]);

  // Model Management Functions
  const openCreateModel = () => {
    setEditingModel(null);
    setModelModalOpen(true);
  };

  const openEditModel = (model) => {
    setEditingModel(model);
    setModelModalOpen(true);
  };

  const submitModel = async (modelData) => {
    try {
      if (editingModel) {
        await dispatch(updateModelThunk({ ...modelData, modelId: editingModel.modelId })).unwrap();
        setSuccessMsg('Đã cập nhật mẫu xe thành công');
      } else {
        await dispatch(createModelThunk(modelData)).unwrap();
        setSuccessMsg('Đã tạo mẫu xe mới thành công');
      }
      setModelModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err?.message || 'Lỗi khi thao tác mẫu xe');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const removeModel = async (modelId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mẫu xe này?')) return;
    try {
      await dispatch(deleteModelThunk(modelId)).unwrap();
      setSuccessMsg('Đã xóa mẫu xe thành công');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể xóa mẫu xe');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // Color-Model relationship functions
  const toggleAddColor = (modelId) => {
    if (addingColorToModel === modelId) {
      setAddingColorToModel(null);
      setSelectedColorId('');
    } else {
      setAddingColorToModel(modelId);
      setSelectedColorId('');
    }
  };

  const handleColorSelect = (colorId) => {
    setSelectedColorId(colorId);
  };

  const handleConfirmAddColor = async (model) => {
    if (!selectedColorId) {
      setErrorMsg('Vui lòng chọn màu sắc');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const colorToAdd = colors.find(c => c.colorId === parseInt(selectedColorId));
    if (!colorToAdd) return;

    try {
      await dispatch(addColorToModelThunk({
        modelName: model.modelName,
        colorName: colorToAdd.colorName,
      })).unwrap();

      // Refresh colors for this model
      const response = await dispatch(getColorsByModelNameThunk(model.modelName)).unwrap();
      const updatedColors = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setModelColorsMap(prev => ({
        ...prev,
        [model.modelId]: updatedColors
      }));

      setSuccessMsg(`Đã thêm màu ${colorToAdd.colorName} cho ${model.modelName}`);
      setAddingColorToModel(null);
      setSelectedColorId('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể thêm màu sắc');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleCancelAddColor = (modelId) => {
    setAddingColorToModel(null);
    setSelectedColorId('');
  };

  const handleRemoveColor = async (model, color) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa màu ${color.colorName} khỏi ${model.modelName}?`)) return;

    try {
      await dispatch(removeColorFromModelThunk({
        modelName: model.modelName,
        colorName: color.colorName,
        colorId: color.colorId,
      })).unwrap();

      // Refresh colors for this model
      const response = await dispatch(getColorsByModelNameThunk(model.modelName)).unwrap();
      const updatedColors = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setModelColorsMap(prev => ({
        ...prev,
        [model.modelId]: updatedColors
      }));

      setSuccessMsg(`Đã xóa màu ${color.colorName} khỏi ${model.modelName}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err?.message || 'Không thể xóa màu sắc');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // Get available colors for a specific model
  const getAvailableColors = (modelId) => {
    const modelColors = modelColorsMap[modelId] || [];
    const assignedColorIds = modelColors.map(c => c.colorId);
    return colors.filter(c => !assignedColorIds.includes(c.colorId));
  };

  const openModelDetail = (model) => {
    setViewingModel(model);
    setDetailModalOpen(true);
  };

  // Clear notifications
  const clearNotifications = () => {
    setSuccessMsg('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar - Admin Style */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h2>
            <p className="text-sm text-gray-600 mt-1">Quản lý mẫu xe và màu sắc</p>
          </div>
          <div className="flex items-center gap-3">
            {onBack && (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack} 
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Quay lại
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModel}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm mẫu xe
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Notifications */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {successMsg}
              </div>
              <button onClick={clearNotifications} className="text-emerald-600 hover:text-emerald-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 p-4 flex items-center justify-between"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errorMsg}
              </div>
              <button onClick={clearNotifications} className="text-red-600 hover:text-red-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm mẫu xe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filterBodyType}
                onChange={(e) => setFilterBodyType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Tất cả kiểu dáng</option>
                {getBodyTypeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Tất cả năm</option>
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="modelName-asc">Tên A-Z</option>
                <option value="modelName-desc">Tên Z-A</option>
                <option value="price-asc">Giá thấp-cao</option>
                <option value="price-desc">Giá cao-thấp</option>
                <option value="modelYear-desc">Năm mới-cũ</option>
                <option value="modelYear-asc">Năm cũ-mới</option>
              </select>
            </div>

             {/* Clear Filters Button */}
             <button
               onClick={() => {
                 setSearchTerm('');
                 setFilterBodyType('');
                 setFilterYear('');
                 setFilterPriceRange({ min: '', max: '' });
                 setSortBy('modelName');
                 setSortOrder('asc');
               }}
               className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
               title="Xóa tất cả bộ lọc"
             >
               <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
               Xóa bộ lọc
             </button>

          </div>
        </div>

        {/* Products Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
            <AnimatePresence>
              {filteredModels.map((model, index) => {
                const modelColors = modelColorsMap[model.modelId] || [];
                const availableColors = getAvailableColors(model.modelId);
                const isAddingColor = addingColorToModel === model.modelId;

                return (
                  <motion.div
                    key={model.modelId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard
                      model={model}
                      modelColors={modelColors}
                      availableColors={availableColors}
                      isAddingColor={isAddingColor}
                      selectedColorId={selectedColorId}
                      onEdit={openEditModel}
                      onDelete={removeModel}
                      onView={openModelDetail}
                      onAddColor={toggleAddColor}
                      onRemoveColor={handleRemoveColor}
                      onColorSelect={handleColorSelect}
                      onToggleAddColor={toggleAddColor}
                      onConfirmAddColor={handleConfirmAddColor}
                      onCancelAddColor={handleCancelAddColor}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

        {/* Empty State */}
        {filteredModels.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy mẫu xe nào</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterBodyType || filterYear 
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bắt đầu bằng cách thêm mẫu xe đầu tiên'
              }
            </p>
            {!searchTerm && !filterBodyType && !filterYear && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openCreateModel}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm mẫu xe đầu tiên
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Model Form Wizard Modal */}
      <ModelFormWizard
        isOpen={modelModalOpen}
        onClose={() => setModelModalOpen(false)}
        onSubmit={submitModel}
        editingModel={editingModel}
        isLoading={modelStatus === 'loading'}
      />

      {/* Detail Modal */}
      {detailModalOpen && viewingModel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDetailModalOpen(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden m-4"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-6">
              <div className="flex items-start justify-between">
                <div className="text-white">
                  <h2 className="text-3xl font-bold">{viewingModel.modelName}</h2>
                  <p className="text-emerald-100 mt-2 text-lg">{viewingModel.bodyType} • {viewingModel.modelYear}</p>
                  <p className="text-4xl font-bold mt-4">
                    {formatPrice(viewingModel.price)}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDetailModalOpen(false)}
                  className="p-3 rounded-lg hover:bg-white/20 transition-colors text-white"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Image and Basic Info */}
                <div className="space-y-6">
                  <div className="relative">
                    <div className="aspect-video bg-gradient-to-br from-emerald-50 to-gray-50 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img
                        src={getModelImage(viewingModel.modelName)}
                        alt={viewingModel.modelName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  {viewingModel.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả</h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-700 leading-relaxed">{viewingModel.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Specifications and Colors */}
                <div className="space-y-6">
                  {/* Specifications Grid */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông số kỹ thuật</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200"
                      >
                        <div className="text-xs text-emerald-600 mb-1">Dung lượng pin</div>
                        <div className="text-xl font-bold text-emerald-700">{formatNumber(viewingModel.batteryCapacity)} kWh</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
                      >
                        <div className="text-xs text-blue-600 mb-1">Tầm hoạt động</div>
                        <div className="text-xl font-bold text-blue-700">{formatNumber(viewingModel.range)} km</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200"
                      >
                        <div className="text-xs text-purple-600 mb-1">Công suất</div>
                        <div className="text-xl font-bold text-purple-700">{formatNumber(viewingModel.powerHp)} HP</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200"
                      >
                        <div className="text-xs text-orange-600 mb-1">Mô-men xoắn</div>
                        <div className="text-xl font-bold text-orange-700">{formatNumber(viewingModel.torqueNm)} Nm</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200"
                      >
                        <div className="text-xs text-red-600 mb-1">Tăng tốc 0-100</div>
                        <div className="text-xl font-bold text-red-700">{formatNumber(viewingModel.acceleration)} giây</div>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200"
                      >
                        <div className="text-xs text-indigo-600 mb-1">Số chỗ ngồi</div>
                        <div className="text-xl font-bold text-indigo-700">{formatNumber(viewingModel.seatingCapacity)} người</div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Available Colors */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Màu sắc có sẵn ({modelColorsMap[viewingModel.modelId]?.length || 0})
                    </h3>
                    {(!modelColorsMap[viewingModel.modelId] || modelColorsMap[viewingModel.modelId].length === 0) ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-8 bg-gray-50 rounded-xl"
                      >
                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Chưa có màu nào cho mẫu xe này</p>
                      </motion.div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <AnimatePresence>
                          {modelColorsMap[viewingModel.modelId].map((color, index) => (
                            <motion.div
                              key={color.colorId}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.05 }}
                              className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 text-center hover:shadow-md transition-all duration-200"
                            >
                              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 border-4 border-white shadow-lg mb-3"></div>
                              <div className="font-medium text-gray-900">{color.colorName}</div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setDetailModalOpen(false);
                    openEditModel(viewingModel);
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Chỉnh sửa thông tin
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDetailModalOpen(false)}
                  className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Đóng
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default ProductManagement;