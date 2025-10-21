import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAllModelsThunk,
  createModelThunk,
  updateModelThunk,
  deleteModelThunk,
} from '@store/slices/modelSlice';

// Import vehicle images
import electroAscentImg from '@/assets/images/electra ascent.png';
import electroCityLinkImg from '@/assets/images/electra citylink.png';
import electroGrandTourImg from '@/assets/images/electra grandtour.png';
import electroMicroImg from '@/assets/images/electra micro.png';
import electroSummitImg from '@/assets/images/electra summit.png';
import electroUrbanPulseImg from '@/assets/images/electra urbanpluse.png';
import electroVelocityImg from '@/assets/images/electra velocity.png';
import electroVoyagerImg from '@/assets/images/electra voyager.png';

// Body type configurations
const BODY_TYPES = [
  { value: 'SEDAN', label: 'Sedan', icon: '🚗', color: 'blue' },
  { value: 'SUV', label: 'SUV', icon: '🚙', color: 'emerald' },
  { value: 'HATCHBACK', label: 'Hatchback', icon: '🚐', color: 'purple' },
  { value: 'COUPE', label: 'Coupe', icon: '🏎️', color: 'red' },
  { value: 'CONVERTIBLE', label: 'Convertible', icon: '🎯', color: 'orange' },
  { value: 'WAGON', label: 'Wagon', icon: '🚙', color: 'teal' },
  { value: 'PICKUP', label: 'Pickup', icon: '🛻', color: 'yellow' },
  { value: 'VAN', label: 'Van', icon: '🚐', color: 'indigo' },
];

// Available vehicle images
const VEHICLE_IMAGES = [
  { value: '', label: 'Không có hình', src: null },
  { value: 'electra-ascent', label: 'Electra Ascent', src: electroAscentImg },
  { value: 'electra-citylink', label: 'Electra CityLink', src: electroCityLinkImg },
  { value: 'electra-grandtour', label: 'Electra GrandTour', src: electroGrandTourImg },
  { value: 'electra-micro', label: 'Electra Micro', src: electroMicroImg },
  { value: 'electra-summit', label: 'Electra Summit', src: electroSummitImg },
  { value: 'electra-urbanpulse', label: 'Electra UrbanPulse', src: electroUrbanPulseImg },
  { value: 'electra-velocity', label: 'Electra Velocity', src: electroVelocityImg },
  { value: 'electra-voyager', label: 'Electra Voyager', src: electroVoyagerImg },
];

