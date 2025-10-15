import React, { useState, useEffect } from 'react';
import BaseLayout from './BaseLayout';
import { get } from '@/api/client';

const AdminLayout = () => {
  const [adminUser, setAdminUser] = useState({
    initials: 'AD',
    name: 'Admin User',
    email: 'admin@electra.com',
    role: 'Quản trị viên hệ thống',
  });

  // Lấy thông tin admin từ API
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await get('/api/users/all');
        const users = response?.data?.data || [];
        
        // Tìm user có role Admin
        const adminUserData = users.find(user => user.roleName === 'Admin');
        
        if (adminUserData) {
          const initials = adminUserData.fullName
            ? adminUserData.fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase()
            : 'AD';
          
          setAdminUser({
            initials: initials,
            name: adminUserData.fullName || 'Admin User',
            email: adminUserData.email || 'admin@electra.com',
            role: 'Quản trị viên hệ thống',
          });
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin admin:', error);
        // Giữ thông tin mặc định nếu có lỗi
      }
    };

    fetchAdminInfo();
  }, []);

  const menuItems = [
    { 
      name: 'Quản lý cửa hàng', 
      path: '/admin', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ) 
    },
    { 
      name: 'Quản lý người dùng', 
      path: '/admin/user-management', 
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ) 
    }
  ];

  return (
    <BaseLayout
      menuItems={menuItems}
      brandColor="red"
      roleLabel="Admin Panel"
      userInfo={adminUser}
      basePath="/admin"
      defaultTitle="Quản lý cửa hàng"
      defaultSubtitle="Quản lý đại lý và cửa hàng"
    />
  );
};

export default AdminLayout;
