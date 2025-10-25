import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dealerManagerTranslations } from '../../utils/translations';

const DealerManagerSettings = () => {
  const [activeSection, setActiveSection] = useState('language');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Load settings từ localStorage
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('dealer-manager-settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
    // Default settings
    return {
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      numberFormat: 'vi-VN',
      currencyDisplay: 'symbol',
      emailNotifications: true,
      systemNotifications: true,
      browserNotifications: false,
      soundEnabled: true,
      soundType: 'default',
      notifyNewOrders: true,
      notifyLowStock: true,
      notifyEmployeeActions: false,
      dailyDigest: true,
      digestTime: '18:00',
      autoLogout: true,
      sessionTimeout: 30,
      animationsEnabled: true,
      autoLoadImages: true,
      imageQuality: 'high',
      itemsPerPage: 25,
      dataRetention: 90,
      autoBackup: true,
    };
  };
  
  // State cho các settings
  const [settings, setSettings] = useState(loadSettings);

  // Get current language translations
  const t = dealerManagerTranslations[settings.language] || dealerManagerTranslations.vi;

  const [loginHistory, setLoginHistory] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'Hà Nội, Việt Nam', ip: '192.168.1.1', time: '2025-10-25 14:30', status: 'active' },
    { id: 2, device: 'Safari on iPhone', location: 'TP. Hồ Chí Minh', ip: '192.168.1.2', time: '2025-10-24 09:15', status: 'success' },
    { id: 3, device: 'Chrome on Windows', location: 'Hà Nội, Việt Nam', ip: '192.168.1.1', time: '2025-10-23 16:45', status: 'success' },
    { id: 4, device: 'Firefox on MacOS', location: 'Đà Nẵng, Việt Nam', ip: '192.168.1.3', time: '2025-10-22 10:20', status: 'success' },
  ]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    try {
      // Lưu vào localStorage
      localStorage.setItem('dealer-manager-settings', JSON.stringify(settings));
      setUnsavedChanges(false);
      alert(t.alerts.saveSuccess);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t.alerts.saveError);
    }
  };

  const handleReset = () => {
    if (confirm(t.alerts.resetConfirm)) {
      // Reset to default
      setUnsavedChanges(false);
    }
  };

  const handleExportData = () => {
    alert(t.alerts.exportData);
    // Logic xuất dữ liệu
  };

  const handleClearHistory = () => {
    if (confirm(t.alerts.clearHistoryConfirm)) {
      alert(t.alerts.historyCleared);
    }
  };

  const handleLogoutDevice = (deviceId) => {
    if (confirm(t.alerts.logoutDeviceConfirm)) {
      setLoginHistory(prev => prev.filter(item => item.id !== deviceId));
    }
  };

  const sections = [
    { id: 'language', name: t.sections.language, icon: '🌐' },
    { id: 'notifications', name: t.sections.notifications, icon: '🔔' },
    { id: 'security', name: t.sections.security, icon: '🔒' },
    { id: 'performance', name: t.sections.performance, icon: '⚡' },
    { id: 'data', name: t.sections.data, icon: '💾' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-2xl p-8 mb-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar Navigation */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm sticky top-6">
              <nav className="p-4 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeSection === section.id
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="font-medium text-left">{section.name}</span>
                  </button>
                ))}
              </nav>
              
              {unsavedChanges && (
                <div className="p-4 border-t border-gray-200">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                    ⚠️ {t.unsavedWarning}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* NGÔN NGỮ & ĐỊNH DẠNG */}
                {activeSection === 'language' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.language.title}</h2>
                      <p className="text-gray-600">{t.language.subtitle}</p>
                    </div>

                    {/* Ngôn ngữ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.language.displayLanguage}</label>
                        <select
                          value={settings.language}
                          onChange={(e) => handleSettingChange('language', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                        >
                          <option value="vi">🇻🇳 Tiếng Việt</option>
                          <option value="en">🇺🇸 English</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.language.timezone}</label>
                        <select
                          value={settings.timezone}
                          onChange={(e) => handleSettingChange('timezone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                        >
                          <option value="Asia/Ho_Chi_Minh">{t.language.timezones.hanoi}</option>
                          <option value="UTC">{t.language.timezones.gmt}</option>
                          <option value="Asia/Bangkok">{t.language.timezones.bangkok}</option>
                          <option value="Asia/Singapore">{t.language.timezones.singapore}</option>
                        </select>
                      </div>
                    </div>

                    {/* Định dạng ngày giờ */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">{t.language.dateTimeFormatTitle}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t.language.dateFormat}</label>
                          <select
                            value={settings.dateFormat}
                            onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                          >
                            <option value="DD/MM/YYYY">{t.language.dateFormats.ddmmyyyy}</option>
                            <option value="MM/DD/YYYY">{t.language.dateFormats.mmddyyyy}</option>
                            <option value="YYYY-MM-DD">{t.language.dateFormats.yyyymmdd}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t.language.timeFormat}</label>
                          <select
                            value={settings.timeFormat}
                            onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                          >
                            <option value="24h">{t.language.timeFormats['24h']}</option>
                            <option value="12h">{t.language.timeFormats['12h']}</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Định dạng số */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">{t.language.numberCurrencyTitle}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t.language.numberFormat}</label>
                          <select
                            value={settings.numberFormat}
                            onChange={(e) => handleSettingChange('numberFormat', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                          >
                            <option value="vi-VN">{t.language.numberFormats.vietnam}</option>
                            <option value="en-US">{t.language.numberFormats.international}</option>
                          </select>
                          <p className="text-sm text-gray-500 mt-1">{t.language.example}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t.language.currencyDisplay}</label>
                          <select
                            value={settings.currencyDisplay}
                            onChange={(e) => handleSettingChange('currencyDisplay', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                          >
                            <option value="symbol">{t.language.currencyDisplays.symbol}</option>
                            <option value="code">{t.language.currencyDisplays.code}</option>
                            <option value="name">{t.language.currencyDisplays.name}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* THÔNG BÁO */}
                {activeSection === 'notifications' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.notifications.title}</h2>
                      <p className="text-gray-600">{t.notifications.subtitle}</p>
                    </div>

                    {/* Kênh thông báo */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">{t.notifications.channelsTitle}</h3>
                      
                      <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-gray-800 font-medium">Thông báo Email</span>
                            <p className="text-sm text-gray-500">Nhận thông báo qua email</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.emailNotifications ? 'bg-red-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-gray-800 font-medium">Thông báo hệ thống</span>
                            <p className="text-sm text-gray-500">Hiển thị badge trên giao diện</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSettingChange('systemNotifications', !settings.systemNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.systemNotifications ? 'bg-red-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            settings.systemNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-gray-800 font-medium">Thông báo trình duyệt</span>
                            <p className="text-sm text-gray-500">Push notification desktop</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSettingChange('browserNotifications', !settings.browserNotifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.browserNotifications ? 'bg-red-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            settings.browserNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-gray-800 font-medium">Âm thanh thông báo</span>
                            <p className="text-sm text-gray-500">Phát âm thanh khi có thông báo mới</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.soundEnabled ? 'bg-red-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}></span>
                        </button>
                      </div>
                    </div>

                    {/* Loại thông báo */}
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-semibold text-gray-900">Loại thông báo nhận</h3>
                      
                      <label className="flex items-center justify-between bg-gray-50 border rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition">
                        <div>
                          <span className="text-gray-800 font-medium">Đơn hàng mới</span>
                          <p className="text-sm text-gray-500">Thông báo khi có đơn hàng mới từ nhân viên</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifyNewOrders}
                          onChange={(e) => handleSettingChange('notifyNewOrders', e.target.checked)}
                          className="h-5 w-5 text-red-600 rounded focus:ring-red-500"
                        />
                      </label>

                      <label className="flex items-center justify-between bg-gray-50 border rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition">
                        <div>
                          <span className="text-gray-800 font-medium">Cảnh báo tồn kho</span>
                          <p className="text-sm text-gray-500">Khi hàng tồn kho xuống dưới mức an toàn</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifyLowStock}
                          onChange={(e) => handleSettingChange('notifyLowStock', e.target.checked)}
                          className="h-5 w-5 text-red-600 rounded focus:ring-red-500"
                        />
                      </label>

                      <label className="flex items-center justify-between bg-gray-50 border rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition">
                        <div>
                          <span className="text-gray-800 font-medium">Hành động nhân viên</span>
                          <p className="text-sm text-gray-500">Thông báo các hành động quan trọng của nhân viên</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifyEmployeeActions}
                          onChange={(e) => handleSettingChange('notifyEmployeeActions', e.target.checked)}
                          className="h-5 w-5 text-red-600 rounded focus:ring-red-500"
                        />
                      </label>
                    </div>

                    {/* Tóm tắt hàng ngày */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">Email tóm tắt hàng ngày</h3>
                          <p className="text-sm text-gray-500">Nhận báo cáo tổng hợp cuối ngày</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('dailyDigest', !settings.dailyDigest)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.dailyDigest ? 'bg-red-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            settings.dailyDigest ? 'translate-x-6' : 'translate-x-1'
                          }`}></span>
                        </button>
                      </div>
                      
                      {settings.dailyDigest && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian gửi</label>
                          <input
                            type="time"
                            value={settings.digestTime}
                            onChange={(e) => handleSettingChange('digestTime', e.target.value)}
                            className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* LỊCH SỬ ĐĂNG NHẬP */}
                {activeSection === 'security' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Lịch sử đăng nhập</h2>
                      <p className="text-gray-600">Xem và quản lý các phiên đăng nhập của bạn</p>
                    </div>

                    {/* Bảo mật */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">Bảo mật tài khoản</h3>
                          <p className="text-sm text-gray-600 mb-3">Nếu bạn thấy hoạt động đáng ngờ, hãy đăng xuất khỏi các thiết bị không tin cậy và đổi mật khẩu ngay.</p>
                          <button 
                            onClick={() => alert('Chức năng đổi mật khẩu')}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            Đổi mật khẩu →
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Auto logout setting */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                        <div>
                          <p className="font-medium text-gray-800">Tự động đăng xuất</p>
                          <p className="text-sm text-gray-500">Đăng xuất tự động khi không hoạt động</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('autoLogout', !settings.autoLogout)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.autoLogout ? 'bg-red-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            settings.autoLogout ? 'translate-x-6' : 'translate-x-1'
                          }`}></span>
                        </button>
                      </div>

                      {settings.autoLogout && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian chờ (phút)</label>
                          <select
                            value={settings.sessionTimeout}
                            onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                            className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                          >
                            <option value={15}>15 phút</option>
                            <option value={30}>30 phút</option>
                            <option value={60}>1 giờ</option>
                            <option value={120}>2 giờ</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Lịch sử */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Thiết bị đã đăng nhập ({loginHistory.length})</h3>
                      <div className="space-y-3">
                        {loginHistory.map((session) => (
                          <div key={session.id} className="flex items-start justify-between border rounded-xl p-4 hover:bg-gray-50 transition">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                {session.device.includes('Windows') ? '💻' : 
                                 session.device.includes('iPhone') ? '📱' : 
                                 session.device.includes('MacOS') ? '🖥️' : '🌐'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900">{session.device}</p>
                                  {session.status === 'active' && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                      Đang hoạt động
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">{session.location}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {session.ip} • {session.time}
                                </p>
                              </div>
                            </div>
                            {session.status !== 'active' && (
                              <button
                                onClick={() => handleLogoutDevice(session.id)}
                                className="text-sm text-red-600 hover:text-red-700 font-medium ml-4"
                              >
                                Đăng xuất
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* HIỆU SUẤT */}
                {activeSection === 'performance' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Hiệu suất</h2>
                      <p className="text-gray-600">Tối ưu hóa tốc độ và hiệu suất hệ thống</p>
                    </div>

                    {/* Hiển thị */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Giao diện</h3>
                      
                      <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                        <div>
                          <p className="font-medium text-gray-800">Hiệu ứng chuyển động</p>
                          <p className="text-sm text-gray-500">Animations và transitions</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('animationsEnabled', !settings.animationsEnabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.animationsEnabled ? 'bg-red-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            settings.animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}></span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                        <div>
                          <p className="font-medium text-gray-800">Tự động tải hình ảnh</p>
                          <p className="text-sm text-gray-500">Hiển thị hình ảnh trong bảng</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('autoLoadImages', !settings.autoLoadImages)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.autoLoadImages ? 'bg-red-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            settings.autoLoadImages ? 'translate-x-6' : 'translate-x-1'
                          }`}></span>
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chất lượng hình ảnh</label>
                        <select
                          value={settings.imageQuality}
                          onChange={(e) => handleSettingChange('imageQuality', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                          disabled={!settings.autoLoadImages}
                        >
                          <option value="high">Cao (Tốt nhất, chậm hơn)</option>
                          <option value="medium">Trung bình (Cân bằng)</option>
                          <option value="low">Thấp (Nhanh nhất)</option>
                        </select>
                      </div>
                    </div>

                    {/* Dữ liệu */}
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-semibold text-gray-900">Phân trang</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số bản ghi mỗi trang</label>
                        <select
                          value={settings.itemsPerPage}
                          onChange={(e) => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                        >
                          <option value={10}>10 bản ghi</option>
                          <option value={25}>25 bản ghi</option>
                          <option value={50}>50 bản ghi</option>
                          <option value={100}>100 bản ghi (Có thể chậm)</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">Số lượng cao hơn có thể làm chậm trang</p>
                      </div>
                    </div>

                    {/* Cache */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Cache & Dữ liệu tạm</h3>
                      <div className="bg-gray-50 border rounded-xl p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              Cache giúp tải trang nhanh hơn. Xóa cache nếu bạn gặp vấn đề với dữ liệu cũ hoặc lỗi hiển thị.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm('Xóa cache? Trang sẽ tải lại sau khi xóa.')) {
                              alert('Đã xóa cache. Đang tải lại...');
                              // Logic clear cache
                            }
                          }}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          Xóa cache
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* DỮ LIỆU */}
                {activeSection === 'data' && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Dữ liệu & Quyền riêng tư</h2>
                      <p className="text-gray-600">Quản lý dữ liệu cá nhân và quyền riêng tư của bạn</p>
                    </div>

                    {/* Xuất dữ liệu */}
                    <div className="border border-blue-200 bg-blue-50 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">Xuất dữ liệu cá nhân</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Tải xuất toàn bộ dữ liệu cá nhân của bạn theo quy định GDPR. File sẽ được gửi qua email trong vòng 48 giờ.
                          </p>
                          <button
                            onClick={handleExportData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            Yêu cầu xuất dữ liệu
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Lưu trữ dữ liệu */}
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-semibold text-gray-900">Lưu trữ dữ liệu</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian lưu trữ lịch sử</label>
                        <select
                          value={settings.dataRetention}
                          onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                        >
                          <option value={30}>30 ngày</option>
                          <option value={60}>60 ngày</option>
                          <option value={90}>90 ngày</option>
                          <option value={180}>6 tháng</option>
                          <option value={365}>1 năm</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">Dữ liệu cũ hơn sẽ tự động xóa</p>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 border rounded-xl p-4">
                        <div>
                          <p className="font-medium text-gray-800">Sao lưu tự động</p>
                          <p className="text-sm text-gray-500">Backup dữ liệu hàng tuần</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange('autoBackup', !settings.autoBackup)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.autoBackup ? 'bg-red-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                          }`}></span>
                        </button>
                      </div>
                    </div>

                    {/* Xóa dữ liệu */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Xóa dữ liệu</h3>
                      <div className="space-y-3">
                        <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-1">Xóa lịch sử hoạt động</p>
                              <p className="text-sm text-gray-600">Xóa log hoạt động và lịch sử tìm kiếm</p>
                            </div>
                            <button
                              onClick={handleClearHistory}
                              className="px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition whitespace-nowrap"
                            >
                              Xóa lịch sử
                            </button>
                          </div>
                        </div>

                        <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-1">Xóa tài khoản</p>
                              <p className="text-sm text-gray-600">Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu</p>
                            </div>
                            <button
                              onClick={() => alert('Vui lòng liên hệ admin để xóa tài khoản')}
                              className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition whitespace-nowrap"
                            >
                              Xóa tài khoản
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* GDPR Info */}
                    <div className="border-t pt-6">
                      <div className="bg-gray-50 border rounded-xl p-4">
                        <h4 className="font-medium text-gray-900 mb-2">🔒 Quyền riêng tư của bạn</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Bạn có quyền truy cập và tải xuất dữ liệu cá nhân</li>
                          <li>• Bạn có quyền yêu cầu chỉnh sửa thông tin không chính xác</li>
                          <li>• Bạn có quyền yêu cầu xóa dữ liệu cá nhân</li>
                          <li>• Dữ liệu của bạn được mã hóa và bảo mật theo GDPR</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                >
                  {t.buttons.reset}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition"
                  >
                    {t.buttons.cancel}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!unsavedChanges}
                    className={`px-6 py-3 rounded-xl transition ${
                      unsavedChanges
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {t.buttons.save}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerManagerSettings;

