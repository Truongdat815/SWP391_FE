import React, { useState, useEffect } from 'react';
import BaseLayout from './BaseLayout';
import { useAuth } from '../contexts/AuthContext';

const EVMStaffLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const [userInfo, setUserInfo] = useState({
    initials: 'N',
    name: 'EVM Staff',
    email: 'evm@electra.com',
    role: 'Nhân viên EVM',
  });

  // Load user data from session
  useEffect(() => {
    if (isAuthenticated && user && (user.roleName === 'EVM Staff' || user.roleName === 'Nhân viên hãng xe')) {
      const initials = user.fullName
        ? user.fullName.trim().charAt(0).toUpperCase()
        : 'N';
      
      setUserInfo({
        initials: initials,
        name: user.fullName || 'EVM Staff',
        email: user.email || 'evm@electra.com',
        role: 'Nhân viên EVM',
      });
    }
  }, [isAuthenticated, user]);

  const menuItems = [
    { 
      name: 'Tổng quan', 
      path: '/evm-staff/dashboard', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ) 
    },
    { 
      name: 'Quản lý sản phẩm', 
      path: '/evm-staff/product-management', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ) 
    },
    { 
      name: 'Quản lý xe', 
      path: '/evm-staff/vehicle-management', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ) 
    },
    { 
      name: 'Đơn hàng đại lý', 
      path: '/evm-staff/dealer-orders', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ) 
    },
    { 
      name: 'Quản lý màu sắc', 
      path: '/evm-staff/color-management', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ) 
    },
    { 
      name: 'Báo cáo bán hàng', 
      path: '/evm-staff/sales-report', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ) 
    }
  ];

  return (
    <BaseLayout
      menuItems={menuItems}
      brandColor="emerald"
      roleLabel="EVM Staff"
      userInfo={userInfo}
      basePath="/evm-staff"
      defaultTitle="Quản lý EVM"
      defaultSubtitle="Quản lý sản phẩm và phân phối"
    />
  );
};

export default EVMStaffLayout;
