import React, { useState } from 'react';

const AdminSettings = ({ onBack }) => {
  const [settings, setSettings] = useState({
    darkMode: false,
    emailNotifications: true,
    systemNotifications: true,
    autoLogout: true,
    sessionTimeout: 30,
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh'
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
      <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-2xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-gray-600 mt-1">Tùy chỉnh cài đặt quản trị viên và bảo mật hệ thống</p>
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
                    settings.darkMode ? 'bg-red-600' : 'bg-gray-300'
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                  <div className="h-9 w-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">Thông báo Email</span>
                    <p className="text-sm text-gray-500">Nhận cảnh báo qua email</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  className="h-5 w-5 text-red-600 rounded focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
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
                  className="h-5 w-5 text-red-600 rounded focus:ring-red-500"
                />
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
                    settings.autoLogout ? 'bg-red-600' : 'bg-gray-300'
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
              className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition shadow-sm"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>

        <aside className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900">Mẹo bảo mật</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Luôn đăng xuất khi rời khỏi máy tính</li>
            <li>• Sử dụng mật khẩu mạnh và thay đổi định kỳ</li>
            <li>• Không chia sẻ thông tin đăng nhập</li>
            <li>• Báo cáo ngay các hoạt động đáng ngờ</li>
          </ul>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Phím tắt hữu ích</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+/</kbd> Mở tìm kiếm</li>
              <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+E</kbd> Xuất dữ liệu</li>
              <li><kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">F5</kbd> Làm mới trang</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminSettings;
