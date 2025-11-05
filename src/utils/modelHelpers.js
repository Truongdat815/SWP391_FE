// Import images
import electraAscent from '../assets/images/electra ascent.png';
import electraAscentPoster from '../assets/images/electra ascent poster.png';
import electraCityLink from '../assets/images/electra citylink.png';
import electraCityLinkPoster from '../assets/images/electra citylink poster.png';
import electraGrandTour from '../assets/images/electra grandtour.png';
import electraGrandTourPoster from '../assets/images/electra grandtour poster.png';
import electraMicro from '../assets/images/electra micro.png';
import electraMicroPoster from '../assets/images/electra micro poster.png';
import electraSummit from '../assets/images/electra summit.png';
import electraSummitPoster from '../assets/images/electra summit poster.png';
import electraUrbanPulse from '../assets/images/electra urbanpluse.png';
import electraUrbanPulsePoster from '../assets/images/electra urbanpluse poster.png';
import electraVelocity from '../assets/images/electra velocity.png';
import electraVelocityPoster from '../assets/images/electra velocity poster.png';
import electraVoyager from '../assets/images/electra voyager.png';
import electraVoyagerPoster from '../assets/images/electra voyager poster.png';
import logo from '../assets/images/logo.png';

// BodyType mapping từ tên mô tả tiếng Việt sang enum API
export const BODY_TYPE_MAPPING = {
  'Micro-Car': 'COUPE',
  'Compact Hatchback': 'HATCHBACK',
  'Compact Sedan': 'SEDAN',
  'Compact Crossover': 'CROSSOVER',
  'Luxury Sedan (GT)': 'SEDAN',
  'Luxury Full-Size SUV': 'SUV',
  'Luxury MPV/Van': 'VAN'
};

// Reverse mapping từ enum API về tên hiển thị
export const BODY_TYPE_DISPLAY = {
  'COUPE': 'Micro-Car',
  'HATCHBACK': 'Compact Hatchback',
  'SEDAN': 'Compact Sedan',
  'CROSSOVER': 'Compact Crossover',
  'SUV': 'Luxury Full-Size SUV',
  'VAN': 'Luxury MPV/Van',
  'CONVERTIBLE': 'Convertible',
  'WAGON': 'Wagon',
  'PICKUP_TRUCK': 'Pickup Truck'
};

// BodyType colors cho UI
export const BODY_TYPE_COLORS = {
  'COUPE': 'bg-purple-100 text-purple-800 border-purple-200',
  'HATCHBACK': 'bg-blue-100 text-blue-800 border-blue-200',
  'SEDAN': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'CROSSOVER': 'bg-orange-100 text-orange-800 border-orange-200',
  'SUV': 'bg-red-100 text-red-800 border-red-200',
  'VAN': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'CONVERTIBLE': 'bg-pink-100 text-pink-800 border-pink-200',
  'WAGON': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'PICKUP_TRUCK': 'bg-gray-100 text-gray-800 border-gray-200'
};

// BodyType icons
export const BODY_TYPE_ICONS = {
  'COUPE': '🚗',
  'HATCHBACK': '🚙',
  'SEDAN': '🚘',
  'CROSSOVER': '🚐',
  'SUV': '🚙',
  'VAN': '🚐',
  'CONVERTIBLE': '🚗',
  'WAGON': '🚐',
  'PICKUP_TRUCK': '🚛'
};

// Image mapping cho models
const MODEL_IMAGES = {
  'Electra Micro': electraMicro,
  'Electra Nano': electraMicro, // Electra Nano sử dụng hình ảnh của Electra Micro
  'Electra UrbanPulse': electraUrbanPulse,
  'Electra CityLink': electraCityLink,
  'Electra Ascent': electraAscent,
  'Electra GrandTour': electraGrandTour,
  'Electra Summit': electraSummit,
  'Electra Voyager': electraVoyager
};

// Poster images mapping
const MODEL_POSTERS = {
  'Electra Micro': electraMicroPoster,
  'Electra Nano': electraMicroPoster, // Electra Nano sử dụng poster của Electra Micro
  'Electra UrbanPulse': electraUrbanPulsePoster,
  'Electra CityLink': electraCityLinkPoster,
  'Electra Ascent': electraAscentPoster,
  'Electra GrandTour': electraGrandTourPoster,
  'Electra Summit': electraSummitPoster,
  'Electra Voyager': electraVoyagerPoster
};

