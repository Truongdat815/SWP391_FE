import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { get } from '@/api/client';
import { useAuth } from '../../contexts/AuthContext';

const CommonProfile = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: 'User',
    email: 'user@electra.com',
    phone: '0900000000',
    role: 'Nhân viên',
    employeeId: 'NV001',
    department: 'Phòng ban',
    startDate: '2023-01-01'
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Xác định role dựa trên path
  const getRoleFromPath = (path) => {
    if (path.includes('/admin')) return 'Admin';
    if (path.includes('/evm-staff')) return 'EVM Staff';
    if (path.includes('/dealer-manager')) return 'Dealer Manager';
    if (path.includes('/dealer-staff')) return 'Dealer Staff';
    return 'User';
  };

  // Lấy thông tin user từ session
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        
        // Use authenticated user data first
        if (isAuthenticated && user) {
          setUserData(user);
          const initials = user.fullName
            ? user.fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase()
            : 'U';
          
          setFormData({
            name: user.fullName || 'User',
            email: user.email || 'user@electra.com',
            phone: user.phone || '0900000000',
            role: getRoleDisplayName(user.roleName),
            employeeId: `${user.roleName?.charAt(0) || 'U'}${user.userId?.toString().padStart(3, '0') || '001'}`,
            department: getDepartmentFromRole(user.roleName),
            startDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '2023-01-01'
          });
        } else {
          // Fallback: try to get user from API if no session
          const response = await get('/api/users/all');
          const users = response?.data?.data || [];
          
          const currentRole = getRoleFromPath(location.pathname);
          const userData = users.find(user => user.roleName === currentRole);
          
          if (userData) {
            setUserData(userData);
            const initials = userData.fullName
              ? userData.fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase()
              : 'U';
            
            setFormData({
              name: userData.fullName || 'User',
              email: userData.email || 'user@electra.com',
              phone: userData.phone || '0900000000',
              role: getRoleDisplayName(currentRole),
              employeeId: `${currentRole.charAt(0)}${userData.userId?.toString().padStart(3, '0') || '001'}`,
              department: getDepartmentFromRole(currentRole),
              startDate: userData.createdAt ? new Date(userData.createdAt).toISOString().split('T')[0] : '2023-01-01'
            });
          }
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [location.pathname, isAuthenticated, user]);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'Admin': return 'Quản trị viên hệ thống';
      case 'EVM Staff': return 'Nhân viên EVM';
      case 'Dealer Manager': return 'Quản lý đại lý';
      case 'Dealer Staff': return 'Nhân viên đại lý';
      default: return 'Nhân viên';
    }
  };

  const getDepartmentFromRole = (role) => {
    switch (role) {
      case 'Admin': return 'Quản lý hệ thống';
      case 'EVM Staff': return 'Phòng EVM';
      case 'Dealer Manager': return 'Quản lý đại lý';
      case 'Dealer Staff': return 'Đại lý';
      default: return 'Phòng ban';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Xử lý lưu thông tin
    alert('Thông tin đã được cập nhật thành công!');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-32 rounded-2xl mb-6"></div>
          <div className="bg-gray-200 h-96 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-2xl p-6 sm:p-8 shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-1 duration-300">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center ring-8 ring-white shadow">
            <span className="text-red-600 font-bold text-xl">
              {userData ? 
                (userData.fullName ? userData.fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase() : 'U') 
                : 'U'
              }
            </span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-gray-600">Cập nhật hồ sơ để đồng bộ trên toàn hệ thống</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 transition hover:shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input 
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên</label>
            <input 
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <input 
              name="role"
              value={formData.role}
              className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-500" 
              disabled 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
            <input 
              name="department"
              value={formData.department}
              className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-500" 
              disabled 
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu làm việc</label>
            <input 
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900" 
            />
          </div>
        </div>

        {/* Quyền hạn theo role */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quyền hạn hệ thống</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getRoleFromPath(location.pathname) === 'Admin' && (
              <>
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <svg className="h-5 w-5 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Quản lý người dùng</span>
                </div>
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <svg className="h-5 w-5 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Quản lý cửa hàng</span>
                </div>
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <svg className="h-5 w-5 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Giám sát & Logs</span>
                </div>
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <svg className="h-5 w-5 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Cấu hình hệ thống</span>
                </div>
              </>
            )}
            {getRoleFromPath(location.pathname) !== 'Admin' && (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <svg className="h-5 w-5 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">Quyền hạn theo vai trò</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">Lần cập nhật gần nhất: hôm nay</p>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition shadow-sm"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonProfile;


