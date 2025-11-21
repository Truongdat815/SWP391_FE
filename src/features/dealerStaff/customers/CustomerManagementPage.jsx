import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, MapPin, Phone, Mail, Users, Eye, ShoppingCart, Calendar, CreditCard, Package } from 'lucide-react';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import Badge from '../../../components/ui/Badge';
import {
  useGetAllCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetCustomerByIdQuery,
} from '../../../api/dealerStaff/customerApi';
import { useGetOrdersByCustomerQuery } from '../../../api/dealerStaff/orderApi';
import { provincesApi } from '../../../api/public/provincesApi';

const CustomerManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Address dropdown states for create modal
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
  const [selectedWardCode, setSelectedWardCode] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');

  // Address dropdown states for edit modal
  const [editDistricts, setEditDistricts] = useState([]);
  const [editWards, setEditWards] = useState([]);
  const [editSelectedProvinceCode, setEditSelectedProvinceCode] = useState('');
  const [editSelectedDistrictCode, setEditSelectedDistrictCode] = useState('');
  const [editSelectedWardCode, setEditSelectedWardCode] = useState('');
  const [editDetailedAddress, setEditDetailedAddress] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    identificationNumber: '',
  });

  const { data: customersData, isLoading, error } = useGetAllCustomersQuery();
  const [createCustomer, { isLoading: isCreating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();

  // Fetch customer details when modal is open
  const { data: customerDetailsData } = useGetCustomerByIdQuery(selectedCustomerId, {
    skip: !selectedCustomerId || !isDetailsModalOpen,
  });

  // Fetch customer orders when modal is open
  const { data: customerOrdersData, isLoading: isLoadingOrders } = useGetOrdersByCustomerQuery(selectedCustomerId, {
    skip: !selectedCustomerId || !isOrdersModalOpen,
  });

  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  const customerDetails = customerDetailsData?.data;
  const customerOrders = Array.isArray(customerOrdersData?.data) ? customerOrdersData.data : [];

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

  // Load districts when province is selected (create modal)
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

  // Load wards when district is selected (create modal)
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

  // Update address when selections change (create modal)
  useEffect(() => {
    const selectedProvince = provinces.find(p => p.code === parseInt(selectedProvinceCode));
    const selectedDistrict = districts.find(d => d.code === parseInt(selectedDistrictCode));
    const selectedWard = wards.find(w => w.code === parseInt(selectedWardCode));

    const addressParts = [];
    if (selectedWard) addressParts.push(selectedWard.name);
    if (selectedDistrict) addressParts.push(selectedDistrict.name);
    if (selectedProvince) addressParts.push(selectedProvince.name);

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

  // Load edit districts when province is selected (edit modal)
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

  // Load edit wards when district is selected (edit modal)
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

  // Update edit address when selections change (edit modal)
  useEffect(() => {
    const selectedProvince = provinces.find(p => p.code === parseInt(editSelectedProvinceCode));
    const selectedDistrict = editDistricts.find(d => d.code === parseInt(editSelectedDistrictCode));
    const selectedWard = editWards.find(w => w.code === parseInt(editSelectedWardCode));

    const addressParts = [];
    if (selectedWard) addressParts.push(selectedWard.name);
    if (selectedDistrict) addressParts.push(selectedDistrict.name);
    if (selectedProvince) addressParts.push(selectedProvince.name);

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

  // Filter and sort customers by join date (newest first)
  const filteredCustomers = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    const filtered = customers.filter((customer) => {
      const matchesSearch =
        customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // Sort by createdAt (newest first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  }, [customers, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCustomer(formData).unwrap();
      setIsCreateModalOpen(false);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        identificationNumber: '',
      });
      setSelectedProvinceCode('');
      setSelectedDistrictCode('');
      setSelectedWardCode('');
      setDetailedAddress('');
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo khách hàng');
    }
  };

  const handleEdit = async (customer) => {
    setSelectedCustomer(customer);

    // Parse existing address to populate dropdowns if possible
    setEditDetailedAddress(customer.address || '');

    setFormData({
      fullName: customer.fullName || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      identificationNumber: customer.identificationNumber || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCustomer({ id: selectedCustomer.customerId, ...formData }).unwrap();
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      setEditSelectedProvinceCode('');
      setEditSelectedDistrictCode('');
      setEditSelectedWardCode('');
      setEditDetailedAddress('');
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi cập nhật khách hàng');
    }
  };

  const handleViewDetails = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsDetailsModalOpen(true);
  };

  const handleViewOrders = (customerId) => {
    setSelectedCustomerId(customerId);
    setIsOrdersModalOpen(true);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: { variant: 'default', label: 'Nháp' },
      PENDING: { variant: 'warning', label: 'Chờ xử lý' },
      CONFIRMED: { variant: 'info', label: 'Đã xác nhận' },
      PAID: { variant: 'success', label: 'Đã thanh toán' },
      DELIVERED: { variant: 'success', label: 'Đã giao' },
      CANCELLED: { variant: 'error', label: 'Đã hủy' },
    };
    const config = statusMap[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </DealerStaffLayout>
    );
  }

  if (error) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
        </div>
      </DealerStaffLayout>
    );
  }

  return (
    <DealerStaffLayout
      title="Quản lý Khách hàng"
      description="Xem, tạo, chỉnh sửa và quản lý thông tin khách hàng."
    >
      <div className="mx-auto max-w-[90rem] px-0 py-4 pl-10 pr-10 pt-8 space-y-4">
        {/* Main Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                placeholder="Tìm kiếm theo tên, SĐT, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              <span>Thêm khách hàng</span>
            </Button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Liên hệ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Địa chỉ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tham gia</th>
                  <th className="px-6 py-4 text pr-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="p-3 rounded-full bg-slate-100">
                          <Users size={24} className="text-slate-400" />
                        </div>
                        <p>Không tìm thấy khách hàng nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <tr key={customer.customerId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{customer.fullName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-sm text-slate-600">
                            <Phone size={14} className="mr-2 text-slate-400" />
                            {customer.phone || 'N/A'}
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail size={14} className="mr-2 text-slate-400" />
                            {customer.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start text-sm text-slate-600 max-w-xs" title={customer.address}>
                          <MapPin size={14} className="mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{customer.address || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(customer.customerId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleViewOrders(customer.customerId)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Xem đơn hàng"
                          >
                            <ShoppingCart size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="text-sm text-slate-500">
                Hiển thị <span className="font-medium text-slate-900">{startIndex + 1}</span> đến{' '}
                <span className="font-medium text-slate-900">{Math.min(endIndex, filteredCustomers.length)}</span> của{' '}
                <span className="font-medium text-slate-900">{filteredCustomers.length}</span> kết quả
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Trang trước
                </Button>
                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Trang sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedProvinceCode('');
          setSelectedDistrictCode('');
          setSelectedWardCode('');
          setDetailedAddress('');
        }}
        title="Thêm Khách Hàng Mới"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-5">
         

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Quận/Huyện <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phường/Xã <span className="text-red-500">*</span>
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
          </div>

          <Input
            label="Địa chỉ cụ thể (Số nhà, tên đường)"
            value={detailedAddress}
            onChange={(e) => setDetailedAddress(e.target.value)}
            placeholder="VD: 123 Đường ABC"
            required
          />


          <Input
            label="Họ và tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            placeholder="Nhập họ tên đầy đủ"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="09xxxxxxxxx"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="example@email.com"
            />
          </div>

          <Input
            label="CCCD/CMND"
            value={formData.identificationNumber}
            onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
            required
            placeholder="Số CCCD/CMND"
          />

          <div className="flex gap-4 pt-4 border-t border-slate-200 mt-6">
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
              {isCreating ? 'Đang tạo...' : 'Tạo khách hàng'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCustomer(null);
          setEditSelectedProvinceCode('');
          setEditSelectedDistrictCode('');
          setEditSelectedWardCode('');
          setEditDetailedAddress('');
        }}
        title="Chỉnh sửa Khách Hàng"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-5">
         

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Quận/Huyện <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phường/Xã <span className="text-red-500">*</span>
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
          </div>

          <Input
            label="Địa chỉ cụ thể (Số nhà, tên đường)"
            value={editDetailedAddress}
            onChange={(e) => setEditDetailedAddress(e.target.value)}
            placeholder="VD: 123 Đường ABC"
            required
          />

          

          <Input
            label="Họ và tên"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <Input
            label="CCCD/CMND"
            value={formData.identificationNumber}
            onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
            required
          />

          <div className="flex gap-4 pt-4 border-t border-slate-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedCustomer(null);
              }}
              className="flex-1"
              disabled={isUpdating}
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1" disabled={isUpdating}>
              {isUpdating ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCustomerId(null);
        }}
        title="Chi tiết Khách hàng"
        size="lg"
      >
        {customerDetails ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={18} className="text-blue-600" />
                  <p className="text-sm font-semibold text-blue-900">Họ và tên</p>
                </div>
                <p className="text-base font-medium text-slate-900">{customerDetails.fullName || 'N/A'}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={18} className="text-green-600" />
                  <p className="text-sm font-semibold text-green-900">CCCD/CMND</p>
                </div>
                <p className="text-base font-medium text-slate-900">{customerDetails.identificationNumber || 'N/A'}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={18} className="text-purple-600" />
                  <p className="text-sm font-semibold text-purple-900">Số điện thoại</p>
                </div>
                <p className="text-base font-medium text-slate-900">{customerDetails.phone || 'N/A'}</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <Mail size={18} className="text-orange-600" />
                  <p className="text-sm font-semibold text-orange-900">Email</p>
                </div>
                <p className="text-base font-medium text-slate-900 break-all">{customerDetails.email || 'N/A'}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-slate-600" />
                <p className="text-sm font-semibold text-slate-900">Địa chỉ</p>
              </div>
              <p className="text-base text-slate-900">{customerDetails.address || 'N/A'}</p>
            </div>

            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-indigo-600" />
                <p className="text-sm font-semibold text-indigo-900">Ngày tham gia</p>
              </div>
              <p className="text-base font-medium text-slate-900">
                {customerDetails.createdAt ? new Date(customerDetails.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-500">Đang tải thông tin...</div>
          </div>
        )}
      </Modal>

      {/* Customer Orders Modal */}
      <Modal
        isOpen={isOrdersModalOpen}
        onClose={() => {
          setIsOrdersModalOpen(false);
          setSelectedCustomerId(null);
        }}
        title="Đơn hàng của Khách hàng"
        size="2xl"
      >
        {isLoadingOrders ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-500">Đang tải đơn hàng...</div>
          </div>
        ) : customerOrders.length === 0 ? (
          <div className="p-12 text-center rounded-lg bg-slate-50 border-2 border-dashed border-slate-200">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-full bg-slate-100">
                <ShoppingCart size={32} className="text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Khách hàng chưa có đơn hàng nào</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {customerOrders.map((order) => (
              <div key={order.orderId} className="p-5 rounded-lg border-2 border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all">
                {/* Order Header */}
                <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-base font-bold text-slate-900">{order.orderCode}</h4>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-slate-400" />
                        <span>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}</span>
                      </div>
                      {order.contractCode && (
                        <div className="flex items-center gap-1.5">
                          <Package size={14} className="text-slate-400" />
                          <span>HĐ: {order.contractCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Tổng thanh toán</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(order.totalPayment)}</p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700">Chi tiết đơn hàng:</p>
                  {order.getOrderDetailsResponses && order.getOrderDetailsResponses.length > 0 ? (
                    <div className="space-y-2">
                      {order.getOrderDetailsResponses.map((detail) => (
                        <div key={detail.orderDetailId} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-slate-900">{detail.modelName}</p>
                              <p className="text-sm text-slate-600">Màu: {detail.colorName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-slate-600">SL: {detail.quantity}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-500">Đơn giá: </span>
                              <span className="font-medium">{formatCurrency(detail.unitPrice)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Tổng: </span>
                              <span className="font-medium">{formatCurrency(detail.totalPrice)}</span>
                            </div>
                            {detail.licensePlateFee > 0 && (
                              <div>
                                <span className="text-slate-500">Phí biển số: </span>
                                <span className="font-medium">{formatCurrency(detail.licensePlateFee)}</span>
                              </div>
                            )}
                            {detail.registrationFee > 0 && (
                              <div>
                                <span className="text-slate-500">Phí đăng ký: </span>
                                <span className="font-medium">{formatCurrency(detail.registrationFee)}</span>
                              </div>
                            )}
                            {detail.promotionName && (
                              <div className="col-span-2">
                                <span className="text-slate-500">Khuyến mãi: </span>
                                <span className="font-medium text-orange-600">
                                  {detail.promotionName} (-{formatCurrency(detail.discountAmount)})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Không có chi tiết</p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-slate-600">Tổng giá</p>
                      <p className="font-semibold text-blue-700">{formatCurrency(order.totalPrice)}</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <p className="text-xs text-slate-600">Thuế</p>
                      <p className="font-semibold text-purple-700">{formatCurrency(order.totalTaxPrice)}</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <p className="text-xs text-slate-600">Giảm giá</p>
                      <p className="font-semibold text-orange-700">{formatCurrency(order.totalPromotionAmount)}</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-slate-600">Thành tiền</p>
                      <p className="font-semibold text-green-700">{formatCurrency(order.totalPayment)}</p>
                    </div>
                  </div>
                </div>

                {/* Staff and Store Info */}
                {(order.staffName || order.storeName) && (
                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-4 text-xs text-slate-600">
                    {order.staffName && (
                      <div>
                        <span className="font-medium">NV: </span>
                        <span>{order.staffName}</span>
                      </div>
                    )}
                    {order.storeName && (
                      <div>
                        <span className="font-medium">Chi nhánh: </span>
                        <span>{order.storeName}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </DealerStaffLayout>
  );
};

export default CustomerManagementPage;
