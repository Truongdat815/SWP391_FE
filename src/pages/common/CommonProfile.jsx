import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUser, getCurrentUser } from '@/api/userService';
import { getAllUsersThunk } from '@store/slices/userSlice';

const CommonProfile = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: 'User',
    email: 'user@electra.com',
    phone: '0900000000',
    role: 'Nhân viên'
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

  // Lấy thông tin user từ API /users/me
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        
        // Call API to get current user
        const response = await getCurrentUser();
        // API trả về { code, message, data: { userId, fullName, email, ... } }
        const userData = response?.data;
        
        if (userData) {
          setUserData(userData);
          
          setFormData({
            name: userData.fullName || 'User',
            email: userData.email || 'user@electra.com',
            phone: userData.phone || '0900000000',
            role: userData.roleName || 'Nhân viên'
          });
        }
      } catch (error) {
        console.error('Lỗi lấy thông tin user:', error);
        setErrorMessage('Không thể tải thông tin người dùng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);



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
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5 lg:py-6">
      <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-sm mb-4 sm:mb-5 md:mb-6 animate-in fade-in slide-in-from-bottom-1 duration-300">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-red-100 flex items-center justify-center ring-4 sm:ring-6 md:ring-8 ring-white shadow flex-shrink-0">
            <span className="text-red-600 font-bold text-base sm:text-lg md:text-xl">
              {userData?.fullName ? userData.fullName.trim().charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">Cập nhật hồ sơ để đồng bộ trên toàn hệ thống</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 lg:p-8 transition-all duration-200 hover:shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            <input 
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full border rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white text-gray-900" 
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Vai trò</label>
            <input 
              name="role"
              value={formData.role}
              className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed" 
              disabled 
            />
            <p className="text-xs text-gray-500 mt-1">Thông tin này không thể chỉnh sửa</p>
          </div>
          {(getRoleFromPath(location.pathname) === 'Dealer Staff' || getRoleFromPath(location.pathname) === 'Dealer Manager') && userData?.storeName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đại lý</label>
              <input 
                name="storeName"
                value={userData.storeName}
                className="w-full border rounded-xl px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed" 
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Thông tin này không thể chỉnh sửa</p>
            </div>
          )}
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

        <div className="mt-6 flex items-center justify-end">
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


