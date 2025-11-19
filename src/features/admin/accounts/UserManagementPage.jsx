import { useState } from 'react';
import { MoreVertical, Plus, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import SearchBar from '../../../components/shared/SearchBar';
import FilterSection from '../../../components/shared/FilterSection';
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
  useGetUserStatusesQuery,
} from '../../../api/admin/userApi';
import { useGetAllRolesQuery } from '../../../api/admin/roleApi';
import { useGetAllStoresQuery } from '../../../api/admin/storeApi';

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
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
  const { data: statusesResponse } = useGetUserStatusesQuery();
  const { data: rolesResponse } = useGetAllRolesQuery();
  const { data: storesResponse } = useGetAllStoresQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = usersResponse?.data || [];
  const statuses = statusesResponse?.data || ['ACTIVE', 'INACTIVE'];
  const roles = rolesResponse?.data || [];
  const stores = storesResponse?.data || [];

  // Tạo role options từ API
  const roleOptions = [
    { value: 'all', label: 'Tất cả' },
    ...roles.map((role) => ({
      value: role.roleName || role.roleId,
      label: role.roleName || `Role ${role.roleId}`,
    })),
  ];

  // Tạo store options
  const storeOptions = stores.map((store) => ({
    value: store.storeId,
    label: store.storeName || `Chi nhánh ${store.storeId}`,
  }));

  const statusOptions = [
    { value: 'all', label: 'Tất cả' },
    ...statuses.map((status) => ({
      value: status,
      label: status === 'ACTIVE' ? 'Hoạt động' : status === 'INACTIVE' ? 'Bị khóa' : status,
    })),
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.roleName === roleFilter || user.roleId?.toString() === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

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

  const getStatusIndicator = (status) => {
    const statusMap = {
      ACTIVE: { color: 'bg-green-500', label: 'Hoạt động' },
      INACTIVE: { color: 'bg-red-500', label: 'Bị khóa' },
      PENDING: { color: 'bg-yellow-500', label: 'Chờ duyệt' },
    };
    const config = statusMap[status] || { color: 'bg-gray-500', label: status || 'N/A' };
    return (
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${config.color}`}></span>
        <span className="text-sm text-gray-700">{config.label}</span>
      </div>
    );
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
      console.error(error);
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
      console.error(error);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa user này?')) {
      try {
        await deleteUser(userId).unwrap();
      } catch (error) {
        alert(error?.data?.message || 'Có lỗi xảy ra khi xóa user');
        console.error(error);
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
      console.error(error);
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

        <div className="flex items-center justify-between gap-4">
          <SearchBar
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        <FilterSection
          filters={[
            {
              label: 'Vai trò',
              options: roleOptions,
              value: roleFilter,
              onChange: setRoleFilter,
              placeholder: 'Tất cả',
            },
            {
              label: 'Trạng thái',
              options: statusOptions,
              value: statusFilter,
              onChange: setStatusFilter,
              placeholder: 'Tất cả',
            },
          ]}
        />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head className="w-12">
                    <input type="checkbox" className="rounded" />
                  </Table.Head>
                  <Table.Head>Tên người dùng</Table.Head>
                  <Table.Head>Email</Table.Head>
                  <Table.Head>Số điện thoại</Table.Head>
                  <Table.Head>Vai trò</Table.Head>
                  <Table.Head>Chi nhánh</Table.Head>
                  <Table.Head>Trạng thái</Table.Head>
                  <Table.Head>Ngày tạo</Table.Head>
                  <Table.Head className="text-right">Hành động</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredUsers.map((user) => (
                  <Table.Row key={user.userId}>
                    <Table.Cell>
                      <input type="checkbox" className="rounded" />
                    </Table.Cell>
                    <Table.Cell className="font-medium">{user.fullName || 'N/A'}</Table.Cell>
                    <Table.Cell>{user.email || 'N/A'}</Table.Cell>
                    <Table.Cell>{user.phone || 'N/A'}</Table.Cell>
                    <Table.Cell>{getRoleBadge(user.roleName)}</Table.Cell>
                    <Table.Cell>{user.storeName || 'N/A'}</Table.Cell>
                    <Table.Cell>{getStatusIndicator(user.status)}</Table.Cell>
                    <Table.Cell>{formatDate(user.createdAt)}</Table.Cell>
                    <Table.Cell>
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === user.userId ? null : user.userId)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === user.userId && (
                          <div className="absolute right-0 mt-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleEdit(user)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                            >
                              <Edit size={16} />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
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
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <p>
            Hiển thị 1-{filteredUsers.length} của {filteredUsers.length} người dùng
          </p>
        </div>
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