function VehicleManagement() {
  const dispatch = useDispatch();
  const { items: models, status } = useSelector((s) => s.models);

  // View state
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBodyType, setFilterBodyType] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('modelName');

  // Form state
  const [formData, setFormData] = useState({
    modelName: '',
    modelYear: new Date().getFullYear(),
    bodyType: 'SEDAN',
    imageUrl: '',
    batteryCapacity: '',
    range: '',
    powerHp: '',
    torqueNm: '',
    acceleration: '',
    seatingCapacity: 5,
    price: '',
    description: '',
  });

  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    dispatch(getAllModelsThunk());
  }, [dispatch]);

  // Price ranges for filtering
  const PRICE_RANGES = [
    { value: '', label: 'Tất cả giá' },
    { value: '0-30000', label: 'Dưới $30,000' },
    { value: '30000-60000', label: '$30,000 - $60,000' },
    { value: '60000-100000', label: '$60,000 - $100,000' },
    { value: '100000-999999', label: 'Trên $100,000' },
  ];

  // Filtered and sorted models
  const filteredModels = useMemo(() => {
    let filtered = models.filter(model => {
      const matchesSearch = !searchTerm || 
        model.modelName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBodyType = !filterBodyType || model.bodyType === filterBodyType;
      
      let matchesPriceRange = true;
      if (filterPriceRange) {
        const [min, max] = filterPriceRange.split('-').map(Number);
        matchesPriceRange = model.price >= min && model.price <= max;
      }
      
      return matchesSearch && matchesBodyType && matchesPriceRange;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'modelName') return a.modelName.localeCompare(b.modelName);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'year-desc') return b.modelYear - a.modelYear;
      if (sortBy === 'range-desc') return b.range - a.range;
      return 0;
    });

    return filtered;
  }, [models, searchTerm, filterBodyType, filterPriceRange, sortBy]);

  // Handlers
  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: '', message: '' }), 3000);
  };

  const handleOpenCreate = () => {
    setEditingModel(null);
    setFormData({
      modelName: '',
      modelYear: new Date().getFullYear(),
      bodyType: 'SEDAN',
      imageUrl: '',
      batteryCapacity: '',
      range: '',
      powerHp: '',
      torqueNm: '',
      acceleration: '',
      seatingCapacity: 5,
      price: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (model) => {
    setEditingModel(model);
    setFormData({
      modelName: model.modelName || '',
      modelYear: model.modelYear || new Date().getFullYear(),
      bodyType: model.bodyType || 'SEDAN',
      imageUrl: model.imageUrl || '',
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
      const payload = {
        ...formData,
        batteryCapacity: parseFloat(formData.batteryCapacity),
        range: parseFloat(formData.range),
        powerHp: parseFloat(formData.powerHp),
        torqueNm: parseFloat(formData.torqueNm),
        acceleration: parseFloat(formData.acceleration),
        seatingCapacity: parseInt(formData.seatingCapacity),
        price: parseFloat(formData.price),
        modelYear: parseInt(formData.modelYear),
      };

      if (editingModel) {
        await dispatch(updateModelThunk({ ...payload, modelId: editingModel.modelId })).unwrap();
        showNotification('success', 'Cập nhật xe thành công!');
      } else {
        await dispatch(createModelThunk(payload)).unwrap();
        showNotification('success', 'Tạo xe mới thành công!');
      }
      
      setIsModalOpen(false);
    } catch (err) {
      showNotification('error', err?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (model) => {
    if (!window.confirm(`Xóa "${model.modelName}"?`)) return;
    
    try {
      await dispatch(deleteModelThunk(model.modelId)).unwrap();
      showNotification('success', 'Đã xóa xe!');
    } catch (err) {
      showNotification('error', err?.message || 'Không thể xóa xe');
    }
  };

  const getBodyTypeConfig = (type) => {
    return BODY_TYPES.find(t => t.value === type) || BODY_TYPES[0];
  };

  const getVehicleImage = (imageUrl) => {
    const image = VEHICLE_IMAGES.find(img => img.value === imageUrl);
    return image?.src || null;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterBodyType('');
    setFilterPriceRange('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`px-6 py-4 rounded-xl shadow-lg ${
              notification.type === 'success' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-red-500 text-white'
            }`}>
              <div className="flex items-center gap-3">
                {notification.type === 'success' ? '✓' : '✕'}
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Quản lý xe điện
              </h1>
              <p className="text-gray-500 mt-1">Quản lý danh mục sản phẩm Electra</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm xe mới
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm xe..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Body Type Filter */}
            <select
              value={filterBodyType}
              onChange={(e) => setFilterBodyType(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
            >
              <option value="">Tất cả kiểu dáng</option>
              {BODY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
              ))}
            </select>

            {/* Price Range Filter */}
            <select
              value={filterPriceRange}
              onChange={(e) => setFilterPriceRange(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
            >
              {PRICE_RANGES.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
            >
              <option value="modelName">Tên A-Z</option>
              <option value="price-asc">Giá thấp-cao</option>
              <option value="price-desc">Giá cao-thấp</option>
              <option value="year-desc">Năm mới nhất</option>
              <option value="range-desc">Tầm xa cao</option>
            </select>

            {/* Clear & View Mode */}
            <div className="flex gap-2">
              {(searchTerm || filterBodyType || filterPriceRange) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  title="Xóa bộ lọc"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}

              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(filterBodyType || filterPriceRange) && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {filterBodyType && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                  {getBodyTypeConfig(filterBodyType).icon} {getBodyTypeConfig(filterBodyType).label}
                  <button onClick={() => setFilterBodyType('')} className="hover:text-blue-900">×</button>
                </span>
              )}
              {filterPriceRange && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium flex items-center gap-2">
                  {PRICE_RANGES.find(r => r.value === filterPriceRange)?.label}
                  <button onClick={() => setFilterPriceRange('')} className="hover:text-emerald-900">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Vehicles Display */}
        {status === 'loading' && filteredModels.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">Không tìm thấy xe nào</p>
                <p className="text-gray-500 mt-1">
                  {searchTerm || filterBodyType || filterPriceRange 
                    ? 'Thử thay đổi bộ lọc hoặc tìm kiếm' 
                    : 'Bắt đầu bằng cách thêm xe đầu tiên'}
                </p>
              </div>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model, index) => {
              const bodyTypeConfig = getBodyTypeConfig(model.bodyType);
              const vehicleImage = getVehicleImage(model.imageUrl);
              return (
                <motion.div
                  key={model.modelId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
                >
                  {/* Vehicle Image */}
                  {vehicleImage && (
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                      <img 
                        src={vehicleImage} 
                        alt={model.modelName} 
                        className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 bg-${bodyTypeConfig.color}-100 text-${bodyTypeConfig.color}-700 rounded-full text-sm font-medium flex items-center gap-1`}>
                        <span>{bodyTypeConfig.icon}</span>
                        <span>{bodyTypeConfig.label}</span>
                      </div>
                      <div className="flex gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenEdit(model)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(model)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {model.modelName}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Năm {model.modelYear}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ${(model.price/1000).toFixed(0)}K
                      </span>
                      <span className="text-gray-500 text-sm">USD</span>
                    </div>

                    {/* Key Specs Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Pin</p>
                        <p className="font-semibold text-gray-900">{model.batteryCapacity} kWh</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Tầm xa</p>
                        <p className="font-semibold text-gray-900">{model.range} km</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Công suất</p>
                        <p className="font-semibold text-gray-900">{model.powerHp} HP</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">0-100 km/h</p>
                        <p className="font-semibold text-gray-900">{model.acceleration}s</p>
                      </div>
                    </div>

                    {/* Seating */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{model.seatingCapacity} chỗ ngồi</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="divide-y divide-gray-100">
              {filteredModels.map((model, index) => {
                const bodyTypeConfig = getBodyTypeConfig(model.bodyType);
                const vehicleImage = getVehicleImage(model.imageUrl);
                return (
                  <motion.div
                    key={model.modelId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      {/* Image or Icon */}
                      {vehicleImage ? (
                        <div className="w-24 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img 
                            src={vehicleImage} 
                            alt={model.modelName} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className={`w-16 h-16 bg-${bodyTypeConfig.color}-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}>
                          {bodyTypeConfig.icon}
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">{model.modelName}</h3>
                          <span className={`px-2 py-0.5 bg-${bodyTypeConfig.color}-100 text-${bodyTypeConfig.color}-700 rounded text-xs font-medium`}>
                            {bodyTypeConfig.label}
                          </span>
                          <span className="text-sm text-gray-500">• {model.modelYear}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <span>{model.batteryCapacity} kWh</span>
                          <span>•</span>
                          <span>{model.range} km</span>
                          <span>•</span>
                          <span>{model.powerHp} HP</span>
                          <span>•</span>
                          <span>{model.seatingCapacity} chỗ</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold text-gray-900">${(model.price/1000).toFixed(0)}K</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleOpenEdit(model)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(model)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results Count */}
        {filteredModels.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Hiển thị {filteredModels.length} / {models.length} xe
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {editingModel ? '✏️ Chỉnh sửa xe' : '➕ Thêm xe mới'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-6">
                  {/* Basic Info Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">1</span>
                      Thông tin cơ bản
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên xe <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.modelName}
                          onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                          placeholder="VD: Electra CityLink"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Năm <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.modelYear}
                          onChange={(e) => setFormData({ ...formData, modelYear: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                          required
                          min={2020}
                          max={2030}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kiểu dáng <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.bodyType}
                          onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                          required
                        >
                          {BODY_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hình ảnh
                        </label>
                        <select
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                        >
                          {VEHICLE_IMAGES.map(img => (
                            <option key={img.value} value={img.value}>
                              {img.label}
                            </option>
                          ))}
                        </select>
                        {formData.imageUrl && getVehicleImage(formData.imageUrl) && (
                          <div className="mt-3">
                            <img 
                              src={getVehicleImage(formData.imageUrl)} 
                              alt="Preview" 
                              className="w-full h-32 object-contain bg-gray-100 rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Technical Specs Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">2</span>
                      Thông số kỹ thuật
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pin (kWh) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.batteryCapacity}
                          onChange={(e) => setFormData({ ...formData, batteryCapacity: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                          placeholder="75"
                          required
                          min={0.1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tầm xa (km) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.range}
                          onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                          placeholder="450"
                          required
                          min={0.1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Công suất (HP) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.powerHp}
                          onChange={(e) => setFormData({ ...formData, powerHp: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                          placeholder="283"
                          required
                          min={0.1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô-men xoắn (Nm) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.torqueNm}
                          onChange={(e) => setFormData({ ...formData, torqueNm: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                          placeholder="420"
                          required
                          min={0.1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tăng tốc 0-100 (s) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.acceleration}
                          onChange={(e) => setFormData({ ...formData, acceleration: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                          placeholder="5.3"
                          required
                          min={0.1}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số chỗ ngồi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.seatingCapacity}
                          onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                          required
                          min={2}
                          max={9}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price & Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs">3</span>
                      Giá & mô tả
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giá ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all"
                          placeholder="45000"
                          required
                          min={0.01}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all resize-none"
                          rows={4}
                          placeholder="Mô tả chi tiết về xe..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    {status === 'loading' ? 'Đang xử lý...' : (editingModel ? 'Cập nhật' : 'Tạo xe')}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Hủy
                  </button>
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

