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
    { id: '#001', customer: 'Nguyễn Văn A', vehicle: 'Electra Ascent', amount: '1,200,000,000', status: 'pending' },
    { id: '#002', customer: 'Trần Thị B', vehicle: 'Electra CityLink', amount: '890,000,000', status: 'completed' },
    { id: '#003', customer: 'Lê Văn C', vehicle: 'Electra GrandTour', amount: '1,500,000,000', status: 'processing' },
    { id: '#004', customer: 'Phạm Thị D', vehicle: 'Electra Summit', amount: '2,100,000,000', status: 'pending' }
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
                <button 
                  onClick={() => navigate('/dealer-staff/create-quote')}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
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

                <button 
                  onClick={() => navigate('/dealer-staff/add-customer')}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
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

                <button 
                  onClick={() => navigate('/dealer-staff/order-from-manufacturer')}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
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

                <button 
                  onClick={() => navigate('/dealer-staff/test-drive-schedule')}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
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
                  <button 
                    onClick={() => navigate('/dealer-staff/sales-quote')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
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
                  <button 
                    onClick={() => navigate('/dealer-staff/order-management')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
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
                  <button 
                    onClick={() => navigate('/dealer-staff/payment-management')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
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
              <h3 className="text-lg font-medium text-gray-900">Danh mục xe Electra</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Electra Ascent */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="/src/assets/images/electra ascent.png" 
                      alt="Electra Ascent"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/6CA12B/FFFFFF?text=Electra+Ascent';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      Ascent
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Electra Ascent</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 320.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 380km</p>
                  <button 
                    onClick={() => navigate('/car/electra-ascent')}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* Electra CityLink */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="/src/assets/images/electra citylink poster.png" 
                      alt="Electra CityLink"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/6CA12B/FFFFFF?text=Electra+CityLink';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      CityLink
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Electra CityLink</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 280.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 320km</p>
                  <button 
                    onClick={() => navigate('/car/electra-citylink')}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* Electra GrandTour */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="/src/assets/images/electra grandtour.png" 
                      alt="Electra GrandTour"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/6CA12B/FFFFFF?text=Electra+GrandTour';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      GrandTour
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Electra GrandTour</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 450.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 420km</p>
                  <button 
                    onClick={() => navigate('/car/electra-grandtour')}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* Electra Micro */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="/src/assets/images/electra micro.png" 
                      alt="Electra Micro"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/6CA12B/FFFFFF?text=Electra+Micro';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      Micro
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Electra Micro</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 180.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 200km</p>
                  <button 
                    onClick={() => navigate('/car/electra-micro')}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* Electra Summit */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="/src/assets/images/electra summit.png" 
                      alt="Electra Summit"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/6CA12B/FFFFFF?text=Electra+Summit';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      Summit
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Electra Summit</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 680.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 450km</p>
                  <button 
                    onClick={() => navigate('/car/electra-summit')}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* Electra Velocity */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="/src/assets/images/electra velocity.png" 
                      alt="Electra Velocity"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/6CA12B/FFFFFF?text=Electra+Velocity';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      Velocity
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Electra Velocity</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 850.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 500km</p>
                  <button 
                    onClick={() => navigate('/car/electra-velocity')}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* Electra UrbanPulse */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="/src/assets/images/electra urbanpluse.png" 
                      alt="Electra UrbanPulse"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/6CA12B/FFFFFF?text=Electra+UrbanPulse';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      UrbanPulse
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Electra UrbanPulse</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 220.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 280km</p>
                  <button 
                    onClick={() => navigate('/car/electra-urbanpluse')}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>

                {/* Electra Voyager */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                  <div className="h-48 rounded-lg mb-4 overflow-hidden relative">
                    <img 
                      src="/src/assets/images/electra voyager.png" 
                      alt="Electra Voyager"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400/6CA12B/FFFFFF?text=Electra+Voyager';
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      Voyager
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Electra Voyager</h4>
                  <p className="text-sm text-gray-500 mb-2">Giá từ: 750.000.000 VNĐ</p>
                  <p className="text-sm text-gray-500 mb-4">Quãng đường: 400km</p>
                  <button 
                    onClick={() => navigate('/car/electra-voyager')}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>

          
              
            </div>
          </div>
        )}
    </>
  );
}

export default DealerStaffDashboard;
