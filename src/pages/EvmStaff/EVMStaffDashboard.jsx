import { useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { getAllModelColorsThunk } from '../../store/slices/modelColorSlice';
import { getAllTransactionsThunk } from '../../store/slices/inventoryTransactionSlice';
import { getAllStoreStocksThunk } from '../../store/slices/store-stockSlice';
import { useAuth } from '../../contexts/AuthContext';

const EVMStaffDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const models = useSelector((s) => s.models.items) || [];
  const modelColors = useSelector((s) => s.modelColors.items) || [];
  const transactions = useSelector((s) => s.inventoryTransactions.items) || [];
  const storeStocks = useSelector((s) => s.storeStocks.items) || [];

  useEffect(() => {
    dispatch(getAllModelsThunk());
    dispatch(getAllModelColorsThunk());
    dispatch(getAllTransactionsThunk());
    dispatch(getAllStoreStocksThunk());
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
      return status === 'PENDING' || status === 'REQUESTED';
    }).length,
    processing: transactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return status === 'PROCESSING';
    }).length,
    completed: transactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return status === 'COMPLETED' || status === 'FINISH';
    }).length,
  };

  // Tính toán thống kê tồn kho
  const inventoryStats = {
    totalItems: storeStocks.length,
    totalQuantity: storeStocks.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0),
    distributedStores: new Set(storeStocks.map(s => s.storeId)).size,
  };

  // Mock data cho biểu đồ đơn hàng theo tháng
  const orderData = [
    { month: 'T1', orders: 45, completed: 42 },
    { month: 'T2', orders: 52, completed: 48 },
    { month: 'T3', orders: 48, completed: 45 },
    { month: 'T4', orders: 61, completed: 58 },
    { month: 'T5', orders: 55, completed: 52 },
    { month: 'T6', orders: 67, completed: 63 },
  ];

  // Phân tích đơn hàng theo trạng thái
  const orderStatusData = [
    { name: 'Hoàn thành', value: orderStats.completed, color: '#10b981' },
    { name: 'Đang xử lý', value: orderStats.processing, color: '#3b82f6' },
    { name: 'Đang chờ', value: orderStats.pending, color: '#f59e0b' },
  ];

  // Phân tích sản phẩm theo model
  const modelDistribution = models
    .slice(0, 5)
    .map(m => ({
      name: m.modelName || 'N/A',
      variants: modelColors.filter(mc => mc.modelId === m.modelId).length,
    }));

  // Phân tích tồn kho theo cửa hàng
  const stockByStore = Array.from(new Set(storeStocks.map(s => s.storeId)))
    .map(storeId => {
      const stocks = storeStocks.filter(s => s.storeId === storeId);
      return {
        name: stocks[0]?.storeName || `Cửa hàng ${storeId}`,
        quantity: stocks.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0),
      };
    })
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="px-4 py-3 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📊 Tổng quan EVM</h2>
          <p className="text-gray-600 mt-0.5 text-sm">Thống kê và phân tích sản phẩm và phân phối</p>
        </div>
        <button 
          onClick={() => {
            dispatch(getAllModelsThunk());
            dispatch(getAllModelColorsThunk());
            dispatch(getAllTransactionsThunk());
            dispatch(getAllStoreStocksThunk());
          }}
          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-medium">Sản phẩm</p>
              <h3 className="text-2xl font-bold mt-1.5">{productStats.totalModels}</h3>
              <p className="text-emerald-100 text-xs mt-1.5">{productStats.totalVariants} biến thể</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Dealer Orders */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium">Đơn đại lý</p>
              <h3 className="text-2xl font-bold mt-1.5">{orderStats.total}</h3>
              <p className="text-blue-100 text-xs mt-1.5">{orderStats.pending} đang chờ</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-medium">Tồn kho</p>
              <h3 className="text-2xl font-bold mt-1.5">{inventoryStats.totalQuantity}</h3>
              <p className="text-purple-100 text-xs mt-1.5">{inventoryStats.distributedStores} cửa hàng</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-3V3H9v2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Models */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs font-medium">Mẫu xe hoạt động</p>
              <h3 className="text-2xl font-bold mt-1.5">{productStats.activeModels}</h3>
              <p className="text-orange-100 text-xs mt-1.5">trong {productStats.totalModels} mẫu</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">📦 Đơn hàng theo tháng</h3>
              <p className="text-xs text-gray-500 mt-0.5">Xu hướng đơn hàng 6 tháng gần nhất</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={orderData}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="orders" stroke="#10b981" fillOpacity={1} fill="url(#colorOrders)" name="Tổng đơn" />
              <Area type="monotone" dataKey="completed" stroke="#3b82f6" fillOpacity={0.3} fill="#3b82f6" name="Hoàn thành" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Model Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">🚗 Phân bố biến thể</h3>
              <p className="text-xs text-gray-500 mt-0.5">Số lượng biến thể theo mẫu xe</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={modelDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`${value} biến thể`, 'Số lượng']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="variants" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Status Pie */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">⚡ Trạng thái đơn hàng</h3>
            <p className="text-xs text-gray-500 mt-0.5">Phân loại theo trạng thái</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {orderStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} đơn`, 'Số lượng']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Distribution */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-md p-4">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">📦 Tồn kho theo cửa hàng</h3>
            <p className="text-xs text-gray-500 mt-0.5">Top 5 cửa hàng có tồn kho cao nhất</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stockByStore}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`${value} sản phẩm`, 'Số lượng']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="quantity" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">⚡ Thao tác nhanh</h3>
          <p className="text-xs text-gray-500 mt-0.5">Truy cập nhanh các chức năng</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <a href="/evm-staff/product-management" className="bg-emerald-50 hover:bg-emerald-100 rounded-lg p-3 border border-emerald-200 transition text-center">
            <p className="text-xs font-medium text-emerald-700">Quản lý sản phẩm</p>
          </a>
          <a href="/evm-staff/vehicle-management" className="bg-blue-50 hover:bg-blue-100 rounded-lg p-3 border border-blue-200 transition text-center">
            <p className="text-xs font-medium text-blue-700">Quản lý xe</p>
          </a>
          <a href="/evm-staff/dealer-orders" className="bg-purple-50 hover:bg-purple-100 rounded-lg p-3 border border-purple-200 transition text-center">
            <p className="text-xs font-medium text-purple-700">Đơn đại lý</p>
          </a>
          <a href="/evm-staff/sales-report" className="bg-orange-50 hover:bg-orange-100 rounded-lg p-3 border border-orange-200 transition text-center">
            <p className="text-xs font-medium text-orange-700">Báo cáo bán hàng</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default EVMStaffDashboard;

