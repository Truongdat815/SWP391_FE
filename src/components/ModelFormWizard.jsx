import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getModelImage, 
  getBodyTypeOptions, 
  validateModelData,
  formatPrice 
} from '../utils/modelHelpers';

const ModelFormWizard = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingModel = null,
  isLoading = false 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    modelName: '',
    modelYear: new Date().getFullYear(),
    batteryCapacity: '',
    range: '',
    powerHp: '',
    torqueNm: '',
    acceleration: '',
    seatingCapacity: '',
    price: '',
    bodyType: 'SEDAN',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const totalSteps = 3;

  useEffect(() => {
    if (editingModel) {
      setFormData({
        modelId: editingModel.modelId,
        modelName: editingModel.modelName || '',
        modelYear: editingModel.modelYear || new Date().getFullYear(),
        batteryCapacity: editingModel.batteryCapacity || '',
        range: editingModel.range || editingModel.range_km || '',
        powerHp: editingModel.powerHp || editingModel.power_hp || '',
        torqueNm: editingModel.torqueNm || editingModel.torque_nm || '',
        acceleration: editingModel.acceleration || '',
        seatingCapacity: editingModel.seatingCapacity || '',
        price: editingModel.price || '',
        bodyType: editingModel.bodyType || 'SEDAN',
        description: editingModel.description || ''
      });
    }
  }, [editingModel]);

  useEffect(() => {
    if (formData.modelName) {
      setImagePreview(getModelImage(formData.modelName));
    }
  }, [formData.modelName]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.modelName.trim()) {
          newErrors.modelName = 'Tên mẫu xe là bắt buộc';
        }
        if (!formData.modelYear || formData.modelYear < 2020 || formData.modelYear > 2030) {
          newErrors.modelYear = 'Năm sản xuất phải từ 2020 đến 2030';
        }
        if (!formData.bodyType) {
          newErrors.bodyType = 'Kiểu dáng xe là bắt buộc';
        }
        break;
        
      case 2:
        if (!formData.batteryCapacity || formData.batteryCapacity <= 0) {
          newErrors.batteryCapacity = 'Dung lượng pin phải lớn hơn 0';
        }
        if (!formData.range || formData.range <= 0) {
          newErrors.range = 'Tầm hoạt động phải lớn hơn 0';
        }
        if (!formData.powerHp || formData.powerHp <= 0) {
          newErrors.powerHp = 'Công suất phải lớn hơn 0';
        }
        if (!formData.price || formData.price <= 0) {
          newErrors.price = 'Giá bán phải lớn hơn 0';
        }
        break;
        
      case 3:
        if (!formData.description.trim()) {
          newErrors.description = 'Mô tả là bắt buộc';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    const validation = validateModelData(formData);
    if (validation.isValid) {
      onSubmit(formData);
    } else {
      setErrors(validation.errors.reduce((acc, error) => {
        // Map general errors to specific fields
        if (error.includes('Tên mẫu xe')) acc.modelName = error;
        if (error.includes('Năm sản xuất')) acc.modelYear = error;
        if (error.includes('Giá bán')) acc.price = error;
        if (error.includes('Kiểu dáng')) acc.bodyType = error;
        return acc;
      }, {}));
    }
  };

  const bodyTypeOptions = getBodyTypeOptions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {editingModel ? 'Cập nhật mẫu xe' : 'Thêm mẫu xe mới'}
              </h2>
              <p className="text-emerald-100 text-sm mt-1">
                Bước {currentStep} / {totalSteps}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    i + 1 <= currentStep ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên mẫu xe *
                      </label>
                      <input
                        type="text"
                        value={formData.modelName}
                        onChange={(e) => handleInputChange('modelName', e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                          errors.modelName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="VD: Electra Nano"
                      />
                      {errors.modelName && (
                        <p className="text-red-500 text-sm mt-1">{errors.modelName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Năm sản xuất *
                      </label>
                      <input
                        type="number"
                        min="2020"
                        max="2030"
                        value={formData.modelYear}
                        onChange={(e) => handleInputChange('modelYear', parseInt(e.target.value))}
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                          errors.modelYear ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.modelYear && (
                        <p className="text-red-500 text-sm mt-1">{errors.modelYear}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kiểu dáng xe *
                      </label>
                      <select
                        value={formData.bodyType}
                        onChange={(e) => handleInputChange('bodyType', e.target.value)}
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                          errors.bodyType ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        {bodyTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.icon} {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.bodyType && (
                        <p className="text-red-500 text-sm mt-1">{errors.bodyType}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số chỗ ngồi
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="9"
                        value={formData.seatingCapacity}
                        onChange={(e) => handleInputChange('seatingCapacity', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="VD: 5"
                      />
                    </div>
                  </div>

                  {/* Image Preview */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Hình ảnh mẫu xe
                    </label>
                    <div className="relative">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden border-2 border-dashed border-gray-300">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Model preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                              <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm">Nhập tên mẫu xe để xem hình ảnh</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Technical Specifications */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dung lượng pin (kWh) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.batteryCapacity}
                      onChange={(e) => handleInputChange('batteryCapacity', parseFloat(e.target.value))}
                      className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        errors.batteryCapacity ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="VD: 60"
                    />
                    {errors.batteryCapacity && (
                      <p className="text-red-500 text-sm mt-1">{errors.batteryCapacity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tầm hoạt động (km) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.range}
                      onChange={(e) => handleInputChange('range', parseInt(e.target.value))}
                      className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        errors.range ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="VD: 380"
                    />
                    {errors.range && (
                      <p className="text-red-500 text-sm mt-1">{errors.range}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Công suất (HP) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.powerHp}
                      onChange={(e) => handleInputChange('powerHp', parseInt(e.target.value))}
                      className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        errors.powerHp ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="VD: 185"
                    />
                    {errors.powerHp && (
                      <p className="text-red-500 text-sm mt-1">{errors.powerHp}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô-men xoắn (Nm)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.torqueNm}
                      onChange={(e) => handleInputChange('torqueNm', parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="VD: 280"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tăng tốc 0-100 (giây)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.acceleration}
                      onChange={(e) => handleInputChange('acceleration', parseFloat(e.target.value))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="VD: 8.2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá bán (VNĐ) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                      className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="VD: 32000000"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                    )}
                    {formData.price && (
                      <p className="text-sm text-emerald-600 mt-1">
                        {formatPrice(formData.price)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Description */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả mẫu xe *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={8}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Mô tả chi tiết về mẫu xe, tính năng nổi bật, công nghệ sử dụng..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    {formData.description.length} / 1000 ký tự
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Tóm tắt thông tin</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tên mẫu:</span>
                      <span className="ml-2 font-medium">{formData.modelName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Năm:</span>
                      <span className="ml-2 font-medium">{formData.modelYear || '—'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kiểu dáng:</span>
                      <span className="ml-2 font-medium">
                        {bodyTypeOptions.find(opt => opt.value === formData.bodyType)?.label || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Giá:</span>
                      <span className="ml-2 font-medium text-emerald-600">
                        {formData.price ? formatPrice(formData.price) : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Quay lại
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium"
              >
                Tiếp theo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                )}
                {editingModel ? 'Cập nhật' : 'Tạo mẫu xe'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModelFormWizard;
