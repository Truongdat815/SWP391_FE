import { useState } from 'react';

function EVMDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: 'Tổng tồn kho', value: '1,247', change: '+5%', color: 'bg-red-500' },
    { title: 'Xe đã phân phối', value: '892', change: '+12%', color: 'bg-green-500' },
    { title: 'Số đại lý', value: '24', change: '+2', color: 'bg-blue-500' },
    { title: 'Doanh thu tháng', value: '45.2M VNĐ', change: '+18%', color: 'bg-purple-500' }
  ];

  const inventory = [
    { model: 'Tesla Model 3', color: 'Đen', stock: 45, reserved: 12, available: 33 },
    { model: 'VinFast VF8', color: 'Trắng', stock: 78, reserved: 25, available: 53 },
    { model: 'BMW iX3', color: 'Xám', stock: 32, reserved: 8, available: 24 },
    { model: 'Audi e-tron', color: 'Đỏ', stock: 28, reserved: 15, available: 13 }
  ];

  const dealers = [
    { name: 'Đại lý Hà Nội', location: 'Hà Nội', orders: 156, revenue: '8.5M', status: 'active' },
    { name: 'Đại lý TP.HCM', location: 'TP.HCM', orders: 234, revenue: '12.3M', status: 'active' },
    { name: 'Đại lý Đà Nẵng', location: 'Đà Nẵng', orders: 89, revenue: '4.2M', status: 'warning' },
    { name: 'Đại lý Cần Thơ', location: 'Cần Thơ', orders: 67, revenue: '3.1M', status: 'active' }
  ];

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: '📊' },
    { id: 'inventory', name: 'Quản lý tồn kho', icon: '📦' },
    { id: 'dealers', name: 'Quản lý đại lý', icon: '🏢' },
    { id: 'distribution', name: 'Phân phối', icon: '🚚' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'warning': return 'Cảnh báo';
      case 'inactive': return 'Không hoạt động';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">EV</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">EVM Staff Dashboard</h1>
                <p className="text-sm text-gray-500">Quản lý sản phẩm và phân phối</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                Thêm sản phẩm
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-700">EVM Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Overview */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Tổng quan tồn kho</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {inventory.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg mr-4"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.model}</h4>
                          <p className="text-sm text-gray-500">{item.color}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{item.stock} xe</p>
                        <p className="text-sm text-green-600">{item.available} có sẵn</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Thao tác nhanh</h3>
              </div>
              <div className="p-6 space-y-4">
                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg mr-3">
                      <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Thêm xe mới</p>
                      <p className="text-sm text-gray-500">Thêm mẫu xe mới vào hệ thống</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Điều phối xe</p>
                      <p className="text-sm text-gray-500">Phân phối xe cho đại lý</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Quản lý giá</p>
                      <p className="text-sm text-gray-500">Cập nhật giá sỉ và chính sách</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Báo cáo tồn kho</p>
                      <p className="text-sm text-gray-500">Xem báo cáo chi tiết tồn kho</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Inventory Management */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Quản lý tồn kho</h3>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                    Thêm xe mới
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mẫu xe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Màu sắc
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
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 bg-gray-100 rounded-lg mr-4"></div>
                            <div className="text-sm font-medium text-gray-900">{item.model}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.color}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.stock}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.reserved}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {item.available}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-red-600 hover:text-red-900 mr-3">Chỉnh sửa</button>
                          <button className="text-blue-600 hover:text-blue-900">Chi tiết</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Demand Forecast */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Dự báo nhu cầu AI</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Tesla Model 3</h4>
                    <p className="text-sm text-gray-500 mb-2">Dự báo tháng tới</p>
                    <p className="text-2xl font-bold text-red-600">+25%</p>
                  </div>

                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">VinFast VF8</h4>
                    <p className="text-sm text-gray-500 mb-2">Dự báo tháng tới</p>
                    <p className="text-2xl font-bold text-blue-600">+18%</p>
                  </div>

                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">BMW iX3</h4>
                    <p className="text-sm text-gray-500 mb-2">Dự báo tháng tới</p>
                    <p className="text-2xl font-bold text-green-600">+12%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dealers' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý đại lý</h3>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                  Thêm đại lý
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dealers.map((dealer, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg mr-4"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{dealer.name}</h4>
                          <p className="text-sm text-gray-500">{dealer.location}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dealer.status)}`}>
                        {getStatusText(dealer.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{dealer.orders}</p>
                        <p className="text-sm text-gray-500">Đơn hàng</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{dealer.revenue}</p>
                        <p className="text-sm text-gray-500">Doanh thu</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition">
                        Xem chi tiết
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition">
                        Chỉnh sửa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'distribution' && (
          <div className="space-y-6">
            {/* Distribution Overview */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Phân phối xe theo khu vực</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Hà Nội</h4>
                    <p className="text-2xl font-bold text-red-600 mb-2">156</p>
                    <p className="text-sm text-gray-500">Xe đã phân phối</p>
                  </div>

                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">TP.HCM</h4>
                    <p className="text-2xl font-bold text-blue-600 mb-2">234</p>
                    <p className="text-sm text-gray-500">Xe đã phân phối</p>
                  </div>

                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Đà Nẵng</h4>
                    <p className="text-2xl font-bold text-green-600 mb-2">89</p>
                    <p className="text-sm text-gray-500">Xe đã phân phối</p>
                  </div>

                  <div className="text-center p-6 border border-gray-200 rounded-lg">
                    <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">Cần Thơ</h4>
                    <p className="text-2xl font-bold text-purple-600 mb-2">67</p>
                    <p className="text-sm text-gray-500">Xe đã phân phối</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Distributions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Đơn vận chuyển đang chờ</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg mr-4"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">Đơn hàng #001</h4>
                        <p className="text-sm text-gray-500">Đại lý Hà Nội - 5 xe Tesla Model 3</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Chờ vận chuyển
                      </span>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                        Xử lý
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg mr-4"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">Đơn hàng #002</h4>
                        <p className="text-sm text-gray-500">Đại lý TP.HCM - 8 xe VinFast VF8</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Chờ vận chuyển
                      </span>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                        Xử lý
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EVMDashboard;
