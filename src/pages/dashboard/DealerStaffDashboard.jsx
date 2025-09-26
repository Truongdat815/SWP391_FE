import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function DealerStaffDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const stats = [
    { title: 'Tổng đơn hàng', value: '24', change: '+12%', color: 'bg-red-500' },
    { title: 'Doanh thu tháng', value: '2.4M VNĐ', change: '+8%', color: 'bg-green-500' },
    { title: 'Khách hàng mới', value: '18', change: '+15%', color: 'bg-blue-500' },
    { title: 'Tỷ lệ chuyển đổi', value: '68%', change: '+5%', color: 'bg-purple-500' }
  ];

  const recentOrders = [
    { id: '#001', customer: 'Nguyễn Văn A', vehicle: 'Tesla Model 3', amount: '1,200,000,000', status: 'pending' },
    { id: '#002', customer: 'Trần Thị B', vehicle: 'VinFast VF8', amount: '890,000,000', status: 'completed' },
    { id: '#003', customer: 'Lê Văn C', vehicle: 'BMW iX3', amount: '1,500,000,000', status: 'processing' },
    { id: '#004', customer: 'Phạm Thị D', vehicle: 'Audi e-tron', amount: '2,100,000,000', status: 'pending' }
  ];

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: '📊' },
    { id: 'sales', name: 'Quản lý bán hàng', icon: '💰' },
    { id: 'customers', name: 'Khách hàng', icon: '👥' },
    { id: 'vehicles', name: 'Thông tin xe', icon: '🚗' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'completed': return 'Hoàn thành';
      case 'processing': return 'Đang xử lý';
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
                <span className="text-white text-sm font-bold">DS</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Dealer Staff Dashboard</h1>
                <p className="text-sm text-gray-500">Quản lý bán hàng và khách hàng</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                Tạo đơn hàng mới
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-700">Nhân viên</span>
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
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Đơn hàng gần đây</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-500">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.vehicle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
                      <p className="font-medium text-gray-900">Tạo báo giá mới</p>
                      <p className="text-sm text-gray-500">Tạo báo giá cho khách hàng</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Thêm khách hàng mới</p>
                      <p className="text-sm text-gray-500">Đăng ký thông tin khách hàng</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Đặt xe từ hãng</p>
                      <p className="text-sm text-gray-500">Đặt hàng xe mới từ hãng sản xuất</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Lịch hẹn lái thử</p>
                      <p className="text-sm text-gray-500">Quản lý lịch hẹn với khách hàng</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quản lý bán hàng</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Tạo báo giá</h4>
                  <p className="text-sm text-gray-500 mb-4">Tạo báo giá chi tiết cho khách hàng</p>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                    Tạo mới
                  </button>
                </div>

                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Quản lý đơn hàng</h4>
                  <p className="text-sm text-gray-500 mb-4">Theo dõi và xử lý đơn hàng</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Xem tất cả
                  </button>
                </div>

                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Thanh toán</h4>
                  <p className="text-sm text-gray-500 mb-4">Quản lý thanh toán và công nợ</p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Quản lý khách hàng</h3>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                  Thêm khách hàng
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Khách hàng tiềm năng</h4>
                  <p className="text-3xl font-bold text-red-600 mb-2">12</p>
                  <p className="text-sm text-gray-500">Khách hàng chưa mua xe</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Khách hàng đã mua</h4>
                  <p className="text-3xl font-bold text-green-600 mb-2">45</p>
                  <p className="text-sm text-gray-500">Khách hàng đã mua xe</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Lịch hẹn hôm nay</h4>
                  <p className="text-3xl font-bold text-blue-600 mb-2">3</p>
                  <p className="text-sm text-gray-500">Cuộc hẹn lái thử</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Danh mục xe VinFast</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* VinFast VF3 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.https://vinfasthadong.com.vn/wp-content/uploads/2023/10/VinFast-VF3-mau-trang-noc-trang-scaled-1.jpgcom/photo-1595435934249-5b2d2e8b5b5b?w=600&h=400&fit=crop&crop=center" 
                      alt="VinFast VF3"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/FFD700/000000?text=VinFast+VF3';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      VF3
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">VinFast VF3 2025</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 299.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 200km</p>
                  <button 
                    onClick={() => navigate('/vehicle/vf3')}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* VinFast VF5 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="https://images.https://images2.thanhnien.vn/528068263637045248/2023/5/3/vf5-white-1-1683086959276932591825.jpgunsplash.com/photo-1609521263047-f8f205293f24?w=600&h=400&fit=crop&crop=center" 
                      alt="VinFast VF5"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/DC143C/FFFFFF?text=VinFast+VF5';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      VF5
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">VinFast VF5 Plus</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 529.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 300km</p>
                  <button 
                    onClick={() => navigate('/vehicle/vf5')}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* VinFast VF6 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&h=400&fit=crop&crop=center" 
                      alt="VinFast VF6"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/0066CC/FFFFFF?text=VinFast+VF6';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      VF6
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">VinFast VF6 Eco/Plus</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 689.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 380km</p>
                  <button 
                    onClick={() => navigate('/vehicle/vf6')}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* VinFast VF7 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&h=400&fit=crop&crop=center" 
                      alt="VinFast VF7"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/DC143C/FFFFFF?text=VinFast+VF7';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      VF7
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">VinFast VF7 Eco/Plus</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 799.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 450km</p>
                  <button 
                    onClick={() => navigate('/vehicle/vf7')}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* VinFast VF8 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&h=400&fit=crop&crop=center" 
                      alt="VinFast VF8"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/FFFFFF/000000?text=VinFast+VF8';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      VF8
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">VinFast VF8 Eco/Plus</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 1.019.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 500km</p>
                  <button 
                    onClick={() => navigate('/vehicle/vf8')}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* VinFast VF9 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&h=400&fit=crop&crop=center" 
                      alt="VinFast VF9"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/0066CC/FFFFFF?text=VinFast+VF9';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                      VF9
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">VinFast VF9 Eco/Plus</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 1.499.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 600km</p>
                  <button 
                    onClick={() => navigate('/vehicle/vf9')}
                    className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>

              {/* Promotion Banner */}
              <div className="mt-8 bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Chương trình ưu đãi Cực Khủng</h3>
                    <p className="text-red-100">
                      Vui lòng liên hệ Hotline <span className="font-bold">0964.054.962</span> để được tư vấn tốt nhất!
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                      Hotline 0964.054.962
                    </button>
                    <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition">
                      BÁO GIÁ NGAY
                    </button>
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

export default DealerStaffDashboard;
