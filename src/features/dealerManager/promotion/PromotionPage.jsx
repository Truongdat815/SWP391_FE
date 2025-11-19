import { useState, useMemo } from 'react';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
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

const PromotionPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation();
  const [deletePromotion] = useDeletePromotionMutation();

  const promotions = promotionsData?.data || [];
  const types = typesData?.data || [];

  // Filter promotions
  const filteredPromotions = useMemo(() => {
    return promotions.filter((promo) => {
      const matchesSearch =
        promo.promotionName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.promotionCode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && promo.isActive) ||
        (statusFilter === 'inactive' && !promo.isActive);
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
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isActive) {
      return <Badge variant="default">Đã kết thúc</Badge>;
    }
    if (now < start) {
      return <Badge variant="warning">Sắp diễn ra</Badge>;
    }
    if (now >= start && now <= end) {
      return <Badge variant="success">Đang hoạt động</Badge>;
    }
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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createPromotion(formData).unwrap();
      setIsCreateModalOpen(false);
      setFormData({
        promotionName: '',
        startDate: '',
        endDate: '',
        discountType: '',
        discountValue: '',
        modelId: null,
      });
    } catch (error) {
      alert('Có lỗi xảy ra khi tạo khuyến mãi');
      console.error(error);
    }
  };

  const handleEdit = (promo) => {
    setSelectedPromotion(promo);
    setFormData({
      promotionName: promo.promotionName || '',
      startDate: promo.startDate || '',
      endDate: promo.endDate || '',
      discountType: promo.discountType || '',
      discountValue: promo.discountValue || '',
      modelId: promo.modelId || null,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updatePromotion({ id: selectedPromotion.promotionId, ...formData }).unwrap();
      setIsEditModalOpen(false);
      setSelectedPromotion(null);
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật khuyến mãi');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      try {
        await deletePromotion(id).unwrap();
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa khuyến mãi');
        console.error(error);
      }
    }
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
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                              <Eye size={16} />
                            </button>
                            {promo.isActive && (
                              <>
                                <button
                                  onClick={() => handleEdit(promo)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(promo.promotionId)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
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
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            required
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
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
            required
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
    </DealerManagerLayout>
  );
};

export default PromotionPage;

