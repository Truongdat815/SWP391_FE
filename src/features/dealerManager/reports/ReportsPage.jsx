import { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Package, Download } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import Card from '../../../components/ui/Card';
import LineChart from '../../../components/charts/LineChart';
import DonutChart from '../../../components/charts/DonutChart';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';
import { useGetAllOrdersQuery, useGetMonthlyRevenueQuery } from '../../../api/dealerManager/dmOrderApi';
import { useGetAllStoreStocksQuery } from '../../../api/dealerManager/inventoryApi';
import { useGetAllStaffQuery } from '../../../api/dealerManager/staffApi';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useGetAllOrdersQuery();
  const { data: revenueData, isLoading: isLoadingRevenue } = useGetMonthlyRevenueQuery();
  const { data: stocksData } = useGetAllStoreStocksQuery();
  const { data: staffData } = useGetAllStaffQuery();

  const orders = ordersData?.data || [];
  const monthlyRevenue = revenueData?.data || [];
  const stocks = stocksData?.data || [];
  const allStaff = staffData?.data || [];

  // Filter chỉ lấy Dealer Staff
  const staff = useMemo(() => {
    return allStaff.filter((user) => {
      const roleName = user.roleName || '';
      return (
        roleName.includes('Nhân viên cửa hàng') ||
        roleName.includes('DEALER_STAFF') ||
        roleName.toLowerCase().includes('dealer staff')
      );
    });
  }, [allStaff]);

  const isLoading = isLoadingOrders || isLoadingRevenue;

  // Set default date range (last 30 days)
  const getDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const defaultDates = getDefaultDates();
  const finalStartDate = startDate || defaultDates.start;
  const finalEndDate = endDate || defaultDates.end;

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt || order.orderDate);
      const start = new Date(finalStartDate);
      const end = new Date(finalEndDate);
      end.setHours(23, 59, 59, 999);
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, finalStartDate, finalEndDate]);

  // Filter orders by staff
  const staffOrders = useMemo(() => {
    if (!selectedStaffId) return filteredOrders;
    return filteredOrders.filter((order) => {
      return order.staffId?.toString() === selectedStaffId || order.createdBy?.toString() === selectedStaffId;
    });
  }, [filteredOrders, selectedStaffId]);

  // Tính toán doanh số theo tháng (6 tháng gần nhất)
  const monthlyRevenueChart = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
      
      const monthOrders = filteredOrders.filter((order) => {
        if (!order.createdAt && !order.orderDate) return false;
        const orderDate = new Date(order.createdAt || order.orderDate);
        return (
          orderDate.getMonth() === monthDate.getMonth() &&
          orderDate.getFullYear() === monthDate.getFullYear() &&
          order.status === 'DELIVERED'
        );
      });
      
      const total = monthOrders.reduce(
        (sum, order) => sum + (parseFloat(order.totalAmount || order.totalPrice) || 0),
        0
      );
      
      months.push({
        name: monthName,
        value: Math.round(total / 1000000), // Convert to millions
      });
    }
    return months.length > 0 ? months : [
      { name: 'Tháng 1', value: 0 },
      { name: 'Tháng 2', value: 0 },
      { name: 'Tháng 3', value: 0 },
      { name: 'Tháng 4', value: 0 },
      { name: 'Tháng 5', value: 0 },
      { name: 'Tháng 6', value: 0 },
    ];
  }, [filteredOrders]);

  // Tính toán số lượng đơn hàng theo trạng thái
  const orderStatusData = useMemo(() => {
    const statusCounts = {
      DELIVERED: 0,
      CONFIRMED: 0,
      PENDING: 0,
      CANCELLED: 0,
      DRAFT: 0,
      DELIVERING: 0,
    };

    filteredOrders.forEach((order) => {
      const status = order.status || 'DRAFT';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status,
        value: count,
      }));
  }, [filteredOrders]);

  // Tính toán doanh số theo model
  const modelRevenueData = useMemo(() => {
    const modelMap = {};
    filteredOrders
      .filter((order) => order.status === 'DELIVERED')
      .forEach((order) => {
        const modelName = order.modelName || 'Không xác định';
        const amount = parseFloat(order.totalAmount || order.totalPrice) || 0;
        modelMap[modelName] = (modelMap[modelName] || 0) + amount;
      });

    return Object.entries(modelMap)
      .map(([name, value]) => ({
        name,
        value: Math.round(value / 1000000), // Convert to millions
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 models
  }, [filteredOrders]);

  // Tính toán doanh số và số sản phẩm theo nhân viên
  const staffRevenueData = useMemo(() => {
    const staffMap = {};
    filteredOrders
      .filter((order) => order.status === 'DELIVERED')
      .forEach((order) => {
        const staffId = order.staffId?.toString() || order.createdBy?.toString() || 'unknown';
        const staffName = order.staffName || order.createdBy || 'Không xác định';
        const amount = parseFloat(order.totalAmount || order.totalPrice) || 0;
        
        if (!staffMap[staffId]) {
          staffMap[staffId] = {
            id: staffId,
            name: staffName,
            revenue: 0,
            orderCount: 0,
            productCount: 0,
          };
        }
        
        staffMap[staffId].revenue += amount;
        staffMap[staffId].orderCount += 1;
        // Giả sử mỗi đơn hàng có 1 sản phẩm, nếu có orderDetails thì có thể tính chính xác hơn
        staffMap[staffId].productCount += 1;
      });

    return Object.values(staffMap)
      .map((staff) => ({
        ...staff,
        revenueInMillions: Math.round(staff.revenue / 1000000),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // Tính toán metrics
  const totalRevenue = useMemo(() => {
    const completed = filteredOrders.filter((o) => o.status === 'DELIVERED');
    const total = completed.reduce(
      (sum, order) => sum + (parseFloat(order.totalAmount || order.totalPrice) || 0),
      0
    );
    return total;
  }, [filteredOrders]);

  const currentMonthRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const revenue = monthlyRevenue.find(
      (rev) => rev.month === currentMonth && rev.year === currentYear
    );
    return revenue?.totalRevenue || 0;
  }, [monthlyRevenue]);

  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter((o) => o.status === 'DELIVERED').length;
  const availableCars = stocks.filter((stock) => stock.status === 'AVAILABLE').length;

  const formatCurrency = (amount) => {
    if (!amount) return '0₫';
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)} Tỷ`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} Triệu`;
    }
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
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </DealerManagerLayout>
    );
  }

  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = ordersError?.status === 401;
  
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

  if (ordersError) {
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
            <h1 className="text-3xl font-bold text-gray-900">Báo Cáo</h1>
            <p className="text-gray-600 mt-1">Xem thống kê và báo cáo hiệu suất đại lý</p>
          </div>
          <Button variant="outline">
            <Download size={20} className="mr-2" />
            Xuất Báo Cáo
          </Button>
        </div>

        {/* Report Type Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setReportType('overview')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                reportType === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Tổng Quan
            </button>
            <button
              onClick={() => setReportType('staff')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                reportType === 'staff'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Theo Nhân Viên
            </button>
            <button
              onClick={() => setReportType('model')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                reportType === 'model'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Theo Model
            </button>
            <button
              onClick={() => setReportType('orders')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                reportType === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Chi Tiết Đơn Hàng
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Từ ngày"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="Đến ngày"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            {reportType === 'staff' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả nhân viên</option>
                  {staff.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.fullName || member.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Doanh thu (khoảng thời gian)</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
                </div>
                <DollarSign size={32} className="text-green-600" />
              </div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Doanh thu tháng này</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(currentMonthRevenue)}</p>
                </div>
                <TrendingUp size={32} className="text-blue-600" />
              </div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng Đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
                </div>
                <ShoppingCart size={32} className="text-purple-600" />
              </div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đơn đã hoàn thành</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{completedOrders}</p>
                </div>
                <Package size={32} className="text-orange-600" />
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Report Content */}
        {reportType === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <Card.Header>
                <Card.Title>Doanh số theo tháng</Card.Title>
                <p className="text-sm text-gray-500 mt-1">6 tháng gần nhất</p>
              </Card.Header>
              <Card.Content>
                <LineChart
                  data={monthlyRevenueChart}
                  dataKey="value"
                  name="Doanh số (triệu VND)"
                  color="#3B82F6"
                />
              </Card.Content>
            </Card>

            <Card>
              <Card.Header>
                <Card.Title>Phân bố Đơn hàng</Card.Title>
                <p className="text-sm text-gray-500 mt-1">Theo trạng thái</p>
              </Card.Header>
              <Card.Content>
                {orderStatusData.length > 0 ? (
                  <DonutChart data={orderStatusData} dataKey="value" nameKey="name" />
                ) : (
                  <div className="text-center py-8 text-gray-500">Chưa có dữ liệu</div>
                )}
              </Card.Content>
            </Card>
          </div>
        )}

        {reportType === 'staff' && (
          <div className="space-y-6">
            {/* Bảng tổng hợp doanh số nhân viên */}
            <Card>
              <Card.Header>
                <Card.Title>Báo Cáo Doanh Số Nhân Viên</Card.Title>
                <p className="text-sm text-gray-500 mt-1">Thống kê doanh số và sản phẩm bán được của từng nhân viên</p>
              </Card.Header>
              <Card.Content>
                {staffRevenueData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.Head>STT</Table.Head>
                          <Table.Head>Nhân viên</Table.Head>
                          <Table.Head className="text-right">Số đơn hàng</Table.Head>
                          <Table.Head className="text-right">Số sản phẩm</Table.Head>
                          <Table.Head className="text-right">Tổng doanh số</Table.Head>
                          <Table.Head className="text-right">Doanh số trung bình/đơn</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {staffRevenueData.map((staff, index) => (
                          <Table.Row key={staff.id}>
                            <Table.Cell className="font-medium">{index + 1}</Table.Cell>
                            <Table.Cell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Users size={16} className="text-blue-600" />
                                </div>
                                <span className="font-medium">{staff.name}</span>
                              </div>
                            </Table.Cell>
                            <Table.Cell className="text-right font-medium">{staff.orderCount}</Table.Cell>
                            <Table.Cell className="text-right font-medium">{staff.productCount}</Table.Cell>
                            <Table.Cell className="text-right font-bold text-green-600">
                              {formatCurrency(staff.revenue)}
                            </Table.Cell>
                            <Table.Cell className="text-right text-gray-600">
                              {staff.orderCount > 0
                                ? formatCurrency(Math.round(staff.revenue / staff.orderCount))
                                : '0₫'}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">Chưa có dữ liệu</div>
                )}
              </Card.Content>
            </Card>

            {/* Card tổng quan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <Card.Content className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng nhân viên</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{staffRevenueData.length}</p>
                    </div>
                    <Users size={32} className="text-blue-600" />
                  </div>
                </Card.Content>
              </Card>
              <Card>
                <Card.Content className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng sản phẩm bán được</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {staffRevenueData.reduce((sum, staff) => sum + staff.productCount, 0)}
                      </p>
                    </div>
                    <Package size={32} className="text-purple-600" />
                  </div>
                </Card.Content>
              </Card>
              <Card>
                <Card.Content className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng doanh số</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(staffRevenueData.reduce((sum, staff) => sum + staff.revenue, 0))}
                      </p>
                    </div>
                    <DollarSign size={32} className="text-green-600" />
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Chi tiết đơn hàng của nhân viên được chọn */}
            {selectedStaffId && (
              <Card>
                <Card.Header>
                  <Card.Title>
                    Chi Tiết Đơn Hàng - {staff.find((s) => s.userId?.toString() === selectedStaffId)?.fullName || staffRevenueData.find((s) => s.id === selectedStaffId)?.name || 'Nhân viên'}
                  </Card.Title>
                  <p className="text-sm text-gray-500 mt-1">
                    {staffOrders.filter((o) => o.status === 'DELIVERED').length} đơn đã hoàn thành | Tổng doanh số: {formatCurrency(staffOrders.filter((o) => o.status === 'DELIVERED').reduce((sum, o) => sum + (parseFloat(o.totalAmount || o.totalPrice) || 0), 0))}
                  </p>
                </Card.Header>
                <Card.Content>
                  <div className="overflow-x-auto">
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.Head>Mã đơn</Table.Head>
                          <Table.Head>Khách hàng</Table.Head>
                          <Table.Head>Model</Table.Head>
                          <Table.Head>Ngày tạo</Table.Head>
                          <Table.Head className="text-right">Giá trị</Table.Head>
                          <Table.Head>Trạng thái</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {staffOrders.length > 0 ? (
                          staffOrders.map((order) => (
                            <Table.Row key={order.orderId}>
                              <Table.Cell className="font-mono">#{order.orderId}</Table.Cell>
                              <Table.Cell>{order.customerName || 'N/A'}</Table.Cell>
                              <Table.Cell>{order.modelName || 'N/A'}</Table.Cell>
                              <Table.Cell>{formatDate(order.createdAt || order.orderDate)}</Table.Cell>
                              <Table.Cell className="text-right font-medium">
                                {formatCurrency(order.totalAmount || order.totalPrice)}
                              </Table.Cell>
                              <Table.Cell>
                                <Badge
                                  variant={
                                    order.status === 'DELIVERED'
                                      ? 'success'
                                      : order.status === 'CONFIRMED'
                                      ? 'info'
                                      : order.status === 'PENDING'
                                      ? 'warning'
                                      : 'default'
                                  }
                                >
                                  {order.status === 'DELIVERED'
                                    ? 'Hoàn thành'
                                    : order.status === 'CONFIRMED'
                                    ? 'Đã xác nhận'
                                    : order.status === 'PENDING'
                                    ? 'Chờ duyệt'
                                    : order.status || 'N/A'}
                                </Badge>
                              </Table.Cell>
                            </Table.Row>
                          ))
                        ) : (
                          <Table.Row>
                            <Table.Cell colSpan={6} className="text-center py-8 text-gray-500">
                              Không có đơn hàng
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </Table.Body>
                    </Table>
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>
        )}

        {reportType === 'model' && (
          <Card>
            <Card.Header>
              <Card.Title>Doanh số theo Model</Card.Title>
              <p className="text-sm text-gray-500 mt-1">Top 5 model bán chạy</p>
            </Card.Header>
            <Card.Content>
              {modelRevenueData.length > 0 ? (
                <div className="space-y-4">
                  {modelRevenueData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">Model xe</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{item.value} Triệu</p>
                        <p className="text-sm text-gray-500">VND</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">Chưa có dữ liệu</div>
              )}
            </Card.Content>
          </Card>
        )}

        {reportType === 'orders' && (
          <Card>
            <Card.Header>
              <Card.Title>Chi Tiết Đơn Hàng</Card.Title>
              <p className="text-sm text-gray-500 mt-1">Danh sách đơn hàng trong khoảng thời gian</p>
            </Card.Header>
            <Card.Content>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>Mã đơn</Table.Head>
                      <Table.Head>Khách hàng</Table.Head>
                      <Table.Head>Nhân viên</Table.Head>
                      <Table.Head>Model</Table.Head>
                      <Table.Head>Ngày tạo</Table.Head>
                      <Table.Head>Giá trị</Table.Head>
                      <Table.Head>Trạng thái</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filteredOrders.slice(0, 20).map((order) => (
                      <Table.Row key={order.orderId}>
                        <Table.Cell className="font-mono">#{order.orderId}</Table.Cell>
                        <Table.Cell>{order.customerName || 'N/A'}</Table.Cell>
                        <Table.Cell>{order.staffName || order.createdBy || 'N/A'}</Table.Cell>
                        <Table.Cell>{order.modelName || 'N/A'}</Table.Cell>
                        <Table.Cell>{formatDate(order.createdAt || order.orderDate)}</Table.Cell>
                        <Table.Cell className="font-medium">
                          {formatCurrency(order.totalAmount || order.totalPrice)}
                        </Table.Cell>
                        <Table.Cell>{order.status || 'N/A'}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
              )}
            </Card.Content>
          </Card>
        )}
      </div>
    </DealerManagerLayout>
  );
};

export default ReportsPage;

