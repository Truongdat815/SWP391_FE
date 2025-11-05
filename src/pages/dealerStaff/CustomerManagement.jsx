import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { get, fetchExternalApi } from '@/api/client';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCustomersThunk, createCustomerThunk, deleteCustomerThunk, updateCustomerThunk } from '@store/slices/customerSlice';
import { fetchOrdersByCustomer } from '@store/slices/orderSlice';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import Tooltip from '@/components/ui/Tooltip';


function CustomerManagement() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
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
      get('/api/customers/all')
        .then((res) => setCustomersApi(Array.isArray(res?.data?.data) ? res.data.data : []))
        .catch((err) => console.error('Lỗi lấy danh sách khách hàng:', err));
    }
  }, [customersStatus, customers.length]);

  // Filter customers by store for dealer-staff
  const allCustomers = (customers && customers.length) ? customers : customersApi;
  const customersList = user?.storeId 
    ? allCustomers.filter(customer => customer.storeId === user.storeId || String(customer.storeId) === String(user.storeId))
    : allCustomers;

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
      alert('Không thể tạo khách hàng: ' + (error.message || error || 'Lỗi không xác định'));
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
        alert('Không thể xóa khách hàng: Thiếu thông tin ID');
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
      alert(`Lỗi khi xóa khách hàng:\n\n${errorMessage}`);
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
    if (!status) return 'Không xác định';
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case 'DRAFT': return 'Nháp';
      case 'PENDING': return 'Chờ duyệt';
      case 'APPROVED': return 'Đã phê duyệt';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PROCESSING': return 'Đang xử lý';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status || 'N/A';
    }
  };

  // Hàm lọc khách hàng theo search term
  const getFilteredCustomers = () => {
    return customersList.filter(customer => {
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

  return (
    <div className="px-6 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Quản lý khách hàng
            </h1>
            <p className="text-gray-600 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Quản lý thông tin khách hàng và đơn hàng
            </p>
          </div>
          <div className="flex space-x-3">
            <Tooltip content="Thêm khách hàng mới vào hệ thống" placement="bottom">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm khách hàng
              </button>
            </Tooltip>
            {/* Custom Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="bg-white text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border border-gray-200 flex items-center"
              >
                <span>
                  {sortMode === 'newest' && 'Khách hàng mới nhất'}
                  {sortMode === 'oldest' && 'Khách hàng cũ nhất'}
                  {sortMode === 'name-asc' && 'Tên A → Z'}
                  {sortMode === 'name-desc' && 'Tên Z → A'}
                </span>
                <svg 
                  className={`ml-2 h-4 w-4 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ 
                      duration: 0.2,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="absolute right-0 mt-2 w-full min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {[
                        { value: 'newest', label: 'Khách hàng mới nhất' },
                        { value: 'oldest', label: 'Khách hàng cũ nhất' },
                        { value: 'name-asc', label: 'Tên A → Z' },
                        { value: 'name-desc', label: 'Tên Z → A' }
                      ].map((option, index) => (
                        <motion.button
                          key={option.value}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03, duration: 0.2 }}
                          onClick={() => {
                            setSortMode(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                            sortMode === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Tooltip content="Xuất danh sách khách hàng ra file Excel" placement="bottom">
              <button className="bg-white text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border border-gray-200 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Xuất báo cáo
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm khách hàng theo tên, email, số điện thoại, địa chỉ, CMND/CCCD..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {isCustomersFetching && <SkeletonTable />}
          {!isCustomersFetching && customersError && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
              ❌ Lỗi tải danh sách: {String(customersError?.error || customersError?.data || 'Unknown error')}
            </div>
          )}
          {!isCustomersFetching && !customersError && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Liên hệ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Địa chỉ</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer, index) => (
                <motion.tr 
                  key={customer.customerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`transition-all duration-200 hover:bg-blue-50 hover:shadow-sm cursor-pointer
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4 shadow-lg ring-2 ring-opacity-20 ring-gray-300">
                        <span className="text-white font-bold text-sm">
                          {(customer.fullName || '').split(' ').pop()?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{customer.fullName}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{customer.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditClick(customer)}
                        className="group relative p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Chỉnh sửa
                        </span>
                      </button>
                      
                      <button 
                        onClick={() => handleViewDetail(customer)}
                        className="group relative p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Xem chi tiết
                        </span>
                      </button>

                      <button 
                        onClick={() => handleViewOrders(customer)}
                        className="group relative p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Xem đơn hàng
                        </span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClick(customer)}
                        className="group relative p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Xóa khách hàng
                        </span>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-16">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4 shadow-inner">
                        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchTerm ? 'Không tìm thấy khách hàng phù hợp' : 'Chưa có khách hàng'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
                        {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bắt đầu bằng cách thêm khách hàng mới'}
                      </p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Thêm khách hàng mới
                      </button>
                    </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
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
              className="w-full max-w-2xl p-5 border shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto"
            >
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900">➕ Thêm khách hàng mới</h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập địa chỉ email"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  {/* Province Name - Dependent Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    {loadingProvinces ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-gray-500">Đang tải danh sách tỉnh/thành phố...</span>
                      </div>
                    ) : (
                      <select
                        name="provinceName"
                        value={selectedProvinceCode || ''}
                        onChange={handleProvinceChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={selectedDistrictCode || ''}
                      onChange={handleDistrictChange}
                      disabled={!selectedProvinceCode || districts.length === 0}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all ${
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phường/Xã
                    </label>
                    <select
                      name="ward"
                      value={selectedWardCode || ''}
                      onChange={handleWardChange}
                      disabled={!selectedDistrictCode || wards.length === 0}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all ${
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ chi tiết (Số nhà, tên đường) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="detailAddress"
                      value={detailAddress}
                      onChange={handleDetailAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập số nhà, tên đường (ví dụ: 123 Đường ABC)"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      💡 Địa chỉ sẽ tự động bao gồm: [Số nhà, tên đường] + Phường/Xã + Quận/Huyện + Tỉnh/Thành phố
                    </p>
                  </div>

                  {/* Full Address Preview */}
                  {formData.address && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Địa chỉ đầy đủ (tự động tạo)
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        readOnly
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 shadow-sm"
                        placeholder="Địa chỉ sẽ được tự động tạo từ các trường trên"
                      />
                    </div>
                  )}

                  {/* Identification Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số CMND/CCCD <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập số CMND/CCCD"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={handleCloseModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-md"
                  >
                    ❌ Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isCreatingCustomer}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isCreatingCustomer && (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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
              className="w-full max-w-2xl p-5 border shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto"
            >
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900">✏️ Chỉnh sửa khách hàng</h3>
                  <button
                    onClick={handleEditCancel}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập họ và tên đầy đủ"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập địa chỉ email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  {/* Province Name - Dependent Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    {loadingProvinces ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center">
                        <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-gray-500">Đang tải danh sách tỉnh/thành phố...</span>
                      </div>
                    ) : (
                      <select
                        name="provinceName"
                        value={selectedProvinceCode || ''}
                        onChange={handleProvinceChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="district"
                      value={selectedDistrictCode || ''}
                      onChange={handleDistrictChange}
                      disabled={!selectedProvinceCode || districts.length === 0}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all ${
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phường/Xã
                    </label>
                    <select
                      name="ward"
                      value={selectedWardCode || ''}
                      onChange={handleWardChange}
                      disabled={!selectedDistrictCode || wards.length === 0}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all ${
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ chi tiết (Số nhà, tên đường) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="detailAddress"
                      value={detailAddress}
                      onChange={handleDetailAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập số nhà, tên đường (ví dụ: 123 Đường ABC)"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      💡 Địa chỉ sẽ tự động bao gồm: [Số nhà, tên đường] + Phường/Xã + Quận/Huyện + Tỉnh/Thành phố
                    </p>
                  </div>

                  {/* Full Address Preview */}
                  {formData.address && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Địa chỉ đầy đủ (tự động tạo)
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        readOnly
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 shadow-sm"
                        placeholder="Địa chỉ sẽ được tự động tạo từ các trường trên"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số CMND/CCCD <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="identificationNumber"
                      value={formData.identificationNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white text-gray-900"
                      placeholder="Nhập số CMND/CCCD"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={handleEditCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-md"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isCreatingCustomer}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isCreatingCustomer && (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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
              className="w-[480px] p-4 border shadow-2xl rounded-xl bg-white"
            >
              <div className="mt-3">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Xác nhận xóa khách hàng
                </h3>
                <div className="mt-2 px-4 py-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Bạn có chắc chắn muốn xóa khách hàng <strong className="text-gray-900">{customerToDelete.fullName}</strong> không?
                  </p>
                  
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-left shadow-inner">
                    <div className="space-y-1.5 text-xs text-gray-700">
                      <div className="flex items-start">
                        <span className="font-semibold min-w-[80px]">Email:</span>
                        <span className="flex-1">{customerToDelete.email}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold min-w-[80px]">Số điện thoại:</span>
                        <span>{customerToDelete.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold min-w-[80px]">Địa chỉ:</span>
                        <span>{customerToDelete.address}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-red-600 font-semibold mt-4">
                    ⚠️ Hành động này không thể hoàn tác!
                  </p>
                </div>
                
                <div className="flex justify-center space-x-3 mt-6">
                  <motion.button
                    onClick={handleDeleteCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-md"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    onClick={handleDeleteConfirm}
                    disabled={isCreatingCustomer}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isCreatingCustomer && (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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
              className="w-full max-w-2xl p-5 border shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto"
            >
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900">👤 Chi tiết khách hàng</h3>
                  <button
                    onClick={handleCloseDetailModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              
              <div className="space-y-4">
                {/* Customer Avatar and Basic Info */}
                <div className="flex items-center space-x-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="h-20 w-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-opacity-20 ring-gray-300">
                    <span className="text-white font-bold text-2xl">
                      {(customerToView.fullName || '').split(' ').pop()?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">{customerToView.fullName}</h4>
                    <p className="text-lg text-gray-600 mb-2">{customerToView.email}</p>
                    <div className="flex items-center space-x-4">
                      <span className="px-3 py-1 inline-flex text-sm font-semibold rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md">
                        Khách hàng
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Contact Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Thông tin liên hệ
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{customerToView.email}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span className="text-sm text-gray-600">Số điện thoại:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{customerToView.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Thông tin địa chỉ
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 mr-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <span className="text-sm text-gray-600">Địa chỉ:</span>
                          <p className="text-sm font-medium text-gray-900 mt-1">{customerToView.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-sm text-gray-600">Customer ID:</span>
                        <span className="ml-2 text-sm font-mono text-gray-500">#{customerToView.customerId}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identification Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    Thông tin định danh
                  </h5>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span className="text-sm text-gray-600">Số CMND/CCCD:</span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{customerToView.identificationNumber || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>
              </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <motion.button
                    onClick={handleCloseDetailModal}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-md"
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
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <h3 className="text-2xl font-bold text-gray-900">📋 Đơn hàng của khách hàng</h3>
                  <button
                    onClick={handleCloseOrdersModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              
                {/* Loading State */}
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-4">
                    <svg className="animate-spin h-8 w-8 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
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