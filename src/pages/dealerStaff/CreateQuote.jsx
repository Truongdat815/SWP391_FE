import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateQuote() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_model: '',
    base_price: '',
    tax_rate: 10,
    promotion_amount: '',
    additional_options: [],
    notes: '',
    valid_until: ''
  });

  const [errors, setErrors] = useState({});

  const vehicleModels = [
    { id: 1, name: 'Electra Ascent', base_price: 2500000000 },
    { id: 2, name: 'Electra CityLink', base_price: 1800000000 },
    { id: 3, name: 'Electra GrandTour', base_price: 3200000000 },
    { id: 4, name: 'Electra Micro', base_price: 1200000000 },
    { id: 5, name: 'Electra Summit', base_price: 4500000000 },
    { id: 6, name: 'Electra UrbanPulse', base_price: 1500000000 },
    { id: 7, name: 'Electra Velocity', base_price: 5500000000 },
    { id: 8, name: 'Electra Voyager', base_price: 3800000000 }
  ];

  const additionalOptions = [
    { id: 'premium_paint', name: 'Sơn cao cấp', price: 50000000 },
    { id: 'leather_seats', name: 'Ghế da cao cấp', price: 80000000 },
    { id: 'premium_sound', name: 'Hệ thống âm thanh cao cấp', price: 30000000 },
    { id: 'sport_wheels', name: 'Bánh xe thể thao', price: 40000000 },
    { id: 'sunroof', name: 'Cửa sổ trời', price: 60000000 },
    { id: 'premium_interior', name: 'Nội thất cao cấp', price: 70000000 }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleVehicleChange = (e) => {
    const selectedVehicle = vehicleModels.find(v => v.id === parseInt(e.target.value));
    setFormData(prev => ({
      ...prev,
      vehicle_model: e.target.value,
      base_price: selectedVehicle ? selectedVehicle.base_price : ''
    }));
  };

  const handleOptionChange = (optionId, checked) => {
    setFormData(prev => ({
      ...prev,
      additional_options: checked 
        ? [...prev.additional_options, optionId]
        : prev.additional_options.filter(id => id !== optionId)
    }));
  };

  const calculateTotals = () => {
    const basePrice = parseFloat(formData.base_price) || 0;
    const promotionAmount = parseFloat(formData.promotion_amount) || 0;
    const taxRate = parseFloat(formData.tax_rate) || 0;
    
    const selectedOptions = additionalOptions.filter(option => 
      formData.additional_options.includes(option.id)
    );
    const optionsTotal = selectedOptions.reduce((sum, option) => sum + option.price, 0);
    
    const subtotal = basePrice + optionsTotal;
    const totalAfterPromotion = subtotal - promotionAmount;
    const taxAmount = (totalAfterPromotion * taxRate) / 100;
    const totalPayment = totalAfterPromotion + taxAmount;
    
    return {
      subtotal,
      totalAfterPromotion,
      taxAmount,
      totalPayment,
      optionsTotal
    };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customer_id) newErrors.customer_id = 'Vui lòng chọn khách hàng';
    if (!formData.vehicle_model) newErrors.vehicle_model = 'Vui lòng chọn mẫu xe';
    if (!formData.base_price) newErrors.base_price = 'Vui lòng nhập giá cơ bản';
    if (!formData.valid_until) newErrors.valid_until = 'Vui lòng chọn ngày hết hạn';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const totals = calculateTotals();
    const quoteData = {
      ...formData,
      ...totals,
      status: 'pending',
      created_at: new Date().toISOString(),
      quote_id: `Q${Date.now()}`
    };
    
    console.log('Quote Data:', quoteData);
    
    // Here you would typically send the data to your API
    alert('Báo giá đã được tạo thành công!');
    navigate('/dealer-staff');
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo báo giá mới</h1>
            <p className="text-gray-600 mt-1">Tạo báo giá chi tiết cho khách hàng</p>
          </div>
          <button
            onClick={() => navigate('/dealer-staff')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Khách hàng *
                  </label>
                  <select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.customer_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn khách hàng</option>
                    <option value="1">Nguyễn Văn A - 0123456789</option>
                    <option value="2">Trần Thị B - 0987654321</option>
                    <option value="3">Lê Văn C - 0369852147</option>
                    <option value="4">Phạm Thị D - 0741852963</option>
                  </select>
                  {errors.customer_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer_id}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày hết hạn báo giá *
                  </label>
                  <input
                    type="date"
                    name="valid_until"
                    value={formData.valid_until}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.valid_until ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.valid_until && (
                    <p className="text-red-500 text-sm mt-1">{errors.valid_until}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn mẫu xe</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mẫu xe *
                  </label>
                  <select
                    name="vehicle_model"
                    value={formData.vehicle_model}
                    onChange={handleVehicleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.vehicle_model ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Chọn mẫu xe</option>
                    {vehicleModels.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.base_price.toLocaleString('vi-VN')} VNĐ
                      </option>
                    ))}
                  </select>
                  {errors.vehicle_model && (
                    <p className="text-red-500 text-sm mt-1">{errors.vehicle_model}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá cơ bản (VNĐ) *
                  </label>
                  <input
                    type="number"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                      errors.base_price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nhập giá cơ bản"
                  />
                  {errors.base_price && (
                    <p className="text-red-500 text-sm mt-1">{errors.base_price}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tùy chọn bổ sung</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additionalOptions.map(option => (
                  <div key={option.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={option.id}
                        checked={formData.additional_options.includes(option.id)}
                        onChange={(e) => handleOptionChange(option.id, e.target.checked)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <label htmlFor={option.id} className="ml-3 text-sm font-medium text-gray-700">
                        {option.name}
                      </label>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">
                      +{option.price.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing and Tax */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thuế và khuyến mãi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỷ lệ thuế VAT (%)
                  </label>
                  <input
                    type="number"
                    name="tax_rate"
                    value={formData.tax_rate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền khuyến mãi (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="promotion_amount"
                    value={formData.promotion_amount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ghi chú</h3>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Nhập ghi chú bổ sung..."
              />
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt báo giá</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá cơ bản:</span>
                  <span className="font-medium">{formData.base_price ? formData.base_price.toLocaleString('vi-VN') : '0'} VNĐ</span>
                </div>
                
                {totals.optionsTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tùy chọn bổ sung:</span>
                    <span className="font-medium">+{totals.optionsTotal.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                )}
                
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600">Tổng phụ:</span>
                  <span className="font-medium">{totals.subtotal.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                
                {formData.promotion_amount && parseFloat(formData.promotion_amount) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Khuyến mãi:</span>
                    <span>-{formData.promotion_amount.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế VAT ({formData.tax_rate}%):</span>
                  <span className="font-medium">+{totals.taxAmount.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                
                <div className="flex justify-between border-t pt-3 text-lg font-bold text-emerald-600">
                  <span>Tổng thanh toán:</span>
                  <span>{totals.totalPayment.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Tạo báo giá
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dealer-staff')}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateQuote;