/**
 * Lấy hình ảnh chính của model
 * @param {string} modelName - Tên model
 * @returns {string} - URL hình ảnh
 */
export const getModelImage = (modelName) => {
  if (!modelName) return logo;
  
  // Tìm exact match trước
  if (MODEL_IMAGES[modelName]) {
    return MODEL_IMAGES[modelName];
  }
  
  // Tìm partial match (case insensitive)
  const normalizedName = modelName.toLowerCase().replace(/\s+/g, '');
  for (const [key, value] of Object.entries(MODEL_IMAGES)) {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
    if (normalizedName.includes(normalizedKey) || normalizedKey.includes(normalizedName)) {
      return value;
    }
  }
  
  return logo;
};

/**
 * Lấy hình ảnh poster của model
 * @param {string} modelName - Tên model
 * @returns {string} - URL hình ảnh poster
 */
export const getModelPoster = (modelName) => {
  if (!modelName) return logo;
  
  // Tìm exact match trước
  if (MODEL_POSTERS[modelName]) {
    return MODEL_POSTERS[modelName];
  }
  
  // Tìm partial match (case insensitive)
  const normalizedName = modelName.toLowerCase().replace(/\s+/g, '');
  for (const [key, value] of Object.entries(MODEL_POSTERS)) {
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
    if (normalizedName.includes(normalizedKey) || normalizedKey.includes(normalizedName)) {
      return value;
    }
  }
  
  return logo;
};

/**
 * Chuyển đổi bodyType từ tên mô tả sang enum API
 * @param {string} displayName - Tên hiển thị
 * @returns {string} - Enum API value
 */
export const mapBodyTypeToAPI = (displayName) => {
  return BODY_TYPE_MAPPING[displayName] || 'SEDAN';
};

/**
 * Chuyển đổi bodyType từ enum API sang tên hiển thị
 * @param {string} apiValue - Enum API value
 * @returns {string} - Tên hiển thị
 */
export const mapBodyTypeToDisplay = (apiValue) => {
  return BODY_TYPE_DISPLAY[apiValue] || apiValue;
};

/**
 * Lấy màu CSS cho bodyType
 * @param {string} bodyType - BodyType enum
 * @returns {string} - CSS classes
 */
