import { useState, useMemo } from 'react';
import { Search, Plus, Edit, UserPlus, AlertCircle, X } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import {
  useGetAllStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useUpdateStaffStatusMutation,
  useDeleteStaffMutation,
} from '../../../api/dealerManager/staffApi';
import { useGetAllRolesQuery } from '../../../api/admin/roleApi';

const StaffPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleId: '',
  });

  const { data: staffData, isLoading, error } = useGetAllStaffQuery();
  const { data: rolesData } = useGetAllRolesQuery();
  const [createStaff, { isLoading: isCreating }] = useCreateStaffMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();
  const [updateStaffStatus] = useUpdateStaffStatusMutation();
  const [deleteStaff] = useDeleteStaffMutation();

  const allStaff = staffData?.data || [];
  const roles = rolesData?.data || [];

  // Filter chỉ lấy Dealer Staff
  const staff = useMemo(() => {
    return allStaff.filter((user) => {
      const roleName = user.roleName || '';
      return (
        roleName.includes('Nhân viên cửa hàng') ||
        roleName.includes('DEALER_STAFF') ||
        roleName.toLowerCase().includes('dealer staff')
      );
    });
  }, [allStaff]);

  // Filter staff
  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesSearch =
        member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone?.includes(searchTerm);
      return matchesSearch;
    });
  }, [staff, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { variant: 'success', label: 'Hoạt động' },
      DISABLED: { variant: 'error', label: 'Bị khóa' },
      INACTIVE: { variant: 'error', label: 'Bị khóa' }, // Fallback cho INACTIVE
      PENDING: { variant: 'warning', label: 'Chờ duyệt' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName?.trim()) {
      setErrorModal({ isOpen: true, message: 'Vui lòng nhập họ và tên' });
      return;
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorModal({ isOpen: true, message: 'Email không hợp lệ' });
      return;
    }
    
    if (!formData.phone || !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      setErrorModal({ isOpen: true, message: 'Số điện thoại phải có 10-11 chữ số' });
      return;
    }
    
    if (!formData.password || formData.password.length < 6) {
      setErrorModal({ isOpen: true, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      return;
    }
    
    try {
      // Tìm roleId cho Dealer Staff
      const dealerStaffRole = roles.find(
        (role) =>
          role.roleName?.includes('Nhân viên cửa hàng') ||
          role.roleName?.includes('DEALER_STAFF')
      );
      if (!dealerStaffRole) {
        setErrorModal({
          isOpen: true,
          message: 'Không tìm thấy role Dealer Staff',
        });
        return;
      }

      await createStaff({
        ...formData,
        roleId: dealerStaffRole.roleId,
      }).unwrap();
      setIsCreateModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        roleId: '',
      });
      setSuccessModal({
        isOpen: true,
        message: 'Tạo nhân viên thành công!',
      });
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.error || 'Có lỗi xảy ra khi tạo nhân viên';
      setErrorModal({
        isOpen: true,
        message: errorMessage,
      });
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleEdit = (member) => {
    setSelectedStaff(member);
    setFormData({
      fullName: member.fullName || '',
      email: member.email || '',
      phone: member.phone || '',
      password: '',
      roleId: member.roleId?.toString() || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName?.trim()) {
      setErrorModal({ isOpen: true, message: 'Vui lòng nhập họ và tên' });
      return;
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorModal({ isOpen: true, message: 'Email không hợp lệ' });
      return;
    }
    
    if (!formData.phone || !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      setErrorModal({ isOpen: true, message: 'Số điện thoại phải có 10-11 chữ số' });
      return;
    }
    
    // Password chỉ validate nếu có nhập (khi update có thể không đổi password)
    if (formData.password && formData.password.length < 6) {
      setErrorModal({ isOpen: true, message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      return;
    }
    
    try {
      // Nếu không có password thì không gửi password field
      const updateData = { ...formData };
      if (!formData.password) {
        delete updateData.password;
      }
      
      await updateStaff({
        userId: selectedStaff.userId,
        ...updateData,
      }).unwrap();
      setIsEditModalOpen(false);
      setSelectedStaff(null);
      setSuccessModal({
        isOpen: true,
        message: 'Cập nhật nhân viên thành công!',
      });
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.error || 'Có lỗi xảy ra khi cập nhật nhân viên';
      setErrorModal({
        isOpen: true,
        message: errorMessage,
      });
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await deleteStaff(userId).unwrap();
        setSuccessModal({
          isOpen: true,
          message: 'Xóa nhân viên thành công!',
        });
      } catch (error) {
        const errorMessage = error?.data?.message || error?.data?.error || 'Có lỗi xảy ra khi xóa nhân viên';
        setErrorModal({
          isOpen: true,
          message: errorMessage,
        });
        if (import.meta.env.DEV) {
          console.error(error);
        }
      }
    }
  };

  const handleToggleStatus = async (member) => {
    if (!member || !member.userId) {
      setErrorModal({
        isOpen: true,
        message: 'Thông tin nhân viên không hợp lệ',
      });
      return;
    }

    try {
      const currentStatus = member.status?.toUpperCase();
      // Backend chỉ chấp nhận: DISABLED, ACTIVE, PENDING
      // Nếu đang ACTIVE thì chuyển sang DISABLED, ngược lại chuyển sang ACTIVE
      const newStatus = (currentStatus === 'ACTIVE' || currentStatus === 'PENDING') ? 'DISABLED' : 'ACTIVE';
      
      if (import.meta.env.DEV) {
        console.log('Updating staff status:', {
          userId: member.userId,
          currentStatus,
          newStatus,
        });
      }

      const result = await updateStaffStatus({
        userId: member.userId,
        status: newStatus,
      }).unwrap();

      if (import.meta.env.DEV) {
        console.log('Update status result:', result);
      }

      setSuccessModal({
        isOpen: true,
        message: `Đã ${newStatus === 'DISABLED' ? 'khóa' : 'kích hoạt'} tài khoản thành công!`,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating staff status:', {
          error,
          response: error?.data,
          status: error?.status,
          statusText: error?.statusText,
        });
      }

      // Lấy thông báo lỗi từ nhiều nguồn có thể
      const errorMessage = 
        error?.data?.message || 
        error?.data?.error || 
        error?.data?.errorMessage ||
        error?.message ||
        `Có lỗi xảy ra khi cập nhật trạng thái${error?.status ? ` (${error.status})` : ''}`;
      
      setErrorModal({
        isOpen: true,
        message: errorMessage,
      });
    }
  };

  if (isLoading) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </DealerManagerLayout>
    );
  }

  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = error?.status === 401;
  
  if (isUnauthorized) {
    return (
      <DealerManagerLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-yellow-600 text-lg font-medium">
            ⚠️ Bạn chưa đăng nhập hoặc token đã hết hạn
          </div>
          <div className="text-gray-600 text-sm">
            Vui lòng đăng nhập để truy cập các tính năng này.
          </div>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đi đến trang đăng nhập
          </a>
        </div>
      </DealerManagerLayout>
    );
  }

  if (error) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>
        </div>
      </DealerManagerLayout>
    );
  }

  return (
    <DealerManagerLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Đội Ngũ</h1>
            <p className="text-gray-600 mt-1">Xem và quản lý nhân viên tại đại lý.</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus size={20} className="mr-2" />
            Thêm Nhân viên
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <SearchBar
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {paginatedStaff.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Tên nhân viên</Table.Head>
                      <Table.Head>Email</Table.Head>
                      <Table.Head>Số điện thoại</Table.Head>
                      <Table.Head>Vai trò</Table.Head>
                      <Table.Head>Trạng thái</Table.Head>
                      <Table.Head className="text-center">Hành động</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedStaff.map((member) => (
                      <Table.Row key={member.userId}>
                        <Table.Cell className="font-medium">{member.fullName || 'N/A'}</Table.Cell>
                        <Table.Cell>{member.email || 'N/A'}</Table.Cell>
                        <Table.Cell>{member.phone || 'N/A'}</Table.Cell>
                        <Table.Cell>{member.roleName || 'Dealer Staff'}</Table.Cell>
                        <Table.Cell>{getStatusBadge(member.status)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(member)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(member)}
                              disabled={!member.userId}
                              className={`p-2 rounded transition-colors ${
                                member.status === 'ACTIVE' || member.status === 'PENDING'
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={member.status === 'ACTIVE' || member.status === 'PENDING' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                            >
                              {(member.status === 'ACTIVE' || member.status === 'PENDING') ? 'Khóa' : 'Kích hoạt'}
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredStaff.length)} của{' '}
                  {filteredStaff.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Thêm Nhân viên Mới"
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
          setSelectedStaff(null);
        }}
        title="Chỉnh sửa Nhân viên"
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
          <Input
            label="Mật khẩu mới (để trống nếu không đổi)"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedStaff(null);
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

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Lỗi"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700">{errorModal.message}</p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setErrorModal({ isOpen: false, message: '' })}
              variant="outline"
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Thành công"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700">{successModal.message}</p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setSuccessModal({ isOpen: false, message: '' })}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </DealerManagerLayout>
  );
};

export default StaffPage;

