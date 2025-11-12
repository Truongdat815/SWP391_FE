import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders } from '../../store/slices/orderSlice';
import { getAllStoreStocksThunk } from '../../store/slices/store-stockSlice';
import { fetchPromotions } from '../../store/slices/promotionSlice';
import { getAllUsersThunk } from '../../store/slices/userSlice';
import { useAuth } from '../../contexts/AuthContext';

const DealerManagerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const orders = useSelector((s) => s.orders.items) || [];
  const storeStocks = useSelector((s) => s.storeStocks.items) || [];
  const promotions = useSelector((s) => s.promotions.promotions) || [];
  const users = useSelector((s) => s.users.items) || [];

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(getAllStoreStocksThunk());
    dispatch(fetchPromotions());
    dispatch(getAllUsersThunk());
  }, [dispatch]);

  // Tính toán thống kê đơn hàng
  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => (o.status || '').toUpperCase() === 'PENDING' || (o.status || '').toUpperCase() === 'DRAFT').length,
    confirmed: orders.filter(o => (o.status || '').toUpperCase() === 'CONFIRMED').length,
    completed: orders.filter(o => (o.status || '').toUpperCase() === 'COMPLETED').length,
    totalRevenue: orders.reduce((sum, o) => sum + (parseFloat(o.totalPrice) || 0), 0),
  };

  // Tính toán thống kê kho
  const inventoryStats = {
    totalItems: storeStocks.length,
    totalQuantity: storeStocks.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0),
    lowStock: storeStocks.filter(s => (parseInt(s.quantity) || 0) < 5).length,
    totalValue: storeStocks.reduce((sum, s) => sum + ((parseFloat(s.unitPrice) || 0) * (parseInt(s.quantity) || 0)), 0),
  };

  // Tính toán thống kê nhân viên
  const staffStats = {
    total: users.filter(u => u.roleName === 'Dealer Staff' || u.roleName === 'Nhân viên cửa hàng').length,
    active: users.filter(u => (u.roleName === 'Dealer Staff' || u.roleName === 'Nhân viên cửa hàng') && (u.status === 'ACTIVE' || u.status === 'active')).length,
  };

  // Tính toán thống kê khuyến mãi
  const promotionStats = {
    total: promotions.length,
    active: promotions.filter(p => {
      const now = new Date();
      const startDate = p.startDate ? new Date(p.startDate) : null;
      const endDate = p.endDate ? new Date(p.endDate) : null;
      return startDate && endDate && now >= startDate && now <= endDate;
    }).length,
  };

  // Mock data cho biểu đồ doanh thu theo tháng
  const revenueData = [
    { month: 'T1', revenue: 45000000, orders: 12 },
    { month: 'T2', revenue: 52000000, orders: 15 },
    { month: 'T3', revenue: 48000000, orders: 13 },
    { month: 'T4', revenue: 61000000, orders: 17 },
    { month: 'T5', revenue: 55000000, orders: 15 },
    { month: 'T6', revenue: 67000000, orders: 18 },
  ];

  // Phân tích đơn hàng theo trạng thái
  const orderStatusData = [
    { name: 'Đã xác nhận', value: orderStats.confirmed, color: '#10b981' },
    { name: 'Đang chờ', value: orderStats.pending, color: '#f59e0b' },
    { name: 'Hoàn thành', value: orderStats.completed, color: '#3b82f6' },
  ];

  // Phân tích kho theo số lượng
  const inventoryByQuantity = storeStocks
    .filter(s => (parseInt(s.quantity) || 0) > 0)
    .sort((a, b) => (parseInt(b.quantity) || 0) - (parseInt(a.quantity) || 0))
    .slice(0, 5)
    .map(s => ({
      name: s.modelName || 'N/A',
      quantity: parseInt(s.quantity) || 0,
    }));

  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="px-4 py-3 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📊 Tổng quan đại lý</h2>
          <p className="text-gray-600 mt-0.5 text-sm">Thống kê và phân tích dữ liệu đại lý</p>
        </div>
        <button 
          onClick={() => {
            dispatch(fetchOrders());
            dispatch(getAllStoreStocksThunk());
            dispatch(fetchPromotions());
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
        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium">Tổng đơn hàng</p>
              <h3 className="text-2xl font-bold mt-1.5">{orderStats.total}</h3>
              <p className="text-blue-100 text-xs mt-1.5">{orderStats.confirmed} đã xác nhận</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-medium">Tổng doanh thu</p>
              <h3 className="text-2xl font-bold mt-1.5">{((orderStats.totalRevenue || 0) / 1000000).toFixed(1)}M</h3>
              <p className="text-emerald-100 text-xs mt-1.5">VNĐ</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              <p className="text-purple-100 text-xs mt-1.5">{inventoryStats.lowStock} sản phẩm sắp hết</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-3V3H9v2H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0H4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Staff */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs font-medium">Nhân viên</p>
              <h3 className="text-2xl font-bold mt-1.5">{staffStats.total}</h3>
              <p className="text-orange-100 text-xs mt-1.5">{staffStats.active} đang hoạt động</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">📈 Doanh thu theo tháng</h3>
              <p className="text-xs text-gray-500 mt-0.5">Xu hướng doanh thu 6 tháng gần nhất</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip 
                formatter={(value) => [`${(value / 1000000).toFixed(1)}M VNĐ`, 'Doanh thu']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ef4444" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">📦 Đơn hàng theo tháng</h3>
              <p className="text-xs text-gray-500 mt-0.5">Tổng số đơn hàng 6 tháng</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`${value} đơn`, 'Số đơn']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="orders" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
            </LineChart>
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

        {/* Top Inventory Items */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-md p-4">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">📦 Top 5 sản phẩm tồn kho</h3>
            <p className="text-xs text-gray-500 mt-0.5">Sản phẩm có số lượng tồn kho cao nhất</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={inventoryByQuantity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`${value} sản phẩm`, 'Số lượng']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="quantity" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Promotions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">🎁 Khuyến mãi</h3>
            <p className="text-xs text-gray-500 mt-0.5">Thống kê chương trình khuyến mãi</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3 border border-pink-200">
              <p className="text-xs text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-pink-600 mt-1">{promotionStats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{promotionStats.active}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">⚡ Thao tác nhanh</h3>
            <p className="text-xs text-gray-500 mt-0.5">Truy cập nhanh các chức năng</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a href="/dealer-manager/inventory" className="bg-blue-50 hover:bg-blue-100 rounded-lg p-3 border border-blue-200 transition text-center">
              <p className="text-xs font-medium text-blue-700">Quản lý kho</p>
            </a>
            <a href="/dealer-manager/orders" className="bg-green-50 hover:bg-green-100 rounded-lg p-3 border border-green-200 transition text-center">
              <p className="text-xs font-medium text-green-700">Đơn hàng</p>
            </a>
            <a href="/dealer-manager/promotion-management" className="bg-purple-50 hover:bg-purple-100 rounded-lg p-3 border border-purple-200 transition text-center">
              <p className="text-xs font-medium text-purple-700">Khuyến mãi</p>
            </a>
            <a href="/dealer-manager/quan-ly-nhan-vien" className="bg-orange-50 hover:bg-orange-100 rounded-lg p-3 border border-orange-200 transition text-center">
              <p className="text-xs font-medium text-orange-700">Nhân viên</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerManagerDashboard;

