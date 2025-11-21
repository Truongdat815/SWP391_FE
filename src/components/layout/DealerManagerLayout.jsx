import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { useLogoutMutation } from '../../api/auth/authApi';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../store/slices/authSlice';

const DealerManagerLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      navigate('/login', { replace: true });
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/dealer-manager/dashboard' },
    { icon: ShoppingCart, label: 'Đơn hàng', path: '/dealer-manager/orders' },
    { icon: Package, label: 'Kho xe', path: '/dealer-manager/inventory' },
    { icon: Tag, label: 'Khuyến mãi', path: '/dealer-manager/promotions' },
    { icon: Users, label: 'Đội Ngũ', path: '/dealer-manager/staff' },
    { icon: Building2, label: 'Đại lý', path: '/dealer-manager/store' },
    { icon: BarChart3, label: 'Báo Cáo', path: '/dealer-manager/reports' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-0'
        } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Electra</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <Users size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Hoàng An</p>
              <p className="text-sm text-gray-500">Dealer Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
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
                        : 'text-gray-700 hover:bg-gray-100'
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

        {/* Settings & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings size={20} />
            <span>Cài Đặt</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut size={20} />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default DealerManagerLayout;

