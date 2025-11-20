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
  const [itemsPerPage] = useState(10);
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

  // Calculate stats
  const stats = useMemo(() => {
    const total = customers.length;
    const thisMonth = customers.filter((c) => {
      if (!c?.createdAt) return false;
      const created = new Date(c.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    return { total, thisMonth };
  }, [customers]);

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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-slate-900 text-3xl font-bold tracking-tight">Quản lý Khách hàng</p>
            <p className="text-slate-500 text-base font-normal leading-normal">
              Xem, tạo, chỉnh sửa và quản lý tất cả khách hàng tại đây.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus size={16} />
            <span>Thêm khách hàng</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200">
            <p className="text-slate-600 text-sm font-medium">Tổng số khách hàng</p>
            <div className="flex items-center gap-2">
              <p className="text-slate-900 text-3xl font-bold leading-tight">{stats.total.toLocaleString()}</p>
              <p className="text-green-600 text-sm font-medium">+15.3%</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200">
            <p className="text-slate-600 text-sm font-medium">Khách hàng mới (Tháng này)</p>
            <div className="flex items-center gap-2">
              <p className="text-slate-900 text-3xl font-bold leading-tight">{stats.thisMonth}</p>
              <p className="text-green-600 text-sm font-medium">+5.8%</p>
            </div>
          </div>
        </div>

        {/* Toolbar + Table */}
        <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-xl">
          {/* Toolbar and Search */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-slate-200">
            {/* SearchBar */}
            <div className="flex-1 min-w-[280px]">
              <label className="flex flex-col h-10 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-slate-500 flex bg-slate-100 items-center justify-center pl-3 rounded-l-lg border border-r-0 border-slate-300">
                    <Search size={20} />
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 bg-white h-full placeholder:text-slate-500 px-3 rounded-l-none border-l-0 text-sm font-normal"
                    placeholder="Tìm kiếm theo tên, SĐT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </label>
            </div>
            {/* ToolBar */}
            <div className="flex gap-2">
              <button className="flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50">
                <span>↕</span>
                <span>Sắp xếp theo: Mới nhất</span>
              </button>
            </div>
          </div>

          {/* Data Table */}
          {paginatedCustomers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3" scope="col">Tên khách hàng</th>
                      <th className="px-6 py-3" scope="col">Số điện thoại</th>
                      <th className="px-6 py-3" scope="col">Email</th>
                      <th className="px-6 py-3" scope="col">Địa chỉ</th>
                      <th className="px-6 py-3" scope="col">Ngày tham gia</th>
                      <th className="px-6 py-3" scope="col"><span className="sr-only">Hành động</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCustomers.map((customer) => (
                      <tr key={customer.customerId} className="bg-white border-b hover:bg-slate-50">
                        <th className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap" scope="row">
                          {customer.fullName || 'N/A'}
                        </th>
                        <td className="px-6 py-4">{customer.phone || 'N/A'}</td>
                        <td className="px-6 py-4">{customer.email || 'N/A'}</td>
                        <td className="px-6 py-4">{customer.address || 'N/A'}</td>
                        <td className="px-6 py-4">
                          {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              aria-label="Xem chi tiết"
                              className="p-2 rounded-md hover:bg-slate-200 text-slate-600"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              aria-label="Chỉnh sửa"
                              onClick={() => handleEdit(customer)}
                              className="p-2 rounded-md hover:bg-slate-200 text-slate-600"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              aria-label="Xóa"
                              onClick={() => handleDelete(customer.customerId)}
                              className="p-2 rounded-md hover:bg-red-100 text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Component */}
              <nav aria-label="Table navigation" className="flex items-center justify-between p-4">
                <span className="text-sm font-normal text-slate-500">
                  Hiển thị <span className="font-semibold text-slate-900">{startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)}</span> trên{' '}
                  <span className="font-semibold text-slate-900">{filteredCustomers.length}</span>
                </span>
                <ul className="inline-flex items-center -space-x-px">
                  <li>
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center h-8 px-3 ml-0 leading-tight text-slate-500 bg-white border border-slate-300 rounded-l-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                      ←
                    </button>
                  </li>
                  {[...Array(Math.min(3, totalPages))].map((_, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`flex items-center justify-center h-8 px-3 leading-tight ${
                          currentPage === idx + 1
                            ? 'text-primary border border-slate-300 bg-primary/10 hover:bg-primary/20'
                            : 'text-slate-500 bg-white border border-slate-300 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center h-8 px-3 leading-tight text-slate-500 bg-white border border-slate-300 rounded-r-lg hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                      →
                    </button>
                  </li>
                </ul>
              </nav>
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
