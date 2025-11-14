import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedImage from '../components/Animated';
import { Link } from 'react-router-dom';
import { get, API_URL } from '@/api/client';
import { getModelImage, formatNumber } from '../utils/modelHelpers';
import Tooltip from './ui/Tooltip';
import logo from '../assets/images/logo.png';

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
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  // State để lưu màu đã chọn cho mỗi model: { modelId: colorId }
  const [selectedColors, setSelectedColors] = useState({});
  // State để hiển thị dropdown chọn màu cho model nào
  const [showColorPicker, setShowColorPicker] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch model-colors first (main endpoint for displaying vehicles)
        let modelColorsRes;
        try {
          modelColorsRes = await get('/api/model-colors/all', { skipAuth: true });
        } catch (err) {
          // If public endpoint fails (e.g., requires auth), show error
          if (err.status === 401 || err.status === 403) {
            console.log('⚠️ Model-colors endpoint requires authentication');
            setError('Yêu cầu đăng nhập để xem danh sách xe');
          } else {
            console.warn('⚠️ Could not fetch model-colors:', err.message || 'Unknown error');
            setError(err.message || 'Không thể tải danh sách mẫu xe');
          }
          modelColorsRes = { data: [] };
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
          
        if (modelColorsData && Array.isArray(modelColorsData) && modelColorsData.length > 0) {
          setModelColors(modelColorsData);
        } else {
          setModelColors([]);
        }

        // Fetch models for additional details (optional, handle 401 gracefully)
        try {
          let res = await get('/api/models/all', { skipAuth: true });
          // Handle different response structures
          let modelsData = null;
          if (res?.data?.data && Array.isArray(res.data.data)) {
            modelsData = res.data.data;
          } else if (res?.data && Array.isArray(res.data)) {
            modelsData = res.data;
          } else if (Array.isArray(res)) {
            modelsData = res;
          } else {
            modelsData = [];
          }
          
          if (modelsData && Array.isArray(modelsData)) {
            setModels(modelsData);
          } else {
            setModels([]);
          }
        } catch (err) {
          // Silently handle 401 for models endpoint - we can still work with model-colors
          if (err.status === 401 || err.status === 403) {
            console.log('⚠️ Models endpoint requires authentication (skipping, using model-colors data only)');
          } else {
            console.warn('⚠️ Could not fetch models:', err.message || 'Unknown error');
          }
          setModels([]);
        }

        // Fetch colors to get color codes and names
        // Try public endpoint first, fallback gracefully if it requires auth
        try {
          let colorsRes;
          try {
            // Try public endpoint first
            colorsRes = await get('/api/colors/all', { skipAuth: true });
          } catch (err) {
            // If public endpoint fails (e.g., requires auth), silently fail
            if (err.status === 401 || err.status === 403) {
              console.log('⚠️ Colors endpoint requires authentication (skipping)');
            } else {
              console.warn('⚠️ Could not fetch colors:', err.message || 'Unknown error');
            }
            colorsRes = { data: [] };
          }
          
          let colorsData = null;
          if (colorsRes?.data?.data && Array.isArray(colorsRes.data.data)) {
            colorsData = colorsRes.data.data;
          } else if (colorsRes?.data && Array.isArray(colorsRes.data)) {
            colorsData = colorsRes.data;
          } else if (Array.isArray(colorsRes)) {
            colorsData = colorsRes;
          } else {
            colorsData = [];
          }
          
          if (colorsData && Array.isArray(colorsData) && colorsData.length > 0) {
            setColors(colorsData);
          } else {
            setColors([]);
          }
        } catch (err) {
          // Silently handle errors - page will still work
          // Only log if it's not a 401 (expected when not authenticated)
          if (err.status !== 401) {
            console.warn('⚠️ Could not fetch colors:', err);
          }
          setColors([]);
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

  // Helper functions to get model/color names and details
  const getModelName = (modelId) => {
    const model = models.find(m => m.modelId === modelId);
    return model?.modelName || modelColors.find(mc => mc.modelId === modelId)?.modelName || `Model #${modelId}`;
  };

  const getModelDetails = (modelId) => {
    return models.find(m => m.modelId === modelId) || null;
  };

  const getColorName = (colorId) => {
    const color = colors.find(c => c.colorId === colorId);
    return color?.colorName || modelColors.find(mc => mc.colorId === colorId)?.colorName || `Color #${colorId}`;
  };

  const getColorCode = (colorId) => {
    const color = colors.find(c => c.colorId === colorId);
    return color?.colorCode || '#CCCCCC';
  };

  // Get image URL from model-color imagePath
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '') {
      return null;
    }
    
    let url = imagePath.trim();
    
    // If imagePath is already a full URL (starts with http:// or https://), use it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // If imagePath is a relative path (starts with /), use it directly
    // Browser will resolve it from current domain (works with proxy in dev)
    // If API_URL is set, prepend it
    if (url.startsWith('/')) {
      if (API_URL && API_URL.trim() !== '') {
        return `${API_URL}${url}`;
      }
      return url;
    }
    
    // If it doesn't start with / or http, it might need API_URL
    if (API_URL && API_URL.trim() !== '') {
      return `${API_URL}/${url}`;
    }
    
    return url;
  };

  // Filter model-colors: only show ones with models (active models)
  const displayModelColors = modelColors.filter(mc => {
    const model = models.find(m => m.modelId === mc.modelId);
    return model !== undefined;
  });

  // Nhóm modelColors theo modelId và chỉ lấy unique models
  const uniqueModels = React.useMemo(() => {
    const modelMap = new Map();
    displayModelColors.forEach(mc => {
      if (!modelMap.has(mc.modelId)) {
        modelMap.set(mc.modelId, {
          modelId: mc.modelId,
          colors: []
        });
      }
      modelMap.get(mc.modelId).colors.push(mc);
    });
    return Array.from(modelMap.values());
  }, [displayModelColors]);

  // Lấy modelColor hiện tại dựa trên màu đã chọn (hoặc màu đầu tiên)
  const getCurrentModelColor = (modelId) => {
    const modelGroup = uniqueModels.find(m => m.modelId === modelId);
    if (!modelGroup || modelGroup.colors.length === 0) return null;
    
    const selectedColorId = selectedColors[modelId];
    if (selectedColorId) {
      const selected = modelGroup.colors.find(mc => mc.colorId === selectedColorId);
      if (selected) return selected;
    }
    // Nếu chưa chọn màu, trả về màu đầu tiên
    return modelGroup.colors[0];
  };

  // Lấy danh sách màu có sẵn cho một model
  const getAvailableColors = (modelId) => {
    const modelGroup = uniqueModels.find(m => m.modelId === modelId);
    return modelGroup ? modelGroup.colors : [];
  };

  // Xử lý chọn màu
  const handleColorSelect = (modelId, colorId) => {
    setSelectedColors(prev => ({
      ...prev,
      [modelId]: colorId
    }));
    setShowColorPicker(null);
  };

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showColorPicker && !event.target.closest('.color-picker-container')) {
        setShowColorPicker(null);
      }
    };

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showColorPicker]);

  // Transform model to vehicle format for comparison
  const transformModelToVehicle = (model) => {
    const features = model.description 
      ? model.description.split('.').map(f => f.trim()).filter(f => f.length > 0)
      : ['Tính năng tiêu chuẩn'];
    
    // Get image from first model-color for this model
    const modelColorWithImage = modelColors.find(
      mc => String(mc.modelId) === String(model.modelId) && mc.imagePath && mc.imagePath.trim() !== ''
    );
    const imageUrl = modelColorWithImage 
      ? getImageUrl(modelColorWithImage.imagePath) 
      : getModelImage(model.modelName);
    
    // Get price from model-colors (lowest price)
    const modelColorPrices = modelColors
      .filter(mc => String(mc.modelId) === String(model.modelId) && mc.price)
      .map(mc => Number(mc.price))
      .filter(price => price > 0);
    const price = modelColorPrices.length > 0 ? Math.min(...modelColorPrices) : 0;
    
    return {
      id: model.modelId,
      name: model.modelName,
      category: BODY_TYPES.find(t => t.value === model.bodyType)?.label || model.bodyType,
      price: price,
      range: model.range || 0,
      power: model.powerHp || 0,
      torque: model.torqueNm || 0,
      acceleration: model.acceleration || 0,
      seating: model.seatingCapacity || 5,
      battery: model.batteryCapacity || 0,
      modelYear: model.modelYear || new Date().getFullYear(),
      image: imageUrl,
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
          <div className="text-center mb-6">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-bold text-emerald-700 uppercase tracking-wider">
                  Sản phẩm
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Dòng xe{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-600 bg-clip-text text-transparent">
                  Electra
                </span>
              </h2>
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

        {/* No Model-Colors Found */}
        {!loading && !error && displayModelColors.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-gray-600">Hiện tại chưa có sản phẩm nào trong hệ thống.</p>
          </div>
        )}

        {/* Vehicle Grid - Display Unique Models */}
        {!loading && !error && uniqueModels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {uniqueModels.map((modelGroup, index) => {
              const currentModelColor = getCurrentModelColor(modelGroup.modelId);
              if (!currentModelColor) return null;
              
              const modelDetails = getModelDetails(modelGroup.modelId);
              const imageUrl = getImageUrl(currentModelColor.imagePath) || getModelImage(getModelName(modelGroup.modelId));
              const availableColors = getAvailableColors(modelGroup.modelId);
              
              return (
            <motion.div
              key={modelGroup.modelId}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-200/60 hover:border-emerald-300/60"
            >
              {/* Image Container */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {imageUrl ? (
                  <AnimatedImage
                    src={imageUrl}
                    alt={`${getModelName(modelGroup.modelId)} - ${getColorName(currentModelColor.colorId)}`}
                    key={`${modelGroup.modelId}-${currentModelColor.colorId}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      console.log('Image failed to load, using fallback');
                      const fallbackImage = getModelImage(getModelName(modelGroup.modelId));
                      if (e?.target && e.target.src !== fallbackImage) {
                        e.target.src = fallbackImage;
                      } else if (e?.target) {
                        e.target.src = logo;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Body Type Badge */}
                {modelDetails?.bodyType && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border border-white/10">
                      {modelDetails.bodyType}
                    </span>
                  </div>
                )}

                {/* Color Badge */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: getColorCode(currentModelColor.colorId) }}
                    />
                    <span className="text-sm font-medium text-gray-700">{getColorName(currentModelColor.colorId)}</span>
                  </div>
                </div>

                {/* Hover Overlay */}
                {modelDetails && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        whileHover={{ y: 0, opacity: 1 }}
                        className="text-white"
                      >
                        <div className="flex space-x-2 flex-wrap gap-2">
                          {modelDetails.batteryCapacity && (
                            <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs">
                              Pin {modelDetails.batteryCapacity}kWh
                            </span>
                          )}
                          {modelDetails.range && (
                            <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs">
                              Quãng đường {modelDetails.range}km
                            </span>
                          )}
                          {modelDetails.powerHp && (
                            <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-xs">
                              {modelDetails.powerHp} HP
                            </span>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">
                  {getModelName(modelGroup.modelId)}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {modelDetails?.modelYear ? `Model ${modelDetails.modelYear}` : 'Mẫu xe điện thông minh'}
                  {modelDetails?.bodyType && ` • ${modelDetails.bodyType}`}
                </p>
                
                {/* Model Details & Specs */}
                {modelDetails ? (
                  <>
                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500 mb-1">Pin</div>
                        <div className="font-semibold text-gray-900">
                          {modelDetails.batteryCapacity ? `${modelDetails.batteryCapacity} kWh` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500 mb-1">Quãng đường</div>
                        <div className="font-semibold text-gray-900">
                          {modelDetails.range ? `${modelDetails.range} km` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500 mb-1">Công suất</div>
                        <div className="font-semibold text-gray-900">
                          {modelDetails.powerHp ? `${modelDetails.powerHp} HP` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-gray-500 mb-1">Mô-men xoắn</div>
                        <div className="font-semibold text-gray-900">
                          {modelDetails.torqueNm ? `${modelDetails.torqueNm} Nm` : 'N/A'}
                        </div>
                      </div>
                      {modelDetails.acceleration && (
                        <div className="bg-gray-50 p-2 rounded col-span-2">
                          <div className="text-gray-500 mb-1">Tăng tốc (0-100km/h)</div>
                          <div className="font-semibold text-gray-900">{modelDetails.acceleration}s</div>
                        </div>
                      )}
                      {modelDetails.seatingCapacity && (
                        <div className="bg-gray-50 p-2 rounded col-span-2">
                          <div className="text-gray-500 mb-1">Số chỗ ngồi</div>
                          <div className="font-semibold text-gray-900">{modelDetails.seatingCapacity} chỗ</div>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}

                {/* Actions */}
                <div className="flex gap-2">
                  <Tooltip content="Xem thông số kỹ thuật chi tiết và hình ảnh của mẫu xe" placement="top">
                    <Link to={`/car/${modelGroup.modelId}`} className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
                      >
                        Xem chi tiết
                      </motion.button>
                    </Link>
                  </Tooltip>
                  
                  {/* Color Picker Button */}
                  <div className="relative color-picker-container">
                    <Tooltip content="Chọn màu xe" placement="top">
                      <motion.button
                        onClick={() => setShowColorPicker(showColorPicker === modelGroup.modelId ? null : modelGroup.modelId)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </motion.button>
                    </Tooltip>
                    
                    {/* Color Picker Dropdown */}
                    {showColorPicker === modelGroup.modelId && (
                      <div className="absolute right-0 bottom-full mb-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 min-w-[200px] color-picker-container">
                        <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                          Chọn màu xe
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {availableColors.map((mc) => (
                            <button
                              key={mc.modelColorId || `${mc.modelId}-${mc.colorId}`}
                              onClick={() => handleColorSelect(modelGroup.modelId, mc.colorId)}
                              className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                                currentModelColor.colorId === mc.colorId
                                  ? 'bg-green-50 border-2 border-green-500'
                                  : 'hover:bg-gray-50 border-2 border-transparent'
                              }`}
                            >
                              <div 
                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                                style={{ backgroundColor: getColorCode(mc.colorId) }}
                              />
                              <div className="flex-1 text-left">
                                <div className="text-sm font-medium text-gray-900">
                                  {getColorName(mc.colorId)}
                                </div>
                              </div>
                              {currentModelColor.colorId === mc.colorId && (
                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
              );
            })}
          </div>
        )}

        {/* CTA Section - Only show when there are models */}
        {!loading && !error && uniqueModels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-8 text-white border border-emerald-500/20 shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">
              Chưa tìm thấy mẫu xe phù hợp?
            </h3>
            <p className="text-slate-200 mb-6 max-w-2xl mx-auto text-lg">
              Liên hệ với đội ngũ tư vấn chuyên nghiệp của chúng tôi để được hỗ trợ 
              tìm kiếm mẫu xe phù hợp nhất với nhu cầu của bạn.
            </p>
            <motion.a
              href="/signin"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 inline-block text-center"
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
                                e.target.src = logo;
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
                                  e.target.src = logo;
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
