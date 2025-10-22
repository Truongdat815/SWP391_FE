import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { get } from '@/api/client';
import { updateUser } from '@/api/userService';
import { getAllUsersThunk } from '@store/slices/userSlice';
import { useAuth } from '../../contexts/AuthContext';

const CommonProfile = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: 'User',
    email: 'user@electra.com',
    phone: '0900000000',
    role: 'Nhân viên',
    startDate: '2023-01-01'
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
          
          setFormData({
            name: user.fullName || 'User',
            email: user.email || 'user@electra.com',
            phone: user.phone || '0900000000',
            role: user.roleName || 'Nhân viên',
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
            
            setFormData({
              name: userData.fullName || 'User',
              email: userData.email || 'user@electra.com',
              phone: userData.phone || '0900000000',
              role: userData.roleName || 'Nhân viên',
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



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!userData?.userId) {
      setErrorMessage('Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Gửi đầy đủ thông tin nhưng user chỉ có thể edit 3 fields
      const updateData = {
        userId: userData.userId,
        fullName: formData.name,      // User có thể edit
        email: formData.email,          // User có thể edit
        phone: formData.phone,          // User có thể edit
        roleId: userData.roleId,        // Giữ nguyên
        storeId: userData.storeId,      // Giữ nguyên (nếu có)
        status: userData.status          // Giữ nguyên
      };

      // Nếu không có storeId (Admin/EVM Staff), xóa field này
      if (!updateData.storeId) {
        delete updateData.storeId;
      }

      await updateUser(updateData);
      
      // Refresh Redux store để UserManagement cập nhật ngay
      dispatch(getAllUsersThunk());
      
      setSuccessMessage('Cập nhật thông tin thành công!');
      
      // Auto hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      setErrorMessage(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
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
              {userData?.fullName ? userData.fullName.trim().charAt(0).toUpperCase() : 'U'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <input 
              name="role"
              value={formData.role}
              className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed" 
              disabled 
            />
            <p className="text-xs text-gray-500 mt-1">Thông tin này không thể chỉnh sửa</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu làm việc</label>
            <input 
              name="startDate"
              type="date"
              value={formData.startDate}
              className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed" 
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Thông tin này không thể chỉnh sửa</p>
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

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {userData?.updatedAt ? `Cập nhật lần cuối: ${new Date(userData.updatedAt).toLocaleDateString('vi-VN')}` : 'Lần cập nhật gần nhất: hôm nay'}
          </p>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 active:scale-[0.98] transition shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {saving && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommonProfile;


