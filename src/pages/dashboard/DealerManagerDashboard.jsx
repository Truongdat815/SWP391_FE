import { useState } from 'react';

function DealerManagerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { title: 'Doanh số tháng', value: '8.5M VNĐ', change: '+15%', color: 'bg-red-500' },
    { title: 'Số đơn hàng', value: '156', change: '+8%', color: 'bg-green-500' },
    { title: 'Nhân viên bán hàng', value: '12', change: '+2', color: 'bg-blue-500' },
    { title: 'Tỷ lệ chuyển đổi', value: '72%', change: '+3%', color: 'bg-purple-500' }
  ];

  const salesTeam = [
    { name: 'Nguyễn Văn A', sales: '2.1M', orders: 28, conversion: '78%' },
    { name: 'Trần Thị B', sales: '1.8M', orders: 24, conversion: '75%' },
    { name: 'Lê Văn C', sales: '1.6M', orders: 22, conversion: '73%' },
    { name: 'Phạm Thị D', sales: '1.4M', orders: 19, conversion: '71%' }
  ];

  const debtReport = [
    { customer: 'Công ty ABC', amount: '500,000,000', days: 15, status: 'warning' },
    { customer: 'Ông Nguyễn XYZ', amount: '200,000,000', days: 8, status: 'normal' },
    { customer: 'Chị Trần DEF', amount: '800,000,000', days: 25, status: 'critical' }
  ];

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: '📊' },
    { id: 'sales-report', name: 'Báo cáo doanh số', icon: '💰' },
    { id: 'team-management', name: 'Quản lý nhân viên', icon: '👥' },
    { id: 'debt-management', name: 'Quản lý công nợ', icon: '📋' }
  ];

  const getDebtStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDebtStatusText = (status) => {
    switch (status) {
      case 'critical': return 'Nghiêm trọng';
      case 'warning': return 'Cảnh báo';
      case 'normal': return 'Bình thường';
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
                <span className="text-white text-sm font-bold">DM</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Dealer Manager Dashboard</h1>
                <p className="text-sm text-gray-500">Quản lý và báo cáo tổng quan</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                Tạo báo cáo
              </button>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-700">Quản lý</span>
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
            {/* Sales Performance Chart */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Biểu đồ doanh số</h3>
              </div>
              <div className="p-6">
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500">Biểu đồ doanh số theo tháng</p>
                  </div>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Báo cáo doanh số</p>
                      <p className="text-sm text-gray-500">Xem báo cáo chi tiết doanh số</p>
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
                      <p className="font-medium text-gray-900">Quản lý nhân viên</p>
                      <p className="text-sm text-gray-500">Theo dõi hiệu suất nhân viên</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Quản lý công nợ</p>
                      <p className="text-sm text-gray-500">Theo dõi công nợ khách hàng</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Xuất báo cáo</p>
                      <p className="text-sm text-gray-500">Xuất báo cáo Excel/PDF</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales-report' && (
          <div className="space-y-6">
            {/* Sales Summary */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Tổng quan doanh số</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-red-50 rounded-lg">
                    <h4 className="text-2xl font-bold text-red-600 mb-2">8.5M VNĐ</h4>
                    <p className="text-gray-600">Doanh số tháng này</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <h4 className="text-2xl font-bold text-green-600 mb-2">156</h4>
                    <p className="text-gray-600">Tổng số đơn hàng</p>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <h4 className="text-2xl font-bold text-blue-600 mb-2">72%</h4>
                    <p className="text-gray-600">Tỷ lệ chuyển đổi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales by Vehicle Model */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Doanh số theo mẫu xe</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg mr-4"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">Tesla Model 3</h4>
                        <p className="text-sm text-gray-500">28 đơn hàng</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">2.1M VNĐ</p>
                      <p className="text-sm text-green-600">+15%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg mr-4"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">VinFast VF8</h4>
                        <p className="text-sm text-gray-500">24 đơn hàng</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">1.8M VNĐ</p>
                      <p className="text-sm text-green-600">+12%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-100 rounded-lg mr-4"></div>
                      <div>
                        <h4 className="font-medium text-gray-900">BMW iX3</h4>
                        <p className="text-sm text-gray-500">22 đơn hàng</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">1.6M VNĐ</p>
                      <p className="text-sm text-green-600">+8%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team-management' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Hiệu suất nhân viên bán hàng</h3>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                  Thêm nhân viên
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nhân viên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doanh số
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tỷ lệ chuyển đổi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesTeam.map((member, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-300 rounded-full mr-4"></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">Nhân viên bán hàng</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.sales}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.orders}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {member.conversion}
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
        )}

        {activeTab === 'debt-management' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Báo cáo công nợ khách hàng</h3>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                  Xuất báo cáo
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {debtReport.map((debt, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-100 rounded-full mr-4 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">{debt.customer.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{debt.customer}</h4>
                        <p className="text-sm text-gray-500">{debt.days} ngày quá hạn</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{debt.amount} VNĐ</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDebtStatusColor(debt.status)}`}>
                          {getDebtStatusText(debt.status)}
                        </span>
                      </div>
                      <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                        Liên hệ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DealerManagerDashboard;
