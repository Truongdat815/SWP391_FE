import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { evmStaffTranslations } from '../../utils/translations';

const EVMStaffSettings = () => {
  // ========== STATES ==========
  const [activeSection, setActiveSection] = useState('language');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  const [settings, setSettings] = useState({
    // Language & Format
    language: 'vi',
    timezone: 'UTC+7',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',

    // Notifications
    emailNotifications: true,
    systemNotifications: true,
    browserNotifications: false,
    soundEnabled: true,
    notifyNewOrders: true,
    notifyLowStock: true,
    notifyEmployeeActions: true,
    dailyDigest: true,
    digestTime: '18:00',

    // Security
    autoLogout: true,
    sessionTimeout: 30,

    // Performance
    animationsEnabled: true,
    autoLoadImages: true,
    imageQuality: 'medium',
    itemsPerPage: 25,

    // Data
    dataRetention: 90,
    autoBackup: true,
  });

  // Get translations based on current language
  const t = evmStaffTranslations[settings.language] || evmStaffTranslations.vi;

  // Mock login history
  const [loginHistory] = useState([
    {
      id: 1,
      device: 'Windows 11 - Chrome',
      location: 'Hà Nội, Việt Nam',
      ip: '117.2.143.56',
      time: '2 giờ trước',
      status: 'active'
    },
    {
      id: 2,
      device: 'iPhone 14 Pro - Safari',
      location: 'Hồ Chí Minh, Việt Nam',
      ip: '117.2.143.57',
      time: '1 ngày trước',
      status: 'inactive'
    },
  ]);

  const dropdownRef = useRef(null);

  const sections = [
    { id: 'language', name: t.sections.language, icon: '🌐' },
    { id: 'notifications', name: t.sections.notifications, icon: '🔔' },
    { id: 'security', name: t.sections.security, icon: '🔒' },
    { id: 'performance', name: t.sections.performance, icon: '⚡' },
    { id: 'data', name: t.sections.data, icon: '💾' },
  ];

  // ========== HANDLERS ==========
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setUnsavedChanges(true);
  };

  const handleSave = () => {
    try {
      localStorage.setItem('evm-staff-settings', JSON.stringify(settings));
      setUnsavedChanges(false);
      alert(t.alerts.saveSuccess);
      
      // Reload page để apply settings
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t.alerts.saveError);
    }
  };

  const handleReset = () => {
    if (confirm(t.alerts.resetConfirm)) {
      localStorage.removeItem('evm-staff-settings');
      window.location.reload();
    }
  };

  const handleExportData = () => {
    alert(t.alerts.exportData);
  };

  const handleClearHistory = () => {
    if (confirm(t.alerts.clearHistoryConfirm)) {
      alert(t.alerts.historyCleared);
    }
  };

  const handleLogoutDevice = (deviceId) => {
    if (confirm(t.alerts.logoutDeviceConfirm)) {
      alert(`Logged out device ${deviceId}`);
    }
  };

  // Load settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('evm-staff-settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setSettings(prev => ({ ...prev, ...parsed }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'evm-staff-settings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          setSettings(prev => ({ ...prev, ...newSettings }));
        } catch (error) {
          console.error('Error parsing settings:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-4 mb-4 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
          {unsavedChanges && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.082 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {t.unsavedWarning}
            </div>
          )}
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sticky top-4">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="text-sm">{section.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Same structure as AdminSettings/DealerStaffSettings but with blue theme */}
                {activeSection === 'language' && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.language.title}</h2>
                      <p className="text-gray-600">{t.language.subtitle}</p>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t.language.displayLanguage}</label>
                          <select value={settings.language} onChange={(e) => handleSettingChange('language', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                            <option value="vi">🇻🇳 Tiếng Việt</option>
                            <option value="en">🇬🇧 English</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t.language.timezone}</label>
                          <select value={settings.timezone} onChange={(e) => handleSettingChange('timezone', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                            <option value="UTC+7">{t.language.timezones.hanoi}</option>
                            <option value="UTC+0">{t.language.timezones.gmt}</option>
                            <option value="UTC+7-Bangkok">{t.language.timezones.bangkok}</option>
                            <option value="UTC+8">{t.language.timezones.singapore}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">{t.language.dateTimeFormatTitle}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t.language.dateFormat}</label>
                          <select value={settings.dateFormat} onChange={(e) => handleSettingChange('dateFormat', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                            <option value="DD/MM/YYYY">{t.language.dateFormats.ddmmyyyy}</option>
                            <option value="MM/DD/YYYY">{t.language.dateFormats.mmddyyyy}</option>
                            <option value="YYYY-MM-DD">{t.language.dateFormats.yyyymmdd}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t.language.timeFormat}</label>
                          <select value={settings.timeFormat} onChange={(e) => handleSettingChange('timeFormat', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                            <option value="24h">{t.language.timeFormats['24h']}</option>
                            <option value="12h">{t.language.timeFormats['12h']}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Placeholder for other sections */}
                {activeSection !== 'language' && (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                    <div className="text-center py-12">
                      <p className="text-gray-500">Section "{activeSection}" - Same structure as AdminSettings with blue theme</p>
                      <p className="text-sm text-gray-400 mt-2">Full implementation follows AdminSettings pattern</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mt-6">
              <div className="flex items-center justify-between">
                <button onClick={handleReset} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition">
                  {t.buttons.reset}
                </button>
                <div className="flex gap-3">
                  <button onClick={() => window.location.reload()} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition">
                    {t.buttons.cancel}
                  </button>
                  <button onClick={handleSave} disabled={!unsavedChanges} className={`px-4 py-2 rounded-xl transition ${unsavedChanges ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
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

export default EVMStaffSettings;
