import React, { useState, useEffect } from 'react';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModels, setExpandedModels] = useState(new Set());
  const [reportModal, setReportModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [reportData, setReportData] = useState({
    vehicleModel: '',
    color: '',
    currentStock: 0,
    requestedQuantity: 0,
    reason: '',
    priority: 'medium',
    expectedDelivery: ''
  });

  // Mock data cho kho hàng - cấu trúc mới với nhiều màu cho mỗi model
  const mockInventory = [
    {
      id: 1,
      model: 'Electra Ascent',
      totalStock: 25,
      colors: [
        { color: 'Trắng Ngọc Trai', stock: 8, price: 320000000 },
        { color: 'Đen Bóng', stock: 6, price: 325000000 },
        { color: 'Xanh Dương Đậm', stock: 7, price: 328000000 },
        { color: 'Bạc Metallic', stock: 4, price: 330000000 }
      ]
    },
    {
      id: 2,
      model: 'Electra CityLink',
      totalStock: 18,
      colors: [
        { color: 'Xanh Dương Đậm', stock: 5, price: 280000000 },
        { color: 'Trắng Ngọc Trai', stock: 6, price: 282000000 },
        { color: 'Đỏ Ruby', stock: 4, price: 285000000 },
        { color: 'Xám Titan', stock: 3, price: 288000000 }
      ]
    },
    {
      id: 3,
      model: 'Electra GrandTour',
      totalStock: 12,
      colors: [
        { color: 'Đen Bóng', stock: 4, price: 450000000 },
        { color: 'Bạc Metallic', stock: 3, price: 455000000 },
        { color: 'Trắng Ngọc Trai', stock: 3, price: 458000000 },
        { color: 'Xanh Dương Đậm', stock: 2, price: 460000000 }
      ]
    },
    {
      id: 4,
      model: 'Electra Micro',
      totalStock: 20,
      colors: [
        { color: 'Đỏ Ruby', stock: 6, price: 180000000 },
        { color: 'Trắng Ngọc Trai', stock: 7, price: 182000000 },
        { color: 'Xanh Dương Đậm', stock: 4, price: 185000000 },
        { color: 'Xám Titan', stock: 3, price: 188000000 }
      ]
    },
    {
      id: 5,
      model: 'Electra Summit',
      totalStock: 15,
      colors: [
        { color: 'Bạc Metallic', stock: 5, price: 680000000 },
        { color: 'Đen Bóng', stock: 4, price: 685000000 },
        { color: 'Trắng Ngọc Trai', stock: 3, price: 688000000 },
        { color: 'Xanh Dương Đậm', stock: 3, price: 690000000 }
      ]
    }
  ];

  useEffect(() => {
    // Simulate API call
    setInventory(mockInventory);
    setFilteredInventory(mockInventory);
  }, []);

  // Filter inventory based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter(vehicle =>
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.colors.some(colorItem => 
          colorItem.color.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredInventory(filtered);
    }
  }, [searchTerm, inventory]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const toggleExpanded = (modelId) => {
    const newExpanded = new Set(expandedModels);
    if (newExpanded.has(modelId)) {
      newExpanded.delete(modelId);
    } else {
      newExpanded.add(modelId);
    }
    setExpandedModels(newExpanded);
  };

  const getColorPreview = (colorName) => {
    const colorMap = {
      'Trắng Ngọc Trai': 'bg-white border border-gray-300',
      'Đen Bóng': 'bg-black',
      'Xanh Dương Đậm': 'bg-blue-800',
      'Đỏ Ruby': 'bg-red-600',
      'Bạc Metallic': 'bg-gray-400',
      'Xám Titan': 'bg-gray-600'
    };
    return colorMap[colorName] || 'bg-gray-300';
  };

  const handleReportToManager = (vehicle, colorItem) => {
    setSelectedVehicle(vehicle);
    setSelectedColor(colorItem);
    setReportData({
      vehicleModel: vehicle.model,
      color: colorItem.color,
      currentStock: colorItem.stock,
      requestedQuantity: 0,
      reason: '',
      priority: 'medium',
      expectedDelivery: ''
    });
    setReportModal(true);
  };

  const handleSubmitReport = (e) => {
    e.preventDefault();
    
    if (reportData.requestedQuantity <= 0) {
      alert('Vui lòng nhập số lượng cần đặt hàng lớn hơn 0!');
      return;
    }

    if (!reportData.reason.trim()) {
      alert('Vui lòng nhập lý do đặt hàng!');
      return;
    }

    if (!reportData.expectedDelivery) {
      alert('Vui lòng chọn ngày giao hàng dự kiến!');
      return;
    }

    // Simulate API call to send report to manager
    const reportPayload = {
      ...reportData,
      vehicleId: selectedVehicle.id,
      reportDate: new Date().toISOString(),
      reporterId: 'DS001', // Current staff ID
      reporterName: 'Nguyễn Văn A',
      status: 'pending'
    };

    console.log('Report to Manager:', reportPayload);
    alert(`Đã gửi báo cáo đặt hàng cho Manager!\n\nMẫu xe: ${reportData.vehicleModel}\nMàu sắc: ${reportData.color}\nSố lượng yêu cầu: ${reportData.requestedQuantity}\nMức độ ưu tiên: ${reportData.priority === 'high' ? 'Cao' : reportData.priority === 'medium' ? 'Trung bình' : 'Thấp'}`);
    
    setReportModal(false);
    setSelectedVehicle(null);
    setSelectedColor(null);
    setReportData({
      vehicleModel: '',
      color: '',
      currentStock: 0,
      requestedQuantity: 0,
      reason: '',
      priority: 'medium',
      expectedDelivery: ''
    });
  };

  const handleCloseModal = () => {
    setReportModal(false);
    setSelectedVehicle(null);
    setSelectedColor(null);
    setReportData({
      vehicleModel: '',
      color: '',
      currentStock: 0,
      requestedQuantity: 0,
      reason: '',
      priority: 'medium',
      expectedDelivery: ''
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Theo dõi tồn kho và lập báo cáo đặt xe</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo model, màu sắc..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Vehicle Cards Grid */}
        <div className="space-y-6">
          {filteredInventory.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Vehicle Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{vehicle.model}</h3>
                  <p className="text-gray-600">Tổng tồn: {vehicle.totalStock} xe</p>
                </div>
                <button
                  onClick={() => toggleExpanded(vehicle.id)}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <svg 
                    className={`h-4 w-4 mr-2 transition-transform ${expandedModels.has(vehicle.id) ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {expandedModels.has(vehicle.id) ? 'Ẩn chi tiết' : 'Xem chi tiết màu'}
                </button>
              </div>

              {/* Color Details Table */}
              {expandedModels.has(vehicle.id) && (
                <div className="mt-4 overflow-hidden">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Chi tiết màu sắc</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Màu sắc</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Số lượng tồn</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Giá bán (VNĐ)</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {vehicle.colors.map((colorItem, index) => (
                            <tr key={index} className="hover:bg-gray-100">
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <div className={`w-4 h-4 rounded-full mr-3 ${getColorPreview(colorItem.color)}`}></div>
                                  <span className="text-sm text-gray-900">{colorItem.color}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`text-sm font-medium ${
                                  colorItem.stock === 0 ? 'text-red-600' :
                                  colorItem.stock <= 3 ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {colorItem.stock} xe
                                  {colorItem.stock === 0 && ' (Hết hàng)'}
                                  {colorItem.stock > 0 && colorItem.stock <= 3 && ' (Sắp hết)'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-gray-900">{colorItem.price.toLocaleString('vi-VN')} VNĐ</span>
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  onClick={() => handleReportToManager(vehicle, colorItem)}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  Báo cáo đặt hàng
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy xe nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm.' : 'Không có dữ liệu kho hàng.'}
            </p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Báo cáo đặt hàng cho Manager
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-6">
              {/* Vehicle Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin xe</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mẫu xe</label>
                    <p className="text-sm text-gray-900">{reportData.vehicleModel}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Màu sắc</label>
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${getColorPreview(reportData.color)}`}></div>
                      <p className="text-sm text-gray-900">{reportData.color}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tồn kho hiện tại</label>
                    <p className="text-sm text-gray-900">{reportData.currentStock} xe</p>
                  </div>
                </div>
              </div>

              {/* Report Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng cần đặt hàng *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={reportData.requestedQuantity}
                    onChange={(e) => setReportData(prev => ({ ...prev, requestedQuantity: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mức độ ưu tiên *
                  </label>
                  <select
                    value={reportData.priority}
                    onChange={(e) => setReportData(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="high">Cao - Cần đặt hàng ngay</option>
                    <option value="medium">Trung bình - Đặt hàng trong tuần</option>
                    <option value="low">Thấp - Có thể chờ đợi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày giao hàng dự kiến *
                  </label>
                  <input
                    type="date"
                    value={reportData.expectedDelivery}
                    onChange={(e) => setReportData(prev => ({ ...prev, expectedDelivery: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do đặt hàng *
                  </label>
                  <textarea
                    value={reportData.reason}
                    onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Ví dụ: Khách hàng có nhu cầu cao, sắp hết hàng, có đơn hàng lớn..."
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
