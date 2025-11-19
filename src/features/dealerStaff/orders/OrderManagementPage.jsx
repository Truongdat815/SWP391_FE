import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Eye, Edit, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useGetAllOrdersQuery } from '../../../api/dealerStaff/orderApi';

const OrderManagementPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [openMenuId, setOpenMenuId] = useState(null);

  const { data: ordersData, isLoading, error } = useGetAllOrdersQuery();

  const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((order) => {
      const matchesSearch =
        order.orderId?.toString().includes(searchTerm) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [orders, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Chờ duyệt', dot: 'yellow' },
      CONFIRMED: { variant: 'info', label: 'Đã duyệt', dot: 'blue' },
      DELIVERED: { variant: 'success', label: 'Hoàn thành', dot: 'green' },
      CANCELLED: { variant: 'error', label: 'Đã huỷ', dot: 'red' },
      DRAFT: { variant: 'default', label: 'Nháp', dot: 'gray' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A', dot: 'gray' };
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full bg-${config.dot}-500`} />
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
    );
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
    <DealerStaffLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Đơn hàng</h1>
          <p className="text-gray-600 mt-1">
            Xem, tìm kiếm và quản lý tất cả đơn hàng trong hệ thống.
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter size={20} className="mr-2" />
              Lọc
            </Button>
            <Button onClick={() => navigate('/dealer-staff/orders/create')}>
              <Plus size={20} className="mr-2" />
              Tạo đơn hàng mới
            </Button>
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
                      <Table.Head>MÃ ĐƠN</Table.Head>
                      <Table.Head>KHÁCH HÀNG</Table.Head>
                      <Table.Head>MẪU XE</Table.Head>
                      <Table.Head>TRẠNG THÁI</Table.Head>
                      <Table.Head>NGÀY TẠO</Table.Head>
                      <Table.Head>TỔNG GIÁ TRỊ</Table.Head>
                      <Table.Head className="text-center">HÀNH ĐỘNG</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedOrders.map((order) => (
                      <Table.Row key={order.orderId}>
                        <Table.Cell className="font-mono">#{order.orderId || `VF${order.orderId}`}</Table.Cell>
                        <Table.Cell>{order.customerName || 'N/A'}</Table.Cell>
                        <Table.Cell>{order.modelName || 'N/A'}</Table.Cell>
                        <Table.Cell>{getStatusBadge(order.status)}</Table.Cell>
                        <Table.Cell>{formatDate(order.createdAt || order.orderDate)}</Table.Cell>
                        <Table.Cell className="font-medium">
                          {formatCurrency(order.totalAmount || order.totalPrice)}
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                              <Eye size={16} />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                              <Edit size={16} />
                            </button>
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === order.orderId ? null : order.orderId)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              >
                                <MoreVertical size={16} />
                              </button>
                              {openMenuId === order.orderId && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
                                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                                    Xem chi tiết
                                  </button>
                                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                                    In đơn hàng
                                  </button>
                                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">
                                    Hủy đơn
                                  </button>
                                </div>
                              )}
                            </div>
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
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} trên{' '}
                  {filteredOrders.length}
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
                    Sau
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </DealerStaffLayout>
  );
};

export default OrderManagementPage;

