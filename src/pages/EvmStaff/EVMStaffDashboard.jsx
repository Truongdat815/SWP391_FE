import { useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { getAllModelColorsThunk } from '../../store/slices/modelColorSlice';
import { getAllTransactionsThunk } from '../../store/slices/inventoryTransactionSlice';
import { getAllStoreStocksThunk } from '../../store/slices/store-stockSlice';
import { useAuth } from '../../contexts/AuthContext';

const COMPLETED_TRANSACTION_STATUSES = ['COMPLETED', 'FINISH', 'DELIVERED'];
const PENDING_TRANSACTION_STATUSES = ['PENDING', 'REQUESTED'];
const PROCESSING_TRANSACTION_STATUSES = [
  'PROCESSING',
  'ACCEPTED',
  'APPROVED',
  'CONFIRMED',
  'CONTRACT_SIGNED',
  'CONTRACT_PENDING',
  'FILE_UPLOADED',
  'PAYMENT_CONFIRMED',
  'SHIPPING',
  'IN_TRANSIT'
];

const EVMStaffDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const models = useSelector((s) => s.models.items) || [];
  const modelColors = useSelector((s) => s.modelColors.items) || [];
  const transactions = useSelector((s) => s.inventoryTransactions.items) || [];
  const storeStocks = useSelector((s) => s.storeStocks.items) || [];

  // Tự động làm mới dữ liệu mỗi 5 giây
  useEffect(() => {
    // Fetch dữ liệu ngay lập tức
    dispatch(getAllModelsThunk());
    dispatch(getAllModelColorsThunk());
    dispatch(getAllTransactionsThunk());
    dispatch(getAllStoreStocksThunk());

    // Thiết lập interval để tự động refresh mỗi 5 giây
    const interval = setInterval(() => {
      dispatch(getAllModelsThunk());
      dispatch(getAllModelColorsThunk());
      dispatch(getAllTransactionsThunk());
      dispatch(getAllStoreStocksThunk());
    }, 5000); // 5 giây = 5000ms

    // Cleanup interval khi component unmount
    return () => clearInterval(interval);
  }, [dispatch]);

  // Tính toán thống kê sản phẩm
  const productStats = {
    totalModels: models.length,
    totalVariants: modelColors.length,
    activeModels: models.filter(m => m.status === 'ACTIVE' || m.status === 'active').length,
  };

  // Tính toán thống kê đơn đại lý
  const orderStats = {
    total: transactions.length,
    pending: transactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return PENDING_TRANSACTION_STATUSES.includes(status);
    }).length,
    processing: transactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return PROCESSING_TRANSACTION_STATUSES.includes(status);
    }).length,
    completed: transactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return COMPLETED_TRANSACTION_STATUSES.includes(status);
    }).length,
  };

  // Tính toán thống kê xe đã đưa cho đại lý
  // Tính từ transactions đã completed/delivered thay vì storeStocks để đảm bảo chính xác
  const completedTransactions = transactions.filter(t => {
    const status = (t.status || '').toUpperCase();
    return status === 'COMPLETED' || status === 'FINISH' || status === 'DELIVERED';
  });
  
  const dealerDeliveryStats = {
    totalDelivered: completedTransactions.reduce((sum, t) => sum + (parseInt(t.importQuantity) || 0), 0),
    distributedStores: new Set(completedTransactions.map(t => t.storeId).filter(id => id != null)).size,
  };

  // Tính toán dữ liệu đơn hàng theo tháng từ transactions thực tế
  const orderData = useMemo(() => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
    const now = new Date();
    
    return months.map((monthLabel, index) => {
      // Tính tháng từ hiện tại trở về trước (6 tháng gần nhất)
      // index 0 = 5 tháng trước, index 5 = tháng hiện tại
      const monthOffset = 5 - index;
      const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
      
      // Lọc transactions trong tháng này
      const monthTransactions = transactions.filter(transaction => {
        // Thử nhiều field có thể chứa ngày
        const transactionDate = transaction.transactionDate || 
                               transaction.orderDate || 
                               transaction.createdAt || 
                               transaction.createdDate ||
                               transaction.date;
        
        if (!transactionDate) return false;
        
        try {
          const date = new Date(transactionDate);
          if (isNaN(date.getTime())) return false;
          
          // So sánh ngày trong khoảng tháng
          return date >= monthStart && date <= monthEnd;
        } catch (e) {
          return false;
        }
      });
      
      // Đếm tổng đơn và đơn đã hoàn thành
      const orders = monthTransactions.length;
      const completed = monthTransactions.filter(t => {
        const status = (t.status || '').toUpperCase();
        return status === 'COMPLETED' || status === 'FINISH' || status === 'DELIVERED';
      }).length;
      
      return {
        month: monthLabel,
        orders: orders,
        completed: completed
      };
    });
  }, [transactions]);

  // Phân tích đơn hàng theo trạng thái - chỉ lấy các trạng thái có giá trị > 0
  const orderStatusData = [
    { name: 'Hoàn thành', value: orderStats.completed, color: '#10b981' },
    { name: 'Đang xử lý', value: orderStats.processing, color: '#3b82f6' },
    { name: 'Đang chờ', value: orderStats.pending, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  // Phân tích sản phẩm theo model
  const modelDistribution = models
    .map(m => ({
      name: m.modelName || 'N/A',
      variants: modelColors.filter(mc => mc.modelId === m.modelId).length,
    }))
    .filter(item => item.variants > 0) // Chỉ lấy models có kiểu xe
    .sort((a, b) => b.variants - a.variants) // Sắp xếp theo số lượng kiểu xe giảm dần
    .slice(0, 5); // Lấy top 5

  // Top 5 đại lý nhận nhiều xe nhất
  const dealerDeliveryTopStores = Array.from(
    completedTransactions.reduce((map, transaction) => {
      const storeId = transaction.storeId;
      if (!storeId) {
        return map;
      }

      const quantity = parseInt(transaction.importQuantity) || 0;
      if (quantity <= 0) {
        return map;
      }

      const existing = map.get(storeId) || {
        storeId,
        name:
          transaction.storeName ||
          transaction.store?.storeName ||
          storeStocks.find((s) => s.storeId === storeId)?.storeName ||
          `Đại lý ${storeId}`,
        quantity: 0,
      };

      existing.quantity += quantity;
      map.set(storeId, existing);
      return map;
    }, new Map()).values()
  )
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-0.5 sm:p-1 md:p-1.5 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col space-y-0.5 sm:space-y-1 md:space-y-1.5">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
          {/* Sản phẩm Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-1.5 sm:p-2 md:p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-100 text-xs sm:text-sm font-medium">Tổng sản phẩm</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{productStats.totalVariants}</h3>
                  <p className="text-emerald-100 text-xs sm:text-sm">{productStats.totalModels} mẫu xe</p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0 ml-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Đơn đại lý Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 sm:p-2 md:p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-blue-100 text-xs sm:text-sm font-medium">Tổng đơn hàng</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{orderStats.total}</h3>
                  <p className="text-blue-100 text-xs sm:text-sm">{orderStats.pending} đang chờ</p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0 ml-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Hoàn thành Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-1.5 sm:p-2 md:p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-green-100 text-xs sm:text-sm font-medium">Đã hoàn thành</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{orderStats.completed}</h3>
                  <p className="text-green-100 text-xs sm:text-sm">
                    {orderStats.total > 0 ? Math.round((orderStats.completed / orderStats.total) * 100) : 0}% tổng đơn
                  </p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0 ml-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Xe đã đưa cho đại lý Card */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-1.5 sm:p-2 md:p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-purple-100 text-xs sm:text-sm font-medium">Xe đã đưa cho đại lý</p>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{dealerDeliveryStats.totalDelivered}</h3>
                  <p className="text-purple-100 text-xs sm:text-sm">{dealerDeliveryStats.distributedStores} đại lý</p>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0 ml-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 sm:gap-1.5 md:gap-2 flex-1 min-h-0">
          {/* Đơn hàng theo tháng */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-0.5 sm:p-1 md:p-1.5 flex flex-col min-h-0">
            <div className="mb-0.5 flex-shrink-0">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">Đơn hàng theo tháng</h3>
              <p className="text-xs text-gray-500">Xu hướng 6 tháng gần nhất</p>
            </div>
            <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orderData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#6b7280" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                  name="Tổng đơn" 
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={0.3} 
                  fill="url(#colorCompleted)" 
                  name="Hoàn thành" 
                />
              </AreaChart>
            </ResponsiveContainer>
            </div>
          </div>

          {/* Phân bố kiểu xe */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-0.5 sm:p-1 flex flex-col min-h-0">
            <div className="mb-0.5 flex-shrink-0">
              <h3 className="text-xs sm:text-sm font-bold text-gray-900">Phân bố kiểu xe</h3>
              <p className="text-xs text-gray-500">Top 5 mẫu xe có nhiều kiểu nhất</p>
            </div>
            <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelDistribution} margin={{ top: 5, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  textAnchor="middle"
                  height={50}
                />
                <YAxis 
                  stroke="#6b7280" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  allowDecimals={false}
                  tickFormatter={(value) => Math.floor(value)}
                />
                <Tooltip 
                  formatter={(value) => [`${Math.floor(value)} kiểu xe`, 'Số lượng']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="variants" 
                  fill="#8b5cf6" 
                  radius={[8, 8, 0, 0]}
                  name="Số kiểu xe"
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Trạng thái đơn hàng */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 sm:gap-1.5 md:gap-2 flex-1 min-h-0">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-1 sm:p-1.5 flex flex-col min-h-0">
            <div className="mb-0.5 sm:mb-1 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-900">Trạng thái đơn hàng</h3>
              <p className="text-xs text-gray-500">Phân loại theo trạng thái</p>
            </div>
            {orderStatusData.length > 0 ? (
              <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={108}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} đơn`, 'Số lượng']}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 text-gray-400">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-xs font-medium">Chưa có dữ liệu</p>
                </div>
              </div>
            )}
          </div>

          {/* Đại lý nhận nhiều xe nhất */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-1 sm:p-1.5 flex flex-col min-h-0">
            <div className="mb-0.5 sm:mb-1 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-900">Top đại lý nhận xe</h3>
              <p className="text-xs text-gray-500">Top 5 đại lý nhận nhiều xe nhất</p>
            </div>
            {dealerDeliveryTopStores.length > 0 ? (
              <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dealerDeliveryTopStores} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number"
                    stroke="#6b7280" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    stroke="#6b7280" 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value} xe`, 'Số lượng']}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="quantity" 
                    fill="#10b981" 
                    radius={[0, 8, 8, 0]}
                    name="Số lượng xe"
                  />
                </BarChart>
              </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 text-gray-400">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-xs font-medium">Chưa có dữ liệu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVMStaffDashboard;
