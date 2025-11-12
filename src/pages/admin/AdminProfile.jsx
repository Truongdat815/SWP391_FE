import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '@/api/userService';

const AdminProfile = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@electra.com',
    phone: '0901234567',
    role: 'Quản trị viên',
    employeeId: 'AD001',
    department: 'Quản lý hệ thống'
  });

  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin admin từ API /users/me
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        setLoading(true);
        const response = await getCurrentUser();
        // API trả về { code, message, data: { userId, fullName, email, ... } }
        const userData = response?.data;
        
        if (userData) {
          setAdminUser(userData);
          setFormData({
            name: userData.fullName || 'Admin User',
            email: userData.email || 'admin@electra.com',
            phone: userData.phone || '0901234567',
            role: 'Quản trị viên hệ thống',
            employeeId: `AD${userData.userId?.toString().padStart(3, '0') || '001'}`,
            department: 'Quản lý hệ thống'
          });
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin admin:', error);
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
          <div className="bg-gray-200 h-96 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-3 flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      )}
      <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-lg p-4 shadow-sm mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center ring-4 ring-white shadow-md">
            <span className="text-red-600 font-bold text-base">
              {adminUser ? 
                (adminUser.fullName ? adminUser.fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase() : 'AD') 
                : 'AD'
              }
            </span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-gray-600 text-sm">Quản lý hồ sơ quản trị viên hệ thống</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input 
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã nhân viên</label>
            <input 
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition bg-white text-gray-900 text-sm" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <input 
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 text-sm" 
              disabled 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phòng ban</label>
            <input 
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900 text-sm" 
              disabled 
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-[0.98] transition shadow-sm text-sm"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
