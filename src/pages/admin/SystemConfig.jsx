import { useEffect, useState } from 'react';
import axiosClient from '@/services/axiosClient';

function SystemConfig() {
  const [activeTab, setActiveTab] = useState('security');
  const [orderCount, setOrderCount] = useState(0);
  const [roles, setRoles] = useState([]);
  const [settings, setSettings] = useState({
    // Security settings
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumbers: true,
    passwordRequireUppercase: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    ipWhitelist: false,
    encryptionEnabled: true,
    
    // API settings
    apiRateLimit: 1000,
    apiTimeout: 30,
    apiVersioning: true,
    corsEnabled: true,
    apiDocumentation: true,
    
    // System settings
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    logRetention: 90,
    emailNotifications: true,
    smsNotifications: false,
    
    // Advanced permissions
    roleBasedAccess: true,
    permissionInheritance: true,
    auditLogging: true,
    dataEncryption: true,
    apiKeyManagement: true
  });

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ name: '', description: '', permissions: [] });

  useEffect(() => {
    axiosClient.get('/api/orders/count/status/COMPLETED')
      .then((res) => setOrderCount(Number(res?.data?.data) || 0))
      .catch(() => setOrderCount(0));

    axiosClient.get('/api/roles/all')
      .then((res) => setRoles(Array.isArray(res?.data?.data) ? res.data.data : []))
      .catch(() => setRoles([]));
  }, []);

  const tabs = [
    { id: 'security', name: 'Cấu hình bảo mật', icon: '🔒' },
    { id: 'api', name: 'Quản lý API', icon: '🔌' },
    { id: 'advanced', name: 'Phân quyền nâng cao', icon: '⚙️' }
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // In real app, this would save to backend
    console.log('Saving settings:', settings);
    alert('Cài đặt đã được lưu thành công!');
  };

  const handleResetSettings = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại tất cả cài đặt về mặc định?')) {
      // Reset to default values
      setSettings({
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        passwordRequireNumbers: true,
        passwordRequireUppercase: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        twoFactorAuth: false,
        ipWhitelist: false,
        encryptionEnabled: true,
        apiRateLimit: 1000,
        apiTimeout: 30,
        apiVersioning: true,
        corsEnabled: true,
        apiDocumentation: true,
        maintenanceMode: false,
        autoBackup: true,
        backupFrequency: 'daily',
        logRetention: 90,
        emailNotifications: true,
        smsNotifications: false,
        roleBasedAccess: true,
        permissionInheritance: true,
        auditLogging: true,
        dataEncryption: true,
        apiKeyManagement: true
      });
    }
  };

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      {/* Password Policy */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chính sách mật khẩu</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ dài tối thiểu mật khẩu
            </label>
            <input
              type="number"
              min="6"
              max="20"
              value={settings.passwordMinLength}
              onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian hết hạn phiên (phút)
            </label>
            <input
              type="number"
              min="5"
              max="480"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.passwordRequireSpecial}
              onChange={(e) => handleSettingChange('passwordRequireSpecial', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Yêu cầu ký tự đặc biệt</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.passwordRequireNumbers}
              onChange={(e) => handleSettingChange('passwordRequireNumbers', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Yêu cầu số</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.passwordRequireUppercase}
              onChange={(e) => handleSettingChange('passwordRequireUppercase', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Yêu cầu chữ hoa</span>
          </label>
        </div>
      </div>

      {/* Authentication Settings */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt xác thực</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số lần đăng nhập sai tối đa
            </label>
            <input
              type="number"
              min="3"
              max="10"
              value={settings.maxLoginAttempts}
              onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.twoFactorAuth}
              onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Bật xác thực 2 yếu tố (2FA)</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.ipWhitelist}
              onChange={(e) => handleSettingChange('ipWhitelist', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Sử dụng danh sách IP trắng</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.encryptionEnabled}
              onChange={(e) => handleSettingChange('encryptionEnabled', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Mã hóa dữ liệu nhạy cảm</span>
          </label>
        </div>
      </div>

      {/* Security Logs */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nhật ký bảo mật</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <span className="text-sm text-gray-700">Ghi log các lần đăng nhập thất bại</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Bật</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <span className="text-sm text-gray-700">Ghi log thay đổi quyền hạn</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Bật</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded border">
            <span className="text-sm text-gray-700">Ghi log truy cập dữ liệu nhạy cảm</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Bật</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAPISettings = () => (
    <div className="space-y-6">
      {/* API Configuration */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cấu hình API</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giới hạn tốc độ API (requests/phút)
            </label>
            <input
              type="number"
              min="100"
              max="10000"
              value={settings.apiRateLimit}
              onChange={(e) => handleSettingChange('apiRateLimit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout API (giây)
            </label>
            <input
              type="number"
              min="5"
              max="300"
              value={settings.apiTimeout}
              onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.apiVersioning}
              onChange={(e) => handleSettingChange('apiVersioning', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Bật phiên bản API</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.corsEnabled}
              onChange={(e) => handleSettingChange('corsEnabled', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Bật CORS</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.apiDocumentation}
              onChange={(e) => handleSettingChange('apiDocumentation', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Bật tài liệu API</span>
          </label>
        </div>
      </div>

      {/* API Keys Management */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quản lý API Keys</h3>
          <button
            onClick={() => setShowApiKeyModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tạo API Key
          </button>
        </div>
        
        <div className="space-y-3">
          {[
            { name: 'Mobile App', key: 'sk-***...***abc123', permissions: ['read', 'write'], lastUsed: '2024-01-15 14:30', status: 'active' },
            { name: 'Web Dashboard', key: 'sk-***...***def456', permissions: ['read'], lastUsed: '2024-01-15 13:45', status: 'active' },
            { name: 'Integration Test', key: 'sk-***...***ghi789', permissions: ['read', 'write', 'admin'], lastUsed: '2024-01-14 16:20', status: 'inactive' }
          ].map((apiKey, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
              <div>
                <div className="font-medium text-gray-900">{apiKey.name}</div>
                <div className="text-sm text-gray-500">{apiKey.key}</div>
                <div className="text-xs text-gray-400">Sử dụng cuối: {apiKey.lastUsed}</div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  apiKey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {apiKey.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm">Sửa</button>
                <button className="text-red-600 hover:text-red-800 text-sm">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      {/* Role-Based Access Control */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kiểm soát truy cập dựa trên vai trò</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.roleBasedAccess}
              onChange={(e) => handleSettingChange('roleBasedAccess', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Bật kiểm soát truy cập dựa trên vai trò (RBAC)</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.permissionInheritance}
              onChange={(e) => handleSettingChange('permissionInheritance', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Kế thừa quyền hạn từ vai trò cha</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.auditLogging}
              onChange={(e) => handleSettingChange('auditLogging', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Ghi log kiểm toán chi tiết</span>
          </label>
        </div>
      </div>

      {/* Data Protection */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảo vệ dữ liệu</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.dataEncryption}
              onChange={(e) => handleSettingChange('dataEncryption', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Mã hóa dữ liệu ở trạng thái nghỉ</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.apiKeyManagement}
              onChange={(e) => handleSettingChange('apiKeyManagement', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Quản lý API keys tự động</span>
          </label>
        </div>
      </div>

      {/* System Maintenance */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảo trì hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian lưu trữ log (ngày)
            </label>
            <input
              type="number"
              min="7"
              max="365"
              value={settings.logRetention}
              onChange={(e) => handleSettingChange('logRetention', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tần suất sao lưu
            </label>
            <select
              value={settings.backupFrequency}
              onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
            >
              <option value="hourly">Hàng giờ</option>
              <option value="daily">Hàng ngày</option>
              <option value="weekly">Hàng tuần</option>
              <option value="monthly">Hàng tháng</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Sao lưu tự động</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Chế độ bảo trì</span>
          </label>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt thông báo</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Thông báo qua email</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Thông báo qua SMS</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cấu hình hệ thống</h1>
            <p className="text-gray-600 mt-1">Quản lý cài đặt bảo mật, API và phân quyền nâng cao</p>
            <div className="mt-2 text-sm text-gray-600">
              Đơn hoàn tất: <span className="font-semibold text-gray-900">{orderCount}</span> · Số role: <span className="font-semibold text-gray-900">{roles.length}</span>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleResetSettings}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Đặt lại mặc định
            </button>
            <button
              onClick={handleSaveSettings}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
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

        <div className="p-6">
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'api' && renderAPISettings()}
          {activeTab === 'advanced' && renderAdvancedSettings()}
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Tạo API Key mới</h3>
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                    placeholder="Nhập tên API key"
                    value={newApiKey.name}
                    onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 bg-white text-gray-900"
                    placeholder="Nhập mô tả"
                    rows="3"
                    value={newApiKey.description}
                    onChange={(e) => setNewApiKey({...newApiKey, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quyền hạn</label>
                  <div className="space-y-2">
                    {['read', 'write', 'admin'].map((permission) => (
                      <label key={permission} className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                          checked={newApiKey.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewApiKey({...newApiKey, permissions: [...newApiKey.permissions, permission]});
                            } else {
                              setNewApiKey({...newApiKey, permissions: newApiKey.permissions.filter(p => p !== permission)});
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    console.log('Creating API key:', newApiKey);
                    setShowApiKeyModal(false);
                    setNewApiKey({ name: '', description: '', permissions: [] });
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Tạo API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SystemConfig;
