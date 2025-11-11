import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { getAllTransactionsThunk } from '../store/slices/inventoryTransactionSlice';
import { getAllStoreStocksThunk } from '../store/slices/store-stockSlice';
import { useAuth } from '../contexts/AuthContext';

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

// Helper function để format thời gian
const formatTimeAgo = (date) => {
  if (!date) return 'Vừa xong';
  
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return new Date(date).toLocaleDateString('vi-VN');
};

// Component NotificationBell với hiệu ứng đẹp mắt
const NotificationBell = ({ brandColor = 'red', basePath = '', onNotificationClick }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const transactions = useSelector((state) => state.inventoryTransactions.items);
  const storeStocks = useSelector((state) => state.storeStocks.items);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const notificationRef = useRef(null);

  // Load notifications dựa trên role
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        
        // Load transactions and storeStocks
        await Promise.all([
          dispatch(getAllTransactionsThunk()).unwrap(),
          dispatch(getAllStoreStocksThunk()).unwrap()
        ]);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Tính notification count và list dựa trên role
  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setNotificationCount(0);
      setNotifications([]);
      return;
    }

    let count = 0;
    let notificationList = [];

    // Logic khác nhau cho từng role
    if (basePath.includes('/evm-staff')) {
      // EVM Staff: Nhận notification về pending orders từ dealers
      const pendingOrders = transactions.filter(t => {
        const statusUpper = (t.status || '').toUpperCase();
        return statusUpper === 'PENDING' || statusUpper === 'REQUESTED';
      });
      
      count = pendingOrders.length;
      notificationList = pendingOrders.map(order => ({
        id: order.inventoryId || order.id,
        type: 'order_request',
        title: 'Yêu cầu đặt hàng mới',
        message: `Đơn hàng #${order.inventoryId || order.id} đang chờ xử lý`,
        time: order.transactionDate ? new Date(order.transactionDate) : new Date(),
        unread: true
      }));
    } else if (basePath.includes('/dealer-manager')) {
      // Dealer Manager: Nhận notification về order status updates
      const myStoreId = user?.storeId;
      const myStockIds = new Set(storeStocks
        .filter(s => s.storeId === myStoreId)
        .map(s => s.stockId)
      );
      
      const relevantTransactions = transactions.filter(t => {
        const statusUpper = (t.status || '').toUpperCase();
        const isCompleted = statusUpper === 'COMPLETED';
        const isProcessing = statusUpper === 'PROCESSING';
        const isRejected = statusUpper === 'REJECTED';
        const belongsToMyStore = myStockIds.has(t.storeStockId) || 
                                 (t.storeStock && t.storeStock.storeId === myStoreId);
        
        return (isCompleted || isProcessing || isRejected) && belongsToMyStore;
      });
      
      count = relevantTransactions.length;
      notificationList = relevantTransactions.map(t => {
        const statusUpper = (t.status || '').toUpperCase();
        if (statusUpper === 'COMPLETED') {
          return {
            id: t.inventoryId || t.id,
            type: 'inventory_completed',
            title: '✅ Xe đã được nhập kho',
            message: `${t.importQuantity} xe đã được thêm vào kho thành công`,
            time: t.transactionDate ? new Date(t.transactionDate) : new Date(),
            unread: true
          };
        } else if (statusUpper === 'PROCESSING') {
          return {
            id: t.inventoryId || t.id,
            type: 'order_processing',
            title: '⏳ Đơn hàng đang xử lý',
            message: `Đơn hàng #${t.inventoryId || t.id} đang được EVM xử lý`,
            time: t.transactionDate ? new Date(t.transactionDate) : new Date(),
            unread: true
          };
        } else if (statusUpper === 'REJECTED') {
          return {
            id: t.inventoryId || t.id,
            type: 'order_rejected',
            title: '❌ Yêu cầu bị từ chối',
            message: `Yêu cầu đặt hàng #${t.inventoryId || t.id} đã bị EVM từ chối`,
            time: t.transactionDate ? new Date(t.transactionDate) : new Date(),
            unread: true
          };
        }
        return null;
      }).filter(n => n !== null);
    } else if (basePath.includes('/dealer-staff')) {
      // Dealer Staff: Nhận notification về order status updates từ Manager
      // Manager gửi request → EVM duyệt/từ chối → Staff nhận thông báo
      const myStoreId = user?.storeId;
      const myStockIds = new Set(storeStocks
        .filter(s => s.storeId === myStoreId)
        .map(s => s.stockId)
      );
      
      const relevantTransactions = transactions.filter(t => {
        const statusUpper = (t.status || '').toUpperCase();
        const isCompleted = statusUpper === 'COMPLETED';
        const isProcessing = statusUpper === 'PROCESSING';
        const isRejected = statusUpper === 'REJECTED';
        const belongsToMyStore = myStockIds.has(t.storeStockId) || 
                                 (t.storeStock && t.storeStock.storeId === myStoreId);
        
        return (isCompleted || isProcessing || isRejected) && belongsToMyStore;
      });
      
      count = relevantTransactions.length;
      notificationList = relevantTransactions.map(t => {
        const statusUpper = (t.status || '').toUpperCase();
        if (statusUpper === 'COMPLETED') {
          return {
            id: t.inventoryId || t.id,
            type: 'inventory_completed',
            title: '✅ Xe đã được nhập kho',
            message: `${t.importQuantity} xe đã được thêm vào kho thành công`,
            time: t.transactionDate ? new Date(t.transactionDate) : new Date(),
            unread: true
          };
        } else if (statusUpper === 'PROCESSING') {
          return {
            id: t.inventoryId || t.id,
            type: 'order_processing',
            title: '⏳ Đơn hàng đang xử lý',
            message: `Đơn hàng #${t.inventoryId || t.id} đang được EVM xử lý`,
            time: t.transactionDate ? new Date(t.transactionDate) : new Date(),
            unread: true
          };
        } else if (statusUpper === 'REJECTED') {
          return {
            id: t.inventoryId || t.id,
            type: 'order_rejected',
            title: '❌ Yêu cầu bị từ chối',
            message: `Yêu cầu đặt hàng #${t.inventoryId || t.id} đã bị EVM từ chối`,
            time: t.transactionDate ? new Date(t.transactionDate) : new Date(),
            unread: true
          };
        }
        return null;
      }).filter(n => n !== null);
    } else if (basePath.includes('/admin')) {
      // Admin: System alerts
      count = 0;
      notificationList = [];
    }

    setNotificationCount(count);
    setNotifications(notificationList.sort((a, b) => b.time - a.time));
  }, [transactions, storeStocks, basePath, user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Animation khi có notification mới
  const [justReceived, setJustReceived] = useState(false);
  const prevCountRef = useRef(0);
  
  useEffect(() => {
    if (notificationCount > prevCountRef.current && prevCountRef.current > 0) {
      setJustReceived(true);
      const timer = setTimeout(() => setJustReceived(false), 1000);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = notificationCount;
  }, [notificationCount]);

  const brandStyles = brandColor === 'red' 
    ? { 
        icon: 'text-red-600', 
        badge: 'bg-gradient-to-r from-red-500 to-red-600',
        hover: 'hover:bg-red-50',
        ring: 'ring-red-200'
      }
    : { 
        icon: 'text-emerald-600', 
        badge: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
        hover: 'hover:bg-emerald-50',
        ring: 'ring-emerald-200'
      };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Button với nhiều hiệu ứng */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          onNotificationClick?.();
        }}
        className={`relative p-2.5 rounded-xl transition-all ${brandStyles.hover}`}
      >
        {/* Icon bell với nhiều animation */}
        <motion.div
          animate={justReceived ? {
            rotate: [0, -25, 25, -25, 25, -15, 15, 0],
            scale: [1, 1.2, 1, 1.1, 1]
          } : {}}
          transition={{ 
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          <svg 
            className={`h-6 w-6 ${brandStyles.icon} transition-colors`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth="2"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
            />
          </svg>
        </motion.div>
        
        {/* Badge với animation */}
        {notificationCount > 0 && (
          <>
            {/* Pulse effect */}
            <motion.div
              className={`absolute -top-0.5 -right-0.5 h-6 w-6 rounded-full ${brandStyles.badge}`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Badge number */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
              }}
              className={`absolute -top-0.5 -right-0.5 h-6 w-6 rounded-full ${brandStyles.badge} flex items-center justify-center text-xs font-bold text-white shadow-lg`}
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </motion.div>
          </>
        )}
      </motion.button>

      {/* Dropdown với animation đẹp */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            
            {/* Dropdown panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden origin-top-right"
            >
              {/* Header với gradient */}
              <div className={`p-4 bg-gradient-to-r ${
                brandColor === 'red' 
                  ? 'from-red-500 to-red-600' 
                  : 'from-emerald-500 to-emerald-600'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ 
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      🔔
                    </motion.div>
                    Thông báo
                  </h3>
                  {notificationCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-white text-red-600 text-xs font-bold px-2 py-1 rounded-full"
                    >
                      {notificationCount} mới
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Notification list */}
              <div className="overflow-y-auto max-h-[400px]">
                {notificationCount === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-12 text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Không có thông báo mới</p>
                    <p className="text-sm text-gray-400 mt-1">Chúng tôi sẽ thông báo cho bạn khi có cập nhật</p>
                  </motion.div>
                ) : (
                  <motion.div className="divide-y divide-gray-100">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            notification.unread 
                              ? 'bg-blue-100' 
                              : 'bg-gray-100'
                          }`}>
                                   {notification.type === 'order_request' ? '🟢' : 
                                    notification.type === 'inventory_request' ? '🔵' :
                                    notification.type === 'inventory_completed' ? '✅' :
                                    notification.type === 'order_processing' ? '⏳' :
                                    notification.type === 'order_rejected' ? '❌' : '🟢'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </p>
                              {notification.unread && (
                                <motion.span 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold"
                                >
                                  MỚI
                                </motion.span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimeAgo(notification.time)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 p-3 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Xem tất cả thông báo
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
  const { logout } = useAuth();
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
    logout(); // Clear tokens, user info, and Redux state
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
        <div className="border-b border-gray-200 h-[73px] flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center w-full px-4 h-full relative"
              >
                {/* Nút thu gọn ở trên */}
                <motion.button
                  aria-label="Thu gọn sidebar"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.1, backgroundColor: "rgb(243, 244, 246)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>
                
                {/* Logo và text ở dưới */}
                <div className="flex items-center justify-center mt-2">
                  <img 
                    src="/src/assets/images/logo.png" 
                    alt="Electra Logo" 
                    className="h-8 w-auto mr-3 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/120x40/${brandColor === 'red' ? 'EF4444' : '10B981'}/FFFFFF?text=ELECTRA`;
                    }}
                  />
                  <div className="min-w-0 flex flex-col justify-center">
                    <h1 className="text-xl font-bold text-gray-900 truncate leading-tight">Electra</h1>
                    <p className="text-sm text-gray-600 truncate leading-tight">{roleLabel}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center w-full space-y-3 px-2"
              >
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <img 
                    src="/src/assets/images/logo.png" 
                    alt="Electra Logo" 
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/40x40/${brandColor === 'red' ? 'EF4444' : '10B981'}/FFFFFF?text=E`;
                    }}
                  />
                </div>
                <motion.button
                  aria-label="Mở rộng sidebar"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                  whileHover={{ scale: 1.1, backgroundColor: "rgb(243, 244, 246)" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
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
                    className={`flex items-center rounded-lg relative overflow-hidden ${
                      sidebarCollapsed 
                        ? 'w-12 h-12 justify-center' 
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
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 w-full h-[73px] flex items-center">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentMenu?.name || defaultTitle}
              </h2>
             
            </div>
            {/* Real-time Clock & User Profile */}
            <div className="flex items-center gap-3">
              {/* Real-time Clock */}
              <RealTimeClock roleKey={basePath.replace('/', '')} />
              
              {/* Notification Bell */}
              <NotificationBell 
                brandColor={brandColor}
                basePath={basePath}
                onNotificationClick={() => {}}
              />
              
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

