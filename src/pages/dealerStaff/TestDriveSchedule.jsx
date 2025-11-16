import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllAppointmentsThunk, 
  createAppointmentThunk,
  updateAppointmentThunk,
  deleteAppointmentThunk,
  getAppointmentsByStoreThunk,
  getAppointmentsByStatusThunk,
  getAppointmentsByStaffThunk,
  getAppointmentsByModelThunk,
  getAppointmentsByCustomerThunk,
  updateAppointmentStatusThunk
} from '../../store/slices/appointmentSlice';
import { getAllCustomersThunk } from '../../store/slices/customerSlice';
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { showSuccess, showError } from '../../store/slices/snackbarSlice';
import AnimatedSelect from '@/components/ui/AnimatedSelect';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

function TestDriveSchedule({ onBack }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // Modern UI hooks
  const { toast, hideToast } = useToast();
  const { confirm } = useConfirm();

  // Redux state
  const appointments = useSelector((state) => state.appointments.items);
  const appointmentsStatus = useSelector((state) => state.appointments.status);
  const appointmentsError = useSelector((state) => state.appointments.error);
  const { items: customers, loading: customersLoading } = useSelector((state) => state.customers);
  const { items: models, loading: modelsLoading } = useSelector((state) => state.models);

  // Local UI state
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterModelId, setFilterModelId] = useState('');
  const [filterCustomerId, setFilterCustomerId] = useState('');
  
  // Form states
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  
  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: ''
  });

  const statusOptions = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Fetch initial data
  useEffect(() => {
    dispatch(getAllCustomersThunk());
    dispatch(getAllModelsThunk());
  }, [dispatch]);

  // Fetch appointments with filters
  useEffect(() => {
    if (filterStatus) {
      dispatch(getAppointmentsByStatusThunk(filterStatus));
    } else if (filterModelId) {
      dispatch(getAppointmentsByModelThunk(filterModelId));
    } else if (filterCustomerId) {
      dispatch(getAppointmentsByCustomerThunk(filterCustomerId));
    } else if (user?.storeId) {
      dispatch(getAppointmentsByStoreThunk(user.storeId));
    } else {
      dispatch(getAllAppointmentsThunk());
    }
  }, [dispatch, filterStatus, filterModelId, filterCustomerId, user?.storeId]);

  // Filter customers by store and search term
  const filteredCustomers = (customers || []).filter(customer => {
    // Filter by store for dealer-staff
    const matchesStore = !user?.storeId || customer.storeId === user.storeId || String(customer.storeId) === String(user.storeId);
    // Filter by search term
    const matchesSearch = !customerSearchTerm ||
      customer.fullName?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.phone?.includes(customerSearchTerm) ||
      customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase());
    return matchesStore && matchesSearch;
  });

  // Filter appointments by selected date (local filter)
  const filteredAppointments = appointments.filter(apt => {
    if (selectedDate && apt.startTime) {
      const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
      return aptDate === selectedDate;
    }
    return true;
  });

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-purple-100 text-purple-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'NO_SHOW': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'IN_PROGRESS': return 'Đang tiến hành';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      case 'NO_SHOW': return 'Không đến';
      default: return status;
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toISOString().split('T')[0];
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Helper functions
  const getCustomerName = (customerId) => {
    const customer = customers?.find(c => c.customerId === customerId);
    return customer ? customer.fullName : `Customer #${customerId}`;
  };

  const getModelName = (modelId) => {
    const model = models?.find(m => m.modelId === modelId);
    return model ? model.modelName : `Model #${modelId}`;
  };

  // CRUD Operations
  const handleAddAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      dispatch(showError({ message: 'Vui lòng chọn khách hàng' }));
      return;
    }
    
    if (!selectedModel) {
      dispatch(showError({ message: 'Vui lòng chọn mẫu xe' }));
      return;
    }
    
    try {
      // Combine date and time
      const startDateTime = new Date(`${newAppointment.date}T${newAppointment.time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour later

      const payload = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: 'CONFIRMED',
        modelId: selectedModel.modelId,
        customerId: selectedCustomer.customerId,
        staffId: user?.userId || 1,
        storeId: user?.storeId || 1
      };

      await dispatch(createAppointmentThunk(payload)).unwrap();
      dispatch(showSuccess({ message: 'Đã thêm lịch hẹn thành công!' }));
      
      // Reset form
      setNewAppointment({
        date: '',
        time: ''
      });
      setSelectedCustomer(null);
      setSelectedModel(null);
      setCustomerSearchTerm('');
      setShowAddModal(false);
      
      // Refresh data
      if (user?.storeId) {
        dispatch(getAppointmentsByStoreThunk(user.storeId));
      } else {
        dispatch(getAllAppointmentsThunk());
      }
    } catch (error) {
      dispatch(showError({ message: error || 'Không thể thêm lịch hẹn' }));
    }
  };

  const handleEditAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedAppointment) return;
    
    if (!selectedCustomer) {
      dispatch(showError({ message: 'Vui lòng chọn khách hàng' }));
      return;
    }
    
    if (!selectedModel) {
      dispatch(showError({ message: 'Vui lòng chọn mẫu xe' }));
      return;
    }

    try {
      const startDateTime = new Date(`${newAppointment.date}T${newAppointment.time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

      const payload = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: selectedAppointment.status,
        modelId: selectedModel.modelId,
        customerId: selectedCustomer.customerId,
        staffId: selectedAppointment.staffId,
        storeId: selectedAppointment.storeId
      };

      await dispatch(updateAppointmentThunk({
        appointmentId: selectedAppointment.appointmentId,
        data: payload
      })).unwrap();

      dispatch(showSuccess({ message: 'Đã cập nhật lịch hẹn thành công!' }));
      setShowEditModal(false);
      setSelectedAppointment(null);
      setSelectedCustomer(null);
      setSelectedModel(null);
      setCustomerSearchTerm('');
      
      // Refresh data
      if (user?.storeId) {
        dispatch(getAppointmentsByStoreThunk(user.storeId));
      } else {
        dispatch(getAllAppointmentsThunk());
      }
    } catch (error) {
      dispatch(showError({ message: error || 'Không thể cập nhật lịch hẹn' }));
    }
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await dispatch(deleteAppointmentThunk(selectedAppointment.appointmentId)).unwrap();
      dispatch(showSuccess({ message: 'Đã xóa lịch hẹn thành công!' }));
      setShowDeleteModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      dispatch(showError({ message: error || 'Không thể xóa lịch hẹn' }));
    }
  };

  const handleUpdateStatus = async (appointment, newStatus) => {
    try {
      await dispatch(updateAppointmentStatusThunk({
        appointmentId: appointment.appointmentId,
        status: newStatus
      })).unwrap();

      const statusMessages = {
        'CONFIRMED': 'xác nhận',
        'IN_PROGRESS': 'bắt đầu',
        'COMPLETED': 'hoàn thành',
        'CANCELLED': 'hủy',
        'NO_SHOW': 'đánh dấu không đến'
      };

      dispatch(showSuccess({ message: `Đã ${statusMessages[newStatus] || 'cập nhật'} lịch hẹn!` }));
      
      // Refresh data
      if (user?.storeId) {
        dispatch(getAppointmentsByStoreThunk(user.storeId));
      } else {
        dispatch(getAllAppointmentsThunk());
      }
    } catch (error) {
      dispatch(showError({ message: error || 'Không thể cập nhật trạng thái' }));
    }
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    
    // Find and set customer
    const customer = customers?.find(c => c.customerId === appointment.customerId);
    setSelectedCustomer(customer || null);
    
    // Find and set model
    const model = models?.find(m => m.modelId === appointment.modelId);
    setSelectedModel(model || null);
    
    setNewAppointment({
      date: formatDate(appointment.startTime),
      time: formatTime(appointment.startTime)
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment(prev => ({ ...prev, [name]: value }));
  };

  // Loading state
  const isLoading = appointmentsStatus === 'loading';

  return (
    <div className="max-w-7xl mx-auto">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600">Tổng số: {filteredAppointments.length} lịch hẹn</p>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <motion.svg 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </motion.svg>
              Thêm lịch hẹn
            </motion.button>
            {onBack && (
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
              </motion.button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Lọc theo ngày:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{getStatusText(status)}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Model ID:</label>
              <input
                type="number"
                value={filterModelId}
                onChange={(e) => setFilterModelId(e.target.value)}
                placeholder="Nhập Model ID"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-32"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Customer ID:</label>
              <input
                type="number"
                value={filterCustomerId}
                onChange={(e) => setFilterCustomerId(e.target.value)}
                placeholder="Nhập Customer ID"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-32"
              />
            </div>

            {(selectedDate || filterStatus || filterModelId || filterCustomerId) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedDate('');
                  setFilterStatus('');
                  setFilterModelId('');
                  setFilterCustomerId('');
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Xóa tất cả bộ lọc
              </motion.button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {appointmentsError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800"
          >
            <p className="font-medium">Lỗi: {appointmentsError}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-4">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 text-lg">Không có lịch hẹn nào</p>
            <p className="text-gray-500 text-sm mt-2">Nhấn "Thêm lịch hẹn" để tạo lịch mới</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Xe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <motion.tr
                    key={appointment.appointmentId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDateTime(appointment.startTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getCustomerName(appointment.customerId)}</div>
                      <div className="text-sm text-gray-500">ID: {appointment.customerId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getModelName(appointment.modelId)}</div>
                      <div className="text-sm text-gray-500">ID: {appointment.modelId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {appointment.status?.toUpperCase() === 'CONFIRMED' && (
                          <motion.button
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(appointment, 'IN_PROGRESS')}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow hover:shadow-md transition-all text-xs"
                          >
                            Bắt đầu
                          </motion.button>
                        )}
                        {appointment.status?.toUpperCase() === 'IN_PROGRESS' && (
                          <motion.button
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(appointment, 'COMPLETED')}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow hover:shadow-md transition-all text-xs"
                          >
                            Hoàn thành
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openEditModal(appointment)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow hover:shadow-md transition-all text-xs"
                        >
                          Sửa
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openDeleteModal(appointment)}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow hover:shadow-md transition-all text-xs"
                        >
                          Xóa
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
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
              className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Thêm lịch hẹn mới</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-4">
                {/* Customer Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khách hàng *</label>
                  {selectedCustomer ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{selectedCustomer.fullName}</p>
                        <p className="text-sm text-gray-600">{selectedCustomer.phone} • {selectedCustomer.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="Tìm khách hàng theo tên, số điện thoại, email..."
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 mb-2"
                      />
                      {customerSearchTerm && (
                        <div className="max-h-48 overflow-y-auto border rounded-lg">
                          {customersLoading ? (
                            <div className="p-3 text-center text-gray-500">Đang tải...</div>
                          ) : filteredCustomers.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">Không tìm thấy khách hàng</div>
                          ) : (
                            filteredCustomers.map(customer => (
                              <div
                                key={customer.customerId}
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setCustomerSearchTerm('');
                                }}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                              >
                                <p className="font-medium text-gray-900">{customer.fullName}</p>
                                <p className="text-sm text-gray-600">{customer.phone} • {customer.email}</p>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu xe *</label>
                  <AnimatedSelect
                    value={selectedModel?.modelId || ''}
                    onChange={(e) => {
                      const model = models?.find(m => m.modelId === parseInt(e.target.value));
                      setSelectedModel(model || null);
                    }}
                    placeholder={modelsLoading ? 'Đang tải...' : 'Chọn mẫu xe'}
                    disabled={modelsLoading}
                    options={[
                      { value: '', label: modelsLoading ? 'Đang tải...' : 'Chọn mẫu xe' },
                      ...(modelsLoading ? [] : models?.map(model => ({
                        value: model.modelId.toString(),
                        label: `${model.modelName} - ${model.modelId}`
                      })) || [])
                    ]}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hẹn *</label>
                    <input
                      type="date"
                      name="date"
                      value={newAppointment.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ hẹn *</label>
                    <AnimatedSelect
                      name="time"
                      value={newAppointment.time}
                      onChange={handleInputChange}
                      placeholder="Chọn giờ"
                      options={[
                        { value: '', label: 'Chọn giờ' },
                        ...timeSlots.map(time => ({
                          value: time,
                          label: time
                        }))
                      ]}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
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
                    disabled={isLoading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Thêm lịch hẹn'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Appointment Modal */}
      <AnimatePresence>
        {showEditModal && selectedAppointment && (
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
              className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa lịch hẹn</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditAppointment} className="space-y-4">
                {/* Customer Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Khách hàng *</label>
                  {selectedCustomer ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{selectedCustomer.fullName}</p>
                        <p className="text-sm text-gray-600">{selectedCustomer.phone} • {selectedCustomer.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="Tìm khách hàng theo tên, số điện thoại, email..."
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                      />
                      {customerSearchTerm && (
                        <div className="max-h-48 overflow-y-auto border rounded-lg">
                          {customersLoading ? (
                            <div className="p-3 text-center text-gray-500">Đang tải...</div>
                          ) : filteredCustomers.length === 0 ? (
                            <div className="p-3 text-center text-gray-500">Không tìm thấy khách hàng</div>
                          ) : (
                            filteredCustomers.map(customer => (
                              <div
                                key={customer.customerId}
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setCustomerSearchTerm('');
                                }}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                              >
                                <p className="font-medium text-gray-900">{customer.fullName}</p>
                                <p className="text-sm text-gray-600">{customer.phone} • {customer.email}</p>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu xe *</label>
                  <AnimatedSelect
                    value={selectedModel?.modelId || ''}
                    onChange={(e) => {
                      const model = models?.find(m => m.modelId === parseInt(e.target.value));
                      setSelectedModel(model || null);
                    }}
                    placeholder={modelsLoading ? 'Đang tải...' : 'Chọn mẫu xe'}
                    disabled={modelsLoading}
                    options={[
                      { value: '', label: modelsLoading ? 'Đang tải...' : 'Chọn mẫu xe' },
                      ...(modelsLoading ? [] : models?.map(model => ({
                        value: model.modelId.toString(),
                        label: `${model.modelName} - ${model.modelId}`
                      })) || [])
                    ]}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hẹn *</label>
                    <input
                      type="date"
                      name="date"
                      value={newAppointment.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ hẹn *</label>
                    <AnimatedSelect
                      name="time"
                      value={newAppointment.time}
                      onChange={handleInputChange}
                      placeholder="Chọn giờ"
                      options={[
                        { value: '', label: 'Chọn giờ' },
                        ...timeSlots.map(time => ({
                          value: time,
                          label: time
                        }))
                      ]}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
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
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Đang xử lý...' : 'Cập nhật'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
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
              className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-md"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                <p className="text-gray-600 mb-4">
                  Bạn có chắc chắn muốn xóa lịch hẹn này không? Hành động này không thể hoàn tác.
                </p>
                <div className="flex gap-3 justify-center">
                  <motion.button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    onClick={handleDeleteAppointment}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Đang xóa...' : 'Xóa'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TestDriveSchedule;

