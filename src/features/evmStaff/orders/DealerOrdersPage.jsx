import { useState, useMemo } from 'react';
import { Search, Eye } from 'lucide-react';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Dropdown from '../../../components/ui/Dropdown';
import { useGetAllDealerOrdersQuery, useProcessDealerOrderMutation } from '../../../api/evmStaff/dealerOrdersApi';
import { useGetAllStoresQuery } from '../../../api/admin/storeApi';

const DealerOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('all');
  const [dealerFilter, setDealerFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const { data: ordersData, isLoading, error } = useGetAllDealerOrdersQuery();
  const { data: storesData } = useGetAllStoresQuery();
  const [processOrder] = useProcessDealerOrderMutation();

  const orders = ordersData?.data || [];
  const stores = storesData?.data || [];

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderId?.toString().includes(searchTerm) ||
        order.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesDealer =
        dealerFilter === 'all' || order.storeId?.toString() === dealerFilter;
      return matchesSearch && matchesStatus && matchesDealer;
    });
  }, [orders, searchTerm, statusFilter, dealerFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'PENDING', bg: 'bg-orange-100' },
      PROCESSING: { variant: 'info', label: 'PROCESSING', bg: 'bg-blue-100' },
      COMPLETED: { variant: 'success', label: 'COMPLETED', bg: 'bg-green-100' },
      REJECTED: { variant: 'error', label: 'REJECTED', bg: 'bg-red-100' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A', bg: 'bg-gray-100' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Đơn hàng Đại lý</h1>
          <p className="text-gray-600 mt-1">Xem và xử lý đơn hàng từ các đại lý</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm theo Mã đơn hàng, Tên đại lý..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Trạng thái: Tất cả' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'PROCESSING', label: 'Processing' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Khoảng thời gian' },
                { value: 'today', label: 'Hôm nay' },
                { value: 'week', label: 'Tuần này' },
                { value: 'month', label: 'Tháng này' },
              ]}
              value={timeRangeFilter}
              onChange={setTimeRangeFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Đại lý' },
                ...stores.map((store) => ({
                  value: store.storeId?.toString(),
                  label: store.storeName || `Store ${store.storeId}`,
                })),
              ]}
              value={dealerFilter}
              onChange={setDealerFilter}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {paginatedOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head className="w-12">
                        <input type="checkbox" className="rounded" />
                      </Table.Head>
                      <Table.Head>MÃ ĐƠN HÀNG</Table.Head>
                      <Table.Head>TÊN ĐẠI LÝ</Table.Head>
                      <Table.Head>NGÀY ĐẶT</Table.Head>
                      <Table.Head>TỔNG GIÁ TRỊ</Table.Head>
                      <Table.Head>TRẠNG THÁI</Table.Head>
                      <Table.Head className="text-center">HÀNH ĐỘNG</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedOrders.map((order) => (
                      <Table.Row key={order.orderId}>
                        <Table.Cell>
                          <input type="checkbox" className="rounded" />
                        </Table.Cell>
                        <Table.Cell className="font-mono">#{order.orderId || `EDH-${order.orderId}`}</Table.Cell>
                        <Table.Cell>{order.storeName || 'N/A'}</Table.Cell>
                        <Table.Cell>{formatDate(order.createdAt || order.orderDate)}</Table.Cell>
                        <Table.Cell className="font-medium">
                          {formatCurrency(order.totalAmount || order.totalPrice)}
                        </Table.Cell>
                        <Table.Cell>{getStatusBadge(order.status)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center">
                            <button className="text-blue-600 hover:text-blue-800 font-medium">
                              Xem chi tiết
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
                  Hiển thị {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of{' '}
                  {filteredOrders.length} kết quả
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  {totalPages > 3 && <span className="px-2">...</span>}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
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

export default DealerOrdersPage;

