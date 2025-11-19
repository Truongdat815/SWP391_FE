import { useState, useMemo } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Dropdown from '../../../components/ui/Dropdown';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import {
  useGetAllCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from '../../../api/dealerStaff/customerApi';

const CustomerManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffFilter, setStaffFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    identificationNumber: '',
  });

  const { data: customersData, isLoading, error } = useGetAllCustomersQuery();
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  const customers = Array.isArray(customersData?.data) ? customersData.data : [];

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    return customers.filter((customer) => {
      const matchesSearch =
        customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [customers, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const getStatusBadge = (status, purchaseHistory) => {
    if (purchaseHistory > 0) {
      return <Badge variant="success">Đã mua hàng</Badge>;
    }
    const statusMap = {
      NEW: { variant: 'info', label: 'Mới' },
      POTENTIAL: { variant: 'warning', label: 'Tiềm năng' },
      COMPLAINT: { variant: 'error', label: 'Khiếu nại' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'Mới' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCustomer(formData).unwrap();
      setIsCreateModalOpen(false);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        identificationNumber: '',
      });
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo khách hàng');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      fullName: customer.fullName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      identificationNumber: customer.identificationNumber || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCustomer({ id: selectedCustomer.customerId, ...formData }).unwrap();
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi cập nhật khách hàng');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await deleteCustomer(id).unwrap();
      } catch (error) {
        alert(error?.data?.message || 'Có lỗi xảy ra khi xóa khách hàng');
        if (import.meta.env.DEV) {
          console.error(error);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </DealerStaffLayout>
    );
  }

  if (error) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
        </div>
      </DealerStaffLayout>
    );
  }

  return (
    <DealerStaffLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách Khách hàng</h1>
            <p className="text-gray-600 mt-1">Quản lý, tìm kiếm và thêm mới khách hàng.</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Thêm Khách Hàng
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm theo tên, SĐT, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'NEW', label: 'Mới' },
                { value: 'POTENTIAL', label: 'Tiềm năng' },
                { value: 'PURCHASED', label: 'Đã mua hàng' },
                { value: 'COMPLAINT', label: 'Khiếu nại' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Tất cả nhân viên' },
                { value: '1', label: 'Trần Thị Bích' },
                { value: '2', label: 'Phạm Văn Dũng' },
              ]}
              value={staffFilter}
              onChange={setStaffFilter}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {paginatedCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head className="w-12">
                        <input type="checkbox" className="rounded" />
                      </Table.Head>
                      <Table.Head>TÊN KHÁCH HÀNG</Table.Head>
                      <Table.Head>SỐ ĐIỆN THOẠI</Table.Head>
                      <Table.Head>EMAIL</Table.Head>
                      <Table.Head>LỊCH SỬ MUA</Table.Head>
                      <Table.Head>TRẠNG THÁI</Table.Head>
                      <Table.Head>NHÂN VIÊN PHỤ TRÁCH</Table.Head>
                      <Table.Head className="text-center">HÀNH ĐỘNG</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedCustomers.map((customer) => (
                      <Table.Row key={customer.customerId}>
                        <Table.Cell>
                          <input type="checkbox" className="rounded" />
                        </Table.Cell>
                        <Table.Cell className="font-medium">{customer.fullName || 'N/A'}</Table.Cell>
                        <Table.Cell>{customer.phone || 'N/A'}</Table.Cell>
                        <Table.Cell>{customer.email || 'N/A'}</Table.Cell>
                        <Table.Cell>{customer.purchaseHistory || 0} xe</Table.Cell>
                        <Table.Cell>
                          {getStatusBadge(customer.status, customer.purchaseHistory || 0)}
                        </Table.Cell>
                        <Table.Cell>{customer.responsibleStaff || 'N/A'}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(customer)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(customer.customerId)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 size={16} />
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
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} của{' '}
                  {filteredCustomers.length}
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
                  {Array.from({ length: Math.min(totalPages, 25) }, (_, i) => i + 1)
                    .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                    .map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  {totalPages > 3 && <span className="px-2">...</span>}
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
        title="Thêm Khách Hàng Mới"
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
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <Input
            label="CCCD/CMND"
            value={formData.identificationNumber}
            onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
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
          setSelectedCustomer(null);
        }}
        title="Chỉnh sửa Khách Hàng"
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
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <Input
            label="CCCD/CMND"
            value={formData.identificationNumber}
            onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
            required
          />
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedCustomer(null);
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
    </DealerStaffLayout>
  );
};

export default CustomerManagementPage;

