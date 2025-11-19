import { useState, useMemo, useEffect } from 'react';
import { MoreVertical, Plus, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import {
  useGetAllUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} from '../../../api/admin/userApi';
import { useGetAllRolesQuery } from '../../../api/admin/roleApi';
import { useGetAllStoresQuery } from '../../../api/admin/storeApi';

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRoleTab, setActiveRoleTab] = useState('DEALER_STAFF'); // 'DEALER_STAFF', 'DEALER_MANAGER', 'EVM_STAFF'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
    storeId: '',
    status: 'ACTIVE',
  });

  const { data: usersResponse, isLoading, error } = useGetAllUsersQuery();
  const { data: rolesResponse } = useGetAllRolesQuery();
  const { data: storesResponse } = useGetAllStoresQuery();

  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = error?.status === 401;
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = usersResponse?.data || [];
  const roles = rolesResponse?.data || [];
  const stores = storesResponse?.data || [];

  // Tạo store options
  const storeOptions = stores.map((store) => ({
    value: store.storeId,
    label: store.storeName || `Chi nhánh ${store.storeId}`,
  }));

  // Normalize role name để so sánh
  const normalizeRoleName = (roleName) => {
    if (!roleName) return '';
    // Chuyển về uppercase, loại bỏ khoảng trắng, dấu gạch dưới, dấu gạch ngang
    // Loại bỏ dấu tiếng Việt để so sánh
    return roleName
      .toUpperCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
      .replace(/\s+/g, '_')
      .replace(/-/g, '_')
      .replace(/__+/g, '_'); // Loại bỏ double underscore
  };

  // Map role names tiếng Việt với role codes
  const roleNameMap = {
    'DEALER_STAFF': ['Nhân viên cửa hàng', 'DEALER_STAFF', 'Dealer Staff', 'DEALERSTAFF'],
    'DEALER_MANAGER': ['Quản lý cửa hàng', 'DEALER_MANAGER', 'Dealer Manager', 'DEALERMANAGER'],
    'EVM_STAFF': ['Nhân viên hãng xe', 'EVM_STAFF', 'EVM Staff', 'EVMSTAFF', 'Nhân viên hãng'],
    'ADMIN': ['Quản trị viên', 'ADMIN', 'Admin'],
  };

  const roleTabs = [
    { value: 'DEALER_STAFF', label: 'Dealer Staff' },
    { value: 'DEALER_MANAGER', label: 'Dealer Manager' },
    { value: 'EVM_STAFF', label: 'EVM Staff' },
  ];

  // Filter users theo role tab
  const filteredUsers = useMemo(() => {
    // Debug: Log để xem dữ liệu
    if (users.length > 0) {
      if (import.meta.env.DEV && users.length > 0) {
        console.log('Filtering users by role:', activeRoleTab);
        console.log('Sample user roleNames:', users.slice(0, 3).map(u => ({
          userId: u.userId,
          roleName: u.roleName,
          normalized: normalizeRoleName(u.roleName)
        })));
      }
    }

    return users.filter((user) => {
      const matchesSearch =
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm);
      
      // So sánh role với nhiều format khác nhau
      const userRoleName = user.roleName || '';
      const possibleRoleNames = roleNameMap[activeRoleTab] || [activeRoleTab];
      
      // Kiểm tra xem user.roleName có match với bất kỳ role name nào trong map không
      const userRoleNormalized = normalizeRoleName(userRoleName);
      
      let matchesRole = possibleRoleNames.some((roleName) => {
        const targetRoleNormalized = normalizeRoleName(roleName);
        
        // Exact match sau khi normalize
        if (userRoleNormalized === targetRoleNormalized) return true;
        
        // Match trực tiếp
        if (userRoleName === roleName) return true;
        
        // Match case-insensitive
        if (userRoleName?.toUpperCase() === roleName?.toUpperCase()) return true;
      });
      
      // Nếu chưa match, thử match với keywords tiếng Việt
      if (!matchesRole) {
        if (activeRoleTab === 'DEALER_STAFF') {
          matchesRole = userRoleNormalized.includes('NHAN_VIEN_CUA_HANG') || 
                       userRoleName?.includes('Nhân viên cửa hàng') ||
                       userRoleName?.includes('nhân viên cửa hàng');
        } else if (activeRoleTab === 'DEALER_MANAGER') {
          matchesRole = userRoleNormalized.includes('QUAN_LY_CUA_HANG') || 
                       userRoleName?.includes('Quản lý cửa hàng') ||
                       userRoleName?.includes('quản lý cửa hàng');
        } else if (activeRoleTab === 'EVM_STAFF') {
          matchesRole = userRoleNormalized.includes('NHAN_VIEN_HANG') || 
                       userRoleName?.includes('Nhân viên hãng') ||
                       userRoleName?.includes('nhân viên hãng') ||
                       userRoleName?.includes('Nhân viên hãng xe') ||
                       userRoleName?.includes('nhân viên hãng xe');
        }
      }
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, activeRoleTab]);

  // Tính toán pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [activeRoleTab, searchTerm]);

  const getRoleBadge = (roleName) => {
    const roleMap = {
      ADMIN: { variant: 'primary', label: 'Admin' },
      DEALER_STAFF: { variant: 'secondary', label: 'Dealer Staff' },
      DEALER_MANAGER: { variant: 'tertiary', label: 'Dealer Manager' },
      EVM_STAFF: { variant: 'info', label: 'EVM Staff' },
    };
    const config = roleMap[roleName] || { variant: 'default', label: roleName || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        roleId: parseInt(formData.roleId),
        storeId: formData.storeId ? parseInt(formData.storeId) : null,
      };
      await createUser(payload).unwrap();
      setIsCreateModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        roleId: '',
        storeId: '',
        status: 'ACTIVE',
      });
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo user');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      roleId: user.roleId?.toString() || '',
      storeId: user.storeId?.toString() || '',
      status: user.status || 'ACTIVE',
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        roleId: parseInt(formData.roleId),
        storeId: formData.storeId ? parseInt(formData.storeId) : null,
      };
      await updateUser({ userId: selectedUser.userId, ...payload }).unwrap();
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi cập nhật user');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      try {
        await deleteUser(userId).unwrap();
      } catch (error) {
        alert(error?.data?.message || 'Có lỗi xảy ra khi xóa user');
        if (import.meta.env.DEV) {
          console.error(error);
        }
      }
    }
    setOpenMenuId(null);
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await updateUserStatus({
        userId: user.userId,
        status: newStatus,
      }).unwrap();
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
    setOpenMenuId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
            <p className="text-gray-600 mt-1">
              Xem, tìm kiếm, và quản lý tất cả người dùng trong hệ thống
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Thêm người dùng mới
          </Button>
        </div>

        {/* Role Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex gap-2">
            {roleTabs.map((tab) => {
              // Đếm số lượng users theo role
              const count = tab.value === 'all' 
                ? users.length 
                : users.filter((user) => {
                    const userRoleName = user.roleName || '';
                    const userRoleNormalized = normalizeRoleName(userRoleName);
                    const possibleRoleNames = roleNameMap[tab.value] || [tab.value];
                    
                    // Thử match với các role names trong map
                    let matched = possibleRoleNames.some((roleName) => {
                      const targetRoleNormalized = normalizeRoleName(roleName);
                      return (
                        userRoleNormalized === targetRoleNormalized ||
                        userRoleName === roleName ||
                        userRoleName?.toUpperCase() === roleName?.toUpperCase()
                      );
                    });
                    
                    // Nếu chưa match, thử match với keywords tiếng Việt
                    if (!matched) {
                      if (tab.value === 'DEALER_STAFF') {
                        matched = userRoleNormalized.includes('NHAN_VIEN_CUA_HANG') || 
                                 userRoleName?.includes('Nhân viên cửa hàng') ||
                                 userRoleName?.includes('nhân viên cửa hàng');
                      } else if (tab.value === 'DEALER_MANAGER') {
                        matched = userRoleNormalized.includes('QUAN_LY_CUA_HANG') || 
                                 userRoleName?.includes('Quản lý cửa hàng') ||
                                 userRoleName?.includes('quản lý cửa hàng');
                      } else if (tab.value === 'EVM_STAFF') {
                        matched = userRoleNormalized.includes('NHAN_VIEN_HANG') || 
                                 userRoleName?.includes('Nhân viên hãng') ||
                                 userRoleName?.includes('nhân viên hãng') ||
                                 userRoleName?.includes('Nhân viên hãng xe') ||
                                 userRoleName?.includes('nhân viên hãng xe');
                      }
                    }
                    
                    return matched;
                  }).length;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveRoleTab(tab.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeRoleTab === tab.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <SearchBar
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : isUnauthorized ? (
            <div className="p-8 text-center">
              <div className="text-yellow-600 text-lg font-medium mb-2">
                ⚠️ Bạn chưa đăng nhập hoặc token đã hết hạn
              </div>
              <div className="text-gray-600 text-sm mb-4">
                Vui lòng đăng nhập để truy cập các tính năng này.
              </div>
              <a
                href="/login"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đi đến trang đăng nhập
              </a>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-2">Không có dữ liệu</p>
              {activeRoleTab !== 'all' && (
                <p className="text-sm text-gray-400">
                  Không tìm thấy user với role: {activeRoleTab}
                </p>
              )}
              {users.length > 0 && (
                <div className="mt-4 text-xs text-gray-400">
                  <p>Debug: Tổng số users: {users.length}</p>
                  <p>Role names trong data: {[...new Set(users.map(u => u.roleName).filter(Boolean))].join(', ')}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head className="w-12 text-center">
                      <input type="checkbox" className="rounded" />
                    </Table.Head>
                    <Table.Head>Tên người dùng</Table.Head>
                    <Table.Head>Email</Table.Head>
                    <Table.Head>Số điện thoại</Table.Head>
                    <Table.Head>Vai trò</Table.Head>
                    <Table.Head>Chi nhánh</Table.Head>
                    <Table.Head>Ngày tạo</Table.Head>
                    <Table.Head className="text-center">Hành động</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedUsers.map((user) => (
                    <Table.Row key={user.userId}>
                      <Table.Cell className="text-center">
                        <input type="checkbox" className="rounded" />
                      </Table.Cell>
                      <Table.Cell className="font-medium">{user.fullName || 'N/A'}</Table.Cell>
                      <Table.Cell>{user.email || 'N/A'}</Table.Cell>
                      <Table.Cell>{user.phone || 'N/A'}</Table.Cell>
                      <Table.Cell>{getRoleBadge(user.roleName)}</Table.Cell>
                      <Table.Cell>{user.storeName || 'N/A'}</Table.Cell>
                      <Table.Cell>{formatDate(user.createdAt)}</Table.Cell>
                      <Table.Cell className="text-center">
                        <div className="relative flex justify-center">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === user.userId ? null : user.userId)}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {openMenuId === user.userId && (
                            <div className="absolute right-0 mt-8 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
                              <button
                                onClick={() => handleEdit(user)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-200"
                              >
                                <Edit size={16} />
                                Chỉnh sửa
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-200"
                              >
                                {user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                              </button>
                              <button
                                onClick={() => handleDelete(user.userId)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={16} />
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} của{' '}
              {filteredUsers.length} người dùng
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Hiển thị tối đa 5 số trang
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm người dùng mới"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Họ và tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
            <Dropdown
              options={roles.map((role) => ({
                value: role.roleId?.toString(),
                label: role.roleName || `Role ${role.roleId}`,
              }))}
              value={formData.roleId}
              onChange={(value) => setFormData({ ...formData, roleId: value })}
              placeholder="Chọn vai trò"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh</label>
            <Dropdown
              options={[{ value: '', label: 'Không chọn' }, ...storeOptions]}
              value={formData.storeId}
              onChange={(value) => setFormData({ ...formData, storeId: value })}
              placeholder="Chọn chi nhánh (tùy chọn)"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1"
              disabled={isCreating}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isCreating}>
              {isCreating ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        title="Chỉnh sửa người dùng"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Họ và tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
            <Dropdown
              options={roles.map((role) => ({
                value: role.roleId?.toString(),
                label: role.roleName || `Role ${role.roleId}`,
              }))}
              value={formData.roleId}
              onChange={(value) => setFormData({ ...formData, roleId: value })}
              placeholder="Chọn vai trò"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chi nhánh</label>
            <Dropdown
              options={[{ value: '', label: 'Không chọn' }, ...storeOptions]}
              value={formData.storeId}
              onChange={(value) => setFormData({ ...formData, storeId: value })}
              placeholder="Chọn chi nhánh (tùy chọn)"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
              }}
              className="flex-1"
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isUpdating}>
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default UserManagementPage;
