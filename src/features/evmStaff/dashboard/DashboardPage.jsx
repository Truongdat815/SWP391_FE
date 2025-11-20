import { useMemo } from 'react';
import { Package, ShoppingCart, CheckCircle, Truck, TrendingUp, Activity, Calendar } from 'lucide-react';
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
        className="space-y-8 p-8 bg-gray-50/50 min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Tổng quan sản xuất
            </h1>
            <p className="text-gray-500 mt-2 text-lg">
              Theo dõi hiệu suất và hoạt động sản xuất của bạn
            </p>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 bg-white shadow-sm border border-gray-100 rounded-2xl">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">6 tháng gần nhất</span>
          </div>
        </motion.div>

        {/* Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Tổng sản phẩm"
            value={`${totalModels} Model`}
            change={`${totalVariants} biến thể`}
            changeType="neutral"
            icon={Package}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20 shadow-lg border-0"
          />
          <MetricCard
            title="Tổng đơn hàng"
            value={totalOrders}
            change={`${pendingOrders} chờ xử lý`}
            changeType="neutral"
            icon={ShoppingCart}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/20 shadow-lg border-0"
          />
          <MetricCard
            title="Tỷ lệ hoàn thành"
            value={`${completionRate}%`}
            change="Trên tổng đơn"
            changeType="positive"
            icon={CheckCircle}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20 shadow-lg border-0"
          />
          <MetricCard
            title="Xe đã giao"
            value={deliveredVehicles}
            change={`${uniqueDealers} đại lý`}
            changeType="neutral"
            icon={Truck}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-500/20 shadow-lg border-0"
          />
        </motion.div>

        {/* Charts & Top Models */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="h-full border-0 shadow-xl shadow-gray-100/50 overflow-hidden">
              <Card.Header className="border-b border-gray-50 bg-white px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Activity size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <Card.Title className="text-lg font-bold text-gray-800">Xu Hướng Đơn Hàng</Card.Title>
                      <p className="text-sm text-gray-500">Thống kê theo tháng</p>
                    </div>
                  </div>
                  {orderGrowthRate !== 0 && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                      orderGrowthRate > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {orderGrowthRate > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {Math.abs(orderGrowthRate)}%
                    </div>
                  )}
                </div>
              </Card.Header>
              <Card.Content className="p-6">
                <div className="h-[300px] w-full">
                  <LineChart
                    data={orderTrendData}
                    dataKey="value"
                    name="Đơn hàng"
                    color="#4F46E5"
                  />
                </div>
              </Card.Content>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="h-full border-0 shadow-xl shadow-gray-100/50 overflow-hidden">
              <Card.Header className="border-b border-gray-50 bg-white px-6 py-5">
                <Card.Title className="text-lg font-bold text-gray-800">Top Mẫu Xe</Card.Title>
                <p className="text-sm text-gray-500">Phổ biến nhất theo biến thể</p>
              </Card.Header>
              <Card.Content className="p-0">
                <div className="divide-y divide-gray-50">
                  {models.slice(0, 5).map((model, index) => {
                    const variantCount = modelColors.filter(
                      (mc) => mc.modelId === model.modelId
                    ).length;
                    return (
                      <div key={model.modelId} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <span className={`
                            w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm transition-colors
                            ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                              index === 1 ? 'bg-gray-100 text-gray-700' : 
                              index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-400 border border-gray-100'}
                          `}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{model.modelName}</p>
                            <p className="text-xs text-gray-500">{model.bodyType}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
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

        {/* Order Status Overview */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-xl shadow-gray-100/50">
            <Card.Header className="border-b border-gray-50 px-6 py-5">
              <Card.Title className="text-lg font-bold text-gray-800">Trạng Thái Đơn Hàng</Card.Title>
            </Card.Header>
            <Card.Content className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { 
                    label: 'Chờ xử lý', 
                    count: transactions.filter(t => ['PENDING', 'DRAFT'].includes(t.status)).length,
                    color: 'bg-yellow-50 text-yellow-600 border-yellow-100'
                  },
                  { 
                    label: 'Đang xử lý', 
                    count: transactions.filter(t => ['PROCESSING', 'CONFIRMED', 'ACCEPTED', 'SHIPPING'].includes(t.status)).length,
                    color: 'bg-blue-50 text-blue-600 border-blue-100'
                  },
                  { 
                    label: 'Hoàn thành', 
                    count: transactions.filter(t => ['DELIVERED', 'COMPLETED'].includes(t.status)).length,
                    color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  },
                  { 
                    label: 'Đã hủy', 
                    count: transactions.filter(t => ['CANCELLED', 'REJECTED'].includes(t.status)).length,
                    color: 'bg-red-50 text-red-600 border-red-100'
                  }
                ].map((item, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${item.color} flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 cursor-default`}>
                    <span className="text-3xl font-bold">{item.count}</span>
                    <span className="text-sm font-medium opacity-80">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </motion.div>
      </motion.div>
    </EVMStaffLayout>
  );
};

export default EVMStaffDashboard;
