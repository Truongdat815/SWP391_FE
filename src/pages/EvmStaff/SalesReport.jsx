import { useState } from 'react';

function SalesReport({ onBack }) {
  const [activeTab, setActiveTab] = useState('sales');

  const salesData = [
    {
      region: 'Hà Nội',
      dealer: 'Đại lý Hà Nội',
      totalSales: 156,
      revenue: 8500000000,
      growth: '+12%',
      topModel: 'Electra Ascent',
      performance: 'excellent'
    },
    {
      region: 'TP.HCM',
      dealer: 'Đại lý TP.HCM',
      totalSales: 234,
      revenue: 12750000000,
      growth: '+18%',
      topModel: 'Electra CityLink',
      performance: 'excellent'
    },
    {
      region: 'Đà Nẵng',
      dealer: 'Đại lý Đà Nẵng',
      totalSales: 89,
      revenue: 5200000000,
      growth: '+8%',
      topModel: 'Electra GrandTour',
      performance: 'good'
    },
    {
      region: 'Cần Thơ',
      dealer: 'Đại lý Cần Thơ',
      totalSales: 67,
      revenue: 3900000000,
      growth: '+5%',
      topModel: 'Electra Micro',
      performance: 'average'
    }
  ];

  const inventoryData = [
    {
      model: 'Electra Ascent',
      totalStock: 83,
      reserved: 20,
      available: 63,
      turnoverRate: '85%',
      demandForecast: '+25%'
    },
    {
      model: 'Electra CityLink',
      totalStock: 143,
      reserved: 40,
      available: 103,
      turnoverRate: '92%',
      demandForecast: '+18%'
    },
    {
      model: 'Electra GrandTour',
      totalStock: 32,
      reserved: 8,
      available: 24,
      turnoverRate: '78%',
      demandForecast: '+12%'
    },
    {
      model: 'Electra Micro',
      totalStock: 28,
      reserved: 15,
      available: 13,
      turnoverRate: '65%',
      demandForecast: '+8%'
    }
  ];

  const tabs = [
    { id: 'sales', name: 'Doanh số theo khu vực', icon: '📊' },
    { id: 'inventory', name: 'Tồn kho & tiêu thụ', icon: '📦' },
    { id: 'analytics', name: 'Phân tích AI', icon: '🤖' }
  ];

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceText = (performance) => {
    switch (performance) {
      case 'excellent': return 'Xuất sắc';
      case 'good': return 'Tốt';
      case 'average': return 'Trung bình';
      case 'poor': return 'Kém';
      default: return performance;
    }
  };

  const getTurnoverColor = (rate) => {
    const rateNum = parseInt(rate);
    if (rateNum >= 90) return 'bg-green-100 text-green-800';
    if (rateNum >= 80) return 'bg-blue-100 text-blue-800';
    if (rateNum >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN');
  };

  return (
    <div className="px-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & phân tích</h1>
          <p className="text-gray-600 mt-1">Doanh số theo khu vực, tồn kho & tốc độ tiêu thụ</p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng doanh số</p>
              <p className="text-2xl font-bold text-gray-900">546 xe</p>
              <p className="text-sm text-green-600">+15%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900">30.4B VNĐ</p>
              <p className="text-sm text-green-600">+18%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tỷ lệ tiêu thụ TB</p>
              <p className="text-2xl font-bold text-gray-900">80%</p>
              <p className="text-sm text-purple-600">+5%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-50 text-orange-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đại lý hàng đầu</p>
              <p className="text-2xl font-bold text-gray-900">TP.HCM</p>
              <p className="text-sm text-orange-600">234 xe</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Sales by Region */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Doanh số theo khu vực & đại lý</h3>
                <div className="flex space-x-2">
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                    Xuất Excel
                  </button>
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                    Tạo báo cáo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {salesData.map((region, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mr-4">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{region.region}</h4>
                          <p className="text-sm text-gray-500">{region.dealer}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(region.performance)}`}>
                          {getPerformanceText(region.performance)}
                        </span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {region.growth}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Doanh số</p>
                        <p className="text-lg font-bold text-gray-900">{region.totalSales} xe</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Doanh thu</p>
                        <p className="text-lg font-bold text-gray-900">{formatPrice(region.revenue)} VNĐ</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Mẫu xe bán chạy nhất</p>
                      <p className="font-medium text-gray-900">{region.topModel}</p>
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition">
                        Xem chi tiết
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition">
                        So sánh
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sales Chart Placeholder */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Biểu đồ doanh số theo tháng</h4>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-center">
                    <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500 font-medium">Chart Placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory & Consumption */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Tồn kho & tốc độ tiêu thụ</h3>
                <div className="flex space-x-2">
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                    Xuất báo cáo
                  </button>
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                    Cập nhật dự báo
                  </button>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mẫu xe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tồn kho
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đã đặt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Có sẵn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tỷ lệ tiêu thụ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dự báo nhu cầu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventoryData.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 mr-4">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                            <div className="text-sm font-medium text-gray-900">{item.model}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.totalStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.reserved}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.available > 20 ? 'bg-green-100 text-green-800' : 
                            item.available > 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.available}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTurnoverColor(item.turnoverRate)}`}>
                            {item.turnoverRate}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {item.demandForecast}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-emerald-600 hover:text-emerald-900 mr-3">Cập nhật</button>
                          <button className="text-blue-600 hover:text-blue-900">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AI Demand Forecast */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Dự báo nhu cầu AI</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {inventoryData.map((item, index) => (
                    <div key={index} className="text-center p-6 border border-gray-200 rounded-lg">
                      <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">{item.model}</h4>
                      <p className="text-sm text-gray-500 mb-2">Dự báo tháng tới</p>
                      <p className="text-2xl font-bold text-emerald-600">{item.demandForecast}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Phân tích AI & Insights</h3>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                  Cập nhật phân tích
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Insights quan trọng</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h5 className="font-medium text-blue-900">Cảnh báo tồn kho</h5>
                      </div>
                      <p className="text-sm text-blue-800">Electra Micro có tồn kho thấp, cần bổ sung thêm 20 xe</p>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h5 className="font-medium text-green-900">Cơ hội tăng trưởng</h5>
                      </div>
                      <p className="text-sm text-green-800">Đại lý TP.HCM có tiềm năng tăng 30% doanh số trong Q2</p>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h5 className="font-medium text-yellow-900">Khuyến nghị</h5>
                      </div>
                      <p className="text-sm text-yellow-800">Tăng khuyến mãi cho Electra Ascent để cạnh tranh tốt hơn</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Dự báo xu hướng</h4>
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Doanh số tháng tới</h5>
                      <p className="text-2xl font-bold text-emerald-600 mb-1">+22%</p>
                      <p className="text-sm text-gray-600">Dự kiến bán được 667 xe</p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Mẫu xe hot nhất</h5>
                      <p className="text-lg font-bold text-blue-600 mb-1">Electra CityLink</p>
                      <p className="text-sm text-gray-600">Tăng 25% so với tháng trước</p>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Khu vực tiềm năng</h5>
                      <p className="text-lg font-bold text-purple-600 mb-1">Đà Nẵng</p>
                      <p className="text-sm text-gray-600">Cơ hội mở rộng thị trường</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Khuyến nghị từ AI</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h5 className="font-medium text-emerald-900 mb-2">Tối ưu tồn kho</h5>
                    <p className="text-sm text-emerald-800">Điều chuyển 15 xe Electra Ascent từ Hà Nội sang TP.HCM</p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Khuyến mãi thông minh</h5>
                    <p className="text-sm text-blue-800">Giảm giá 3% cho Electra Micro trong tháng 3</p>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h5 className="font-medium text-purple-900 mb-2">Mở rộng thị trường</h5>
                    <p className="text-sm text-purple-800">Tìm đại lý mới tại Cần Thơ và Nha Trang</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesReport;