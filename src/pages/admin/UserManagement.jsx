import { useState, useEffect } from 'react';
import { get } from '@/api/client';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsersThunk, createUserThunk, deleteUserThunk, updateUserThunk } from '@store/slices/userSlice';
import { getAllStoresThunk } from '@store/slices/storeSlice';
import { getAllRolesThunk, createRoleThunk, updateRoleThunk, deleteRoleThunk } from '@store/slices/roleSlice';
import { getActiveStores } from '@/api/storeService';
import { updateUserStatus } from '@/api/userService';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSelect from '@/components/ui/AnimatedSelect';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

// Skeleton Loading Component
const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3 px-3 py-2.5">
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    ))}
  </div>
);

function UserManagement() {
  const dispatch = useDispatch();
  const users = useSelector((s) => s.users.items);
  const usersStatus = useSelector((s) => s.users.status);
  const usersError = useSelector((s) => s.users.error);
  const isUsersFetching = usersStatus === 'loading';
  
  // Track operation type để tách biệt loading states
  const [operationType, setOperationType] = useState(null); // 'create', 'update', 'delete'
  const isCreatingUser = usersStatus === 'loading' && operationType === 'create';
  const isUpdatingUser = usersStatus === 'loading' && operationType === 'update';
  const isDeletingUser = usersStatus === 'loading' && operationType === 'delete';
  
  const stores = useSelector((s) => s.stores.items);
  const storesStatus = useSelector((s) => s.stores.status);
  const storesError = useSelector((s) => s.stores.error);
  const isStoresFetching = storesStatus === 'loading';
  
  // State cho danh sách cửa hàng active (chỉ dùng cho form thêm/sửa user)
  const [activeStores, setActiveStores] = useState([]);
  const [isLoadingActiveStores, setIsLoadingActiveStores] = useState(false);

  const roles = useSelector((s) => s.roles.items);
  const rolesStatus = useSelector((s) => s.roles.status);
  const rolesError = useSelector((s) => s.roles.error);
  const isRolesFetching = rolesStatus === 'loading';
  const [usersApi, setUsersApi] = useState([]);

  const { toast, hideToast, success, error } = useToast();
  const { confirm, showConfirm } = useConfirm();

  useEffect(() => {
    if (usersStatus === 'idle') {
      dispatch(getAllUsersThunk());
    }
  }, [dispatch, usersStatus]);

  // Fallback fetch chỉ khi Redux thất bại hoặc không có data sau khi loaded
  useEffect(() => {
    // Chỉ fetch fallback nếu Redux đã hoàn thành nhưng không có data hoặc có lỗi
    if (usersStatus === 'succeeded' && (!users || users.length === 0)) {
      console.log('Redux returned empty, trying fallback API...');
      get('/api/users/all')
        .then((res) => {
          const userData = res?.data?.data || res?.data || [];
          setUsersApi(Array.isArray(userData) ? userData : []);
        })
        .catch((err) => console.error('Lỗi lấy danh sách người dùng (fallback):', err));
    } else if (usersStatus === 'failed') {
      // Nếu Redux thất bại, thử fallback
      console.log('Redux failed, trying fallback API...');
      get('/api/users/all')
        .then((res) => {
          const userData = res?.data?.data || res?.data || [];
          setUsersApi(Array.isArray(userData) ? userData : []);
        })
        .catch((err) => console.error('Lỗi lấy danh sách người dùng (fallback):', err));
    }
  }, [usersStatus, users]);

  const usersList = (users && users.length) ? users : usersApi;

  useEffect(() => {
    if (storesStatus === 'idle') {
      dispatch(getAllStoresThunk());
    }
  }, [dispatch, storesStatus]);

  // Fetch active stores khi component mount hoặc khi mở modal thêm user
  useEffect(() => {
    const fetchActiveStores = async () => {
      setIsLoadingActiveStores(true);
      try {
        const response = await getActiveStores();
        // Xử lý response có thể là data trực tiếp hoặc { data: [...] }
        const storesData = response?.data || response || [];
        setActiveStores(Array.isArray(storesData) ? storesData : []);
      } catch (err) {
        console.error('Lỗi lấy danh sách cửa hàng active:', err);
        setActiveStores([]);
      } finally {
        setIsLoadingActiveStores(false);
      }
    };

    fetchActiveStores();
  }, []);

  useEffect(() => {
    if (rolesStatus === 'idle') {
      dispatch(getAllRolesThunk());
    }
  }, [dispatch, rolesStatus]);

  const [activeTab, setActiveTab] = useState('dealer-staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState({});
  const itemsPerPage = 10;
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userToView, setUserToView] = useState(null);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [userToDisable, setUserToDisable] = useState(null);
  const [statusAction, setStatusAction] = useState(null); // 'enable' or 'disable'
  
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [roleFormData, setRoleFormData] = useState({
    roleName: ''
  });
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    storeId: '',
    roleId: '',
    status: 'ACTIVE'
  });

  const getStatusColor = (status) => {
    const upperStatus = String(status || '').toUpperCase();
    switch (upperStatus) {
      case 'ACTIVE': return 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md';
      case 'INACTIVE': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md';
      case 'PENDING': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md';
      case 'DISABLED': return 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md';
    }
  };

  const getStatusText = (status) => {
    const upperStatus = String(status || '').toUpperCase();
    switch (upperStatus) {
      case 'ACTIVE': return 'Hoạt động';
      case 'INACTIVE': return 'Không hoạt động';
      case 'PENDING': return 'Chờ duyệt';
      case 'DISABLED': return 'Vô hiệu hóa';
      default: return upperStatus || status;
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Quản trị viên': return 'from-purple-400 to-purple-600';
      case 'Admin': return 'from-purple-400 to-purple-600';
      case 'Nhân viên hãng xe': return 'from-red-400 to-red-600';
      case 'EVM Staff': return 'from-red-400 to-red-600';
      case 'Quản lý cửa hàng': return 'from-green-400 to-green-600';
      case 'Dealer Manager': return 'from-green-400 to-green-600';
      case 'Nhân viên cửa hàng': return 'from-blue-400 to-blue-600';
      case 'Dealer Staff': return 'from-blue-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  // Helper: Check if roleId requires a store
  // roleId 1 = Admin, roleId 2 = EVM Staff -> NO store needed
  // roleId 3 = Dealer Manager, roleId 4 = Dealer Staff -> store needed
  const requiresStore = (roleId) => {
    return roleId !== 1 && roleId !== 2;
  };

  // Helper: Check if roleId does NOT require a store
  const doesNotRequireStore = (roleId) => {
    return roleId === 1 || roleId === 2;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Nếu thay đổi role thành Admin (1) hoặc EVM Staff (2), tự động clear storeId
    if (name === 'roleId') {
      if (doesNotRequireStore(parseInt(value))) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          storeId: '' // Clear storeId cho Admin và EVM Staff
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    if (!formData.password || formData.password.trim() === '') {
      error('Vui lòng nhập mật khẩu');
      return;
    }
    
    if (formData.password.length < 6) {
      error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    try {
      // Set operation type để tracking loading state
      setOperationType('create');
      
      // Chuẩn bị dữ liệu submit
      const submitData = { ...formData };
      
      // Xóa status vì backend tự xử lý khi tạo user mới
      delete submitData.status;
      
      // Đảm bảo password không rỗng
      if (!submitData.password || submitData.password.trim() === '') {
        error('Mật khẩu không được để trống');
        setOperationType(null);
        return;
      }
      
      // Trim password để đảm bảo không có khoảng trắng thừa
      submitData.password = submitData.password.trim();
      
      // Đảm bảo password có giá trị sau khi trim
      if (!submitData.password || submitData.password.length === 0) {
        error('Mật khẩu không được để trống');
        setOperationType(null);
        return;
      }
      
      // Nếu là Admin (1) hoặc EVM Staff (2), không gửi storeId
      if (doesNotRequireStore(parseInt(formData.roleId))) {
        delete submitData.storeId;
      }
      
      // Debug log - ẩn password để bảo mật
      const debugData = { ...submitData };
      if (debugData.password) {
        debugData.password = '***';
      }
      console.log('Submitting user data:', debugData);
      console.log('Password length:', submitData.password?.length);
      console.log('Password exists:', !!submitData.password);
      
      // Kiểm tra lần cuối trước khi gửi
      if (!submitData.password || submitData.password.trim() === '') {
        error('Lỗi: Mật khẩu không được để trống');
        setOperationType(null);
        return;
      }
      
      await dispatch(createUserThunk(submitData)).unwrap();
      
      // Reset operation type sau khi hoàn thành
      setOperationType(null);
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        storeId: '',
        roleId: '',
        status: 'ACTIVE'
      });
      
      setShowAddModal(false);
      
      // Thêm delay nhỏ để đảm bảo backend đã xử lý xong
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh danh sách users
      await dispatch(getAllUsersThunk()).unwrap();
      
    } catch (err) {
      console.error('Failed to create user:', err);
      error('Lỗi khi tạo người dùng: ' + err.message);
      setOperationType(null); // Reset operation type khi có lỗi
    }
  };

  const handleCloseModal = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      storeId: '',
      roleId: '',
      status: 'ACTIVE'
    });
    setShowAddModal(false);
    setOperationType(null); // Reset operation type khi đóng modal
  };

  // Refresh active stores khi mở modal thêm user
  const handleOpenAddModal = async () => {
    setIsLoadingActiveStores(true);
    try {
      const response = await getActiveStores();
      const storesData = response?.data || response || [];
      setActiveStores(Array.isArray(storesData) ? storesData : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách cửa hàng active:', err);
      setActiveStores([]);
    } finally {
      setIsLoadingActiveStores(false);
    }
    setShowAddModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      setOperationType('delete');
      await dispatch(deleteUserThunk(userToDelete.userId)).unwrap();
      
      // Reset operation type sau khi hoàn thành
      setOperationType(null);
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      // Thêm delay nhỏ để đảm bảo backend đã xử lý xong
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh danh sách users
      await dispatch(getAllUsersThunk()).unwrap();
      
    } catch (err) {
      console.error('Failed to delete user:', err);
      error('Lỗi khi xóa người dùng: ' + err.message);
      setOperationType(null); // Reset operation type khi có lỗi
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setOperationType(null); // Reset operation type khi hủy
  };

  const handleDisableConfirm = async () => {
    if (!userToDisable || !statusAction) return;
    
    const action = statusAction; // Lưu action trước khi reset
    
    try {
      setOperationType('update');
      
      // Xác định status mới dựa trên action
      const newStatus = action === 'enable' ? 'ACTIVE' : 'DISABLED';
      
      // Gọi API update status
      await updateUserStatus(userToDisable.userId, newStatus);
      
      // Reset operation type sau khi hoàn thành
      setOperationType(null);
      setShowDisableModal(false);
      setUserToDisable(null);
      setStatusAction(null);
      
      // Thêm delay nhỏ để đảm bảo backend đã xử lý xong
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh danh sách users
      await dispatch(getAllUsersThunk()).unwrap();
      
      success(action === 'enable' ? 'Kích hoạt tài khoản thành công!' : 'Vô hiệu hóa tài khoản thành công!');
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      error(action === 'enable' 
        ? 'Lỗi khi kích hoạt tài khoản: ' + (err.message || 'Có lỗi xảy ra')
        : 'Lỗi khi vô hiệu hóa tài khoản: ' + (err.message || 'Có lỗi xảy ra'));
      setOperationType(null); // Reset operation type khi có lỗi
    }
  };

  const handleDisableCancel = () => {
    setShowDisableModal(false);
    setUserToDisable(null);
    setStatusAction(null);
  };

  const handleEditClick = async (user) => {
    // Refresh active stores khi mở modal edit
    setIsLoadingActiveStores(true);
    try {
      const response = await getActiveStores();
      const storesData = response?.data || response || [];
      setActiveStores(Array.isArray(storesData) ? storesData : []);
    } catch (err) {
      console.error('Lỗi lấy danh sách cửa hàng active:', err);
      setActiveStores([]);
    } finally {
      setIsLoadingActiveStores(false);
    }
    
    setUserToEdit(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      storeId: user.storeId || '',
      roleId: user.roleId ? user.roleId.toString() : '',
      status: user.status || 'ACTIVE'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!userToEdit) return;
    
    try {
      setOperationType('update');
      
      const updateData = {
        userId: userToEdit.userId,
        ...formData
      };
      
      if (!updateData.password) {
        delete updateData.password;
      }
      
      // Nếu là Admin (1) hoặc EVM Staff (2), không gửi storeId
      if (doesNotRequireStore(parseInt(formData.roleId))) {
        delete updateData.storeId;
      }
      
      await dispatch(updateUserThunk(updateData)).unwrap();
      
      // Reset operation type sau khi hoàn thành
      setOperationType(null);
      
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        storeId: '',
        roleId: '',
        status: 'ACTIVE'
      });
      setShowEditModal(false);
      setUserToEdit(null);
      
      // Thêm delay nhỏ để đảm bảo backend đã xử lý xong
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh danh sách users
      await dispatch(getAllUsersThunk()).unwrap();
      
    } catch (err) {
      console.error('Failed to update user:', err);
      error('Lỗi khi cập nhật người dùng: ' + err.message);
      setOperationType(null); // Reset operation type khi có lỗi
    }
  };

  const handleEditCancel = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      storeId: '',
      roleId: '',
      status: 'ACTIVE'
    });
    setShowEditModal(false);
    setUserToEdit(null);
    setOperationType(null); // Reset operation type khi hủy
  };

  const handleRoleInputChange = (e) => {
    const { name, value } = e.target;
    setRoleFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createRoleThunk(roleFormData)).unwrap();
      setRoleFormData({ roleName: '' });
      setShowAddRoleModal(false);
      dispatch(getAllRolesThunk());
    } catch (error) {
      console.error('Failed to create role:', error);
    }
  };

  const handleRoleEditSubmit = async (e) => {
    e.preventDefault();
    if (!roleToEdit) return;
    
    try {
      const updateData = {
        roleId: roleToEdit.roleId,
        roleName: roleFormData.roleName
      };
      await dispatch(updateRoleThunk(updateData)).unwrap();
      setRoleFormData({ roleName: '' });
      setShowEditRoleModal(false);
      setRoleToEdit(null);
      dispatch(getAllRolesThunk());
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleRoleEditClick = (role) => {
    setRoleToEdit(role);
    setRoleFormData({
      roleName: role.roleName || ''
    });
    setShowEditRoleModal(true);
  };

  const handleRoleDeleteClick = (role) => {
    setRoleToDelete(role);
    setShowDeleteRoleModal(true);
  };

  const handleRoleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    
    try {
      await dispatch(deleteRoleThunk(roleToDelete.roleId)).unwrap();
      setShowDeleteRoleModal(false);
      setRoleToDelete(null);
      dispatch(getAllRolesThunk());
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  const handleRoleDeleteCancel = () => {
    setShowDeleteRoleModal(false);
    setRoleToDelete(null);
  };

  const handleCloseRoleModal = () => {
    setRoleFormData({ roleName: '' });
    setShowAddRoleModal(false);
    setShowEditRoleModal(false);
    setRoleToEdit(null);
  };

  const handleViewDetail = (user) => {
    setUserToView(user);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setUserToView(null);
  };

  // Hàm lọc người dùng theo search term và status
  const getFilteredUsersByRole = (roleName) => {
    return usersList.filter(user => {
      const matchesRole = user.roleName === roleName;
      const matchesSearch = !searchTerm || 
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone && user.phone.includes(searchTerm));
      const matchesStatus = !statusFilter || 
        (user.status && user.status.toUpperCase() === statusFilter.toUpperCase());
      return matchesRole && matchesSearch && matchesStatus;
    });
  };

  const tabs = [
    { id: 'dealer-staff', name: 'Nhân viên cửa hàng', count: getFilteredUsersByRole('Nhân viên cửa hàng').length },
    { id: 'dealer-manager', name: 'Quản lý cửa hàng', count: getFilteredUsersByRole('Quản lý cửa hàng').length },
    { id: 'evm-staff', name: 'Nhân viên hãng xe', count: getFilteredUsersByRole('Nhân viên hãng xe').length }
  ];

  const renderUserTable = (roleName, roleColor) => {
    // Lọc người dùng theo role và search term
    const filteredUsers = getFilteredUsersByRole(roleName);
    
    // Pagination state per role
    const roleKey = roleName.toLowerCase().replace(/\s+/g, '-');
    const pageKey = `page-${roleKey}`;
    const currentPageForRole = currentPage[pageKey] || 1;
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPageForRole - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    const handlePageChange = (page) => {
      setCurrentPage(prev => ({ ...prev, [pageKey]: page }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <div className="overflow-x-auto">
        {isUsersFetching && <TableSkeleton />}
        {!isUsersFetching && usersError && (
          <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            <div className="font-semibold mb-2">❌ Lỗi tải danh sách người dùng:</div>
            <div className="text-xs font-mono bg-white p-2 rounded">
              {JSON.stringify(usersError, null, 2)}
            </div>
          </div>
        )}
        {!isUsersFetching && !usersError && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Họ tên</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Số điện thoại</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                {(roleName !== 'Quản trị viên' && roleName !== 'Admin' && roleName !== 'Nhân viên hãng xe' && roleName !== 'EVM Staff') && (
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cửa hàng</th>
                )}
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((u, index) => (
              <tr 
                key={u.userId}
                onClick={() => handleViewDetail(u)}
                className={`transition-all duration-200 hover:bg-red-50 hover:shadow-sm cursor-pointer
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 bg-gradient-to-br ${roleColor} rounded-full flex items-center justify-center mr-3 shadow-md ring-2 ring-opacity-20 ring-gray-300`}>
                      <span className="text-white font-bold text-sm">
                        {u.fullName ? u.fullName.trim().charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{u.fullName}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    {u.phone}
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserToDisable(u);
                      if (u.status === 'DISABLED') {
                        setStatusAction('enable');
                      } else {
                        setStatusAction('disable');
                      }
                      setShowDisableModal(true);
                    }}
                    className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(u.status)} transition-all duration-200 cursor-pointer hover:opacity-80 hover:shadow-md transform hover:scale-105`}
                    title={u.status === 'DISABLED' ? 'Click để kích hoạt lại tài khoản' : 'Click để vô hiệu hóa tài khoản'}
                  >
                    {getStatusText(u.status)}
                  </button>
                </td>
                {(roleName !== 'Quản trị viên' && roleName !== 'Admin' && roleName !== 'Nhân viên hãng xe' && roleName !== 'EVM Staff') && (
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{u.storeName || 'N/A'}</div>
                  </td>
                )}
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(u);
                    }}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                    title="Chỉnh sửa người dùng"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={roleName === 'Quản trị viên' || roleName === 'Admin' || roleName === 'Nhân viên hãng xe' || roleName === 'EVM Staff' ? "4" : "5"} className="px-6 py-16">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4 shadow-inner">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {searchTerm ? `Không tìm thấy ${roleName} phù hợp` : `Chưa có ${roleName}`}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                      {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bắt đầu bằng cách thêm người dùng với vai trò này'}
                    </p>
                    <button
                      onClick={handleOpenAddModal}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Thêm người dùng mới
                    </button>
                  </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {!isUsersFetching && !usersError && filteredUsers.length > 0 && (
          <Pagination
            currentPage={currentPageForRole}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredUsers.length}
            showInfo={true}
          />
        )}
      </div>
    );
  };

  const renderEVMStaffTable = () => renderUserTable('Nhân viên hãng xe', getRoleColor('Nhân viên hãng xe'));
  const renderDealerStaffTable = () => renderUserTable('Nhân viên cửa hàng', getRoleColor('Nhân viên cửa hàng'));
  const renderDealerManagerTable = () => renderUserTable('Quản lý cửa hàng', getRoleColor('Quản lý cửa hàng'));


  return (
    <div className="px-6 space-y-6">
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
      
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-md border border-gray-100 p-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Quản lý người dùng & phân quyền
            </h1>
            <p className="text-gray-600 mt-1 flex items-center text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Quản lý tài khoản, vai trò và quyền hạn trong hệ thống
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleOpenAddModal}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center text-sm"
              
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm người dùng
            </button>
            
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-3">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng theo tên, email, số điện thoại..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm hover:shadow-md transition-all bg-white text-gray-900"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="DISABLED">Vô hiệu hóa</option>
            </select>
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="px-3 py-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                title="Xóa bộ lọc trạng thái"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3">
          {/* Hiển thị thông tin tìm kiếm và filter */}
          {(searchTerm || statusFilter) && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center flex-wrap gap-2">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm text-blue-700">
                  {searchTerm && (
                    <span className="mr-3">
                      Tìm kiếm: "<strong>{searchTerm}</strong>"
                    </span>
                  )}
                  {statusFilter && (
                    <span className="mr-3">
                      Trạng thái: <strong>{statusFilter}</strong>
                    </span>
                  )}
                  - Tìm thấy {tabs.reduce((total, tab) => total + tab.count, 0)} kết quả
                </span>
                <div className="ml-auto flex gap-2">
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-blue-500 hover:text-blue-700 transition-colors px-2 py-1 hover:bg-blue-100 rounded"
                      title="Xóa tìm kiếm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {statusFilter && (
                    <button
                      onClick={() => setStatusFilter('')}
                      className="text-blue-500 hover:text-blue-700 transition-colors px-2 py-1 hover:bg-blue-100 rounded"
                      title="Xóa bộ lọc trạng thái"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  {(searchTerm || statusFilter) && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('');
                      }}
                      className="text-blue-500 hover:text-blue-700 transition-colors px-2 py-1 hover:bg-blue-100 rounded text-xs"
                      title="Xóa tất cả bộ lọc"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'dealer-staff' && renderDealerStaffTable()}
          {activeTab === 'dealer-manager' && renderDealerManagerTable()}
          {activeTab === 'evm-staff' && renderEVMStaffTable()}
        </div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleCloseModal}
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
                  <h3 className="text-xl font-bold text-gray-900"> Thêm người dùng mới</h3>
                  <button
                    onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                    />
                  </div>

                  {/* Store Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cửa hàng {formData.roleId && doesNotRequireStore(parseInt(formData.roleId)) ? '' : <span className="text-red-500">*</span>}
                    </label>
                    <select
                      name="storeId"
                      value={formData.storeId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      required={formData.roleId && requiresStore(parseInt(formData.roleId))}
                      disabled={isLoadingActiveStores || (formData.roleId && doesNotRequireStore(parseInt(formData.roleId)))}
                    >
                      <option value="">
                        {isLoadingActiveStores ? 'Đang tải cửa hàng active...' : 
                         (formData.roleId && doesNotRequireStore(parseInt(formData.roleId))) ? 'Không thuộc cửa hàng' : 'Chọn cửa hàng'}
                      </option>
                      {activeStores.map((store) => (
                        <option key={store.storeId} value={store.storeId}>
                          {store.storeName} ({store.provinceName || 'N/A'})
                        </option>
                      ))}
                    </select>
                    {formData.roleId && doesNotRequireStore(parseInt(formData.roleId)) && (
                      <p className="text-xs text-gray-500 mt-1.5">💡 Quản trị viên và Nhân viên hãng xe không thuộc về cửa hàng cụ thể</p>
                    )}
                    {!isLoadingActiveStores && activeStores.length === 0 && formData.roleId && requiresStore(parseInt(formData.roleId)) && (
                      <p className="text-xs text-yellow-600 mt-1.5">⚠️ Không có cửa hàng active nào để chọn</p>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vai trò <span className="text-red-500">*</span>
                    </label>
                    <AnimatedSelect
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleInputChange}
                      placeholder={isRolesFetching ? 'Đang tải vai trò...' : 'Chọn vai trò'}
                      disabled={isRolesFetching}
                      options={[
                        { value: '', label: isRolesFetching ? 'Đang tải vai trò...' : 'Chọn vai trò' },
                        ...roles
                          .filter(role => role.roleName !== 'Quản trị viên' && role.roleName !== 'Admin')
                          .map(role => ({
                            value: role.roleId.toString(),
                            label: role.roleName
                          }))
                      ]}
                      className="w-full"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
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
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập mật khẩu"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={handleCloseModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-sm text-sm"
                  >
                    ❌ Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isCreatingUser}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                  >
                    {isCreatingUser && (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isCreatingUser ? '⏳ Đang tạo...' : ' Tạo tài khoản'}
                  </motion.button>
                </div>
              </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal - Similar structure to Add Modal */}
      <AnimatePresence>
        {showEditModal && userToEdit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleEditCancel}
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
                <h3 className="text-xl font-bold text-gray-900">✏️ Chỉnh sửa người dùng</h3>
                <button
                  onClick={handleEditCancel}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cửa hàng {formData.roleId && doesNotRequireStore(parseInt(formData.roleId)) ? '' : <span className="text-red-500">*</span>}
                    </label>
                    <select
                      name="storeId"
                      value={formData.storeId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      required={formData.roleId && requiresStore(parseInt(formData.roleId))}
                      disabled={isLoadingActiveStores || (formData.roleId && doesNotRequireStore(parseInt(formData.roleId)))}
                    >
                      <option value="">
                        {isLoadingActiveStores ? 'Đang tải cửa hàng active...' : 
                         (formData.roleId && doesNotRequireStore(parseInt(formData.roleId))) ? 'Không thuộc cửa hàng' : 'Chọn cửa hàng active'}
                      </option>
                      {activeStores.map((store) => (
                        <option key={store.storeId} value={store.storeId}>
                          {store.storeName} ({store.provinceName || 'N/A'})
                        </option>
                      ))}
                    </select>
                    {formData.roleId && doesNotRequireStore(parseInt(formData.roleId)) && (
                      <p className="text-xs text-gray-500 mt-1.5">💡 Quản trị viên và Nhân viên hãng xe không thuộc về cửa hàng cụ thể</p>
                    )}
                    {!isLoadingActiveStores && activeStores.length === 0 && formData.roleId && requiresStore(parseInt(formData.roleId)) && (
                      <p className="text-xs text-yellow-600 mt-1.5">⚠️ Không có cửa hàng active nào để chọn</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vai trò <span className="text-red-500">*</span>
                    </label>
                    <AnimatedSelect
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleInputChange}
                      placeholder={isRolesFetching ? 'Đang tải vai trò...' : 'Chọn vai trò'}
                      disabled={isRolesFetching}
                      options={[
                        { value: '', label: isRolesFetching ? 'Đang tải vai trò...' : 'Chọn vai trò' },
                        ...roles.map(role => ({
                          value: role.roleId.toString(),
                          label: role.roleName
                        }))
                      ]}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập địa chỉ email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={handleEditCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-sm text-sm"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isUpdatingUser}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                  >
                    {isUpdatingUser && (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isUpdatingUser ? '⏳ Đang cập nhật...' : '✅ Cập nhật người dùng'}
                  </motion.button>
                </div>
              </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disable User Confirmation Modal */}
      <AnimatePresence>
        {showDisableModal && userToDisable && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleDisableCancel}
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
              className="w-[480px] p-4 border shadow-lg rounded-lg bg-white"
            >
              <div className="mt-3">
                <div className={`flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br rounded-full mb-4 shadow-lg ${
                  statusAction === 'enable' 
                    ? 'from-green-100 to-green-200' 
                    : 'from-orange-100 to-orange-200'
                }`}>
                  {statusAction === 'enable' ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  )}
                </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {statusAction === 'enable' ? 'Xác nhận kích hoạt tài khoản' : 'Xác nhận vô hiệu hóa tài khoản'}
                </h3>
                <div className="mt-2 px-4 py-3">
                  <p className="text-sm text-gray-600 mb-4 text-center leading-relaxed">
                    {statusAction === 'enable' 
                      ? <>Bạn có chắc chắn muốn kích hoạt lại tài khoản của<br /><strong className="text-gray-900">{userToDisable.fullName}</strong> không?</>
                      : <>Bạn có chắc chắn muốn vô hiệu hóa tài khoản của<br /><strong className="text-gray-900">{userToDisable.fullName}</strong> không?</>
                    }
                  </p>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-left shadow-inner">
                    <div className="space-y-2 text-xs text-gray-700">
                      <div className="flex items-center">
                        <span className="font-semibold min-w-[120px]">Email:</span>
                        <span className="flex-1">{userToDisable.email}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold min-w-[120px]">Vai trò:</span>
                        <span>{userToDisable.roleName}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-semibold min-w-[120px]">Trạng thái hiện tại:</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(userToDisable.status)}`}>
                          {getStatusText(userToDisable.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className={`text-xs font-semibold mt-4 text-center ${
                    statusAction === 'enable' 
                      ? 'text-green-600' 
                      : 'text-orange-600'
                  }`}>
                    {statusAction === 'enable' 
                      ? '✅ Tài khoản sẽ được kích hoạt lại và có thể đăng nhập!'
                      : '⚠️ Tài khoản sẽ bị vô hiệu hóa và không thể đăng nhập!'
                    }
                  </p>
                </div>
                
                <div className="flex justify-center space-x-3 mt-6">
                  <motion.button
                    onClick={handleDisableCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-sm text-sm"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    onClick={handleDisableConfirm}
                    disabled={isUpdatingUser}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 text-white rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm ${
                      statusAction === 'enable'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                    }`}
                  >
                    {isUpdatingUser && (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isUpdatingUser 
                      ? 'Đang xử lý...' 
                      : statusAction === 'enable' 
                        ? 'Kích hoạt tài khoản' 
                        : 'Vô hiệu hóa tài khoản'
                    }
                  </motion.button>
                </div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showDetailModal && userToView && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleCloseDetailModal}
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
              className="w-full max-w-2xl p-5 border shadow-2xl rounded-lg bg-white"
            >
              <div className="mt-1">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">Chi tiết người dùng</h3>
                  <button
                    onClick={handleCloseDetailModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              
              <div className="space-y-4">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className={`h-14 w-14 bg-gradient-to-br ${getRoleColor(userToView.roleName)} rounded-full flex items-center justify-center shadow-md ring-2 ring-opacity-20 ring-gray-300 flex-shrink-0`}>
                    <span className="text-white font-bold text-xl">
                      {userToView.fullName ? userToView.fullName.trim().charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-gray-900 mb-1.5 truncate">{userToView.fullName}</h4>
                    <p className="text-sm text-gray-600 mb-2 truncate">{userToView.email}</p>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(userToView.status)}`}>
                        {getStatusText(userToView.status)}
                      </span>
                      <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full bg-gradient-to-r ${getRoleColor(userToView.roleName)} text-white shadow-md whitespace-nowrap`}>
                        {userToView.roleName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Personal Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h5 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Thông tin cá nhân
                    </h5>
                    <div className="space-y-2.5">
                      <div className="flex items-center min-w-0">
                        <svg className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span className="text-sm text-gray-600 whitespace-nowrap">Email:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900 truncate min-w-0">{userToView.email}</span>
                      </div>
                      <div className="flex items-center min-w-0">
                        <svg className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span className="text-sm text-gray-600 whitespace-nowrap">Số điện thoại:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900 whitespace-nowrap">{userToView.phone}</span>
                      </div>
                      <div className="flex items-center min-w-0">
                        <svg className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600 whitespace-nowrap">Trạng thái:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(userToView.status)}`}>
                          {getStatusText(userToView.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Role and Store Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <h5 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Thông tin vai trò & cửa hàng
                    </h5>
                    <div className="space-y-2.5">
                      <div className="flex items-center min-w-0">
                        <svg className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-gray-600 whitespace-nowrap">Vai trò:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${getRoleColor(userToView.roleName)} text-white shadow-md whitespace-nowrap`}>
                          {userToView.roleName}
                        </span>
                      </div>
                      <div className="flex items-center min-w-0">
                        <svg className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-sm text-gray-600 whitespace-nowrap">Cửa hàng:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900 truncate min-w-0">
                          {userToView.roleName === 'Quản trị viên' || userToView.roleName === 'Admin' || userToView.roleName === 'Nhân viên hãng xe' || userToView.roleName === 'EVM Staff' ? 'Không thuộc cửa hàng' : (userToView.storeName || 'Chưa phân công')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <motion.button
                    onClick={handleCloseDetailModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-sm text-sm"
                  >
                    Đóng
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      handleCloseDetailModal();
                      handleEditClick(userToView);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Chỉnh sửa
                  </motion.button>
                </div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserManagement;