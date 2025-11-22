import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Calendar,
  Car,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  HelpCircle,
  Search,
  FileText,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Plus,
  Package,
  MessageSquare,
} from 'lucide-react';
import { useLogoutMutation } from '../../api/auth/authApi';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../store/slices/authSlice';
import SearchBar from '../shared/SearchBar';
import UserProfileAvatar from '../shared/UserProfileAvatar';

const DealerStaffLayout = ({ children, title, description }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMenu, setExpandedMenu] = useState('orders'); // Track which submenu is expanded

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
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dealer-staff/dashboard' },
    {
      icon: ShoppingCart,
      label: 'Đơn hàng',
      path: '/dealer-staff/orders',
      submenu: [
        { icon: ShoppingCart, label: 'Danh sách đơn hàng', path: '/dealer-staff/orders' },
        { icon: Plus, label: 'Tạo đơn hàng mới', path: '/dealer-staff/orders/create' },
      ]
    },

    { icon: FileText, label: 'Hợp đồng', path: '/dealer-staff/contracts' },
    { icon: CreditCard, label: 'Thanh toán', path: '/dealer-staff/payments' },
    { icon: Users, label: 'Khách hàng', path: '/dealer-staff/customers' },
    { icon: Car, label: 'Sản phẩm', path: '/dealer-staff/products' },
    { icon: Package, label: 'Kho hàng', path: '/dealer-staff/storestock' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Determine title: prop > menu match > default
  const pageTitle = title || menuItems.find((item) => item.path === location.pathname)?.label ||
    menuItems.flatMap(i => i.submenu || []).find(sub => sub.path === location.pathname)?.label ||
    'Dashboard';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-64' : 'w-0'
          } bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}
      >
        {/* User Profile */}
        <div className="p-6 border-b border-gray-200">
          <UserProfileAvatar size="default" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isExpanded = expandedMenu === item.path.split('/').pop();
              const isSubmenuActive = hasSubmenu && item.submenu.some(sub => location.pathname === sub.path);

              return (
                <li key={item.path}>
                  {hasSubmenu ? (
                    <>
                      <button
                        onClick={() => setExpandedMenu(isExpanded ? null : item.path.split('/').pop())}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${isSubmenuActive
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </div>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      {isExpanded && (
                        <ul className="mt-1 ml-4 space-y-1">
                          {item.submenu.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = location.pathname === subItem.path;
                            return (
                              <li key={subItem.path}>
                                <Link
                                  to={subItem.path}
                                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${isSubActive
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                  <SubIcon size={16} />
                                  <span>{subItem.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {pageTitle}
              </h1>
              {description && (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-4 flex-1 justify-end">
              <div className="flex-1 max-w-md">
                <SearchBar
                  placeholder="Tìm kiếm khách hàng, đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <HelpCircle size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <Users size={20} className="text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
};

export default DealerStaffLayout;

