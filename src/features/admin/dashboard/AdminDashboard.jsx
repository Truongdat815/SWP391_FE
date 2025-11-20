import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery } from '../../../api/admin/userApi';
import { useGetAllStoresQuery, useGetMonthlyRevenueQuery, useGetTotalMonthlyRevenueQuery } from '../../../api/admin/storeApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { normalizeRole } from '../../../utils/roleUtils';
import AdminLayout from '../../../components/layout/AdminLayout';
import { TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // API calls
  const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useGetAllUsersQuery();
  const { data: storesData, isLoading: isLoadingStores, error: storesError } = useGetAllStoresQuery();
  const { data: revenueData, isLoading: isLoadingRevenue, error: revenueError } = useGetMonthlyRevenueQuery();
  const { data: totalMonthlyRevenueData, isLoading: isLoadingTotalRevenue, error: totalRevenueError } = useGetTotalMonthlyRevenueQuery();
  const { data: modelsData, isLoading: isLoadingModels, error: modelsError } = useGetAllModelsQuery();

  const users = usersData?.data || [];
  const stores = storesData?.data || [];
  const monthlyRevenues = revenueData?.data || [];
  const totalMonthlyRevenue = totalMonthlyRevenueData?.data || {};
  const models = modelsData?.data || [];

  const isLoading = isLoadingUsers || isLoadingStores || isLoadingRevenue || isLoadingTotalRevenue || isLoadingModels;
  
  const isUnauthorized = 
    usersError?.status === 401 || 
    storesError?.status === 401 || 
    revenueError?.status === 401 ||
    totalRevenueError?.status === 401 ||
    modelsError?.status === 401;
  
  const hasError = (usersError && usersError.status !== 401) || 
                   (storesError && storesError.status !== 401);

  // Tính toán metrics
  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === 'ACTIVE').length;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
  
  // Tính tổng doanh thu theo tháng từ API /stores/revenue/monthly
  const totalRevenue = useMemo(() => {
    if (monthlyRevenues?.length > 0) {
      // Tính tổng monthlyRevenue từ tất cả các store
      const total = monthlyRevenues.reduce((sum, store) => {
        return sum + (parseFloat(store.monthlyRevenue) || 0);
      }, 0);
      
      // Format số tiền
      if (total >= 1000000000000) {
        return `${(total / 1000000000000).toFixed(1)} Tỷ`;
      } else if (total >= 1000000000) {
        return `${(total / 1000000000).toFixed(1)} Tỷ`;
      } else if (total >= 1000000) {
        return `${(total / 1000000).toFixed(1)}M VND`;
      } else if (total >= 1000) {
      return `${(total / 1000).toFixed(1)}K VND`;
      }
      return `${total.toLocaleString('vi-VN')} VND`;
    }
    return '0 VND';
  }, [monthlyRevenues]);

  // Phân bố cửa hàng theo tỉnh (hiển thị tất cả các tỉnh có dữ liệu)
  const storesByProvince = useMemo(() => {
    const provinceMap = {};
    stores.forEach(store => {
      const province = store.provinceName || store.province || 'Khác';
      if (province && province !== '') {
      provinceMap[province] = (provinceMap[province] || 0) + 1;
      }
    });
    
    // Sắp xếp theo số lượng cửa hàng giảm dần
    const sortedProvinces = Object.entries(provinceMap)
      .map(([name, count]) => ({
      name,
        count,
        percentage: totalStores > 0 ? (count / totalStores) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
    
    return sortedProvinces;
  }, [stores, totalStores]);

  // Phân bố người dùng theo role (không gồm admin)
  const usersByRole = useMemo(() => {
    // Lọc bỏ admin và phân loại các role còn lại
    let dealerManagerCount = 0;  // DEALER_MANAGER
    let dealerStaffCount = 0;    // DEALER_STAFF
    let evmStaffCount = 0;       // EVM_STAFF
    
    users.forEach(user => {
      const roleName = user.roleName || '';
      const normalizedRole = normalizeRole(roleName);
      
      // Bỏ qua admin
      if (normalizedRole === 'ADMIN') {
        return;
      }
      
      // Phân loại các role còn lại - ưu tiên kiểm tra theo thứ tự
      if (normalizedRole === 'DEALER_MANAGER') {
        dealerManagerCount++;
      } else if (normalizedRole === 'DEALER_STAFF') {
        dealerStaffCount++;
      } else if (normalizedRole === 'EVM_STAFF') {
        evmStaffCount++;
      }
      // Nếu không match với role nào đã biết, bỏ qua (không đếm vào)
      else if (import.meta.env.DEV && normalizedRole && normalizedRole !== 'ADMIN') {
        console.warn('Unknown role detected:', roleName, '-> normalized:', normalizedRole);
      }
    });
    
    const total = dealerManagerCount + dealerStaffCount + evmStaffCount;
    
    if (import.meta.env.DEV && total > 0) {
      console.log('User role distribution:', {
        DEALER_MANAGER: dealerManagerCount,
        DEALER_STAFF: dealerStaffCount,
        EVM_STAFF: evmStaffCount,
        total
      });
    }
    
    return {
      manager: { 
        count: dealerManagerCount, 
        percentage: total > 0 ? (dealerManagerCount / total) * 100 : 0 
      },
      dealerStaff: { 
        count: dealerStaffCount, 
        percentage: total > 0 ? (dealerStaffCount / total) * 100 : 0 
      },
      evmStaff: { 
        count: evmStaffCount, 
        percentage: total > 0 ? (evmStaffCount / total) * 100 : 0 
      }
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
      <div className="text-base font-medium text-gray-600">{title}</div>
      {value && (
      <p className="text-3xl font-bold tracking-tight text-gray-900">
        {value}
        {subtitle && (
          <span className="text-xl font-medium text-gray-500 ml-1">
            {subtitle}
          </span>
        )}
      </p>
      )}
      {trend && trendText && (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <p className="text-sm font-medium">{trendText}</p>
        </div>
      )}
    </div>
  );

  const ProvinceChart = () => {
    if (storesByProvince.length === 0) {
      return (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">Chưa có dữ liệu cửa hàng</p>
        </div>
      );
    }
    
    const maxCount = Math.max(...storesByProvince.map(p => p.count), 1);
    const displayedProvinces = storesByProvince.slice(0, 10); // Hiển thị tối đa 10 tỉnh
    
    return (
      <div className="space-y-3">
        {displayedProvinces.map((province) => {
          const width = maxCount > 0 ? (province.count / maxCount) * 100 : 0;
          return (
            <div key={province.name} className="flex items-center gap-4">
              <div className="w-32 text-sm font-medium text-gray-700 truncate" title={province.name}>
              {province.name}
        </div>
              <div className="flex-1 relative">
                <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                    style={{ width: `${width}%` }}
                  >
                    <span className="text-xs font-medium text-white">
                      {province.count}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-16 text-sm text-gray-600 text-right">
                {province.percentage.toFixed(1)}%
              </div>
            </div>
            );
          })}
        {storesByProvince.length > 10 && (
          <div className="text-center text-sm text-gray-500 pt-2">
            Và {storesByProvince.length - 10} khu vực khác
        </div>
        )}
      </div>
    );
  };

  const UserRoleChart = () => {
    const { manager, dealerStaff, evmStaff } = usersByRole;
    const total = manager.percentage + dealerStaff.percentage + evmStaff.percentage;
    
    // Màu sắc: Manager (green), Dealer Staff (blue), EVM Staff (orange)
    const gradient = total > 0 
      ? `conic-gradient(from 0deg, #10B981 0% ${manager.percentage}%, #3B82F6 ${manager.percentage}% ${manager.percentage + dealerStaff.percentage}%, #F97316 ${manager.percentage + dealerStaff.percentage}% 100%)`
      : 'conic-gradient(from 0deg, #e5e7eb 0% 100%)';
    
    return (
      <>
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="relative size-48">
            <div 
              className="absolute inset-0 rounded-full"
              style={{ backgroundImage: gradient }}
            />
            <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {manager.count + dealerStaff.count + evmStaff.count}
                </p>
                <p className="text-xs text-gray-600">Người dùng</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-green-500" />
              <p className="text-sm font-medium text-gray-600">Quản lý</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {manager.count}
            </p>
            <p className="text-xs text-gray-500">
              {manager.percentage.toFixed(1)}%
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-blue-500" />
              <p className="text-sm font-medium text-gray-600">Nhân viên</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {dealerStaff.count}
            </p>
            <p className="text-xs text-gray-500">
              {dealerStaff.percentage.toFixed(1)}%
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-orange-500" />
              <p className="text-sm font-medium text-gray-600">EVM Staff</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {evmStaff.count}
            </p>
            <p className="text-xs text-gray-500">
              {evmStaff.percentage.toFixed(1)}%
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
      <div className="p-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng Số Cửa Hàng"
            value={activeStores}
            subtitle={`/${totalStores} đang hoạt động`}
            trend={true}
            trendText="+5% so với tháng trước"
          />
          <StatCard
            title="Tổng Số Người Dùng"
            value={activeUsers}
            subtitle={`/${totalUsers} đang hoạt động`}
            trend={true}
            trendText="+12% so với tháng trước"
          />
          <StatCard
            title={
              <div>
                <div>Tổng Số Đơn Hàng</div>
                <div className="text-lg font-normal text-gray-700 mt-1">
                  <span className="font-bold text-gray-900">{totalMonthlyRevenue?.totalOrders?.toLocaleString('vi-VN') || '0'} đơn</span> tháng {totalMonthlyRevenue?.month || ''}/{totalMonthlyRevenue?.year || ''}
                </div>
              </div>
            }
            value=""
            trend={true}
            trendText="+8.5% so với tháng trước"
          />
          <StatCard
            title={
              <div>
                <div>Tổng Doanh Thu Tháng</div>
                <div className="text-lg font-normal text-gray-700 mt-1">
                  <span className="font-bold text-gray-900">{totalRevenue}</span> tháng {totalMonthlyRevenue?.month || ''}/{totalMonthlyRevenue?.year || ''}
                </div>
              </div>
            }
            value=""
            trend={true}
            trendText="+15.2% so với tháng trước"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
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
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
