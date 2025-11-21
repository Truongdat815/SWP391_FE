import { useState, useEffect } from 'react';
import { Edit, Image as ImageIcon, Building2, MapPin, Phone, User, Calendar, Eye, AlertCircle } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import {
  useGetMyStoreQuery,
  useUpdateMyStoreMutation,
} from '../../../api/dealerManager/storeApi';
import { provincesApi } from '../../../api/public/provincesApi';

const StoreManagementPage = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [formData, setFormData] = useState({
    storeName: '',
    address: '',
    phone: '',
    provinceName: '',
    ownerName: '',
    contractStartDate: '',
    contractEndDate: '',
  });

  const { data: storeResponse, isLoading, error } = useGetMyStoreQuery();
  const [updateStore, { isLoading: isUpdating }] = useUpdateMyStoreMutation();

  const store = storeResponse?.data;

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

  // Initialize form when store data is loaded
  useEffect(() => {
    if (store) {
      setFormData({
        storeName: store.storeName || '',
        address: store.address || '',
        phone: store.phone || '',
        provinceName: store.provinceName || '',
        ownerName: store.ownerName || '',
        contractStartDate: store.contractStartDate ? store.contractStartDate.split('T')[0] : '',
        contractEndDate: store.contractEndDate ? store.contractEndDate.split('T')[0] : '',
      });

      // Try to set province, district, ward from address
      if (store.provinceName) {
        const province = provinces.find(p => p.name === store.provinceName);
        if (province) {
          setSelectedProvinceCode(province.code.toString());
        }
      }
    }
  }, [store, provinces]);

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


  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!store?.storeId) {
      setErrorModal({ isOpen: true, message: 'Không tìm thấy thông tin đại lý' });
      return;
    }

    // Validation
    if (!formData.storeName?.trim()) {
      setErrorModal({ isOpen: true, message: 'Vui lòng nhập tên đại lý' });
      return;
    }

    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      setErrorModal({ isOpen: true, message: 'Số điện thoại phải có 10-11 chữ số' });
      return;
    }

    if (!formData.ownerName?.trim()) {
      setErrorModal({ isOpen: true, message: 'Vui lòng nhập tên chủ sở hữu' });
      return;
    }

    // Validation: Ngày kết thúc phải sau ngày bắt đầu
    if (formData.contractStartDate && formData.contractEndDate) {
      const startDate = new Date(formData.contractStartDate);
      const endDate = new Date(formData.contractEndDate);
      
      // Set time về 0 để so sánh chỉ ngày
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      if (endDate <= startDate) {
        setErrorModal({ isOpen: true, message: 'Ngày kết thúc hợp đồng phải sau ngày bắt đầu hợp đồng' });
        return;
      }
    }

    try {
      await updateStore({ storeId: store.storeId, ...formData }).unwrap();
      setIsEditModalOpen(false);
      setSuccessModal({ isOpen: true, message: 'Cập nhật thông tin đại lý thành công!' });
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi cập nhật thông tin đại lý';
      setErrorModal({ isOpen: true, message: errorMessage });
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleViewImage = () => {
    setIsImageModalOpen(true);
  };

  if (isLoading) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </DealerManagerLayout>
    );
  }

  if (error) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>
        </div>
      </DealerManagerLayout>
    );
  }

  if (!store) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Không tìm thấy thông tin đại lý</div>
        </div>
      </DealerManagerLayout>
    );
  }

  return (
    <DealerManagerLayout>
      <div className="max-w-6xl mx-auto space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thông tin Đại lý</h1>
            <p className="text-gray-600 mt-1 text-sm">Xem và quản lý thông tin đại lý của bạn.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEdit}>
              <Edit size={20} className="mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </div>

        {/* Store Information Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: All Information */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Tên đại lý</p>
                  <p className="text-base text-gray-900 font-medium">{store.storeName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Địa chỉ</p>
                  <p className="text-base text-gray-900">{store.address || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Số điện thoại</p>
                  <p className="text-base text-gray-900">{store.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Chủ sở hữu</p>
                  <p className="text-base text-gray-900">{store.ownerName || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Tỉnh/Thành phố</p>
                <p className="text-base text-gray-900">{store.provinceName || 'N/A'}</p>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Ngày bắt đầu hợp đồng</p>
                  <p className="text-base text-gray-900">{formatDate(store.contractStartDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Ngày kết thúc hợp đồng</p>
                  <p className="text-base text-gray-900">{formatDate(store.contractEndDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Trạng thái</p>
                <div className="mt-1">{getStatusBadge(store.status || 'ACTIVE')}</div>
              </div>
            </div>

            {/* Right Column: Store Image Only */}
            <div>
              {store.imagePath ? (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Hình ảnh chi nhánh</p>
                  <img
                    src={store.imagePath}
                    alt={store.storeName || 'Hình ảnh đại lý'}
                    className="w-full h-auto max-h-[400px] object-contain rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={handleViewImage}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[250px] border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <ImageIcon size={40} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Chưa có hình ảnh</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
        }}
        title="Chỉnh sửa Thông tin Đại lý"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Tên đại lý"
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
            required
          />
          <Input
            label="Ngày kết thúc hợp đồng"
            type="date"
            value={formData.contractEndDate}
            onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
            required
          />
          
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
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

      {/* Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
        }}
        title="Hình ảnh Đại lý"
        size="lg"
      >
        {store.imagePath && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">
                {store.storeName || 'Đại lý'}
              </p>
              <img
                src={store.imagePath}
                alt={store.storeName || 'Hình ảnh đại lý'}
                className="w-full h-auto object-contain rounded-lg max-h-[70vh]"
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsImageModalOpen(false);
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Lỗi"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-gray-700">{errorModal.message}</p>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setErrorModal({ isOpen: false, message: '' })}
              variant="primary"
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Thành công"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-700">{successModal.message}</p>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setSuccessModal({ isOpen: false, message: '' })}
              variant="primary"
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </DealerManagerLayout>
  );
};

export default StoreManagementPage;


