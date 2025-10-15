import React, { useState, useEffect } from 'react';
import { get } from '@/api/client';

const AdminProfile = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@electra.com',
    phone: '0901234567',
    role: 'Quản trị viên',
    employeeId: 'AD001',
    department: 'Quản lý hệ thống',
    startDate: '2023-01-01'
  });

  const [adminUser, setAdminUser] = useState(null);

  // Lấy thông tin admin từ API
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await get('/api/users/all');
        const users = response?.data?.data || [];
        
        // Tìm user có role Admin
        const adminUserData = users.find(user => user.roleName === 'Admin');
        
        if (adminUserData) {
          setAdminUser(adminUserData);
          setFormData({
            name: adminUserData.fullName || 'Admin User',
            email: adminUserData.email || 'admin@electra.com',
            phone: adminUserData.phone || '0901234567',
            role: 'Quản trị viên hệ thống',
            employeeId: `AD${adminUserData.userId?.toString().padStart(3, '0') || '001'}`,
            department: 'Quản lý hệ thống',
            startDate: adminUserData.createdAt ? new Date(adminUserData.createdAt).toISOString().split('T')[0] : '2023-01-01'
          });
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin admin:', error);
      }
    };

    fetchAdminInfo();
  }, []);

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      )}
      <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center ring-8 ring-white shadow">
            <span className="text-red-600 font-bold text-xl">
              {adminUser ? 
                (adminUser.fullName ? adminUser.fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase() : 'AD') 
                : 'AD'
              }
            </span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-gray-600">Quản lý hồ sơ quản trị viên hệ thống</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
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
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" 
              disabled 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
            <input 
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full border rounded-xl px-3 py-2 bg-white text-gray-900" 
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

        {/* Quyền hạn Admin */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quyền hạn hệ thống</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

export default AdminProfile;
