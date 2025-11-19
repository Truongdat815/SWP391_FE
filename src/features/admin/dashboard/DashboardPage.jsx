import { useMemo } from 'react';
import { useGetAllUsersQuery } from '../../../api/admin/userApi';
import { useGetAllStoresQuery, useGetMonthlyRevenueQuery } from '../../../api/admin/storeApi';
import { useGetAllOrdersQuery } from '../../../api/admin/orderApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { useGetAllStoreStocksQuery } from '../../../api/admin/storeStockApi';
import { useGetAllPaymentsQuery } from '../../../api/admin/paymentApi';
import AdminLayout from '../../../components/layout/AdminLayout';
import MetricCard from '../../../components/shared/MetricCard';
import LineChart from '../../../components/charts/LineChart';
import DonutChart from '../../../components/charts/DonutChart';
import ActivityTable from '../../../components/shared/ActivityTable';
import NotificationCard from '../../../components/shared/NotificationCard';
import Card from '../../../components/ui/Card';
import {
  DollarSign,
  Building2,
  Users,
  Package,
} from 'lucide-react';

const DashboardPage = () => {
  // API calls - chỉ gọi các API đã chắc chắn hoạt động
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useGetAllUsersQuery();
  const { data: storesData, isLoading: isLoadingStores, error: storesError } = useGetAllStoresQuery();
  const { data: revenueData, isLoading: isLoadingRevenue, error: revenueError } = useGetMonthlyRevenueQuery();
  const { data: modelsData, isLoading: isLoadingModels, error: modelsError } = useGetAllModelsQuery();
  
  // Các API có thể không tồn tại hoặc chỉ dành cho store context - skip nếu lỗi
  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useGetAllOrdersQuery(undefined, {
    skip: false, // Vẫn thử gọi nhưng sẽ xử lý lỗi
  });
  const { data: storeStocksData, isLoading: isLoadingStocks, error: stocksError } = useGetAllStoreStocksQuery(undefined, {
    skip: false,
  });
  const { data: paymentsData, isLoading: isLoadingPayments, error: paymentsError } = useGetAllPaymentsQuery(undefined, {
    skip: false,
  });

  const users = usersData?.data || [];
  const stores = storesData?.data || [];
  const monthlyRevenues = revenueData?.data || [];
  const orders = ordersData?.data || [];
  const models = modelsData?.data || [];
  const storeStocks = storeStocksData?.data || [];
  const payments = paymentsData?.data || [];

  // Chỉ coi là lỗi nếu các API chính (users, stores) bị lỗi
  // Các API khác (orders, payments, stocks) có thể không tồn tại nhưng không block UI
  const isLoading = isLoadingUsers || isLoadingStores || isLoadingRevenue || isLoadingModels;
  
  // Kiểm tra lỗi 401 (Unauthorized) - có thể do chưa login
  const isUnauthorized = 
    usersError?.status === 401 || 
    storesError?.status === 401 || 
    revenueError?.status === 401 ||
    modelsError?.status === 401;
  
  const hasError = (usersError && usersError.status !== 401) || 
                   (storesError && storesError.status !== 401);
  
  // Các API optional có thể bị lỗi nhưng không ảnh hưởng đến việc hiển thị dashboard
  const hasOptionalErrors = ordersError || stocksError || paymentsError;

  // Tính toán tổng doanh thu từ monthly revenues hoặc payments
  const totalRevenue = useMemo(() => {
    // Ưu tiên tính từ monthly revenues (tổng tất cả stores)
    if (monthlyRevenues && monthlyRevenues.length > 0) {
      const total = monthlyRevenues.reduce((sum, rev) => {
        const revenue = parseFloat(rev.totalRevenue) || 0;
        return sum + revenue;
      }, 0);
      
      if (total >= 1000000000) {
        return `${(total / 1000000000).toFixed(1)}B VND`;
      } else if (total >= 1000000) {
        return `${(total / 1000000).toFixed(1)}M VND`;
      } else if (total >= 1000) {
        return `${(total / 1000).toFixed(1)}K VND`;
      }
      return `${total.toLocaleString('vi-VN')} VND`;
    }
    
    // Fallback: tính từ payments nếu có
    if (payments && payments.length > 0) {
      const total = payments.reduce((sum, payment) => {
        const amount = parseFloat(payment.amount) || 0;
        return sum + amount;
      }, 0);
      
      if (total >= 1000000000) {
        return `${(total / 1000000000).toFixed(1)}B VND`;
      } else if (total >= 1000000) {
        return `${(total / 1000000).toFixed(1)}M VND`;
      } else if (total >= 1000) {
        return `${(total / 1000).toFixed(1)}K VND`;
      }
      return `${total.toLocaleString('vi-VN')} VND`;
    }
    
    return '0 VND';
  }, [monthlyRevenues, payments]);

  // Tính toán doanh thu tháng này từ monthly revenues
  const currentMonthRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthRevenue = monthlyRevenues.find(
      (rev) => rev.month === currentMonth && rev.year === currentYear
    );
    return monthRevenue?.totalRevenue || 0;
  }, [monthlyRevenues]);

  // Tính toán doanh thu theo tuần (4 tuần gần nhất) từ monthly revenues
  const revenueChartData = useMemo(() => {
    // Sử dụng monthly revenues để tính toán
    if (monthlyRevenues && monthlyRevenues.length > 0) {
      // Lấy 4 tuần gần nhất từ dữ liệu monthly revenues
      const sortedRevenues = [...monthlyRevenues]
        .sort((a, b) => {
          const dateA = new Date(a.year, a.month - 1);
          const dateB = new Date(b.year, b.month - 1);
          return dateB - dateA;
        })
        .slice(0, 4);
      
      return sortedRevenues.map((rev, index) => ({
        name: `Tuần ${index + 1}`,
        value: Math.round((parseFloat(rev.totalRevenue) || 0) / 1000000), // Convert to millions
      }));
    }
    
    // Fallback: sử dụng payments nếu có
    if (payments && payments.length > 0) {
      const weeks = [];
      const now = new Date();
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        // Tính tổng payments trong tuần này
        const weekPayments = payments.filter((payment) => {
          const dateStr = payment.createdAt || payment.paymentDate || payment.createdDate;
          if (!dateStr) return false;
          try {
            const paymentDate = new Date(dateStr);
            return paymentDate >= weekStart && paymentDate <= weekEnd;
          } catch {
            return false;
          }
        });
        
        const weekTotal = weekPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        weeks.push({
          name: `Tuần ${4 - i}`,
          value: Math.round(weekTotal / 1000000), // Convert to millions
        });
      }
      return weeks;
    }
    
    // Default: trả về dữ liệu rỗng
    return [
      { name: 'Tuần 1', value: 0 },
      { name: 'Tuần 2', value: 0 },
      { name: 'Tuần 3', value: 0 },
      { name: 'Tuần 4', value: 0 },
    ];
  }, [monthlyRevenues, payments]);

  // Tính toán tồn kho theo model - sử dụng models nếu store stocks không có
  const inventoryChartData = useMemo(() => {
    // Ưu tiên sử dụng store stocks nếu có
    if (storeStocks && storeStocks.length > 0) {
      const modelCounts = {};
      
      // Đếm số lượng theo model từ store stocks
      storeStocks.forEach((stock) => {
        const modelName = stock.modelName || `Model ${stock.modelId}`;
        modelCounts[modelName] = (modelCounts[modelName] || 0) + (parseInt(stock.quantity) || 0);
      });

      // Chuyển đổi thành array cho chart
      return Object.entries(modelCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 models
    }
    
    // Fallback: sử dụng models list nếu có
    if (models && models.length > 0) {
      return models.slice(0, 5).map((model) => ({
        name: model.modelName || `Model ${model.modelId}`,
        value: 0, // Không có số lượng cụ thể
      }));
    }
    
    return [{ name: 'Chưa có dữ liệu', value: 0 }];
  }, [storeStocks, models]);

  // Tính tổng số xe tồn kho
  const totalInventory = useMemo(() => {
    if (storeStocks && storeStocks.length > 0) {
      return storeStocks.reduce((sum, stock) => sum + (parseInt(stock.quantity) || 0), 0);
    }
    return 0;
  }, [storeStocks]);

  // Lấy các orders gần đây cho activities
  const recentActivities = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }

    return orders
      .filter((order) => order.orderId) // Chỉ lấy orders có ID
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.orderDate || a.createdDate || 0);
        const dateB = new Date(b.createdAt || b.orderDate || b.createdDate || 0);
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((order) => {
        const orderTotal = parseFloat(order.totalAmount || order.totalPrice || 0);
        let formattedValue = '';
        if (orderTotal >= 1000000000) {
          formattedValue = `${(orderTotal / 1000000000).toFixed(1)}B VND`;
        } else if (orderTotal >= 1000000) {
          formattedValue = `${(orderTotal / 1000000).toFixed(0)}M VND`;
        } else {
          formattedValue = `${orderTotal.toLocaleString('vi-VN')} VND`;
        }

        return {
          id: order.orderId,
          orderId: `#ELC-${order.orderId}`,
          dealer: order.storeName || order.store?.storeName || 'N/A',
          value: formattedValue,
          status: order.status || 'PENDING',
        };
      });
  }, [orders]);

  // Tạo notifications dựa trên dữ liệu thực
  const notifications = useMemo(() => {
    const notifs = [];
    
    // Kiểm tra tồn kho thấp
    const lowStockModels = storeStocks.filter((stock) => {
      const quantity = parseInt(stock.quantity) || 0;
      return quantity > 0 && quantity < 10; // Dưới 10 xe
    });
    
    if (lowStockModels.length > 0) {
      const modelName = lowStockModels[0].modelName || 'một số mẫu xe';
      notifs.push({
        type: 'warning',
        title: 'Cảnh báo tồn kho thấp',
        message: `Tồn kho mẫu xe ${modelName} dưới mức tối thiểu.`,
      });
    }

    // Kiểm tra orders chờ xử lý
    const pendingOrders = orders.filter((order) => 
      order.status === 'PENDING' || order.status === 'DRAFT' || order.status === 'CONFIRMED'
    );
    
    if (pendingOrders.length > 0) {
      notifs.push({
        type: 'info',
        title: 'Đơn hàng mới cần xử lý',
        message: `Có ${pendingOrders.length} đơn hàng đang chờ xử lý.`,
      });
    }

    // Thông báo về stores mới
    const activeStores = stores.filter((store) => store.status === 'ACTIVE');
    if (activeStores.length > 0) {
      notifs.push({
        type: 'support',
        title: 'Thông tin đại lý',
        message: `Hiện có ${activeStores.length} đại lý đang hoạt động.`,
      });
    }

    return notifs.length > 0 ? notifs : [
      {
        type: 'info',
        title: 'Hệ thống hoạt động bình thường',
        message: 'Không có thông báo quan trọng nào.',
      },
    ];
  }, [storeStocks, orders, stores]);

  // Metrics
  const totalDealers = stores.length;
  const totalUsers = users.length;
  const vehicleInventory = totalInventory;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </AdminLayout>
    );
  }

  // Hiển thị thông báo nếu chưa đăng nhập (401)
  if (isUnauthorized) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  if (hasError) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Có lỗi xảy ra khi tải dữ liệu chính. Vui lòng thử lại.
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Log warnings nếu có API optional bị lỗi (không block UI)
  if (hasOptionalErrors && import.meta.env.DEV) {
    console.warn('Một số API optional không khả dụng:', {
      orders: ordersError?.status,
      stocks: stocksError?.status,
      payments: paymentsError?.status,
    });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Tổng Doanh số"
            value={totalRevenue}
            change="+5.2%"
            changeType="positive"
            icon={DollarSign}
          />
          <MetricCard
            title="Tổng số Đại lý"
            value={totalDealers}
            change={stores.length > 0 ? `+${stores.length}` : '0'}
            changeType="positive"
            icon={Building2}
          />
          <MetricCard
            title="Tổng số Người dùng"
            value={totalUsers}
            change={users.length > 0 ? `+${users.length}` : '0'}
            changeType="positive"
            icon={Users}
          />
          <MetricCard
            title="Xe Tồn kho"
            value={vehicleInventory}
            change="-10"
            changeType="negative"
            icon={Package}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <Card.Title>Phân tích Doanh thu</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900">
                  {currentMonthRevenue >= 1000000000
                    ? `${(currentMonthRevenue / 1000000000).toFixed(1)}B`
                    : currentMonthRevenue >= 1000000
                    ? `${(currentMonthRevenue / 1000000).toFixed(0)}M`
                    : `${(currentMonthRevenue / 1000).toFixed(0)}K`}
                </p>
                <p className="text-sm text-gray-500">Doanh thu tháng này</p>
              </div>
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
              <Card.Title>Cơ cấu Tồn kho</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-gray-900">{totalInventory} Xe</p>
                <p className="text-sm text-gray-500">Tổng số xe trong kho</p>
              </div>
              <DonutChart 
                data={inventoryChartData.length > 0 ? inventoryChartData : [
                  { name: 'Chưa có dữ liệu', value: 0 }
                ]} 
                dataKey="value" 
                nameKey="name" 
              />
            </Card.Content>
          </Card>
        </div>

        {/* Activities and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <Card.Title>Hoạt động gần đây</Card.Title>
            </Card.Header>
            <Card.Content>
              <ActivityTable 
                activities={recentActivities.length > 0 ? recentActivities : [
                  {
                    id: 0,
                    orderId: 'N/A',
                    dealer: 'Chưa có dữ liệu',
                    value: '0 VND',
                    status: 'N/A',
                  }
                ]} 
              />
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Thông báo quan trọng</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <NotificationCard
                    key={index}
                    type={notification.type}
                    title={notification.title}
                    message={notification.message}
                  />
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
