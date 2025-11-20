import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Eye, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import {
  useGetAllStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
  useGetStoreStatusesQuery,
  useUploadStoreImageMutation,
} from '../../../api/admin/storeApi';
import { provincesApi } from '../../../api/public/provincesApi';
import Dropdown from '../../../components/ui/Dropdown';

const BranchManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
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

  const { data: storesResponse, isLoading, error } = useGetAllStoresQuery();
  const { data: statusesResponse } = useGetStoreStatusesQuery();
  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();
  const [uploadStoreImage, { isLoading: isUploadingImage }] = useUploadStoreImageMutation();

  const stores = storesResponse?.data || [];
  const statuses = statusesResponse?.data || ['ACTIVE', 'INACTIVE'];

  // Debug: Log store structure in development
  if (import.meta.env.DEV && stores.length > 0) {
    console.log('Store data structure:', stores[0]);
  }

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.phone?.includes(searchTerm) ||
        store.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (store.provinceName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.storeId?.toString().includes(searchTerm);
      return matchesSearch;
    });
  }, [stores, searchTerm]);

  // Tính toán pagination
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStores = filteredStores.slice(startIndex, endIndex);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
      // Create store first
      const storeData = { ...formData };
      delete storeData.imagePath; // Remove imagePath, will be set after upload
      
      const createdStore = await createStore(storeData).unwrap();
      
      // Upload image after store is created (if image is selected)
      if (selectedImageFile && createdStore.storeId) {
        try {
          await uploadStoreImage({
            storeId: createdStore.storeId,
            file: selectedImageFile,
          }).unwrap();
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Store is created but image upload failed - show warning
          alert('Chi nhánh đã được tạo nhưng có lỗi khi upload hình ảnh. Vui lòng thử upload lại sau.');
        }
      }

      // Show success message
      alert('Tạo chi nhánh thành công');

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
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo chi nhánh');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleEdit = (store) => {
    setSelectedStore(store);
    setFormData({
      storeName: store.storeName || '',
      address: store.address || '',
      phone: store.phone || '',
      provinceName: store.provinceName || '',
      ownerName: store.ownerName || '',
      status: store.status || 'ACTIVE',
      contractStartDate: store.contractStartDate ? store.contractStartDate.split('T')[0] : '',
      contractEndDate: store.contractEndDate ? store.contractEndDate.split('T')[0] : '',
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateStore({ storeId: selectedStore.storeId, ...formData }).unwrap();
      setIsEditModalOpen(false);
      setSelectedStore(null);
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi cập nhật chi nhánh');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleDelete = async (storeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chi nhánh này?')) {
      try {
        await deleteStore(storeId).unwrap();
      } catch (error) {
        alert(error?.data?.message || 'Có lỗi xảy ra khi xóa chi nhánh');
        if (import.meta.env.DEV) {
          console.error(error);
        }
      }
    }
    setOpenMenuId(null);
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
        <div className="flex items-center justify-between">
          
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Thêm Chi nhánh
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <SearchBar
            placeholder="Tìm kiếm theo tên, địa chỉ, số điện thoại, chủ sở hữu, mã chi nhánh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
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
                  <Table.Head className="text-right">Hành động</Table.Head>
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
                    <Table.Cell className="whitespace-nowrap">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === store.storeId ? null : store.storeId)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                            {store.imagePath && (
                              <button
                                onClick={() => handleViewImage(store)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-200"
                              >
                                <ImageIcon size={16} />
                                Xem hình ảnh
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(store)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-200"
                            >
                              <Edit size={16} />
                              Chỉnh sửa
                            </button>
                            <button
                              onClick={() => handleDelete(store.storeId)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                              Xóa
                            </button>
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
        title="Thêm Chi nhánh"
        size="fullscreen"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Tên chi nhánh"
            value={formData.storeName}
            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            required
          />
          
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

          {selectedProvinceCode && districts.length > 0 && (
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
              />
            </div>
          )}

          {selectedDistrictCode && wards.length > 0 && (
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
              />
            </div>
          )}

          {selectedProvinceCode && selectedDistrictCode && selectedWardCode && (
            <Input
              label="Địa chỉ chi tiết (số nhà, tên đường, v.v.)"
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              placeholder="Ví dụ: 123 Đường ABC, Tòa nhà XYZ"
            />
          )}

          <Input
            label="Địa chỉ đầy đủ (tự động tạo từ lựa chọn trên)"
            value={formData.address}
            readOnly
            className="bg-gray-50"
          />

          <Input
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Chủ sở hữu"
            value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            required
          />
          <Input
            label="Ngày bắt đầu hợp đồng"
            type="date"
            value={formData.contractStartDate}
            onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
            min={getTodayDate()}
            required
          />
          <Input
            label="Ngày kết thúc hợp đồng"
            type="date"
            value={formData.contractEndDate}
            onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hình ảnh (tùy chọn)
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
              {isCreating || isUploadingImage ? 'Đang tạo...' : 'Tạo'}
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
        }}
        title="Chỉnh sửa Chi nhánh"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Tên chi nhánh"
            value={formData.storeName}
            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            required
          />
          <Input
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />
          <Input
            label="Tỉnh/Thành phố"
            value={formData.provinceName}
            onChange={(e) => setFormData({ ...formData, provinceName: e.target.value })}
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Chủ sở hữu"
            value={formData.ownerName}
            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            required
          />
          <Input
            label="Ngày bắt đầu hợp đồng"
            type="date"
            value={formData.contractStartDate}
            onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
            required
          />
          <Input
            label="Ngày kết thúc hợp đồng"
            type="date"
            value={formData.contractEndDate}
git             onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
            required
          />
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedStore(null);
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

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStore(null);
        }}
        title="Chi tiết Chi nhánh"
        size="lg"
      >
        {selectedStore && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Tên chi nhánh</p>
                <p className="text-base text-gray-900">{selectedStore.storeName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Tỉnh/Thành phố</p>
                <p className="text-base text-gray-900">{selectedStore.provinceName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                <p className="text-base text-gray-900">{selectedStore.phone || 'N/A'}</p>
              </div>
              <div className="col-span-3">
                <p className="text-sm font-medium text-gray-500">Địa chỉ</p>
                <p className="text-base text-gray-900">{selectedStore.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Chủ sở hữu</p>
                <p className="text-base text-gray-900">{selectedStore.ownerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ngày bắt đầu hợp đồng</p>
                <p className="text-base text-gray-900">{formatDate(selectedStore.contractStartDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ngày kết thúc hợp đồng</p>
                <p className="text-base text-gray-900">{formatDate(selectedStore.contractEndDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Trạng thái</p>
                <div className="mt-1">{getStatusBadge(selectedStore.status || 'ACTIVE')}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ngày tạo</p>
                <p className="text-base text-gray-900">{formatDate(selectedStore.createdAt)}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedStore(null);
                }}
              >
                Đóng
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
          setSelectedStore(null);
        }}
        title="Hình ảnh Chi nhánh"
        size="lg"
      >
        {selectedStore && selectedStore.imagePath && (
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
                  setSelectedStore(null);
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
        {selectedStore && !selectedStore.imagePath && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có hình ảnh</p>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImageModalOpen(false);
                  setSelectedStore(null);
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default BranchManagementPage;
