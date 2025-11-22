import { useMemo } from 'react';
import { DollarSign, Car, UserPlus, Plus, FileText, Calendar, TrendingUp, Star, Package, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LineChart from '../../../components/charts/LineChart';
import { useGetAllOrdersQuery } from '../../../api/dealerStaff/orderApi';
import { useGetAllCustomersQuery } from '../../../api/dealerStaff/customerApi';
import { useGetStoreStocksQuery } from '../../../api/dealerStaff/storeStockApi';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { formatCurrency } from '../../../utils/formatters';

const DealerStaffDashboard = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const staffId = user?.userId || user?.staffId || user?.id;
  
  // Debug: Log user và staffId
  console.log('user:', user);
  console.log('staffId:', staffId);

  const { data: ordersData, isLoading: isLoadingOrders, error } = useGetAllOrdersQuery();
  const { data: customersData, isLoading: isLoadingCustomers } = useGetAllCustomersQuery();
  const { data: storeStocksData, isLoading: isLoadingStoreStocks } = useGetStoreStocksQuery();

  // Sử dụng dữ liệu từ API /orders/all giống như OrderManagementPage
  const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];
  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  const storeStocks = Array.isArray(storeStocksData?.data) ? storeStocksData.data : [];

  // Tính toán stats từ API response giống như OrderManagementPage
  const stats = useMemo(() => {
    if (!Array.isArray(orders)) return { total: 0, monthlyRevenue: 0, growth: 0 };
    
    // Tính tổng đơn hàng
    const total = orders.length;
    
    // Tính doanh thu từ các đơn hàng có trạng thái đã thanh toán CỦA THÁNG HIỆN TẠI
    const revenueStatuses = ['DEPOSITED', 'FULLY_PAID', 'DELIVERED'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyRevenue = orders
      .filter(o => {
        // Lọc theo tháng hiện tại
        if (!o.orderDate && !o.createdAt) return false;
        const orderDate = new Date(o.orderDate || o.createdAt);
        const isCurrentMonth = orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        // Và có trạng thái đã thanh toán
        return isCurrentMonth && revenueStatuses.includes(o.status);
      })
      .reduce((sum, o) => sum + (o.totalPayment || 0), 0);
    
    // Tính tăng trưởng so với tháng trước
    const currentMonthOrders = orders.filter(order => {
      if (!order.orderDate && !order.createdAt) return false;
      const orderDate = new Date(order.orderDate || order.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    }).length;
    
    const lastMonthOrders = orders.filter(order => {
      if (!order.orderDate && !order.createdAt) return false;
      const orderDate = new Date(order.orderDate || order.createdAt);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    }).length;
    
    const growth = lastMonthOrders > 0 ? 
      Math.round(((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100) : 0;
    
    return { total, monthlyRevenue, growth };
  }, [orders]);

  // Sử dụng stats từ tính toán
  const totalOrders = stats.total;
  const monthlyRevenue = stats.monthlyRevenue;

  const isLoading = isLoadingOrders || isLoadingCustomers || isLoadingStoreStocks;

  const carsSold = Array.isArray(orders) ? orders.filter((o) => o.status === 'DELIVERED').length : 0;
  const newCustomers = Array.isArray(customers) ? customers.filter((c) => {
    if (!c?.createdAt) return false;
    const created = new Date(c.createdAt);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length : 0;

  // Order status counts
  const pendingConfirmation = Array.isArray(orders) ? orders.filter((o) => o.status === 'PENDING' || o.status === 'DRAFT').length : 0;
  const inProgress = Array.isArray(orders) ? orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING').length : 0;
  const pendingDelivery = Array.isArray(orders) ? orders.filter((o) => o.status === 'READY_FOR_DELIVERY').length : 0;
  const completed = Array.isArray(orders) ? orders.filter((o) => o.status === 'DELIVERED').length : 0;

  // Doanh số theo tháng (6 tháng gần nhất) - tính hoàn toàn từ orders data
  const monthlyRevenueChartData = useMemo(() => {
    const months = [];
    const now = new Date();
    const revenueStatuses = ['DEPOSITED', 'FULLY_PAID', 'DELIVERED'];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'short' });

      // Tính từ orders data - sử dụng cùng logic với trang quản lý đơn hàng
      const monthOrders = Array.isArray(orders) ? orders.filter((order) => {
        if (!order.createdAt && !order.orderDate) return false;
        const orderDate = new Date(order.createdAt || order.orderDate);
        return (
          orderDate.getMonth() === monthDate.getMonth() &&
          orderDate.getFullYear() === monthDate.getFullYear() &&
          revenueStatuses.includes(order.status)
        );
      }) : [];

      const total = monthOrders.reduce(
        (sum, order) => sum + (order.totalPayment || 0),
        0
      );

      months.push({
        name: monthName,
        value: Math.round(total / 1000000), // Convert to millions
      });
    }
    return months.length > 0 ? months : [
      { name: 'Tháng 1', value: 0 },
      { name: 'Tháng 2', value: 0 },
      { name: 'Tháng 3', value: 0 },
      { name: 'Tháng 4', value: 0 },
      { name: 'Tháng 5', value: 0 },
      { name: 'Tháng 6', value: 0 },
    ];
  }, [orders]);

  // Phân bố đơn hàng theo trạng thái
  const orderStatusData = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    const statusCounts = {
      DELIVERED: 0,
      CONFIRMED: 0,
      PENDING: 0,
      DRAFT: 0,
      CANCELLED: 0,
    };

    orders.forEach((order) => {
      const status = order.status || 'DRAFT';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        name: status === 'DELIVERED' ? 'Hoàn thành' :
          status === 'CONFIRMED' ? 'Đã xác nhận' :
            status === 'PENDING' ? 'Chờ duyệt' :
              status === 'DRAFT' ? 'Nháp' :
                status === 'CANCELLED' ? 'Đã hủy' : status,
        value: count,
      }));
  }, [orders]);

  // Recent activities từ orders thực tế
  const recentActivities = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders
      .filter((order) => order.orderId)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.orderDate || 0);
        const dateB = new Date(b.createdAt || b.orderDate || 0);
        return dateB - dateA;
      })
      .slice(0, 3)
      .map((order) => {
        const timeAgo = (() => {
          const orderDate = new Date(order.createdAt || order.orderDate);
          const now = new Date();
          const diffMs = now - orderDate;
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          if (diffMins < 60) return `${diffMins} phút trước`;
          if (diffHours < 24) return `${diffHours} giờ trước`;
          return `${diffDays} ngày trước`;
        })();

        return {
          type: order.status === 'DELIVERED' ? 'order_completed' :
            order.status === 'CONFIRMED' ? 'order_approved' :
              'order_created',
          message: order.status === 'DELIVERED'
            ? `Đơn hàng #${order.orderId} đã hoàn thành.`
            : order.status === 'CONFIRMED'
              ? `Đơn hàng #${order.orderId} đã được duyệt.`
              : `Đơn hàng #${order.orderId} đã được tạo.`,
          time: timeAgo,
          icon: order.status === 'DELIVERED' ? 'check' :
            order.status === 'CONFIRMED' ? 'check' :
              'file',
        };
      });
  }, [orders]);

  // Vehicle stock statistics - Group by model and calculate total available stock per model
  const vehicleStockStats = useMemo(() => {
    if (!Array.isArray(storeStocks) || storeStocks.length === 0) return { lowStock: 0, totalModels: 0 };
    
    // Group stocks by modelId (same logic as StoreStockPage)
    const groupedByModel = {};
    storeStocks.forEach(stock => {
      const modelId = stock.modelId || 'unknown';
      const modelName = stock.modelName || 'Không xác định';
      
      if (!groupedByModel[modelId]) {
        groupedByModel[modelId] = {
          modelId,
          modelName,
          totalAvailableStock: 0
        };
      }
      // Sum up availableStock for each model (not quantity)
      groupedByModel[modelId].totalAvailableStock += (stock.availableStock || 0);
    });
    
    const modelGroups = Object.values(groupedByModel);
    const totalModels = modelGroups.length;
    
    // Count models with low stock: availableStock > 0 && availableStock < 5
    const lowStockThreshold = 5;
    const lowStock = modelGroups.filter(group => {
      const available = group.totalAvailableStock || 0;
      return available > 0 && available < lowStockThreshold;
    }).length;
    
    return { lowStock, totalModels };
  }, [storeStocks]);

  // Low stock vehicles details - Group by model and calculate total available stock per model
  const lowStockVehicles = useMemo(() => {
    if (!Array.isArray(storeStocks) || storeStocks.length === 0) return [];
    
    // Group stocks by modelId (same logic as vehicleStockStats)
    const groupedByModel = {};
    storeStocks.forEach(stock => {
      const modelId = stock.modelId || 'unknown';
      const modelName = stock.modelName || 'Không xác định';
      
      if (!groupedByModel[modelId]) {
        groupedByModel[modelId] = {
          modelId,
          modelName,
          totalAvailableStock: 0
        };
      }
      groupedByModel[modelId].totalAvailableStock += (stock.availableStock || 0);
    });
    
    const modelGroups = Object.values(groupedByModel);
    const lowStockThreshold = 5;
    
    // Filter models with low stock and sort by availableStock
    return modelGroups
      .filter(group => {
        const available = group.totalAvailableStock || 0;
        return available > 0 && available < lowStockThreshold;
      })
      .sort((a, b) => a.totalAvailableStock - b.totalAvailableStock)
      .slice(0, 5);
  }, [storeStocks]);


  // Order status statistics - Manual calculation from orders array
  const orderStatusStats = useMemo(() => {
    if (!Array.isArray(orders)) return { statusList: [], totalOrders: 0 };
    
    // Manual calculation - count each status from orders array
    let delivered = 0;
    let fullyPaid = 0; 
    let deposited = 0;
    let contractSigned = 0;
    let confirmed = 0;
    let contract = 0;
    let draft = 0;
    
    // Loop through orders and count manually
    orders.forEach(order => {
      const status = order.status;
      if (status === 'DELIVERED') delivered++;
      else if (status === 'FULLY_PAID') fullyPaid++;
      else if (status === 'DEPOSITED') deposited++;
      else if (status === 'CONTRACT_SIGNED') contractSigned++;
      else if (status === 'CONFIRMED') confirmed++;
      else if (status === 'CONTRACT_PENDING') contract++;
      else if (status === 'DRAFT') draft++;
    });

    // Create status list with manual counts (theo thứ tự yêu cầu)
    const statusList = [
      { 
        status: 'DELIVERED', 
        label: 'Đã giao', 
        color: 'bg-green-500', 
        bgColor: 'bg-green-50', 
        textColor: 'text-green-600',
        count: delivered 
      },
      { 
        status: 'FULLY_PAID', 
        label: 'Đã thanh toán đủ', 
        color: 'bg-blue-500', 
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-600',
        count: fullyPaid 
      },
      { 
        status: 'DEPOSITED', 
        label: 'Đã đặt cọc', 
        color: 'bg-purple-500', 
        bgColor: 'bg-purple-50', 
        textColor: 'text-purple-600',
        count: deposited 
      },
      { 
        status: 'CONTRACT_SIGNED', 
        label: 'Đã kí', 
        color: 'bg-indigo-500', 
        bgColor: 'bg-indigo-50', 
        textColor: 'text-indigo-600',
        count: contractSigned 
      },
      { 
        status: 'CONFIRMED', 
        label: 'Đã xác nhận', 
        color: 'bg-amber-500', 
        bgColor: 'bg-amber-50', 
        textColor: 'text-amber-600',
        count: confirmed 
      },
      { 
        status: 'CONTRACT_PENDING', 
        label: 'Hợp đồng', 
        color: 'bg-cyan-500', 
        bgColor: 'bg-cyan-50', 
        textColor: 'text-cyan-600',
        count: contract 
      },
      { 
        status: 'DRAFT', 
        label: 'Nháp', 
        color: 'bg-gray-500', 
        bgColor: 'bg-gray-50', 
        textColor: 'text-gray-600',
        count: draft 
      }
    ];

    return { statusList, totalOrders: orders.length };
  }, [orders]);



  if (isLoading) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </DealerStaffLayout>
    );
  }

  return (
    <DealerStaffLayout
      title="Dashboard - Tổng quan hiệu suất"
      description="Chào mừng trở lại, cùng xem hiệu suất của bạn hôm nay."
    >
      <div className="mx-auto max-w-[90rem] px-0 py-4 pl-10 pr-10 pt-8 space-y-4">
        {/* Filter Actions */}
        

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-base font-medium">Tổng Đơn Hàng</p>
            <p className="text-slate-900 text-3xl font-bold tracking-tight">
              {isLoadingOrders ? 'Đang tải...' : (totalOrders || 'N/A')}
            </p>
            <div className={`flex items-center gap-1 ${stats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp size={16} />
              <p className="text-sm font-medium">
                {stats.growth >= 0 ? '+' : ''}{stats.growth}% so với tháng trước
              </p>
            </div>
          </Card>
          <Card className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-base font-medium">Tổng Doanh Thu (Tháng này)</p>
            <p className="text-slate-900 text-3xl font-bold tracking-tight">
              {isLoadingOrders ? 'Đang tải...' : (monthlyRevenue ? formatCurrency(monthlyRevenue) : 'N/A')}
            </p>
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp size={16} />
              <p className="text-sm font-medium">+8.5% so với tháng trước</p>
            </div>
          </Card>
          <Card className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm">
            <p className="text-slate-600 text-base font-medium">Dòng Xe Sắp Hết</p>
            <p className="text-slate-900 text-3xl font-bold tracking-tight">{vehicleStockStats.lowStock}</p>
            <div className="flex items-center gap-1 text-amber-600">
              <AlertTriangle size={16} />
              <p className="text-sm font-medium">Cần nhập thêm hàng</p>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 flex flex-col rounded-xl p-6 bg-white border border-slate-200 shadow-sm min-h-[500px]">
            <div className="flex flex-col gap-2 mb-4">
            <p className="text-slate-800 text-lg font-semibold">Doanh thu theo tháng</p>
            <p className="text-slate-900 text-3xl font-bold tracking-tight truncate">
              {isLoadingOrders ? 'Đang tải...' : (monthlyRevenue ? formatCurrency(monthlyRevenue) : 'N/A')}
            </p>
            <div className="flex gap-2">
                <p className="text-slate-500 text-sm font-normal">6 tháng gần nhất</p>
              <p className="text-green-600 text-sm font-medium">+12.5%</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0" style={{ height: '100%' }}>
              <div className="w-full h-full">
                <LineChart
                  data={monthlyRevenueChartData}
                  dataKey="value"
                  name="Doanh số (triệu VND)"
                  color="#1392ec"
                />
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm min-h-[500px]">
            <p className="text-slate-800 text-lg font-semibold">Thống Kê Trạng Thái Đơn Hàng</p>
            <p className="text-slate-900 text-3xl font-bold tracking-tight truncate">{orderStatusStats.totalOrders} đơn</p>
            <div className="flex gap-2">
              <p className="text-slate-500 text-sm font-normal">Tổng số đơn hàng</p>
              <p className="text-blue-600 text-sm font-medium">
                {orderStatusStats.statusList.length > 0 ? 
                  `${orderStatusStats.statusList[0].label}: ${orderStatusStats.statusList[0].count}` : 
                  'Chưa có dữ liệu'}
              </p>
            </div>
            
            {/* Order Status List */}
            <div className="flex-1 pt-4 flex flex-col min-h-0 overflow-y-auto">
              <div className="space-y-2">
                {orderStatusStats.statusList.map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-2.5 ${item.bgColor} rounded-lg border`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                      <span className="text-sm font-medium text-slate-700">
                        {item.label}:
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${item.textColor}`}>
                        {item.count}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({orderStatusStats.totalOrders > 0 ? ((item.count / orderStatusStats.totalOrders) * 100).toFixed(1) : '0.0'}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>


      </div>
    </DealerStaffLayout>
  );
};

export default DealerStaffDashboard;
