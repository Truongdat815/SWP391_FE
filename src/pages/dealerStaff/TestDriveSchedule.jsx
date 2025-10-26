import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllAppointmentsThunk, 
  createAppointmentThunk,
  updateAppointmentThunk,
  deleteAppointmentThunk
} from '../../store/slices/appointmentSlice';
import { showSuccess, showError } from '../../store/slices/snackbarSlice';

function TestDriveSchedule({ onBack }) {
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Redux state
  const appointments = useSelector((state) => state.appointments.items);
  const appointmentsStatus = useSelector((state) => state.appointments.status);
  const appointmentsError = useSelector((state) => state.appointments.error);

  // Local UI state
  const [selectedDate, setSelectedDate] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  
  const [newAppointment, setNewAppointment] = useState({
    customerName: '',
    phone: '',
    vehicleModel: '',
    date: '',
    time: '',
    notes: '',
    modelId: '',
    customerId: ''
  });

  const vehicleModels = [
    'Electra Ascent',
    'Electra CityLink',
    'Electra GrandTour',
    'Electra Micro',
    'Electra Summit',
    'Electra Velocity',
    'Electra UrbanPulse',
    'Electra Voyager'
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Fetch appointments on mount
  useEffect(() => {
    dispatch(getAllAppointmentsThunk());
  }, [dispatch]);

  // Filter appointments by selected date and store
  const filteredAppointments = appointments.filter(apt => {
    // Filter by store (staff can only see their store's appointments)
    const matchesStore = !user?.storeId || apt.storeId === user.storeId;
    
    // Filter by selected date
    if (selectedDate && apt.startTime) {
      const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
      return matchesStore && aptDate === selectedDate;
    }
    
    return matchesStore;
  });

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PENDING': return 'Chờ xác nhận';
      case 'CANCELLED': return 'Đã hủy';
      case 'COMPLETED': return 'Hoàn thành';
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

  // CRUD Operations
  const handleAddAppointment = async (e) => {
    e.preventDefault();
    
    try {
      // Combine date and time
      const startDateTime = new Date(`${newAppointment.date}T${newAppointment.time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour later

      const payload = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: 'PENDING',
        modelId: parseInt(newAppointment.modelId) || 1,
        customerId: parseInt(newAppointment.customerId) || 1,
        staffId: user?.userId || 1,
        storeId: user?.storeId || 1
      };

      await dispatch(createAppointmentThunk(payload)).unwrap();
      dispatch(showSuccess({ message: 'Đã thêm lịch hẹn thành công!' }));
      
      // Reset form
      setNewAppointment({
        customerName: '',
        phone: '',
        vehicleModel: '',
        date: '',
        time: '',
        notes: '',
        modelId: '',
        customerId: ''
      });
      setShowAddModal(false);
      
      // Refresh data
      dispatch(getAllAppointmentsThunk());
    } catch (error) {
      dispatch(showError({ message: error || 'Không thể thêm lịch hẹn' }));
    }
  };

  const handleEditAppointment = async (e) => {
    e.preventDefault();
    
    if (!selectedAppointment) return;

    try {
      const startDateTime = new Date(`${newAppointment.date}T${newAppointment.time}:00`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

      const payload = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: selectedAppointment.status,
        modelId: parseInt(newAppointment.modelId) || selectedAppointment.modelId,
        customerId: parseInt(newAppointment.customerId) || selectedAppointment.customerId,
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
      
      // Refresh data
      dispatch(getAllAppointmentsThunk());
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
      await dispatch(updateAppointmentThunk({
        appointmentId: appointment.appointmentId,
        data: {
          ...appointment,
          status: newStatus
        }
      })).unwrap();

      dispatch(showSuccess({ message: `Đã ${newStatus === 'CONFIRMED' ? 'xác nhận' : 'cập nhật'} lịch hẹn!` }));
      dispatch(getAllAppointmentsThunk());
    } catch (error) {
      dispatch(showError({ message: error || 'Không thể cập nhật trạng thái' }));
    }
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNewAppointment({
      customerName: appointment.customerName || '',
      phone: appointment.phone || '',
      vehicleModel: appointment.vehicleModel || '',
      date: formatDate(appointment.startTime),
      time: formatTime(appointment.startTime),
      notes: appointment.notes || '',
      modelId: appointment.modelId?.toString() || '',
      customerId: appointment.customerId?.toString() || ''
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản lý lịch hẹn lái thử</h2>
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

        {/* Date Filter */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Lọc theo ngày:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {selectedDate && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate('')}
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              Xóa bộ lọc
            </motion.button>
          )}
        </div>

        {/* Error Message */}
        {appointmentsError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
          >
            <p className="font-medium">Lỗi: {appointmentsError}</p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
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
          <div className="text-center py-12">
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
                      <div className="text-sm text-gray-900">{appointment.customerName || `Customer #${appointment.customerId}`}</div>
                      <div className="text-sm text-gray-500">{appointment.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.vehicleModel || `Model #${appointment.modelId}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {appointment.status?.toUpperCase() === 'PENDING' && (
                          <motion.button
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateStatus(appointment, 'CONFIRMED')}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow hover:shadow-md transition-all text-xs"
                          >
                            Xác nhận
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
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                    <input
                      type="text"
                      name="customerName"
                      value={newAppointment.customerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="VD: Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={newAppointment.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="VD: 0901234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu xe *</label>
                    <select
                      name="vehicleModel"
                      value={newAppointment.vehicleModel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Chọn mẫu xe</option>
                      {vehicleModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model ID</label>
                    <input
                      type="number"
                      name="modelId"
                      value={newAppointment.modelId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="VD: 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                    <input
                      type="number"
                      name="customerId"
                      value={newAppointment.customerId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="VD: 1"
                    />
                  </div>
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
                    <select
                      name="time"
                      value={newAppointment.time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Chọn giờ</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      name="notes"
                      value={newAppointment.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ghi chú về lịch hẹn..."
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
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                    <input
                      type="text"
                      name="customerName"
                      value={newAppointment.customerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={newAppointment.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu xe *</label>
                    <select
                      name="vehicleModel"
                      value={newAppointment.vehicleModel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Chọn mẫu xe</option>
                      {vehicleModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model ID</label>
                    <input
                      type="number"
                      name="modelId"
                      value={newAppointment.modelId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
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
                    <select
                      name="time"
                      value={newAppointment.time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Chọn giờ</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      name="notes"
                      value={newAppointment.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                <p className="text-gray-600 mb-6">
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
