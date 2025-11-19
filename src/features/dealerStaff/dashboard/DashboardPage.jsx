import { useMemo } from 'react';
import { DollarSign, Car, UserPlus, Plus, FileText, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import MetricCard from '../../../components/shared/MetricCard';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LineChart from '../../../components/charts/LineChart';
import DonutChart from '../../../components/charts/DonutChart';
import { useGetMyOrdersQuery } from '../../../api/dealerStaff/orderApi';
import { useGetAllCustomersQuery } from '../../../api/dealerStaff/customerApi';
import { useGetAllAppointmentsQuery } from '../../../api/public/appointmentApi';

const DealerStaffDashboard = () => {
  const navigate = useNavigate();
  const { data: ordersData, isLoading: isLoadingOrders } = useGetMyOrdersQuery();
  const { data: customersData, isLoading: isLoadingCustomers } = useGetAllCustomersQuery();
  // Lấy tất cả appointments, sau đó filter theo staff hiện tại (hoặc dùng useGetAppointmentsByStaffQuery với staffId nếu có)
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useGetAllAppointmentsQuery();

  // Đảm bảo orders, customers, appointments luôn là array
  const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];
  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  const appointments = Array.isArray(appointmentsData?.data) ? appointmentsData.data : [];

  const isLoading = isLoadingOrders || isLoadingCustomers || isLoadingAppointments;

  // Tính toán metrics
  const totalRevenue = useMemo(() => {
    if (!Array.isArray(orders)) return '0 Triệu';
    const completed = orders.filter((o) => o.status === 'DELIVERED');
    const total = completed.reduce((sum, order) => sum + (parseFloat(order.totalAmount || order.totalPrice) || 0), 0);
    if (total >= 1000000000) {
      return `${(total / 1000000000).toFixed(2)} Tỷ`;
    }
    return `${(total / 1000000).toFixed(0)} Triệu`;
  }, [orders]);

  const carsSold = Array.isArray(orders) ? orders.filter((o) => o.status === 'DELIVERED').length : 0;
  const newCustomers = Array.isArray(customers) ? customers.filter((c) => {
    if (!c?.createdAt) return false;
    const created = new Date(c.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length : 0;

  // Order status counts
  const pendingConfirmation = Array.isArray(orders) ? orders.filter((o) => o.status === 'PENDING' || o.status === 'DRAFT').length : 0;
  const inProgress = Array.isArray(orders) ? orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING').length : 0;
  const pendingDelivery = Array.isArray(orders) ? orders.filter((o) => o.status === 'READY_FOR_DELIVERY').length : 0;
  const completed = Array.isArray(orders) ? orders.filter((o) => o.status === 'DELIVERED').length : 0;

  // Doanh số theo tháng (6 tháng gần nhất)
  const monthlyRevenueData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'short' });
      
      const monthOrders = Array.isArray(orders) ? orders.filter((order) => {
        if (!order.createdAt && !order.orderDate) return false;
        const orderDate = new Date(order.createdAt || order.orderDate);
        return (
          orderDate.getMonth() === monthDate.getMonth() &&
          orderDate.getFullYear() === monthDate.getFullYear() &&
          order.status === 'DELIVERED'
        );
      }) : [];
      
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

  // Phân bố đơn hàng theo trạng thái
  const orderStatusData = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const statusCounts = {
      DELIVERED: 0,
      CONFIRMED: 0,
      PENDING: 0,
      DRAFT: 0,
      CANCELLED: 0,
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
        name: status === 'DELIVERED' ? 'Hoàn thành' :
              status === 'CONFIRMED' ? 'Đã xác nhận' :
              status === 'PENDING' ? 'Chờ duyệt' :
              status === 'DRAFT' ? 'Nháp' :
              status === 'CANCELLED' ? 'Đã hủy' : status,
        value: count,
      }));
  }, [orders]);

  // Recent activities từ orders thực tế
  const recentActivities = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders
      .filter((order) => order.orderId)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.orderDate || 0);
        const dateB = new Date(b.createdAt || b.orderDate || 0);
        return dateB - dateA;
      })
      .slice(0, 3)
      .map((order) => {
        const timeAgo = (() => {
          const orderDate = new Date(order.createdAt || order.orderDate);
          const now = new Date();
          const diffMs = now - orderDate;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          
          if (diffMins < 60) return `${diffMins} phút trước`;
          if (diffHours < 24) return `${diffHours} giờ trước`;
          return `${diffDays} ngày trước`;
        })();

        return {
          type: order.status === 'DELIVERED' ? 'order_completed' :
                order.status === 'CONFIRMED' ? 'order_approved' :
                'order_created',
          message: order.status === 'DELIVERED' 
            ? `Đơn hàng #${order.orderId} đã hoàn thành.`
            : order.status === 'CONFIRMED'
            ? `Đơn hàng #${order.orderId} đã được duyệt.`
            : `Đơn hàng #${order.orderId} đã được tạo.`,
          time: timeAgo,
          icon: order.status === 'DELIVERED' ? 'check' :
                order.status === 'CONFIRMED' ? 'check' :
                'file',
        };
      });
  }, [orders]);

  // Upcoming appointments
  const upcomingAppointments = useMemo(() => {
    if (!Array.isArray(appointments)) return [];
    const now = new Date();
    return appointments
      .filter((apt) => {
        if (!apt?.appointmentDate) return false;
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= now;
      })
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 3);
  }, [appointments]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Ngày mai';
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
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

  return (
    <DealerStaffLayout>
      <div className="p-6 space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, Anh A!
          </h2>
          <p className="text-gray-600 mt-1">
            Đây là tổng quan công việc của bạn hôm nay.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Tổng doanh số"
            value={totalRevenue}
            change=""
            changeType="neutral"
            icon={DollarSign}
          />
          <MetricCard
            title="Số xe đã bán"
            value={carsSold}
            change=""
            changeType="neutral"
            icon={Car}
          />
          <MetricCard
            title="Khách hàng mới"
            value={newCustomers}
            change=""
            changeType="neutral"
            icon={UserPlus}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <Card.Title>Doanh số theo tháng</Card.Title>
              <p className="text-sm text-gray-500 mt-1">6 tháng gần nhất</p>
            </Card.Header>
            <Card.Content>
              <LineChart
                data={monthlyRevenueData}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Trạng thái đơn hàng</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <Card.Content className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Chờ xác nhận</p>
                  <p className="text-3xl font-bold text-blue-600">{pendingConfirmation}</p>
                </Card.Content>
              </Card>
              <Card>
                <Card.Content className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Đang xử lý</p>
                  <p className="text-3xl font-bold text-orange-600">{inProgress}</p>
                </Card.Content>
              </Card>
              <Card>
                <Card.Content className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Chờ giao</p>
                  <p className="text-3xl font-bold text-purple-600">{pendingDelivery}</p>
                </Card.Content>
              </Card>
              <Card>
                <Card.Content className="p-4">
                  <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
                  <p className="text-3xl font-bold text-green-600">{completed}</p>
                </Card.Content>
              </Card>
            </div>

            {/* Recent Activities */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
              <Card>
                <Card.Content className="p-4 space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.icon === 'check' ? 'bg-green-100' :
                          activity.icon === 'file' ? 'bg-blue-100' :
                          'bg-orange-100'
                        }`}>
                          {activity.icon === 'check' && <span className="text-green-600">✓</span>}
                          {activity.icon === 'file' && <FileText size={16} className="text-blue-600" />}
                          {activity.icon === 'user' && <UserPlus size={16} className="text-orange-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">Chưa có hoạt động nào</p>
                  )}
                </Card.Content>
              </Card>
            </div>
          </div>

          {/* Quick Actions & Appointments */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Hành động nhanh</h3>
              <Card>
                <Card.Content className="p-4 space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => navigate('/dealer-staff/quotation')}
                  >
                    <Plus size={20} className="mr-2" />
                    Tạo Báo Giá
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/dealer-staff/customers')}
                  >
                    <UserPlus size={20} className="mr-2" />
                    Thêm Khách Hàng
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/dealer-staff/appointments')}
                  >
                    <Calendar size={20} className="mr-2" />
                    Tạo Lịch Lái Thử
                  </Button>
                </Card.Content>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lịch hẹn sắp tới</h3>
              <Card>
                <Card.Content className="p-4 space-y-4">
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Không có lịch hẹn sắp tới</p>
                  ) : (
                    upcomingAppointments.map((apt, index) => (
                      <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start gap-3">
                          <Calendar size={20} className="text-blue-600 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {apt.modelName || 'Lái thử xe'} - {apt.customerName || 'Khách hàng'}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span>{formatDate(apt.appointmentDate)}</span>
                              <span>{formatTime(apt.appointmentDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </Card.Content>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DealerStaffLayout>
  );
};

export default DealerStaffDashboard;
