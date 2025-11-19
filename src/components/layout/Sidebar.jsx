import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../store/slices/authSlice';
import { useLogoutMutation } from '../../api/auth/authApi';

const Sidebar = () => {
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
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      window.location.href = '/login';
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Electra</h1>
            <p className="text-xs text-gray-500">Hệ thống quản lý</p>
          </div>
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
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={() => {}}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Settings size={20} />
          <span>Cài đặt</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

