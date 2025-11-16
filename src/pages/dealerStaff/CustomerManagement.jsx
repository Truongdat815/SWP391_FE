import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { get, fetchExternalApi } from '@/api/client';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCustomersThunk, createCustomerThunk, deleteCustomerThunk, updateCustomerThunk } from '@store/slices/customerSlice';
import { fetchOrdersByCustomer } from '@store/slices/orderSlice';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Trash2, 
  FileText, 
  ChevronDown,
  Calendar,
  TrendingUp,
  X,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import { ModernTable, ModernTableHead, ModernTableHeader, ModernTableBody, ModernTableRow, ModernTableCell } from '../../components/ui/ModernTable';
import { ModernCard, ModernCardHeader, ModernCardContent } from '../../components/ui/ModernCard';
import ModernButton from '../../components/ui/ModernButton';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';


function CustomerManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast, success, showError, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();
  const customers = useSelector((s) => s.customers.items);
  const customersStatus = useSelector((s) => s.customers.status);
  const customersError = useSelector((s) => s.customers.error);
  const isCustomersFetching = customersStatus === 'loading';
  const isCreatingCustomer = customersStatus === 'loading';
  
  const [customersApi, setCustomersApi] = useState([]);
  const location = useLocation();
  const sortDropdownRef = useRef(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Fetch all customers (filter by store will be done in frontend)
  useEffect(() => {
    if (customersStatus === 'idle') {
      dispatch(getAllCustomersThunk());
    }
  }, [dispatch, customersStatus]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortDropdown]);

  // Fallback fetch via api client for direct API usage (Only if Redux fails)
  useEffect(() => {
    // Only fetch if Redux customers list is empty after initial load
    if (customersStatus === 'succeeded' && customers.length === 0) {
      console.log('🔄 Fallback: Fetching customers directly from API...');
      get('/api/customers/all')
        .then((res) => {
          console.log('📥 Fallback API response:', res);
          // ✅ Xử lý nhiều cấu trúc response
          let customersData = [];
          
          if (Array.isArray(res?.data?.data)) {
            customersData = res.data.data;
          } else if (Array.isArray(res?.data)) {
            customersData = res.data;
          } else if (Array.isArray(res)) {
            customersData = res;
          } else if (res?.data && typeof res.data === 'object') {
            const dataValues = Object.values(res.data);
            if (dataValues.length > 0 && Array.isArray(dataValues[0])) {
              customersData = dataValues[0];
            }
          }
          
          console.log('✅ Fallback: Extracted customers:', customersData.length);
          setCustomersApi(customersData);
        })
        .catch((err) => {
          console.error('❌ Fallback: Lỗi lấy danh sách khách hàng:', err);
          setCustomersApi([]);
        });
    }
  }, [customersStatus, customers.length]);

  // Backend đã filter theo storeId, chỉ cần lấy danh sách từ API
  // ✅ Đảm bảo customers và customersApi là array
  const customersArray = Array.isArray(customers) ? customers : [];
  const customersApiArray = Array.isArray(customersApi) ? customersApi : [];
  
  // ✅ Ưu tiên Redux customers, fallback về API customers
  const finalCustomersList = customersArray.length > 0 ? customersArray : customersApiArray;
  
  // ✅ Debug log để kiểm tra
  console.log('🔍 CustomerManagement Debug:');
  console.log('- Redux customers:', customersArray.length);
  console.log('- API customers:', customersApiArray.length);
  console.log('- finalCustomersList:', finalCustomersList.length);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState('newest'); // 'newest' | 'oldest' | 'name-asc' | 'name-desc'
  const [showAddModal, setShowAddModal] = useState(false);

  // Tự động mở modal thêm khách hàng nếu có query param add=new
  useEffect(() => {
    if (location.search.includes('add=new')) {
      setShowAddModal(true);
    }
  }, [location]);

  // Fetch provinces từ API bên thứ 3 - sử dụng depth=3 để có đầy đủ wards
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        // Sử dụng depth=3 để lấy đầy đủ provinces -> districts -> wards
        const data = await fetchExternalApi('https://provinces.open-api.vn/api/v1/?depth=3');
        console.log('Provinces data loaded:', data?.length, 'provinces');
        setProvinces(data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách tỉnh/thành phố với depth=3, thử depth=2:', error);
        // Fallback: nếu depth=3 fail, thử depth=2
        try {
          const fallbackData = await fetchExternalApi('https://provinces.open-api.vn/api/v1/?depth=2');
          setProvinces(fallbackData || []);
        } catch (fallbackError) {
          console.error('Lỗi fallback depth=2:', fallbackError);
          setProvinces([]);
        }
      } finally {
        setLoadingProvinces(false);
      }
    };
    
    fetchProvinces();
  }, []);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [customerToView, setCustomerToView] = useState(null);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // State cho dependent dropdowns
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(null);
  const [selectedWardCode, setSelectedWardCode] = useState(null);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [detailAddress, setDetailAddress] = useState(''); // Địa chỉ chi tiết (số nhà, tên đường)
  
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    email: '',
    phone: '',
    identificationNumber: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler khi chọn tỉnh/thành phố
  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    setSelectedProvinceCode(provinceCode);
    setSelectedDistrictCode(null);
    setSelectedWardCode(null);
    setDistricts([]);
    setWards([]);

    if (provinceCode) {
      const selectedProvince = provinces.find(p => p.code.toString() === provinceCode);
      if (selectedProvince && selectedProvince.districts) {
        setDistricts(selectedProvince.districts || []);
      }
      
      // Cập nhật địa chỉ sau khi state được cập nhật
      setTimeout(() => updateAddress(), 100);
    } else {
      setTimeout(() => updateAddress(), 100);
    }
  };

  // Handler khi chọn quận/huyện
  const handleDistrictChange = async (e) => {
    const districtCode = e.target.value;
    setSelectedDistrictCode(districtCode);
    setSelectedWardCode(null);
    setWards([]);

    if (districtCode) {
      const selectedDistrict = districts.find(d => d.code.toString() === districtCode);
      if (selectedDistrict) {
        // Nếu districts có wards sẵn, sử dụng luôn
        if (selectedDistrict.wards && Array.isArray(selectedDistrict.wards) && selectedDistrict.wards.length > 0) {
          setWards(selectedDistrict.wards);
        } else {
          // Nếu không có wards, fetch từ API
          try {
            // Thử endpoint 1: /api/wards?district_code=...
            try {
              const wardsData = await fetchExternalApi(`https://provinces.open-api.vn/api/wards?district_code=${districtCode}`);
              
              if (wardsData) {
                // Nếu là array trực tiếp
                if (Array.isArray(wardsData) && wardsData.length > 0) {
                  setWards(wardsData);
                  return;
                }
                // Nếu có data property
                if (wardsData.data && Array.isArray(wardsData.data) && wardsData.data.length > 0) {
                  setWards(wardsData.data);
                  return;
                }
              }
            } catch (wardError) {
              console.log('Endpoint /api/wards không thành công, thử endpoint khác:', wardError);
            }

            // Thử endpoint 2: /api/d/{districtCode}
            try {
              const districtData = await fetchExternalApi(`https://provinces.open-api.vn/api/d/${districtCode}`);
              
              if (districtData) {
                // Case 1: Response là district object có wards property
                if (districtData.wards && Array.isArray(districtData.wards) && districtData.wards.length > 0) {
                  setWards(districtData.wards);
                  return;
                } 
                // Case 2: Response là array trực tiếp
                else if (Array.isArray(districtData) && districtData.length > 0) {
                  setWards(districtData);
                  return;
                }
                // Case 3: Response có nested structure với data property
                else if (districtData.data && Array.isArray(districtData.data) && districtData.data.length > 0) {
                  setWards(districtData.data);
                  return;
                }
              }
            } catch (districtError) {
              console.log('Endpoint /api/d không thành công:', districtError);
            }

            // Nếu cả 2 endpoint đều fail, log warning
            console.warn('Không thể fetch wards từ bất kỳ endpoint nào cho district:', districtCode);
            setWards([]);
          } catch (error) {
            console.error('Lỗi khi tải danh sách phường/xã:', error);
            setWards([]);
          }
        }
      }
      
      // Cập nhật địa chỉ
      setTimeout(() => updateAddress(), 100);
    }
  };

  // Handler khi chọn phường/xã
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    setSelectedWardCode(wardCode);
    
    // Cập nhật địa chỉ sau khi state được cập nhật
    setTimeout(() => updateAddress(), 100);
  };

  // Function để cập nhật địa chỉ đầy đủ
  const updateAddress = (newDetailAddress = null) => {
    const currentDetail = newDetailAddress !== null ? newDetailAddress : detailAddress;
    const provinceName = provinces.find(p => p.code.toString() === selectedProvinceCode)?.name || '';
    const districtName = districts.find(d => d.code.toString() === selectedDistrictCode)?.name || '';
    const wardName = wards.find(w => w.code.toString() === selectedWardCode)?.name || '';

    let fullAddress = '';
    
    if (wardName && districtName && provinceName) {
      fullAddress = currentDetail 
        ? `${currentDetail}, ${wardName}, ${districtName}, ${provinceName}`
        : `${wardName}, ${districtName}, ${provinceName}`;
    } else if (districtName && provinceName) {
      fullAddress = currentDetail 
        ? `${currentDetail}, ${districtName}, ${provinceName}`
        : `${districtName}, ${provinceName}`;
    } else if (provinceName) {
      fullAddress = currentDetail 
        ? `${currentDetail}, ${provinceName}`
        : provinceName;
    } else {
      fullAddress = currentDetail || '';
    }

    setFormData(prev => ({
      ...prev,
      address: fullAddress
    }));
  };

  // Handler khi thay đổi địa chỉ chi tiết (số nhà, tên đường)
  const handleDetailAddressChange = (e) => {
    const value = e.target.value;
    setDetailAddress(value);
    updateAddress(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Chuẩn bị dữ liệu customer với storeId của user hiện tại
      const customerData = {
        ...formData,
        // Đảm bảo storeId được gửi lên backend (nếu user có storeId)
        ...(user?.storeId && { storeId: user.storeId })
      };
      
      console.log('📤 Creating customer with data:', customerData);
      
      // Tạo customer mới
      const result = await dispatch(createCustomerThunk(customerData)).unwrap();
      
      // Extract customer data từ response (xử lý nhiều format có thể có)
      let newCustomer = null;
      if (result?.data) {
        newCustomer = result.data;
      } else if (result?.customer) {
        newCustomer = result.customer;
      } else if (result && typeof result === 'object' && result.customerId) {
        newCustomer = result;
      } else {
        newCustomer = result;
      }
      
      console.log('✅ Customer created successfully:', newCustomer);
      
      // Đợi một chút để đảm bảo Redux state đã được cập nhật
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // ✅ Refresh danh sách khách hàng sau khi tạo thành công
      // Điều này đảm bảo danh sách được sync với server
      await dispatch(getAllCustomersThunk()).unwrap();
      
      // Reset form
      setFormData({
        fullName: '',
        address: '',
        email: '',
        phone: '',
        identificationNumber: ''
      });
      setDetailAddress('');
      setSelectedProvinceCode(null);
      setSelectedDistrictCode(null);
      setSelectedWardCode(null);
      setDistricts([]);
      setWards([]);
      setShowAddModal(false);
      
      // Navigate to create order page with pre-selected customer (nếu có customer data)
      if (newCustomer && newCustomer.customerId) {
        navigate('/dealer-staff/create-order', {
          state: { selectedCustomer: newCustomer }
        });
      } else {
        // Nếu không có customer data, chỉ đóng modal và ở lại trang customer management
        console.warn('⚠️ Customer created but no customer data returned');
      }
    } catch (error) {
      console.error('❌ Failed to create customer:', error);
      // Hiển thị thông báo lỗi cho user
      showError('Không thể tạo khách hàng: ' + (error.message || error || 'Lỗi không xác định'));
    }
  };

  const handleCloseModal = () => {
    setFormData({
      fullName: '',
      address: '',
      email: '',
      phone: '',
      identificationNumber: ''
    });
    setDetailAddress('');
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setSelectedWardCode(null);
    setDistricts([]);
    setWards([]);
    setShowAddModal(false);
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    
    try {
      const customerId = customerToDelete.customerId;
      if (!customerId) {
        console.error('Customer ID is missing');
        showError('Không thể xóa khách hàng: Thiếu thông tin ID');
        return;
      }
      
      await dispatch(deleteCustomerThunk(customerId)).unwrap();
      setShowDeleteModal(false);
      setCustomerToDelete(null);
      dispatch(getAllCustomersThunk());
    } catch (error) {
      console.error('Failed to delete customer:', error);
      
      // Extract error message
      let errorMessage = 'Không thể xóa khách hàng';
      
      if (error?.payload) {
        // Error from Redux thunk
        errorMessage = error.payload;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Check for specific constraint errors
      const errorStr = errorMessage.toString().toLowerCase();
      if (errorStr.includes('reference constraint') || 
          errorStr.includes('fk') || 
          errorStr.includes('contracts') ||
          errorStr.includes('hợp đồng')) {
        errorMessage = 'Không thể xóa khách hàng này vì có đơn hàng đã được tạo hợp đồng. Vui lòng xóa hoặc hủy các hợp đồng liên quan trước khi xóa khách hàng.';
      } else if (errorStr.includes('foreign key') || errorStr.includes('constraint')) {
        errorMessage = 'Không thể xóa khách hàng này vì có dữ liệu liên quan (đơn hàng, hợp đồng, v.v.). Vui lòng xóa các dữ liệu liên quan trước.';
      }
      
      // Show user-friendly alert
      showError(`Lỗi khi xóa khách hàng:\n\n${errorMessage}`);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  const handleEditClick = (customer) => {
    setCustomerToEdit(customer);
    setFormData({
      fullName: customer.fullName || '',
      address: customer.address || '',
      email: customer.email || '',
      phone: customer.phone || '',
      identificationNumber: customer.identificationNumber || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!customerToEdit) return;
    
    try {
      const updateData = {
        customerId: customerToEdit.customerId,
        ...formData
      };
      
      await dispatch(updateCustomerThunk(updateData)).unwrap();
      
      setFormData({
        fullName: '',
        address: '',
        email: '',
        phone: '',
        identificationNumber: ''
      });
      setDetailAddress('');
      setSelectedProvinceCode(null);
      setSelectedDistrictCode(null);
      setSelectedWardCode(null);
      setDistricts([]);
      setWards([]);
      setShowEditModal(false);
      setCustomerToEdit(null);
      
      dispatch(getAllCustomersThunk());
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  const handleEditCancel = () => {
    setFormData({
      fullName: '',
      address: '',
      email: '',
      phone: '',
      identificationNumber: ''
    });
    setDetailAddress('');
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setSelectedWardCode(null);
    setDistricts([]);
    setWards([]);
    setShowEditModal(false);
    setCustomerToEdit(null);
  };

  const handleViewDetail = (customer) => {
    setCustomerToView(customer);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setCustomerToView(null);
  };

  const handleViewOrders = async (customer) => {
    setLoadingOrders(true);
    setShowOrdersModal(true);
    try {
      const result = await dispatch(fetchOrdersByCustomer(customer.customerId)).unwrap();
      const ordersData = result?.data || result || [];
      setCustomerOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCloseOrdersModal = () => {
    setShowOrdersModal(false);
    setCustomerOrders([]);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    if (!status) return status || 'N/A';
    // Return status in English as from API response
    return status.toUpperCase();
  };

  // Hàm lọc khách hàng theo search term
  const getFilteredCustomers = () => {
    return finalCustomersList.filter(customer => {
      const matchesSearch = !searchTerm || 
        (customer.fullName && customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchTerm)) ||
        (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.identificationNumber && customer.identificationNumber.includes(searchTerm));
      return matchesSearch;
    });
  };

  // Hàm sort khách hàng theo chế độ
  const sortCustomers = (arr, mode = 'newest') => {
    const getTime = (c) => new Date(c.createdAt || 0).getTime();
    const getId = (c) => Number(c.customerId || 0);
    const getName = (c) => (c.fullName || '').toLowerCase();

    const byNewest = (a, b) => {
      const t = getTime(b) - getTime(a);
      if (t !== 0) return t;
      return getId(b) - getId(a);
    };
    const byOldest = (a, b) => {
      const t = getTime(a) - getTime(b);
      if (t !== 0) return t;
      return getId(a) - getId(b);
    };
    const byNameAsc = (a, b) => getName(a).localeCompare(getName(b), 'vi');
    const byNameDesc = (a, b) => getName(b).localeCompare(getName(a), 'vi');

    const copy = [...arr];
    switch (mode) {
      case 'oldest': return copy.sort(byOldest);
      case 'name-asc': return copy.sort(byNameAsc);
      case 'name-desc': return copy.sort(byNameDesc);
      case 'newest':
      default: return copy.sort(byNewest);
    }
  };

  const filteredCustomers = sortCustomers(getFilteredCustomers(), sortMode);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = finalCustomersList.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCustomers = finalCustomersList.filter(c => {
      if (!c.createdAt) return false;
      const createdDate = new Date(c.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    });

    const thisMonth = finalCustomersList.filter(c => {
      if (!c.createdAt) return false;
      const createdDate = new Date(c.createdAt);
      return createdDate.getMonth() === today.getMonth() && 
             createdDate.getFullYear() === today.getFullYear();
    });

    return {
      total,
      today: todayCustomers.length,
      thisMonth: thisMonth.length
    };
  }, [finalCustomersList]);

  return (
    <div className="min-h-screen bg-gray-50">
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Total Customers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1 bg-blue-100 rounded-lg">
                <Users className="h-3.5 w-3.5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-0.5">Tổng số khách hàng</p>
            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-0.5">Khách hàng</p>
          </motion.div>

          {/* Today Customers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1 bg-emerald-100 rounded-lg">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-0.5">Khách hàng hôm nay</p>
            <p className="text-lg font-bold text-gray-900">{stats.today}</p>
            <p className="text-xs text-gray-500 mt-0.5">Khách hàng mới</p>
          </motion.div>

          {/* This Month */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1 bg-purple-100 rounded-lg">
                <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-0.5">Khách hàng tháng này</p>
            <p className="text-lg font-bold text-gray-900">{stats.thisMonth}</p>
            <p className="text-xs text-gray-500 mt-0.5">Khách hàng</p>
          </motion.div>
        </div>

        {/* Main Content Card */}
        <ModernCard className="overflow-hidden">
          <ModernCardHeader
            title="Quản lý khách hàng"
            subtitle={`${filteredCustomers.length} khách hàng`}
            icon={<Users className="w-5 h-5" />}
            actions={
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative" ref={sortDropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Filter className="h-4 w-4" />
                    <span>
                      {sortMode === 'newest' && 'Mới nhất'}
                      {sortMode === 'oldest' && 'Cũ nhất'}
                      {sortMode === 'name-asc' && 'Tên A → Z'}
                      {sortMode === 'name-desc' && 'Tên Z → A'}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showSortDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                      >
                        {[
                          { value: 'newest', label: 'Mới nhất' },
                          { value: 'oldest', label: 'Cũ nhất' },
                          { value: 'name-asc', label: 'Tên A → Z' },
                          { value: 'name-desc', label: 'Tên Z → A' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setSortMode(option.value);
                              setShowSortDropdown(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                              sortMode === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Add Customer Button */}
                <ModernButton
                  onClick={() => setShowAddModal(true)}
                  icon={<UserPlus className="w-4 h-4" />}
                  size="sm"
                  roleColor="blue"
                >
                  Thêm khách hàng
                </ModernButton>
              </div>
            }
            roleColor="blue"
          />

          <ModernCardContent>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm khách hàng theo tên, email, số điện thoại, địa chỉ, CMND/CCCD..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            {isCustomersFetching ? (
              <TableSkeleton rows={5} />
            ) : customersError ? (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                ❌ Lỗi tải danh sách: {String(customersError?.error || customersError?.data || 'Unknown error')}
              </div>
            ) : filteredCustomers.length === 0 ? (
              <EmptyState
                title={searchTerm ? 'Không tìm thấy khách hàng' : 'Chưa có khách hàng'}
                description={searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bắt đầu bằng cách thêm khách hàng mới'}
                icon="users"
                action={() => setShowAddModal(true)}
                actionText="Thêm khách hàng mới"
                roleColor="blue"
              />
            ) : (
              <ModernTable>
                <ModernTableHead>
                  <tr>
                    <ModernTableHeader>Khách hàng</ModernTableHeader>
                    <ModernTableHeader>Liên hệ</ModernTableHeader>
                    <ModernTableHeader>Địa chỉ</ModernTableHeader>
                    <ModernTableHeader className="text-right">Thao tác</ModernTableHeader>
                  </tr>
                </ModernTableHead>
                <ModernTableBody>
                  {filteredCustomers.map((customer, index) => (
                    <ModernTableRow key={customer.customerId} index={index}>
                      <ModernTableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-opacity-20 ring-gray-300">
                            <span className="text-white font-bold text-xs">
                              {(customer.fullName || '').split(' ').pop()?.charAt(0) || 'C'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{customer.fullName}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </ModernTableCell>
                      <ModernTableCell>
                        <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {customer.phone}
                        </div>
                      </ModernTableCell>
                      <ModernTableCell>
                        <div className="text-sm text-gray-900 max-w-xs truncate flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{customer.address}</span>
                        </div>
                      </ModernTableCell>
                      <ModernTableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditClick(customer)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewDetail(customer)}
                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewOrders(customer)}
                            className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all"
                            title="Xem đơn hàng"
                          >
                            <FileText className="h-4 w-4" />
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteClick(customer)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                            title="Xóa khách hàng"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </ModernTableCell>
                    </ModernTableRow>
                  ))}
                </ModernTableBody>
              </ModernTable>
            )}
          </ModernCardContent>
        </ModernCard>
      </div>

      {/* Add Customer Modal */}
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
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Thêm khách hàng mới</h3>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                      placeholder="Nhập địa chỉ email"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  {/* Province Name - Dependent Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    {loadingProvinces ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center text-sm">
                        <Loader2 className="animate-spin h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-xs text-gray-500">Đang tải danh sách tỉnh/thành phố...</span>
                      </div>
                    ) : (
                      <select
                        name="provinceName"
                        value={selectedProvinceCode || ''}
                        onChange={handleProvinceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                        required
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* District Name - Dependent Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={selectedDistrictCode || ''}
                      onChange={handleDistrictChange}
                      disabled={!selectedProvinceCode || districts.length === 0}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all text-sm ${
                        !selectedProvinceCode || districts.length === 0 
                          ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                          : 'bg-white'
                      }`}
                      required
                    >
                      <option value="">
                        {!selectedProvinceCode 
                          ? 'Chọn tỉnh/thành phố trước' 
                          : districts.length === 0 
                          ? 'Không có quận/huyện'
                          : 'Chọn quận/huyện'}
                      </option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ward Name - Dependent Dropdown (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Phường/Xã
                    </label>
                    <select
                      name="ward"
                      value={selectedWardCode || ''}
                      onChange={handleWardChange}
                      disabled={!selectedDistrictCode || wards.length === 0}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all text-sm ${
                        !selectedDistrictCode || wards.length === 0 
                          ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                          : 'bg-white'
                      }`}
                    >
                      <option value="">
                        {!selectedDistrictCode 
                          ? 'Chọn quận/huyện trước' 
                          : wards.length === 0 
                          ? 'Không có phường/xã'
                          : 'Chọn phường/xã (tùy chọn)'}
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address Detail - Số nhà, tên đường */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Địa chỉ chi tiết (Số nhà, tên đường) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="detailAddress"
                      value={detailAddress}
                      onChange={handleDetailAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                      placeholder="Nhập số nhà, tên đường (ví dụ: 123 Đường ABC)"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Địa chỉ sẽ tự động bao gồm: [Số nhà, tên đường] + Phường/Xã + Quận/Huyện + Tỉnh/Thành phố
                    </p>
                  </div>

                  {/* Full Address Preview */}
                  {formData.address && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Địa chỉ đầy đủ (tự động tạo)
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        readOnly
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 shadow-sm text-sm"
                        placeholder="Địa chỉ sẽ được tự động tạo từ các trường trên"
                      />
                    </div>
                  )}

                  {/* Identification Number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Số CMND/CCCD <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                      placeholder="Nhập số CMND/CCCD"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
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
                    disabled={isCreatingCustomer}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                  >
                    {isCreatingCustomer && (
                      <Loader2 className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" />
                    )}
                    {isCreatingCustomer ? '⏳ Đang tạo...' : '✨ Tạo khách hàng'}
                  </motion.button>
                </div>
              </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Customer Modal */}
      <AnimatePresence>
        {showEditModal && customerToEdit && (
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
                  <div className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa khách hàng</h3>
                  </div>
                  <button
                    onClick={handleEditCancel}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                      placeholder="Nhập địa chỉ email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  {/* Province Name - Dependent Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    {loadingProvinces ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 flex items-center text-sm">
                        <Loader2 className="animate-spin h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-xs text-gray-500">Đang tải danh sách tỉnh/thành phố...</span>
                      </div>
                    ) : (
                      <select
                        name="provinceName"
                        value={selectedProvinceCode || ''}
                        onChange={handleProvinceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                        required
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* District Name - Dependent Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={selectedDistrictCode || ''}
                      onChange={handleDistrictChange}
                      disabled={!selectedProvinceCode || districts.length === 0}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all text-sm ${
                        !selectedProvinceCode || districts.length === 0 
                          ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                          : 'bg-white'
                      }`}
                      required
                    >
                      <option value="">
                        {!selectedProvinceCode 
                          ? 'Chọn tỉnh/thành phố trước' 
                          : districts.length === 0 
                          ? 'Không có quận/huyện'
                          : 'Chọn quận/huyện'}
                      </option>
                      {districts.map((district) => (
                        <option key={district.code} value={district.code}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ward Name - Dependent Dropdown (Optional) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Phường/Xã
                    </label>
                    <select
                      name="ward"
                      value={selectedWardCode || ''}
                      onChange={handleWardChange}
                      disabled={!selectedDistrictCode || wards.length === 0}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all text-sm ${
                        !selectedDistrictCode || wards.length === 0 
                          ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                          : 'bg-white'
                      }`}
                    >
                      <option value="">
                        {!selectedDistrictCode 
                          ? 'Chọn quận/huyện trước' 
                          : wards.length === 0 
                          ? 'Không có phường/xã'
                          : 'Chọn phường/xã (tùy chọn)'}
                      </option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address Detail - Số nhà, tên đường */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Địa chỉ chi tiết (Số nhà, tên đường) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="detailAddress"
                      value={detailAddress}
                      onChange={handleDetailAddressChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                      placeholder="Nhập số nhà, tên đường (ví dụ: 123 Đường ABC)"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Địa chỉ sẽ tự động bao gồm: [Số nhà, tên đường] + Phường/Xã + Quận/Huyện + Tỉnh/Thành phố
                    </p>
                  </div>

                  {/* Full Address Preview */}
                  {formData.address && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Địa chỉ đầy đủ (tự động tạo)
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        readOnly
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 shadow-sm text-sm"
                        placeholder="Địa chỉ sẽ được tự động tạo từ các trường trên"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Số CMND/CCCD <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900 text-sm"
                      placeholder="Nhập số CMND/CCCD"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
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
                    disabled={isCreatingCustomer}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                  >
                    {isCreatingCustomer && (
                      <Loader2 className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" />
                    )}
                    {isCreatingCustomer ? '⏳ Đang cập nhật...' : '✅ Cập nhật khách hàng'}
                  </motion.button>
                </div>
              </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && customerToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleDeleteCancel}
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
              <div className="mt-2">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full mb-3 shadow-md">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Xác nhận xóa khách hàng
                </h3>
                <div className="mt-2 px-3 py-2">
                  <p className="text-xs text-gray-600 mb-3">
                    Bạn có chắc chắn muốn xóa khách hàng <strong className="text-gray-900">{customerToDelete.fullName}</strong> không?
                  </p>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 text-left shadow-inner">
                    <div className="space-y-1 text-xs text-gray-700">
                      <div className="flex items-start">
                        <span className="font-semibold min-w-[70px]">Email:</span>
                        <span className="flex-1">{customerToDelete.email}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold min-w-[70px]">Số điện thoại:</span>
                        <span>{customerToDelete.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold min-w-[70px]">Địa chỉ:</span>
                        <span>{customerToDelete.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-red-600 font-semibold mt-3">
                    ⚠️ Hành động này không thể hoàn tác!
                  </p>
                </div>
                
                <div className="flex justify-center space-x-2 mt-4">
                  <motion.button
                    onClick={handleDeleteCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-sm text-sm"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    onClick={handleDeleteConfirm}
                    disabled={isCreatingCustomer}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                  >
                    {isCreatingCustomer && (
                      <Loader2 className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" />
                    )}
                    {isCreatingCustomer ? 'Đang xóa...' : 'Xóa khách hàng'}
                  </motion.button>
                </div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {showDetailModal && customerToView && (
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
              className="w-full max-w-2xl p-4 border shadow-lg rounded-lg bg-white max-h-[90vh] overflow-y-auto"
            >
              <div className="mt-2">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Chi tiết khách hàng</h3>
                  </div>
                  <button
                    onClick={handleCloseDetailModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              
              <div className="space-y-3">
                {/* Customer Avatar and Basic Info */}
                <div className="flex items-center space-x-4 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-opacity-20 ring-gray-300">
                    <span className="text-white font-bold text-lg">
                      {(customerToView.fullName || '').split(' ').pop()?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-0.5">{customerToView.fullName}</h4>
                    <p className="text-sm text-gray-600 mb-1.5">{customerToView.email}</p>
                    <div className="flex items-center space-x-3">
                      <span className="px-2.5 py-1 inline-flex text-xs font-semibold rounded-md bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-sm">
                        Khách hàng
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Contact Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <h5 className="text-sm font-semibold text-gray-900 mb-2.5 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Thông tin liên hệ
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <svg className="w-3.5 h-3.5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span className="text-xs text-gray-600">Email:</span>
                        <span className="ml-2 text-xs font-medium text-gray-900">{customerToView.email}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3.5 h-3.5 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span className="text-xs text-gray-600">Số điện thoại:</span>
                        <span className="ml-2 text-xs font-medium text-gray-900">{customerToView.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <h5 className="text-sm font-semibold text-gray-900 mb-2.5 flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Thông tin địa chỉ
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <svg className="w-3.5 h-3.5 mr-2 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <span className="text-xs text-gray-600">Địa chỉ:</span>
                          <p className="text-xs font-medium text-gray-900 mt-0.5">{customerToView.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-3.5 h-3.5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-xs text-gray-600">Customer ID:</span>
                        <span className="ml-2 text-xs font-mono text-gray-500">#{customerToView.customerId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identification Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <h5 className="text-sm font-semibold text-gray-900 mb-2.5 flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    Thông tin định danh
                  </h5>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <svg className="w-3.5 h-3.5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span className="text-xs text-gray-600">Số CMND/CCCD:</span>
                      <span className="ml-2 text-xs font-medium text-gray-900">{customerToView.identificationNumber || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>
              </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 mt-3">
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
                      handleEditClick(customerToView);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center text-sm"
                  >
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Chỉnh sửa
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customer Orders Modal */}
      <AnimatePresence>
        {showOrdersModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleCloseOrdersModal}
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
              className="w-full max-w-6xl p-5 border shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto"
            >
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <h3 className="text-2xl font-bold text-gray-900">Đơn hàng của khách hàng</h3>
                  </div>
                  <button
                    onClick={handleCloseOrdersModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              
                {/* Loading State */}
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="animate-spin h-8 w-8 text-purple-600 mr-3" />
                    <span className="text-gray-600">Đang tải đơn hàng...</span>
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="text-center py-4">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">Chưa có đơn hàng</h3>
                    <p className="mt-2 text-sm text-gray-500">Khách hàng này chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customerOrders.map((order, index) => (
                      <div key={order.orderId || index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                Đơn hàng #{order.orderCode || order.orderId}
                              </h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Ngày tạo:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Nhân viên:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {order.staffName || 'N/A'}
                                </span>
                              </div>
                              {order.totalPayment !== null && order.totalPayment !== undefined && (
                                <div>
                                  <span className="text-gray-600">Tổng tiền:</span>
                                  <span className="ml-2 font-semibold text-purple-600">
                                    {order.totalPayment?.toLocaleString('vi-VN')} VNĐ
                                  </span>
                                </div>
                              )}
                              {order.storeName && (
                                <div>
                                  <span className="text-gray-600">Cửa hàng:</span>
                                  <span className="ml-2 font-medium text-gray-900">
                                    {order.storeName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                  <motion.button
                    onClick={handleCloseOrdersModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-md"
                  >
                    Đóng
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

export default CustomerManagement;