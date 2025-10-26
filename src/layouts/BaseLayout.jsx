import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// Component hiển thị thời gian thực
const RealTimeClock = ({ roleKey = 'dealer-manager' }) => {
  const [time, setTime] = useState(new Date());
  const [timeFormat, setTimeFormat] = useState('24h');

  useEffect(() => {
    // Load time format từ localStorage
    try {
      const saved = localStorage.getItem(`${roleKey}-settings`);
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.timeFormat) {
          setTimeFormat(settings.timeFormat);
        }
      }
    } catch (error) {
      console.error('Error loading time format:', error);
    }

    // Update time mỗi giây
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [roleKey]);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (timeFormat === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-medium tabular-nums">{formatTime(time)}</span>
    </div>
  );
};

/**
 * BaseLayout - Layout component dùng chung cho tất cả role layouts
 * Loại bỏ code trùng lặp giữa Admin, EVM Staff, Dealer Manager, Dealer Staff layouts
 */
const BaseLayout = ({
  menuItems = [],
  brandColor = 'red', // 'red' | 'emerald'
  roleLabel = 'Panel',
  userInfo = {
    initials: 'U',
    name: 'User',
    email: 'user@electra.vn',
    role: 'Role',
  },
  basePath = '',
  defaultTitle = 'Dashboard',
  defaultSubtitle = 'Tổng quan hệ thống',
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    navigate('/signin');
  };

  const currentMenu = menuItems.find(m => m.path === location.pathname);

  // Color classes based on brandColor
  const colorClasses = {
    active: brandColor === 'red' 
      ? 'bg-red-100 text-red-700 border border-red-200'
      : 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    iconBg: brandColor === 'red' ? 'bg-red-600' : 'bg-emerald-600',
    avatarGradient: brandColor === 'red' 
      ? 'bg-gradient-to-r from-red-600 to-red-700'
      : 'bg-emerald-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex w-full">
      {/* Sidebar */}
      <motion.div 
        animate={{ 
          width: sidebarCollapsed ? 64 : 256 
        }}
        transition={{ 
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1] // cubic-bezier cho smooth animation
        }}
        className="bg-white shadow-lg border-r border-gray-200 flex flex-col relative flex-shrink-0"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center overflow-hidden">
                  <img 
                    src="/src/assets/images/logo.png" 
                    alt="Electra Logo" 
                    className="h-8 w-auto mr-3 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/120x40/${brandColor === 'red' ? 'EF4444' : '10B981'}/FFFFFF?text=ELECTRA`;
                    }}
                  />
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 truncate">Electra</h1>
                    <p className="text-sm text-gray-600 truncate">{roleLabel}</p>
                  </div>
                </div>
                <motion.button
                  aria-label="Toggle sidebar"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-md hover:bg-gray-100 text-gray-600 flex-shrink-0 ml-2"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    animate={{ rotate: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col items-center space-y-3"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <img 
                    src="/src/assets/images/logo.png" 
                    alt="Electra Logo" 
                    className="h-10 w-10 object-contain"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/40x40/${brandColor === 'red' ? 'EF4444' : '10B981'}/FFFFFF?text=E`;
                    }}
                  />
                </div>
                <motion.button
                  aria-label="Toggle sidebar"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    animate={{ rotate: 180 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Menu */}
        <nav className={`flex-1 ${sidebarCollapsed ? 'px-2 py-4' : 'p-4'} overflow-visible`}>
          <ul className="space-y-2 relative">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              
              return (
                <motion.li 
                  key={item.path} 
                  className="relative"
                  initial={false}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center justify-center rounded-lg relative overflow-hidden ${
                      sidebarCollapsed 
                        ? 'w-12 h-12' 
                        : 'w-full p-3 justify-start'
                    }`}
                  >
                    {/* Animated Background with Gradient */}
                    <motion.div
                      className={`absolute inset-0 rounded-lg ${
                        isActive 
                          ? brandColor === 'red'
                            ? 'bg-gradient-to-r from-red-50 via-red-100 to-red-50'
                            : 'bg-gradient-to-r from-emerald-50 via-emerald-100 to-emerald-50'
                          : 'bg-transparent'
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ 
                        opacity: isActive ? 1 : 0,
                        scale: isActive ? 1 : 0.9
                      }}
                      transition={{
                        duration: 0.3,
                        ease: [0.34, 1.56, 0.64, 1]
                      }}
                    />
                    
                    {/* Glow Effect */}
                    {isActive && (
                      <motion.div
                        className={`absolute inset-0 rounded-lg ${
                          brandColor === 'red'
                            ? 'shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                            : 'shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                        }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0.7] }}
                        transition={{
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                      />
                    )}
                    
                    {/* Left Border Accent */}
                    <motion.div
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                        brandColor === 'red' ? 'bg-red-600' : 'bg-emerald-600'
                      }`}
                      initial={{ scaleY: 0, opacity: 0 }}
                      animate={{ 
                        scaleY: isActive ? 1 : 0,
                        opacity: isActive ? 1 : 0
                      }}
                      transition={{
                        duration: 0.3,
                        ease: [0.34, 1.56, 0.64, 1]
                      }}
                      style={{ originY: 0.5 }}
                    />
                    
                    {/* Icon with bounce animation */}
                    <motion.div 
                      className={`flex items-center justify-center relative z-10 ${sidebarCollapsed ? '' : 'mr-3'} ${
                        isActive 
                          ? brandColor === 'red' ? 'text-red-700' : 'text-emerald-700'
                          : 'text-gray-700'
                      }`}
                      animate={{
                        scale: isActive ? [1, 1.4, 1.05, 1] : 1,
                        rotate: isActive ? [0, -12, 12, -8, 8, 0] : 0
                      }}
                      whileHover={{ scale: 1.15, rotate: 8 }}
                      whileTap={{ scale: 0.85 }}
                      transition={{ 
                        scale: { 
                          duration: 0.6, 
                          ease: [0.34, 1.56, 0.64, 1],
                          times: [0, 0.3, 0.6, 1]
                        },
                        rotate: { 
                          duration: 0.7, 
                          ease: "easeInOut",
                          times: [0, 0.2, 0.4, 0.6, 0.8, 1]
                        }
                      }}
                    >
                      {item.icon}
                    </motion.div>
                    
                    {/* Text Label with slide effect */}
                    {!sidebarCollapsed && (
                      <motion.span 
                        className={`font-semibold whitespace-nowrap relative z-10 ${
                          isActive 
                            ? brandColor === 'red' ? 'text-red-700' : 'text-emerald-700'
                            : 'text-gray-700'
                        }`}
                        animate={{
                          x: isActive ? [0, 5, 0] : 0,
                          fontWeight: isActive ? 600 : 500
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                    
                    {/* Hover Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gray-100 rounded-lg -z-10"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: isActive ? 0 : 0.5 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentMenu?.name || defaultTitle}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {location.pathname === basePath ? defaultSubtitle : 'Quản lý và thao tác'}
              </p>
            </div>
            {/* Real-time Clock & User Profile */}
            <div className="flex items-center gap-3">
              {/* Real-time Clock */}
              <RealTimeClock roleKey={basePath.replace('/', '')} />
              
              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors active:scale-[0.98]"
                >
                  <div className={`h-8 w-8 ${colorClasses.avatarGradient} rounded-full flex items-center justify-center shadow-md`}>
                    <span className="text-white font-bold text-sm">{userInfo.initials}</span>
                  </div>
                   <div className="text-left hidden sm:block">
                     <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                     <p className="text-xs text-gray-500">{userInfo.role}</p>
                   </div>
                  <svg 
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ 
                      duration: 0.2,
                      ease: [0.4, 0, 0.2, 1] // cubic-bezier cho smooth animation
                    }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 origin-top-right"
                  >
                    <div className="py-1">
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05, duration: 0.2 }}
                        className="px-4 py-3 border-b border-gray-100"
                      >
                        <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                        <p className="text-sm text-gray-500">{userInfo.email}</p>
                        <p className="text-xs text-gray-400">{userInfo.role}</p>
                      </motion.div>
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08, duration: 0.2 }}
                        whileHover={{ x: 4, backgroundColor: 'rgb(243, 244, 246)' }}
                        onClick={() => { setIsDropdownOpen(false); navigate(`${basePath}/profile`); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Thông tin cá nhân
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.11, duration: 0.2 }}
                        whileHover={{ x: 4, backgroundColor: 'rgb(243, 244, 246)' }}
                        onClick={() => { setIsDropdownOpen(false); navigate(`${basePath}/settings`); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Cài đặt
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.14, duration: 0.2 }}
                        whileHover={{ x: 4, backgroundColor: 'rgb(243, 244, 246)' }}
                        onClick={() => { setIsDropdownOpen(false); navigate(`${basePath}/help`); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Trợ giúp
                      </motion.button>
                      <div className="border-t border-gray-100"></div>
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.17, duration: 0.2 }}
                        whileHover={{ x: 4, backgroundColor: 'rgb(254, 242, 242)' }}
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                      </motion.button>
                    </div>
                  </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Routed Content */}
        <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8 overflow-auto w-full">
          <div className="max-w-7xl mx-auto">
            <div className="relative min-h-[500px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 w-full"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseLayout;

