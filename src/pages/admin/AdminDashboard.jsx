import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { getAllStoresThunk } from '@store/slices/storeSlice';
import { getAllUsersThunk } from '@store/slices/userSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const stores = useSelector((s) => s.stores.items) || [];
  const users = useSelector((s) => s.users.items) || [];
  const storesStatus = useSelector((s) => s.stores.status);
  const usersStatus = useSelector((s) => s.users.status);

  useEffect(() => {
    if (storesStatus === 'idle') {
      dispatch(getAllStoresThunk());
    }
    if (usersStatus === 'idle') {
      dispatch(getAllUsersThunk());
    }
  }, [dispatch, storesStatus, usersStatus]);

  // Mock data cho biểu đồ doanh thu
  const revenueData = [
    { month: 'T1', revenue: 45000000, orders: 120 },
    { month: 'T2', revenue: 52000000, orders: 145 },
    { month: 'T3', revenue: 48000000, orders: 130 },
    { month: 'T4', revenue: 61000000, orders: 170 },
    { month: 'T5', revenue: 55000000, orders: 150 },
    { month: 'T6', revenue: 67000000, orders: 185 },
    { month: 'T7', revenue: 73000000, orders: 200 },
    { month: 'T8', revenue: 69000000, orders: 190 },
    { month: 'T9', revenue: 78000000, orders: 215 },
    { month: 'T10', revenue: 82000000, orders: 230 },
  ];

  // Phân tích cửa hàng theo tỉnh
  const storesByProvince = stores.reduce((acc, store) => {
    const province = store.provinceName || 'Khác';
    acc[province] = (acc[province] || 0) + 1;
    return acc;
  }, {});

  const provinceData = Object.entries(storesByProvince)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Phân tích trạng thái cửa hàng
  const storesByStatus = stores.reduce((acc, store) => {
    const status = store.status || 'INACTIVE';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { name: 'Hoạt động', value: storesByStatus['ACTIVE'] || 0, color: '#10b981' },
    { name: 'Tạm ngưng', value: storesByStatus['INACTIVE'] || 0, color: '#6b7280' },
  ];

  // Phân tích người dùng theo role
  const usersByRole = users.reduce((acc, user) => {
    const role = user.roleName || 'Khác';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const roleData = Object.entries(usersByRole).map(([name, value]) => ({
    name,
    value,
  }));

  // Tổng quan metrics
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="px-6 py-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📊 Tổng quan hệ thống</h2>
          <p className="text-gray-600 mt-1">Thống kê và phân tích dữ liệu toàn hệ thống</p>
        </div>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Stores */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng cửa hàng</p>
              <h3 className="text-3xl font-bold mt-2">{stores.length}</h3>
              <p className="text-blue-100 text-xs mt-2">+{statusData[0]?.value || 0} đang hoạt động</p>
            </div>
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Người dùng</p>
              <h3 className="text-3xl font-bold mt-2">{users.length}</h3>
              <p className="text-emerald-100 text-xs mt-2">{roleData.length} vai trò</p>
            </div>
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Tổng doanh thu</p>
              <h3 className="text-3xl font-bold mt-2">{(totalRevenue / 1000000).toFixed(0)}M</h3>
              <p className="text-purple-100 text-xs mt-2">VNĐ (10 tháng)</p>
            </div>
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Đơn hàng</p>
              <h3 className="text-3xl font-bold mt-2">{totalOrders}</h3>
              <p className="text-orange-100 text-xs mt-2">TB: {(avgOrderValue / 1000).toFixed(0)}K VNĐ</p>
            </div>
            <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">📈 Doanh thu theo tháng</h3>
              <p className="text-sm text-gray-500 mt-1">Xu hướng doanh thu 10 tháng gần nhất</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip 
                formatter={(value) => [`${(value / 1000000).toFixed(1)}M VNĐ`, 'Doanh thu']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">📦 Đơn hàng theo tháng</h3>
              <p className="text-sm text-gray-500 mt-1">Tổng số đơn hàng 10 tháng</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stores by Province */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">🗺️ Phân bố cửa hàng theo tỉnh</h3>
            <p className="text-sm text-gray-500 mt-1">Top 8 tỉnh thành có nhiều cửa hàng nhất</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={provinceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`${value} cửa hàng`, 'Số lượng']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Store Status Pie */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">⚡ Trạng thái cửa hàng</h3>
            <p className="text-sm text-gray-500 mt-1">Phân loại theo trạng thái</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} cửa hàng`, 'Số lượng']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Distribution Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">👥 Phân bố người dùng theo vai trò</h3>
          <p className="text-sm text-gray-500 mt-1">Thống kê chi tiết số lượng người dùng</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roleData.map((role, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold`} style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                  {role.value}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vai trò</p>
                  <p className="font-semibold text-gray-900 text-sm">{role.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-blue-900">Lưu ý về dữ liệu</p>
          <p className="text-xs text-blue-700 mt-1">Biểu đồ doanh thu và đơn hàng sử dụng dữ liệu mẫu để minh họa. Dữ liệu cửa hàng và người dùng là dữ liệu thực từ hệ thống.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

