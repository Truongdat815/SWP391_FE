import React, { useState } from 'react';

const EVMStaffSettings = ({ onBack }) => {
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    systemNotifications: true,
    autoLogout: true,
    sessionTimeout: 30,
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    inventoryAlert: true,
    lowStockThreshold: 50,
    autoOrderApproval: false
  });

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSelectChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleInputChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = () => {
    // Xử lý lưu cài đặt
    alert('Cài đặt đã được lưu thành công!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      )}
      <div className="bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cài đặt EVM</h1>
        <p className="text-gray-600 mt-1">Tùy chỉnh cài đặt quản lý sản xuất và phân phối</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Giao diện */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Giao diện & Hiển thị</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                <div>
                  <p className="font-medium text-gray-800">Chế độ tối</p>
                  <p className="text-sm text-gray-500">Giảm chói mắt và tiết kiệm pin</p>
                </div>
                <button 
                  onClick={() => handleToggle('darkMode')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.darkMode ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
                  <select 
                    value={settings.language}
                    onChange={(e) => handleSelectChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Múi giờ</label>
                  <select 
                    value={settings.timezone}
                    onChange={(e) => handleSelectChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
                  >
                    <option value="Asia/Ho_Chi_Minh">UTC+7 (Hà Nội)</option>
                    <option value="UTC">UTC+0 (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Thông báo */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông báo & Cảnh báo</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">Thông báo Email</span>
                    <p className="text-sm text-gray-500">Nhận thông báo đơn hàng và tồn kho qua email</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 5.5a3 3 0 116 0 3 3 0 01-6 0zM4.5 5.5a3 3 0 016 0v8a3 3 0 01-6 0V5.5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">Thông báo hệ thống</span>
                    <p className="text-sm text-gray-500">Cảnh báo trên giao diện</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.systemNotifications}
                  onChange={() => handleToggle('systemNotifications')}
                  className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">Cảnh báo tồn kho thấp</span>
                    <p className="text-sm text-gray-500">Thông báo khi tồn kho xuống thấp</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.inventoryAlert}
                  onChange={() => handleToggle('inventoryAlert')}
                  className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>
            </div>
          </section>

          {/* Cài đặt tồn kho */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt tồn kho</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngưỡng cảnh báo tồn kho thấp</label>
                <input 
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
                  placeholder="50"
                />
                <p className="text-sm text-gray-500 mt-1">Hiện tại: {settings.lowStockThreshold} xe</p>
              </div>

              <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                <div>
                  <p className="font-medium text-gray-800">Tự động phê duyệt đơn hàng</p>
                  <p className="text-sm text-gray-500">Tự động phê duyệt đơn hàng từ đại lý</p>
                </div>
                <button 
                  onClick={() => handleToggle('autoOrderApproval')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoOrderApproval ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.autoOrderApproval ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>
            </div>
          </section>

          {/* Bảo mật */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bảo mật & Phiên đăng nhập</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                <div>
                  <p className="font-medium text-gray-800">Tự động đăng xuất</p>
                  <p className="text-sm text-gray-500">Đăng xuất tự động khi không hoạt động</p>
                </div>
                <button 
                  onClick={() => handleToggle('autoLogout')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoLogout ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.autoLogout ? 'translate-x-6' : 'translate-x-1'
                  }`}></span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian chờ (phút)</label>
                <select 
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSelectChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900"
                  disabled={!settings.autoLogout}
                >
                  <option value={15}>15 phút</option>
                  <option value={30}>30 phút</option>
                  <option value={60}>1 giờ</option>
                  <option value={120}>2 giờ</option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition shadow-sm bg-white text-gray-900"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>

        <aside className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900">Mẹo quản lý</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Theo dõi tồn kho thường xuyên</li>
            <li>• Cập nhật giá sỉ kịp thời</li>
            <li>• Xử lý đơn hàng nhanh chóng</li>
            <li>• Theo dõi hiệu suất đại lý</li>
          </ul>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Phím tắt hữu ích</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs bg-white text-gray-900">Ctrl+I</kbd> Quản lý tồn kho</li>
              <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs bg-white text-gray-900">Ctrl+D</kbd> Quản lý đại lý</li>
              <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs bg-white text-gray-900">Ctrl+R</kbd> Báo cáo</li>
              <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs bg-white text-gray-900">F5</kbd> Làm mới trang</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Thống kê tổng quan</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tồn kho:</span>
                <span className="font-medium text-emerald-600">1,247 xe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã phân phối:</span>
                <span className="font-medium text-emerald-600">892 xe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số đại lý:</span>
                <span className="font-medium text-emerald-600">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Doanh thu tháng:</span>
                <span className="font-medium text-emerald-600">45.2M VNĐ</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EVMStaffSettings;
