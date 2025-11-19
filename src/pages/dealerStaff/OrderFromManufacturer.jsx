import { useState } from 'react';

function OrderFromManufacturer({ onBack }) {
  const [formData, setFormData] = useState({
    vehicleModel: '',
    quantity: 1,
    expectedDelivery: '',
    specialRequirements: '',
    notes: ''
  });

  const [orders, setOrders] = useState([
    {
      id: 1,
      vehicleModel: 'Electra Ascent',
      quantity: 5,
      orderDate: '2024-01-15',
      expectedDelivery: '2024-02-15',
      status: 'processing',
      totalAmount: 1600000000
    },
    {
      id: 2,
      vehicleModel: 'Electra CityLink',
      quantity: 3,
      orderDate: '2024-01-10',
      expectedDelivery: '2024-02-10',
      status: 'confirmed',
      totalAmount: 840000000
    }
  ]);

  const vehicleModels = [
    { id: 'ascent', name: 'Electra Ascent', price: 320000000 },
    { id: 'citylink', name: 'Electra CityLink', price: 280000000 },
    { id: 'grandtour', name: 'Electra GrandTour', price: 450000000 },
    { id: 'micro', name: 'Electra Micro', price: 180000000 },
    { id: 'summit', name: 'Electra Summit', price: 680000000 },
    { id: 'velocity', name: 'Electra Velocity', price: 850000000 },
    { id: 'urbanpulse', name: 'Electra UrbanPulse', price: 220000000 },
    { id: 'voyager', name: 'Electra Voyager', price: 750000000 }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedModel = vehicleModels.find(model => model.id === formData.vehicleModel);
    const newOrder = {
      id: Date.now(),
      vehicleModel: selectedModel.name,
      quantity: parseInt(formData.quantity),
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: formData.expectedDelivery,
      status: 'pending',
      totalAmount: selectedModel.price * formData.quantity
    };
    setOrders([newOrder, ...orders]);
    setFormData({
      vehicleModel: '',
      quantity: 1,
      expectedDelivery: '',
      specialRequirements: '',
      notes: ''
    });
    alert('Đơn đặt hàng đã được tạo thành công!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    if (!status) return status || 'N/A';
    // Return status in English as from API response
    return status.toUpperCase();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-3 md:px-4 lg:px-2 py-3 sm:py-4 md:py-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4 md:mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Đặt xe từ hãng sản xuất</h2>
          <button
            onClick={onBack}
            className="flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Quay lại</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Order Form */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Tạo đơn đặt hàng mới</h3>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Mẫu xe *
                </label>
                <select
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Chọn mẫu xe</option>
                  {vehicleModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.price.toLocaleString('vi-VN')} VNĐ
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

             

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yêu cầu đặc biệt
                </label>
                <textarea
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Nhập yêu cầu đặc biệt (nếu có)..."
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Nhập ghi chú thêm..."
                />
              </div>

              {/* Total Calculation */}
              {formData.vehicleModel && (
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Tổng tiền:</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {(vehicleModels.find(m => m.id === formData.vehicleModel)?.price * formData.quantity || 0).toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Tạo đơn đặt hàng
              </button>
            </form>
          </div>

          {/* Orders List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch sử đơn đặt hàng</h3>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>Chưa có đơn đặt hàng nào</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{order.vehicleModel}</h4>
                        <p className="text-sm text-gray-600">Số lượng: {order.quantity} xe</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Ngày đặt:</p>
                        <p className="font-medium">{order.orderDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Dự kiến giao:</p>
                        <p className="font-medium">{order.expectedDelivery}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tổng tiền:</span>
                        <span className="font-semibold text-gray-900">
                          {order.totalAmount.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderFromManufacturer;

