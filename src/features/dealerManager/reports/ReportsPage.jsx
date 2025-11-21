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

// Hàm chuyển đổi status sang tiếng Việt
const getStatusLabel = (status) => {
  const statusMap = {
    DRAFT: 'Nháp',
    PENDING: 'Chờ duyệt',
    CONFIRMED: 'Đã xác nhận',
    DELIVERING: 'Đang giao',
    DELIVERED: 'Hoàn thành',
    FULLY_PAID: 'Đã thanh toán',
    CANCELLED: 'Đã hủy',
    CONTRACT_SIGNED: 'Đã ký hợp đồng',
  };
  return statusMap[status] || status;
};

const ReportsPage = () => {
  const [reportType, setReportType] = useState('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useGetAllOrdersQuery();
  const { data: revenueData, isLoading: isLoadingRevenue, error: revenueError } = useGetMonthlyRevenueQuery();
  const { data: stocksData, error: stocksError } = useGetAllStoreStocksQuery();
  const { data: staffData, error: staffError } = useGetAllStaffQuery();

  const orders = ordersData?.data || [];
  const monthlyRevenue = revenueData?.data || [];
  const stocks = stocksData?.data || [];
  const allStaff = staffData?.data || [];

  // Filter chỉ lấy Dealer Staff
  const staff = useMemo(() => {
    if (!Array.isArray(allStaff)) return [];
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
    if (!Array.isArray(orders)) return [];
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
        // Tính từ các đơn đã hoàn thành hoặc đã thanh toán (giống Dashboard)
        const isCompleted = order.status === 'DELIVERED' || 
                          order.status === 'FULLY_PAID' || 
                          order.status === 'CONFIRMED';
        return (
          orderDate.getMonth() === monthDate.getMonth() &&
          orderDate.getFullYear() === monthDate.getFullYear() &&
          isCompleted
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

    if (!Array.isArray(filteredOrders)) return [];
    filteredOrders.forEach((order) => {
      const status = order.status || 'DRAFT';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: getStatusLabel(status),
        value: count,
      }));
  }, [filteredOrders]);

  // Tính toán doanh số theo model
  const modelRevenueData = useMemo(() => {
    if (!Array.isArray(filteredOrders)) return [];
    const modelMap = {};
    filteredOrders
      .filter((order) => 
        order.status === 'DELIVERED' || 
        order.status === 'FULLY_PAID' || 
        order.status === 'CONFIRMED'
      )
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
    if (!Array.isArray(filteredOrders)) return [];
    const staffMap = {};
    filteredOrders
      .filter((order) => 
        order.status === 'DELIVERED' || 
        order.status === 'FULLY_PAID' || 
        order.status === 'CONFIRMED'
      )
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
    // Tính từ các đơn đã hoàn thành hoặc đã thanh toán (giống Dashboard)
    const completed = filteredOrders.filter((o) => 
      o.status === 'DELIVERED' || 
      o.status === 'FULLY_PAID' || 
      o.status === 'CONFIRMED'
    );
    const total = completed.reduce(
      (sum, order) => sum + (parseFloat(order.totalAmount || order.totalPrice) || 0),
      0
    );
    return total;
  }, [filteredOrders]);

  const currentMonthRevenue = useMemo(() => {
    // Tính từ orders của tháng hiện tại (giống Dashboard)
    if (!Array.isArray(orders)) return 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthOrders = orders.filter((order) => {
      if (!order.createdAt && !order.orderDate) return false;
      try {
        const orderDate = new Date(order.createdAt || order.orderDate);
        // Chỉ tính các đơn đã hoàn thành hoặc đã thanh toán (giống Dashboard)
        const isCompleted = order.status === 'DELIVERED' || 
                          order.status === 'FULLY_PAID' || 
                          order.status === 'CONFIRMED';
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear &&
          isCompleted
        );
      } catch {
        return false;
      }
    });
    
    const total = monthOrders.reduce(
      (sum, order) => {
        const amount = parseFloat(order.totalAmount || order.totalPrice || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      },
      0
    );
    
    return total;
  }, [orders]);

  const totalOrders = Array.isArray(filteredOrders) ? filteredOrders.length : 0;
  const completedOrders = Array.isArray(filteredOrders) ? filteredOrders.filter((o) => o.status === 'DELIVERED').length : 0;
  const availableCars = Array.isArray(stocks) ? stocks.filter((stock) => stock.status === 'AVAILABLE').length : 0;

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
  const isUnauthorized = 
    ordersError?.status === 401 || 
    revenueError?.status === 401 || 
    stocksError?.status === 401 ||
    staffError?.status === 401;
  
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

  const hasError = (ordersError && ordersError.status !== 401) || 
                   (revenueError && revenueError.status !== 401) ||
                   (stocksError && stocksError.status !== 401) ||
                   (staffError && staffError.status !== 401);

  if (hasError) {
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
      <div className="h-[calc(100vh-80px)] flex flex-col p-4 overflow-hidden">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Báo Cáo</h1>
            <p className="text-sm text-gray-600">Xem thống kê và báo cáo hiệu suất đại lý</p>
          </div>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Xuất Báo Cáo
          </Button>
        </div>

        {/* Report Type Selector - Compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setReportType('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportType === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Tổng Quan
            </button>
            <button
              onClick={() => setReportType('staff')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportType === 'staff'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Theo Nhân Viên
            </button>
            <button
              onClick={() => setReportType('model')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportType === 'model'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Theo Model
            </button>
            <button
              onClick={() => setReportType('orders')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                reportType === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Chi Tiết Đơn Hàng
            </button>
          </div>
        </div>

        {/* Filters - Compact */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Nhân viên</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tất cả nhân viên</option>
                  {(Array.isArray(staff) ? staff : []).map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.fullName || member.email}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Metrics - Compact */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Card>
            <Card.Content className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Doanh thu (khoảng thời gian)</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{formatCurrency(totalRevenue)}</p>
                </div>
                <DollarSign size={24} className="text-green-600" />
              </div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Doanh thu tháng này</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{formatCurrency(currentMonthRevenue)}</p>
                </div>
                <TrendingUp size={24} className="text-blue-600" />
              </div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Tổng Đơn hàng</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{totalOrders}</p>
                </div>
                <ShoppingCart size={24} className="text-purple-600" />
              </div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Đơn đã hoàn thành</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{completedOrders}</p>
                </div>
                <Package size={24} className="text-orange-600" />
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Report Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
        {reportType === 'overview' && (
          <div className="grid grid-cols-2 gap-3 h-full">
            <Card className="h-full flex flex-col">
              <Card.Header className="pb-2">
                <Card.Title className="text-base">Doanh số theo tháng</Card.Title>
                <p className="text-xs text-gray-500">6 tháng gần nhất</p>
              </Card.Header>
              <Card.Content className="flex-1 min-h-0">
                <div className="h-full">
                  <LineChart
                    data={monthlyRevenueChart}
                    dataKey="value"
                    name="Doanh số (triệu VND)"
                    color="#3B82F6"
                  />
                </div>
              </Card.Content>
            </Card>

            <Card className="h-full flex flex-col">
              <Card.Header className="pb-2">
                <Card.Title className="text-base">Phân bố Đơn hàng</Card.Title>
                <p className="text-xs text-gray-500">Theo trạng thái</p>
              </Card.Header>
              <Card.Content className="flex-1 min-h-0">
                {orderStatusData.length > 0 ? (
                  <div className="h-full">
                    <DonutChart data={orderStatusData} dataKey="value" nameKey="name" />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">Chưa có dữ liệu</div>
                )}
              </Card.Content>
            </Card>
          </div>
        )}

        {reportType === 'staff' && (
          <div className="space-y-3 h-full overflow-y-auto">
            {/* Bảng tổng hợp doanh số nhân viên */}
            <Card>
              <Card.Header className="pb-2">
                <Card.Title className="text-base">Báo Cáo Doanh Số Nhân Viên</Card.Title>
                <p className="text-xs text-gray-500">Thống kê doanh số và sản phẩm bán được của từng nhân viên</p>
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
                        {(Array.isArray(staffRevenueData) ? staffRevenueData : []).map((staff, index) => (
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
            <div className="grid grid-cols-3 gap-3">
              <Card>
                <Card.Content className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Tổng nhân viên</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">{staffRevenueData.length}</p>
                    </div>
                    <Users size={24} className="text-blue-600" />
                  </div>
                </Card.Content>
              </Card>
              <Card>
                <Card.Content className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Tổng sản phẩm bán được</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">
                        {Array.isArray(staffRevenueData) ? staffRevenueData.reduce((sum, staff) => sum + (staff.productCount || 0), 0) : 0}
                      </p>
                    </div>
                    <Package size={24} className="text-purple-600" />
                  </div>
                </Card.Content>
              </Card>
              <Card>
                <Card.Content className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Tổng doanh số</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">
                        {formatCurrency(Array.isArray(staffRevenueData) ? staffRevenueData.reduce((sum, staff) => sum + (staff.revenue || 0), 0) : 0)}
                      </p>
                    </div>
                    <DollarSign size={24} className="text-green-600" />
                  </div>
                </Card.Content>
              </Card>
            </div>

            {/* Chi tiết đơn hàng của nhân viên được chọn */}
            {selectedStaffId && (
              <Card>
                <Card.Header>
                  <Card.Title>
                    Chi Tiết Đơn Hàng - {(Array.isArray(staff) ? staff.find((s) => s.userId?.toString() === selectedStaffId) : null)?.fullName || (Array.isArray(staffRevenueData) ? staffRevenueData.find((s) => s.id === selectedStaffId) : null)?.name || 'Nhân viên'}
                  </Card.Title>
                  <p className="text-sm text-gray-500 mt-1">
                    {Array.isArray(staffOrders) ? staffOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'FULLY_PAID' || o.status === 'CONFIRMED').length : 0} đơn đã hoàn thành | Tổng doanh số: {formatCurrency(Array.isArray(staffOrders) ? staffOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'FULLY_PAID' || o.status === 'CONFIRMED').reduce((sum, o) => sum + (parseFloat(o.totalAmount || o.totalPrice) || 0), 0) : 0)}
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
                        {Array.isArray(staffOrders) && staffOrders.length > 0 ? (
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
          <Card className="h-full flex flex-col">
            <Card.Header className="pb-2">
              <Card.Title className="text-base">Doanh số theo Model</Card.Title>
              <p className="text-xs text-gray-500">Top 5 model bán chạy</p>
            </Card.Header>
            <Card.Content className="flex-1 overflow-auto">
              {Array.isArray(modelRevenueData) && modelRevenueData.length > 0 ? (
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
          <Card className="h-full flex flex-col">
            <Card.Header className="pb-2">
              <Card.Title className="text-base">Chi Tiết Đơn Hàng</Card.Title>
              <p className="text-xs text-gray-500">Danh sách đơn hàng trong khoảng thời gian</p>
            </Card.Header>
            <Card.Content className="flex-1 overflow-auto">
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
                    {(Array.isArray(filteredOrders) ? filteredOrders.slice(0, 20) : []).map((order) => (
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
      </div>
    </DealerManagerLayout>
  );
};

export default ReportsPage;

