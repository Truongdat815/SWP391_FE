import { useState } from 'react';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: 'Tổng doanh thu', value: '125.8M VNĐ', change: '+22%', color: 'bg-red-500' },
    { title: 'Số đại lý', value: '24', change: '+3', color: 'bg-green-500' },
    { title: 'Tổng đơn hàng', value: '1,247', change: '+18%', color: 'bg-blue-500' },
    { title: 'Tỷ lệ chuyển đổi', value: '68%', change: '+5%', color: 'bg-purple-500' }
  ];

  const systemOverview = [
    { title: 'Người dùng đang hoạt động', value: '156', status: 'online' },
    { title: 'Đơn hàng chờ xử lý', value: '23', status: 'pending' },
    { title: 'Hệ thống hoạt động', value: '99.9%', status: 'healthy' },
    { title: 'Lưu trữ dữ liệu', value: '2.4TB', status: 'normal' }
  ];

  const dealers = [
    { name: 'Đại lý Hà Nội', location: 'Hà Nội', manager: 'Nguyễn Văn A', revenue: '25.5M', orders: 456, status: 'active' },
    { name: 'Đại lý TP.HCM', location: 'TP.HCM', manager: 'Trần Thị B', revenue: '32.1M', orders: 578, status: 'active' },
    { name: 'Đại lý Đà Nẵng', location: 'Đà Nẵng', manager: 'Lê Văn C', revenue: '18.7M', orders: 234, status: 'warning' },
    { name: 'Đại lý Cần Thơ', location: 'Cần Thơ', manager: 'Phạm Thị D', revenue: '15.2M', orders: 189, status: 'active' }
  ];

  const tabs = [
    { id: 'overview', name: 'Tổng quan hệ thống', icon: '📊' },
    { id: 'dealers', name: 'Quản lý đại lý', icon: '🏢' },
    { id: 'analytics', name: 'Phân tích dữ liệu', icon: '📈' },
    { id: 'system', name: 'Quản lý hệ thống', icon: '⚙️' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'online': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'healthy': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'warning': return 'Cảnh báo';
      case 'inactive': return 'Không hoạt động';
      case 'online': return 'Trực tuyến';
      case 'pending': return 'Chờ xử lý';
      case 'healthy': return 'Khỏe mạnh';
      case 'normal': return 'Bình thường';
      default: return status;
    }
  };

  return (
    <>
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
          {/* System Overview */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Tình trạng hệ thống</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {systemOverview.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{item.value}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Thao tác quản trị</h3>
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
                    <p className="font-medium text-gray-900">Thêm đại lý mới</p>
                    <p className="text-sm text-gray-500">Đăng ký đại lý mới vào hệ thống</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Báo cáo tổng hợp</p>
                    <p className="text-sm text-gray-500">Xem báo cáo toàn hệ thống</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Cài đặt hệ thống</p>
                    <p className="text-sm text-gray-500">Cấu hình tham số hệ thống</p>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bảo mật hệ thống</p>
                    <p className="text-sm text-gray-500">Quản lý bảo mật và phân quyền</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dealers' && (
        <div className="space-y-6">
          {/* Dealers Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý đại lý</h3>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                  Thêm đại lý
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đại lý
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Địa điểm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quản lý
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh thu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dealers.map((dealer, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-300 rounded-lg mr-4"></div>
                          <div className="text-sm font-medium text-gray-900">{dealer.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dealer.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dealer.manager}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{dealer.revenue}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{dealer.orders}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(dealer.status)}`}>
                          {getStatusText(dealer.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-600 hover:text-red-900 mr-3">Xem chi tiết</button>
                        <button className="text-blue-600 hover:text-blue-900">Chỉnh sửa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dealer Performance Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Biểu đồ hiệu suất đại lý</h3>
            </div>
            <div className="p-6">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500">Biểu đồ hiệu suất theo đại lý</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Revenue Analytics */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Phân tích doanh thu</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <h4 className="text-2xl font-bold text-red-600 mb-2">125.8M VNĐ</h4>
                  <p className="text-gray-600">Doanh thu tháng này</p>
                  <p className="text-sm text-green-600 mt-2">+22% so với tháng trước</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <h4 className="text-2xl font-bold text-green-600 mb-2">1,247</h4>
                  <p className="text-gray-600">Tổng đơn hàng</p>
                  <p className="text-sm text-green-600 mt-2">+18% so với tháng trước</p>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <h4 className="text-2xl font-bold text-blue-600 mb-2">68%</h4>
                  <p className="text-gray-600">Tỷ lệ chuyển đổi</p>
                  <p className="text-sm text-green-600 mt-2">+5% so với tháng trước</p>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Performance */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Hiệu suất theo khu vực</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-red-100 rounded-lg mr-4 flex items-center justify-center">
                      <span className="text-red-600 font-bold">HN</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Hà Nội</h4>
                      <p className="text-sm text-gray-500">6 đại lý</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">45.2M VNĐ</p>
                    <p className="text-sm text-green-600">+25%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg mr-4 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">HCM</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">TP.HCM</h4>
                      <p className="text-sm text-gray-500">8 đại lý</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">52.7M VNĐ</p>
                    <p className="text-sm text-green-600">+30%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-green-100 rounded-lg mr-4 flex items-center justify-center">
                      <span className="text-green-600 font-bold">DN</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Đà Nẵng</h4>
                      <p className="text-sm text-gray-500">4 đại lý</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">18.7M VNĐ</p>
                    <p className="text-sm text-green-600">+15%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          {/* System Settings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cài đặt hệ thống</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Cấu hình chung</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tự động sao lưu</span>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Bật</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Thông báo email</span>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Bật</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Xác thực 2FA</span>
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">Tắt</button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Bảo mật</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Giới hạn đăng nhập</span>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Bật</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ghi log hoạt động</span>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Bật</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Mã hóa dữ liệu</span>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">Bật</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý người dùng</h3>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                  Thêm người dùng
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">Admin</h4>
                      <p className="text-sm text-gray-500">Quản trị viên</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700">
                      Chỉnh sửa
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-50">
                      Reset
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">EVM Staff</h4>
                      <p className="text-sm text-gray-500">Nhân viên EVM</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700">
                      Chỉnh sửa
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-50">
                      Reset
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 bg-gray-300 rounded-full mr-3"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">Dealer Manager</h4>
                      <p className="text-sm text-gray-500">Quản lý đại lý</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700">
                      Chỉnh sửa
                    </button>
                    <button className="flex-1 border border-gray-300 text-gray-700 py-1 px-3 rounded text-sm hover:bg-gray-50">
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;
