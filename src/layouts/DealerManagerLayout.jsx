import React, { useState, useEffect } from 'react';
import BaseLayout from './BaseLayout';
import { useAuth } from '../contexts/AuthContext';

const DealerManagerLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const [userInfo, setUserInfo] = useState({
    initials: 'Q',
    name: 'Dealer Manager',
    email: 'manager@electra.com',
    role: 'Quản lý đại lý',
  });

  // Load user data from session
  useEffect(() => {
    if (isAuthenticated && user && (user.roleName === 'Dealer Manager' || user.roleName === 'Quản lý cửa hàng')) {
      const initials = user.fullName
        ? user.fullName.trim().charAt(0).toUpperCase()
        : 'Q';
      
      setUserInfo({
        initials: initials,
        name: user.fullName || 'Dealer Manager',
        email: user.email || 'manager@electra.com',
        role: 'Quản lý đại lý',
      });
    }
  }, [isAuthenticated, user]);

  const menuItems = [
    { 
      name: 'Quản lý kho', 
      path: '/dealer-manager/inventory', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-3V3H9v2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4" />
        </svg>
      ) 
    },
    { 
      name: 'Quản lý khuyến mãi', 
      path: '/dealer-manager/promotion-management', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ) 
    },
    { 
      name: 'Tạo báo cáo', 
      path: '/dealer-manager/tao-bao-cao', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ) 
    },
    { 
      name: 'Quản lý nhân viên', 
      path: '/dealer-manager/quan-ly-nhan-vien', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ) 
    },
    { 
      name: 'Quản lý công nợ', 
      path: '/dealer-manager/quan-ly-cong-no', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ) 
    }
  ];

  return (
    <BaseLayout
      menuItems={menuItems}
      brandColor="red"
      roleLabel="Dealer Manager"
      userInfo={userInfo}
      basePath="/dealer-manager"
      defaultTitle="Dealer Manager Dashboard"
      defaultSubtitle="Tổng quan hệ thống"
    />
  );
};

export default DealerManagerLayout;
