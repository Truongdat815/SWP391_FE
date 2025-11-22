import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Eye, Image as ImageIcon, X, Building, User, Calendar, MapPin, Phone, Mail, Lightbulb, Check, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import { useToast } from '../../../components/ui/Toast';
import {
  useGetAllStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useToggleStoreStatusMutation,
  useGetStoreStatusesQuery,
  useUploadStoreImageMutation,
} from '../../../api/admin/storeApi';
import { provincesApi } from '../../../api/public/provincesApi';
import Dropdown from '../../../components/ui/Dropdown';

const BranchManagementPage = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'deactivate' or 'activate'
  const [openMenuId, setOpenMenuId] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [detailedAddress, setDetailedAddress] = useState('');
  // Edit form states
  const [editSelectedProvinceCode, setEditSelectedProvinceCode] = useState('');
  const [editSelectedDistrictCode, setEditSelectedDistrictCode] = useState('');
  const [editSelectedWardCode, setEditSelectedWardCode] = useState('');
  const [editDistricts, setEditDistricts] = useState([]);
  const [editWards, setEditWards] = useState([]);
  const [editDetailedAddress, setEditDetailedAddress] = useState('');
  const [editSelectedImageFile, setEditSelectedImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editShowImagePreview, setEditShowImagePreview] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    address: '',
    phone: '',
    provinceName: '',
    ownerName: '',
    status: 'ACTIVE',
    contractStartDate: '',
    contractEndDate: '',
    imagePath: '',
  });

  const { data: storesResponse, isLoading, error, refetch: refetchStores } = useGetAllStoresQuery();
  const { data: statusesResponse } = useGetStoreStatusesQuery();
  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
  const [toggleStoreStatus, { isLoading: isTogglingStatus }] = useToggleStoreStatusMutation();
  const [uploadStoreImage, { isLoading: isUploadingImage }] = useUploadStoreImageMutation();

  const stores = storesResponse?.data || [];
  const statuses = statusesResponse?.data || ['ACTIVE', 'INACTIVE'];

  // Debug: Log store structure in development
  if (import.meta.env.DEV && stores.length > 0) {
    console.log('Store data structure:', stores[0]);
  }

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      // Filter by province
      const matchesProvince = !filterProvince || 
        store.provinceName?.toLowerCase() === filterProvince.toLowerCase();
      
      // Search by store name and phone
      const matchesSearch = !searchTerm || 
        store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.phone?.includes(searchTerm);
      
      return matchesProvince && matchesSearch;
    });
  }, [stores, searchTerm, filterProvince]);

  // Tính toán pagination
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStores = filteredStores.slice(startIndex, endIndex);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterProvince]);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await provincesApi.getAllProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province is selected
  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedProvinceCode) {
        try {
          const province = await provincesApi.getProvinceWithDistricts(selectedProvinceCode);
          setDistricts(province.districts || []);
          setWards([]);
          setSelectedDistrictCode('');
          setSelectedWardCode('');
        } catch (error) {
          console.error('Error loading districts:', error);
        }
      } else {
        setDistricts([]);
        setWards([]);
        setSelectedDistrictCode('');
        setSelectedWardCode('');
      }
    };
    loadDistricts();
  }, [selectedProvinceCode]);

  // Load wards when district is selected
  useEffect(() => {
    const loadWards = async () => {
      if (selectedDistrictCode) {
        try {
          const district = await provincesApi.getDistrictWithWards(selectedDistrictCode);
          setWards(district.wards || []);
          setSelectedWardCode('');
        } catch (error) {
          console.error('Error loading wards:', error);
        }
      } else {
        setWards([]);
        setSelectedWardCode('');
      }
    };
    loadWards();
  }, [selectedDistrictCode]);

  // Update address and provinceName when selections change
  useEffect(() => {
    const selectedProvince = provinces.find(p => p.code === parseInt(selectedProvinceCode));
    const selectedDistrict = districts.find(d => d.code === parseInt(selectedDistrictCode));
    const selectedWard = wards.find(w => w.code === parseInt(selectedWardCode));

    if (selectedProvince) {
      setFormData(prev => ({
        ...prev,
        provinceName: selectedProvince.name,
      }));
    }

    // Build address from ward, district, province
    const addressParts = [];
    if (selectedWard) addressParts.push(selectedWard.name);
    if (selectedDistrict) addressParts.push(selectedDistrict.name);
    if (selectedProvince) addressParts.push(selectedProvince.name);
    
    // Combine with detailed address if provided
    let fullAddress = '';
    if (detailedAddress.trim()) {
      fullAddress = detailedAddress.trim();
      if (addressParts.length > 0) {
        fullAddress += ', ' + addressParts.join(', ');
      }
    } else if (addressParts.length > 0) {
      fullAddress = addressParts.join(', ');
    }
    
    if (fullAddress) {
      setFormData(prev => ({
        ...prev,
        address: fullAddress,
      }));
    }
  }, [selectedProvinceCode, selectedDistrictCode, selectedWardCode, detailedAddress, provinces, districts, wards]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { variant: 'success', label: 'Hoạt động' },
      INACTIVE: { variant: 'error', label: 'Ngừng hoạt động' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      // Create preview but don't show it yet
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setShowImagePreview(false); // Reset preview visibility when new file is selected
    }
  };

  const handleToggleImagePreview = () => {
    setShowImagePreview(!showImagePreview);
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Create store first (without imagePath)
      const storeData = { ...formData };
      delete storeData.imagePath; // Remove imagePath, will be set after upload
      
      const createdStore = await createStore(storeData).unwrap();
      
      // Upload image after store is created (if image is selected)
      if (selectedImageFile && createdStore.storeId) {
        try {
          const uploadResponse = await uploadStoreImage({
            storeId: createdStore.storeId, // Use the storeId from created store
            file: selectedImageFile,
          }).unwrap();
          
          // Get imagePath from upload response
          const imagePath = uploadResponse?.data?.imagePath || uploadResponse?.imagePath || '';
          
          // Update store with imagePath
          if (imagePath) {
            await updateStore({
              storeId: createdStore.storeId,
              ...storeData,
              imagePath: imagePath,
            }).unwrap();
          }
          
          // Refetch stores to get updated data
          await refetchStores();
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Store is created but image upload failed - show warning
          toast.warning('Chi nhánh đã được tạo nhưng có lỗi khi upload hình ảnh. Vui lòng thử upload lại sau.');
          // Still refetch to show the created store
          await refetchStores();
        }
      } else {
        // Refetch stores even if no image to ensure data is fresh
        await refetchStores();
      }

      // Show success message
      toast.success('Tạo chi nhánh thành công');

      // Reset form
      setIsCreateModalOpen(false);
      setFormData({
        storeName: '',
        address: '',
        phone: '',
        provinceName: '',
        ownerName: '',
        status: 'ACTIVE',
        contractStartDate: '',
        contractEndDate: '',
        imagePath: '',
      });
      setSelectedProvinceCode('');
      setSelectedDistrictCode('');
      setSelectedWardCode('');
      setSelectedImageFile(null);
      setImagePreview(null);
      setShowImagePreview(false);
      setDetailedAddress('');
    } catch (error) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo chi nhánh');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleEdit = async (store) => {
    setSelectedStore(store);
    
    // Find province by name
    const province = provinces.find(p => p.name === store.provinceName);
    if (province) {
      setEditSelectedProvinceCode(province.code.toString());
      // Load districts
      try {
        const provinceData = await provincesApi.getProvinceWithDistricts(province.code);
        setEditDistricts(provinceData.districts || []);
      } catch (error) {
        console.error('Error loading districts:', error);
      }
    }
    
    // Parse address to extract detailed address and ward/district
    // Address format: "detailed, Ward, District, Province"
    let detailedAddr = store.address || '';
    if (store.provinceName && detailedAddr.includes(store.provinceName)) {
      detailedAddr = detailedAddr.replace(store.provinceName, '').trim();
      if (detailedAddr.endsWith(',')) {
        detailedAddr = detailedAddr.slice(0, -1).trim();
      }
    }
    
    setEditDetailedAddress(detailedAddr);
    
    setFormData({
      storeName: store.storeName || '',
      address: store.address || '',
      phone: store.phone || '',
      provinceName: store.provinceName || '',
      ownerName: store.ownerName || '',
      status: store.status || 'ACTIVE',
      contractStartDate: store.contractStartDate ? store.contractStartDate.split('T')[0] : '',
      contractEndDate: store.contractEndDate ? store.contractEndDate.split('T')[0] : '',
      imagePath: store.imagePath || '',
    });
    
    setEditSelectedImageFile(null);
    setEditImagePreview(store.imagePath || null);
    setEditShowImagePreview(false);
    
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  // Load edit districts when province is selected
  useEffect(() => {
    const loadEditDistricts = async () => {
      if (editSelectedProvinceCode) {
        try {
          const province = await provincesApi.getProvinceWithDistricts(parseInt(editSelectedProvinceCode));
          setEditDistricts(province.districts || []);
          setEditWards([]);
          setEditSelectedDistrictCode('');
          setEditSelectedWardCode('');
        } catch (error) {
          console.error('Error loading districts:', error);
        }
      } else {
        setEditDistricts([]);
        setEditWards([]);
        setEditSelectedDistrictCode('');
        setEditSelectedWardCode('');
      }
    };
    loadEditDistricts();
  }, [editSelectedProvinceCode]);

  // Load edit wards when district is selected
  useEffect(() => {
    const loadEditWards = async () => {
      if (editSelectedDistrictCode) {
        try {
          const district = await provincesApi.getDistrictWithWards(parseInt(editSelectedDistrictCode));
          setEditWards(district.wards || []);
          setEditSelectedWardCode('');
        } catch (error) {
          console.error('Error loading wards:', error);
        }
      } else {
        setEditWards([]);
        setEditSelectedWardCode('');
      }
    };
    loadEditWards();
  }, [editSelectedDistrictCode]);

  // Update edit address and provinceName when selections change
  useEffect(() => {
    const selectedProvince = provinces.find(p => p.code === parseInt(editSelectedProvinceCode));
    const selectedDistrict = editDistricts.find(d => d.code === parseInt(editSelectedDistrictCode));
    const selectedWard = editWards.find(w => w.code === parseInt(editSelectedWardCode));

    if (selectedProvince) {
      setFormData(prev => ({
        ...prev,
        provinceName: selectedProvince.name,
      }));
    }

    // Build address from ward, district, province
    const addressParts = [];
    if (selectedWard) addressParts.push(selectedWard.name);
    if (selectedDistrict) addressParts.push(selectedDistrict.name);
    if (selectedProvince) addressParts.push(selectedProvince.name);
    
    // Combine with detailed address if provided
    let fullAddress = '';
    if (editDetailedAddress.trim()) {
      fullAddress = editDetailedAddress.trim();
      if (addressParts.length > 0) {
        fullAddress += ', ' + addressParts.join(', ');
      }
    } else if (addressParts.length > 0) {
      fullAddress = addressParts.join(', ');
    }
    
    if (fullAddress) {
      setFormData(prev => ({
        ...prev,
        address: fullAddress,
      }));
    }
  }, [editSelectedProvinceCode, editSelectedDistrictCode, editSelectedWardCode, editDetailedAddress, provinces, editDistricts, editWards]);

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setEditShowImagePreview(false);
    }
  };

  const handleEditToggleImagePreview = () => {
    setEditShowImagePreview(!editShowImagePreview);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...formData };
      delete updateData.imagePath; // Remove imagePath, will be set after upload
      
      await updateStore({ storeId: selectedStore.storeId, ...updateData }).unwrap();
      
      // Upload image if new image is selected
      if (editSelectedImageFile && selectedStore.storeId) {
        try {
          await uploadStoreImage({
            storeId: selectedStore.storeId,
            file: editSelectedImageFile,
          }).unwrap();
          // Refetch stores to get updated imagePath
          await refetchStores();
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.warning('Chi nhánh đã được cập nhật nhưng có lỗi khi upload hình ảnh. Vui lòng thử upload lại sau.');
        }
      } else {
        // Refetch stores even if no image to ensure data is fresh
        await refetchStores();
      }

      toast.success('Cập nhật chi nhánh thành công');
      
      setIsEditModalOpen(false);
      setSelectedStore(null);
      setEditSelectedProvinceCode('');
      setEditSelectedDistrictCode('');
      setEditSelectedWardCode('');
      setEditDetailedAddress('');
      setEditSelectedImageFile(null);
      setEditImagePreview(null);
      setEditShowImagePreview(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi cập nhật chi nhánh');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleDeactivate = (store) => {
    setSelectedStore(store);
    setConfirmAction('deactivate');
    setIsConfirmModalOpen(true);
    setOpenMenuId(null);
  };

  const confirmDeactivate = async () => {
    if (!selectedStore) return;
    
    try {
      if (import.meta.env.DEV) {
        console.log('Calling PUT /stores/toggle-status/' + selectedStore.storeId);
      }
      
      // Sử dụng API PUT /stores/toggle-status/{storeId} để vô hiệu hóa chi nhánh
      const response = await toggleStoreStatus(selectedStore.storeId).unwrap();
      
      if (import.meta.env.DEV) {
        console.log('API Response:', response);
        console.log('Response status:', response?.data?.status);
      }
      
      // Refetch để cập nhật UI ngay lập tức
      await refetchStores();
      
      toast.success('Vô hiệu hóa chi nhánh thành công');
      setIsConfirmModalOpen(false);
      setSelectedStore(null);
      setConfirmAction(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi vô hiệu hóa chi nhánh');
      if (import.meta.env.DEV) {
        console.error('Error calling PUT /stores/toggle-status:', error);
      }
    }
  };

  const handleActivate = (store) => {
    setSelectedStore(store);
    setConfirmAction('activate');
    setIsConfirmModalOpen(true);
    setOpenMenuId(null);
  };

  const confirmActivate = async () => {
    if (!selectedStore) return;
    
    try {
      if (import.meta.env.DEV) {
        console.log('Calling PUT /stores/toggle-status/' + selectedStore.storeId);
      }
      
      // Sử dụng API PUT /stores/toggle-status/{storeId} để kích hoạt chi nhánh
      const response = await toggleStoreStatus(selectedStore.storeId).unwrap();
      
      if (import.meta.env.DEV) {
        console.log('API Response:', response);
        console.log('Response status:', response?.data?.status);
      }
      
      // Refetch để cập nhật UI ngay lập tức
      await refetchStores();
      
      toast.success('Kích hoạt chi nhánh thành công');
      setIsConfirmModalOpen(false);
      setSelectedStore(null);
      setConfirmAction(null);
    } catch (error) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi kích hoạt chi nhánh');
      if (import.meta.env.DEV) {
        console.error('Error calling PUT /stores/toggle-status:', error);
      }
    }
  };

  const handleViewDetail = (store) => {
    setSelectedStore(store);
    setIsDetailModalOpen(true);
    setOpenMenuId(null);
  };

  const handleViewImage = (store) => {
    setSelectedStore(store);
    setIsImageModalOpen(true);
    setOpenMenuId(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <SearchBar
            placeholder="Tìm kiếm theo tên chi nhánh, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <div className="w-64">
            <Dropdown
              options={[
                { value: '', label: 'Tất cả tỉnh/thành phố' },
                ...Array.from(new Set(stores.map(s => s.provinceName).filter(Boolean)))
                  .sort()
                  .map(province => ({
                    value: province,
                    label: province,
                  }))
              ]}
              value={filterProvince}
              onChange={(value) => setFilterProvince(value)}
              placeholder="Lọc theo tỉnh/thành phố"
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Thêm Chi nhánh
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Tên Chi nhánh</Table.Head>
                  <Table.Head>Địa chỉ</Table.Head>
                  <Table.Head>Số điện thoại</Table.Head>
                  <Table.Head>Chủ sở hữu</Table.Head>
                  <Table.Head>Ngày kết thúc HĐ</Table.Head>
                  <Table.Head>Trạng thái</Table.Head>
                  <Table.Head className="text-center whitespace-nowrap">Hành động</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {paginatedStores.map((store) => (
                  <Table.Row key={store.storeId}>
                    <Table.Cell className="font-medium whitespace-nowrap">
                      {store.storeName || `Chi nhánh ${store.storeId}`}
                    </Table.Cell>
                    <Table.Cell>{store.address || 'Chưa cập nhật'}</Table.Cell>
                    <Table.Cell>{store.phone || 'N/A'}</Table.Cell>
                    <Table.Cell>{store.ownerName || 'N/A'}</Table.Cell>
                    <Table.Cell>{formatDate(store.contractEndDate)}</Table.Cell>
                    <Table.Cell className="whitespace-nowrap">{getStatusBadge(store.status || 'ACTIVE')}</Table.Cell>
                    <Table.Cell className="text-center">
                      <div className="relative flex justify-center">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === store.storeId ? null : store.storeId)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === store.storeId && (
                          <div className="absolute right-0 mt-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => handleViewDetail(store)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-200"
                            >
                              <Eye size={16} />
                              Xem chi tiết
                            </button>
                            <button
                              onClick={() => handleEdit(store)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-200"
                            >
                              <Edit size={16} />
                              Chỉnh sửa
                            </button>
                            {store.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleDeactivate(store)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-orange-600 hover:bg-orange-50 transition-colors"
                              >
                                <X size={16} />
                                Vô hiệu hóa
                              </button>
                            )}
                            {store.status === 'INACTIVE' && (
                              <button
                                onClick={() => handleActivate(store)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left text-green-600 hover:bg-green-50 transition-colors"
                              >
                                <Check size={16} />
                                Kích hoạt
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {filteredStores.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredStores.length)} của{' '}
              {filteredStores.length} chi nhánh
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Hiển thị tối đa 5 số trang
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          // Reset form when closing
          setFormData({
            storeName: '',
            address: '',
            phone: '',
            provinceName: '',
            ownerName: '',
            status: 'ACTIVE',
            contractStartDate: '',
            contractEndDate: '',
            imagePath: '',
          });
          setSelectedProvinceCode('');
          setSelectedDistrictCode('');
          setSelectedWardCode('');
          setSelectedImageFile(null);
          setImagePreview(null);
        }}
        title={
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-yellow-500" />
            <span>Thêm chi nhánh</span>
          </div>
        }
        size="lg"
      >
         <form onSubmit={handleCreate} className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Tỉnh/Thành phố *
               </label>
               <Dropdown
                 options={provinces.map((province) => ({
                   value: province.code.toString(),
                   label: province.name,
                 }))}
                 value={selectedProvinceCode}
                 onChange={(value) => setSelectedProvinceCode(value)}
                 placeholder="Chọn tỉnh/thành phố"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Quận/Huyện *
               </label>
               <Dropdown
                 options={districts.map((district) => ({
                   value: district.code.toString(),
                   label: district.name,
                 }))}
                 value={selectedDistrictCode}
                 onChange={(value) => setSelectedDistrictCode(value)}
                 placeholder="Chọn quận/huyện"
                 disabled={!selectedProvinceCode || districts.length === 0}
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 Phường/Xã *
               </label>
               <Dropdown
                 options={wards.map((ward) => ({
                   value: ward.code.toString(),
                   label: ward.name,
                 }))}
                 value={selectedWardCode}
                 onChange={(value) => setSelectedWardCode(value)}
                 placeholder="Chọn phường/xã"
                 disabled={!selectedDistrictCode || wards.length === 0}
               />
             </div>

            <Input
              label="Tên cửa hàng *"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              required
            />

            <Input
              label="Tên chủ cửa hàng *"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              required
            />

            <Input
              label="Số điện thoại *"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          {selectedProvinceCode && selectedDistrictCode && selectedWardCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ chi tiết (Số nhà, tên đường) *
              </label>
              <Input
                value={detailedAddress}
                onChange={(e) => setDetailedAddress(e.target.value)}
                placeholder="Ví dụ: 123 Đường ABC"
                required
              />
              <div className="flex items-start gap-2 mt-2 text-sm text-gray-500">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Địa chỉ sẽ tự động bao gồm: [Số nhà, tên đường] + Phường/Xã + Quận/Huyện + Tỉnh/Thành phố</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ đầy đủ (tự động tạo)
            </label>
            <Input
              value={formData.address}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu hợp đồng *"
              type="date"
              value={formData.contractStartDate}
              onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
              min={getTodayDate()}
              required
            />
            <Input
              label="Ngày kết thúc hợp đồng *"
              type="date"
              value={formData.contractEndDate}
              onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
              min={formData.contractStartDate || getTodayDate()}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hình ảnh cửa hàng
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedImageFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleToggleImagePreview}
                  size="sm"
                >
                  {showImagePreview ? 'Ẩn' : 'Xem trước'}
                </Button>
              )}
            </div>
            {imagePreview && showImagePreview && (
              <div className="mt-2 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200"
                />
              </div>
            )}
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
            <Button type="submit" className="flex-1" disabled={isCreating || isUploadingImage}>
              <Check className="w-4 h-4 mr-2" />
              {isCreating || isUploadingImage ? 'Đang tạo...' : 'Tạo chi nhánh'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStore(null);
          setEditSelectedProvinceCode('');
          setEditSelectedDistrictCode('');
          setEditSelectedWardCode('');
          setEditDetailedAddress('');
          setEditSelectedImageFile(null);
          setEditImagePreview(null);
          setEditShowImagePreview(false);
        }}
        title={
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-yellow-500" />
            <span>Chỉnh sửa cửa hàng</span>
          </div>
        }
        size="lg"
        className="max-h-[90vh] flex flex-col"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỉnh/Thành phố *
              </label>
              <Dropdown
                options={provinces.map((province) => ({
                  value: province.code.toString(),
                  label: province.name,
                }))}
                value={editSelectedProvinceCode}
                onChange={(value) => setEditSelectedProvinceCode(value)}
                placeholder="Chọn tỉnh/thành phố"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quận/Huyện *
              </label>
              <Dropdown
                options={editDistricts.map((district) => ({
                  value: district.code.toString(),
                  label: district.name,
                }))}
                value={editSelectedDistrictCode}
                onChange={(value) => setEditSelectedDistrictCode(value)}
                placeholder="Chọn quận/huyện"
                disabled={!editSelectedProvinceCode || editDistricts.length === 0}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phường/Xã *
              </label>
              <Dropdown
                options={editWards.map((ward) => ({
                  value: ward.code.toString(),
                  label: ward.name,
                }))}
                value={editSelectedWardCode}
                onChange={(value) => setEditSelectedWardCode(value)}
                placeholder="Chọn phường/xã"
                disabled={!editSelectedDistrictCode || editWards.length === 0}
              />
            </div>

            <Input
              label="Tên cửa hàng *"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              required
            />

            <Input
              label="Tên chủ cửa hàng *"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              required
            />

            <Input
              label="Số điện thoại *"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          {editSelectedProvinceCode && editSelectedDistrictCode && editSelectedWardCode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ chi tiết (Số nhà, tên đường) *
              </label>
              <Input
                value={editDetailedAddress}
                onChange={(e) => setEditDetailedAddress(e.target.value)}
                placeholder="Ví dụ: 123 Đường ABC"
                required
              />
              <div className="flex items-start gap-2 mt-2 text-sm text-gray-500">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Địa chỉ sẽ tự động bao gồm: [Số nhà, tên đường] + Phường/Xã + Quận/Huyện + Tỉnh/Thành phố</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ đầy đủ (tự động tạo)
            </label>
            <Input
              value={formData.address}
              readOnly
              className="bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hình ảnh cửa hàng
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleEditImageChange}
                className="block flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {editSelectedImageFile && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditToggleImagePreview}
                  size="sm"
                >
                  {editShowImagePreview ? 'Ẩn' : 'Xem trước'}
                </Button>
              )}
            </div>
            {editImagePreview && editShowImagePreview && (
              <div className="mt-2 flex justify-center">
                <img
                  src={editImagePreview}
                  alt="Preview"
                  className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200"
                />
              </div>
            )}
            {!editSelectedImageFile && selectedStore?.imagePath && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-2">Hình ảnh hiện tại:</p>
                <img
                  src={selectedStore.imagePath}
                  alt="Current"
                  className="max-w-full max-h-48 object-contain rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedStore(null);
                setEditSelectedProvinceCode('');
                setEditSelectedDistrictCode('');
                setEditSelectedWardCode('');
                setEditDetailedAddress('');
                setEditSelectedImageFile(null);
                setEditImagePreview(null);
                setEditShowImagePreview(false);
              }}
              className="flex-1"
              disabled={isUpdating || isUploadingImage}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isUpdating || isUploadingImage}>
              <Check className="w-4 h-4 mr-2" />
              {isUpdating || isUploadingImage ? 'Đang cập nhật...' : 'Cập nhật chi nhánh'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStore(null);
        }}
        title="Chi tiết cửa hàng"
        size="lg"
        className="max-h-[90vh] flex flex-col"
      >
        {selectedStore && (
          <div className="space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto">
            {/* Store Overview Card */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {selectedStore.imagePath ? (
                <img
                  src={selectedStore.imagePath}
                  alt={selectedStore.storeName}
                  className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleViewImage(selectedStore)}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">{selectedStore.storeName || 'N/A'}</h3>
                <div className="mt-1">
                  {getStatusBadge(selectedStore.status || 'ACTIVE')}
                </div>
              </div>
            </div>

            {/* Store Image Card */}
            {selectedStore.imagePath && (
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-900">Hình ảnh cửa hàng</h4>
                </div>
                <div className="flex justify-center">
                  <img
                    src={selectedStore.imagePath}
                    alt={selectedStore.storeName || 'Hình ảnh chi nhánh'}
                    className="max-w-full max-h-96 object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleViewImage(selectedStore)}
                  />
                </div>
                <div className="mt-2 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewImage(selectedStore)}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Xem hình ảnh lớn
                  </Button>
                </div>
              </div>
            )}

            {/* Store Information Card */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-900">Thông tin cửa hàng</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Tên</p>
                    <p className="text-sm text-gray-900">{selectedStore.storeName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Tỉnh/TP</p>
                    <p className="text-sm text-gray-900">{selectedStore.provinceName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Địa chỉ</p>
                    <p className="text-sm text-gray-900">{selectedStore.address || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Hợp đồng</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedStore.contractStartDate)} - {formatDate(selectedStore.contractEndDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Owner Information Card */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-semibold text-gray-900">Thông tin chủ cửa hàng</h4>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Chủ cửa hàng</p>
                    <p className="text-sm text-gray-900">{selectedStore.ownerName || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Điện thoại</p>
                    <p className="text-sm text-gray-900">{selectedStore.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedStore(null);
                }}
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEdit(selectedStore);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          // Quay lại form xem chi tiết
          setIsDetailModalOpen(true);
        }}
        title="Hình ảnh Chi nhánh"
        size="lg"
      >
        {selectedStore?.imagePath ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                {selectedStore.storeName || 'Chi nhánh'}
              </p>
              <img
                src={selectedStore.imagePath}
                alt={selectedStore.storeName || 'Hình ảnh chi nhánh'}
                className="w-full h-auto object-contain rounded-lg max-h-[70vh]"
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImageModalOpen(false);
                  // Quay lại form xem chi tiết
                  setIsDetailModalOpen(true);
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có hình ảnh</p>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImageModalOpen(false);
                  // Quay lại form xem chi tiết
                  setIsDetailModalOpen(true);
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedStore(null);
          setConfirmAction(null);
        }}
        title={
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span>Xác nhận</span>
          </div>
        }
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                {confirmAction === 'deactivate' 
                  ? `Bạn có chắc chắn muốn vô hiệu hóa chi nhánh "${selectedStore?.storeName || 'N/A'}"?`
                  : `Bạn có chắc chắn muốn kích hoạt chi nhánh "${selectedStore?.storeName || 'N/A'}"?`
                }
              </p>
              {confirmAction === 'deactivate' && (
                <p className="text-xs text-gray-500 mt-1">
                  Chi nhánh sẽ bị vô hiệu hóa và không thể sử dụng cho đến khi được kích hoạt lại.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setSelectedStore(null);
                setConfirmAction(null);
              }}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={confirmAction === 'deactivate' ? confirmDeactivate : confirmActivate}
              className={`flex-1 ${
                confirmAction === 'deactivate' 
                  ? 'bg-orange-600 hover:bg-orange-700' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              disabled={isTogglingStatus}
            >
              {isTogglingStatus 
                ? 'Đang xử lý...' 
                : confirmAction === 'deactivate' 
                  ? 'Vô hiệu hóa' 
                  : 'Kích hoạt'
              }
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default BranchManagementPage;

