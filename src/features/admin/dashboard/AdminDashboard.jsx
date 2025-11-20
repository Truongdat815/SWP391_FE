import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery } from '../../../api/admin/userApi';
import { useGetAllStoresQuery, useGetMonthlyRevenueQuery } from '../../../api/admin/storeApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import AdminLayout from '../../../components/layout/AdminLayout';
import { TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // API calls
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useGetAllUsersQuery();
  const { data: storesData, isLoading: isLoadingStores, error: storesError } = useGetAllStoresQuery();
  const { data: revenueData, isLoading: isLoadingRevenue, error: revenueError } = useGetMonthlyRevenueQuery();
  const { data: modelsData, isLoading: isLoadingModels, error: modelsError } = useGetAllModelsQuery();

  const users = usersData?.data || [];
  const stores = storesData?.data || [];
  const monthlyRevenues = revenueData?.data || [];
  const models = modelsData?.data || [];

  const isLoading = isLoadingUsers || isLoadingStores || isLoadingRevenue || isLoadingModels;
  
  const isUnauthorized = 
    usersError?.status === 401 || 
    storesError?.status === 401 || 
    revenueError?.status === 401 ||
    modelsError?.status === 401;
  
  const hasError = (usersError && usersError.status !== 401) || 
                   (storesError && storesError.status !== 401);

  // Tính toán metrics
  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === 'ACTIVE').length;
  const totalUsers = users.length;
  
  // Tính tổng doanh thu
  const totalRevenue = useMemo(() => {
    if (monthlyRevenues?.length > 0) {
      const total = monthlyRevenues.reduce((sum, rev) => {
        return sum + (parseFloat(rev.totalRevenue) || 0);
      }, 0);
      
      if (total >= 1000000000000) {
        return `${(total / 1000000000000).toFixed(1)} Tỷ`;
      } else if (total >= 1000000000) {
        return `${(total / 1000000000).toFixed(1)} Tỷ`;
      } else if (total >= 1000000) {
        return `${(total / 1000000).toFixed(1)}M VND`;
      }
      return `${(total / 1000).toFixed(1)}K VND`;
    }
    return '0 VND';
  }, [monthlyRevenues]);

  // Phân bố cửa hàng theo tỉnh
  const storesByProvince = useMemo(() => {
    const provinceMap = {};
    stores.forEach(store => {
      const province = store.provinceName || store.province || 'Khác';
      provinceMap[province] = (provinceMap[province] || 0) + 1;
    });
    
    const topProvinces = ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
    const result = topProvinces.map(name => ({
      name,
      count: provinceMap[name] || 0,
      percentage: totalStores > 0 ? ((provinceMap[name] || 0) / totalStores) * 100 : 0
    }));
    
    const others = Object.entries(provinceMap)
      .filter(([name]) => !topProvinces.includes(name))
      .reduce((sum, [, count]) => sum + count, 0);
    
    if (others > 0) {
      result.push({
        name: 'Khác',
        count: others,
        percentage: totalStores > 0 ? (others / totalStores) * 100 : 0
      });
    }
    
    return result;
  }, [stores, totalStores]);

  // Phân bố người dùng theo role
  const usersByRole = useMemo(() => {
    const roleMap = {};
    users.forEach(user => {
      const role = user.roleName || 'Khác';
      roleMap[role] = (roleMap[role] || 0) + 1;
    });
    
    const total = users.length;
    const adminCount = roleMap['Admin'] || roleMap['ADMIN'] || 0;
    const managerCount = (roleMap['Dealer Manager'] || roleMap['DEALER_MANAGER'] || 0) + 
                         (roleMap['Quản lý đại lý'] || 0);
    const staffCount = (roleMap['Dealer Staff'] || roleMap['DEALER_STAFF'] || 0) + 
                       (roleMap['Nhân viên bán hàng'] || 0) +
                       (roleMap['EVM Staff'] || roleMap['EVM_STAFF'] || 0);
    
    return {
      admin: { count: adminCount, percentage: total > 0 ? (adminCount / total) * 100 : 0 },
      manager: { count: managerCount, percentage: total > 0 ? (managerCount / total) * 100 : 0 },
      staff: { count: staffCount, percentage: total > 0 ? (staffCount / total) * 100 : 0 }
    };
  }, [users]);

  // Trạng thái cửa hàng
  const storeStatus = useMemo(() => {
    const active = stores.filter(s => s.status === 'ACTIVE').length;
    const inactive = stores.filter(s => s.status === 'INACTIVE').length;
    const total = stores.length;
    
    return {
      active,
      inactive,
      total,
      activePercentage: total > 0 ? (active / total) * 100 : 0,
      inactivePercentage: total > 0 ? (inactive / total) * 100 : 0
    };
  }, [stores]);

  // Internal Components
  const StatCard = ({ title, value, subtitle, trend, trendText }) => (
    <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200">
      <p className="text-base font-medium text-gray-600">{title}</p>
      <p className="text-3xl font-bold tracking-tight text-gray-900">
        {value}
        {subtitle && (
          <span className="text-xl font-medium text-gray-500 ml-1">
            {subtitle}
          </span>
        )}
      </p>
      {trend && trendText && (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <p className="text-sm font-medium">{trendText}</p>
        </div>
      )}
    </div>
  );

  const ProvinceChart = () => {
    const maxHeight = Math.max(...storesByProvince.map(p => p.count), 1);
    
    return (
      <div className="h-80 flex flex-col-reverse justify-between">
        <div className="grid grid-cols-6 gap-4 text-center">
          {storesByProvince.map((province) => (
            <p 
              key={province.name}
              className="text-xs font-medium text-gray-600 truncate"
            >
              {province.name}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-4 items-end h-full mt-4">
          {storesByProvince.map((province) => {
            const height = maxHeight > 0 ? (province.count / maxHeight) * 100 : 0;
            return (
              <div
                key={province.name}
                className="bg-blue-400 hover:bg-blue-500 rounded-t-lg transition-colors cursor-pointer"
                style={{ height: `${height}%` }}
                title={`${province.name}: ${province.count} cửa hàng`}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const UserRoleChart = () => {
    const { admin, manager, staff } = usersByRole;
    const total = admin.percentage + manager.percentage + staff.percentage;
    
    // Màu sắc khớp với ảnh: Admin (blue), Manager (green), Staff (orange)
    const gradient = total > 0 
      ? `conic-gradient(from 0deg, #3B82F6 0% ${admin.percentage}%, #10B981 ${admin.percentage}% ${admin.percentage + manager.percentage}%, #F97316 ${admin.percentage + manager.percentage}% 100%)`
      : 'conic-gradient(from 0deg, #e5e7eb 0% 100%)';
    
    return (
      <>
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="relative size-48">
            <div 
              className="absolute inset-0 rounded-full"
              style={{ backgroundImage: gradient }}
            />
            <div className="absolute inset-2 bg-white rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-blue-500" />
              <p className="text-sm font-medium text-gray-600">Admin</p>
            </div>
            <p className="text-base font-bold text-gray-900">
              {admin.percentage.toFixed(0)}%
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-gray-600">Manager</p>
            </div>
            <p className="text-base font-bold text-gray-900">
              {manager.percentage.toFixed(0)}%
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-orange-500" />
              <p className="text-sm font-medium text-gray-600">Staff</p>
            </div>
            <p className="text-base font-bold text-gray-900">
              {staff.percentage.toFixed(0)}%
            </p>
          </div>
        </div>
      </>
    );
  };

  const StoreStatusChart = () => {
    const { active, inactive, total, activePercentage, inactivePercentage } = storeStatus;
    const gradient = total > 0
      ? `conic-gradient(from 0deg, #10B981 0% ${activePercentage}%, #F97316 ${activePercentage}% 100%)`
      : 'conic-gradient(from 0deg, #e5e7eb 0% 100%)';
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-1 flex items-center justify-center">
          <div className="relative size-48">
            <div 
              className="absolute inset-0 rounded-full"
              style={{ backgroundImage: gradient }}
            />
            <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
              <p className="text-3xl font-bold text-gray-900">{total}</p>
              <p className="text-sm text-gray-600">Cửa hàng</p>
            </div>
          </div>
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-white">
            <div className="size-3 rounded-full bg-green-500 mt-1.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Active</p>
              <p className="text-2xl font-bold text-green-600">{active}</p>
              <p className="text-sm text-gray-600">
                {activePercentage.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-lg bg-white">
            <div className="size-3 rounded-full bg-orange-500 mt-1.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Inactive</p>
              <p className="text-2xl font-bold text-orange-600">{inactive}</p>
              <p className="text-sm text-gray-600">
                {inactivePercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Đang tải dữ liệu...</div>
        </div>
      </AdminLayout>
    );
  }

  if (isUnauthorized) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-yellow-600 dark:text-yellow-400 text-lg font-medium">
            ⚠️ Bạn chưa đăng nhập hoặc token đã hết hạn
          </div>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đi đến trang đăng nhập
          </button>
        </div>
      </AdminLayout>
    );
  }

  if (hasError) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500 dark:text-red-400">
            Có lỗi xảy ra khi tải dữ liệu chính. Vui lòng thử lại.
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng Số Cửa Hàng"
            value={activeStores}
            subtitle={`/${totalStores}`}
            trend={true}
            trendText="+5% so với tháng trước"
          />
          <StatCard
            title="Tổng Số Người Dùng"
            value={totalUsers}
            trend={true}
            trendText="+12% so với tháng trước"
          />
          <StatCard
            title="Tổng Số Đơn Hàng"
            value="1,230"
            trend={true}
            trendText="+8.5% so với tháng trước"
          />
          <StatCard
            title="Tổng Doanh Thu"
            value={totalRevenue}
            trend={true}
            trendText="+15.2% so với tháng trước"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Province Distribution Chart */}
          <div className="lg:col-span-3 flex flex-col gap-4 rounded-xl border border-gray-200 p-6 bg-white">
            <p className="text-lg font-semibold text-gray-900">
              Phân Bố Cửa Hàng Theo Khu Vực
            </p>
            <ProvinceChart />
          </div>

          {/* User Role Chart */}
          <div className="lg:col-span-2 flex flex-col gap-4 rounded-xl border border-gray-200 p-6 bg-white">
            <p className="text-lg font-semibold text-gray-900">
              Cơ Cấu Người Dùng
            </p>
            <UserRoleChart />
          </div>
        </div>

        {/* Store Status Chart */}
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-6 bg-white">
          <p className="text-lg font-semibold text-gray-900">
            Trạng Thái Hoạt Động Của Cửa Hàng
          </p>
          <StoreStatusChart />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
