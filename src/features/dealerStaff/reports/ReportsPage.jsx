import { useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, Car } from 'lucide-react';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Card from '../../../components/ui/Card';
import LineChart from '../../../components/charts/LineChart';
import DonutChart from '../../../components/charts/DonutChart';
import { useGetMyOrdersQuery } from '../../../api/dealerStaff/orderApi';
import { useGetAllCustomersQuery } from '../../../api/dealerStaff/customerApi';

const ReportsPage = () => {
  const { data: ordersData, isLoading: isLoadingOrders } = useGetMyOrdersQuery();
  const { data: customersData, isLoading: isLoadingCustomers } = useGetAllCustomersQuery();

  const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];
  const customers = Array.isArray(customersData?.data) ? customersData.data : [];

  const isLoading = isLoadingOrders || isLoadingCustomers;

  // Tính toán doanh số theo tháng (6 tháng gần nhất)
  const monthlyRevenue = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'short' });
      
      const monthOrders = orders.filter((order) => {
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
  }, [orders]);

  // Tính toán số lượng đơn hàng theo trạng thái
  const orderStatusData = useMemo(() => {
    const statusCounts = {
      DELIVERED: 0,
      CONFIRMED: 0,
      PENDING: 0,
      CANCELLED: 0,
      DRAFT: 0,
    };

    orders.forEach((order) => {
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
  }, [orders]);

  // Tính toán metrics
  const totalRevenue = useMemo(() => {
    const completed = orders.filter((o) => o.status === 'DELIVERED');
    const total = completed.reduce(
      (sum, order) => sum + (parseFloat(order.totalAmount || order.totalPrice) || 0),
      0
    );
    if (total >= 1000000000) {
      return `${(total / 1000000000).toFixed(2)} Tỷ`;
    }
    return `${(total / 1000000).toFixed(0)} Triệu`;
  }, [orders]);

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalCustomers = customers.length;

  if (isLoading) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </DealerStaffLayout>
    );
  }

  return (
    <DealerStaffLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo Cáo</h1>
          <p className="text-gray-600 mt-1">Xem thống kê và báo cáo hiệu suất bán hàng</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng Doanh số</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalRevenue}</p>
                </div>
                <DollarSign size={32} className="text-green-600" />
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
                <BarChart3 size={32} className="text-blue-600" />
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
                <TrendingUp size={32} className="text-purple-600" />
              </div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng Khách hàng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
                </div>
                <Car size={32} className="text-orange-600" />
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <Card.Title>Doanh số theo tháng</Card.Title>
              <p className="text-sm text-gray-500 mt-1">6 tháng gần nhất</p>
            </Card.Header>
            <Card.Content>
              <LineChart
                data={monthlyRevenue}
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
      </div>
    </DealerStaffLayout>
  );
};

export default ReportsPage;

