import React, { useState, useEffect } from 'react';
import BaseLayout from './BaseLayout';
import { useAuth } from '../contexts/AuthContext';

const EVMStaffLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const [userInfo, setUserInfo] = useState({
    initials: 'ES',
    name: 'EVM Staff',
    email: 'evm@electra.com',
    role: 'Nhân viên EVM',
  });

  // Load user data from session
  useEffect(() => {
    if (isAuthenticated && user && user.roleName === 'EVM Staff') {
      const initials = user.fullName
        ? user.fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase()
        : 'ES';
      
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
      path: '/evm-staff', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
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
      name: 'Quản lý kho', 
      path: '/evm-staff/inventory-management', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ) 
    },
    { 
      name: 'Quản lý đại lý', 
      path: '/evm-staff/dealer-management', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ) 
    },
    { 
      name: 'Quản lý hợp đồng', 
      path: '/evm-staff/contract-management', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ) 
    },
    { 
      name: 'Quản lý giá', 
      path: '/evm-staff/pricing-management', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
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
      defaultTitle="EVM Staff Dashboard"
      defaultSubtitle="Tổng quan sản phẩm và phân phối"
    />
  );
};

export default EVMStaffLayout;
