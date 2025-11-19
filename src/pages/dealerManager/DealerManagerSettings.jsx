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
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3 md:p-4">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 mb-3 sm:mb-4 shadow-sm">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-12 gap-3 sm:gap-4">
          {/* Sidebar Navigation */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-4 sm:top-6">
              <nav className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                      activeSection === section.id
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg sm:text-xl flex-shrink-0">{section.icon}</span>
                    <span className="font-medium text-left truncate">{section.name}</span>
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
          <div className="col-span-12 lg:col-span-9 space-y-4">
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
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
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
                  </div>
                )}

                {/* THÔNG BÁO */}
                {activeSection === 'notifications' && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.notifications.title}</h2>
                      <p className="text-gray-600">{t.notifications.subtitle}</p>
                    </div>

                    {/* Kênh thông báo */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">{t.notifications.channelsTitle}</h3>
                      
                      <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-gray-800 font-medium">{t.notifications.emailTitle}</span>
                            <p className="text-sm text-gray-500">{t.notifications.emailDesc}</p>
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

                      <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-gray-800 font-medium">{t.notifications.systemTitle}</span>
                            <p className="text-sm text-gray-500">{t.notifications.systemDesc}</p>
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

                      <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-gray-800 font-medium">{t.notifications.browserTitle}</span>
                            <p className="text-sm text-gray-500">{t.notifications.browserDesc}</p>
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

                      <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                          </div>
                          <div>
                            <span className="text-gray-800 font-medium">{t.notifications.soundTitle}</span>
                            <p className="text-sm text-gray-500">{t.notifications.soundDesc}</p>
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
                      <h3 className="font-semibold text-gray-900">{t.notifications.typesTitle}</h3>
                      
                      <label className="flex items-center justify-between bg-gray-50 border rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition">
                        <div>
                          <span className="text-gray-800 font-medium">{t.notifications.newOrdersTitle}</span>
                          <p className="text-sm text-gray-500">{t.notifications.newOrdersDesc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifyNewOrders}
                          onChange={(e) => handleSettingChange('notifyNewOrders', e.target.checked)}
                          className="h-5 w-5 text-red-600 rounded focus:ring-red-500"
                        />
                      </label>

                      <label className="flex items-center justify-between bg-gray-50 border rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition">
                        <div>
                          <span className="text-gray-800 font-medium">{t.notifications.lowStockTitle}</span>
                          <p className="text-sm text-gray-500">{t.notifications.lowStockDesc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifyLowStock}
                          onChange={(e) => handleSettingChange('notifyLowStock', e.target.checked)}
                          className="h-5 w-5 text-red-600 rounded focus:ring-red-500"
                        />
                      </label>

                      <label className="flex items-center justify-between bg-gray-50 border rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition">
                        <div>
                          <span className="text-gray-800 font-medium">{t.notifications.employeeActionsTitle}</span>
                          <p className="text-sm text-gray-500">{t.notifications.employeeActionsDesc}</p>
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
                          <h3 className="font-semibold text-gray-900">{t.notifications.dailyDigestTitle}</h3>
                          <p className="text-sm text-gray-500">{t.notifications.dailyDigestDesc}</p>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t.notifications.sendTime}</label>
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
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.security.title}</h2>
                      <p className="text-gray-600">{t.security.subtitle}</p>
                    </div>

                    {/* Bảo mật */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{t.security.accountSecurityTitle}</h3>
                          <p className="text-sm text-gray-600 mb-3">{t.security.accountSecurityDesc}</p>
                          <button 
                            onClick={() => alert('Chức năng đổi mật khẩu')}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                          >
                            {t.security.changePassword}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Auto logout setting */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-4">
                        <div>
                          <p className="font-medium text-gray-800">{t.security.autoLogoutTitle}</p>
                          <p className="text-sm text-gray-500">{t.security.autoLogoutDesc}</p>
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
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t.security.sessionTimeout}</label>
                          <select
                            value={settings.sessionTimeout}
                            onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                            className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                          >
                            <option value={15}>{t.security.timeoutOptions['15']}</option>
                            <option value={30}>{t.security.timeoutOptions['30']}</option>
                            <option value={60}>{t.security.timeoutOptions['60']}</option>
                            <option value={120}>{t.security.timeoutOptions['120']}</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Lịch sử */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">{t.security.loggedInDevicesTitle} ({loginHistory.length})</h3>
                      <div className="space-y-3">
                        {loginHistory.map((session) => (
                          <div key={session.id} className="flex items-start justify-between border rounded-lg p-4 hover:bg-gray-50 transition">
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
                                      {t.security.activeStatus}
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
                                {t.security.logoutButton}
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
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.performance.title}</h2>
                      <p className="text-gray-600">{t.performance.subtitle}</p>
                    </div>

                    {/* Hiển thị */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">{t.performance.interfaceTitle}</h3>
                      
                      <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-4">
                        <div>
                          <p className="font-medium text-gray-800">{t.performance.animationsTitle}</p>
                          <p className="text-sm text-gray-500">{t.performance.animationsDesc}</p>
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

                      <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-4">
                        <div>
                          <p className="font-medium text-gray-800">{t.performance.autoLoadImagesTitle}</p>
                          <p className="text-sm text-gray-500">{t.performance.autoLoadImagesDesc}</p>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.performance.imageQuality}</label>
                        <select
                          value={settings.imageQuality}
                          onChange={(e) => handleSettingChange('imageQuality', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                          disabled={!settings.autoLoadImages}
                        >
                          <option value="high">{t.performance.imageQualityOptions.high}</option>
                          <option value="medium">{t.performance.imageQualityOptions.medium}</option>
                          <option value="low">{t.performance.imageQualityOptions.low}</option>
                        </select>
                      </div>
                    </div>

                    {/* Dữ liệu */}
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-semibold text-gray-900">{t.performance.paginationTitle}</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.performance.itemsPerPage}</label>
                        <select
                          value={settings.itemsPerPage}
                          onChange={(e) => handleSettingChange('itemsPerPage', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                        >
                          <option value={10}>{t.performance.itemsPerPageOptions['10']}</option>
                          <option value={25}>{t.performance.itemsPerPageOptions['25']}</option>
                          <option value={50}>{t.performance.itemsPerPageOptions['50']}</option>
                          <option value={100}>{t.performance.itemsPerPageOptions['100']}</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">{t.performance.itemsPerPageDesc}</p>
                      </div>
                    </div>

                    {/* Cache */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">{t.performance.cacheTitle}</h3>
                      <div className="bg-gray-50 border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              {t.performance.cacheDesc}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(t.performance.clearCacheConfirm)) {
                              alert(t.performance.clearCacheAlert);
                              // Logic clear cache
                            }
                          }}
                          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          {t.performance.clearCacheButton}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* DỮ LIỆU */}
                {activeSection === 'data' && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.data.title}</h2>
                      <p className="text-gray-600">{t.data.subtitle}</p>
                    </div>

                    {/* Xuất dữ liệu */}
                    <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2">{t.data.exportDataTitle}</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            {t.data.exportDataDesc}
                          </p>
                          <button
                            onClick={handleExportData}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          >
                            {t.data.exportDataButton}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Lưu trữ dữ liệu */}
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="font-semibold text-gray-900">{t.data.dataStorageTitle}</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t.data.dataRetention}</label>
                        <select
                          value={settings.dataRetention}
                          onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                        >
                          <option value={30}>{t.data.dataRetentionOptions['30']}</option>
                          <option value={60}>{t.data.dataRetentionOptions['60']}</option>
                          <option value={90}>{t.data.dataRetentionOptions['90']}</option>
                          <option value={180}>{t.data.dataRetentionOptions['180']}</option>
                          <option value={365}>{t.data.dataRetentionOptions['365']}</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">{t.data.dataRetentionDesc}</p>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-4">
                        <div>
                          <p className="font-medium text-gray-800">{t.data.autoBackupTitle}</p>
                          <p className="text-sm text-gray-500">{t.data.autoBackupDesc}</p>
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
                      <h3 className="font-semibold text-gray-900 mb-4">{t.data.deleteDataTitle}</h3>
                      <div className="space-y-3">
                        <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-1">{t.data.clearHistoryTitle}</p>
                              <p className="text-sm text-gray-600">{t.data.clearHistoryDesc}</p>
                            </div>
                            <button
                              onClick={handleClearHistory}
                              className="px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition whitespace-nowrap"
                            >
                              {t.data.clearHistoryButton}
                            </button>
                          </div>
                        </div>

                        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 mb-1">{t.data.deleteAccountTitle}</p>
                              <p className="text-sm text-gray-600">{t.data.deleteAccountDesc}</p>
                            </div>
                            <button
                              onClick={() => alert(t.data.deleteAccountAlert)}
                              className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition whitespace-nowrap"
                            >
                              {t.data.deleteAccountButton}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* GDPR Info */}
                    <div className="border-t pt-6">
                      <div className="bg-gray-50 border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{t.data.gdprInfoTitle}</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {t.data.gdprInfoList.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  {t.buttons.reset}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    {t.buttons.cancel}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!unsavedChanges}
                    className={`px-4 py-2 rounded-lg transition ${
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

