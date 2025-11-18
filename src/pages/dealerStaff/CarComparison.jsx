import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { getAllModelColorsThunk } from '../../store/slices/modelColorSlice';
import { get, API_URL } from '../../api/client';
import { getModelImage, formatPrice, formatNumber, getBodyTypeColor, getBodyTypeIcon } from '../../utils/modelHelpers';
import { ModernCard, ModernCardHeader, ModernCardContent } from '../../components/ui/ModernCard';
import ModernButton from '../../components/ui/ModernButton';
import logo from '../../assets/images/logo.png';

// Spec icons mapping
const SPEC_ICONS = {
  modelYear: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  price: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  battery: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  range: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  power: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  torque: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  acceleration: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  seating: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  description: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

function CarComparison() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const models = useSelector((state) => state.models.items);
  const modelsStatus = useSelector((state) => state.models.status);
  const modelsError = useSelector((state) => state.models.error);
  const modelColors = useSelector((state) => state.modelColors.items);
  const modelColorsStatus = useSelector((state) => state.modelColors.status);
  
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedColors, setSelectedColors] = useState({}); // { vehicleId: colorId }
  const [colors, setColors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBodyType, setFilterBodyType] = useState('all');
  const [loadingColors, setLoadingColors] = useState(false);

  // Fetch models and model-colors on component mount
  useEffect(() => {
    dispatch(getAllModelsThunk());
    dispatch(getAllModelColorsThunk());
  }, [dispatch]);

  // Use ref to prevent duplicate API calls
  const hasFetchedColorsRef = useRef(false);

  // Fetch colors
  useEffect(() => {
    // Only fetch once
    if (hasFetchedColorsRef.current) {
      return;
    }
    
    hasFetchedColorsRef.current = true;
    
    const fetchColors = async () => {
      try {
        setLoadingColors(true);
        const res = await get('/api/colors/all', { skipAuth: true });
        let colorsData = null;
        if (res?.data?.data && Array.isArray(res.data.data)) {
          colorsData = res.data.data;
        } else if (res?.data && Array.isArray(res.data)) {
          colorsData = res.data;
        } else if (Array.isArray(res)) {
          colorsData = res;
        } else {
          colorsData = [];
        }
        setColors(colorsData);
      } catch (err) {
        console.warn('Could not fetch colors:', err);
        setColors([]);
      } finally {
        setLoadingColors(false);
      }
    };
    fetchColors();
  }, []);

  // Auto-select first color for vehicles when modelColors are loaded or when vehicle is added
  useEffect(() => {
    if (modelColors.length > 0) {
      const newSelectedColors = { ...selectedColors };
      let hasChanges = false;
      
      selectedVehicles.forEach(vehicle => {
        // Always check and update if needed
        const availableColors = modelColors.filter(mc => Number(mc.modelId) === Number(vehicle.id));
        if (availableColors.length > 0) {
          const currentColorId = newSelectedColors[vehicle.id];
          // If no color selected or selected color is not available, select first available
          if (!currentColorId || !availableColors.find(mc => Number(mc.colorId) === Number(currentColorId))) {
            newSelectedColors[vehicle.id] = availableColors[0].colorId;
            hasChanges = true;
          }
        }
      });
      
      if (hasChanges) {
        setSelectedColors(newSelectedColors);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelColors.length, selectedVehicles.length]); // Only depend on length to avoid infinite loop

  // Get image URL from model-color imagePath
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '') {
      return null;
    }
    
    let url = imagePath.trim();
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    if (url.startsWith('/')) {
      if (API_URL && API_URL.trim() !== '') {
        return `${API_URL}${url}`;
      }
      return url;
    }
    
    if (API_URL && API_URL.trim() !== '') {
      return `${API_URL}/${url}`;
    }
    
    return url;
  };

  const getColorName = (colorId) => {
    const color = colors.find(c => c.colorId === colorId);
    return color?.colorName || modelColors.find(mc => mc.colorId === colorId)?.colorName || `Color #${colorId}`;
  };

  const getColorCode = (colorId) => {
    const color = colors.find(c => c.colorId === colorId);
    return color?.colorCode || '#CCCCCC';
  };

  // Get model-color image for a specific model and color
  const getModelColorImage = (modelId, colorId) => {
    if (!colorId) {
      // If no color selected, get first available model-color image
      const modelColor = modelColors.find(mc => Number(mc.modelId) === Number(modelId));
      if (modelColor?.imagePath) {
        return getImageUrl(modelColor.imagePath);
      }
      return null;
    }
    
    const modelColor = modelColors.find(
      mc => Number(mc.modelId) === Number(modelId) && Number(mc.colorId) === Number(colorId)
    );
    
    if (modelColor?.imagePath) {
      return getImageUrl(modelColor.imagePath);
    }
    
    return null;
  };

  // Get available colors for a model
  const getAvailableColors = (modelId) => {
    if (!modelColors || modelColors.length === 0) return [];
    return modelColors.filter(mc => Number(mc.modelId) === Number(modelId));
  };

  // Get price for a model-color combination
  const getModelColorPrice = (modelId, colorId) => {
    if (!colorId) {
      // If no color selected, get first available model-color price
      const modelColor = modelColors.find(mc => Number(mc.modelId) === Number(modelId));
      return modelColor?.price || modelColor?.priceOfStore || 0;
    }
    
    const modelColor = modelColors.find(
      mc => Number(mc.modelId) === Number(modelId) && Number(mc.colorId) === Number(colorId)
    );
    
    return modelColor?.price || modelColor?.priceOfStore || 0;
  };

  // Get minimum price for a model (from all model-colors)
  const getMinModelPrice = (modelId) => {
    const modelColorPrices = modelColors
      .filter(mc => Number(mc.modelId) === Number(modelId))
      .map(mc => mc.price || mc.priceOfStore || 0)
      .filter(price => price > 0);
    
    if (modelColorPrices.length > 0) {
      return Math.min(...modelColorPrices);
    }
    
    // Fallback to model price
    const model = models.find(m => Number(m.modelId) === Number(modelId));
    return model?.price || 0;
  };

  // Get vehicle price (from model-color if available, else from model)
  const getVehiclePrice = (vehicle) => {
    const colorId = selectedColors[vehicle.id];
    const modelColorPrice = getModelColorPrice(vehicle.id, colorId);
    if (modelColorPrice > 0) {
      return modelColorPrice;
    }
    return vehicle.price || 0;
  };

  // Transform API models to vehicle format
  const transformModelToVehicle = (model) => {
    const features = model.description 
      ? model.description.split('.').map(f => f.trim()).filter(f => f.length > 0)
      : ['Tính năng tiêu chuẩn'];
    
    // Get first available color for default image
    const firstModelColor = modelColors.find(mc => mc.modelId === model.modelId);
    const defaultImage = firstModelColor?.imagePath 
      ? getImageUrl(firstModelColor.imagePath)
      : getModelImage(model.modelName);
    
    return {
      id: model.modelId,
      name: model.modelName,
      category: model.bodyType || '',
      bodyType: model.bodyType,
      price: model.price || 0,
      range: model.range || 0,
      power: model.powerHp || 0,
      torque: model.torqueNm || 0,
      acceleration: model.acceleration || 0,
      seating: model.seatingCapacity || 5,
      battery: model.batteryCapacity || 0,
      modelYear: model.modelYear || new Date().getFullYear(),
      image: defaultImage || logo,
      features: features,
      description: model.description || ''
    };
  };

  // Transform and filter vehicles
  const vehicles = useMemo(() => {
    return models.map(transformModelToVehicle);
  }, [models, modelColors]);

  // Filter vehicles based on search and body type
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vehicle.bodyType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBodyType = filterBodyType === 'all' || vehicle.bodyType === filterBodyType;
      return matchesSearch && matchesBodyType;
    });
  }, [vehicles, searchTerm, filterBodyType]);

  // Get unique body types for filter
  const bodyTypes = useMemo(() => {
    const types = new Set(vehicles.map(v => v.bodyType));
    return Array.from(types);
  }, [vehicles]);

  const addVehicle = (vehicle) => {
    if (selectedVehicles.length < 3 && !selectedVehicles.find(v => v.id === vehicle.id)) {
      setSelectedVehicles([...selectedVehicles, vehicle]);
      // Set default color (first available color for this model)
      const availableColors = getAvailableColors(vehicle.id);
      if (availableColors.length > 0) {
        setSelectedColors({
          ...selectedColors,
          [vehicle.id]: availableColors[0].colorId
        });
      }
    }
  };

  const removeVehicle = (vehicleId) => {
    setSelectedVehicles(selectedVehicles.filter(v => v.id !== vehicleId));
    const newSelectedColors = { ...selectedColors };
    delete newSelectedColors[vehicleId];
    setSelectedColors(newSelectedColors);
  };

  const clearAll = () => {
    setSelectedVehicles([]);
    setSelectedColors({});
  };

  const updateVehicleColor = (vehicleId, colorId) => {
    setSelectedColors({
      ...selectedColors,
      [vehicleId]: colorId
    });
  };

  // Get current image for a vehicle (based on selected color)
  const getVehicleImage = (vehicle) => {
    const colorId = selectedColors[vehicle.id];
    const imageUrl = getModelColorImage(vehicle.id, colorId);
    return imageUrl || vehicle.image || logo;
  };

  const comparisonSpecs = [
    { key: 'modelYear', label: 'Năm sản xuất', unit: '', format: 'number', higherIsBetter: true },
    { key: 'price', label: 'Giá bán', unit: 'VNĐ', format: 'currency', higherIsBetter: false },
    { key: 'battery', label: 'Dung lượng pin', unit: 'kWh', format: 'number', higherIsBetter: true },
    { key: 'range', label: 'Tầm xa', unit: 'km', format: 'number', higherIsBetter: true },
    { key: 'power', label: 'Công suất', unit: 'HP', format: 'number', higherIsBetter: true },
    { key: 'torque', label: 'Mô-men xoắn', unit: 'Nm', format: 'number', higherIsBetter: true },
    { key: 'acceleration', label: 'Tăng tốc 0-100km/h', unit: 's', format: 'number', higherIsBetter: false },
    { key: 'seating', label: 'Số chỗ ngồi', unit: 'chỗ', format: 'number', higherIsBetter: true },
    { key: 'description', label: 'Mô tả', unit: '', format: 'text', higherIsBetter: null }
  ];

  const formatValue = (value, format, vehicle = null, specKey = null) => {
    switch (format) {
      case 'currency':
        if (!value || value === 0) {
          // For price in comparison table, show min price if available
          if (vehicle && specKey === 'price') {
            const minPrice = getMinModelPrice(vehicle.id);
            return minPrice > 0 ? `${Number(minPrice).toLocaleString('vi-VN')}₫` : '0₫';
          }
          return '0₫';
        }
        // Format price without "Liên hệ"
        return `${Number(value).toLocaleString('vi-VN')}₫`;
      case 'number':
        // For modelYear, don't use thousand separator
        if (specKey === 'modelYear') {
          return value ? String(value) : '—';
        }
        return formatNumber(value);
      case 'text':
        return value;
      default:
        return value;
    }
  };

  // Find best value for each spec
  const getBestValue = (specKey, higherIsBetter) => {
    if (selectedVehicles.length === 0) return null;
    const values = selectedVehicles.map(v => {
      if (specKey === 'price') {
        return getVehiclePrice(v);
      }
      return v[specKey];
    }).filter(v => v != null && v !== 0);
    if (values.length === 0) return null;
    return higherIsBetter ? Math.max(...values) : Math.min(...values);
  };

  // Check if value is best
  const isBestValue = (value, specKey, higherIsBetter, vehicle = null) => {
    const bestValue = getBestValue(specKey, higherIsBetter);
    if (bestValue === null) return false;
    const compareValue = specKey === 'price' && vehicle ? getVehiclePrice(vehicle) : value;
    return compareValue === bestValue;
  };

  // Loading state
  if (modelsStatus === 'loading' || modelColorsStatus === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ModernCard>
          <ModernCardContent className="py-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-gray-200 border-t-emerald-500 rounded-full"
                />
              </div>
              <p className="text-gray-600 mt-4 text-lg">Đang tải danh sách xe...</p>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    );
  }

  // Error state
  if (modelsStatus === 'failed') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ModernCard>
          <ModernCardContent className="py-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không thể tải danh sách xe</h3>
              <p className="text-gray-600 mb-6">{modelsError || 'Đã xảy ra lỗi không xác định'}</p>
              <ModernButton
                onClick={() => dispatch(getAllModelsThunk())}
                roleColor="emerald"
              >
                Thử lại
              </ModernButton>
            </div>
          </ModernCardContent>
        </ModernCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5 lg:py-6 space-y-4 sm:space-y-5 md:space-y-6">

      {/* Vehicle Selection Section */}
      <ModernCard gradient roleColor="emerald">
        <ModernCardContent>
          {/* Search and Filter */}
          <div className="mb-4 sm:mb-5 md:mb-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative min-w-0">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc loại xe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-9 sm:pl-10 md:pl-11 text-xs sm:text-sm md:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                />
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
              </div>
              <select
                value={filterBodyType}
                onChange={(e) => setFilterBodyType(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Tất cả loại xe</option>
                {bodyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            {selectedVehicles.length > 0 && (
              <div className="flex justify-end">
                <ModernButton
                  onClick={clearAll}
                  variant="secondary"
                  size="sm"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                >
                  Xóa tất cả
                </ModernButton>
              </div>
            )}
          </div>

          {/* Available Vehicles Grid */}
          {selectedVehicles.length < 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách xe</h3>
              {filteredVehicles.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">Không tìm thấy xe nào phù hợp với bộ lọc</p>
              </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredVehicles.map(vehicle => {
                    const isSelected = selectedVehicles.find(v => v.id === vehicle.id);
                    const canAdd = selectedVehicles.length < 3 && !isSelected;
                    
                    return (
                      <motion.div
                    key={vehicle.id}
                        whileHover={{ y: -4 }}
                        className={`relative bg-white rounded-xl p-4 border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                            : canAdd
                            ? 'border-gray-200 hover:border-emerald-300 hover:shadow-md'
                            : 'border-gray-200 opacity-50'
                        }`}
                        onClick={() => canAdd && addVehicle(vehicle)}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full px-2 py-1 text-xs font-semibold">
                            Đã chọn
                          </div>
                        )}
                        <img
                          src={vehicle.image || logo}
                      alt={vehicle.name}
                          className="w-full h-32 object-contain mb-3"
                      onError={(e) => {
                            e.target.src = logo;
                          }}
                        />
                        <h4 className="font-bold text-gray-900 mb-1">{vehicle.name}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getBodyTypeColor(vehicle.bodyType)}`}>
                            {getBodyTypeIcon(vehicle.bodyType)} {vehicle.bodyType}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <p className="text-xs text-gray-500 mb-1">Giá từ</p>
                          <p className="text-lg font-bold text-emerald-600">
                            {(() => {
                              const minPrice = getMinModelPrice(vehicle.id);
                              return minPrice > 0 ? `${Number(minPrice).toLocaleString('vi-VN')}₫` : '0₫';
                            })()}
                    </p>
                  </div>
                      </motion.div>
                    );
                  })}
              </div>
              )}
          </div>
        )}
        </ModernCardContent>
      </ModernCard>

        {/* Comparison Table */}
        {selectedVehicles.length >= 2 && (
        <ModernCard gradient roleColor="emerald">
          <ModernCardHeader
            title="Bảng so sánh chi tiết"
            subtitle={`So sánh ${selectedVehicles.length} mẫu xe`}
            icon="📊"
            roleColor="emerald"
          />
          <ModernCardContent>
          <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden shadow-lg rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-emerald-500 to-teal-600 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-white">
                          Thông số
                        </th>
                  {selectedVehicles.map(vehicle => (
                          <th key={vehicle.id} className="px-6 py-4 text-center text-sm font-bold text-white">
                            <div className="flex flex-col items-center">
                              <img
                                src={getVehicleImage(vehicle)}
                                alt={vehicle.name}
                                className="w-16 h-12 object-contain mb-2 bg-white rounded p-1"
                                onError={(e) => {
                                  e.target.src = logo;
                                }}
                              />
                              <span>{vehicle.name}</span>
                              {(() => {
                                const colorId = selectedColors[vehicle.id];
                                if (colorId) {
                                  return (
                                    <span className="text-xs font-normal mt-1 opacity-90">
                                      {getColorName(colorId)}
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                    </th>
                  ))}
                </tr>
              </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                {comparisonSpecs.map(spec => (
                        <tr key={spec.key} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="text-emerald-600">
                                {SPEC_ICONS[spec.key]}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{spec.label}</div>
                                {spec.unit && (
                                  <div className="text-xs text-gray-500">{spec.unit}</div>
                                )}
                              </div>
                            </div>
                    </td>
                          {selectedVehicles.map(vehicle => {
                            let value = spec.key === 'price' ? getVehiclePrice(vehicle) : vehicle[spec.key];
                            // For price, if value is 0, use minimum price from all model-colors
                            if (spec.key === 'price' && (!value || value === 0)) {
                              value = getMinModelPrice(vehicle.id);
                            }
                            const isBest = spec.higherIsBetter !== null ? isBestValue(value, spec.key, spec.higherIsBetter, vehicle) : false;
                            
                            return (
                              <td
                                key={vehicle.id}
                                className={`px-6 py-4 text-sm ${
                                  spec.key === 'description' 
                                    ? 'text-left' 
                                    : 'text-center whitespace-nowrap'
                                } ${
                                  isBest
                                    ? 'bg-emerald-50 font-bold text-emerald-700'
                                    : 'text-gray-900'
                                }`}
                              >
                                {spec.key === 'description' ? (
                                  <div className="text-sm text-gray-700 leading-relaxed">
                                    {value || 'Chưa có mô tả'}
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-2">
                                    {formatValue(value, spec.format, vehicle, spec.key)}
                                    {isBest && (
                                      <span className="text-emerald-600" title="Giá trị tốt nhất">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      </span>
                                    )}
                                  </div>
                                )}
                      </td>
                            );
                          })}
                  </tr>
                ))}
              </tbody>
            </table>
                  </div>
                </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        )}


    </div>
  );
}

export default CarComparison;