export const getBodyTypeColor = (bodyType) => {
  return BODY_TYPE_COLORS[bodyType] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Lấy icon cho bodyType
 * @param {string} bodyType - BodyType enum
 * @returns {string} - Icon emoji
 */
export const getBodyTypeIcon = (bodyType) => {
  return BODY_TYPE_ICONS[bodyType] || '🚗';
};

/**
 * Format giá tiền theo định dạng Việt Nam
 * @param {number} price - Giá tiền
 * @returns {string} - Giá đã format
 */
export const formatPrice = (price) => {
  if (!price || price === 0) return 'Liên hệ';
  return `${Number(price).toLocaleString('vi-VN')}₫`;
};

/**
 * Format số với dấu phẩy
 * @param {number} value - Giá trị số
 * @returns {string} - Số đã format
 */
export const formatNumber = (value) => {
  if (!value && value !== 0) return '—';
  return Number(value).toLocaleString('vi-VN');
};

// Demo data cho 7 mẫu xe
// Format theo API mới: modelId, modelName, modelYear, batteryCapacity, range, powerHp, torqueNm, acceleration, seatingCapacity, bodyType, description
export const DEMO_MODELS_DATA = [
  {
    modelId: 0,
    modelName: "Electra Nano",
    modelYear: 2025,
    batteryCapacity: 22,
    range: 180,
    powerHp: 55,
    torqueNm: 105,
    acceleration: 13.5,
    seatingCapacity: 2,
    bodyType: "COUPE", // Micro-Car -> COUPE
    description: "Chiếc xe điện đô thị siêu nhỏ gọn, lý tưởng cho việc di chuyển hàng ngày. Tối ưu hóa sự tiện lợi và dễ dàng đỗ xe trong không gian chật hẹp. Sử dụng công nghệ pin LFP bền bỉ."
  },
  {
    modelId: 0,
    modelName: "Electra UrbanPulse",
    modelYear: 2025,
    batteryCapacity: 60,
    range: 380,
    powerHp: 185,
    torqueNm: 280,
    acceleration: 8.2,
    seatingCapacity: 5,
    bodyType: "HATCHBACK", // Compact Hatchback -> HATCHBACK
    description: "Hatchback điện năng động, thiết kế trẻ trung. Cung cấp tầm hoạt động tốt và trang bị công nghệ V2L (Vehicle-to-Load), hoàn hảo cho người trẻ và gia đình nhỏ."
  },
  {
    modelId: 0,
    modelName: "Electra CityLink",
    modelYear: 2026,
    batteryCapacity: 75,
    range: 480,
    powerHp: 240,
    torqueNm: 350,
    acceleration: 6.8,
    seatingCapacity: 5,
    bodyType: "SEDAN", // Compact Sedan -> SEDAN
    description: "Sedan cỡ nhỏ thanh lịch với hiệu quả khí động học cao. Mang lại trải nghiệm lái êm ái cùng các tính năng ADAS Cấp độ 2 tiên tiến và tùy chọn hệ dẫn động AWD."
  },
  {
    modelId: 0,
    modelName: "Electra Ascent",
    modelYear: 2026,
    batteryCapacity: 80,
    range: 450,
    powerHp: 290,
    torqueNm: 420,
    acceleration: 6.2,
    seatingCapacity: 5,
    bodyType: "CROSSOVER", // Compact Crossover -> CROSSOVER
    description: "Crossover linh hoạt với gầm cao và cabin rộng rãi hơn. Thiết kế hiện đại, phù hợp cho cả đô thị và những chuyến đi dã ngoại cuối tuần. Tích hợp Camera 360 độ."
  },
  {
    modelId: 0,
    modelName: "Electra GrandTour",
    modelYear: 2027,
    batteryCapacity: 110,
    range: 620,
    powerHp: 480,
    torqueNm: 700,
    acceleration: 4.1,
    seatingCapacity: 4,
    bodyType: "SEDAN", // Luxury Sedan (GT) -> SEDAN
    description: "Sedan hạng sang cao cấp sử dụng kiến trúc 800V và Pin lớn. Thiết kế tập trung vào hiệu suất và sự tinh tế. Nội thất bọc da Nappa và công nghệ AR HUD."
  },
  {
    modelId: 0,
    modelName: "Electra Summit",
    modelYear: 2027,
    batteryCapacity: 120,
    range: 550,
    powerHp: 540,
    torqueNm: 850,
    acceleration: 4.8,
    seatingCapacity: 6,
    bodyType: "SUV", // Luxury Full-Size SUV -> SUV
    description: "SUV cỡ lớn hạng sang, dẫn động AWD tiêu chuẩn, cung cấp không gian rộng rãi và sự thoải mái tối đa cho 6 người. Sử dụng hệ thống treo khí nén và kiến trúc 800V."
  },
  {
    modelId: 0,
    modelName: "Electra Voyager",
    modelYear: 2026,
    batteryCapacity: 100,
    range: 520,
    powerHp: 320,
    torqueNm: 500,
    acceleration: 7.5,
    seatingCapacity: 7,
    bodyType: "VAN", // Luxury MPV/Van -> VAN
    description: "Xe MPV 7 chỗ hạng sang, tối ưu không gian và tiện nghi cho hành khách. Trang bị cửa trượt điện và ghế VIP giữa có đệm chân. Lý tưởng cho gia đình lớn và dịch vụ cao cấp."
  }
];

/**
 * Lấy danh sách tất cả bodyType options cho dropdown
 * @returns {Array} - Array of {value, label, icon, color}
 */
export const getBodyTypeOptions = () => {
  return Object.entries(BODY_TYPE_DISPLAY).map(([value, label]) => ({
    value,
    label,
    icon: getBodyTypeIcon(value),
    color: getBodyTypeColor(value)
  }));
};

/**
 * Validate model data
 * @param {Object} modelData - Model data to validate
 * @returns {Object} - {isValid: boolean, errors: Array}
 */
export const validateModelData = (modelData) => {
  const errors = [];
  
  if (!modelData.modelName || modelData.modelName.trim() === '') {
    errors.push('Tên mẫu xe là bắt buộc');
  }
  
  if (!modelData.modelYear || modelData.modelYear < 2020 || modelData.modelYear > 2030) {
    errors.push('Năm sản xuất phải từ 2020 đến 2030');
  }
  
  // Price validation removed - price is now managed at model-color level
  
  if (!modelData.bodyType) {
    errors.push('Kiểu dáng xe là bắt buộc');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
