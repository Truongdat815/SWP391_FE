import { useState, useEffect } from 'react';
import axiosClient from '@/services/axiosClient';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllStoresThunk, 
  createStoreThunk, 
  updateStoreThunk, 
  deleteStoreThunk,
  getStoresByStatusThunk,
  getStoresByProvinceThunk,
  searchStoresThunk
} from '@store/slices/storeSlice';

// Skeleton Loading Component
const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 px-6 py-4">
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    ))}
  </div>
);

function StoreManagement() {
  const dispatch = useDispatch();
  const stores = useSelector((s) => s.stores.items);
  const storesStatus = useSelector((s) => s.stores.status);
  const storesError = useSelector((s) => s.stores.error);
  const isStoresFetching = storesStatus === 'loading';
  const isCreatingStore = storesStatus === 'loading';
  const [storesApi, setStoresApi] = useState([]);
  
  const [activeTab, setActiveTab] = useState('stores');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  useEffect(() => {
    if (storesStatus === 'idle') {
      dispatch(getAllStoresThunk());
    }
  }, [dispatch, storesStatus]);

  // Fallback fetch via axiosClient for direct API usage
  useEffect(() => {
    axiosClient.get('/api/stores/all')
      .then((res) => setStoresApi(Array.isArray(res?.data?.data) ? res.data.data : []))
      .catch((err) => console.error('Lỗi lấy danh sách store:', err));
  }, []);

  const storesList = (stores && stores.length) ? stores : storesApi;
  
  const [formData, setFormData] = useState({
    storeName: '',
    provinceName: '',
    ownerName: '',
    address: '',
    phone: '',
    status: 'ACTIVE',
    contractStartDate: '',
    contractEndDate: '',
    createdBy: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md';
      case 'INACTIVE': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md';
      case 'PENDING': return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-md';
      case 'SUSPENDED': return 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'INACTIVE': return 'Không hoạt động';
      case 'PENDING': return 'Chờ duyệt';
      case 'SUSPENDED': return 'Tạm ngưng';
      default: return status;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    try {
      if (editingStore) {
        if (formData.storeName !== editingStore.storeName) {
          const nameExists = storesList.some(store => 
            store.storeName === formData.storeName && store.storeId !== editingStore.storeId
          );
          if (nameExists) {
            setErrorMessage('Tên cửa hàng đã tồn tại. Vui lòng chọn tên khác.');
            return;
          }
        }
        
        if (formData.phone !== editingStore.phone) {
          const phoneExists = storesList.some(store => 
            store.phone === formData.phone && store.storeId !== editingStore.storeId
          );
          if (phoneExists) {
            setErrorMessage('Số điện thoại đã tồn tại. Vui lòng chọn số khác.');
            return;
          }
        }
        
        const updateData = {
          storeId: editingStore.storeId,
          storeName: formData.storeName,
          address: formData.address,
          phone: formData.phone,
          provinceName: formData.provinceName,
          ownerName: formData.ownerName,
          status: formData.status,
          contractStartDate: formData.contractStartDate ? new Date(formData.contractStartDate).toISOString() : null,
          contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate).toISOString() : null
        };
        await dispatch(updateStoreThunk(updateData)).unwrap();
      } else {
        // Check if store name already exists for new store
        const nameExists = storesList.some(store => store.storeName === formData.storeName);
        if (nameExists) {
          setErrorMessage('Tên cửa hàng đã tồn tại. Vui lòng chọn tên khác.');
          return;
        }
        
        // Check if phone number already exists for new store
        const phoneExists = storesList.some(store => store.phone === formData.phone);
        if (phoneExists) {
          setErrorMessage('Số điện thoại đã tồn tại. Vui lòng chọn số khác.');
          return;
        }
        
        const createData = {
          storeId: 0,
          storeName: formData.storeName,
          address: formData.address,
          phone: formData.phone,
          provinceName: formData.provinceName,
          ownerName: formData.ownerName,
          status: formData.status,
          contractStartDate: formData.contractStartDate ? new Date(formData.contractStartDate).toISOString() : null,
          contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate).toISOString() : null
        };
        await dispatch(createStoreThunk(createData)).unwrap();
      }
      
      setFormData({
        storeName: '',
        provinceName: '',
        ownerName: '',
        address: '',
        phone: '',
        status: 'ACTIVE',
        contractStartDate: '',
        contractEndDate: '',
        createdBy: ''
      });
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingStore(null);
      setErrorMessage('');
      
      dispatch(getAllStoresThunk());
    } catch (error) {
      console.error('Failed to save store:', error);
      const errorMsg = error.message || error.error || 'Có lỗi xảy ra khi lưu cửa hàng';
      setErrorMessage(errorMsg);
    }
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };
    
    setFormData({
      storeName: store.storeName || '',
      provinceName: store.provinceName || '',
      ownerName: store.ownerName || '',
      address: store.address || '',
      phone: store.phone || '',
      status: store.status || 'ACTIVE',
      contractStartDate: formatDateForInput(store.contractStartDate),
      contractEndDate: formatDateForInput(store.contractEndDate),
      createdBy: store.createdBy || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (store) => {
    setStoreToDelete(store);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!storeToDelete) return;
    
    try {
      await dispatch(deleteStoreThunk(storeToDelete.storeId)).unwrap();
      dispatch(getAllStoresThunk());
      setShowDeleteModal(false);
      setStoreToDelete(null);
    } catch (error) {
      console.error('Failed to delete store:', error);
      setErrorMessage('Không thể xóa cửa hàng. Vui lòng thử lại.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStoreToDelete(null);
  };

  const handleCloseModal = () => {
    setFormData({
      storeName: '',
      provinceName: '',
      ownerName: '',
      address: '',
      phone: '',
      status: 'ACTIVE',
      contractStartDate: '',
      contractEndDate: '',
      createdBy: ''
    });
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingStore(null);
    setErrorMessage('');
  };

  const handleSearch = () => {
    if (searchTerm.trim() || statusFilter || provinceFilter) {
      const searchParams = {};
      if (searchTerm.trim()) {
        if (searchTerm.length > 3) {
          searchParams.storeName = searchTerm.trim();
        } else {
          searchParams.ownerName = searchTerm.trim();
        }
      }
      if (statusFilter) searchParams.status = statusFilter;
      if (provinceFilter) searchParams.provinceName = provinceFilter;
      
      dispatch(searchStoresThunk(searchParams));
    } else {
      dispatch(getAllStoresThunk());
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status) {
      dispatch(getStoresByStatusThunk(status));
    } else {
      dispatch(getAllStoresThunk());
    }
  };

  const handleProvinceFilter = (province) => {
    setProvinceFilter(province);
    if (province) {
      dispatch(getStoresByProvinceThunk(province));
    } else {
      dispatch(getAllStoresThunk());
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setProvinceFilter('');
    dispatch(getAllStoresThunk());
  };

  // Get unique provinces for filter dropdown
  const uniqueProvinces = [...new Set(storesList.map(store => store.provinceName).filter(Boolean))];

  const tabs = [
    { id: 'stores', name: 'Danh sách cửa hàng', count: storesList.length },
    { id: 'analytics', name: 'Thống kê & Báo cáo', count: 0 }
  ];

  const renderStoresTable = () => (
    <div className="overflow-x-auto">
      {isStoresFetching && <TableSkeleton />}
      {!isStoresFetching && storesError && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
          ❌ Lỗi tải danh sách: {String(storesError?.error || storesError?.data || 'Unknown error')}
        </div>
      )}
      {!isStoresFetching && !storesError && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Cửa hàng
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Chủ cửa hàng
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Địa điểm
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Doanh thu
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {storesList.map((store, index) => (
              <tr 
                key={store.storeId}
                className={`transition-all duration-200 hover:bg-blue-50 hover:shadow-sm cursor-pointer
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-4 shadow-lg ring-2 ring-blue-100">
                      <span className="text-white font-bold text-sm">
                        {(store.storeName || '').charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{store.storeName}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {store.phone}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">ID: {store.storeId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{store.ownerName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{store.provinceName}</div>
                  <div className="text-sm text-gray-500 max-w-xs truncate">{store.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(store.status)}`}>
                    {getStatusText(store.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{store.totalOrders || 0} đơn hàng</div>
                  <div className="text-sm font-bold text-green-600">
                    {(store.totalRevenue || 0).toLocaleString('vi-VN')} ₫
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEdit(store)}
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
                      onClick={() => handleDelete(store)}
                      className="group relative p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Xóa
                      </span>
                    </button>
                    
                    <button className="group relative p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:shadow-md transition-all duration-200 transform hover:scale-105">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Chi tiết
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {storesList.length === 0 && !isStoresFetching && (
              <tr>
                <td colSpan="6" className="px-6 py-16">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4 shadow-inner">
                      <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Chưa có cửa hàng nào
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                      Bắt đầu bằng cách thêm cửa hàng mới vào hệ thống để quản lý
                    </p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Thêm cửa hàng đầu tiên
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white text-opacity-90">Tổng số cửa hàng</p>
              <p className="text-3xl font-bold text-white">{stores.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white text-opacity-90">Cửa hàng hoạt động</p>
              <p className="text-3xl font-bold text-white">
                {stores.filter(store => store.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white text-opacity-90">Chờ duyệt</p>
              <p className="text-3xl font-bold text-white">
                {stores.filter(store => store.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white text-opacity-90">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-white">
                {stores.reduce((sum, store) => sum + (store.totalRevenue || 0), 0).toLocaleString('vi-VN')} ₫
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Biểu đồ doanh thu theo cửa hàng</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 font-medium text-lg">Biểu đồ sẽ được hiển thị tại đây</p>
            <p className="text-gray-400 text-sm mt-2">Tích hợp với Chart.js hoặc Recharts</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Quản lý cửa hàng
            </h1>
            <p className="text-gray-600 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Quản lý thông tin và hoạt động của các cửa hàng đại lý
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm cửa hàng
            </button>
            <button className="bg-white text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg border border-gray-200 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
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
                placeholder="Tìm kiếm theo tên cửa hàng hoặc chủ cửa hàng..."
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md bg-white text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <select 
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all bg-white text-gray-900"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="SUSPENDED">Tạm ngưng</option>
            </select>
            <select 
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all bg-white text-gray-900"
              value={provinceFilter}
              onChange={(e) => handleProvinceFilter(e.target.value)}
            >
              <option value="">Tất cả tỉnh/thành</option>
              {uniqueProvinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tìm kiếm
            </button>
            <button
              onClick={clearFilters}
              className="px-5 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all shadow-md flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'stores' && renderStoresTable()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>

      {/* Add/Edit Store Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm animate-fadeIn">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-2xl rounded-xl bg-white animate-slideDown">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingStore ? '✏️ Chỉnh sửa cửa hàng' : '➕ Thêm cửa hàng mới'}
                </h3>
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
                {errorMessage && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 animate-slideDown">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Province Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="provinceName"
                      value={formData.provinceName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                      required
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP.HCM">TP.HCM</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="An Giang">An Giang</option>
                      <option value="Bà Rịa - Vũng Tàu">Bà Rịa - Vũng Tàu</option>
                      <option value="Bắc Giang">Bắc Giang</option>
                      <option value="Bắc Kạn">Bắc Kạn</option>
                      <option value="Bạc Liêu">Bạc Liêu</option>
                    </select>
                  </div>

                  {/* Store Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên cửa hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                      placeholder="Nhập tên cửa hàng"
                      required
                    />
                  </div>

                  {/* Owner Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên chủ cửa hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                      placeholder="Nhập tên chủ cửa hàng"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                      placeholder="Nhập số điện thoại"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                      placeholder="Nhập địa chỉ chi tiết"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Trạng thái <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                      required
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="INACTIVE">Không hoạt động</option>
                      <option value="PENDING">Chờ duyệt</option>
                      <option value="SUSPENDED">Tạm ngưng</option>
                    </select>
                  </div>

                  {/* Contract Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày bắt đầu hợp đồng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="contractStartDate"
                      value={formData.contractStartDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                      required
                    />
                  </div>

                  {/* Contract End Date */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ngày kết thúc hợp đồng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="contractEndDate"
                      value={formData.contractEndDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-md"
                  >
                    ❌ Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingStore}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isCreatingStore && (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isCreatingStore ? (editingStore ? '⏳ Đang cập nhật...' : '⏳ Đang tạo...') : (editingStore ? '✅ Cập nhật' : '✨ Tạo cửa hàng')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && storeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm animate-fadeIn">
          <div className="relative top-20 mx-auto p-6 border w-[480px] shadow-2xl rounded-xl bg-white animate-slideDown">
            <div className="mt-3">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-red-200 rounded-full mb-4 shadow-lg">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Xác nhận xóa cửa hàng
                </h3>
                <div className="mt-2 px-4 py-3">
                  <p className="text-sm text-gray-600 mb-4">
                    Bạn có chắc chắn muốn xóa cửa hàng này không? 
                    <span className="block font-semibold text-red-600 mt-1">Hành động này không thể hoàn tác!</span>
                  </p>
                  
                  {/* Store Details */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-left shadow-inner">
                    <div className="flex items-center mb-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-md">
                        <span className="text-white font-bold text-sm">
                          {(storeToDelete.storeName || '').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{storeToDelete.storeName}</div>
                        <div className="text-xs text-gray-500">ID: {storeToDelete.storeId}</div>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-700">
                      <div className="flex items-start">
                        <span className="font-semibold min-w-[100px]">Chủ cửa hàng:</span>
                        <span>{storeToDelete.ownerName}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold min-w-[100px]">Địa chỉ:</span>
                        <span className="flex-1">{storeToDelete.address}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold min-w-[100px]">Số điện thoại:</span>
                        <span>{storeToDelete.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold min-w-[100px]">Tỉnh/Thành:</span>
                        <span>{storeToDelete.provinceName}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-semibold min-w-[100px]">Trạng thái:</span>
                        <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${getStatusColor(storeToDelete.status)}`}>
                          {getStatusText(storeToDelete.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-3 mt-6">
                  <button
                    onClick={cancelDelete}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-md"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa cửa hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreManagement;