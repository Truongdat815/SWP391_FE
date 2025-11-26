import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Edit, MapPin, Phone, Mail, Users, Eye, ShoppingCart, Calendar, CreditCard, Package } from 'lucide-react';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import Badge from '../../../components/ui/Badge';
import { useToast } from '../../../components/ui/Toast';
import {
  useGetAllCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useGetCustomerByIdQuery,
} from '../../../api/dealerStaff/customerApi';
import { useGetOrdersByCustomerQuery } from '../../../api/dealerStaff/orderApi';
import { addressKitApi } from '../../../api/public/addressKitApi';
import { getOrderStatusConfig } from '../../../utils/formatters';

const CustomerManagementPage = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Address dropdown states for create modal (2-level: Province -> Commune)
  const [provinces, setProvinces] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCommuneCode, setSelectedCommuneCode] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [communeSearchTerm, setCommuneSearchTerm] = useState('');

  // Address dropdown states for edit modal
  const [editCommunes, setEditCommunes] = useState([]);
  const [editSelectedProvinceCode, setEditSelectedProvinceCode] = useState('');
  const [editSelectedCommuneCode, setEditSelectedCommuneCode] = useState('');
  const [editDetailedAddress, setEditDetailedAddress] = useState('');
  const [editCommuneSearchTerm, setEditCommuneSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    identificationNumber: '',
  });

  const { data: customersData, isLoading, error, refetch: refetchCustomers } = useGetAllCustomersQuery();
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
        const data = await addressKitApi.getAllProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Error loading provinces:', error);
      }
    };
    loadProvinces();
  }, []);

  // Load communes when province is selected (create modal)
  useEffect(() => {
    const loadCommunes = async () => {
      if (selectedProvinceCode) {
        try {
          const data = await addressKitApi.getCommunesByProvince(selectedProvinceCode);
          setCommunes(data || []);
          setSelectedCommuneCode('');
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

  // Load communes when province is selected (edit modal)
  useEffect(() => {
    const loadEditCommunes = async () => {
      if (editSelectedProvinceCode) {
        try {
          const data = await addressKitApi.getCommunesByProvince(editSelectedProvinceCode);
          setEditCommunes(data || []);
          // Only reset if this is a user selection, not initial load
          if (editSelectedCommuneCode && !data?.find(c => c.code === editSelectedCommuneCode)) {
            setEditSelectedCommuneCode('');
          }
          setEditCommuneSearchTerm('');
        } catch (error) {
          console.error('Error loading edit communes:', error);
        }
      } else {
        setEditCommunes([]);
        setEditSelectedCommuneCode('');
        setEditCommuneSearchTerm('');
      }
    };
    loadEditCommunes();
  }, [editSelectedProvinceCode]);

  // Update address when selections change (create modal) - 2-level format
  useEffect(() => {
    const selectedProvince = provinces.find(p => p.code === selectedProvinceCode);
    const selectedCommune = communes.find(c => c.code === selectedCommuneCode);

    const addressParts = [];
    if (selectedCommune) addressParts.push(selectedCommune.name);
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

    setFormData(prev => ({
      ...prev,
      address: fullAddress,
    }));
  }, [selectedProvinceCode, selectedCommuneCode, detailedAddress, provinces, communes]);

  // Update edit address when selections change (edit modal) - 2-level format
  useEffect(() => {
    const selectedProvince = provinces.find(p => p.code === editSelectedProvinceCode);
    const selectedCommune = editCommunes.find(c => c.code === editSelectedCommuneCode);

    const addressParts = [];
    if (selectedCommune) addressParts.push(selectedCommune.name);
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

    setFormData(prev => ({
      ...prev,
      address: fullAddress,
    }));
  }, [editSelectedProvinceCode, editSelectedCommuneCode, editDetailedAddress, provinces, editCommunes]);

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

  // Filter communes based on search term (create modal)
  const filteredCommunes = useMemo(() => {
    if (!communeSearchTerm.trim()) return communes;
    return communes.filter(commune =>
      commune.name.toLowerCase().includes(communeSearchTerm.toLowerCase())
    );
  }, [communes, communeSearchTerm]);

  // Filter communes based on search term (edit modal)
  const filteredEditCommunes = useMemo(() => {
    if (!editCommuneSearchTerm.trim()) return editCommunes;
    return editCommunes.filter(commune =>
      commune.name.toLowerCase().includes(editCommuneSearchTerm.toLowerCase())
    );
  }, [editCommunes, editCommuneSearchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await createCustomer(formData).unwrap();
      await refetchCustomers();
      toast.success(response?.message || 'Tạo khách hàng thành công');
      setIsCreateModalOpen(false);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        identificationNumber: '',
      });
      setSelectedProvinceCode('');
      setSelectedCommuneCode('');
      setDetailedAddress('');
      setCommuneSearchTerm('');
    } catch (error) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo khách hàng');
    }
  };

  const handleEdit = async (customer) => {
    setSelectedCustomer(customer);

    // Parse existing address to populate dropdowns if possible
    const existingAddress = customer.address || '';

    // Try to parse address components
    // New format: "Detailed Address, Commune, Province"
    // Old format (backward compat): "Detailed Address, Ward, District, Province"
    const addressParts = existingAddress.split(', ');

    // Reset dropdown states first
    setEditSelectedProvinceCode('');
    setEditSelectedCommuneCode('');
    setEditDetailedAddress('');
    setEditCommunes([]);
    setEditCommuneSearchTerm('');

    // If we have address parts, try to match them
    if (addressParts.length >= 2) {
      const detailedAddr = addressParts[0] || '';
      let communeName = '';
      let provinceName = '';

      // Check if it's new format (3 parts) or old format (4 parts)
      if (addressParts.length === 3) {
        // New format: [Detailed, Commune, Province]
        communeName = addressParts[1] || '';
        provinceName = addressParts[2] || '';
      } else if (addressParts.length >= 4) {
        // Old format: [Detailed, Ward, District, Province] - skip district
        communeName = addressParts[1] || ''; // Take ward as commune
        provinceName = addressParts[3] || '';
      }

      setEditDetailedAddress(detailedAddr);

      // Try to find matching province
      if (provinceName && provinces.length > 0) {
        const matchingProvince = provinces.find(p =>
          p.name.toLowerCase().includes(provinceName.toLowerCase()) ||
          provinceName.toLowerCase().includes(p.name.toLowerCase())
        );

        if (matchingProvince) {
          setEditSelectedProvinceCode(matchingProvince.code);

          // Load communes for this province
          try {
            const communesData = await addressKitApi.getCommunesByProvince(matchingProvince.code);
            setEditCommunes(communesData || []);

            // Try to find matching commune
            if (communeName) {
              const matchingCommune = (communesData || []).find(c =>
                c.name.toLowerCase().includes(communeName.toLowerCase()) ||
                communeName.toLowerCase().includes(c.name.toLowerCase())
              );

              if (matchingCommune) {
                setEditSelectedCommuneCode(matchingCommune.code);
              }
            }
          } catch (error) {
            console.error('Error loading communes for edit:', error);
          }
        }
      }
    } else {
      // If can't parse, just set the whole address as detailed address
      setEditDetailedAddress(existingAddress);
    }

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
      await refetchCustomers();
      toast.success('Cập nhật khách hàng thành công');
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      setEditSelectedProvinceCode('');
      setEditSelectedCommuneCode('');
      setEditDetailedAddress('');
      setEditCommuneSearchTerm('');
    } catch (error) {
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi cập nhật khách hàng');
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
    const statusConfig = getOrderStatusConfig(status);

    const getVariantFromColor = (colorClass) => {
      if (colorClass.includes('green')) return 'success';
      if (colorClass.includes('blue')) return 'info';
      if (colorClass.includes('yellow') || colorClass.includes('amber') || colorClass.includes('orange')) return 'warning';
      if (colorClass.includes('red')) return 'error';
      if (colorClass.includes('purple') || colorClass.includes('indigo')) return 'info';
      return 'default';
    };

    const variant = getVariantFromColor(statusConfig.color);

    return <Badge variant={variant}>{statusConfig.label}</Badge>;
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
          setSelectedCommuneCode('');
          setDetailedAddress('');
          setCommuneSearchTerm('');
        }}
        title="Thêm Khách Hàng Mới"
        size="xl"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          {/* 2-Level Address: Province and Commune only */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phường/Xã/Thị trấn <span className="text-red-500">*</span>
              </label>
              <Dropdown
                options={communes.map((commune) => ({
                  value: commune.code,
                  label: commune.name,
                }))}
                value={selectedCommuneCode}
                onChange={(value) => setSelectedCommuneCode(value)}
                placeholder="Chọn phường/xã/thị trấn"
                disabled={!selectedProvinceCode || communes.length === 0}
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

          {/* Auto-generated full address display */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Địa chỉ đầy đủ (Tự động tạo)
            </label>
            <div className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm min-h-[42px] flex items-center">
              {formData.address || 'Địa chỉ sẽ được tạo tự động khi bạn chọn tỉnh/thành phố và phường/xã'}
            </div>
          </div>

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
          setEditSelectedCommuneCode('');
          setEditDetailedAddress('');
          setEditCommuneSearchTerm('');
        }}
        title="Chỉnh sửa Khách Hàng"
        size="xl"
      >
        <form onSubmit={handleUpdate} className="space-y-5">
          {/* 2-Level Address: Province and Commune only */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phường/Xã/Thị trấn <span className="text-red-500">*</span>
              </label>
              {/* Commune search input */}
              {editSelectedProvinceCode && editCommunes.length > 0 && (
                <input
                  className="w-full px-3 py-2 mb-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                  placeholder="Tìm kiếm phường/xã..."
                  value={editCommuneSearchTerm}
                  onChange={(e) => setEditCommuneSearchTerm(e.target.value)}
                />
              )}
              <Dropdown
                options={filteredEditCommunes.map((commune) => ({
                  value: commune.code,
                  label: commune.name,
                }))}
                value={editSelectedCommuneCode}
                onChange={(value) => setEditSelectedCommuneCode(value)}
                placeholder="Chọn phường/xã/thị trấn"
                disabled={!editSelectedProvinceCode || editCommunes.length === 0}
              />
              {editSelectedProvinceCode && editCommunes.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {filteredEditCommunes.length} / {editCommunes.length} kết quả
                </p>
              )}
            </div>
          </div>

          <Input
            label="Địa chỉ cụ thể (Số nhà, tên đường)"
            value={editDetailedAddress}
            onChange={(e) => setEditDetailedAddress(e.target.value)}
            placeholder="VD: 123 Đường ABC"
            required
          />

          {/* Auto-generated full address display for edit */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Địa chỉ đầy đủ (Tự động tạo)
            </label>
            <div className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 text-sm min-h-[42px] flex items-center">
              {formData.address || 'Địa chỉ sẽ được tạo tự động khi bạn chọn tỉnh/thành phố và phường/xã'}
            </div>
          </div>

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

      {/* Customer Details Modal - Keeping original implementation */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCustomerId(null);
        }}
        title="Chi tiết Khách Hàng"
        size="2xl"
      >
        {customerDetails ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
                <p className="text-slate-900 font-medium">{customerDetails.fullName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">CCCD/CMND</label>
                <p className="text-slate-900">{customerDetails.identificationNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại</label>
                <p className="text-slate-900">{customerDetails.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <p className="text-slate-900">{customerDetails.email || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Địa chỉ</label>
                <p className="text-slate-900">{customerDetails.address || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ngày tham gia</label>
                <p className="text-slate-900">
                  {customerDetails.createdAt
                    ? new Date(customerDetails.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-500">Đang tải...</div>
          </div>
        )}
      </Modal>

      {/* Customer Orders Modal - Getting original implementation */}
      <Modal
        isOpen={isOrdersModalOpen}
        onClose={() => {
          setIsOrdersModalOpen(false);
          setSelectedCustomerId(null);
        }}
        title="Đơn Hàng Của Khách Hàng"
        size="4xl"
      >
        {isLoadingOrders ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-500">Đang tải...</div>
          </div>
        ) : customerOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="p-3 rounded-full bg-slate-100 mb-3">
              <Package size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500">Khách hàng chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {customerOrders.map((order) => (
              <div
                key={order.orderId}
                className="p-4 border border-slate-200 rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <ShoppingCart size={20} className="text-primary" />
                    <div>
                      <p className="font-medium text-slate-900">{order.orderCode || `#${order.orderId}`}</p>
                      <p className="text-sm text-slate-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Tổng tiền:</span>
                    <span className="ml-2 font-medium text-slate-900">{formatCurrency(order.totalAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Cửa hàng:</span>
                    <span className="ml-2 text-slate-900">{order.storeName || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </DealerStaffLayout>
  );
};

export default CustomerManagementPage;
