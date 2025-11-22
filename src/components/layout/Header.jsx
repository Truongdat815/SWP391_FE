import { Bell, User, LogOut, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../store/slices/authSlice';
import { useLogoutMutation, useGetMeQuery, authApi } from '../../api/auth/authApi';

const Header = () => {
  const user = useAppSelector((state) => state.auth.user);
  const role = useAppSelector((state) => state.auth.role);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Fetch fresh user data, but only if authenticated
  const { data: userResponse } = useGetMeQuery(undefined, {
    skip: !isAuthenticated, // Skip if not authenticated
  });
  
  // Use fresh API data if available, otherwise fallback to Redux state
  const currentUser = userResponse?.data || user;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Gọi logout API với token để revoke token trên server
      await logoutApi().unwrap();
      console.log('✅ Logout API successful - token revoked on server');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Logout API error:', error);
      }
      // Vẫn tiếp tục logout locally dù API fail
    } finally {
      // Clear auth state và storage
      dispatch(logout());
      
      // Clear API cache
      dispatch(authApi.util.resetApiState());
      
      // Set logout flag to prevent auto-restore
      localStorage.setItem('_logout_flag', Date.now().toString());
      
      // Force clear any remaining auth data
      const allRoles = ['ADMIN', 'DEALER_STAFF', 'DEALER_MANAGER', 'EVM_STAFF'];
      allRoles.forEach(role => {
        localStorage.removeItem(`auth_${role}`);
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth_default');
      
      // Clear sessionStorage as well
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.clear();
      }
      
      // Close dropdown
      setShowDropdown(false);
      
      // Force page reload to ensure clean state - use window.location.href for complete reload
      window.location.href = '/login';
    }
  };

  // Mapping route paths to titles
  const getPageTitle = () => {
    const path = location.pathname;
    
    // Admin routes
    if (path.includes('/admin/dashboard')) return 'Dashboard Tổng quan';
    if (path.includes('/admin/accounts')) return 'Quản lý Người dùng';
    if (path.includes('/admin/branches')) return 'Quản lý Chi nhánh';
    
    // Dealer Staff routes
    if (path.includes('/dealer-staff/dashboard')) return 'Dashboard Tổng quan';
    if (path.includes('/dealer-staff/orders')) return 'Quản lý Đơn hàng';
    if (path.includes('/dealer-staff/customers')) return 'Quản lý Khách hàng';
    if (path.includes('/dealer-staff/quotation')) return 'Quản lý Báo giá';
    if (path.includes('/dealer-staff/products')) return 'Quản lý Sản phẩm';
    
    // Dealer Manager routes
    if (path.includes('/dealer-manager/dashboard')) return 'Dashboard Tổng quan';
    if (path.includes('/dealer-manager/inventory')) return 'Quản lý Kho hàng';
    if (path.includes('/dealer-manager/orders')) return 'Quản lý Đơn hàng';
    if (path.includes('/dealer-manager/promotions')) return 'Quản lý Khuyến mãi';
    if (path.includes('/dealer-manager/staff')) return 'Quản lý Nhân viên';
    
    // EVM Staff routes
    if (path.includes('/evm-staff/dashboard')) return 'Dashboard Tổng quan';
    if (path.includes('/evm-staff/products')) return 'Quản lý Sản phẩm';
    if (path.includes('/evm-staff/inventory')) return 'Quản lý Kho hàng';
    if (path.includes('/evm-staff/orders')) return 'Quản lý Đơn hàng';
    if (path.includes('/evm-staff/colors')) return 'Quản lý Màu sắc';
    
    // Default
    return 'Dashboard Tổng quan';
  };

  // Mapping route paths to subtitles
  const getPageSubtitle = () => {
    const path = location.pathname;
    
    if (path.includes('/admin/accounts')) {
      return 'Xem, tìm kiếm, và quản lý tất cả người dùng trong hệ thống';
    }
    
    if (path.includes('/admin/branches')) {
      return 'Xem, tìm kiếm, và quản lý tất cả các chi nhánh trong hệ thống';
    }
    
    return null;
  };

  const subtitle = getPageSubtitle();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h2>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.fullName || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500">
                  {currentUser?.roleName || 'Administrator'}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{currentUser?.fullName || 'User'}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email || ''}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // Navigate to change password if needed
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Settings size={16} />
                  Cài đặt
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

