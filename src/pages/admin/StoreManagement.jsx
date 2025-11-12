import { useState, useEffect } from 'react';
import { get, fetchExternalApi } from '@/api/client'; // Thêm fetchExternalApi
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAllStoresThunk, 
  createStoreThunk, 
  updateStoreThunk, 
  deleteStoreThunk,
  getStoresByStatusThunk
} from '@store/slices/storeSlice';
import { uploadStoreImage } from '@/api/storeService';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '@/components/ui/Toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

// Skeleton Loading Component
const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3 px-3 py-2.5">
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

  const { toast, hideToast, success, error } = useToast();
  const { confirm, showConfirm } = useConfirm();
  
  const [activeTab, setActiveTab] = useState('stores');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [storeToView, setStoreToView] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageToView, setImageToView] = useState(null);

  // State cho dependent dropdowns
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(null);
  const [selectedWardCode, setSelectedWardCode] = useState(null);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [detailAddress, setDetailAddress] = useState(''); // Địa chỉ chi tiết (số nhà, tên đường)
  const [selectedImageFile, setSelectedImageFile] = useState(null); // File ảnh được chọn
  const [imagePreview, setImagePreview] = useState(null); // Preview ảnh

  useEffect(() => {
    if (storesStatus === 'idle') {
      dispatch(getAllStoresThunk());
    }
  }, [dispatch, storesStatus]);

  // Fallback fetch via api client for direct API usage
  useEffect(() => {
    get('/api/stores/all')
      .then((res) => setStoresApi(Array.isArray(res?.data?.data) ? res.data.data : []))
      .catch((err) => console.error('Lỗi lấy danh sách store:', err));
  }, []);

  // Fetch provinces từ API bên thứ 3 - sử dụng depth=3 để có đầy đủ wards
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        // Sử dụng depth=3 để lấy đầy đủ provinces -> districts -> wards
        // Fetch 1 lần duy nhất để tránh phải fetch wards từng district sau này
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

  const allStoresList = (stores && stores.length) ? stores : storesApi;
  
  // Frontend filtering to replace removed thunks
  const storesList = allStoresList.filter(store => {
    // Search term filter (storeName or ownerName)
    const matchesSearch = !searchTerm.trim() || 
      store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter  
    const matchesStatus = !statusFilter || store.status === statusFilter;
    
    // Province filter
    const matchesProvince = !provinceFilter || store.provinceName === provinceFilter;
    
    return matchesSearch && matchesStatus && matchesProvince;
  });
  
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
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-md';
    }
  };

  const getStatusText = (status) => {
    const upperStatus = String(status || '').toUpperCase();
    return upperStatus || status;
  };

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
      
      // Cập nhật provinceName trong formData
      setFormData(prev => ({
        ...prev,
        provinceName: selectedProvince ? selectedProvince.name : ''
      }));

      // Cập nhật địa chỉ sau khi state được cập nhật
      setTimeout(() => updateAddress(), 100);
    } else {
      setFormData(prev => ({
        ...prev,
        provinceName: ''
      }));
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
          console.log('Sử dụng wards có sẵn:', selectedDistrict.wards);
          setWards(selectedDistrict.wards);
        } else {
          // Nếu không có wards, fetch từ API
          console.log('Fetching wards cho district:', districtCode);
          try {
            // Thử endpoint 1: /api/wards?district_code=...
            try {
              const wardsData = await fetchExternalApi(`https://provinces.open-api.vn/api/wards?district_code=${districtCode}`);
              console.log('Wards data từ /api/wards:', wardsData);
              
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
              console.log('District data từ /api/d:', districtData);
              
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
      setTimeout(() => updateAddress(), 100); // Delay nhỏ để state được cập nhật
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
      if (editingStore) {
        if (formData.storeName !== editingStore.storeName) {
          const nameExists = storesList.some(store => 
            store.storeName === formData.storeName && store.storeId !== editingStore.storeId
          );
          if (nameExists) {
            error('Tên cửa hàng đã tồn tại. Vui lòng chọn tên khác.');
            return;
          }
        }
        
        if (formData.phone !== editingStore.phone) {
          const phoneExists = storesList.some(store => 
            store.phone === formData.phone && store.storeId !== editingStore.storeId
          );
          if (phoneExists) {
            error('Số điện thoại đã tồn tại. Vui lòng chọn số khác.');
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
          imagePath: null, // Không gửi imagePath trong update
          contractStartDate: formData.contractStartDate ? new Date(formData.contractStartDate).toISOString() : null,
          contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate).toISOString() : null
        };
        await dispatch(updateStoreThunk(updateData)).unwrap();
        
        // Upload ảnh mới nếu có
        if (selectedImageFile) {
          try {
            await uploadStoreImage(editingStore.storeId, selectedImageFile);
            success('Cập nhật cửa hàng và upload ảnh thành công!');
          } catch (uploadErr) {
            console.error('Failed to upload image:', uploadErr);
            error('Cập nhật cửa hàng thành công nhưng upload ảnh thất bại. Vui lòng thử lại.');
          }
        } else {
          success('Cập nhật cửa hàng thành công!');
        }
      } else {
        // Check if store name already exists for new store
        const nameExists = storesList.some(store => store.storeName === formData.storeName);
        if (nameExists) {
          error('Tên cửa hàng đã tồn tại. Vui lòng chọn tên khác.');
          return;
        }
        
        // Check if phone number already exists for new store
        const phoneExists = storesList.some(store => store.phone === formData.phone);
        if (phoneExists) {
          error('Số điện thoại đã tồn tại. Vui lòng chọn số khác.');
          return;
        }
        
        // Tạo store trước (không có imagePath)
        const createData = {
          storeId: 0,
          storeName: formData.storeName,
          address: formData.address,
          phone: formData.phone,
          provinceName: formData.provinceName,
          ownerName: formData.ownerName,
          status: formData.status,
          imagePath: null, // Không gửi imagePath khi tạo mới
          contractStartDate: formData.contractStartDate ? new Date(formData.contractStartDate).toISOString() : null,
          contractEndDate: formData.contractEndDate ? new Date(formData.contractEndDate).toISOString() : null
        };
        
        const createdStore = await dispatch(createStoreThunk(createData)).unwrap();
        
        // Lấy storeId từ response
        const storeId = createdStore?.data?.storeId || createdStore?.storeId;
        
        if (!storeId) {
          throw new Error('Không nhận được storeId sau khi tạo cửa hàng');
        }
        
        // Upload ảnh nếu có file được chọn
        if (selectedImageFile) {
          try {
            await uploadStoreImage(storeId, selectedImageFile);
            success('Tạo cửa hàng và upload ảnh thành công!');
          } catch (uploadErr) {
            console.error('Failed to upload image:', uploadErr);
            error('Tạo cửa hàng thành công nhưng upload ảnh thất bại. Vui lòng thử lại.');
          }
        } else {
          success('Tạo cửa hàng thành công!');
        }
      }
      
      // Reset form
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
      // Reset dependent dropdowns
      setSelectedProvinceCode(null);
      setSelectedDistrictCode(null);
      setSelectedWardCode(null);
      setDistricts([]);
      setWards([]);
      setDetailAddress('');
      setSelectedImageFile(null);
      setImagePreview(null);
      setShowAddModal(false);
      setShowEditModal(false);
      setEditingStore(null);
      
      dispatch(getAllStoresThunk());
    } catch (err) {
      console.error('Failed to save store:', err);
      const errorMsg = err.message || err.error || 'Có lỗi xảy ra khi lưu cửa hàng';
      error(errorMsg);
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
    
    // Reset image file và preview khi edit
    setSelectedImageFile(null);
    setImagePreview(store.imagePath || null);
    
    setShowEditModal(true);
  };

  // Khi edit store, load lại districts và wards dựa trên provinceName
  useEffect(() => {
    if (editingStore && showEditModal && provinces.length > 0 && editingStore.provinceName) {
      // Tìm tỉnh/thành phố từ provinceName
      const province = provinces.find(p => p.name === editingStore.provinceName);
      if (province) {
        setSelectedProvinceCode(province.code.toString());
        setDistricts(province.districts || []);
        
        // Parse địa chỉ để tìm quận/huyện và phường/xã (nếu có)
        // Địa chỉ thường có format: "số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
        const addressParts = (editingStore.address || '').split(',').map(s => s.trim());
        const provinceIndex = addressParts.findIndex(part => part === editingStore.provinceName);
        
        if (provinceIndex > 0) {
          // Có thể có quận/huyện ở index provinceIndex - 1
          const possibleDistrict = addressParts[provinceIndex - 1];
          const district = province.districts?.find(d => d.name === possibleDistrict);
          if (district) {
            setSelectedDistrictCode(district.code.toString());
            if (district.wards) {
              setWards(district.wards);
              
              // Có thể có phường/xã ở index provinceIndex - 2
              if (provinceIndex > 1) {
                const possibleWard = addressParts[provinceIndex - 2];
                const ward = district.wards?.find(w => w.name === possibleWard);
                if (ward) {
                  setSelectedWardCode(ward.code.toString());
                }
              }
            }
          }
          
          // Địa chỉ chi tiết là phần trước quận/huyện hoặc phường/xã
          if (provinceIndex > 1) {
            const detailParts = addressParts.slice(0, provinceIndex - 1);
            setDetailAddress(detailParts.join(', '));
          } else if (provinceIndex > 0) {
            const detailParts = addressParts.slice(0, provinceIndex - 1);
            setDetailAddress(detailParts.join(', '));
          }
        } else {
          // Không tìm thấy tỉnh trong địa chỉ, giữ nguyên địa chỉ
          setDetailAddress(editingStore.address || '');
        }
      }
    }
  }, [editingStore, showEditModal, provinces]);

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
    } catch (err) {
      console.error('Failed to delete store:', err);
      error('Không thể xóa cửa hàng. Vui lòng thử lại.');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStoreToDelete(null);
  };

  const handleViewDetail = (store) => {
    setStoreToView(store);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setStoreToView(null);
  };

  const handleViewImage = (imageUrl) => {
    setImageToView(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setImageToView(null);
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
    // Reset dependent dropdowns
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setSelectedWardCode(null);
    setDistricts([]);
    setWards([]);
    setDetailAddress('');
    setSelectedImageFile(null);
    setImagePreview(null);
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingStore(null);
  };
  
  // Handler cho file input
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        error('Vui lòng chọn file ảnh hợp lệ');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setSelectedImageFile(file);
      
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = () => {
    // Since searchStoresThunk is removed, we'll fetch all stores and filter frontend
    dispatch(getAllStoresThunk());
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
    // Since getStoresByProvinceThunk is removed, we'll fetch all stores and filter frontend
    dispatch(getAllStoresThunk());
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setProvinceFilter('');
    dispatch(getAllStoresThunk());
  };

  // Get unique provinces for filter dropdown (use all stores, not filtered)
  const uniqueProvinces = [...new Set(allStoresList.map(store => store.provinceName).filter(Boolean))];

  const tabs = [
    { id: 'stores', name: 'Danh sách cửa hàng', count: storesList.length }
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
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Cửa hàng
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Chủ cửa hàng
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Địa điểm
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Doanh thu
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {storesList.map((store, index) => (
              <tr 
                key={store.storeId || `store-${index}-${store.storeName || 'unknown'}`}
                className={`transition-all duration-200 hover:bg-blue-50 hover:shadow-sm cursor-pointer
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center">
                    {store.imagePath ? (
                      <img 
                        src={store.imagePath} 
                        alt={store.storeName}
                        className="h-10 w-10 rounded-lg object-cover mr-3 shadow-sm ring-2 ring-blue-100 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewImage(store.imagePath);
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-md ring-2 ring-blue-100"
                      style={{ display: store.imagePath ? 'none' : 'flex' }}
                    >
                      <span className="text-white font-bold text-xs">
                        {(store.storeName || '').charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{store.storeName}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {store.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{store.ownerName}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{store.provinceName}</div>
                  <div className="text-xs text-gray-500 max-w-xs truncate">{store.address}</div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-md ${getStatusColor(store.status)}`}>
                    {getStatusText(store.status)}
                  </span>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="text-xs text-gray-600">{store.totalOrders || 0} đơn hàng</div>
                  <div className="text-sm font-bold text-green-600">
                    {(store.totalRevenue || 0).toLocaleString('vi-VN')} ₫
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEdit(store)}
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(store)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    
                    <button 
                      onClick={() => handleViewDetail(store)}
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
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
                        {(searchTerm || statusFilter || provinceFilter) ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        )}
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {(searchTerm || statusFilter || provinceFilter) 
                        ? '🔍 Không tìm thấy cửa hàng phù hợp'
                        : 'Chưa có cửa hàng nào'
                      }
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                      {(searchTerm || statusFilter || provinceFilter)
                        ? 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để xem kết quả khác'
                        : 'Bắt đầu bằng cách thêm cửa hàng mới vào hệ thống để quản lý'
                      }
                    </p>
                    {(searchTerm || statusFilter || provinceFilter) ? (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('');
                          setProvinceFilter('');
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-white border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition shadow-sm hover:shadow-md text-sm"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Xóa bộ lọc
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Thêm cửa hàng đầu tiên
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );


  return (
    <div className="px-4 space-y-4">
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
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center text-sm"
          
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Thêm cửa hàng
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-3">
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
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center text-sm"
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
        </div>
      </div>

      {/* Add/Edit Store Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
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
              className="w-full max-w-3xl p-5 border shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto"
            >
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all bg-white"
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

                  {/* Address Detail - Số nhà, tên đường */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Địa chỉ chi tiết (Số nhà, tên đường) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="detailAddress"
                      value={detailAddress}
                      onChange={handleDetailAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
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

                  {/* Image Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hình ảnh cửa hàng {!editingStore && <span className="text-gray-500 font-normal">(tùy chọn)</span>}
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">
                          💡 Chọn file ảnh cửa hàng (JPG, PNG, GIF - tối đa 5MB). {editingStore ? 'Chọn ảnh mới để thay thế ảnh hiện tại.' : 'Ảnh sẽ được upload sau khi tạo cửa hàng thành công.'}
                        </p>
                      </div>
                      {(imagePreview || (editingStore && editingStore.imagePath)) && (
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-md">
                            <img 
                              src={imagePreview || editingStore.imagePath} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3EError%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                          <p className="text-xs text-center text-gray-500 mt-1">
                            {imagePreview && selectedImageFile ? 'Ảnh mới' : 'Ảnh hiện tại'}
                          </p>
                          {imagePreview && selectedImageFile && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImageFile(null);
                                setImagePreview(editingStore?.imagePath || null);
                              }}
                              className="mt-1 text-xs text-red-600 hover:text-red-700 underline"
                            >
                              Hủy ảnh mới
                            </button>
                          )}
                        </div>
                      )}
                    </div>
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
                    disabled={isCreatingStore}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                  >
                    {isCreatingStore && (
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {isCreatingStore ? (editingStore ? '⏳ Đang cập nhật...' : '⏳ Đang tạo...') : (editingStore ? '✅ Cập nhật' : '✨ Tạo cửa hàng')}
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
        {showDeleteModal && storeToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={cancelDelete}
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
                      {storeToDelete.imagePath ? (
                        <img 
                          src={storeToDelete.imagePath} 
                          alt={storeToDelete.storeName}
                          className="h-16 w-16 rounded-lg object-cover mr-3 shadow-md ring-2 ring-blue-100"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-md"
                        style={{ display: storeToDelete.imagePath ? 'none' : 'flex' }}
                      >
                        <span className="text-white font-bold text-lg">
                          {(storeToDelete.storeName || '').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{storeToDelete.storeName}</div>
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
                  <motion.button
                    onClick={cancelDelete}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all shadow-md"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    onClick={confirmDelete}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg flex items-center text-sm"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa cửa hàng
                  </motion.button>
                </div>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Store Detail Modal */}
      <AnimatePresence>
        {showDetailModal && storeToView && (
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
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900"> Chi tiết cửa hàng</h3>
                  <button
                    onClick={handleCloseDetailModal}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              
              <div className="space-y-6">
                {/* Store Avatar and Basic Info */}
                <div className="flex items-center space-x-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  {storeToView.imagePath ? (
                    <img 
                      src={storeToView.imagePath} 
                      alt={storeToView.storeName}
                      className="h-20 w-20 rounded-xl object-cover shadow-lg ring-4 ring-opacity-20 ring-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleViewImage(storeToView.imagePath)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="h-20 w-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg ring-4 ring-opacity-20 ring-gray-300"
                    style={{ display: storeToView.imagePath ? 'none' : 'flex' }}
                  >
                    <span className="text-white font-bold text-2xl">
                      {(storeToView.storeName || '').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">{storeToView.storeName}</h4>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(storeToView.status)}`}>
                        {getStatusText(storeToView.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Store Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Thông tin cửa hàng
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span className="text-sm text-gray-600">Tên cửa hàng:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{storeToView.storeName}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span className="text-sm text-gray-600">Số điện thoại:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{storeToView.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(storeToView.status)}`}>
                          {getStatusText(storeToView.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location and Owner Information */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Thông tin địa điểm & chủ cửa hàng
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 mr-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">Chủ cửa hàng:</span>
                          <span className="ml-2 text-sm font-medium text-gray-900">{storeToView.ownerName}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-4 h-4 mr-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">Tỉnh/Thành phố:</span>
                          <span className="ml-2 text-sm font-medium text-gray-900">{storeToView.provinceName || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-4 h-4 mr-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <div className="flex-1">
                          <span className="text-sm text-gray-600">Địa chỉ:</span>
                          <span className="ml-2 text-sm font-medium text-gray-900">{storeToView.address || 'N/A'}</span>
                        </div>
                      </div>
                      {storeToView.contractStartDate && (
                        <div className="flex items-start">
                          <svg className="w-4 h-4 mr-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div className="flex-1">
                            <span className="text-sm text-gray-600">Hợp đồng:</span>
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {new Date(storeToView.contractStartDate).toLocaleDateString('vi-VN')} - {storeToView.contractEndDate ? new Date(storeToView.contractEndDate).toLocaleDateString('vi-VN') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
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
                      handleEdit(storeToView);
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image View Modal */}
      <AnimatePresence>
        {showImageModal && imageToView && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 overflow-y-auto h-full w-full z-[60] backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleCloseImageModal}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] w-full"
            >
              <button
                onClick={handleCloseImageModal}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 hover:bg-black/50 rounded-full p-2 transition-all"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img 
                src={imageToView} 
                alt="Store image"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="18"%3EKhông thể tải ảnh%3C/text%3E%3C/svg%3E';
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StoreManagement;