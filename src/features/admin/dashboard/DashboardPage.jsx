import { useGetAllUsersQuery } from '../../../api/admin/userApi';
import { useGetAllStoresQuery } from '../../../api/admin/storeApi';
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
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useGetAllUsersQuery();
  const { data: storesData, isLoading: isLoadingStores, error: storesError } = useGetAllStoresQuery();

  const users = usersData?.data || [];
  const stores = storesData?.data || [];

  const isLoading = isLoadingUsers || isLoadingStores;
  const hasError = usersError || storesError;

  // Tính toán metrics từ dữ liệu thực
  const totalRevenue = '15.2B VND'; // TODO: Lấy từ API revenue
  const totalDealers = stores.length;
  const totalUsers = users.length;
  const vehicleInventory = 580; // TODO: Lấy từ API inventory

  const revenueData = [
    { name: 'Tuần 1', value: 200 },
    { name: 'Tuần 2', value: 180 },
    { name: 'Tuần 3', value: 250 },
    { name: 'Tuần 4', value: 220 },
  ];

  const inventoryData = [
    { name: 'Model X', value: 70 },
    { name: 'Model 3', value: 20 },
    { name: 'Model S', value: 10 },
  ];

  const activities = [
    {
      id: 1,
      orderId: '#ELC-8934',
      dealer: 'Đại lý A',
      value: '1.2B VND',
      status: 'DELIVERED',
    },
    {
      id: 2,
      orderId: '#ELC-8933',
      dealer: 'Đại lý C',
      value: '950M VND',
      status: 'PROCESSING',
    },
    {
      id: 3,
      orderId: '#ELC-8932',
      dealer: 'Đại lý B',
      value: '2.1B VND',
      status: 'DELIVERED',
    },
    {
      id: 4,
      orderId: '#ELC-8931',
      dealer: 'Đại lý D',
      value: '450M VND',
      status: 'CANCELLED',
    },
  ];

  const notifications = [
    {
      type: 'warning',
      title: 'Cảnh báo tồn kho thấp',
      message: 'Tồn kho mẫu xe Model S dưới mức tối thiểu.',
    },
    {
      type: 'info',
      title: 'Đơn hàng mới cần xử lý',
      message: 'Đơn hàng #ELC-8933 từ Đại lý C đang chờ duyệt.',
    },
    {
      type: 'support',
      title: 'Yêu cầu hỗ trợ',
      message: 'Đại lý E đã gửi một yêu cầu hỗ trợ kỹ thuật.',
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </AdminLayout>
    );
  }

  if (hasError) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
          </div>
        </div>
      </AdminLayout>
    );
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
                <p className="text-3xl font-bold text-gray-900">850M</p>
                <p className="text-sm text-gray-500">Doanh thu tháng này</p>
              </div>
              <LineChart
                data={revenueData}
                dataKey="value"
                name="Doanh thu"
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
                <p className="text-3xl font-bold text-gray-900">580 Xe</p>
                <p className="text-sm text-gray-500">Tổng số xe trong kho</p>
              </div>
              <DonutChart data={inventoryData} dataKey="value" nameKey="name" />
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
              <ActivityTable activities={activities} />
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
