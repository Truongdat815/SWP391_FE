import { useState, useMemo } from 'react';
import { Search, Plus, Calendar, Clock, User, Car } from 'lucide-react';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import {
  useGetAllAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useGetAppointmentStatusesQuery,
} from '../../../api/public/appointmentApi';
import { useGetAllCustomersQuery } from '../../../api/dealerStaff/customerApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';

const AppointmentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    modelId: '',
    appointmentDate: '',
    notes: '',
  });

  const { data: appointmentsData, isLoading, error } = useGetAllAppointmentsQuery();
  const { data: customersData } = useGetAllCustomersQuery();
  const { data: modelsData } = useGetAllModelsQuery();
  const { data: statusesData } = useGetAppointmentStatusesQuery();
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();
  const [updateAppointment, { isLoading: isUpdating }] = useUpdateAppointmentMutation();
  const [deleteAppointment] = useDeleteAppointmentMutation();

  const appointments = Array.isArray(appointmentsData?.data) ? appointmentsData.data : [];
  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  const models = Array.isArray(modelsData?.data) ? modelsData.data : [];
  const statuses = Array.isArray(statusesData?.data) ? statusesData.data : [];

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    return appointments.filter((apt) => {
      const matchesSearch =
        apt.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointmentId?.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    const statusMap = {
      SCHEDULED: { variant: 'info', label: 'Đã lên lịch' },
      CONFIRMED: { variant: 'success', label: 'Đã xác nhận' },
      COMPLETED: { variant: 'success', label: 'Hoàn thành' },
      CANCELLED: { variant: 'error', label: 'Đã hủy' },
      NO_SHOW: { variant: 'warning', label: 'Không đến' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Lấy staffId từ user hiện tại (có thể lấy từ auth state)
      const staffId = 1; // TODO: Lấy từ auth state
      await createAppointment({
        ...formData,
        staffId: parseInt(staffId),
        customerId: parseInt(formData.customerId),
        modelId: parseInt(formData.modelId),
      }).unwrap();
      setIsCreateModalOpen(false);
      setFormData({
        customerId: '',
        modelId: '',
        appointmentDate: '',
        notes: '',
      });
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo lịch hẹn');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      customerId: appointment.customerId?.toString() || '',
      modelId: appointment.modelId?.toString() || '',
      appointmentDate: appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toISOString().slice(0, 16)
        : '',
      notes: appointment.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateAppointment({
        id: selectedAppointment.appointmentId,
        ...formData,
        customerId: parseInt(formData.customerId),
        modelId: parseInt(formData.modelId),
      }).unwrap();
      setIsEditModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi cập nhật lịch hẹn');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) {
      try {
        await deleteAppointment(id).unwrap();
      } catch (error) {
        alert(error?.data?.message || 'Có lỗi xảy ra khi xóa lịch hẹn');
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
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Lịch hẹn</h1>
            <p className="text-gray-600 mt-1">Xem và quản lý lịch hẹn lái thử</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Tạo Lịch hẹn
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm theo tên khách hàng, mẫu xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                ...statuses.map((status) => ({ value: status, label: status })),
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Mã</Table.Head>
                  <Table.Head>Khách hàng</Table.Head>
                  <Table.Head>Mẫu xe</Table.Head>
                  <Table.Head>Thời gian</Table.Head>
                  <Table.Head>Trạng thái</Table.Head>
                  <Table.Head>Ghi chú</Table.Head>
                  <Table.Head className="text-right">Hành động</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredAppointments.map((appointment) => (
                  <Table.Row key={appointment.appointmentId}>
                    <Table.Cell className="font-medium">#{appointment.appointmentId}</Table.Cell>
                    <Table.Cell>{appointment.customerName || 'N/A'}</Table.Cell>
                    <Table.Cell>{appointment.modelName || 'N/A'}</Table.Cell>
                    <Table.Cell>{formatDateTime(appointment.appointmentDate)}</Table.Cell>
                    <Table.Cell>{getStatusBadge(appointment.status)}</Table.Cell>
                    <Table.Cell className="max-w-xs truncate">{appointment.notes || '-'}</Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(appointment)}
                        >
                          <Calendar size={16} className="mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(appointment.appointmentId)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo Lịch hẹn mới"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khách hàng *
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
            >
              <option value="">Chọn khách hàng</option>
              {customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.fullName} - {customer.phone}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mẫu xe *
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.modelId}
              onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
              required
            >
              <option value="">Chọn mẫu xe</option>
              {models.map((model) => (
                <option key={model.modelId} value={model.modelId}>
                  {model.modelName}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Thời gian hẹn *"
            type="datetime-local"
            value={formData.appointmentDate}
            onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Nhập ghi chú (nếu có)"
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
          setSelectedAppointment(null);
        }}
        title="Chỉnh sửa Lịch hẹn"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Khách hàng *
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              required
            >
              <option value="">Chọn khách hàng</option>
              {customers.map((customer) => (
                <option key={customer.customerId} value={customer.customerId}>
                  {customer.fullName} - {customer.phone}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mẫu xe *
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.modelId}
              onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
              required
            >
              <option value="">Chọn mẫu xe</option>
              {models.map((model) => (
                <option key={model.modelId} value={model.modelId}>
                  {model.modelName}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Thời gian hẹn *"
            type="datetime-local"
            value={formData.appointmentDate}
            onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Nhập ghi chú (nếu có)"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedAppointment(null);
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

export default AppointmentsPage;

