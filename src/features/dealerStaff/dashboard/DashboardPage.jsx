import { useMemo } from 'react';
import { DollarSign, Car, UserPlus, Plus, FileText, Calendar, TrendingUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LineChart from '../../../components/charts/LineChart';
import { useGetMyOrdersQuery, useGetOrdersByStaffIdQuery } from '../../../api/dealerStaff/orderApi';
import { useGetAllCustomersQuery } from '../../../api/dealerStaff/customerApi';
import { useGetAllAppointmentsQuery } from '../../../api/public/appointmentApi';
import { useGetAllFeedbacksQuery } from '../../../api/dealerStaff/feedbackApi';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { formatCurrency } from '../../../utils/formatters';

const DealerStaffDashboard = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const staffId = user?.userId || user?.staffId || user?.id;
  
  // Debug: Log user và staffId
  console.log('user:', user);
  console.log('staffId:', staffId);

  const { data: ordersData, isLoading: isLoadingOrders } = useGetMyOrdersQuery();
  const { data: staffOrdersData, isLoading: isLoadingStaffOrders, error: staffOrdersError } = useGetOrdersByStaffIdQuery(staffId, {
    skip: !staffId,
  });
  
  // Debug: Log error nếu có
  if (staffOrdersError) {
    console.error('staffOrdersError:', staffOrdersError);
  }
  const { data: customersData, isLoading: isLoadingCustomers } = useGetAllCustomersQuery();
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useGetAllAppointmentsQuery();
  const { data: feedbackData, isLoading: isLoadingFeedback } = useGetAllFeedbacksQuery();

  // Đảm bảo orders, customers, appointments luôn là array
  // Ưu tiên sử dụng orders từ staffOrdersData vì có đầy đủ thông tin hơn
  const orders = Array.isArray(staffOrdersData?.orders) ? staffOrdersData.orders :
                 Array.isArray(staffOrdersData?.data?.orders) ? staffOrdersData.data.orders : 
                 Array.isArray(ordersData?.data) ? ordersData.data : [];
  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  const appointments = Array.isArray(appointmentsData?.data) ? appointmentsData.data : [];
  const feedbacks = Array.isArray(feedbackData?.data) ? feedbackData.data : [];

  // Sử dụng dữ liệu từ API /orders/staff/{staffId} - thử các cách truy cập khác nhau
  const totalOrders = staffOrdersData?.totalOrders || staffOrdersData?.data?.totalOrders || 0;
  const monthlyRevenue = staffOrdersData?.monthlyRevenue || staffOrdersData?.data?.monthlyRevenue || 0;

  // Debug: Log dữ liệu quan trọng
  console.log('staffOrdersData:', staffOrdersData);
  console.log('totalOrders:', totalOrders);
  console.log('monthlyRevenue:', monthlyRevenue);

  const isLoading = isLoadingOrders || isLoadingStaffOrders || isLoadingCustomers || isLoadingAppointments || isLoadingFeedback;

  // Tính toán metrics cho hiển thị chart - sử dụng monthlyRevenue từ API
  const totalRevenue = useMemo(() => {
    if (monthlyRevenue >= 1000000000) {
      return `${(monthlyRevenue / 1000000000).toFixed(2)} Tỷ`;
    }
    return `${(monthlyRevenue / 1000000).toFixed(0)} Triệu`;
  }, [monthlyRevenue]);

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

  // Doanh số theo tháng (6 tháng gần nhất) - tính hoàn toàn từ orders data
  const monthlyRevenueChartData = useMemo(() => {
    const months = [];
    const now = new Date();
    const revenueStatuses = ['DEPOSITED', 'FULLY_PAID', 'DELIVERED'];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'short' });

      // Tính từ orders data - sử dụng cùng logic với trang quản lý đơn hàng
      const monthOrders = Array.isArray(orders) ? orders.filter((order) => {
        if (!order.createdAt && !order.orderDate) return false;
        const orderDate = new Date(order.createdAt || order.orderDate);
        return (
          orderDate.getMonth() === monthDate.getMonth() &&
          orderDate.getFullYear() === monthDate.getFullYear() &&
          revenueStatuses.includes(order.status)
        );
      }) : [];

      const total = monthOrders.reduce(
        (sum, order) => sum + (order.totalPayment || 0),
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

  // Tính toán feedback stats - PHẢI ĐẶT TRƯỚC EARLY RETURN
  const feedbackStats = useMemo(() => {
    const total = feedbacks.length;
    const pending = feedbacks.filter(f => f.status === 'PENDING' || !f.status).length;
    const resolved = feedbacks.filter(f => f.status === 'RESOLVED' || f.status === 'COMPLETED').length;
    const avgRating = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / (total || 1);
    return { total, pending, resolved, avgRating: avgRating.toFixed(1) };
  }, [feedbacks]);

  // Recent feedbacks - PHẢI ĐẶT TRƯỚC EARLY RETURN
  const recentFeedbacks = useMemo(() => {
    return feedbacks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  }, [feedbacks]);

  // Phân bố rating - PHẢI ĐẶT TRƯỚC EARLY RETURN
  const ratingDistribution = useMemo(() => {
    const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
    feedbacks.forEach(f => {
      if (f.rating >= 1 && f.rating <= 5) {
        distribution[f.rating - 1]++;
      }
    });
    return distribution;
  }, [feedbacks]);

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
    <DealerStaffLayout
      title="Dashboard - Tổng quan hiệu suất"
      description="Chào mừng trở lại, cùng xem hiệu suất của bạn hôm nay."
    >
      <div className="mx-auto max-w-[90rem] px-0 py-4 pl-10 pr-10 pt-8 space-y-4">
        {/* Filter Actions */}
        

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-base font-medium">Tổng Đơn Hàng</p>
            <p className="text-slate-900 text-3xl font-bold tracking-tight">
              {isLoadingStaffOrders ? 'Đang tải...' : (totalOrders || 'N/A')}
            </p>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp size={16} />
              <p className="text-sm font-medium">+15% so với tháng trước</p>
            </div>
          </Card>
          <Card className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-base font-medium">Tổng Doanh Thu (Tháng này)</p>
            <p className="text-slate-900 text-3xl font-bold tracking-tight">
              {isLoadingStaffOrders ? 'Đang tải...' : (monthlyRevenue ? formatCurrency(monthlyRevenue) : 'N/A')}
            </p>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp size={16} />
              <p className="text-sm font-medium">+8.5% so với tháng trước</p>
            </div>
          </Card>
          <Card className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-base font-medium">Lịch Lái Thử (Sắp tới)</p>
            <p className="text-slate-900 text-3xl font-bold tracking-tight">{upcomingAppointments.length}</p>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp size={16} />
              <p className="text-sm font-medium">+3 so với tuần trước</p>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
            <p className="text-slate-800 text-lg font-semibold">Doanh thu theo tháng</p>
            <p className="text-slate-900 text-3xl font-bold tracking-tight truncate">{totalRevenue} VNĐ</p>
            <div className="flex gap-2">
              <p className="text-slate-500 text-sm font-normal">3 tháng gần nhất</p>
              <p className="text-green-600 text-sm font-medium">+12.5%</p>
            </div>
            <div className="flex min-h-[220px] flex-1 flex-col pt-4">
              <LineChart
                data={monthlyRevenueChartData}
                dataKey="value"
                name="Doanh số (triệu VND)"
                color="#1392ec"
              />
            </div>
          </Card>

          <Card className="lg:col-span-2 flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
            <p className="text-slate-800 text-lg font-semibold">Phân bố đánh giá</p>
            <p className="text-slate-900 text-3xl font-bold tracking-tight truncate">{feedbackStats.avgRating} sao</p>
            <div className="flex gap-2">
              <p className="text-slate-500 text-sm font-normal">Tháng này</p>
              <p className="text-green-600 text-sm font-medium">+0.2</p>
            </div>
            <div className="grid min-h-[220px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3 pt-4">
              {ratingDistribution.map((count, index) => {
                const maxCount = Math.max(...ratingDistribution) || 1;
                const height = (count / maxCount) * 90;
                return (
                  <div key={index} className="contents">
                    <div
                      className={`w-full rounded-t ${index === 4 ? 'bg-primary' : 'bg-primary/20'}`}
                      style={{ height: `${height}%` }}
                    />
                    <p className="text-slate-500 text-xs font-medium">{index + 1} Sao</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Customer Feedback Section */}
        <Card className="rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-slate-800 text-lg font-semibold">Phản Hồi Khách Hàng</h3>
          </div>
          {/* Feedback Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-y border-slate-200">
            <div className="p-6 text-center border-r border-slate-200">
              <p className="text-slate-900 text-2xl font-bold">{feedbackStats.total}</p>
              <p className="text-slate-500 text-sm">Tổng số</p>
            </div>
            <div className="p-6 text-center md:border-r border-slate-200">
              <p className="text-amber-500 text-2xl font-bold">{feedbackStats.pending}</p>
              <p className="text-slate-500 text-sm">Đang chờ</p>
            </div>
            <div className="p-6 text-center border-r border-slate-200">
              <p className="text-green-600 text-2xl font-bold">{feedbackStats.resolved}</p>
              <p className="text-slate-500 text-sm">Đã xử lý</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-slate-900 text-2xl font-bold">{feedbackStats.avgRating}/5</p>
              <p className="text-slate-500 text-sm">Đánh giá TB</p>
            </div>
          </div>
          {/* Recent Feedback List */}
          <div className="p-6">
            <h4 className="text-slate-800 text-base font-medium mb-4">Phản hồi gần đây</h4>
            <div className="flow-root">
              {recentFeedbacks.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {recentFeedbacks.map((feedback, index) => (
                    <li key={index} className="py-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-slate-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-700">
                              {feedback.customerName?.charAt(0) || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {feedback.customerName || 'Khách hàng'}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            "{feedback.comment || feedback.feedbackText || 'Không có nhận xét'}"
                          </p>
                        </div>
                        <div className="inline-flex items-center text-sm font-semibold text-amber-500">
                          {feedback.rating || 5} <Star size={16} className="ml-1 text-amber-400 fill-amber-400" />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">Chưa có phản hồi nào</p>
              )}
            </div>
          </div>
        </Card>

      </div>
    </DealerStaffLayout>
  );
};

export default DealerStaffDashboard;
