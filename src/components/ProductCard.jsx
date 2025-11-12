import { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedImage from './Animated';
import Tooltip from './ui/Tooltip';
import { 
  getModelImage, 
  getBodyTypeColor, 
  getBodyTypeIcon, 
  formatPrice, 
  formatNumber 
} from '../utils/modelHelpers';
import logo from '../assets/images/logo.png';

const ProductCard = ({ 
  model, 
  modelColors = [], 
  availableColors = [],
  onEdit, 
  onDelete, 
  onView, 
  onAddColor,
  onRemoveColor,
  isAddingColor = false,
  selectedColorId = '',
  onColorSelect,
  onToggleAddColor,
  onConfirmAddColor,
  onCancelAddColor
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => setImageLoaded(true);

  const handleImageError = (e) => {
    console.log('Image failed to load for model:', model.modelName);
    if (e?.target) e.target.src = logo;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-gray-50"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatedImage
            src={getModelImage(model.modelName)}
            alt={model.modelName}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}
        </motion.div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* BodyType badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getBodyTypeColor(model.bodyType)}`}>
            <span className="text-sm">{getBodyTypeIcon(model.bodyType)}</span>
            {model.bodyType}
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
            <span className="text-emerald-600 font-bold text-sm">
              {formatPrice(model.price)}
            </span>
          </div>
        </div>

        {/* Quick actions overlay */}
        <motion.div
          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <div className="flex gap-2">
            <Tooltip content="Xem thông tin chi tiết về mẫu xe này" placement="top">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onView(model)}
                className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-emerald-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </motion.button>
            </Tooltip>
            
            <Tooltip content="Chỉnh sửa thông tin mẫu xe" placement="top">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(model)}
                className="p-3 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
            </Tooltip>
          </div>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Model Info */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{model.modelName}</h3>
          <p className="text-sm text-gray-500">{model.modelYear} • {model.seatingCapacity} chỗ</p>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-emerald-600">{formatNumber(model.batteryCapacity)}</div>
            <div className="text-xs text-gray-600">kWh</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-emerald-600">{formatNumber(model.range)}</div>
            <div className="text-xs text-gray-600">km</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-emerald-600">{formatNumber(model.powerHp)}</div>
            <div className="text-xs text-gray-600">HP</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-emerald-600">{formatNumber(model.acceleration)}</div>
            <div className="text-xs text-gray-600">s</div>
          </div>
        </div>

        {/* Colors Section */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              Màu sắc ({modelColors.length})
            </span>
            {availableColors.length > 0 && !isAddingColor && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleAddColor(model.modelId)}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                + Thêm màu
              </motion.button>
            )}
          </div>

          {/* Color badges */}
          <div className="flex flex-wrap gap-2 min-h-[32px]">
            {modelColors.map((color) => (
              <motion.span
                key={color.colorId}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 group/color"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                {color.colorName}
                <button
                  onClick={() => onRemoveColor(model, color)}
                  className="ml-1 opacity-0 group-hover/color:opacity-100 hover:bg-emerald-200 rounded-full p-0.5 transition-all"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.span>
            ))}

            {/* Add color dropdown */}
            {isAddingColor && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex gap-2 items-center"
              >
                <select
                  value={selectedColorId}
                  onChange={(e) => onColorSelect(e.target.value)}
                  className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  autoFocus
                >
                  <option value="">-- Chọn màu --</option>
                  {availableColors.map((color) => (
                    <option key={color.colorId} value={color.colorId}>
                      {color.colorName}
                    </option>
                  ))}
                </select>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onConfirmAddColor(model)}
                  disabled={!selectedColorId}
                  className="px-2 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ✓
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onCancelAddColor(model.modelId)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  ✕
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Tooltip content="Xem thông số kỹ thuật đầy đủ và mô tả chi tiết" placement="bottom">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onView(model)}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
            >
              Chi tiết
            </motion.button>
          </Tooltip>
          <Tooltip content="Chỉnh sửa thông tin và thông số của mẫu xe" placement="bottom">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onEdit(model)}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium"
            >
              Sửa
            </motion.button>
          </Tooltip>
          <Tooltip content="Xóa mẫu xe này khỏi hệ thống" placement="bottom">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDelete(model.modelId)}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors font-medium"
            >
              Xóa
            </motion.button>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
