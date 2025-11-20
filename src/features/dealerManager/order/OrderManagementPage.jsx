import { useState, useMemo } from 'react';
import { Search, Download, Plus, Eye, Printer, Check, X, MoreVertical } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import SearchBar from '../../../components/shared/SearchBar';
import MetricCard from '../../../components/shared/MetricCard';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Dropdown from '../../../components/ui/Dropdown';
import Modal from '../../../components/ui/Modal';
import { useGetAllOrdersQuery, useGetMonthlyRevenueQuery, useGetOrderByIdQuery } from '../../../api/dealerManager/dmOrderApi';

const OrderManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data: ordersData, isLoading, error } = useGetAllOrdersQuery();
  const { data: revenueData } = useGetMonthlyRevenueQuery();
  const { data: orderDetailData, isLoading: isLoadingOrderDetail } = useGetOrderByIdQuery(selectedOrderId, {
    skip: !selectedOrderId,
  });

  const orders = ordersData?.data || [];
  const monthlyRevenue = revenueData?.data || [];

  // Tính toán metrics
  const currentMonthRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const revenue = monthlyRevenue.find(
      (rev) => rev.month === currentMonth && rev.year === currentYear
    );
    return revenue?.totalRevenue || 0;
  }, [monthlyRevenue]);

  const pendingOrders = orders.filter(
    (order) => order.status === 'PENDING' || order.status === 'DRAFT'
  ).length;
  const totalOrdersThisMonth = orders.filter((order) => {
    const orderDate = new Date(order.createdAt || order.orderDate);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }).length;
  const deliveringCars = orders.filter((order) => order.status === 'DELIVERING').length;

  // Filter và sắp xếp orders (mới nhất ở trên)
  const filteredOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch =
        order.orderId?.toString().includes(searchTerm) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesModel =
        modelFilter === 'all' || order.modelName?.toLowerCase().includes(modelFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesModel;
    });
    
    // Sắp xếp theo ngày tạo: mới nhất ở trên
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.orderDate || a.createdDate || 0);
      const dateB = new Date(b.createdAt || b.orderDate || b.createdDate || 0);
      // Sắp xếp giảm dần (mới nhất trước)
      return dateB.getTime() - dateA.getTime();
    });
  }, [orders, searchTerm, statusFilter, modelFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Chờ duyệt' },
      CONFIRMED: { variant: 'info', label: 'Đã xác nhận' },
      DELIVERING: { variant: 'info', label: 'Đang giao' },
      DELIVERED: { variant: 'success', label: 'Hoàn thành' },
      FULLY_PAID: { variant: 'success', label: 'Đã thanh toán' },
      CONTRACT_SIGNED: { variant: 'info', label: 'Đã ký hợp đồng' },
      CANCELLED: { variant: 'error', label: 'Đã hủy' },
      DRAFT: { variant: 'default', label: 'Nháp' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
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

  const formatRevenue = (amount) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} Tỷ`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} Triệu`;
    }
    return formatCurrency(amount);
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailModalOpen(true);
    setOpenMenuId(null);
  };

  const handlePrintOrder = (order) => {
    setOpenMenuId(null);
    // Tạo nội dung hóa đơn để in
    const printWindow = window.open('', '_blank');
    const orderDetails = order.getOrderDetailsResponses || order.orderDetails || [];
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn #${order.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            .info-row { margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HÓA ĐƠN BÁN HÀNG</h1>
            <p>Mã đơn hàng: #${order.orderId}</p>
          </div>
          <div class="info">
            <div class="info-row"><strong>Khách hàng:</strong> ${order.customerName || 'N/A'}</div>
            <div class="info-row"><strong>Nhân viên:</strong> ${order.staffName || order.createdBy || 'N/A'}</div>
            <div class="info-row"><strong>Ngày tạo:</strong> ${formatDate(order.createdAt || order.orderDate)}</div>
            <div class="info-row"><strong>Trạng thái:</strong> ${getStatusBadge(order.status).props.children}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Mẫu xe</th>
                <th>Màu sắc</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.map(detail => `
                <tr>
                  <td>${detail.modelName || order.modelName || 'N/A'}</td>
                  <td>${detail.colorName || 'N/A'}</td>
                  <td>${detail.quantity || 1}</td>
                  <td>${formatCurrency(detail.price || detail.unitPrice || 0)}</td>
                  <td>${formatCurrency((detail.price || detail.unitPrice || 0) * (detail.quantity || 1))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Tổng cộng: ${formatCurrency(order.totalAmount || order.totalPrice || 0)}</p>
          </div>
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">In hóa đơn</button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">Đóng</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
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
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
            <p className="text-gray-600 mt-1">
              Xem, duyệt và theo dõi tất cả đơn hàng từ đội ngũ của bạn.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Download size={20} className="mr-2" />
              Xuất Báo Cáo
            </Button>
            <Button>
              <Plus size={20} className="mr-2" />
              Tạo Đơn Hàng Mới
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Tổng Doanh Thu (Tháng)"
            value={formatRevenue(currentMonthRevenue)}
            change="+15.2%"
            changeType="positive"
          />
          <MetricCard
            title="Đơn Hàng Chờ Duyệt"
            value={pendingOrders}
            change="+3 so với hôm qua"
            changeType="positive"
          />
          <MetricCard
            title="Tổng Số Đơn Hàng (Tháng)"
            value={totalOrdersThisMonth}
            change="+8.5%"
            changeType="positive"
          />
          <MetricCard
            title="Xe Sắp Giao"
            value={deliveringCars}
            change="+2 trong tuần này"
            changeType="positive"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm theo Mã đơn, Tên khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Trạng thái: Tất cả' },
                { value: 'PENDING', label: 'Chờ duyệt' },
                { value: 'CONFIRMED', label: 'Đã xác nhận' },
                { value: 'DELIVERING', label: 'Đang giao' },
                { value: 'DELIVERED', label: 'Hoàn thành' },
                { value: 'FULLY_PAID', label: 'Đã thanh toán' },
                { value: 'CONTRACT_SIGNED', label: 'Đã ký hợp đồng' },
                { value: 'CANCELLED', label: 'Đã hủy' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Mẫu xe: Tất cả' },
                { value: 'Model S', label: 'Model S' },
                { value: 'Model X', label: 'Model X' },
                { value: 'Model R', label: 'Model R' },
              ]}
              value={modelFilter}
              onChange={setModelFilter}
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
                      <Table.Head>KHÁCH HÀNG</Table.Head>
                      <Table.Head>NHÂN VIÊN</Table.Head>
                      <Table.Head>MẪU XE / MÀU SẮC</Table.Head>
                      <Table.Head>NGÀY TẠO</Table.Head>
                      <Table.Head>GIÁ TRỊ</Table.Head>
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
                        <Table.Cell className="font-mono">
                          #{order.orderId || `ELEC-${order.orderId}`}
                        </Table.Cell>
                        <Table.Cell>{order.customerName || 'N/A'}</Table.Cell>
                        <Table.Cell>{order.staffName || order.createdBy || 'N/A'}</Table.Cell>
                        <Table.Cell>
                          {(() => {
                            // Lấy model và color từ orderDetails nếu có
                            const orderDetails = order.getOrderDetailsResponses || order.orderDetails || [];
                            
                            // Thử lấy từ orderDetails trước
                            if (orderDetails.length > 0) {
                              const firstDetail = orderDetails[0];
                              const modelName = firstDetail.modelName || order.modelName;
                              const colorName = firstDetail.colorName;
                              if (modelName && colorName) {
                                return (
                                  <div className="flex flex-col">
                                    <span className="font-medium">{modelName}</span>
                                    <span className="text-sm text-gray-500">{colorName}</span>
                                  </div>
                                );
                              }
                              if (modelName) {
                                return <span>{modelName}</span>;
                              }
                            }
                            
                            // Fallback: Thử lấy từ order object trực tiếp
                            if (order.modelName) {
                              return (
                                <div className="flex flex-col">
                                  <span className="font-medium">{order.modelName}</span>
                                  {order.colorName && (
                                    <span className="text-sm text-gray-500">{order.colorName}</span>
                                  )}
                                </div>
                              );
                            }
                            
                            // Nếu là đơn nháp và chưa có thông tin
                            if (order.status === 'DRAFT' || order.status === 'PENDING') {
                              return <span className="text-gray-400 italic">Chưa chọn xe</span>;
                            }
                            
                            return <span className="text-gray-400">N/A</span>;
                          })()}
                        </Table.Cell>
                        <Table.Cell>{formatDate(order.createdAt || order.orderDate)}</Table.Cell>
                        <Table.Cell className="font-medium">
                          {(() => {
                            // Tính tổng từ orderDetails nếu totalAmount/totalPrice không có hoặc bằng 0
                            const totalAmount = order.totalAmount || order.totalPrice;
                            if (totalAmount && totalAmount > 0) {
                              return formatCurrency(totalAmount);
                            }
                            
                            // Thử tính từ orderDetails
                            const orderDetails = order.getOrderDetailsResponses || order.orderDetails || [];
                            if (orderDetails.length > 0) {
                              const calculatedTotal = orderDetails.reduce((sum, detail) => {
                                const price = detail.price || detail.unitPrice || 0;
                                const quantity = detail.quantity || 1;
                                return sum + (price * quantity);
                              }, 0);
                              if (calculatedTotal > 0) {
                                return formatCurrency(calculatedTotal);
                              }
                            }
                            
                            // Nếu là đơn nháp và chưa có giá
                            if (order.status === 'DRAFT' || order.status === 'PENDING') {
                              return <span className="text-gray-400 italic">Chưa tính giá</span>;
                            }
                            
                            return formatCurrency(0);
                          })()}
                        </Table.Cell>
                        <Table.Cell>{getStatusBadge(order.status)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center">
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === order.orderId ? null : order.orderId)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical size={18} />
                              </button>
                              {openMenuId === order.orderId && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                    <div className="py-1">
                                      <button
                                        onClick={() => handleViewDetails(order.orderId)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Eye size={16} />
                                        Xem chi tiết
                                      </button>
                                      {order.status === 'PENDING' && (
                                        <>
                                          <button
                                            onClick={() => {
                                              // TODO: Duyệt đơn
                                              setOpenMenuId(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                          >
                                            <Check size={16} />
                                            Duyệt đơn
                                          </button>
                                          <button
                                            onClick={() => {
                                              // TODO: Từ chối
                                              setOpenMenuId(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                          >
                                            <X size={16} />
                                            Từ chối
                                          </button>
                                        </>
                                      )}
                                      <button
                                        onClick={() => handlePrintOrder(order)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Printer size={16} />
                                        In hóa đơn
                                      </button>
                                    </div>
                                  </div>
                                </>
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
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} của{' '}
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
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  {totalPages > 5 && <span className="px-2">...</span>}
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

        {/* Order Detail Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedOrderId(null);
          }}
          title={`Chi tiết đơn hàng #${selectedOrderId}`}
          size="xl"
        >
          {isLoadingOrderDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : orderDetailData?.data ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã đơn hàng</label>
                  <p className="text-lg font-semibold">#{orderDetailData.data.orderId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(orderDetailData.data.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Khách hàng</label>
                  <p className="text-lg">{orderDetailData.data.customerName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nhân viên</label>
                  <p className="text-lg">{orderDetailData.data.staffName || orderDetailData.data.createdBy || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="text-lg">{formatDate(orderDetailData.data.createdAt || orderDetailData.data.orderDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tổng tiền</label>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(orderDetailData.data.totalAmount || orderDetailData.data.totalPrice)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Chi tiết sản phẩm</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Mẫu xe</Table.Head>
                        <Table.Head>Màu sắc</Table.Head>
                        <Table.Head>Số lượng</Table.Head>
                        <Table.Head>Đơn giá</Table.Head>
                        <Table.Head>Thành tiền</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {(orderDetailData.data.getOrderDetailsResponses || orderDetailData.data.orderDetails || []).map((detail, index) => (
                        <Table.Row key={index}>
                          <Table.Cell>{detail.modelName || orderDetailData.data.modelName || 'N/A'}</Table.Cell>
                          <Table.Cell>{detail.colorName || 'N/A'}</Table.Cell>
                          <Table.Cell>{detail.quantity || 1}</Table.Cell>
                          <Table.Cell>{formatCurrency(detail.price || detail.unitPrice || 0)}</Table.Cell>
                          <Table.Cell className="font-medium">
                            {formatCurrency((detail.price || detail.unitPrice || 0) * (detail.quantity || 1))}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handlePrintOrder(orderDetailData.data)}
                  className="flex-1"
                >
                  <Printer size={18} className="mr-2" />
                  In hóa đơn
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedOrderId(null);
                  }}
                  className="flex-1"
                >
                  Đóng
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">Không tìm thấy thông tin đơn hàng</div>
            </div>
          )}
        </Modal>
      </div>
    </DealerManagerLayout>
  );
};

export default OrderManagementPage;

