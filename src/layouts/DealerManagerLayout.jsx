import React from 'react';
import BaseLayout from './BaseLayout';

const DealerManagerLayout = () => {
  const menuItems = [
    { 
      name: 'Tổng quan', 
      path: '/dealer-manager', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
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
      userInfo={{
        initials: 'QL',
        name: 'Nguyễn Văn A',
        email: 'manager@electra.com',
        role: 'Quản lý đại lý',
      }}
      basePath="/dealer-manager"
      defaultTitle="Dealer Manager Dashboard"
      defaultSubtitle="Tổng quan hệ thống"
    />
  );
};

export default DealerManagerLayout;
