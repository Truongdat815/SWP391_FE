import { useEffect, useState, useMemo, useRef } from 'react';
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
import { uploadModelColorImage } from '@/api/modelColorService';
import AnimatedSelect from '@/components/ui/AnimatedSelect';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

function ProductManagement() {
  const dispatch = useDispatch();
  const { items: modelColors, status, error: modelColorsError } = useSelector((s) => s.modelColors);
  const { items: models } = useSelector((s) => s.models);
  const { items: colors } = useSelector((s) => s.colors);

  const { toast, hideToast, success, error } = useToast();
  const { confirm, showConfirm } = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [sortBy, setSortBy] = useState('modelName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 3 columns x 4 rows for cards, 12 rows for table
  // Track selected color for each model: { modelId: colorId }
  const [selectedColors, setSelectedColors] = useState({});

  const [formData, setFormData] = useState({
    modelId: '',
    colorId: '',
    price: '',
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Use ref to prevent duplicate API calls
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once
    if (hasFetchedRef.current) {
      return;
    }
    
    hasFetchedRef.current = true;
    
    dispatch(getAllModelColorsThunk());
    dispatch(getAllModelsThunk());
    dispatch(getAllColorsThunk());
  }, [dispatch]);

  // Format currency: 50000000 -> 50.000.000
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    // Remove all non-digit characters
    const numericValue = String(value).replace(/\D/g, '');
    // Add dots as thousand separators
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Parse currency: "50.000.000" -> 50000000
  const parseCurrency = (value) => {
    if (!value) return '';
    // Remove all non-digit characters
    return value.replace(/\D/g, '');
  };

  // Handler for price input change
  const handlePriceChange = (e) => {
    const inputValue = e.target.value;
    // Allow only digits and dots
    const formatted = formatCurrency(inputValue);
    setFormData({ ...formData, price: formatted });
  };

  const resetForm = () => {
    setFormData({ modelId: '', colorId: '', price: '' });
    setSelectedImageFile(null);
    setImagePreview(null);
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
      price: item.price ? formatCurrency(item.price) : '',
    });
    setSelectedImageFile(null);
    setImagePreview(item.imagePath || null);
    setIsModalOpen(true);
  };
  
  // Handler cho file input
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        error('Vui lòng chọn file ảnh hợp lệ');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setSelectedImageFile(file);
      
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const modelId = parseInt(formData.modelId, 10);
      const colorId = parseInt(formData.colorId, 10);
      // Parse price: remove dots and convert to number
      const price = parseFloat(parseCurrency(formData.price)) || 0;

      if (editingItem) {
        // Update - không gửi imagePath, chỉ update price
        const payload = {
          modelId,
          colorId,
          price,
          imagePath: null, // Không gửi imagePath trong update
        };
        
        await dispatch(updateModelColorThunk({ id: editingItem.modelColorId, data: payload })).unwrap();
        
        // Upload ảnh mới nếu có
        if (selectedImageFile) {
          try {
            await uploadModelColorImage(editingItem.modelId, editingItem.colorId, selectedImageFile);
            success('Cập nhật sản phẩm và upload ảnh thành công!');
          } catch (uploadErr) {
            console.error('Failed to upload image:', uploadErr);
            const errMsg = uploadErr?.message || uploadErr?.toString() || '';
            const errLower = errMsg.toLowerCase();
            
            // Check for CHECK constraint or database errors
            if (errLower.includes('check constraint') || 
                errLower.includes('conflicted with') ||
                errLower.includes('database')) {
              error('Lỗi database: ' + errMsg + '. Vui lòng liên hệ quản trị viên.');
            } else {
              error('Cập nhật sản phẩm thành công nhưng upload ảnh thất bại: ' + errMsg);
            }
          }
        } else {
          success('Cập nhật sản phẩm thành công!');
        }
      } else {
        // Tạo model-color trước (không có imagePath)
        const payload = {
          modelId,
          colorId,
          price,
          imagePath: null, // Không gửi imagePath khi tạo mới
        };
        
        const createdModelColor = await dispatch(createModelColorThunk(payload)).unwrap();
        
        // Lấy modelId và colorId từ response hoặc formData
        const createdModelId = createdModelColor?.modelId || modelId;
        const createdColorId = createdModelColor?.colorId || colorId;
        
        // Upload ảnh nếu có file được chọn
        if (selectedImageFile) {
          try {
            await uploadModelColorImage(createdModelId, createdColorId, selectedImageFile);
            success('Tạo sản phẩm và upload ảnh thành công!');
          } catch (uploadErr) {
            console.error('Failed to upload image:', uploadErr);
            const errMsg = uploadErr?.message || uploadErr?.toString() || '';
            const errLower = errMsg.toLowerCase();
            
            // Check for CHECK constraint or database errors
            if (errLower.includes('check constraint') || 
                errLower.includes('conflicted with') ||
                errLower.includes('database')) {
              error('Lỗi database: ' + errMsg + '. Vui lòng liên hệ quản trị viên.');
            } else {
              error('Tạo sản phẩm thành công nhưng upload ảnh thất bại: ' + errMsg);
            }
          }
        } else {
          success('Tạo sản phẩm thành công!');
        }
      }

      // Reload data
      await dispatch(getAllModelColorsThunk()).unwrap();

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      error(err?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (item) => {
    const modelName = models.find(m => m.modelId === item.modelId)?.modelName || 'xe này';
    const colorName = colors.find(c => c.colorId === item.colorId)?.colorName || 'màu này';

    const confirmed = await showConfirm({
      message: `Xóa sản phẩm "${modelName} - ${colorName}"?`,
      type: 'warning'
    });
    if (!confirmed) return;
    
    try {
      // Use modelColorId from item
      await dispatch(deleteModelColorThunk(item.modelColorId)).unwrap();
      success('Đã xóa sản phẩm!');

      // Reload data
      await dispatch(getAllModelColorsThunk()).unwrap();
    } catch (err) {
      error(err?.message || 'Không thể xóa sản phẩm');
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

  // Group modelColors by modelId
  const groupedByModel = useMemo(() => {
    const grouped = {};
    
    modelColors.forEach(item => {
      if (!grouped[item.modelId]) {
        grouped[item.modelId] = [];
      }
      grouped[item.modelId].push(item);
    });
    
    return grouped;
  }, [modelColors]);

  // Enhanced filtering and sorting - now returns grouped models
  const filteredAndSortedModels = useMemo(() => {
    // Get unique model IDs from filtered modelColors
    let filteredModelColors = modelColors.filter(item => {
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

    // Get unique model IDs
    const uniqueModelIds = [...new Set(filteredModelColors.map(item => item.modelId))];
    
    // Create model groups with their colors
    const modelGroups = uniqueModelIds.map(modelId => {
      const modelColorsForModel = groupedByModel[modelId] || [];
      return {
        modelId,
        modelName: getModelName(modelId),
        modelDetails: getModelDetails(modelId),
        colors: modelColorsForModel.map(mc => ({
          ...mc,
          colorName: getColorName(mc.colorId),
          colorCode: getColorCode(mc.colorId)
        }))
      };
    });

    // Sort model groups
    modelGroups.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'modelName':
          aVal = a.modelName.toLowerCase();
          bVal = b.modelName.toLowerCase();
          break;
        case 'colorName':
          // Sort by first color name
          aVal = a.colors[0]?.colorName?.toLowerCase() || '';
          bVal = b.colors[0]?.colorName?.toLowerCase() || '';
          break;
        case 'hasImage':
          aVal = a.colors.some(c => c.imagePath) ? 1 : 0;
          bVal = b.colors.some(c => c.imagePath) ? 1 : 0;
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

    return modelGroups;
  }, [modelColors, searchTerm, filterModel, filterColor, sortBy, sortOrder, models, colors, groupedByModel]);

  // Get selected color for a model, default to first color
  const getSelectedColorForModel = (modelId, colors) => {
    const selectedColorId = selectedColors[modelId];
    if (selectedColorId && colors.find(c => c.colorId === selectedColorId)) {
      return colors.find(c => c.colorId === selectedColorId);
    }
    return colors[0] || null;
  };

  // Handle color selection change
  const handleColorChange = (modelId, colorId) => {
    setSelectedColors(prev => ({
      ...prev,
      [modelId]: colorId
    }));
  };

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedModels.length / itemsPerPage);
  const paginatedModels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedModels.slice(startIndex, endIndex);
  }, [filteredAndSortedModels, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Toast Notifications */}
      <Toast 
        show={toast.show} 
        type={toast.type} 
        message={toast.message} 
        onClose={hideToast}
      />
      
      {/* Confirm Dialog */}
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

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5">
        {/* Modern Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-3 sm:p-4 md:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate">
                    Quản lý sản phẩm
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">
                    Quản lý tổ hợp xe điện và màu sắc
                  </p>
                </div>
              </div>
              <button
                onClick={handleOpenCreate}
                className="group px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base font-medium flex-shrink-0"
                
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="whitespace-nowrap">Thêm sản phẩm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters & Controls */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-md border border-white/20 p-3 sm:p-4 md:p-5 mb-4 sm:mb-6 md:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
            {/* Search */}
            <div className="lg:col-span-3">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tìm kiếm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo xe, màu hoặc hình ảnh..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Model Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dòng xe</label>
              <AnimatedSelect
                value={filterModel}
                onChange={(e) => setFilterModel(e.target.value)}
                placeholder="Tất cả xe"
                options={[
                  { value: '', label: 'Tất cả xe' },
                  ...models.map(model => ({
                    value: model.modelId.toString(),
                    label: model.modelName
                  }))
                ]}
                className="block w-full"
              />
            </div>

            {/* Color Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
              <AnimatedSelect
                value={filterColor}
                onChange={(e) => setFilterColor(e.target.value)}
                placeholder="Tất cả màu"
                options={[
                  { value: '', label: 'Tất cả màu' },
                  ...colors.map(color => ({
                    value: color.colorId.toString(),
                    label: color.colorName
                  }))
                ]}
                className="block w-full"
              />
            </div>

            {/* Sort */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp</label>
              <AnimatedSelect
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                placeholder="Sắp xếp"
                options={[
                  { value: 'modelName-asc', label: 'Xe A-Z' },
                  { value: 'modelName-desc', label: 'Xe Z-A' },
                  { value: 'colorName-asc', label: 'Màu A-Z' },
                  { value: 'colorName-desc', label: 'Màu Z-A' },
                  { value: 'hasImage-desc', label: 'Có hình ảnh' },
                  { value: 'hasImage-asc', label: 'Chưa có hình ảnh' }
                ]}
                className="block w-full"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hiển thị</label>
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'cards' 
                      ? 'bg-emerald-600 text-white shadow-md' 
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
                      ? 'bg-emerald-600 text-white shadow-md' 
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
                className="w-full h-[48px] px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 flex items-center justify-center group"
                
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
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md border border-white/20 p-4">
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
        ) : status === 'failed' && modelColors.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md border border-white/20 p-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
              <p className="text-gray-600 mb-4">
                {modelColorsError || 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.'}
              </p>
              <button
                onClick={() => dispatch(getAllModelColorsThunk())}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : filteredAndSortedModels.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md border border-white/20 p-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm nào</h3>
              <p className="text-gray-600 mb-4">Thử điều chỉnh bộ lọc hoặc thêm sản phẩm mới</p>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Thêm sản phẩm đầu tiên
              </button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'cards' ? (
              // Cards View - Grouped by Model
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {paginatedModels.map((modelGroup, index) => {
                      const selectedColor = getSelectedColorForModel(modelGroup.modelId, modelGroup.colors);
                      if (!selectedColor) return null;
                      
                      return (
                      <motion.div
                        key={modelGroup.modelId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-white/90 backdrop-blur-lg rounded-2xl shadow-md border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                      >
                        {/* Card Image */}
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                          {selectedColor.imagePath ? (
                            <img 
                              src={selectedColor.imagePath} 
                              alt={`${modelGroup.modelName} - ${selectedColor.colorName}`}
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
                          
                          {/* Color Selector Badge */}
                          <div className="absolute top-3 right-3">
                            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-1.5">
                              <select
                                value={selectedColor.colorId}
                                onChange={(e) => handleColorChange(modelGroup.modelId, parseInt(e.target.value))}
                                className="text-xs font-semibold text-gray-800 bg-transparent border-none outline-none cursor-pointer pr-8 appearance-none"
                                onClick={(e) => e.stopPropagation()}
                                style={{ 
                                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 0.25rem center',
                                  backgroundSize: '1rem'
                                }}
                              >
                                {modelGroup.colors.map(color => (
                                  <option key={color.colorId} value={color.colorId}>
                                    {color.colorName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4">
                          <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{modelGroup.modelName}</h3>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm"
                                style={{ backgroundColor: selectedColor.colorCode }}
                              />
                              <p className="text-sm text-gray-600">Màu {selectedColor.colorName}</p>
                              <span className="text-xs text-gray-400">({modelGroup.colors.length} màu)</span>
                            </div>
                          </div>

                          {/* Model Details */}
                          {modelGroup.modelDetails ? (
                            <div className="mb-4 space-y-3">
                              {/* Price & Year */}
                              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                                <div>
                                  <p className="text-xs text-gray-600">Giá bán</p>
                                  <p className="text-lg font-bold text-emerald-600">{selectedColor.price?.toLocaleString('vi-VN') || 'N/A'} VNĐ</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-600">Năm</p>
                                  <p className="text-lg font-bold text-gray-700">{modelGroup.modelDetails.modelYear}</p>
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
                                  <p className="font-semibold text-gray-900">{modelGroup.modelDetails.batteryCapacity} kWh</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <span>Tầm xa</span>
                                  </div>
                                  <p className="font-semibold text-gray-900">{modelGroup.modelDetails.range} km</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Công suất</span>
                                  </div>
                                  <p className="font-semibold text-gray-900">{modelGroup.modelDetails.powerHp} HP</p>
                                </div>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-1 text-gray-600 mb-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>0-100</span>
                                  </div>
                                  <p className="font-semibold text-gray-900">{modelGroup.modelDetails.acceleration}s</p>
                                </div>
                              </div>

                              {/* Body Type Badge */}
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  {modelGroup.modelDetails.bodyType}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                  {modelGroup.modelDetails.seatingCapacity} chỗ
                                </span>
                              </div>
                            </div>
                          ) : null}

                          {/* Actions */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleOpenEdit(selectedColor)}
                              className="flex-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDelete(selectedColor)}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Pagination for Cards View */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredAndSortedModels.length}
                  showInfo={true}
                />
              </>
            ) : (
              // Table View - Grouped by Model
              <>
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-md border border-white/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Xe</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Chọn màu</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Thông số</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Giá & Năm</th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Hình ảnh</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <AnimatePresence>
                        {paginatedModels.map((modelGroup, index) => {
                          const selectedColor = getSelectedColorForModel(modelGroup.modelId, modelGroup.colors);
                          if (!selectedColor) return null;
                          
                          return (
                            <motion.tr 
                              key={modelGroup.modelId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="hover:bg-emerald-50/50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-2">
                                  <div className="font-semibold text-gray-900">{modelGroup.modelName}</div>
                                  {modelGroup.modelDetails && (
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                        {modelGroup.modelDetails.bodyType}
                                      </span>
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                        {modelGroup.modelDetails.seatingCapacity} chỗ
                                      </span>
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500">
                                    {modelGroup.colors.length} màu sắc
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={selectedColor.colorId}
                                  onChange={(e) => handleColorChange(modelGroup.modelId, parseInt(e.target.value))}
                                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {modelGroup.colors.map(color => (
                                    <option key={color.colorId} value={color.colorId}>
                                      {color.colorName}
                                    </option>
                                  ))}
                                </select>
                                <div className="flex items-center gap-2 mt-2">
                                  <div 
                                    className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-sm"
                                    style={{ backgroundColor: selectedColor.colorCode }}
                                  />
                                  <span className="text-sm text-gray-600">{selectedColor.colorName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {modelGroup.modelDetails ? (
                                  <div className="space-y-1 text-sm">
                                    <div className="flex items-center gap-2">
                                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                      <span className="text-gray-600">Pin:</span>
                                      <span className="font-medium text-gray-900">{modelGroup.modelDetails.batteryCapacity} kWh</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                      </svg>
                                      <span className="text-gray-600">Tầm:</span>
                                      <span className="font-medium text-gray-900">{modelGroup.modelDetails.range} km</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                      <span className="text-gray-600">CS:</span>
                                      <span className="font-medium text-gray-900">{modelGroup.modelDetails.powerHp} HP</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span className="text-gray-600">0-100:</span>
                                      <span className="font-medium text-gray-900">{modelGroup.modelDetails.acceleration}s</span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Chưa có dữ liệu</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {modelGroup.modelDetails ? (
                                  <div className="space-y-1">
                                    <div className="text-lg font-bold text-emerald-600">
                                      {selectedColor.price?.toLocaleString('vi-VN') || 'N/A'} VNĐ
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Năm {modelGroup.modelDetails.modelYear}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">N/A</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {selectedColor.imagePath ? (
                                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                    <img 
                                      src={selectedColor.imagePath} 
                                      alt={`${modelGroup.modelName} - ${selectedColor.colorName}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Chưa có hình ảnh</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenEdit(selectedColor)}
                                    className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                                    title="Chỉnh sửa"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(selectedColor)}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Xóa"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

              {/* Pagination for Table View */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={filteredAndSortedModels.length}
                showInfo={true}
              />
            </>
            )}
          </>
        )}

        {/* Results Summary */}
        {filteredAndSortedModels.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-lg rounded-lg border border-white/20">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold text-emerald-600">{filteredAndSortedModels.length}</span> mẫu xe trong tổng số <span className="font-semibold">{modelColors.length}</span> sản phẩm
              </span>
            </div>
          </motion.div>
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
                    <div className="p-2 bg-white/20 rounded-lg">
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
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200"
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
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Chọn sản phẩm</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Model Select */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Dòng xe <span className="text-red-500">*</span>
                        </label>
                        <AnimatedSelect
                          value={formData.modelId}
                          onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                          placeholder="Chọn dòng xe"
                          disabled={!!editingItem}
                          options={[
                            { value: '', label: 'Chọn dòng xe' },
                            ...models.map(model => ({
                              value: model.modelId.toString(),
                              label: model.modelName
                            }))
                          ]}
                          className="w-full"
                        />
                      </div>

                      {/* Color Select */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Màu sắc <span className="text-red-500">*</span>
                        </label>
                        <AnimatedSelect
                          value={formData.colorId}
                          onChange={(e) => setFormData({ ...formData, colorId: e.target.value })}
                          placeholder="Chọn màu sắc"
                          disabled={!!editingItem}
                          options={[
                            { value: '', label: 'Chọn màu sắc' },
                            ...colors.map(color => ({
                              value: color.colorId.toString(),
                              label: color.colorName
                            }))
                          ]}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Color Preview */}
                    {formData.colorId && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
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

                  {/* Price Section */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Giá sản phẩm</h4>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Giá (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.price}
                        onChange={handlePriceChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                        placeholder="VD: 50.000.000"
                        required
                      />
                    </div>
                  </div>

                  {/* Image Section */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Hình ảnh sản phẩm</h4>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Chọn file ảnh {!editingItem && <span className="text-gray-500 font-normal">(tùy chọn)</span>}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 backdrop-blur-sm transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Chọn file ảnh sản phẩm (JPG, PNG, GIF - tối đa 5MB). {editingItem ? 'Chọn ảnh mới để thay thế ảnh hiện tại.' : 'Ảnh sẽ được upload sau khi tạo sản phẩm thành công.'}
                        </p>
                      </div>
                      {(imagePreview || (editingItem && editingItem.imagePath)) && (
                        <div className="flex-shrink-0">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Xem trước
                          </label>
                          <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
                            <img
                              src={imagePreview || editingItem.imagePath}
                              alt="Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EInvalid Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                          <p className="text-xs text-center text-gray-500 mt-1">
                            {imagePreview && selectedImageFile ? 'Ảnh mới' : 'Ảnh hiện tại'}
                          </p>
                          {imagePreview && selectedImageFile && editingItem && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImageFile(null);
                                setImagePreview(editingItem?.imagePath || null);
                              }}
                              className="mt-1 text-xs text-red-600 hover:text-red-700 underline w-full text-center"
                            >
                              Hủy ảnh mới
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modern Form Actions */}
                <div className="sticky bottom-0 bg-gradient-to-r from-gray-50/90 to-white/90 backdrop-blur-xl border-t border-white/20 p-4 mt-8 -mx-8 -mb-8">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-xl flex items-center justify-center gap-2"
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
