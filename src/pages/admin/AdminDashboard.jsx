import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <div className="px-4 py-3 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">📊 Tổng quan hệ thống</h2>
          <p className="text-gray-600 mt-0.5 text-sm">Thống kê và phân tích dữ liệu toàn hệ thống</p>
        </div>
        <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Stores */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium">Tổng cửa hàng</p>
              <h3 className="text-2xl font-bold mt-1.5">{stores.length}</h3>
              <p className="text-blue-100 text-xs mt-1.5">+{statusData[0]?.value || 0} đang hoạt động</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-medium">Người dùng</p>
              <h3 className="text-2xl font-bold mt-1.5">{users.length}</h3>
              <p className="text-emerald-100 text-xs mt-1.5">{roleData.length} vai trò</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-4">
        {/* Stores by Province */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900">🗺️ Phân bố cửa hàng theo tỉnh</h3>
            <p className="text-xs text-gray-500 mt-0.5">Top 8 tỉnh thành có nhiều cửa hàng nhất</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
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
      </div>

      {/* User Distribution Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">👥 Phân bố người dùng theo vai trò</h3>
          <p className="text-xs text-gray-500 mt-0.5">Thống kê chi tiết số lượng người dùng</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {roleData.map((role, index) => (
            <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm`} style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                  {role.value}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vai trò</p>
                  <p className="font-semibold text-gray-900 text-xs">{role.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
    
    </div>
  );
};

export default AdminDashboard;

