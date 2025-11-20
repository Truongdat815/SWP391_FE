import { useMemo, useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import MetricCard from '../../../components/shared/MetricCard';
import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import LineChart from '../../../components/charts/LineChart';
import BarChart from '../../../components/charts/BarChart';
import { useGetAllOrdersQuery } from '../../../api/dealerManager/dmOrderApi';
import { useGetAllStoreStocksQuery } from '../../../api/dealerManager/inventoryApi';
import { useGetMonthlyRevenueQuery } from '../../../api/dealerManager/storeApi';
import { useGetAllStaffQuery } from '../../../api/dealerManager/staffApi';

const DealerManagerDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  
  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useGetAllOrdersQuery();
  const { data: revenueData, isLoading: isLoadingRevenue, error: revenueError } = useGetMonthlyRevenueQuery();
  const { data: stocksData, isLoading: isLoadingStocks, error: stocksError } = useGetAllStoreStocksQuery();
  const { data: staffData } = useGetAllStaffQuery();

  const orders = ordersData?.data || [];
  // API từ storeApi có transformResponse trả về { data: revenues[0] || null }
  // revenues[0] có thể là object { month, year, totalRevenue, storeId } hoặc null
  const monthlyRevenue = revenueData?.data;
  const stocks = stocksData?.data || [];
  const allStaff = staffData?.data || [];

  // Debug logging trong development
  if (import.meta.env.DEV) {
    console.log('Dashboard Data:', {
      ordersData: ordersData,
      ordersCount: orders.length,
      revenueData: revenueData,
      monthlyRevenue,
      stocksCount: stocks.length,
      ordersSample: orders.slice(0, 2),
    });
  }

  const isLoading = isLoadingOrders || isLoadingRevenue || isLoadingStocks;
  
  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = 
    ordersError?.status === 401 || 
    revenueError?.status === 401 || 
    stocksError?.status === 401;
  
  const hasError = (ordersError && ordersError.status !== 401) || 
                   (revenueError && revenueError.status !== 401);

  // Tính toán metrics - Doanh thu tháng hiện tại từ API store revenue
  const currentMonthRevenue = useMemo(() => {
    // API từ storeApi có transformResponse trả về { data: revenues[0] || null }
    // revenues[0] là object { month, year, totalRevenue, storeId } hoặc null
    if (monthlyRevenue && typeof monthlyRevenue === 'object' && !Array.isArray(monthlyRevenue)) {
      // Kiểm tra nếu là object có totalRevenue (từ transformResponse)
      if (monthlyRevenue.totalRevenue !== undefined) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        // Chỉ dùng nếu là tháng hiện tại
        if (monthlyRevenue.month === currentMonth && monthlyRevenue.year === currentYear) {
          const revenue = parseFloat(monthlyRevenue.totalRevenue) || 0;
          if (import.meta.env.DEV) {
            console.log('Using monthly revenue from API:', revenue);
          }
          return revenue;
        }
      }
    }
    
    // Nếu là array (fallback nếu transformResponse không hoạt động)
    if (Array.isArray(monthlyRevenue) && monthlyRevenue.length > 0) {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const revenue = monthlyRevenue.find(
        (rev) => rev.month === currentMonth && rev.year === currentYear
      );
      if (revenue?.totalRevenue !== undefined) {
        const total = parseFloat(revenue.totalRevenue) || 0;
        if (import.meta.env.DEV) {
          console.log('Using monthly revenue from API array:', total);
        }
        return total;
      }
    }
    
    // Fallback: Tính từ orders của tháng hiện tại nếu API không trả về
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthOrders = orders.filter((order) => {
      if (!order.createdAt && !order.orderDate) return false;
      try {
        const orderDate = new Date(order.createdAt || order.orderDate);
        // Chỉ tính các đơn đã hoàn thành hoặc đã thanh toán
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
    
    if (import.meta.env.DEV) {
      console.log('Calculated monthly revenue from orders:', {
        monthOrdersCount: monthOrders.length,
        totalOrders: orders.length,
        total,
      });
    }
    
    return total;
  }, [monthlyRevenue, orders]);

  const pendingOrders = orders.filter(
    (order) => order.status === 'PENDING' || order.status === 'DRAFT'
  ).length;

  const totalOrdersThisMonth = orders.filter((order) => {
    const orderDate = new Date(order.createdAt || order.orderDate);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }).length;

  const availableCars = stocks.filter((stock) => stock.status === 'AVAILABLE').length;

  // Revenue chart data (4 tuần gần nhất)
  const revenueChartData = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) {
      if (import.meta.env.DEV) {
        console.log('No orders data available for chart', {
          ordersData,
          ordersIsArray: Array.isArray(orders),
          ordersLength: orders?.length,
        });
      }
      // Trả về dữ liệu mặc định nếu chưa có orders
      return [
        { name: 'Tuần 1', value: 0 },
        { name: 'Tuần 2', value: 0 },
        { name: 'Tuần 3', value: 0 },
        { name: 'Tuần 4', value: 0 },
      ];
    }

    const weeks = [];
    const now = new Date();
    now.setHours(23, 59, 59, 999); // Set to end of day for accurate comparison
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0); // Start of week
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999); // End of week

      const weekOrders = orders.filter((order) => {
        if (!order.createdAt && !order.orderDate) return false;
        try {
          const orderDate = new Date(order.createdAt || order.orderDate);
          // Chỉ tính các đơn đã hoàn thành hoặc đã thanh toán
          const isCompleted = order.status === 'DELIVERED' || 
                             order.status === 'FULLY_PAID' || 
                             order.status === 'CONFIRMED';
          return orderDate >= weekStart && orderDate <= weekEnd && isCompleted;
        } catch (e) {
          return false;
        }
      });

      const weekTotal = weekOrders.reduce(
        (sum, order) => {
          const amount = parseFloat(order.totalAmount || order.totalPrice || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        },
        0
      );
      
      weeks.push({
        name: `Tuần ${4 - i}`,
        value: Math.round(weekTotal / 1000000), // Convert to millions
      });
    }
    
    if (import.meta.env.DEV) {
      console.log('Revenue Chart Data:', {
        weeks,
        totalOrders: orders.length,
        completedOrders: orders.filter(o => 
          o.status === 'DELIVERED' || o.status === 'FULLY_PAID' || o.status === 'CONFIRMED'
        ).length,
      });
    }
    
    return weeks.length > 0 ? weeks : [
      { name: 'Tuần 1', value: 0 },
      { name: 'Tuần 2', value: 0 },
      { name: 'Tuần 3', value: 0 },
      { name: 'Tuần 4', value: 0 },
    ];
  }, [orders, ordersData]);

  const formatRevenue = (amount) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} Tỷ`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} Triệu`;
    }
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  // Tính doanh số theo nhân viên (từ các đơn đã hoàn thành)
  const staffRevenueData = useMemo(() => {
    const staffMap = {};
    
    // Lọc các đơn đã hoàn thành hoặc đã thanh toán
    const completedOrders = orders.filter((order) => 
      order.status === 'DELIVERED' || 
      order.status === 'FULLY_PAID' || 
      order.status === 'CONFIRMED'
    );
    
    completedOrders.forEach((order) => {
      const staffId = order.staffId?.toString() || order.createdBy?.toString() || 'unknown';
      const staffName = order.staffName || 
                       allStaff.find(s => s.userId?.toString() === staffId)?.fullName || 
                       'Không xác định';
      const amount = parseFloat(order.totalAmount || order.totalPrice || 0);
      
      if (!staffMap[staffId]) {
        staffMap[staffId] = {
          id: staffId,
          name: staffName,
          revenue: 0,
        };
      }
      
      staffMap[staffId].revenue += isNaN(amount) ? 0 : amount;
    });
    
    // Chuyển đổi sang format cho biểu đồ và sắp xếp theo doanh số giảm dần
    return Object.values(staffMap)
      .map((staff) => ({
        name: staff.name,
        value: Math.round(staff.revenue / 1000000), // Convert to millions
        revenue: staff.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 nhân viên
  }, [orders, allStaff]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Chờ duyệt' },
      CONFIRMED: { variant: 'info', label: 'Đã xác nhận' },
      DELIVERING: { variant: 'info', label: 'Đang giao' },
      DELIVERED: { variant: 'success', label: 'Hoàn thành' },
      FULLY_PAID: { variant: 'success', label: 'Đã thanh toán' },
      CONTRACT_SIGNED: { variant: 'info', label: 'Đã ký hợp đồng' },
      CONTRACT_PENDING: { variant: 'warning', label: 'Chờ ký hợp đồng' },
      CANCELLED: { variant: 'error', label: 'Đã hủy' },
      DRAFT: { variant: 'default', label: 'Nháp' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Lấy các đơn hàng mới nhất (sắp xếp theo ngày tạo, mới nhất trước)
  const recentOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.orderDate || a.createdDate || 0);
      const dateB = new Date(b.createdAt || b.orderDate || b.createdDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
    return sorted;
  }, [orders]);

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(recentOrders.length / ordersPerPage));
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = recentOrders.slice(startIndex, endIndex);

  // Reset về trang 1 khi số lượng orders thay đổi đáng kể
  useEffect(() => {
    const newTotalPages = Math.ceil(recentOrders.length / ordersPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [recentOrders.length, currentPage, ordersPerPage]);

  if (isLoading) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </DealerManagerLayout>
    );
  }

  // Hiển thị thông báo nếu chưa đăng nhập (401)
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

  if (hasError) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
          </div>
        </div>
      </DealerManagerLayout>
    );
  }

  return (
    <DealerManagerLayout>
      <div className="space-y-3 p-4 max-h-[calc(100vh-80px)] overflow-y-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-600 mt-0.5 text-sm">Xem tổng quan hoạt động của đại lý</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <MetricCard
            title="Tổng Doanh Thu (Tháng)"
            value={formatRevenue(currentMonthRevenue)}
            icon={DollarSign}
          />
          <MetricCard
            title="Đơn Hàng Chờ Duyệt"
            value={pendingOrders}
            icon={ShoppingCart}
          />
          <MetricCard
            title="Tổng Số Đơn Hàng (Tháng)"
            value={totalOrdersThisMonth}
            icon={TrendingUp}
          />
          <MetricCard
            title="Xe Có Sẵn"
            value={availableCars}
            icon={Package}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-lg">Doanh Thu Theo Tuần</Card.Title>
            </Card.Header>
            <Card.Content>
              {revenueChartData && revenueChartData.length > 0 ? (
                <LineChart
                  data={revenueChartData}
                  dataKey="value"
                  name="Doanh thu (triệu VND)"
                  color="#3B82F6"
                  height={200}
                />
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">
                  Chưa có dữ liệu để hiển thị
                </div>
              )}
            </Card.Content>
          </Card>

          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-lg">Thống Kê Đơn Hàng</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-sm">Đơn hàng mới hôm nay</span>
                  <span className="text-xl font-bold text-blue-600">
                    {orders.filter((order) => {
                      const orderDate = new Date(order.createdAt || order.orderDate);
                      const today = new Date();
                      return (
                        orderDate.getDate() === today.getDate() &&
                        orderDate.getMonth() === today.getMonth() &&
                        orderDate.getFullYear() === today.getFullYear()
                      );
                    }).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-sm">Đơn hàng đang giao</span>
                  <span className="text-xl font-bold text-green-600">
                    {orders.filter((order) => order.status === 'DELIVERING').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 text-sm">Đơn hàng đã hoàn thành</span>
                  <span className="text-xl font-bold text-purple-600">
                    {orders.filter((order) => order.status === 'DELIVERED').length}
                  </span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Staff Revenue Chart and Recent Orders - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-lg">Doanh Số Theo Nhân Viên</Card.Title>
              <p className="text-xs text-gray-500 mt-0.5">Doanh số các nhân viên trong cửa hàng đạt được</p>
            </Card.Header>
            <Card.Content>
              {staffRevenueData && staffRevenueData.length > 0 ? (
                <BarChart
                  data={staffRevenueData}
                  dataKey="value"
                  name="Doanh số (triệu VND)"
                  color="#10B981"
                  height={200}
                />
              ) : (
                <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">
                  Chưa có dữ liệu để hiển thị
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Recent Orders Table */}
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-lg">Đơn Hàng Gần Đây</Card.Title>
              <p className="text-xs text-gray-500 mt-0.5">Danh sách các đơn hàng mới nhất</p>
            </Card.Header>
            <Card.Content>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">Chưa có đơn hàng nào</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.Head className="text-xs">Mã đơn</Table.Head>
                          <Table.Head className="text-xs">Khách hàng</Table.Head>
                          <Table.Head className="text-xs">Nhân viên</Table.Head>
                          <Table.Head className="text-xs">Ngày</Table.Head>
                          <Table.Head className="text-xs">Giá trị</Table.Head>
                          <Table.Head className="text-xs">Trạng thái</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {paginatedOrders.map((order) => (
                          <Table.Row key={order.orderId}>
                            <Table.Cell className="font-mono text-xs">
                              #{order.orderId || `ELEC-${order.orderId}`}
                            </Table.Cell>
                            <Table.Cell className="font-medium text-xs">
                              {order.customerName || 'N/A'}
                            </Table.Cell>
                            <Table.Cell className="text-xs">
                              {order.staffName || order.createdBy || 'N/A'}
                            </Table.Cell>
                            <Table.Cell className="text-xs">
                              {formatDate(order.createdAt || order.orderDate)}
                            </Table.Cell>
                            <Table.Cell className="font-semibold text-xs">
                              {formatCurrency(order.totalAmount || order.totalPrice || 0)}
                            </Table.Cell>
                            <Table.Cell className="text-xs">
                              {getStatusBadge(order.status)}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, recentOrders.length)} trong tổng {recentOrders.length} đơn hàng
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Trang trước"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          aria-label="Trang sau"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </DealerManagerLayout>
  );
};

export default DealerManagerDashboard;
