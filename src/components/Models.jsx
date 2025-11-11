import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedImage from '../components/Animated';
import { Link } from 'react-router-dom';
import { get } from '@/api/client';
import { getModelImage, formatNumber } from '../utils/modelHelpers';
import Tooltip from './ui/Tooltip';

// Body types mapping
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

const Models = () => {
  const [models, setModels] = useState([]);
  const [modelColors, setModelColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch models
        let res;
        try {
            res = await get('/api/models/all');
        } catch (err) {
            if (err.message && err.message.includes('401')) {
                console.log('🔓 Trying as public endpoint (no token)...');
                res = await get('/api/models/all', { skipAuth: true });
            } else {
                throw err;
            }
        }
        console.log('📦 Raw API response:', res);
        
        // Handle different response structures
        let modelsData = null;
        if (res?.data?.data && Array.isArray(res.data.data)) {
          modelsData = res.data.data;
        } else if (res?.data && Array.isArray(res.data)) {
          modelsData = res.data;
        } else if (Array.isArray(res)) {
          modelsData = res;
        } else {
          console.warn('⚠️ Unexpected response structure:', res);
          modelsData = [];
        }
        
        if (modelsData && Array.isArray(modelsData)) {
          console.log(`✅ Setting ${modelsData.length} models`);
          setModels(modelsData);
        } else {
          console.warn('⚠️ Models data is not an array:', modelsData);
          setModels([]);
        }

        // Fetch model-colors to get prices
        try {
          let modelColorsRes;
          try {
            modelColorsRes = await get('/api/model-colors');
          } catch (err) {
            // If 401, try as public endpoint
            if (err.message && err.message.includes('401')) {
              console.log('🔓 Trying model-colors as public endpoint...');
              modelColorsRes = await get('/api/model-colors', { skipAuth: true });
            } else {
              throw err;
            }
          }
          
          let modelColorsData = null;
          if (modelColorsRes?.data?.data && Array.isArray(modelColorsRes.data.data)) {
            modelColorsData = modelColorsRes.data.data;
          } else if (modelColorsRes?.data && Array.isArray(modelColorsRes.data)) {
            modelColorsData = modelColorsRes.data;
          } else if (Array.isArray(modelColorsRes)) {
            modelColorsData = modelColorsRes;
          } else {
            modelColorsData = [];
          }
          
          if (modelColorsData && Array.isArray(modelColorsData)) {
            console.log(`✅ Setting ${modelColorsData.length} model-colors`);
            setModelColors(modelColorsData);
          }
        } catch (err) {
          console.warn('⚠️ Could not fetch model-colors:', err);
          // Don't fail the whole component if model-colors fail
          setModelColors([]);
        }
      } catch (err) {
        console.error('❌ Lỗi lấy danh sách model:', err);
        setError(err.message || 'Không thể tải danh sách mẫu xe');
        setModels([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Transform model to vehicle format for comparison
  const transformModelToVehicle = (model) => {
    const features = model.description 
      ? model.description.split('.').map(f => f.trim()).filter(f => f.length > 0)
      : ['Tính năng tiêu chuẩn'];
    
    return {
      id: model.modelId,
      name: model.modelName,
      category: BODY_TYPES.find(t => t.value === model.bodyType)?.label || model.bodyType,
      price: getModelPrice(model.modelId),
      range: model.range || 0,
      power: model.powerHp || 0,
      torque: model.torqueNm || 0,
      acceleration: model.acceleration || 0,
      seating: model.seatingCapacity || 5,
      battery: model.batteryCapacity || 0,
      modelYear: model.modelYear || new Date().getFullYear(),
      image: getModelImage(model.modelName),
      features: features
    };
  };

  const addVehicleToComparison = (model) => {
    const vehicle = transformModelToVehicle(model);
    if (selectedVehicles.length < 3 && !selectedVehicles.find(v => v.id === vehicle.id)) {
      setSelectedVehicles([...selectedVehicles, vehicle]);
    }
  };

  const removeVehicleFromComparison = (vehicleId) => {
    setSelectedVehicles(selectedVehicles.filter(v => v.id !== vehicleId));
  };

  const comparisonSpecs = [
    { key: 'modelYear', label: 'Năm sản xuất', unit: '', format: 'number' },
    { key: 'price', label: 'Giá bán', unit: 'VNĐ', format: 'currency' },
    { key: 'battery', label: 'Dung lượng pin', unit: 'kWh', format: 'number' },
    { key: 'range', label: 'Tầm xa', unit: 'km', format: 'number' },
    { key: 'power', label: 'Công suất', unit: 'HP', format: 'number' },
    { key: 'torque', label: 'Mô-men xoắn', unit: 'Nm', format: 'number' },
    { key: 'acceleration', label: 'Tăng tốc 0-100km/h', unit: 's', format: 'number' },
    { key: 'seating', label: 'Số chỗ ngồi', unit: 'chỗ', format: 'number' }
  ];

  const formatValue = (value, format, key) => {
    switch (format) {
      case 'currency':
        return value ? `${Number(value).toLocaleString('vi-VN')} VNĐ` : '0 VNĐ';
      case 'number':
        // Năm sản xuất không format dấu chấm
        if (key === 'modelYear') {
          return value ? String(value) : '—';
        }
        return formatNumber(value);
      case 'text':
        return value;
      default:
        return value || '—';
    }
  };

  const isVehicleSelected = (modelId) => {
    return selectedVehicles.some(v => v.id === modelId);
  };

  const canAddToComparison = (modelId) => {
    return selectedVehicles.length < 3 && !isVehicleSelected(modelId);
  };

  // Get price from model-colors for a model (get lowest price or first available)
  const getModelPrice = (modelId) => {
    const modelColorPrices = modelColors
      .filter(mc => String(mc.modelId) === String(modelId) && mc.price)
      .map(mc => Number(mc.price))
      .filter(price => price > 0);
    
    if (modelColorPrices.length > 0) {
      // Return the lowest price
      return Math.min(...modelColorPrices);
    }
    return 0;
  };

  return (
    <section id="models" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Dòng xe{' '}
                <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  <span className="text-green-600">Electra</span>
                </span>
              </h2>
            </div>
            <div className="flex-1 flex justify-center md:justify-end">
              {models.length > 0 && (
                <motion.button
                  onClick={() => setShowComparison(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm md:text-base"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hidden sm:inline">So sánh xe</span>
                  <span className="sm:hidden">So sánh</span>
                  {selectedVehicles.length > 0 && (
                    <span className="bg-white text-green-600 rounded-full px-2 py-0.5 text-xs font-bold">
                      {selectedVehicles.length}
                    </span>
                  )}
                </motion.button>
              )}
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá bộ sưu tập xe điện đa dạng, từ xe đô thị nhỏ gọn đến SUV cao cấp, 
            tất cả đều được thiết kế để mang đến trải nghiệm lái xe tuyệt vời.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách mẫu xe...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* No Models Found */}
        {!loading && !error && models.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có mẫu xe nào</h3>
            <p className="text-gray-600">Hiện tại chưa có mẫu xe nào trong hệ thống.</p>
          </div>
        )}

        {/* Vehicle Grid */}
        {!loading && !error && models.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {models.map((model, index) => (
            <motion.div
              key={model.modelId}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden">
                <AnimatedImage
                  src={getModelImage(model.modelName)}
                  alt={model.modelName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    console.log('Image failed to load for model:', model.modelName);
                    if (e?.target) e.target.src = '/src/assets/images/logo.png';
                  }}
                />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-gradient-to-r from-green-600 to-green-800 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {model.bodyType || 'EV'}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileHover={{ y: 0, opacity: 1 }}
                      className="text-white"
                    >
                      <div className="flex space-x-2">
                        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs">
                          {model.batteryCapacity ? `Pin ${model.batteryCapacity}kWh` : 'Pin N/A'}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs">
                          {model.range ? `Quãng đường ${model.range}km` : 'Quãng đường N/A'}
                        </span>
                        <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs">
                          {model.powerHp ? `${model.powerHp} HP` : 'Công suất N/A'}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                  {model.modelName}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {model.modelYear ? `Model ${model.modelYear}` : 'Mẫu xe điện thông minh'}
                  {model.bodyType && ` • ${model.bodyType}`}
                </p>
                
                {/* Specifications Grid - Hiển thị thông số kỹ thuật */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 mb-1">Pin</div>
                    <div className="font-semibold text-gray-900">
                      {model.batteryCapacity ? `${model.batteryCapacity} kWh` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 mb-1">Quãng đường</div>
                    <div className="font-semibold text-gray-900">
                      {model.range ? `${model.range} km` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 mb-1">Công suất</div>
                    <div className="font-semibold text-gray-900">
                      {model.powerHp ? `${model.powerHp} HP` : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-gray-500 mb-1">Mô-men xoắn</div>
                    <div className="font-semibold text-gray-900">
                      {model.torqueNm ? `${model.torqueNm} Nm` : 'N/A'}
                    </div>
                  </div>
                  {model.acceleration && (
                    <div className="bg-gray-50 p-2 rounded col-span-2">
                      <div className="text-gray-500 mb-1">Tăng tốc (0-100km/h)</div>
                      <div className="font-semibold text-gray-900">{model.acceleration}s</div>
                    </div>
                  )}
                  {model.seatingCapacity && (
                    <div className="bg-gray-50 p-2 rounded col-span-2">
                      <div className="text-gray-500 mb-1">Số chỗ ngồi</div>
                      <div className="font-semibold text-gray-900">{model.seatingCapacity} chỗ</div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {(() => {
                      const price = getModelPrice(model.modelId);
                      return price > 0 ? `${Number(price).toLocaleString('vi-VN')} VNĐ` : '0 VNĐ';
                    })()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Tooltip content="Xem thông số kỹ thuật chi tiết và hình ảnh của mẫu xe" placement="top">
                    <Link to={`/car/${model.modelId}`} className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-[#6CA12B] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                      >
                        Xem chi tiết
                      </motion.button>
                    </Link>
                  </Tooltip>
                  {isVehicleSelected(model.modelId) ? (
                    <Tooltip content="Xóa khỏi danh sách so sánh" placement="top">
                      <motion.button
                        onClick={() => removeVehicleFromComparison(model.modelId)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.button>
                    </Tooltip>
                  ) : (
                    <Tooltip 
                      content={canAddToComparison(model.modelId) ? "Thêm vào so sánh" : "Đã đạt tối đa 3 xe để so sánh"} 
                      placement="top"
                    >
                      <motion.button
                        onClick={() => addVehicleToComparison(model)}
                        disabled={!canAddToComparison(model.modelId)}
                        whileHover={{ scale: canAddToComparison(model.modelId) ? 1.05 : 1 }}
                        whileTap={{ scale: canAddToComparison(model.modelId) ? 0.95 : 1 }}
                        className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          canAddToComparison(model.modelId)
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </motion.button>
                    </Tooltip>
                  )}
                </div>
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {/* CTA Section - Only show when there are models */}
        {!loading && !error && models.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Chưa tìm thấy mẫu xe phù hợp?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Liên hệ với đội ngũ tư vấn chuyên nghiệp của chúng tôi để được hỗ trợ 
              tìm kiếm mẫu xe phù hợp nhất với nhu cầu của bạn.
            </p>
            <motion.a
              href="/signin"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 inline-block text-center"
            >
              Liên hệ với đại lí 
            </motion.a>
          </div>
        </motion.div>
        )}
      </div>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowComparison(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 text-white flex items-center justify-between">
                <h2 className="text-2xl font-bold">So sánh mẫu xe</h2>
                <button
                  onClick={() => setShowComparison(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Selected Vehicles Display */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Xe đã chọn ({selectedVehicles.length}/3)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map(index => (
                      <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                        {selectedVehicles[index] ? (
                          <div className="text-center w-full">
                            <img
                              src={selectedVehicles[index].image}
                              alt={selectedVehicles[index].name}
                              className="w-32 h-20 object-contain mx-auto mb-2"
                              onError={(e) => {
                                e.target.src = '/src/assets/images/logo.png';
                              }}
                            />
                            <h4 className="font-semibold text-gray-900">{selectedVehicles[index].name}</h4>
                            <p className="text-sm text-gray-600">{selectedVehicles[index].category}</p>
                            <p className="text-sm font-medium text-green-600 mt-1">
                              {selectedVehicles[index].price 
                                ? `${Number(selectedVehicles[index].price).toLocaleString('vi-VN')} VNĐ`
                                : '0 VNĐ'}
                            </p>
                            <button
                              onClick={() => removeVehicleFromComparison(selectedVehicles[index].id)}
                              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Xóa
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <p className="text-sm">Chọn xe để so sánh</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Selector */}
                {selectedVehicles.length < 3 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn thêm xe để so sánh</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                      {models
                        .filter(model => !isVehicleSelected(model.modelId))
                        .map(model => {
                          const vehicle = transformModelToVehicle(model);
                          return (
                            <div
                              key={vehicle.id}
                              onClick={() => addVehicleToComparison(model)}
                              className="border rounded-lg p-3 cursor-pointer transition-colors border-gray-200 hover:border-green-400 hover:bg-green-50"
                            >
                              <img
                                src={vehicle.image}
                                alt={vehicle.name}
                                className="w-full h-16 object-contain mb-2"
                                onError={(e) => {
                                  e.target.src = '/src/assets/images/logo.png';
                                }}
                              />
                              <h4 className="font-semibold text-gray-900 text-sm">{vehicle.name}</h4>
                              <p className="text-xs text-gray-600">{vehicle.category}</p>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Comparison Table */}
                {selectedVehicles.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảng so sánh thông số</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thông số</th>
                            {selectedVehicles.map(vehicle => (
                              <th key={vehicle.id} className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                                {vehicle.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {comparisonSpecs.map(spec => (
                            <tr key={spec.key} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {spec.label}
                              </td>
                              {selectedVehicles.map(vehicle => (
                                <td key={vehicle.id} className="px-4 py-3 text-sm text-gray-900 text-center">
                                  {formatValue(vehicle[spec.key], spec.format, spec.key)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Features Comparison */}
                {selectedVehicles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">So sánh tính năng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedVehicles.map(vehicle => (
                        <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3">{vehicle.name}</h4>
                          <div className="space-y-2">
                            {vehicle.features.map((feature, index) => (
                              <div key={index} className="flex items-start">
                                <svg className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {selectedVehicles.length === 0 && (
                  <div className="text-center py-8">
                    <svg className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-2">Chưa có xe nào được chọn</p>
                    <p className="text-gray-400 text-sm">Chọn ít nhất 1 xe để bắt đầu so sánh</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Models;
