import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const DealerManagerLayout = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Tổng quan', path: '/dealer-manager', icon: '📊' },
    { name: 'Tạo báo cáo', path: '/dealer-manager/tao-bao-cao', icon: '📝' },
    { name: 'Báo cáo doanh số', path: '/dealer-manager/bao-cao-doanh-so', icon: '💰' },
    { name: 'Quản lý nhân viên', path: '/dealer-manager/quan-ly-nhan-vien', icon: '👥' },
    { name: 'Quản lý công nợ', path: '/dealer-manager/quan-ly-cong-no', icon: '📋' },
    { name: 'Xuất báo cáo', path: '/dealer-manager/xuat-bao-cao', icon: '⚡' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">DM</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Dealer Manager Dashboard</h1>
                <p className="text-sm text-gray-500">Quản lý và báo cáo tổng quan</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/dealer-manager/tao-bao-cao"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Tạo báo cáo
              </Link>
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-700">Quản lý</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  location.pathname === item.path
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default DealerManagerLayout;
