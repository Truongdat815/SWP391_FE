import { Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';

const Header = () => {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

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
    if (path.includes('/dealer-staff/appointments')) return 'Quản lý Lịch hẹn';
    if (path.includes('/dealer-staff/quotation')) return 'Quản lý Báo giá';
    if (path.includes('/dealer-staff/products')) return 'Quản lý Sản phẩm';
    if (path.includes('/dealer-staff/reports')) return 'Báo cáo';
    
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.fullName || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.roleName || 'Administrator'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

