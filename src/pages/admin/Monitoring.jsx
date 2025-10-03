import { useState, useEffect } from 'react';

function Monitoring() {
  const [activeTab, setActiveTab] = useState('system-activity');
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data for system activity
  const systemActivities = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:25',
      user: 'admin@electra.com',
      action: 'Đăng nhập hệ thống',
      ip: '192.168.1.100',
      status: 'success',
      details: 'Đăng nhập thành công từ IP 192.168.1.100'
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:25:18',
      user: 'nguyenvana@electra.com',
      action: 'Tạo báo giá mới',
      ip: '192.168.1.105',
      status: 'success',
      details: 'Tạo báo giá #BG001 cho khách hàng ABC Company'
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:20:45',
      user: 'hanoi@electra.com',
      action: 'Đăng nhập thất bại',
      ip: '192.168.1.110',
      status: 'failed',
      details: 'Mật khẩu không đúng - 3 lần thử liên tiếp'
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:15:32',
      user: 'tranthib@electra.com',
      action: 'Cập nhật sản phẩm',
      ip: '192.168.1.102',
      status: 'success',
      details: 'Cập nhật thông tin sản phẩm Electra Velocity'
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:10:15',
      user: 'levanc@electra.com',
      action: 'Xóa dữ liệu',
      ip: '192.168.1.103',
      status: 'warning',
      details: 'Xóa 5 bản ghi cũ trong bảng logs'
    }
  ];

  // Mock data for login history
  const loginHistory = [
    {
      id: 1,
      user: 'admin@electra.com',
      userType: 'Admin',
      loginTime: '2024-01-15 09:00:00',
      logoutTime: '2024-01-15 17:30:00',
      ip: '192.168.1.100',
      location: 'Hà Nội, Việt Nam',
      device: 'Chrome/Windows',
      status: 'success'
    },
    {
      id: 2,
      user: 'nguyenvana@electra.com',
      userType: 'EVM Staff',
      loginTime: '2024-01-15 08:45:00',
      logoutTime: '2024-01-15 17:00:00',
      ip: '192.168.1.105',
      location: 'TP.HCM, Việt Nam',
      device: 'Firefox/Windows',
      status: 'success'
    },
    {
      id: 3,
      user: 'hanoi@electra.com',
      userType: 'Dealer Manager',
      loginTime: '2024-01-15 08:30:00',
      logoutTime: '2024-01-15 17:15:00',
      ip: '192.168.1.110',
      location: 'Hà Nội, Việt Nam',
      device: 'Safari/macOS',
      status: 'success'
    },
    {
      id: 4,
      user: 'danang@electra.com',
      userType: 'Dealer Staff',
      loginTime: '2024-01-15 08:00:00',
      logoutTime: null,
      ip: '192.168.1.115',
      location: 'Đà Nẵng, Việt Nam',
      device: 'Chrome/Windows',
      status: 'active'
    }
  ];

  // Mock data for errors and alerts
  const errorsAndAlerts = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:25',
      type: 'error',
      severity: 'high',
      category: 'Database',
      message: 'Connection timeout to primary database',
      source: 'Database Server',
      resolved: false,
      details: 'Unable to establish connection to primary database server. Check network connectivity and server status.'
    },
    {
      id: 2,
      timestamp: '2024-01-15 13:45:18',
      type: 'warning',
      severity: 'medium',
      category: 'Performance',
      message: 'High CPU usage detected',
      source: 'Application Server',
      resolved: false,
      details: 'CPU usage has exceeded 85% for the last 10 minutes. Consider scaling resources.'
    },
    {
      id: 3,
      timestamp: '2024-01-15 12:20:45',
      type: 'alert',
      severity: 'low',
      category: 'Security',
      message: 'Multiple failed login attempts',
      source: 'Authentication Service',
      resolved: true,
      details: '5 failed login attempts detected from IP 192.168.1.200 in the last hour.'
    },
    {
      id: 4,
      timestamp: '2024-01-15 11:15:32',
      type: 'error',
      severity: 'high',
      category: 'API',
      message: 'API endpoint returning 500 errors',
      source: 'API Gateway',
      resolved: true,
      details: 'Product API endpoint /api/products returning 500 errors for 15 minutes.'
    },
    {
      id: 5,
      timestamp: '2024-01-15 10:30:15',
      type: 'warning',
      severity: 'medium',
      category: 'Storage',
      message: 'Disk space running low',
      source: 'File Server',
      resolved: true,
      details: 'Available disk space is below 20% on the file server.'
    }
  ];

  // System metrics
  const systemMetrics = [
    {
      title: 'Tổng số người dùng online',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      title: 'Số lần đăng nhập hôm nay',
      value: '1,247',
      change: '+8%',
      changeType: 'positive',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Lỗi hệ thống (24h)',
      value: '23',
      change: '-15%',
      changeType: 'negative',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    {
      title: 'Uptime hệ thống',
      value: '99.9%',
      change: '+0.1%',
      changeType: 'positive',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const tabs = [
    { id: 'system-activity', name: 'Hoạt động hệ thống', count: systemActivities.length },
    { id: 'login-history', name: 'Lịch sử đăng nhập', count: loginHistory.length },
    { id: 'errors-alerts', name: 'Lỗi & Cảnh báo', count: errorsAndAlerts.length }
  ];

  // Auto refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // In real app, this would fetch new data
        console.log('Refreshing monitoring data...');
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const renderSystemActivity = () => (
    <div className="space-y-4">
      {systemActivities.map((activity) => (
        <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.status)}`}>
                  {activity.status === 'success' ? 'Thành công' : 
                   activity.status === 'failed' ? 'Thất bại' : 'Cảnh báo'}
                </span>
                <span className="text-sm text-gray-500">{activity.timestamp}</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{activity.action}</h4>
              <p className="text-sm text-gray-600 mb-2">{activity.details}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>👤 {activity.user}</span>
                <span>🌐 {activity.ip}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm">Chi tiết</button>
              <button className="text-red-600 hover:text-red-800 text-sm">Xóa</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLoginHistory = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Người dùng
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Loại
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thời gian đăng nhập
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thời gian đăng xuất
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP / Vị trí
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loginHistory.map((login) => (
            <tr key={login.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{login.user}</div>
                  <div className="text-xs text-gray-500">{login.device}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {login.userType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {login.loginTime}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {login.logoutTime || <span className="text-blue-600">Đang hoạt động</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div>{login.ip}</div>
                  <div className="text-xs text-gray-500">{login.location}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(login.status)}`}>
                  {login.status === 'success' ? 'Thành công' : 'Đang hoạt động'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderErrorsAndAlerts = () => (
    <div className="space-y-4">
      {errorsAndAlerts.map((item) => (
        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(item.severity)}`}>
                  {item.severity === 'high' ? 'Cao' : 
                   item.severity === 'medium' ? 'Trung bình' : 'Thấp'}
                </span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  item.type === 'error' ? 'bg-red-100 text-red-800' :
                  item.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {item.type === 'error' ? 'Lỗi' : 
                   item.type === 'warning' ? 'Cảnh báo' : 'Thông báo'}
                </span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  {item.category}
                </span>
                <span className="text-sm text-gray-500">{item.timestamp}</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{item.message}</h4>
              <p className="text-sm text-gray-600 mb-2">{item.details}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>📍 {item.source}</span>
                <span className={item.resolved ? 'text-green-600' : 'text-red-600'}>
                  {item.resolved ? '✅ Đã giải quyết' : '❌ Chưa giải quyết'}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm">Chi tiết</button>
              {!item.resolved && (
                <button className="text-green-600 hover:text-green-800 text-sm">Giải quyết</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Giám sát & Logs</h1>
            <p className="text-gray-600 mt-1">Theo dõi hoạt động hệ thống, lịch sử đăng nhập và quản lý lỗi</p>
          </div>
          <div className="flex space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto-refresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="auto-refresh" className="text-sm text-gray-700">Tự động làm mới</label>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            >
              <option value="1h">1 giờ qua</option>
              <option value="24h">24 giờ qua</option>
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
            </select>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-red-50 text-red-600">
                  {metric.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
              </div>
              <div className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                {metric.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
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
                {tab.name}
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'system-activity' && renderSystemActivity()}
          {activeTab === 'login-history' && renderLoginHistory()}
          {activeTab === 'errors-alerts' && renderErrorsAndAlerts()}
        </div>
      </div>
    </div>
  );
}

export default Monitoring;
