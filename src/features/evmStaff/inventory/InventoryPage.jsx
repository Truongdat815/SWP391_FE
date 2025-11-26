import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Eye, Edit } from 'lucide-react';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Dropdown from '../../../components/ui/Dropdown';
import { useGetAllInventoryTransactionsQuery } from '../../../api/evmStaff/inventoryApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: transactionsData, isLoading, error } = useGetAllInventoryTransactionsQuery();
  const { data: modelsData } = useGetAllModelsQuery();

  const transactions = transactionsData?.data || [];
  const models = modelsData?.data || [];

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, modelFilter, locationFilter]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.inventoryId?.toString().includes(searchTerm.toLowerCase()) ||
        transaction.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      const matchesModel =
        modelFilter === 'all' || transaction.modelId?.toString() === modelFilter;
      const matchesLocation =
        locationFilter === 'all' || transaction.storeName?.toLowerCase().includes(locationFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesModel && matchesLocation;
    });
  }, [transactions, searchTerm, statusFilter, modelFilter, locationFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Chờ duyệt' },
      APPROVED: { variant: 'info', label: 'Đã duyệt' },
      REJECTED: { variant: 'error', label: 'Đã từ chối' },
      SHIPPING: { variant: 'info', label: 'Đang vận chuyển' },
      DELIVERED: { variant: 'success', label: 'Đã giao hàng' },
      PAID: { variant: 'success', label: 'Đã thanh toán' },
      CANCELLED: { variant: 'error', label: 'Đã hủy' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  const formatCurrency = (amount) => {
    if (!amount) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  if (isLoading) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </EVMStaffLayout>
    );
  }

  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = error?.status === 401;
  
  if (isUnauthorized) {
    return (
      <EVMStaffLayout>
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
      </EVMStaffLayout>
    );
  }

  if (error) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>
        </div>
      </EVMStaffLayout>
    );
  }

  return (
    <EVMStaffLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý giao dịch kho</h1>
            <p className="text-gray-600 mt-1">
              Quản lý và theo dõi tất cả các giao dịch nhập kho.
            </p>
          </div>
          <Button onClick={() => {}}>
            <Plus size={20} className="mr-2" />
            Thêm xe mới
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm theo Mã giao dịch, Mẫu xe, Cửa hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Trạng thái: Tất cả' },
                { value: 'PENDING', label: 'Chờ duyệt' },
                { value: 'APPROVED', label: 'Đã duyệt' },
                { value: 'REJECTED', label: 'Đã từ chối' },
                { value: 'SHIPPING', label: 'Đang vận chuyển' },
                { value: 'DELIVERED', label: 'Đã giao hàng' },
                { value: 'PAID', label: 'Đã thanh toán' },
                { value: 'CANCELLED', label: 'Đã hủy' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Dòng xe' },
                ...models.map((model) => ({
                  value: model.modelId?.toString(),
                  label: model.modelName || `Mẫu xe ${model.modelId}`,
                })),
              ]}
              value={modelFilter}
              onChange={setModelFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Cửa hàng: Tất cả' },
                ...Array.from(new Set(transactions.map(t => t.storeName).filter(Boolean))).map(storeName => ({
                  value: storeName,
                  label: storeName,
                })),
              ]}
              value={locationFilter}
              onChange={setLocationFilter}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {paginatedTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>MÃ GIAO DỊCH</Table.Head>
                      <Table.Head>MODEL</Table.Head>
                      <Table.Head>MÀU SẮC</Table.Head>
                      <Table.Head>SỐ LƯỢNG</Table.Head>
                      <Table.Head className="bg-blue-50 font-semibold text-blue-700">GIÁ BAN ĐẦU</Table.Head>
                      <Table.Head className="bg-orange-50 font-semibold text-orange-700">KHUYẾN MÃI</Table.Head>
                      <Table.Head className="bg-green-50 font-semibold text-green-700">TỔNG THANH TOÁN</Table.Head>
                      <Table.Head>CỬA HÀNG</Table.Head>
                      <Table.Head>NGÀY ĐẶT</Table.Head>
                      <Table.Head>TRẠNG THÁI</Table.Head>
                      <Table.Head className="text-center">HÀNH ĐỘNG</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedTransactions.map((transaction) => (
                      <Table.Row key={transaction.inventoryId}>
                        <Table.Cell className="font-mono text-sm">
                          #{transaction.inventoryId}
                        </Table.Cell>
                        <Table.Cell>{transaction.modelName || 'N/A'}</Table.Cell>
                        <Table.Cell>{transaction.colorName || 'N/A'}</Table.Cell>
                        <Table.Cell className="text-center">{transaction.importQuantity || 0}</Table.Cell>
                        <Table.Cell className="bg-blue-50 font-semibold text-blue-700">
                          {formatCurrency(transaction.totalBasePrice || 0)}
                        </Table.Cell>
                        <Table.Cell className="bg-orange-50">
                          <div className="flex flex-col gap-1">
                            {transaction.discountPercentage > 0 && (
                              <span className="font-semibold text-orange-700">
                                -{transaction.discountPercentage}%
                              </span>
                            )}
                            {transaction.discountAmount > 0 && (
                              <span className="text-sm text-orange-600">
                                -{formatCurrency(transaction.discountAmount)}
                              </span>
                            )}
                            {(!transaction.discountPercentage || transaction.discountPercentage === 0) && 
                             (!transaction.discountAmount || transaction.discountAmount === 0) && (
                              <span className="text-gray-400 text-sm">Không có</span>
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="bg-green-50 font-semibold text-green-700 text-lg">
                          {formatCurrency(transaction.totalPrice || 0)}
                        </Table.Cell>
                        <Table.Cell>{transaction.storeName || 'N/A'}</Table.Cell>
                        <Table.Cell>{formatDate(transaction.orderDate)}</Table.Cell>
                        <Table.Cell>{getStatusBadge(transaction.status)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                              <Eye size={16} />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                              <Edit size={16} />
                            </button>
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
                  Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredTransactions.length)}</span> trong{' '}
                  <span className="font-medium">{filteredTransactions.length}</span> kết quả
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
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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
                        return <span key={page} className="px-2 text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Tiếp
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </EVMStaffLayout>
  );
};

export default InventoryPage;

