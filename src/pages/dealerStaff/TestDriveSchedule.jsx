import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllAppointmentsThunk, 
  createAppointmentThunk,
  updateAppointmentThunk,
  deleteAppointmentThunk,
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
import { getCurrentTestDriveConfig } from '../../api/testDriveConfigService';
import { getAppointmentStatuses } from '../../api/appointmentService';

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
  const [testDriveConfig, setTestDriveConfig] = useState(null);
  const [configError, setConfigError] = useState(null);
  
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

  // Status list từ backend API
  const [statusList, setStatusList] = useState([]);
  
  // Map status sang label tiếng Việt
  const STATUS_LABELS = {
    'CONFIRMED': 'Đã xác nhận',
    'CANCELLED': 'Đã hủy',
    'NO_SHOW': 'Không đến',
    'IN_PROGRESS': 'Đang tiến hành',
    'COMPLETED': 'Hoàn thành',
    'PENDING': 'Chờ xử lý' // Nếu backend có thêm
  };

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Helper function để lấy ngày hôm nay (format YYYY-MM-DD) theo timezone local
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert date từ format dd/MM/yyyy sang YYYY-MM-DD
  // Nếu đã là YYYY-MM-DD thì trả về luôn
  const convertToISO = (dateString) => {
    if (!dateString) return '';
    
    // Nếu đã là format YYYY-MM-DD thì trả về luôn
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // Convert từ dd/MM/yyyy sang YYYY-MM-DD
    if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }
    
    // Nếu không match format nào, trả về nguyên string (có thể gây lỗi nhưng để user biết)
    console.warn('⚠️ Date format không nhận dạng được:', dateString);
    return dateString;
  };

  // Helper function để filter time slots dựa trên ngày được chọn
  const getAvailableTimeSlots = (selectedDate) => {
    const today = new Date();
    const todayDateStr = getTodayDate();
    
    // Nếu không chọn ngày hoặc chọn ngày khác hôm nay, hiển thị tất cả time slots
    if (!selectedDate || selectedDate !== todayDateStr) {
      return timeSlots;
    }
    
    // Nếu chọn hôm nay, chỉ hiển thị các giờ sau giờ hiện tại + 10 phút
    const now = new Date();
    const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000); // Thêm 10 phút
    
    // Lấy giờ và phút của thời gian sau 10 phút
    const minHour = tenMinutesLater.getHours();
    const minMinute = tenMinutesLater.getMinutes();
    
    // Filter time slots - so sánh với thời gian sau 10 phút
    return timeSlots.filter(timeSlot => {
      const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
      
      // So sánh giờ trước, nếu giờ lớn hơn thì OK
      if (slotHour > minHour) {
        return true;
      }
      // Nếu cùng giờ, so sánh phút - phải lớn hơn hoặc bằng
      if (slotHour === minHour) {
        return slotMinute >= minMinute;
      }
      // Nếu giờ nhỏ hơn thì không được
      return false;
    });
  };

  // Get current staff ID
  const currentStaffId = user?.userId || user?.id || user?.user_id;
  
  // Check if user is manager (có quyền tạo/update config)
  const isManager = user?.roleId === 3 || 
                   user?.roleName?.toLowerCase().includes('quản lý cửa hàng') ||
                   user?.roleName?.toLowerCase().includes('dealer manager');

  // Use ref to prevent duplicate API calls
  const hasFetchedInitialDataRef = useRef(false);

  // Fetch initial data
  useEffect(() => {
    // Only fetch once
    if (hasFetchedInitialDataRef.current) {
      return;
    }
    
    hasFetchedInitialDataRef.current = true;
    dispatch(getAllCustomersThunk());
    dispatch(getAllModelsThunk());
    
    // Load appointment statuses từ backend API
    getAppointmentStatuses()
      .then(statuses => {
        // statuses có thể là array hoặc object có data property
        const statusArray = Array.isArray(statuses) ? statuses : 
                           (Array.isArray(statuses?.data) ? statuses.data : []);
        if (statusArray.length > 0) {
          setStatusList(statusArray);
        } else {
          // Fallback nếu API trả về rỗng hoặc format khác
          console.warn('Status list rỗng hoặc format không đúng, dùng fallback');
          setStatusList(['CONFIRMED', 'CANCELLED', 'NO_SHOW', 'IN_PROGRESS', 'COMPLETED']);
        }
      })
      .catch(err => {
        console.warn('Không thể tải danh sách status từ API, dùng fallback:', err);
        // Fallback nếu API lỗi
        setStatusList(['CONFIRMED', 'CANCELLED', 'NO_SHOW', 'IN_PROGRESS', 'COMPLETED']);
      });
    
    // Load test drive config - dùng API /test-drive-configs/current
    // API này trả về config của store tương ứng với user đang đăng nhập
    try {
      getCurrentTestDriveConfig()
        .then(config => {
          if (config && (config.configId || config.storeId)) {
            setTestDriveConfig(config);
            setConfigError(null);
          } else {
            // Config trả về nhưng rỗng
            setConfigError('Chưa có cấu hình giờ làm việc cho cửa hàng này');
            setTestDriveConfig(null);
          }
        })
        .catch(err => {
          // Nếu 404 nghĩa là chưa có config
          const is404 = err?.response?.status === 404 || 
                       err.message?.includes('404') || 
                       err.message?.includes('Not Found');
          
          if (is404) {
            setConfigError('Chưa có cấu hình giờ làm việc cho cửa hàng này');
            setTestDriveConfig(null);
          } else {
            // Lỗi khác (403, 500, etc.) - không hiển thị warning
            console.warn('Không thể tải test drive config:', err);
            setConfigError(null);
            setTestDriveConfig(null);
          }
        });
    } catch (err) {
      console.warn('Error loading test drive config:', err);
      setConfigError(null);
      setTestDriveConfig(null);
    }
  }, [dispatch]);

  // Use ref to track last fetched filters to prevent duplicate calls
  const lastFetchedFiltersRef = useRef({ filterStatus: null, filterModelId: null, filterCustomerId: null, staffId: null });

  // Fetch appointments with filters - dùng API /appointments/staff/{staffId} theo swagger
  useEffect(() => {
    const currentFilters = {
      filterStatus,
      filterModelId,
      filterCustomerId,
      staffId: currentStaffId
    };
    
    // Skip if filters haven't changed
    const lastFilters = lastFetchedFiltersRef.current;
    if (
      lastFilters.filterStatus === currentFilters.filterStatus &&
      lastFilters.filterModelId === currentFilters.filterModelId &&
      lastFilters.filterCustomerId === currentFilters.filterCustomerId &&
      lastFilters.staffId === currentFilters.staffId
    ) {
      return;
    }
    
    lastFetchedFiltersRef.current = currentFilters;
    
    // Load appointments theo đúng API swagger
    if (filterStatus) {
      dispatch(getAppointmentsByStatusThunk(filterStatus));
    } else if (filterModelId) {
      dispatch(getAppointmentsByModelThunk(filterModelId));
    } else if (filterCustomerId) {
      dispatch(getAppointmentsByCustomerThunk(filterCustomerId));
    } else if (currentStaffId) {
      // Dùng API /appointments/staff/{staffId} theo swagger
      dispatch(getAppointmentsByStaffThunk(currentStaffId));
    } else {
      // Fallback: dùng getAll nếu không có staffId
      dispatch(getAllAppointmentsThunk());
    }
  }, [dispatch, filterStatus, filterModelId, filterCustomerId, currentStaffId]);

  // Filter customers by store and search term
  const filteredCustomers = (customers || []).filter(customer => {
    // Filter by search term
    const matchesSearch = !customerSearchTerm ||
      customer.fullName?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.phone?.includes(customerSearchTerm) ||
      customer.email?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.address?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
      customer.identificationNumber?.includes(customerSearchTerm);
    
    // When searching (has search term), show all matching customers regardless of store
    // When not searching, filter by store for dealer-staff
    const matchesStore = customerSearchTerm || // If searching, bypass store filter
      !user?.storeId || // If user has no storeId, show all
      customer.storeId === user.storeId || // Customer belongs to user's store
      String(customer.storeId) === String(user.storeId) || // String comparison
      !customer.storeId; // Include customers without storeId when not searching
    
    return matchesStore && matchesSearch;
  });

  // Filter appointments by selected date (local filter)
  // Appointments đã được filter theo staffId từ API, không cần filter lại theo store
  const filteredAppointments = appointments.filter(apt => {
    // Filter by selected date
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
    if (!status) return '';
    const statusUpper = (status || '').toUpperCase();
    // Dùng STATUS_LABELS mapping, fallback về status nếu không có trong mapping
    return STATUS_LABELS[statusUpper] || status;
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

    if (!newAppointment.date || !newAppointment.time) {
      dispatch(showError({ message: 'Vui lòng chọn ngày và giờ hẹn' }));
      return;
    }
    
    try {
      // Convert selectedDate sang format ISO (YYYY-MM-DD) nếu đang là dd/MM/yyyy
      const selectedDateISO = convertToISO(newAppointment.date);
      
      // Validate: Kiểm tra xem ngày có phải hôm nay hoặc tương lai không
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = selectedDateISO.split('-').map(Number);
      const selectedDateOnly = new Date(year, month - 1, day);
      selectedDateOnly.setHours(0, 0, 0, 0);
      
      if (selectedDateOnly < today) {
        dispatch(showError({ message: 'Không thể đặt lịch hẹn trong quá khứ' }));
        return;
      }

      // Validate: Kiểm tra xem thời gian có trong quá khứ không (với buffer 10 phút)
      // Chỉ validate nếu chọn ngày hôm nay
      const todayDateStr = getTodayDate();
      if (selectedDateISO === todayDateStr) {
        const [hour, minute] = newAppointment.time.split(':').map(Number);
        const now = new Date();
        const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
        const selectedDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);
        
        if (selectedDateTime < tenMinutesLater) {
          dispatch(showError({ message: 'Thời gian hẹn phải sau thời gian hiện tại ít nhất 10 phút' }));
          return;
        }
      }

      // Tạo startTime dạng local time string (không convert UTC)
      // Format: "YYYY-MM-DDTHH:mm:00" (không có "Z" hoặc timezone offset)
      const startTime = `${selectedDateISO}T${newAppointment.time}:00`;

      // Backend API cần: modelId, customerId, startTime (local time format)
      // Backend sẽ tự động tính endTime và set status, staffId, storeId từ user context
      const payload = {
        modelId: selectedModel.modelId,
        customerId: selectedCustomer.customerId,
        startTime: startTime
      };

      console.log('📤 Creating appointment with payload:', payload);

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
      
      // Refresh data - dùng API /appointments/staff/{staffId} theo swagger
      if (currentStaffId) {
        dispatch(getAppointmentsByStaffThunk(currentStaffId));
      } else {
        dispatch(getAllAppointmentsThunk());
      }
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      console.error('❌ Error details:', {
        error,
        message: error?.message,
        response: error?.response,
        data: error?.response?.data,
        status: error?.response?.status
      });
      
      // Xử lý error message chi tiết hơn
      let errorMessage = 'Không thể thêm lịch hẹn';
      
      if (error) {
        // Ưu tiên lấy message từ response data
        if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.response?.data) {
          // Nếu data là string hoặc object
          const data = error.response.data;
          errorMessage = typeof data === 'string' ? data : JSON.stringify(data);
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.toString) {
          errorMessage = error.toString();
        }
      }

      // Kiểm tra nếu lỗi liên quan đến giờ làm việc hoặc config
      if (errorMessage.includes('giờ làm việc') || errorMessage.includes('working hours')) {
        if (!testDriveConfig && configError) {
          errorMessage = `${errorMessage}. ${configError}. Vui lòng liên hệ quản lý cửa hàng để tạo cấu hình giờ làm việc.`;
        }
      }

      // Hiển thị error message chi tiết từ backend
      dispatch(showError({ message: errorMessage }));
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

    if (!newAppointment.date || !newAppointment.time) {
      dispatch(showError({ message: 'Vui lòng chọn ngày và giờ hẹn' }));
      return;
    }

    try {
      // Convert selectedDate sang format ISO (YYYY-MM-DD) nếu đang là dd/MM/yyyy
      const selectedDateISO = convertToISO(newAppointment.date);
      const [year, month, day] = selectedDateISO.split('-').map(Number);
      
      // Validate: Kiểm tra xem thời gian có trong quá khứ không (với buffer 10 phút)
      // Chỉ validate nếu đang sửa lịch hẹn chưa hoàn thành
      if (selectedAppointment.status?.toUpperCase() !== 'COMPLETED') {
        // Validate: Kiểm tra xem ngày có phải hôm nay hoặc tương lai không
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateOnly = new Date(year, month - 1, day);
        selectedDateOnly.setHours(0, 0, 0, 0);
        
        if (selectedDateOnly < today) {
          dispatch(showError({ message: 'Không thể đặt lịch hẹn trong quá khứ' }));
          return;
        }

        // Validate thời gian nếu chọn ngày hôm nay
        const todayDateStr = getTodayDate();
        if (selectedDateISO === todayDateStr) {
          const [hour, minute] = newAppointment.time.split(':').map(Number);
          const now = new Date();
          const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);
          const selectedDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);
          
          if (selectedDateTime < tenMinutesLater) {
            dispatch(showError({ message: 'Thời gian hẹn phải sau thời gian hiện tại ít nhất 10 phút' }));
            return;
          }
        }
      }

      // Tạo startTime dạng local time string (không convert UTC)
      // Format: "YYYY-MM-DDTHH:mm:00" (không có "Z" hoặc timezone offset)
      const startTime = `${selectedDateISO}T${newAppointment.time}:00`;

      // Backend API cần: modelId, customerId, startTime (local time format)
      // Backend sẽ tự động tính endTime và set status, staffId, storeId từ user context
      const payload = {
        modelId: selectedModel.modelId,
        customerId: selectedCustomer.customerId,
        startTime: startTime
      };

      console.log('📤 Updating appointment with payload:', payload);

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
      
      // Refresh data - dùng API /appointments/staff/{staffId} theo swagger
      if (currentStaffId) {
        dispatch(getAppointmentsByStaffThunk(currentStaffId));
      } else {
        dispatch(getAllAppointmentsThunk());
      }
    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      
      // Xử lý error message chi tiết hơn
      let errorMessage = 'Không thể cập nhật lịch hẹn';
      
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.toString) {
          errorMessage = error.toString();
        }
      }

      // Thêm thông tin chi tiết cho lỗi 400
      if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.';
      }

      dispatch(showError({ message: errorMessage }));
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
    // Validation trước khi gửi request
    if (!appointment || !appointment.appointmentId) {
      dispatch(showError({ message: 'Không tìm thấy thông tin lịch hẹn' }));
      return;
    }

    if (!newStatus) {
      dispatch(showError({ message: 'Trạng thái không hợp lệ' }));
      return;
    }

    // Kiểm tra transition hợp lệ: CONFIRMED -> COMPLETED
    const currentStatus = (appointment.status || '').toUpperCase();
    const targetStatus = newStatus.toUpperCase();
    
    if (currentStatus === 'CONFIRMED' && targetStatus === 'COMPLETED') {
      // Transition hợp lệ, cho phép
    } else if (currentStatus === targetStatus) {
      dispatch(showError({ message: 'Lịch hẹn đã ở trạng thái này rồi' }));
      return;
    } else if (currentStatus === 'COMPLETED') {
      dispatch(showError({ message: 'Không thể thay đổi trạng thái của lịch hẹn đã hoàn thành' }));
      return;
    }

    try {
      // Đảm bảo status được format đúng (uppercase)
      const formattedStatus = newStatus.toUpperCase();
      
      console.log('🔄 Updating appointment status:', {
        appointmentId: appointment.appointmentId,
        currentStatus,
        newStatus: formattedStatus
      });

      // Thử dùng updateAppointment với toàn bộ data thay vì chỉ update status
      // Vì backend có thể không hỗ trợ endpoint /status hoặc cần format khác
      const updatePayload = {
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: formattedStatus,
        modelId: appointment.modelId,
        customerId: appointment.customerId,
        staffId: appointment.staffId || user?.userId,
        storeId: appointment.storeId || user?.storeId
      };

      console.log('📤 Update payload:', updatePayload);

      // Thử dùng updateAppointment thay vì updateAppointmentStatus
      const result = await dispatch(updateAppointmentThunk({
        appointmentId: appointment.appointmentId,
        data: updatePayload
      })).unwrap();

      console.log('✅ Update status result:', result);

      const statusMessages = {
        'CONFIRMED': 'xác nhận',
        'IN_PROGRESS': 'bắt đầu',
        'COMPLETED': 'hoàn thành',
        'CANCELLED': 'hủy',
        'NO_SHOW': 'đánh dấu không đến'
      };

      dispatch(showSuccess({ message: `Đã ${statusMessages[formattedStatus] || 'cập nhật'} lịch hẹn!` }));
      
      // Refresh data - dùng API /appointments/staff/{staffId} theo swagger
      if (currentStaffId) {
        dispatch(getAppointmentsByStaffThunk(currentStaffId));
      } else {
        dispatch(getAllAppointmentsThunk());
      }
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
      
      // Xử lý error message chi tiết hơn
      let errorMessage = 'Không thể cập nhật trạng thái';
      
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.toString) {
          errorMessage = error.toString();
        }
        
        // Kiểm tra các lỗi phổ biến
        const errorStr = errorMessage.toLowerCase();
        if (errorStr.includes('bad request') || errorStr.includes('400')) {
          errorMessage = 'Yêu cầu không hợp lệ. Vui lòng thử lại hoặc liên hệ quản trị viên.';
        } else if (errorStr.includes('unauthorized') || errorStr.includes('401')) {
          errorMessage = 'Bạn không có quyền thực hiện thao tác này';
        } else if (errorStr.includes('forbidden') || errorStr.includes('403')) {
          errorMessage = 'Không được phép thực hiện thao tác này';
        } else if (errorStr.includes('not found') || errorStr.includes('404')) {
          errorMessage = 'Không tìm thấy lịch hẹn';
        } else if (errorStr.includes('transition') || errorStr.includes('chuyển')) {
          errorMessage = 'Không thể chuyển trạng thái này. Vui lòng kiểm tra lại quy trình.';
        }
      }
      
      dispatch(showError({ message: errorMessage }));
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
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Quản lý lịch hẹn lái thử</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Tổng số: {filteredAppointments.length} lịch hẹn</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <motion.button
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-3 sm:px-6 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <motion.svg 
                className="h-4 w-4 sm:h-5 sm:w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </motion.svg>
              <span className="hidden sm:inline">Thêm lịch hẹn</span>
              <span className="sm:hidden">Thêm</span>
            </motion.button>
            {onBack && (
              <motion.button
                onClick={onBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center px-2 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Quay lại</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap min-w-[100px]">Lọc theo ngày:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap min-w-[100px]">Trạng thái:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                <option value="">Tất cả</option>
                {statusList.map(status => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status] || status}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap min-w-[100px]">Model ID:</label>
              <input
                type="number"
                value={filterModelId}
                onChange={(e) => setFilterModelId(e.target.value)}
                placeholder="Nhập Model ID"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div> */}

            {/* <div className="flex flex-col gap-1.5 sm:gap-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap min-w-[100px]">Customer ID:</label>
              <input
                type="number"
                value={filterCustomerId}
                onChange={(e) => setFilterCustomerId(e.target.value)}
                placeholder="Nhập Customer ID"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div> */}

            {(selectedDate || filterStatus || filterModelId || filterCustomerId) && (
              <div className="flex items-end sm:col-span-1 xl:col-span-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedDate('');
                    setFilterStatus('');
                    setFilterModelId('');
                    setFilterCustomerId('');
                  }}
                  className="w-full sm:w-auto text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1.5 sm:py-2 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors whitespace-nowrap"
                >
                  Xóa tất cả bộ lọc
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Warning: Chưa có test drive config - chỉ hiển thị cho staff, không hiển thị cho manager */}
        {configError && !isManager && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-1.964-1.333-2.732 0L3.732 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-yellow-800 mb-1">Cảnh báo: {configError}</p>
                <p className="text-sm text-yellow-700">Vui lòng liên hệ quản lý cửa hàng để tạo cấu hình giờ làm việc trước khi đặt lịch hẹn.</p>
              </div>
            </div>
          </motion.div>
        )}

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
          // Hiển thị "Không có lịch hẹn nào" khi appointments rỗng
          <div className="text-center py-4">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 text-lg">Không có lịch hẹn nào</p>
            <p className="text-gray-500 text-sm mt-2">Nhấn "Thêm lịch hẹn" để tạo lịch mới</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xe
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDateTime(appointment.startTime)}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getCustomerName(appointment.customerId)}</div>
                        <div className="text-xs text-gray-500">ID: {appointment.customerId}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getModelName(appointment.modelId)}</div>
                        <div className="text-xs text-gray-500">ID: {appointment.modelId}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {appointment.status?.toUpperCase() === 'CONFIRMED' && (
                            <motion.button
                              whileHover={{ scale: 1.05, y: -1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleUpdateStatus(appointment, 'COMPLETED')}
                              className="px-2 lg:px-3 py-1 lg:py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow hover:shadow-md transition-all text-xs whitespace-nowrap"
                            >
                              Hoàn thành
                            </motion.button>
                          )}
                          {appointment.status?.toUpperCase() !== 'COMPLETED' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openEditModal(appointment)}
                                className="px-2 lg:px-3 py-1 lg:py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow hover:shadow-md transition-all text-xs whitespace-nowrap"
                              >
                                Sửa
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openDeleteModal(appointment)}
                                className="px-2 lg:px-3 py-1 lg:py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow hover:shadow-md transition-all text-xs whitespace-nowrap"
                              >
                                Xóa
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-3">
              {filteredAppointments.map((appointment) => (
                <motion.div
                  key={appointment.appointmentId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {formatDateTime(appointment.startTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Khách hàng</p>
                        <p className="text-sm font-medium text-gray-900">{getCustomerName(appointment.customerId)}</p>
                        <p className="text-xs text-gray-500">ID: {appointment.customerId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Xe</p>
                        <p className="text-sm font-medium text-gray-900">{getModelName(appointment.modelId)}</p>
                        <p className="text-xs text-gray-500">ID: {appointment.modelId}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                      {appointment.status?.toUpperCase() === 'CONFIRMED' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateStatus(appointment, 'COMPLETED')}
                          className="flex-1 min-w-[100px] px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow transition-all text-xs font-medium"
                        >
                          Hoàn thành
                        </motion.button>
                      )}
                      {appointment.status?.toUpperCase() !== 'COMPLETED' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(appointment)}
                            className="flex-1 min-w-[80px] px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow transition-all text-xs font-medium"
                          >
                            Sửa
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteModal(appointment)}
                            className="flex-1 min-w-[80px] px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow transition-all text-xs font-medium"
                          >
                            Xóa
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
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
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Thêm lịch hẹn mới</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mẫu xe *</label>
                  {selectedModel ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{selectedModel.modelName}</p>
                        <p className="text-sm text-gray-600">
                          {selectedModel.modelYear && `Năm ${selectedModel.modelYear}`}
                          {selectedModel.price && ` • ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedModel.price)}`}
                          {selectedModel.bodyType && ` • ${selectedModel.bodyType}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedModel(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <AnimatedSelect
                      value=""
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
                          label: `${model.modelName}${model.modelYear ? ` (${model.modelYear})` : ''} - ID: ${model.modelId}`
                        })) || [])
                      ]}
                      className="w-full"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hẹn *</label>
                    <input
                      type="date"
                      name="date"
                      value={newAppointment.date}
                      onChange={(e) => {
                        handleInputChange(e);
                        // Reset time khi đổi ngày để tránh chọn giờ không hợp lệ
                        if (e.target.value !== newAppointment.date) {
                          setNewAppointment(prev => ({ ...prev, time: '' }));
                        }
                      }}
                      min={getTodayDate()}
                      max="2099-12-31"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                      required
                    />
                    {newAppointment.date === getTodayDate() && (
                      <p className="text-xs text-gray-500 mt-1">Lưu ý: Chọn giờ sau thời gian hiện tại ít nhất 10 phút</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ hẹn *</label>
                    <AnimatedSelect
                      name="time"
                      value={newAppointment.time}
                      onChange={handleInputChange}
                      placeholder={newAppointment.date === getTodayDate() ? "Chọn giờ (sau giờ hiện tại + 10 phút)" : "Chọn giờ"}
                      options={[
                        { value: '', label: newAppointment.date === getTodayDate() ? 'Chọn giờ (sau giờ hiện tại + 10 phút)' : 'Chọn giờ' },
                        ...getAvailableTimeSlots(newAppointment.date).map(time => ({
                          value: time,
                          label: time
                        }))
                      ]}
                      className="w-full"
                      disabled={!newAppointment.date}
                    />
                    {newAppointment.date && getAvailableTimeSlots(newAppointment.date).length === 0 && newAppointment.date === getTodayDate() && (
                      <p className="text-xs text-red-500 mt-1">Không còn khung giờ hợp lệ cho hôm nay</p>
                    )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mẫu xe *</label>
                  {selectedModel ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{selectedModel.modelName}</p>
                        <p className="text-sm text-gray-600">
                          {selectedModel.modelYear && `Năm ${selectedModel.modelYear}`}
                          {selectedModel.price && ` • ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedModel.price)}`}
                          {selectedModel.bodyType && ` • ${selectedModel.bodyType}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedModel(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <AnimatedSelect
                      value=""
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
                          label: `${model.modelName}${model.modelYear ? ` (${model.modelYear})` : ''} - ID: ${model.modelId}`
                        })) || [])
                      ]}
                      className="w-full"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hẹn *</label>
                    <input
                      type="date"
                      name="date"
                      value={newAppointment.date}
                      onChange={(e) => {
                        handleInputChange(e);
                        // Reset time khi đổi ngày để tránh chọn giờ không hợp lệ
                        if (e.target.value !== newAppointment.date) {
                          setNewAppointment(prev => ({ ...prev, time: '' }));
                        }
                      }}
                      min={getTodayDate()}
                      max="2099-12-31"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      required
                      disabled={selectedAppointment?.status?.toUpperCase() === 'COMPLETED'}
                    />
                    {newAppointment.date === getTodayDate() && selectedAppointment?.status?.toUpperCase() !== 'COMPLETED' && (
                      <p className="text-xs text-gray-500 mt-1">Lưu ý: Chọn giờ sau thời gian hiện tại ít nhất 10 phút</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giờ hẹn *</label>
                    <AnimatedSelect
                      name="time"
                      value={newAppointment.time}
                      onChange={handleInputChange}
                      placeholder={newAppointment.date === getTodayDate() ? "Chọn giờ (sau giờ hiện tại + 10 phút)" : "Chọn giờ"}
                      options={[
                        { value: '', label: newAppointment.date === getTodayDate() ? 'Chọn giờ (sau giờ hiện tại + 10 phút)' : 'Chọn giờ' },
                        ...getAvailableTimeSlots(newAppointment.date).map(time => ({
                          value: time,
                          label: time
                        }))
                      ]}
                      className="w-full"
                      disabled={!newAppointment.date || selectedAppointment?.status?.toUpperCase() === 'COMPLETED'}
                    />
                    {newAppointment.date && getAvailableTimeSlots(newAppointment.date).length === 0 && newAppointment.date === getTodayDate() && (
                      <p className="text-xs text-red-500 mt-1">Không còn khung giờ hợp lệ cho hôm nay</p>
                    )}
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

