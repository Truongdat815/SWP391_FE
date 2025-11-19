import { useMemo } from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import MetricCard from '../../../components/shared/MetricCard';
import Card from '../../../components/ui/Card';
import LineChart from '../../../components/charts/LineChart';
import { useGetAllOrdersQuery, useGetMonthlyRevenueQuery } from '../../../api/dealerManager/dmOrderApi';
import { useGetAllStoreStocksQuery } from '../../../api/dealerManager/inventoryApi';

const DealerManagerDashboard = () => {
  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useGetAllOrdersQuery();
  const { data: revenueData, isLoading: isLoadingRevenue, error: revenueError } = useGetMonthlyRevenueQuery();
  const { data: stocksData, isLoading: isLoadingStocks, error: stocksError } = useGetAllStoreStocksQuery();

  const orders = ordersData?.data || [];
  const monthlyRevenue = revenueData?.data || [];
  const stocks = stocksData?.data || [];

  const isLoading = isLoadingOrders || isLoadingRevenue || isLoadingStocks;
  
  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = 
    ordersError?.status === 401 || 
    revenueError?.status === 401 || 
    stocksError?.status === 401;
  
  const hasError = (ordersError && ordersError.status !== 401) || 
                   (revenueError && revenueError.status !== 401);

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

  const availableCars = stocks.filter((stock) => stock.status === 'AVAILABLE').length;

  // Revenue chart data (4 tuần gần nhất)
  const revenueChartData = useMemo(() => {
    const weeks = [];
    const now = new Date();
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        return orderDate >= weekStart && orderDate <= weekEnd;
      });

      const weekTotal = weekOrders.reduce(
        (sum, order) => sum + (parseFloat(order.totalAmount || order.totalPrice) || 0),
        0
      );
      weeks.push({
        name: `Tuần ${4 - i}`,
        value: Math.round(weekTotal / 1000000), // Convert to millions
      });
    }
    return weeks.length > 0
      ? weeks
      : [
          { name: 'Tuần 1', value: 0 },
          { name: 'Tuần 2', value: 0 },
          { name: 'Tuần 3', value: 0 },
          { name: 'Tuần 4', value: 0 },
        ];
  }, [orders]);

  const formatRevenue = (amount) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} Tỷ`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} Triệu`;
    }
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
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
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-600 mt-1">Xem tổng quan hoạt động của đại lý</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Tổng Doanh Thu (Tháng)"
            value={formatRevenue(currentMonthRevenue)}
            change="+15.2%"
            changeType="positive"
            icon={DollarSign}
          />
          <MetricCard
            title="Đơn Hàng Chờ Duyệt"
            value={pendingOrders}
            change="+3 so với hôm qua"
            changeType="positive"
            icon={ShoppingCart}
          />
          <MetricCard
            title="Tổng Số Đơn Hàng (Tháng)"
            value={totalOrdersThisMonth}
            change="+8.5%"
            changeType="positive"
            icon={TrendingUp}
          />
          <MetricCard
            title="Xe Có Sẵn"
            value={availableCars}
            change=""
            changeType="neutral"
            icon={Package}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <Card.Title>Doanh Thu Theo Tuần</Card.Title>
            </Card.Header>
            <Card.Content>
              <LineChart
                data={revenueChartData}
                dataKey="value"
                name="Doanh thu (triệu VND)"
                color="#3B82F6"
              />
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Thống Kê Đơn Hàng</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Đơn hàng mới hôm nay</span>
                  <span className="text-2xl font-bold text-blue-600">
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
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Đơn hàng đang giao</span>
                  <span className="text-2xl font-bold text-green-600">
                    {orders.filter((order) => order.status === 'DELIVERING').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Đơn hàng đã hoàn thành</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {orders.filter((order) => order.status === 'DELIVERED').length}
                  </span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </DealerManagerLayout>
  );
};

export default DealerManagerDashboard;
