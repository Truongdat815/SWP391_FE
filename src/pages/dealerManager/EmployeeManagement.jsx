import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsersThunk, createUserThunk, updateUserThunk, deleteUserThunk } from '../../store/slices/userSlice';
import { getAllRolesThunk } from '../../store/slices/roleSlice';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import * as userService from '../../api/userService';

function EmployeeManagement() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { toast, success, showError, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();

  const users = useSelector((s) => s.users.items);
  const usersStatus = useSelector((s) => s.users.status);
  const roles = useSelector((s) => s.roles.items);

  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newEmployee, setNewEmployee] = useState({
    password: '',
    fullName: '',
    email: '',
    phone: '',
    roleId: '',
    storeId: user?.storeId || '',
    storeName: user?.storeName || ''
  });

  const myStoreId = user?.storeId;

  useEffect(() => {
    dispatch(getAllUsersThunk());
    dispatch(getAllRolesThunk());
  }, [dispatch]);

  // Lọc chỉ lấy Dealer Staff của cửa hàng này
  console.log('👥 Total users from API:', users.length);
  console.log('🏪 My Store ID:', myStoreId);
  
  const myStaff = users.filter(u => {
    console.log('🔍 Full user object:', u);
    console.log('🔍 Checking user:', {
      userId: u.userId,
      username: u.username,
      fullName: u.fullName,
      roleName: u.roleName,
      storeId: u.storeId,
      myStoreId: myStoreId,
      userStoreIdType: typeof u.storeId,
      myStoreIdType: typeof myStoreId
    });
    
    const isDealerStaff = u.roleName === 'Dealer Staff' || 
                          u.roleName === 'dealer-staff' ||
                          u.roleName === 'Nhân viên cửa hàng';
    const isMyStore = u.storeId === myStoreId || String(u.storeId) === String(myStoreId);
    
    console.log('✅ Result:', { isDealerStaff, isMyStore, included: isDealerStaff && isMyStore });
    
    return isDealerStaff && isMyStore;
  });
  
  console.log('✨ Filtered staff:', myStaff.length);

  const filteredStaff = myStaff.filter(employee => {
    const matchesSearch = employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Lấy roleId của Dealer Staff
  const dealerStaffRole = roles.find(r => 
    r.roleName === 'Dealer Staff' || 
    r.roleName === 'dealer-staff' ||
    r.roleName === 'Nhân viên cửa hàng'
  );

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    if (!dealerStaffRole) {
      showError('Không tìm thấy role Dealer Staff');
      return;
    }

    // Validate password
    if (!newEmployee.password || newEmployee.password.trim() === '') {
      showError('Vui lòng nhập mật khẩu');
      return;
    }
    
    if (newEmployee.password.length < 6) {
      showError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      // Chuẩn bị dữ liệu submit giống như admin
      const submitData = {
        fullName: newEmployee.fullName,
        email: newEmployee.email,
        password: newEmployee.password.trim(),
        phone: newEmployee.phone || '',
        roleId: dealerStaffRole.roleId,
        storeId: myStoreId
      };

      // Debug log - ẩn password để bảo mật
      const debugData = { ...submitData };
      if (debugData.password) {
        debugData.password = '***';
      }
      console.log('Submitting user data:', debugData);

      await dispatch(createUserThunk(submitData)).unwrap();
      
      success('Đã thêm nhân viên thành công!');
      setShowAddModal(false);
      
      // Reset form
      setNewEmployee({
        password: '',
        fullName: '',
        email: '',
        phone: '',
        roleId: '',
        storeId: user?.storeId || '',
        storeName: user?.storeName || ''
      });
      
      // Thêm delay nhỏ để đảm bảo backend đã xử lý xong
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh danh sách users
      await dispatch(getAllUsersThunk()).unwrap();
    } catch (error) {
      console.error('Failed to create user:', error);
      showError('Lỗi khi tạo người dùng: ' + (error?.message || 'Không thể thêm nhân viên'));
    }
  };

  const getStatusColor = (status) => {
    const upperStatus = String(status || '').toUpperCase();
    switch (upperStatus) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-300';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DISABLED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    const upperStatus = String(status || '').toUpperCase();
    switch (upperStatus) {
      case 'ACTIVE': return 'Hoạt động';
      case 'INACTIVE': return 'Không hoạt động';
      case 'PENDING': return 'Chờ duyệt';
      case 'DISABLED': return 'Vô hiệu hóa';
      default: return upperStatus || status || 'N/A';
    }
  };

  const handleUpdateStatus = async (employee, newStatus) => {
    try {
      await userService.updateUserStatus(employee.userId, newStatus);
      success(`Đã cập nhật trạng thái nhân viên "${employee.fullName}" thành công!`);
      dispatch(getAllUsersThunk());
    } catch (error) {
      showError(error?.message || 'Không thể cập nhật trạng thái nhân viên');
    }
  };

  return (
    <div>
      {/* Toast Notifications */}
      <Toast 
        show={toast.show} 
        type={toast.type} 
        message={toast.message} 
        onClose={hideToast}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        show={confirm.show}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 sm:p-4 md:p-5">
        {/* Header */}
        <div className="mb-3 sm:mb-4 md:mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">
                Quản lý nhân viên tại {user?.storeName || 'cửa hàng của bạn'}
              </p>
            </div>
            <motion.button
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap flex-shrink-0"
            >
              <motion.svg 
                className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </motion.svg>
              <span>Thêm nhân viên</span>
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Tổng: <span className="font-semibold text-gray-900">{filteredStaff.length}</span> nhân viên
              </div>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Họ tên</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Số điện thoại</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Cửa hàng</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usersStatus === 'loading' && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              )}
              {usersStatus === 'succeeded' && filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    Chưa có nhân viên nào
                  </td>
                </tr>
              )}
              {usersStatus === 'succeeded' && filteredStaff.map((employee) => {
                return (
                  <tr key={employee.userId}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{employee.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{employee.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{employee.phone || 'Chưa cập nhật'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {employee.storeName || `Store #${employee.storeId}`}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={employee.status === 'INACTIVE' ? 'ACTIVE' : (employee.status || 'ACTIVE')}
                        onChange={(e) => handleUpdateStatus(employee, e.target.value)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all ${getStatusColor(employee.status === 'INACTIVE' ? 'ACTIVE' : (employee.status || 'ACTIVE'))}`}
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="DISABLED">Vô hiệu hóa</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl p-4 border shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto"
            >
              <div className="mt-2">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Thêm nhân viên mới</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleAddEmployee} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newEmployee.fullName}
                        onChange={(e) => setNewEmployee({...newEmployee, fullName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                        placeholder="Nhập họ và tên đầy đủ"
                        required
                      />
                    </div>

                    {/* Store Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cửa hàng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={`${user?.storeName || ''} (#${myStoreId || ''})`}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 shadow-sm"
                      />
                    </div>

                    {/* Role Selection - Disabled */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vai trò <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value="Nhân viên cửa hàng"
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 shadow-sm"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                        placeholder="Nhập địa chỉ email"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mật khẩu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={newEmployee.password}
                        onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                        placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                        required
                        minLength={6}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={newEmployee.phone}
                        onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <motion.button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-sm text-sm"
                    >
                      ❌ Hủy
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={usersStatus === 'loading'}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                    >
                      {usersStatus === 'loading' && (
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {usersStatus === 'loading' ? '⏳ Đang tạo...' : '✅ Tạo tài khoản'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}

export default EmployeeManagement;





