import { useMemo } from 'react';
import { Package, ShoppingCart, CheckCircle, Truck } from 'lucide-react';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import MetricCard from '../../../components/shared/MetricCard';
import Card from '../../../components/ui/Card';
import LineChart from '../../../components/charts/LineChart';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { useGetAllDealerOrdersQuery } from '../../../api/evmStaff/dealerOrdersApi';
import { useGetAllModelColorsQuery } from '../../../api/evmStaff/productApi';

const EVMStaffDashboard = () => {
  const { data: modelsData, isLoading: isLoadingModels, error: modelsError } = useGetAllModelsQuery();
  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useGetAllDealerOrdersQuery();
  const { data: modelColorsData, isLoading: isLoadingColors, error: colorsError } = useGetAllModelColorsQuery();

  const models = modelsData?.data || [];
  // Xử lý orders: nếu có lỗi 404 (store not found), vẫn hiển thị mảng rỗng
  const orders = ordersError?.status === 404 ? [] : (ordersData?.data || []);
  const modelColors = modelColorsData?.data || [];

  const isLoading = isLoadingModels || isLoadingOrders || isLoadingColors;
  
  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = 
    modelsError?.status === 401 || 
    ordersError?.status === 401 || 
    colorsError?.status === 401;
  
  // Kiểm tra xem lỗi có phải là "Không tìm thấy store" (404) không
  // EVM Staff có thể không có storeId, nên lỗi này có thể bỏ qua
  const isStoreNotFoundError = (error) => {
    return error?.status === 404 && 
           (error?.data?.message?.includes('Không tìm thấy store') ||
            error?.data?.message?.includes('store') ||
            error?.data?.code === 1004);
  };
  
  // Kiểm tra tất cả các lỗi (trừ 401 và lỗi "Không tìm thấy store" cho orders)
  // Lỗi "Không tìm thấy store" chỉ bỏ qua cho orders vì EVM Staff có thể không có storeId
  const hasError = 
    (modelsError && modelsError.status !== 401 && modelsError.status !== undefined) || 
    (ordersError && ordersError.status !== 401 && ordersError.status !== undefined && !isStoreNotFoundError(ordersError)) ||
    (colorsError && colorsError.status !== 401 && colorsError.status !== undefined);

  // Tính toán metrics
  const totalModels = models.length;
  const totalVariants = modelColors.length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === 'PENDING' || order.status === 'DRAFT'
  ).length;
  const completedOrders = orders.filter((order) => order.status === 'DELIVERED').length;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  // Không dùng store-stocks nữa, dùng inventory-transactions thay thế
  const deliveredVehicles = 0; // Sẽ được tính từ inventory-transactions nếu cần
  const uniqueDealers = 0; // Sẽ được tính từ inventory-transactions nếu cần

  // Order trend chart data (6 tháng gần nhất)
  const orderTrendData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'short' });
      
      const monthOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        return (
          orderDate.getMonth() === monthDate.getMonth() &&
          orderDate.getFullYear() === monthDate.getFullYear()
        );
      });
      
      months.push({
        name: monthName,
        value: monthOrders.length,
      });
    }
    return months.length > 0
      ? months
      : [
          { name: 'Tháng 1', value: 0 },
          { name: 'Tháng 2', value: 0 },
          { name: 'Tháng 3', value: 0 },
          { name: 'Tháng 4', value: 0 },
          { name: 'Tháng 5', value: 0 },
          { name: 'Tháng 6', value: 0 },
        ];
  }, [orders]);

  if (isLoading) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </EVMStaffLayout>
    );
  }

  // Hiển thị thông báo nếu chưa đăng nhập (401)
  if (isUnauthorized) {
    return (
      <EVMStaffLayout>
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
      </EVMStaffLayout>
    );
  }

  if (hasError) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
          </div>
        </div>
      </EVMStaffLayout>
    );
  }

  return (
    <EVMStaffLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tổng quan sản xuất</h1>
            <p className="text-gray-600 mt-1">
              Chào mừng trở lại, xem nhanh các hoạt động gần đây.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
            <span className="text-sm text-gray-600">6 tháng qua</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Tổng sản phẩm"
            value={`${totalModels} mẫu, ${totalVariants} variants`}
            change=""
            changeType="neutral"
            icon={Package}
          />
          <MetricCard
            title="Tổng đơn hàng"
            value={`${totalOrders} (${pendingOrders} chờ)`}
            change=""
            changeType="neutral"
            icon={ShoppingCart}
          />
          <MetricCard
            title="Đã hoàn thành"
            value={`${completionRate}%`}
            change=""
            changeType="neutral"
            icon={CheckCircle}
          />
          <MetricCard
            title="Xe đã giao đại lý"
            value={`${deliveredVehicles} xe (${uniqueDealers} đại lý)`}
            change=""
            changeType="neutral"
            icon={Truck}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <div>
                  <Card.Title>Xu Hướng Đơn Hàng</Card.Title>
                  <p className="text-sm text-gray-500 mt-1">6 tháng gần nhất</p>
                </div>
                <span className="text-green-600 font-medium">+5.2%</span>
              </div>
            </Card.Header>
            <Card.Content>
              <LineChart
                data={orderTrendData}
                dataKey="value"
                name="Số đơn hàng"
                color="#3B82F6"
              />
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Top 5 Mẫu Xe Phổ Biến</Card.Title>
              <p className="text-sm text-gray-500 mt-1">Dựa trên số lượng biến thể</p>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {models.slice(0, 5).map((model, index) => {
                  const variantCount = modelColors.filter(
                    (mc) => mc.modelId === model.modelId
                  ).length;
                  return (
                    <div key={model.modelId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                        <span className="font-medium text-gray-900">{model.modelName}</span>
                      </div>
                      <span className="text-blue-600 font-semibold">{variantCount} variants</span>
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Order Status Ratio */}
        <Card>
          <Card.Header>
            <Card.Title>Tỷ Lệ Trạng Thái Đơn Hàng</Card.Title>
            <p className="text-sm text-gray-500 mt-1">Dựa trên tổng số đơn hàng</p>
          </Card.Header>
          <Card.Content>
            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Đang tải dữ liệu...</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {orders.filter((o) => 
                      o.status === 'PENDING' || 
                      o.status === 'DRAFT' ||
                      o.status?.toUpperCase() === 'PENDING'
                    ).length}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Đang xử lý</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter((o) => 
                      o.status === 'PROCESSING' || 
                      o.status === 'CONFIRMED' ||
                      o.status?.toUpperCase() === 'PROCESSING'
                    ).length}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Hoàn thành</p>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter((o) => 
                      o.status === 'DELIVERED' || 
                      o.status === 'COMPLETED' ||
                      o.status?.toUpperCase() === 'DELIVERED' ||
                      o.status?.toUpperCase() === 'COMPLETED'
                    ).length}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Đã hủy</p>
                  <p className="text-2xl font-bold text-red-600">
                    {orders.filter((o) => 
                      o.status === 'CANCELLED' || 
                      o.status === 'REJECTED' ||
                      o.status?.toUpperCase() === 'CANCELLED' ||
                      o.status?.toUpperCase() === 'REJECTED'
                    ).length}
                  </p>
                </div>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </EVMStaffLayout>
  );
};

export default EVMStaffDashboard;
