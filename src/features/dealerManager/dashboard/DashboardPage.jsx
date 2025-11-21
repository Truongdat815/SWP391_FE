import { useMemo, useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import MetricCard from '../../../components/shared/MetricCard';
import Card from '../../../components/ui/Card';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import LineChart from '../../../components/charts/LineChart';
import BarChart from '../../../components/charts/BarChart';
import { useGetAllOrdersQuery } from '../../../api/dealerManager/dmOrderApi';
import { useGetAllStoreStocksQuery } from '../../../api/dealerManager/inventoryApi';
import { useGetMonthlyRevenueQuery } from '../../../api/dealerManager/storeApi';
import { useGetAllStaffQuery } from '../../../api/dealerManager/staffApi';
import { getModelImageUrl } from '../../../utils/modelImageHelper';

const DealerManagerDashboard = () => {
  const [dashboardPage, setDashboardPage] = useState(1); // Trang dashboard: 1 = KPI + Charts, 2 = Chi tiết
  const [currentPage, setCurrentPage] = useState(1);
  const [isAllOrdersModalOpen, setIsAllOrdersModalOpen] = useState(false);
  const ordersPerPage = 5;
  
  const { data: ordersData, isLoading: isLoadingOrders, error: ordersError } = useGetAllOrdersQuery();
  const { data: revenueData, isLoading: isLoadingRevenue, error: revenueError } = useGetMonthlyRevenueQuery();
  const { data: stocksData, isLoading: isLoadingStocks, error: stocksError } = useGetAllStoreStocksQuery();
  const { data: staffData } = useGetAllStaffQuery();

  const orders = ordersData?.data || [];
  // API từ storeApi có transformResponse trả về { data: revenues[0] || null }
  // revenues[0] có thể là object { month, year, totalRevenue, storeId } hoặc null
  const monthlyRevenue = revenueData?.data;
  const stocks = stocksData?.data || [];
  const allStaff = staffData?.data || [];

  // Debug logging trong development
  if (import.meta.env.DEV) {
    console.log('Dashboard Data:', {
      ordersData: ordersData,
      ordersCount: orders.length,
      revenueData: revenueData,
      monthlyRevenue,
      stocksCount: stocks.length,
      ordersSample: orders.slice(0, 2),
    });
  }

  const isLoading = isLoadingOrders || isLoadingRevenue || isLoadingStocks;
  
  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = 
    ordersError?.status === 401 || 
    revenueError?.status === 401 || 
    stocksError?.status === 401;
  
  const hasError = (ordersError && ordersError.status !== 401) || 
                   (revenueError && revenueError.status !== 401);

  // Tính toán metrics - Doanh thu tháng hiện tại từ API store revenue
  const currentMonthRevenue = useMemo(() => {
    // API từ storeApi có transformResponse trả về { data: revenues[0] || null }
    // revenues[0] là object { month, year, totalRevenue, storeId } hoặc null
    if (monthlyRevenue && typeof monthlyRevenue === 'object' && !Array.isArray(monthlyRevenue)) {
      // Kiểm tra nếu là object có totalRevenue (từ transformResponse)
      if (monthlyRevenue.totalRevenue !== undefined) {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        // Chỉ dùng nếu là tháng hiện tại
        if (monthlyRevenue.month === currentMonth && monthlyRevenue.year === currentYear) {
          const revenue = parseFloat(monthlyRevenue.totalRevenue) || 0;
          if (import.meta.env.DEV) {
            console.log('Using monthly revenue from API:', revenue);
          }
          return revenue;
        }
      }
    }
    
    // Nếu là array (fallback nếu transformResponse không hoạt động)
    if (Array.isArray(monthlyRevenue) && monthlyRevenue.length > 0) {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const revenue = monthlyRevenue.find(
        (rev) => rev.month === currentMonth && rev.year === currentYear
      );
      if (revenue?.totalRevenue !== undefined) {
        const total = parseFloat(revenue.totalRevenue) || 0;
        if (import.meta.env.DEV) {
          console.log('Using monthly revenue from API array:', total);
        }
        return total;
      }
    }
    
    // Fallback: Tính từ orders của tháng hiện tại nếu API không trả về
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthOrders = orders.filter((order) => {
      if (!order.createdAt && !order.orderDate) return false;
      try {
        const orderDate = new Date(order.createdAt || order.orderDate);
        // Chỉ tính các đơn đã hoàn thành hoặc đã thanh toán
        const isCompleted = order.status === 'DELIVERED' || 
                          order.status === 'FULLY_PAID' || 
                          order.status === 'CONFIRMED';
        return (
          orderDate.getMonth() === currentMonth &&
          orderDate.getFullYear() === currentYear &&
          isCompleted
        );
      } catch {
        return false;
      }
    });
    
    const total = monthOrders.reduce(
      (sum, order) => {
        const amount = parseFloat(order.totalAmount || order.totalPrice || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      },
      0
    );
    
    if (import.meta.env.DEV) {
      console.log('Calculated monthly revenue from orders:', {
        monthOrdersCount: monthOrders.length,
        totalOrders: orders.length,
        total,
      });
    }
    
    return total;
  }, [monthlyRevenue, orders]);

  const pendingOrders = orders.filter(
    (order) => order.status === 'PENDING' || order.status === 'DRAFT'
  ).length;

  const totalOrdersThisMonth = orders.filter((order) => {
    const orderDate = new Date(order.createdAt || order.orderDate);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }).length;

  // Tổng số xe mà chi nhánh có (không phân biệt status)
  const totalCars = stocks.length;

  // Nhóm stocks theo modelName và colorName, cộng dồn số lượng thực tế
  const stockSummary = useMemo(() => {
    const summaryMap = new Map();
    
    stocks.forEach((stock) => {
      const key = `${stock.modelName || 'N/A'}_${stock.colorName || 'N/A'}`;
      // Lấy số lượng thực tế từ stock
      const stockQuantity = parseInt(stock.quantity || stock.stockQuantity || 0);
      const actualQuantity = isNaN(stockQuantity) ? 0 : stockQuantity;
      
      if (summaryMap.has(key)) {
        summaryMap.set(key, {
          ...summaryMap.get(key),
          quantity: summaryMap.get(key).quantity + actualQuantity,
        });
      } else {
        summaryMap.set(key, {
          modelName: stock.modelName || 'N/A',
          colorName: stock.colorName || 'N/A',
          colorCode: stock.colorCode || stock.color?.colorCode || null, // Lưu colorCode nếu có
          quantity: actualQuantity,
        });
      }
    });
    
    return Array.from(summaryMap.values()).sort((a, b) => {
      // Sắp xếp theo modelName trước, sau đó theo colorName
      if (a.modelName !== b.modelName) {
        return a.modelName.localeCompare(b.modelName);
      }
      return a.colorName.localeCompare(b.colorName);
    });
  }, [stocks]);

  // Revenue chart data (4 tuần gần nhất)
  const revenueChartData = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) {
      if (import.meta.env.DEV) {
        console.log('No orders data available for chart', {
          ordersData,
          ordersIsArray: Array.isArray(orders),
          ordersLength: orders?.length,
        });
      }
      // Trả về dữ liệu mặc định nếu chưa có orders
      return [
        { name: 'Tuần 1', value: 0 },
        { name: 'Tuần 2', value: 0 },
        { name: 'Tuần 3', value: 0 },
        { name: 'Tuần 4', value: 0 },
      ];
    }

    const weeks = [];
    const now = new Date();
    now.setHours(23, 59, 59, 999); // Set to end of day for accurate comparison
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0); // Start of week
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999); // End of week

      const weekOrders = orders.filter((order) => {
        if (!order.createdAt && !order.orderDate) return false;
        try {
          const orderDate = new Date(order.createdAt || order.orderDate);
          // Chỉ tính các đơn đã hoàn thành hoặc đã thanh toán
          const isCompleted = order.status === 'DELIVERED' || 
                             order.status === 'FULLY_PAID' || 
                             order.status === 'CONFIRMED';
          return orderDate >= weekStart && orderDate <= weekEnd && isCompleted;
        } catch (e) {
          return false;
        }
      });

      const weekTotal = weekOrders.reduce(
        (sum, order) => {
          const amount = parseFloat(order.totalAmount || order.totalPrice || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        },
        0
      );
      
      weeks.push({
        name: `Tuần ${4 - i}`,
        value: Math.round(weekTotal / 1000000), // Convert to millions
      });
    }
    
    if (import.meta.env.DEV) {
      console.log('Revenue Chart Data:', {
        weeks,
        totalOrders: orders.length,
        completedOrders: orders.filter(o => 
          o.status === 'DELIVERED' || o.status === 'FULLY_PAID' || o.status === 'CONFIRMED'
        ).length,
      });
    }
    
    return weeks.length > 0 ? weeks : [
      { name: 'Tuần 1', value: 0 },
      { name: 'Tuần 2', value: 0 },
      { name: 'Tuần 3', value: 0 },
      { name: 'Tuần 4', value: 0 },
    ];
  }, [orders, ordersData]);

  const formatRevenue = (amount) => {
    if (!amount || amount === 0) return '0₫';
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} Tỷ`;
    } else if (amount >= 1000000) {
      return `${Math.round(amount / 1000000)} Triệu`;
    }
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + '₫';
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  // Tính doanh số theo nhân viên (từ các đơn đã hoàn thành)
  const staffRevenueData = useMemo(() => {
    const staffMap = {};
    
    // Lọc các đơn đã hoàn thành hoặc đã thanh toán
    const completedOrders = orders.filter((order) => 
      order.status === 'DELIVERED' || 
      order.status === 'FULLY_PAID' || 
      order.status === 'CONFIRMED'
    );
    
    completedOrders.forEach((order) => {
      const staffId = order.staffId?.toString() || order.createdBy?.toString() || 'unknown';
      const staffName = order.staffName || 
                       allStaff.find(s => s.userId?.toString() === staffId)?.fullName || 
                       'Không xác định';
      const amount = parseFloat(order.totalAmount || order.totalPrice || 0);
      
      if (!staffMap[staffId]) {
        staffMap[staffId] = {
          id: staffId,
          name: staffName,
          revenue: 0,
        };
      }
      
      staffMap[staffId].revenue += isNaN(amount) ? 0 : amount;
    });
    
    // Chuyển đổi sang format cho biểu đồ và sắp xếp theo doanh số giảm dần
    return Object.values(staffMap)
      .map((staff) => ({
        name: staff.name,
        value: Math.round(staff.revenue / 1000000), // Convert to millions
        revenue: staff.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 nhân viên
  }, [orders, allStaff]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  // Helper function để lấy tên nhân viên từ order
  const getStaffName = (order) => {
    if (order.staffName) {
      return order.staffName;
    }
    const staffId = order.staffId?.toString() || order.createdBy?.toString();
    if (staffId) {
      const staff = allStaff.find(s => s.userId?.toString() === staffId);
      if (staff?.fullName) {
        return staff.fullName;
      }
    }
    return 'Không xác định';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      CONFIRMED: { variant: 'info', label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      DELIVERING: { variant: 'info', label: 'Đang giao', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      DELIVERED: { variant: 'success', label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      FULLY_PAID: { variant: 'success', label: 'Đã thanh toán', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      DEPOSIT_PAID: { variant: 'info', label: 'Đã đặt cọc', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      CONTRACT_SIGNED: { variant: 'info', label: 'Đã ký hợp đồng', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      CONTRACT_PENDING: { variant: 'warning', label: 'Chờ ký hợp đồng', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      CANCELLED: { variant: 'error', label: 'Đã hủy', color: 'bg-red-50 text-red-700 border-red-200' },
      DRAFT: { variant: 'default', label: 'Nháp', color: 'bg-gray-50 text-gray-700 border-gray-200' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A', color: 'bg-gray-50 text-gray-700 border-gray-200' };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Lấy các đơn hàng mới nhất (sắp xếp theo ngày tạo, mới nhất trước)
  const recentOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.orderDate || a.createdDate || 0);
      const dateB = new Date(b.createdAt || b.orderDate || b.createdDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
    return sorted;
  }, [orders]);

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(recentOrders.length / ordersPerPage));
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = recentOrders.slice(startIndex, endIndex);

  // Reset về trang 1 khi số lượng orders thay đổi đáng kể
  useEffect(() => {
    const newTotalPages = Math.ceil(recentOrders.length / ordersPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1);
    }
  }, [recentOrders.length, currentPage, ordersPerPage]);

  if (isLoading) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </DealerManagerLayout>
    );
  }

  // Hiển thị thông báo nếu chưa đăng nhập (401)
  if (isUnauthorized) {
    return (
      <DealerManagerLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-yellow-600 text-lg font-medium">
            ⚠️ Bạn chưa đăng nhập hoặc token đã hết hạn
          </div>
          <div className="text-gray-600 text-sm">
            Vui lòng đăng nhập để truy cập các tính năng này.
          </div>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đi đến trang đăng nhập
          </a>
        </div>
      </DealerManagerLayout>
    );
  }

  if (hasError) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.
          </div>
        </div>
      </DealerManagerLayout>
    );
  }

  return (
    <DealerManagerLayout>
      <div className="p-4 min-h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Tổng quan</h1>
          <p className="text-gray-600 text-sm">Xem tổng quan hoạt động của đại lý</p>
        </div>

        {/* Tabs phân trang */}
        <div className="flex gap-2 mb-4 border-b border-gray-200">
          <button
            onClick={() => setDashboardPage(1)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              dashboardPage === 1
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setDashboardPage(2)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              dashboardPage === 2
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chi tiết
          </button>
        </div>

        <div className={`flex-1 ${dashboardPage === 2 ? 'overflow-hidden' : 'space-y-4 overflow-y-auto'}`}>
        {/* Trang 1: KPI + Charts */}
        {dashboardPage === 1 && (
          <>
            {/* Metrics - KPI Cards - Ưu tiên cao nhất */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Tổng Doanh Thu (Tháng)"
                value={formatRevenue(currentMonthRevenue)}
                icon={DollarSign}
              />
              <MetricCard
                title="Đơn Hàng Chờ Duyệt"
                value={pendingOrders}
                icon={ShoppingCart}
              />
              <MetricCard
                title="Tổng Số Đơn Hàng (Tháng)"
                value={totalOrdersThisMonth}
                icon={TrendingUp}
              />
              <MetricCard
                title="Tổng Số Xe"
                value={totalCars}
                icon={Package}
              />
            </div>

            {/* Charts - Ưu tiên thứ 2 - Đặt ngang */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="flex flex-col shadow-sm">
                <Card.Header className="pb-2 flex-shrink-0 border-b border-gray-100">
                  <Card.Title className="text-base font-semibold text-gray-900">Doanh Thu Theo Tuần</Card.Title>
                </Card.Header>
                <Card.Content className="p-4 flex-1 flex items-center justify-center min-h-[300px]">
                  {revenueChartData && revenueChartData.length > 0 && revenueChartData.some(d => d.value > 0) ? (
                    <LineChart
                      data={revenueChartData}
                      dataKey="value"
                      name="Doanh thu (triệu VND)"
                      color="#3B82F6"
                      height={300}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <TrendingUp size={48} className="mb-2 opacity-50" />
                      <p className="text-sm">Chưa có dữ liệu để hiển thị</p>
                    </div>
                  )}
                </Card.Content>
              </Card>

              <Card className="flex flex-col shadow-sm">
                <Card.Header className="pb-2 flex-shrink-0 border-b border-gray-100">
                  <Card.Title className="text-base font-semibold text-gray-900">Doanh Số Theo Nhân Viên</Card.Title>
                </Card.Header>
                <Card.Content className="p-4 flex-1 flex items-center justify-center min-h-[300px]">
                  {staffRevenueData && staffRevenueData.length > 0 ? (
                    <BarChart
                      data={staffRevenueData}
                      dataKey="value"
                      name="Doanh số (triệu VND)"
                      color="#3B82F6"
                      height={300}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <TrendingUp size={48} className="mb-2 opacity-50" />
                      <p className="text-sm">Chưa có dữ liệu để hiển thị</p>
                    </div>
                  )}
                </Card.Content>
              </Card>
            </div>
          </>
        )}

        {/* Trang 2: Chi tiết số xe + Thống kê đơn hàng + Đơn hàng gần đây */}
        {dashboardPage === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-4 h-full overflow-hidden">
          {/* Chi tiết số xe theo mẫu và màu - Bên trái - Scroll trong card */}
          <Card className="flex flex-col shadow-sm h-full overflow-hidden">
            <Card.Header className="pb-2 flex-shrink-0 border-b border-gray-100">
              <Card.Title className="text-base font-semibold text-gray-900">Chi Tiết Số Xe Trong Kho</Card.Title>
            </Card.Header>
            <Card.Content className="p-0 flex-1 overflow-hidden flex flex-col min-h-0">
              {stockSummary.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm p-4">Chưa có xe nào trong kho</div>
              ) : (
                <div className="overflow-y-auto flex-1 min-h-0 p-2">
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head className="text-sm py-2 font-semibold">Mẫu Xe</Table.Head>
                        <Table.Head className="text-sm py-2 font-semibold">Màu Sắc</Table.Head>
                        <Table.Head className="text-sm text-right py-2 font-semibold">Số Lượng</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {stockSummary.map((item, index) => {
                        const modelImageUrl = getModelImageUrl(item.modelName);
                        return (
                        <Table.Row 
                          key={`${item.modelName}-${item.colorName}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <Table.Cell className="font-medium text-sm py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2" title={`${item.modelName} - ${item.colorName}`}>
                              {modelImageUrl && (
                                <img
                                  src={modelImageUrl}
                                  alt={item.modelName}
                                  className="w-10 h-10 object-cover rounded border border-gray-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <span>{item.modelName}</span>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="text-sm py-2 whitespace-nowrap">
                            <div className="flex items-center gap-2" title={item.colorName}>
                              {(item.colorCode || (item.colorName && /^#[0-9A-Fa-f]{6}$/.test(item.colorName))) && (
                                <div
                                  className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                                  style={{
                                    backgroundColor: item.colorCode || item.colorName,
                                  }}
                                />
                              )}
                              <span>{item.colorName}</span>
                            </div>
                          </Table.Cell>
                          <Table.Cell className="text-right font-semibold text-sm py-2 whitespace-nowrap">
                            {item.quantity}
                          </Table.Cell>
                        </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table>
                </div>
              )}
            </Card.Content>
          </Card>

          {/* Bên phải: Thống kê đơn hàng và Đơn hàng gần đây */}
          <div className="space-y-3 flex flex-col h-full overflow-hidden">
            {/* Thống kê đơn hàng */}
            <Card className="shadow-sm flex-shrink-0">
              <Card.Header className="pb-2 flex-shrink-0 border-b border-gray-100">
                <Card.Title className="text-base font-semibold text-gray-900">Thống Kê Đơn Hàng</Card.Title>
              </Card.Header>
              <Card.Content className="p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-gray-700 text-sm font-medium">Đơn hàng mới hôm nay</span>
                    <span className="text-xl font-bold text-blue-600">
                      {orders.filter((order) => {
                        const orderDate = new Date(order.createdAt || order.orderDate);
                        const today = new Date();
                        return (
                          orderDate.getDate() === today.getDate() &&
                          orderDate.getMonth() === today.getMonth() &&
                          orderDate.getFullYear() === today.getFullYear()
                        );
                      }).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-gray-700 text-sm font-medium">Đơn hàng đang giao</span>
                    <span className="text-xl font-bold text-green-600">
                      {orders.filter((order) => order.status === 'DELIVERING').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <span className="text-gray-700 text-sm font-medium">Đơn hàng đã hoàn thành</span>
                    <span className="text-xl font-bold text-purple-600">
                      {orders.filter((order) => order.status === 'DELIVERED').length}
                    </span>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Recent Orders Table - Giới hạn 5 dòng */}
            <Card className="flex-1 shadow-sm overflow-hidden flex flex-col min-h-0">
              <Card.Header className="pb-2 flex-shrink-0 border-b border-gray-100 flex items-center justify-between">
                <Card.Title className="text-base font-semibold text-gray-900">Đơn Hàng Gần Đây</Card.Title>
                {recentOrders.length > 5 && (
                  <button 
                    onClick={() => setIsAllOrdersModalOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Xem tất cả
                  </button>
                )}
              </Card.Header>
              <Card.Content className="p-3 flex-1 overflow-hidden flex flex-col min-h-0">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">Chưa có đơn hàng nào</div>
                ) : (
                  <div className="overflow-y-auto flex-1 min-h-0">
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.Head className="text-sm py-2 font-semibold">Mã đơn</Table.Head>
                          <Table.Head className="text-sm py-2 font-semibold">Khách hàng</Table.Head>
                          <Table.Head className="text-sm py-2 font-semibold">Nhân viên</Table.Head>
                          <Table.Head className="text-sm py-2 font-semibold">Ngày</Table.Head>
                          <Table.Head className="text-sm py-2 font-semibold">Giá trị</Table.Head>
                          <Table.Head className="text-sm py-2 font-semibold">Trạng thái</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {recentOrders.slice(0, 5).map((order) => (
                          <Table.Row key={order.orderId} className="hover:bg-gray-50">
                            <Table.Cell className="font-mono text-sm py-2">
                              #{order.orderId || `ELEC-${order.orderId}`}
                            </Table.Cell>
                            <Table.Cell className="font-medium text-sm py-2">
                              {order.customerName || 'N/A'}
                            </Table.Cell>
                            <Table.Cell className="text-sm py-2">
                              {getStaffName(order)}
                            </Table.Cell>
                            <Table.Cell className="text-sm py-2">
                              {formatDate(order.createdAt || order.orderDate)}
                            </Table.Cell>
                            <Table.Cell className="font-semibold text-sm py-2">
                              {formatCurrency(order.totalAmount || order.totalPrice || 0)}
                            </Table.Cell>
                            <Table.Cell className="text-sm py-2">
                              {getStatusBadge(order.status)}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
        )}
        </div>
      </div>

      {/* Modal hiển thị toàn bộ đơn hàng */}
      <Modal
        isOpen={isAllOrdersModalOpen}
        onClose={() => setIsAllOrdersModalOpen(false)}
        title="Tất Cả Đơn Hàng"
        size="2xl"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">Chưa có đơn hàng nào</div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head className="text-sm py-2 font-semibold">Mã đơn</Table.Head>
                  <Table.Head className="text-sm py-2 font-semibold">Khách hàng</Table.Head>
                  <Table.Head className="text-sm py-2 font-semibold">Nhân viên</Table.Head>
                  <Table.Head className="text-sm py-2 font-semibold">Ngày</Table.Head>
                  <Table.Head className="text-sm py-2 font-semibold">Giá trị</Table.Head>
                  <Table.Head className="text-sm py-2 font-semibold">Trạng thái</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {recentOrders.map((order) => (
                  <Table.Row key={order.orderId} className="hover:bg-gray-50">
                    <Table.Cell className="font-mono text-sm py-2">
                      #{order.orderId || `ELEC-${order.orderId}`}
                    </Table.Cell>
                    <Table.Cell className="font-medium text-sm py-2">
                      {order.customerName || 'N/A'}
                    </Table.Cell>
                    <Table.Cell className="text-sm py-2">
                      {getStaffName(order)}
                    </Table.Cell>
                    <Table.Cell className="text-sm py-2">
                      {formatDate(order.createdAt || order.orderDate)}
                    </Table.Cell>
                    <Table.Cell className="font-semibold text-sm py-2">
                      {formatCurrency(order.totalAmount || order.totalPrice || 0)}
                    </Table.Cell>
                    <Table.Cell className="text-sm py-2">
                      {getStatusBadge(order.status)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </Modal>
    </DealerManagerLayout>
  );
};

export default DealerManagerDashboard;
