import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OrderFromManufacturer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleModel: '',
    quantity: '',
    colors: {},
    expectedDelivery: '',
    priority: 'normal',
    dealerNotes: '',
    specialRequests: ''
  });

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const vehicleModels = [
    { 
      id: 'vf3', 
      name: 'VinFast VF3', 
      basePrice: 299000000,
      productionTime: '8-10 tuần',
      availability: 'Có sẵn'
    },
    { 
      id: 'vf5', 
      name: 'VinFast VF5 Plus', 
      basePrice: 529000000,
      productionTime: '6-8 tuần',
      availability: 'Có sẵn'
    },
    { 
      id: 'vf6', 
      name: 'VinFast VF6', 
      basePrice: 689000000,
      productionTime: '10-12 tuần',
      availability: 'Đặt hàng trước'
    },
    { 
      id: 'vf7', 
      name: 'VinFast VF7', 
      basePrice: 799000000,
      productionTime: '8-10 tuần',
      availability: 'Có sẵn'
    },
    { 
      id: 'vf8', 
      name: 'VinFast VF8', 
      basePrice: 1019000000,
      productionTime: '12-14 tuần',
      availability: 'Đặt hàng trước'
    },
    { 
      id: 'vf9', 
      name: 'VinFast VF9', 
      basePrice: 1499000000,
      productionTime: '14-16 tuần',
      availability: 'Đặt hàng trước'
    }
  ];

  const colors = [
    { id: 'white', name: 'Trắng Ngọc Trai', code: '#FFFFFF' },
    { id: 'black', name: 'Đen Huyền Bí', code: '#000000' },
    { id: 'red', name: 'Đỏ Lửa', code: '#DC143C' },
    { id: 'blue', name: 'Xanh Dương Đại Dương', code: '#0066CC' },
    { id: 'silver', name: 'Bạc Tinh Khôi', code: '#C0C0C0' },
    { id: 'gray', name: 'Xám Titan', code: '#708090' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorQuantityChange = (colorId, quantity) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorId]: parseInt(quantity) || 0
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Order submitted:', formData);
    alert('Đơn đặt hàng đã được gửi thành công!');
    navigate('/dashboard/dealer-staff');
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const selectedVehicle = vehicleModels.find(v => v.id === formData.vehicleModel);
  const totalQuantity = Object.values(formData.colors).reduce((sum, qty) => sum + (qty || 0), 0);
  const totalValue = selectedVehicle ? selectedVehicle.basePrice * totalQuantity : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard/dealer-staff')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Đặt Xe Từ Hãng</h1>
                <p className="text-sm text-gray-500">Tạo đơn đặt hàng xe mới từ VinFast</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step >= stepNumber 
                      ? 'bg-red-600 border-red-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {step > stepNumber ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <div className="ml-3">
                    <span className={`text-sm font-medium ${
                      step >= stepNumber ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {stepNumber === 1 && 'Chọn xe'}
                      {stepNumber === 2 && 'Chọn màu & số lượng'}
                      {stepNumber === 3 && 'Xác nhận đơn hàng'}
                    </span>
                  </div>
                  {stepNumber < 3 && (
                    <div className="ml-6 w-16 h-0.5 bg-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Select Vehicle */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Chọn mẫu xe</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicleModels.map(vehicle => (
                    <div 
                      key={vehicle.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        formData.vehicleModel === vehicle.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, vehicleModel: vehicle.id }))}
                    >
                      <div className="text-center">
                        <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                          <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 6a1 1 0 100-2 1 1 0 000 2zM9 6a1 1 0 100-2 1 1 0 000 2zM7 9a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                          </svg>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{vehicle.name}</h4>
                        <p className="text-lg font-bold text-red-600 mb-2">
                          {vehicle.basePrice.toLocaleString()} VNĐ
                        </p>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Thời gian sản xuất:</span>
                            <span className="font-medium">{vehicle.productionTime}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Tình trạng:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              vehicle.availability === 'Có sẵn'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {vehicle.availability}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Colors and Quantities */}
          {step === 2 && selectedVehicle && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Chọn màu sắc và số lượng - {selectedVehicle.name}
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {colors.map(color => (
                    <div key={color.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 rounded-full border-2 border-gray-300 mr-3"
                            style={{ backgroundColor: color.code }}
                          ></div>
                          <span className="font-medium text-gray-900">{color.name}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Số lượng</label>
                        <input
                          type="number"
                          min="0"
                          value={formData.colors[color.id] || ''}
                          onChange={(e) => handleColorQuantityChange(color.id, e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Tổng số lượng:</span>
                    <span className="text-2xl font-bold text-red-600">{totalQuantity} xe</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Order Confirmation */}
          {step === 3 && selectedVehicle && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Tóm tắt đơn hàng</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mẫu xe:</span>
                      <span className="font-medium">{selectedVehicle.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng số lượng:</span>
                      <span className="font-medium">{totalQuantity} xe</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá đơn vị:</span>
                      <span className="font-medium">{selectedVehicle.basePrice.toLocaleString()} VNĐ</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Phân bổ theo màu:</h4>
                      {Object.entries(formData.colors)
                        .filter(([_, quantity]) => quantity > 0)
                        .map(([colorId, quantity]) => {
                          const color = colors.find(c => c.id === colorId);
                          return (
                            <div key={colorId} className="flex justify-between items-center py-2">
                              <div className="flex items-center">
                                <div 
                                  className="w-4 h-4 rounded-full border mr-2"
                                  style={{ backgroundColor: color.code }}
                                ></div>
                                <span className="text-sm text-gray-600">{color.name}</span>
                              </div>
                              <span className="text-sm font-medium">{quantity} xe</span>
                            </div>
                          );
                        })
                      }
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng giá trị đơn hàng:</span>
                        <span className="text-red-600">{totalValue.toLocaleString()} VNĐ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin bổ sung</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày giao dự kiến
                    </label>
                    <input
                      type="date"
                      name="expectedDelivery"
                      value={formData.expectedDelivery}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mức độ ưu tiên
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="low">Thấp</option>
                      <option value="normal">Bình thường</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú từ đại lý
                    </label>
                    <textarea
                      name="dealerNotes"
                      value={formData.dealerNotes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Thông tin bổ sung cho đơn hàng..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yêu cầu đặc biệt
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Các yêu cầu đặc biệt về giao hàng, cấu hình..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <div className="flex space-x-3">
              <button 
                type="button"
                onClick={() => navigate('/dashboard/dealer-staff')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              {step > 1 && (
                <button 
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Quay lại
                </button>
              )}
            </div>

            <div>
              {step < totalSteps ? (
                <button 
                  type="button"
                  onClick={nextStep}
                  disabled={(step === 1 && !formData.vehicleModel) || (step === 2 && totalQuantity === 0)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Tiếp tục
                </button>
              ) : (
                <button 
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Gửi đơn đặt hàng
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrderFromManufacturer;