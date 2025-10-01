import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateQuote() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    vehicleModel: '',
    vehicleColor: '',
    batteryOption: 'rent', // rent or buy
    accessories: [],
    deposit: '',
    notes: ''
  });

  const vehicleModels = [
    { id: 'vf3', name: 'VinFast VF3', basePrice: 299000000 },
    { id: 'vf5', name: 'VinFast VF5 Plus', basePrice: 529000000 },
    { id: 'vf6', name: 'VinFast VF6', basePrice: 689000000 },
    { id: 'vf7', name: 'VinFast VF7', basePrice: 799000000 },
    { id: 'vf8', name: 'VinFast VF8', basePrice: 1019000000 },
    { id: 'vf9', name: 'VinFast VF9', basePrice: 1499000000 }
  ];

  const colors = [
    { id: 'white', name: 'Trắng Ngọc Trai', price: 0 },
    { id: 'black', name: 'Đen Huyền Bí', price: 0 },
    { id: 'red', name: 'Đỏ Lửa', price: 5000000 },
    { id: 'blue', name: 'Xanh Dương Đại Dương', price: 5000000 },
    { id: 'silver', name: 'Bạc Tinh Khôi', price: 3000000 }
  ];

  const accessories = [
    { id: 'sunroof', name: 'Cửa sổ trời toàn cảnh', price: 25000000 },
    { id: 'leather', name: 'Ghế da cao cấp', price: 15000000 },
    { id: 'sound', name: 'Hệ thống âm thanh Harman Kardon', price: 20000000 },
    { id: 'wireless', name: 'Sạc không dây', price: 3000000 },
    { id: 'camera360', name: 'Camera 360 độ', price: 12000000 }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAccessoryChange = (accessoryId) => {
    setFormData(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessoryId)
        ? prev.accessories.filter(id => id !== accessoryId)
        : [...prev.accessories, accessoryId]
    }));
  };

  const calculateTotal = () => {
    const selectedVehicle = vehicleModels.find(v => v.id === formData.vehicleModel);
    const selectedColor = colors.find(c => c.id === formData.vehicleColor);
    const selectedAccessories = accessories.filter(a => formData.accessories.includes(a.id));
    
    let total = 0;
    if (selectedVehicle) total += selectedVehicle.basePrice;
    if (selectedColor) total += selectedColor.price;
    total += selectedAccessories.reduce((sum, acc) => sum + acc.price, 0);
    
    // Battery rental fee (monthly)
    const batteryRental = formData.batteryOption === 'rent' ? 2900000 : 0;
    
    return { vehicleTotal: total, batteryRental };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Quote created:', formData);
    alert('Báo giá đã được tạo thành công!');
    navigate('/dashboard/dealer-staff');
  };

  const { vehicleTotal, batteryRental } = calculateTotal();

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
                <h1 className="text-xl font-semibold text-gray-900">Tạo Báo Giá Mới</h1>
                <p className="text-sm text-gray-500">Tạo báo giá chi tiết cho khách hàng</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => navigate('/dashboard/dealer-staff')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                onClick={handleSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Tạo báo giá
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Chọn xe</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mẫu xe *
                    </label>
                    <select
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Chọn mẫu xe</option>
                      {vehicleModels.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - {vehicle.basePrice.toLocaleString()} VNĐ
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Màu sắc *
                    </label>
                    <select
                      name="vehicleColor"
                      value={formData.vehicleColor}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Chọn màu sắc</option>
                      {colors.map(color => (
                        <option key={color.id} value={color.id}>
                          {color.name} {color.price > 0 && `(+${color.price.toLocaleString()} VNĐ)`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Battery Option */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tùy chọn pin</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="batteryOption"
                      value="rent"
                      checked={formData.batteryOption === 'rent'}
                      onChange={handleInputChange}
                      className="mr-3 text-red-600"
                    />
                    <span className="text-sm text-gray-700">Thuê pin - 2.900.000 VNĐ/tháng</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="batteryOption"
                      value="buy"
                      checked={formData.batteryOption === 'buy'}
                      onChange={handleInputChange}
                      className="mr-3 text-red-600"
                    />
                    <span className="text-sm text-gray-700">Mua pin cùng xe</span>
                  </label>
                </div>
              </div>

              {/* Accessories */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Phụ kiện tùy chọn</h3>
                <div className="space-y-3">
                  {accessories.map(accessory => (
                    <label key={accessory.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.accessories.includes(accessory.id)}
                          onChange={() => handleAccessoryChange(accessory.id)}
                          className="mr-3 text-red-600"
                        />
                        <span className="text-sm text-gray-700">{accessory.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        +{accessory.price.toLocaleString()} VNĐ
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin bổ sung</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiền đặt cọc (VNĐ)
                    </label>
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ghi chú
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Quote Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt báo giá</h3>
              
              {formData.vehicleModel && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Xe:</span>
                    <span className="text-sm font-medium">
                      {vehicleModels.find(v => v.id === formData.vehicleModel)?.name}
                    </span>
                  </div>
                  
                  {formData.vehicleColor && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Màu:</span>
                      <span className="text-sm font-medium">
                        {colors.find(c => c.id === formData.vehicleColor)?.name}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Giá xe:</span>
                      <span className="text-sm font-medium">
                        {vehicleModels.find(v => v.id === formData.vehicleModel)?.basePrice.toLocaleString()} VNĐ
                      </span>
                    </div>
                    
                    {formData.vehicleColor && colors.find(c => c.id === formData.vehicleColor)?.price > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Phụ phí màu:</span>
                        <span className="text-sm font-medium">
                          +{colors.find(c => c.id === formData.vehicleColor)?.price.toLocaleString()} VNĐ
                        </span>
                      </div>
                    )}

                    {formData.accessories.length > 0 && (
                      <>
                        <div className="text-sm text-gray-600 font-medium">Phụ kiện:</div>
                        {formData.accessories.map(accId => {
                          const acc = accessories.find(a => a.id === accId);
                          return (
                            <div key={accId} className="flex justify-between pl-4">
                              <span className="text-xs text-gray-500">{acc?.name}</span>
                              <span className="text-xs font-medium">+{acc?.price.toLocaleString()} VNĐ</span>
                            </div>
                          );
                        })}
                      </>
                    )}

                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng:</span>
                        <span className="text-red-600">{vehicleTotal.toLocaleString()} VNĐ</span>
                      </div>
                    </div>

                    {batteryRental > 0 && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-sm text-yellow-800">
                          <span className="font-medium">Thuê pin:</span> {batteryRental.toLocaleString()} VNĐ/tháng
                        </div>
                      </div>
                    )}

                    {formData.deposit && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm text-blue-800">
                          <span className="font-medium">Đặt cọc:</span> {parseInt(formData.deposit).toLocaleString()} VNĐ
                        </div>
                        <div className="text-sm text-blue-800">
                          <span className="font-medium">Còn lại:</span> {(vehicleTotal - parseInt(formData.deposit)).toLocaleString()} VNĐ
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!formData.vehicleModel && (
                <div className="text-center text-gray-500 py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm">Chọn xe để xem báo giá</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateQuote;