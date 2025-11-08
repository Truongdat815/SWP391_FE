import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllModelsThunk,
  createModelThunk,
  updateModelThunk,
  deleteModelThunk,
} from '@store/slices/modelSlice';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

// Prevent scroll wheel on number inputs
const handleWheelOnNumberInput = (e) => {
  e.target.blur();
  e.preventDefault();
};

const BODY_TYPES = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'COUPE', label: 'Coupe' },
  { value: 'CONVERTIBLE', label: 'Convertible' },
  { value: 'WAGON', label: 'Wagon' },
  { value: 'PICKUP', label: 'Pickup' },
  { value: 'VAN', label: 'Van' },
];

function VehicleManagement() {
  const dispatch = useDispatch();
  const { items: models, status } = useSelector((s) => s.models);

  const { toast, hideToast, success, error } = useToast();
  const { confirm, showConfirm } = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [sortBy, setSortBy] = useState('modelName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterBodyType, setFilterBodyType] = useState('');
  const [priceRange, setPriceRange] = useState([0, 200000]);

  const [formData, setFormData] = useState({
    modelName: '',
    modelYear: new Date().getFullYear(),
    bodyType: 'SEDAN',
    batteryCapacity: '',
    range: '',
    powerHp: '',
    torqueNm: '',
    acceleration: '',
    seatingCapacity: 5,
    price: '',
    description: '',
  });

  useEffect(() => {
    dispatch(getAllModelsThunk());
  }, [dispatch]);

  const resetForm = () => {
    setFormData({
      modelName: '',
      modelYear: new Date().getFullYear(),
      bodyType: 'SEDAN',
      batteryCapacity: '',
      range: '',
      powerHp: '',
      torqueNm: '',
      acceleration: '',
      seatingCapacity: 5,
      price: '',
      description: '',
    });
  };

  const handleOpenCreate = () => {
    setEditingModel(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (model) => {
    setEditingModel(model);
    setFormData({
      modelName: model.modelName || '',
      modelYear: model.modelYear || new Date().getFullYear(),
      bodyType: model.bodyType || 'SEDAN',
      batteryCapacity: model.batteryCapacity || '',
      range: model.range || '',
      powerHp: model.powerHp || '',
      torqueNm: model.torqueNm || '',
      acceleration: model.acceleration || '',
      seatingCapacity: model.seatingCapacity || 5,
      price: model.price || '',
      description: model.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare payload according to new API: modelId, modelName, modelYear, batteryCapacity, 
      // range, powerHp, torqueNm, acceleration, seatingCapacity, bodyType, description
      const payload = {
        modelId: editingModel ? editingModel.modelId : 0,
        modelName: formData.modelName.trim(),
        modelYear: parseInt(formData.modelYear),
        batteryCapacity: parseFloat(formData.batteryCapacity) || 0,
        range: parseFloat(formData.range) || 0,
        powerHp: parseFloat(formData.powerHp) || 0,
        torqueNm: parseFloat(formData.torqueNm) || 0,
        acceleration: parseFloat(formData.acceleration) || 0,
        seatingCapacity: parseInt(formData.seatingCapacity) || 0,
        bodyType: formData.bodyType,
        description: formData.description.trim(),
      };

      if (editingModel) {
        await dispatch(updateModelThunk(payload)).unwrap();
        success('Cập nhật xe thành công!');
      } else {
        await dispatch(createModelThunk(payload)).unwrap();
        success('Tạo xe mới thành công!');
      }
      
      // ✅ Reload data to get latest from backend
      await dispatch(getAllModelsThunk()).unwrap();
      
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      error(err?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (model) => {
    const confirmed = await showConfirm({
      message: `Xóa "${model.modelName}"?`,
      type: 'warning'
    });
    if (!confirmed) return;
    
    try {
      await dispatch(deleteModelThunk(model.modelId)).unwrap();
      success('Đã xóa xe!');
      
      // ✅ Reload data to ensure consistency
      await dispatch(getAllModelsThunk()).unwrap();
    } catch (err) {
      error(err?.message || 'Không thể xóa xe');
    }
  };

  // Filtered and sorted data
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models.filter(model => {
      const matchesSearch = !searchTerm || 
        model.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBodyType = !filterBodyType || model.bodyType === filterBodyType;
      
      const matchesPrice = !model.price || 
        (model.price >= priceRange[0] && model.price <= priceRange[1]);
      
      return matchesSearch && matchesBodyType && matchesPrice;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal?.toLowerCase() || '';
        bVal = bVal?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [models, searchTerm, filterBodyType, priceRange, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-4 lg:p-8">
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
      {/* CSS Styles */}
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-600 to-green-700 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Quản lý xe điện
                  </h1>
                  <p className="text-gray-600 mt-1">Hệ thống quản lý danh mục xe điện toàn diện</p>
                </div>
              </div>
              <button
                onClick={handleOpenCreate}
                className="group px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm xe mới
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters & Controls */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Search */}
            <div className="lg:col-span-4">
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
                  placeholder="Tìm theo tên xe hoặc mô tả..."
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50/50"
                />
              </div>
            </div>

            {/* Body Type Filter */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại xe</label>
              <select
                value={filterBodyType}
                onChange={(e) => setFilterBodyType(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50/50"
              >
                <option value="">Tất cả loại</option>
                {BODY_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
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
                className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50/50"
              >
                <option value="modelName-asc">Tên A-Z</option>
                <option value="modelName-desc">Tên Z-A</option>
                <option value="price-asc">Giá thấp-cao</option>
                <option value="price-desc">Giá cao-thấp</option>
                <option value="modelYear-desc">Năm mới nhất</option>
                <option value="modelYear-asc">Năm cũ nhất</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hiển thị</label>
              <div className="flex rounded-xl bg-gray-100 p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'cards' 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'table' 
                      ? 'bg-green-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Reset Filters */}
            <div className="lg:col-span-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterBodyType('');
                  setSortBy('modelName');
                  setSortOrder('asc');
                  setPriceRange([0, 200000]);
                }}
                className="w-full px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Đặt lại
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {status === 'loading' && models.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Đang tải dữ liệu</h3>
              <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
            </div>
          </div>
        ) : filteredAndSortedModels.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy xe nào</h3>
              <p className="text-gray-600 mb-6">Thử điều chỉnh bộ lọc hoặc thêm xe mới</p>
              <button
                onClick={handleOpenCreate}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Thêm xe đầu tiên
              </button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'cards' ? (
              // Cards View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredAndSortedModels.map((model, index) => (
                    <motion.div
                      key={model.modelId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white/90 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{model.modelName}</h3>
                            <p className="text-blue-100">
                              {BODY_TYPES.find(t => t.value === model.bodyType)?.label || model.bodyType} • {model.modelYear}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{model.price?.toLocaleString('vi-VN')} VNĐ</div>
                            <div className="text-blue-100 text-sm">Giá bán</div>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-2 mx-auto">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <div className="text-lg font-bold text-gray-800">{model.batteryCapacity}</div>
                            <div className="text-sm text-gray-600">kWh</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-2 mx-auto">
                              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                            <div className="text-lg font-bold text-gray-800">{model.range}</div>
                            <div className="text-sm text-gray-600">km</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6 text-sm">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="font-semibold text-gray-800">{model.powerHp}</div>
                            <div className="text-gray-600">HP</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="font-semibold text-gray-800">{model.acceleration}</div>
                            <div className="text-gray-600">0-100</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="font-semibold text-gray-800">{model.seatingCapacity}</div>
                            <div className="text-gray-600">Chỗ</div>
                          </div>
                        </div>

                        {model.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{model.description}</p>
                        )}

                        {/* Card Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleOpenEdit(model)}
                            className="flex-1 px-4 py-2 bg-green-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(model)}
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
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tên xe</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Năm</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Loại</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Pin (kWh)</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tầm xa (km)</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Giá (VNĐ)</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <AnimatePresence>
                        {filteredAndSortedModels.map((model) => (
                          <motion.tr 
                            key={model.modelId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold text-gray-900">{model.modelName}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{model.modelYear}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-blue-800">
                                {BODY_TYPES.find(t => t.value === model.bodyType)?.label || model.bodyType}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{model.batteryCapacity}</td>
                            <td className="px-6 py-4 text-gray-600">{model.range}</td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-gray-900">{model.price?.toLocaleString('vi-VN')} VNĐ</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => handleOpenEdit(model)}
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(model)}
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {filteredAndSortedModels.length > 0 && (
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
                    Hiển thị <span className="font-semibold text-green-600">{filteredAndSortedModels.length}</span> trong tổng số <span className="font-semibold">{models.length}</span> xe
                  </span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
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
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-white/20"
            >
              {/* Modern Modal Header */}
              <div className="relative bg-gradient-to-r from-green-600 via-green-700 to-green-800 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingModel ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {editingModel ? 'Chỉnh sửa thông tin xe' : 'Thêm xe điện mới'}
                      </h3>
                      <p className="text-blue-100 mt-1">
                        {editingModel ? 'Cập nhật thông số kỹ thuật' : 'Nhập đầy đủ thông tin xe điện'}
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 pointer-events-none"></div>
              </div>

              {/* Modern Modal Body */}
              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(95vh-200px)] bg-gradient-to-br from-gray-50/50 to-white/50">
                
                {/* Form Sections */}
                <div className="space-y-8">
                  
                  {/* Basic Information Section */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-xl">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Thông tin cơ bản</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Model Name */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Tên xe <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.modelName}
                          onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200 placeholder-gray-400"
                          placeholder="VD: Electra CityLink Pro"
                          required
                        />
                      </div>

                      {/* Year */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Năm sản xuất <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.modelYear}
                          onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
                          onWheel={handleWheelOnNumberInput}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                          required
                          min={2020}
                          max={2030}
                        />
                      </div>

                      {/* Body Type */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Kiểu dáng <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.bodyType}
                          onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                          required
                        >
                          {BODY_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Performance Specifications */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-100 rounded-xl">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Thông số hiệu năng</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Battery Capacity */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Dung lượng pin (kWh) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.batteryCapacity}
                            onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                            onWheel={handleWheelOnNumberInput}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                            required
                            min={0.1}
                            placeholder="85.0"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">kWh</span>
                        </div>
                      </div>

                      {/* Range */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Tầm xa (km) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.range}
                            onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                            onWheel={handleWheelOnNumberInput}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                            required
                            min={0.1}
                            placeholder="500"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">km</span>
                        </div>
                      </div>

                      {/* Power HP */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Công suất (HP) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.powerHp}
                            onChange={(e) => setFormData({ ...formData, powerHp: e.target.value })}
                            onWheel={handleWheelOnNumberInput}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                            required
                            min={0.1}
                            placeholder="400"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">HP</span>
                        </div>
                      </div>

                      {/* Torque */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Mô-men xoắn (Nm) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.torqueNm}
                            onChange={(e) => setFormData({ ...formData, torqueNm: e.target.value })}
                            onWheel={handleWheelOnNumberInput}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                            required
                            min={0.1}
                            placeholder="560"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">Nm</span>
                        </div>
                      </div>

                      {/* Acceleration */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Tăng tốc 0-100km/h (s) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={formData.acceleration}
                            onChange={(e) => setFormData({ ...formData, acceleration: e.target.value })}
                            onWheel={handleWheelOnNumberInput}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                            required
                            min={0.1}
                            placeholder="3.2"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">s</span>
                        </div>
                      </div>

                      {/* Seating Capacity */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Số chỗ ngồi <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.seatingCapacity}
                            onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                            onWheel={handleWheelOnNumberInput}
                            className="w-full px-4 py-3 pr-16 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                            required
                            min={2}
                            max={9}
                            placeholder="5"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">chỗ</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Additional Info */}
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-amber-100 rounded-xl">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Giá bán & Mô tả</h4>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Price */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Giá bán (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="1000"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            onWheel={handleWheelOnNumberInput}
                            className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
                            required
                            min={1000}
                            placeholder="450000000"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Mô tả chi tiết
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/80 backdrop-blur-sm resize-none transition-all duration-200 placeholder-gray-400"
                          rows={4}
                          placeholder="Mô tả đặc điểm nổi bật, công nghệ, tính năng của xe điện..."
                        />
                      </div>
                    </div>
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
                      disabled={status === 'loading'}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {status === 'loading' ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingModel ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                          </svg>
                          {editingModel ? 'Cập nhật xe' : 'Tạo xe mới'}
                        </>
                      )}
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

export default VehicleManagement;
