import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../store/slices/authSlice';
import { useLogoutMutation } from '../../api/auth/authApi';
import SessionInfo from '../shared/SessionInfo';

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/accounts', label: 'Quản lý Người dùng', icon: Users },
    { path: '/admin/branches', label: 'Quản lý Chi nhánh', icon: Building2 },
  ];

  const handleLogout = async () => {
    try {
      // Gọi logout API với token để revoke token trên server
      await logoutMutation().unwrap();
      console.log('✅ Logout API successful - token revoked on server');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Logout API error:', error);
      }
      // Vẫn tiếp tục logout locally dù API fail
    } finally {
      // Clear auth state và storage
      dispatch(logout());
      // Redirect to login
      window.location.href = '/login';
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 relative`}>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
        title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="text-gray-600" />
        ) : (
          <ChevronLeft size={14} className="text-gray-600" />
        )}
      </button>

      <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'px-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Electra</h1>
              <p className="text-xs text-gray-500">Hệ thống quản lý</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200">
        {!isCollapsed && <SessionInfo />}
        <div className="p-4 space-y-2">
          <button
            onClick={() => {}}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Cài đặt' : ''}
          >
            <Settings size={20} className="shrink-0" />
            {!isCollapsed && <span>Cài đặt</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? 'Đăng xuất' : ''}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

