import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Eye, Image as ImageIcon, X, Building, User, Calendar, MapPin, Phone, Mail, Lightbulb, Check, AlertTriangle, Upload } from 'lucide-react';
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
import { addressKitApi } from '../../../api/public/addressKitApi';
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'deactivate' or 'activate'
  const [openMenuId, setOpenMenuId] = useState(null);

  // Address states for 2-level system (Province -> Commune)
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCommuneCode, setSelectedCommuneCode] = useState('');
  const [communeSearchTerm, setCommuneSearchTerm] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');

  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);

  // Edit form states
  const [editSelectedProvinceCode, setEditSelectedProvinceCode] = useState('');
  const [editSelectedCommuneCode, setEditSelectedCommuneCode] = useState('');
  const [editCommunes, setEditCommunes] = useState([]);
  const [editCommuneSearchTerm, setEditCommuneSearchTerm] = useState('');
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
        const data = await addressKitApi.getAllProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };
    loadProvinces();
  }, []);

  // Load communes when province is selected
  useEffect(() => {
    const loadCommunes = async () => {
      if (selectedProvinceCode) {
        try {
          const data = await addressKitApi.getCommunesByProvince(selectedProvinceCode);
          setCommunes(data || []);
          // Only reset if this is a user selection, not initial load
          if (selectedCommuneCode && !data?.find(c => c.code === selectedCommuneCode)) {
            setSelectedCommuneCode('');
          }
          setCommuneSearchTerm('');
        } catch (error) {
          console.error('Error loading communes:', error);
        }
      } else {
        setCommunes([]);
        setSelectedCommuneCode('');
        setCommuneSearchTerm('');
      }
    };
    loadCommunes();
  }, [selectedProvinceCode]);

  // Update address and provinceName when selections change
  useEffect(() => {
    const selectedProvince = provinces.find(p => p.code === selectedProvinceCode);
    const selectedCommune = communes.find(c => c.code === selectedCommuneCode);

    if (selectedProvince) {
      setFormData(prev => ({
        ...prev,
        provinceName: selectedProvince.name,
      }));
    }

    // Build address from commune and province
    const addressParts = [];
    if (selectedCommune) addressParts.push(selectedCommune.name);
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
  }, [selectedProvinceCode, selectedCommuneCode, detailedAddress, provinces, communes]);

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
      delete storeData.imagePath; // Remove imagePath

      await createStore(storeData).unwrap();

      // Refetch stores to get updated data
      await refetchStores();

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
      setSelectedCommuneCode('');
      setCommuneSearchTerm('');
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
      setEditSelectedProvinceCode(province.code);
      // Load communes
      try {
        const data = await addressKitApi.getCommunesByProvince(province.code);
        setEditCommunes(data || []);
      } catch (error) {
        console.error('Error loading communes:', error);
      }
    }

    // Parse address to extract detailed address
    // Address format: "detailed, Commune, Province" or old "detailed, Ward, District, Province"
    let detailedAddr = store.address || '';
    if (store.provinceName && detailedAddr.includes(store.provinceName)) {
      detailedAddr = detailedAddr.replace(store.provinceName, '').trim();
      if (detailedAddr.endsWith(',')) {
        detailedAddr = detailedAddr.slice(0, -1).trim();
      }
      // Note: We can't easily extract commune/district/ward without the full list loaded
      // So we just leave the detailed address as is for now, user can update it
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

  // Load edit communes when province is selected
  useEffect(() => {
    const loadEditCommunes = async () => {
      if (editSelectedProvinceCode) {
        try {
          const data = await addressKitApi.getCommunesByProvince(editSelectedProvinceCode);
          setEditCommunes(data || []);
          setEditSelectedCommuneCode('');
          setEditCommuneSearchTerm('');
        } catch (error) {
          console.error('Error loading communes:', error);
        }
      } else {
        setEditCommunes([]);
        setEditSelectedCommuneCode('');
        setEditCommuneSearchTerm('');
      }
    };
    loadEditCommunes();
  }, [editSelectedProvinceCode]);

  // Update edit address and provinceName when selections change
  useEffect(() => {
    const selectedProvince = provinces.find(p => p.code === editSelectedProvinceCode);
    const selectedCommune = editCommunes.find(c => c.code === editSelectedCommuneCode);

    if (selectedProvince) {
      setFormData(prev => ({
        ...prev,
        provinceName: selectedProvince.name,
      }));
    }

    // Build address from commune and province
    const addressParts = [];
    if (selectedCommune) addressParts.push(selectedCommune.name);
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
  }, [editSelectedProvinceCode, editSelectedCommuneCode, editDetailedAddress, provinces, editCommunes]);

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

      // Update store details first
      await updateStore({ storeId: selectedStore.storeId, ...updateData }).unwrap();

      // Upload image if new image is selected
      if (editSelectedImageFile && selectedStore.storeId) {
        try {
          const uploadResponse = await uploadStoreImage({
            storeId: selectedStore.storeId,
            file: editSelectedImageFile,
          }).unwrap();

          // Handle API response: data can be the URL string itself or an object
          const imagePath = typeof uploadResponse?.data === 'string'
            ? uploadResponse.data
            : (uploadResponse?.data?.imagePath || uploadResponse?.imagePath || '');

          if (imagePath) {
            await updateStore({
              storeId: selectedStore.storeId,
              ...updateData,
              imagePath: imagePath
            }).unwrap();
          }

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
      setEditSelectedCommuneCode('');
      setEditCommuneSearchTerm('');
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

  const handleOpenUploadModal = (store) => {
    setSelectedStore(store);
    setUploadFile(null);
    setUploadPreview(null);
    setIsUploadModalOpen(true);
  };

  const handleUploadFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImageSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedStore) return;

    try {
      const uploadResponse = await uploadStoreImage({
        storeId: selectedStore.storeId,
        file: uploadFile,
      }).unwrap();

      const imagePath = typeof uploadResponse?.data === 'string'
        ? uploadResponse.data
        : (uploadResponse?.data?.imagePath || uploadResponse?.imagePath || '');

      if (imagePath) {
        // Construct update data from selectedStore to ensure we don't lose data
        // We need to format dates correctly if they are strings
        const updateData = {
          storeName: selectedStore.storeName,
          address: selectedStore.address,
          phone: selectedStore.phone,
          provinceName: selectedStore.provinceName,
          ownerName: selectedStore.ownerName,
          status: selectedStore.status,
          contractStartDate: selectedStore.contractStartDate,
          contractEndDate: selectedStore.contractEndDate,
          imagePath: imagePath
        };

        await updateStore({
          storeId: selectedStore.storeId,
          ...updateData,
        }).unwrap();
      }

      await refetchStores();
      toast.success('Cập nhật hình ảnh thành công');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Có lỗi xảy ra khi upload hình ảnh');
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
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(store)}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(store)}
                          className="p-1 text-gray-500 hover:text-yellow-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        {!store.imagePath && (
                          <button
                            onClick={() => handleOpenUploadModal(store)}
                            className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                            title="Upload hình ảnh"
                          >
                            <Upload size={18} />
                          </button>
                        )}
                        {store.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleDeactivate(store)}
                            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                            title="Vô hiệu hóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(store)}
                            className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                            title="Kích hoạt"
                          >
                            <Check size={18} />
                          </button>
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
                  value: province.code,
                  label: province.name,
                }))}
                value={selectedProvinceCode}
                onChange={(value) => setSelectedProvinceCode(value)}
                placeholder="Chọn tỉnh/thành phố"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phường/Xã *
              </label>
              <Dropdown
                options={communes.map((commune) => ({
                  value: commune.code,
                  label: commune.name,
                }))}
                value={selectedCommuneCode}
                onChange={(value) => setSelectedCommuneCode(value)}
                placeholder="Chọn phường/xã"
                disabled={!selectedProvinceCode || communes.length === 0}
                searchable
                onSearchChange={setCommuneSearchTerm}
                searchValue={communeSearchTerm}
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

          {selectedProvinceCode && selectedCommuneCode && (
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
                <span>Địa chỉ sẽ tự động bao gồm: [Số nhà, tên đường] + Phường/Xã + Tỉnh/Thành phố</span>
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
              <Check className="w-4 h-4 mr-2" />
              {isCreating ? 'Đang tạo...' : 'Tạo chi nhánh'}
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
                  value: province.code,
                  label: province.name,
                }))}
                value={editSelectedProvinceCode}
                onChange={(value) => setEditSelectedProvinceCode(value)}
                placeholder="Chọn tỉnh/thành phố"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phường/Xã *
              </label>
              <Dropdown
                options={editCommunes.map((commune) => ({
                  value: commune.code,
                  label: commune.name,
                }))}
                value={editSelectedCommuneCode}
                onChange={(value) => setEditSelectedCommuneCode(value)}
                placeholder="Chọn phường/xã"
                disabled={!editSelectedProvinceCode || editCommunes.length === 0}
                searchable
                onSearchChange={setEditCommuneSearchTerm}
                searchValue={editCommuneSearchTerm}
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

          {editSelectedProvinceCode && editSelectedCommuneCode && (
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
                <span>Địa chỉ sẽ tự động bao gồm: [Số nhà, tên đường] + Phường/Xã + Tỉnh/Thành phố</span>
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

      {/* Upload Image Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadFile(null);
          setUploadPreview(null);
        }}
        title="Upload hình ảnh chi nhánh"
        size="md"
      >
        <form onSubmit={handleUploadImageSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn hình ảnh
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFileChange}
                className="block flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
            </div>
            {uploadPreview && (
              <div className="mt-4 flex justify-center">
                <img
                  src={uploadPreview}
                  alt="Preview"
                  className="max-w-full max-h-64 object-contain rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUploadModalOpen(false);
                setUploadFile(null);
                setUploadPreview(null);
              }}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={!uploadFile}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </form>
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
              className={`flex-1 ${confirmAction === 'deactivate'
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

