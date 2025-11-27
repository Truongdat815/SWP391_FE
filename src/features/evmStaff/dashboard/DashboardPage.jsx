import { useMemo } from 'react';
import { Package, ShoppingCart, CheckCircle, Truck, TrendingUp, TrendingDown, Activity, Calendar, Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import MetricCard from '../../../components/shared/MetricCard';
import Card from '../../../components/ui/Card';
import LineChart from '../../../components/charts/LineChart';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { useGetAllModelColorsQuery } from '../../../api/evmStaff/productApi';
import { useGetAllInventoryTransactionsQuery } from '../../../api/evmStaff/inventoryApi';

const EVMStaffDashboard = () => {
  const { data: modelsData, isLoading: isLoadingModels, error: modelsError } = useGetAllModelsQuery();
  const { data: modelColorsData, isLoading: isLoadingColors, error: colorsError } = useGetAllModelColorsQuery();
  const { data: transactionsData, isLoading: isLoadingTransactions, error: transactionsError } = useGetAllInventoryTransactionsQuery();

  const models = modelsData?.data || [];
  const modelColors = modelColorsData?.data || [];
  // Xử lý inventory transactions: nếu có lỗi 404 hoặc không có data, vẫn hiển thị mảng rỗng
  const transactions = (transactionsError?.status === 404 || !transactionsData?.data) ? [] : (transactionsData?.data || []);

  const isLoading = isLoadingModels || isLoadingColors || isLoadingTransactions;
  
  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = 
    modelsError?.status === 401 || 
    colorsError?.status === 401 ||
    transactionsError?.status === 401;
  
  // Kiểm tra xem lỗi có phải là "Không tìm thấy store" (404) không
  // EVM Staff có thể không có storeId, nên lỗi này có thể bỏ qua
  const isStoreNotFoundError = (error) => {
    return error?.status === 404 && 
           (error?.data?.message?.includes('Không tìm thấy store') ||
            error?.data?.message?.includes('store') ||
            error?.data?.code === 1004);
  };
  
  // Kiểm tra tất cả các lỗi (trừ 401 và lỗi "Không tìm thấy store" cho transactions)
  const hasError = 
    (modelsError && modelsError.status !== 401 && modelsError.status !== undefined) || 
    (colorsError && colorsError.status !== 401 && colorsError.status !== undefined) ||
    (transactionsError && transactionsError.status !== 401 && transactionsError.status !== undefined && !isStoreNotFoundError(transactionsError));

  // Tính toán metrics từ inventory-transactions
  const totalModels = models.length;
  const totalVariants = modelColors.length;
  const totalOrders = transactions.length;
  const pendingOrders = transactions.filter(
    (t) => t.status === 'PENDING' || t.status === 'DRAFT'
  ).length;
  const completedOrders = transactions.filter(
    (t) => t.status === 'DELIVERED' || t.status === 'COMPLETED'
  ).length;
  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  
  const deliveredTransactions = transactions.filter(
    (t) => t.status === 'DELIVERED' || t.status === 'COMPLETED'
  );
  const deliveredVehicles = deliveredTransactions.reduce((sum, t) => sum + (t.importQuantity || 0), 0);
  const uniqueDealers = new Set(deliveredTransactions.map((t) => t.storeId).filter(Boolean)).size;

  // Order trend chart data (6 tháng gần nhất)
  const orderTrendData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'short' });
      
      const monthTransactions = transactions.filter((t) => {
        const orderDate = new Date(t.orderDate);
        return (
          orderDate.getMonth() === monthDate.getMonth() &&
          orderDate.getFullYear() === monthDate.getFullYear()
        );
      });
      
      months.push({
        name: monthName,
        value: monthTransactions.length,
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
  }, [transactions]);

  // Tính % tăng trưởng đơn hàng
  const orderGrowthRate = useMemo(() => {
    if (orderTrendData.length < 2) return 0;
    const currentMonth = orderTrendData[orderTrendData.length - 1]?.value || 0;
    const previousMonth = orderTrendData[orderTrendData.length - 2]?.value || 0;
    if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
    return Math.round(((currentMonth - previousMonth) / previousMonth) * 100 * 10) / 10;
  }, [orderTrendData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      </EVMStaffLayout>
    );
  }

  if (isUnauthorized) {
    return (
      <EVMStaffLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Phiên đăng nhập hết hạn</h2>
            <p className="text-gray-500 mt-2">Vui lòng đăng nhập lại để tiếp tục.</p>
          </div>
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30"
          >
            Đăng nhập ngay
          </a>
        </div>
      </EVMStaffLayout>
    );
  }

  if (hasError) {
    return (
      <EVMStaffLayout>
        <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
          <div className="text-red-500 text-xl font-medium">Đã có lỗi xảy ra</div>
          <p className="text-gray-500">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
        </div>
      </EVMStaffLayout>
    );
  }

  return (
    <EVMStaffLayout>
      <motion.div 
        className="space-y-4 p-4 bg-gray-50/50 h-full overflow-y-auto scrollbar-hide"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Row 1: Tổng sản phẩm, Tổng đơn hàng, Chờ xử lý, Đang xử lý */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricCard
            title="Tổng sản phẩm"
            value={`${totalModels} Mẫu xe`}
            change={`${totalVariants} biến thể`}
            changeType="neutral"
            icon={Package}
            compact
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md"
          />
          <MetricCard
            title="Tổng đơn hàng"
            value={totalOrders}
            change={`${pendingOrders} chờ xử lý`}
            changeType="neutral"
            icon={ShoppingCart}
            compact
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md"
          />
          <div className={`p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between transition-all cursor-default`}>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.filter(t => ['PENDING', 'DRAFT'].includes(t.status)).length}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">Đang chờ duyệt</p>
            </div>
            <div className="p-2.5 rounded-lg bg-yellow-50 flex-shrink-0">
              <Clock size={20} className="text-yellow-600" />
            </div>
          </div>
          <div className={`p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between transition-all cursor-default`}>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Đang xử lý</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.filter(t => ['PROCESSING', 'CONFIRMED', 'ACCEPTED', 'SHIPPING'].includes(t.status)).length}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">Đang thực hiện</p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 flex-shrink-0">
              <Loader2 size={20} className="text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Row 2: Tỷ lệ hoàn thành, Xe đã giao, Hoàn thành, Đã hủy */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <MetricCard
            title="Tỷ lệ hoàn thành"
            value={`${completionRate}%`}
            change="Trên tổng đơn"
            changeType="positive"
            icon={CheckCircle}
            compact
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md"
          />
          <MetricCard
            title="Xe đã giao"
            value={deliveredVehicles}
            change={`${uniqueDealers} đại lý`}
            changeType="neutral"
            icon={Truck}
            compact
            className="bg-white border border-gray-200 shadow-sm hover:shadow-md"
          />
          <div className={`p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between transition-all cursor-default`}>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.filter(t => ['DELIVERED', 'COMPLETED'].includes(t.status)).length}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">Đã giao hàng</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 flex-shrink-0">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
          </div>
          <div className={`p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-between transition-all cursor-default`}>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Đã hủy</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.filter(t => ['CANCELLED', 'REJECTED'].includes(t.status)).length}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">Không thực hiện</p>
            </div>
            <div className="p-2.5 rounded-lg bg-red-50 flex-shrink-0">
              <XCircle size={20} className="text-red-600" />
            </div>
          </div>
        </motion.div>

        {/* Charts & Top Models */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full border-0 shadow-xl shadow-gray-100/50 overflow-hidden">
              <Card.Header className="border-b border-gray-50 bg-white px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 rounded-lg">
                      <Activity size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <Card.Title className="text-base font-bold text-gray-800">Xu Hướng Đơn Hàng</Card.Title>
                      <p className="text-xs text-gray-500">Thống kê theo tháng</p>
                    </div>
                  </div>
                  {orderGrowthRate !== 0 && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      orderGrowthRate > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {orderGrowthRate > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(orderGrowthRate)}%
                    </div>
                  )}
                </div>
              </Card.Header>
              <Card.Content className="p-4">
                <div className="h-[200px] w-full">
                  <LineChart
                    data={orderTrendData}
                    dataKey="value"
                    name="Đơn hàng"
                    color="#4F46E5"
                    height={200}
                  />
                </div>
              </Card.Content>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full border-0 shadow-xl shadow-gray-100/50 overflow-hidden">
              <Card.Header className="border-b border-gray-50 bg-white px-4 py-3">
                <Card.Title className="text-base font-bold text-gray-800">Top Mẫu Xe</Card.Title>
                <p className="text-xs text-gray-500">Phổ biến nhất theo biến thể</p>
              </Card.Header>
              <Card.Content className="p-0">
                <div className="divide-y divide-gray-50">
                  {models.slice(0, 5).map((model, index) => {
                    const variantCount = modelColors.filter(
                      (mc) => mc.modelId === model.modelId
                    ).length;
                    return (
                      <div key={model.modelId} className="flex items-center justify-between p-2.5 hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <span className={`
                            w-6 h-6 flex items-center justify-center rounded-full font-bold text-xs transition-colors
                            ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                              index === 1 ? 'bg-gray-100 text-gray-700' : 
                              index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-400 border border-gray-100'}
                          `}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{model.modelName}</p>
                            <p className="text-xs text-gray-500">{model.bodyType}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                          {variantCount} loại
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </EVMStaffLayout>
  );
};

export default EVMStaffDashboard;
