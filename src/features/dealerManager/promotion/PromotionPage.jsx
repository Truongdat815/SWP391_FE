import { useState, useMemo } from 'react';
import { Search, Plus, Eye, Edit, Trash2, AlertCircle } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Dropdown from '../../../components/ui/Dropdown';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import {
  useGetAllPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useGetPromotionTypesQuery,
} from '../../../api/dealerManager/promotionApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';

const PromotionPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({ 
    isOpen: false, 
    message: '', 
    onConfirm: null 
  });
  const [formData, setFormData] = useState({
    promotionName: '',
    startDate: '',
    endDate: '',
    discountType: '',
    discountValue: '',
    modelId: null,
  });

  const { data: promotionsData, isLoading, error } = useGetAllPromotionsQuery();
  const { data: typesData } = useGetPromotionTypesQuery();
  const { data: modelsData } = useGetAllModelsQuery();
  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation();
  const [deletePromotion] = useDeletePromotionMutation();

  const promotions = promotionsData?.data || [];
  const types = typesData?.data || [];
  const models = modelsData?.data || [];

  // Helper function to check if promotion is actually active based on dates
  const isPromotionActive = (promo) => {
    if (!promo.startDate || !promo.endDate) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(promo.startDate);
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const end = new Date(promo.endDate);
    const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);
    return today >= startDateOnly && today <= endDateOnly;
  };

  // Filter promotions
  const filteredPromotions = useMemo(() => {
    return promotions.filter((promo) => {
      const matchesSearch =
        promo.promotionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.promotionCode?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Tính trạng thái thực tế dựa trên ngày tháng
      const actuallyActive = isPromotionActive(promo);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && actuallyActive) ||
        (statusFilter === 'inactive' && !actuallyActive);
      
      const matchesType = typeFilter === 'all' || promo.promotionType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [promotions, searchTerm, statusFilter, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPromotions = filteredPromotions.slice(startIndex, endIndex);

  const getStatusBadge = (isActive, startDate, endDate) => {
    if (!startDate || !endDate) {
      return <Badge variant="default">N/A</Badge>;
    }

    const now = new Date();
    // Chỉ lấy phần ngày, bỏ qua giờ để so sánh chính xác
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(startDate);
    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    
    const end = new Date(endDate);
    // Set endDate thành cuối ngày (23:59:59) để đảm bảo cả ngày cuối cùng vẫn còn hiệu lực
    const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);

    // Ưu tiên kiểm tra ngày tháng trước, không phụ thuộc vào isActive từ backend
    if (today < startDateOnly) {
      return <Badge variant="warning">Sắp diễn ra</Badge>;
    }
    if (today >= startDateOnly && today <= endDateOnly) {
      return <Badge variant="success">Đang hoạt động</Badge>;
    }
    // Nếu đã qua ngày kết thúc
    return <Badge variant="default">Đã kết thúc</Badge>;
  };

  const formatDiscount = (promo) => {
    if (promo.discountType === 'PERCENTAGE') {
      return `Giảm ${promo.discountValue}%`;
    } else if (promo.discountType === 'FIXED_AMOUNT') {
      return `Giảm ${new Intl.NumberFormat('vi-VN').format(promo.discountValue)} VNĐ`;
    } else if (promo.promotionType === 'GIFT') {
      return 'Tặng phụ kiện';
    }
    return promo.description || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  // Format date for input type="date" (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.discountType) {
      setErrorModal({ isOpen: true, message: 'Vui lòng chọn loại giảm giá' });
      return;
    }
    
    const discountValue = parseFloat(formData.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      setErrorModal({ isOpen: true, message: 'Giá trị giảm giá phải lớn hơn 0' });
      return;
    }
    
    if (formData.discountType === 'PERCENTAGE' && discountValue > 100) {
      setErrorModal({ isOpen: true, message: 'Phần trăm giảm giá không được vượt quá 100%' });
      return;
    }
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setErrorModal({ isOpen: true, message: 'Ngày kết thúc phải sau ngày bắt đầu' });
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        discountValue: discountValue,
        modelId: formData.modelId || null,
      };
      await createPromotion(submitData).unwrap();
      setIsCreateModalOpen(false);
      setFormData({
        promotionName: '',
        startDate: '',
        endDate: '',
        discountType: '',
        discountValue: '',
        modelId: null,
      });
      setSuccessModal({ isOpen: true, message: 'Tạo khuyến mãi thành công!' });
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi tạo khuyến mãi';
      setErrorModal({ isOpen: true, message: errorMessage });
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleEdit = (promo) => {
    setSelectedPromotion(promo);
    setFormData({
      promotionName: promo.promotionName || '',
      startDate: formatDateForInput(promo.startDate) || '',
      endDate: formatDateForInput(promo.endDate) || '',
      discountType: promo.discountType || '',
      discountValue: promo.discountValue?.toString() || '',
      modelId: promo.modelId || null,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPromotion) return;
    
    // Validation
    if (!formData.discountType) {
      setErrorModal({ isOpen: true, message: 'Vui lòng chọn loại giảm giá' });
      return;
    }
    
    const discountValue = parseFloat(formData.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      setErrorModal({ isOpen: true, message: 'Giá trị giảm giá phải lớn hơn 0' });
      return;
    }
    
    if (formData.discountType === 'PERCENTAGE' && discountValue > 100) {
      setErrorModal({ isOpen: true, message: 'Phần trăm giảm giá không được vượt quá 100%' });
      return;
    }
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setErrorModal({ isOpen: true, message: 'Ngày kết thúc phải sau ngày bắt đầu' });
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        discountValue: discountValue,
        modelId: formData.modelId || null,
      };
      await updatePromotion({ id: selectedPromotion.promotionId, ...submitData }).unwrap();
      setIsEditModalOpen(false);
      setSelectedPromotion(null);
      setSuccessModal({ isOpen: true, message: 'Cập nhật khuyến mãi thành công!' });
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi cập nhật khuyến mãi';
      setErrorModal({ isOpen: true, message: errorMessage });
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn xóa khuyến mãi này?',
      onConfirm: async () => {
        try {
          await deletePromotion(id).unwrap();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          setSuccessModal({ isOpen: true, message: 'Xóa khuyến mãi thành công!' });
        } catch (error) {
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi xóa khuyến mãi';
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          setErrorModal({ isOpen: true, message: errorMessage });
          if (import.meta.env.DEV) {
            console.error(error);
          }
        }
      },
    });
  };

  const handleViewDetails = (promo) => {
    setSelectedPromotion(promo);
    setIsDetailModalOpen(true);
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

  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = error?.status === 401;
  
  if (isUnauthorized) {
    return (
      <DealerManagerLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-yellow-600 text-lg font-medium">
            ⚠️ Bạn chưa đăng nhập hoặc token đã hết hạn
          </div>
          <div className="text-gray-600 text-sm">
            Vui lòng đăng nhập để truy cập các tính năng này.
          </div>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đi đến trang đăng nhập
          </a>
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

  return (
    <DealerManagerLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Chương trình Khuyến mãi</h1>
            <p className="text-gray-600 mt-1">
              Xem, tạo và quản lý các chương trình khuyến mãi tại đại lý.
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} className="mr-2" />
            Tạo Khuyến mãi Mới
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm theo tên hoặc mã..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Lọc theo trạng thái' },
                { value: 'active', label: 'Đang hoạt động' },
                { value: 'inactive', label: 'Đã kết thúc' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Loại khuyến mãi' },
                ...types.map((type) => ({ value: type, label: type })),
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {paginatedPromotions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Tên chương trình</Table.Head>
                      <Table.Head>Thời gian áp dụng</Table.Head>
                      <Table.Head>Mức giảm giá/Ưu đãi</Table.Head>
                      <Table.Head>Trạng thái</Table.Head>
                      <Table.Head className="text-center">Hành động</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedPromotions.map((promo) => (
                      <Table.Row key={promo.promotionId}>
                        <Table.Cell className="font-medium">
                          {promo.promotionName || 'N/A'}
                        </Table.Cell>
                        <Table.Cell>
                          {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                        </Table.Cell>
                        <Table.Cell>{formatDiscount(promo)}</Table.Cell>
                        <Table.Cell>
                          {getStatusBadge(promo.isActive, promo.startDate, promo.endDate)}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetails(promo)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            {isPromotionActive(promo) && (
                              <>
                                <button
                                  onClick={() => handleEdit(promo)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(promo.promotionId)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredPromotions.length)} của{' '}
                  {filteredPromotions.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => {
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
                          onClick={() => setCurrentPage(page)}
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
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo Khuyến mãi Mới"
        size="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Tên chương trình"
            value={formData.promotionName}
            onChange={(e) => setFormData({ ...formData, promotionName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
            <Dropdown
              options={[
                { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
                { value: 'FIXED_AMOUNT', label: 'Số tiền cố định' },
              ]}
              value={formData.discountType}
              onChange={(value) => setFormData({ ...formData, discountType: value })}
              placeholder="Chọn loại giảm giá"
            />
          </div>
          <Input
            label="Giá trị giảm giá"
            type="number"
            min={formData.discountType === 'PERCENTAGE' ? '0' : '0'}
            max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
            step={formData.discountType === 'PERCENTAGE' ? '0.01' : '1'}
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            required
            placeholder={formData.discountType === 'PERCENTAGE' ? 'Nhập % (0-100)' : 'Nhập số tiền'}
          />
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
              {isCreating ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPromotion(null);
        }}
        title="Chỉnh sửa Khuyến mãi"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Tên chương trình"
            value={formData.promotionName}
            onChange={(e) => setFormData({ ...formData, promotionName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá</label>
            <Dropdown
              options={[
                { value: 'PERCENTAGE', label: 'Phần trăm (%)' },
                { value: 'FIXED_AMOUNT', label: 'Số tiền cố định' },
              ]}
              value={formData.discountType}
              onChange={(value) => setFormData({ ...formData, discountType: value })}
              placeholder="Chọn loại giảm giá"
            />
          </div>
          <Input
            label="Giá trị giảm giá"
            type="number"
            min={formData.discountType === 'PERCENTAGE' ? '0' : '0'}
            max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
            step={formData.discountType === 'PERCENTAGE' ? '0.01' : '1'}
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            required
            placeholder={formData.discountType === 'PERCENTAGE' ? 'Nhập % (0-100)' : 'Nhập số tiền'}
          />
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedPromotion(null);
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
          setSelectedPromotion(null);
        }}
        title="Chi tiết Khuyến mãi"
        size="lg"
      >
        {selectedPromotion ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tên chương trình</label>
                <p className="text-lg font-semibold mt-1">{selectedPromotion.promotionName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mã khuyến mãi</label>
                <p className="text-lg font-mono mt-1">{selectedPromotion.promotionCode || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày bắt đầu</label>
                <p className="text-lg mt-1">{formatDate(selectedPromotion.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày kết thúc</label>
                <p className="text-lg mt-1">{formatDate(selectedPromotion.endDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Loại giảm giá</label>
                <p className="text-lg mt-1">
                  {selectedPromotion.discountType === 'PERCENTAGE' ? 'Phần trăm (%)' : 
                   selectedPromotion.discountType === 'FIXED_AMOUNT' ? 'Số tiền cố định' : 
                   selectedPromotion.promotionType || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Giá trị giảm giá</label>
                <p className="text-lg font-semibold text-blue-600 mt-1">
                  {formatDiscount(selectedPromotion)}
                </p>
              </div>
              {selectedPromotion.modelId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Áp dụng cho mẫu xe</label>
                  <p className="text-lg mt-1">
                    {models.find(m => m.modelId === selectedPromotion.modelId)?.modelName || 
                     `Model ID: ${selectedPromotion.modelId}`}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <div className="mt-1">
                  {getStatusBadge(selectedPromotion.isActive, selectedPromotion.startDate, selectedPromotion.endDate)}
                </div>
              </div>
            </div>
            
            {selectedPromotion.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                <p className="text-base mt-1 text-gray-700">{selectedPromotion.description}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedPromotion(null);
                }}
                className="flex-1"
              >
                Đóng
              </Button>
              {isPromotionActive(selectedPromotion) && (
                <Button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleEdit(selectedPromotion);
                  }}
                  className="flex-1"
                >
                  <Edit size={18} className="mr-2" />
                  Chỉnh sửa
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Không có dữ liệu</div>
          </div>
        )}
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Lỗi"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700">{errorModal.message}</p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setErrorModal({ isOpen: false, message: '' })}
              variant="outline"
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
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700">{successModal.message}</p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setSuccessModal({ isOpen: false, message: '' })}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
        title="Xác nhận"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700">{confirmModal.message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
              variant="outline"
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (confirmModal.onConfirm) {
                  confirmModal.onConfirm();
                }
              }}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </DealerManagerLayout>
  );
};

export default PromotionPage;

