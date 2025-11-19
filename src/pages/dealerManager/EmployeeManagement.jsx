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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [newEmployee, setNewEmployee] = useState({
    username: '',
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

    try {
      const payload = {
        userId: 0,
        username: newEmployee.username,
        password: newEmployee.password,
        fullName: newEmployee.fullName,
        email: newEmployee.email,
        phone: newEmployee.phone,
        roleId: dealerStaffRole.roleId,
        roleName: dealerStaffRole.roleName,
        storeId: myStoreId,
        storeName: user?.storeName || ''
      };

      await dispatch(createUserThunk(payload)).unwrap();
      success('Đã thêm nhân viên thành công!');
      setShowAddModal(false);
      setNewEmployee({
        username: '',
        password: '',
        fullName: '',
        email: '',
        phone: '',
        roleId: '',
        storeId: user?.storeId || '',
        storeName: user?.storeName || ''
      });
      dispatch(getAllUsersThunk());
    } catch (error) {
      showError(error?.message || 'Không thể thêm nhân viên');
    }
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    
    try {
      await dispatch(updateUserThunk({
        userId: selectedEmployee.userId,
        fullName: selectedEmployee.fullName,
        email: selectedEmployee.email,
        phone: selectedEmployee.phone,
        roleId: selectedEmployee.roleId,
        storeId: selectedEmployee.storeId
      })).unwrap();
      
      success('Đã cập nhật nhân viên thành công!');
      setShowEditModal(false);
      setSelectedEmployee(null);
      dispatch(getAllUsersThunk());
    } catch (error) {
      showError(error?.message || 'Không thể cập nhật nhân viên');
    }
  };

  const handleDeleteEmployee = async (employee) => {
    const confirmed = await showConfirm({
      message: `Bạn có chắc chắn muốn xóa nhân viên "${employee.fullName}"?`,
      type: 'warning'
    });
    if (!confirmed) return;

    try {
      await dispatch(deleteUserThunk(employee.userId)).unwrap();
      success('Đã xóa nhân viên thành công!');
      dispatch(getAllUsersThunk());
    } catch (error) {
      showError(error?.message || 'Không thể xóa nhân viên');
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
                Quản lý Dealer Staff tại {user?.storeName || 'cửa hàng của bạn'}
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
                      <div className="inline-flex gap-2">
                        <motion.button
                          onClick={() => handleEditEmployee(employee)}
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 shadow hover:shadow-md transition-all"
                        >
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Sửa
                          </span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteEmployee(employee)}
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 shadow hover:shadow-md transition-all"
                        >
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Xóa
                          </span>
                        </motion.button>
                      </div>
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
              className="bg-white rounded-lg shadow-2xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Thêm nhân viên mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cửa hàng</label>
                <input
                  type="text"
                  value={`${user?.storeName || ''} (#${myStoreId || ''})`}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={newEmployee.username}
                  onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                <input
                  type="text"
                  value={newEmployee.fullName}
                  onChange={(e) => setNewEmployee({...newEmployee, fullName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Lưu ý:</strong> Nhân viên mới sẽ được tạo với vai trò "Dealer Staff" và được gán vào cửa hàng của bạn.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <motion.button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors"
                >
                  Thêm nhân viên
                </motion.button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Employee Modal */}
      <AnimatePresence>
        {showEditModal && selectedEmployee && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
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
              className="bg-white rounded-lg shadow-2xl p-4 w-full max-w-md"
            >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa nhân viên</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                <input
                  type="text"
                  value={selectedEmployee.fullName}
                  onChange={(e) => setSelectedEmployee({...selectedEmployee, fullName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={selectedEmployee.email}
                  onChange={(e) => setSelectedEmployee({...selectedEmployee, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={selectedEmployee.phone || ''}
                  onChange={(e) => setSelectedEmployee({...selectedEmployee, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <motion.button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-colors"
                >
                  Cập nhật
                </motion.button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

export default EmployeeManagement;





