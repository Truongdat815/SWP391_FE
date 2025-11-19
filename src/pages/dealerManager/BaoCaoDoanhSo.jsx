import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../store/slices/orderSlice';

  const periods = [
    { id: 'week', name: 'Tuần này' },
    { id: 'month', name: 'Tháng này' },
    { id: 'quarter', name: 'Quý này' },
    { id: 'year', name: 'Năm này' },
    { id: 'custom', name: 'Tùy chỉnh' }
  ];

  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

const modelColors = ['#ef4444', '#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#64748b'];

const REVENUE_FIELDS = ['totalPayment', 'totalPrice', 'totalAmount', 'total_amount', 'total'];

const COMPLETED_STATUSES = ['COMPLETED', 'FINISH', 'DELIVERED'];
const PENDING_STATUSES = ['PENDING', 'DRAFT', 'REQUESTED'];
const PROCESSING_STATUSES = [
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
const PAID_STATUSES = [
  ...COMPLETED_STATUSES,
  'PAYMENT_CONFIRMED',
  'FULLY_PAID',
  'PAID'
];

function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function extractOrderRevenue(order) {
  for (const field of REVENUE_FIELDS) {
    if (order[field] !== undefined && order[field] !== null) {
      const value = parseNumber(order[field]);
      if (value > 0) return value;
    }
  }
  // Fall back to sum of details if available
  const details = order.getOrderDetailsResponses || order.orderDetails || [];
  if (Array.isArray(details) && details.length) {
    return details.reduce((sum, detail) => {
      const total =
        parseNumber(detail.totalPrice) ||
        parseNumber(detail.totalAmount) ||
        parseNumber(detail.price) * (detail.quantity || 1);
      return sum + (Number.isFinite(total) ? total : 0);
    }, 0);
  }
  return 0;
}

function getOrderDate(order) {
  const value = order.orderDate || order.createdAt || order.updatedAt || order.transactionDate;
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return '0 ₫';
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

function formatPercentage(value) {
  if (!Number.isFinite(value)) return '0%';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function computePeriodRange(selectedPeriod, selectedYear, selectedMonth) {
  const now = new Date();
  switch (selectedPeriod) {
    case 'week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      const start = new Date(now);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
    case 'quarter': {
      const quarter = Math.floor(now.getMonth() / 3);
      const startMonth = quarter * 3;
      const start = new Date(now.getFullYear(), startMonth, 1);
      const end = new Date(now.getFullYear(), startMonth + 3, 0, 23, 59, 59, 999);
      return { start, end };
    }
    case 'year': {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { start, end };
    }
    case 'custom': {
      const monthIndex = (selectedMonth || 1) - 1;
      const start = new Date(selectedYear, monthIndex, 1);
      const end = new Date(selectedYear, monthIndex + 1, 0, 23, 59, 59, 999);
      return { start, end };
    }
    default:
      return null;
  }
}

function shiftRange(range) {
  if (!range) return null;
  const duration = range.end.getTime() - range.start.getTime();
  const prevEnd = new Date(range.start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { start: prevStart, end: prevEnd };
}

function filterOrdersByRange(orders, range) {
  if (!range) return orders;
  return orders.filter(order => {
    const date = getOrderDate(order);
    if (!date) return false;
    return date >= range.start && date <= range.end;
  });
}

function isPaidOrder(order) {
  const status =
    (order.paymentStatus ||
      order.status ||
      order.orderStatus ||
      '').toUpperCase();
  return PAID_STATUSES.includes(status);
}

function buildMetrics(currentOrders, previousOrders) {
  const paidCurrentOrders = currentOrders.filter(isPaidOrder);
  const paidPreviousOrders = previousOrders.filter(isPaidOrder);
  const totalRevenue = paidCurrentOrders.reduce((sum, order) => sum + extractOrderRevenue(order), 0);
  const previousRevenue = paidPreviousOrders.reduce((sum, order) => sum + extractOrderRevenue(order), 0);
  const totalOrders = paidCurrentOrders.length;
  const allOrdersCount = currentOrders.length;
  const completedOrders = currentOrders.filter(order =>
    COMPLETED_STATUSES.includes((order.status || order.orderStatus || '').toUpperCase())
  ).length;
  const conversionRate = allOrdersCount > 0 ? (completedOrders / allOrdersCount) * 100 : 0;
  const averageOrderValue = paidCurrentOrders.length > 0 ? totalRevenue / paidCurrentOrders.length : 0;
  const growthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : null;
  return {
    totalRevenue,
    totalOrders,
    conversionRate,
    averageOrderValue,
    growthRate
  };
}

function buildModelData(orders) {
  const map = new Map();
  orders.forEach(order => {
    const details = Array.isArray(order.getOrderDetailsResponses)
      ? order.getOrderDetailsResponses
      : Array.isArray(order.orderDetails)
      ? order.orderDetails
      : [];
    if (details.length) {
      details.forEach(detail => {
        const name =
          detail.modelName ||
          detail.productName ||
          detail.model?.modelName ||
          detail.variantName ||
          'Khác';
        const sales =
          parseNumber(detail.totalPrice) ||
          parseNumber(detail.totalAmount) ||
          parseNumber(detail.price) * (detail.quantity || 1);
        const entry = map.get(name) || { salesValue: 0, orders: 0 };
        entry.salesValue += Number.isFinite(sales) ? sales : 0;
        entry.orders += detail.quantity || 1;
        map.set(name, entry);
      });
    } else if (order.modelName) {
      const entry = map.get(order.modelName) || { salesValue: 0, orders: 0 };
      entry.salesValue += extractOrderRevenue(order);
      entry.orders += 1;
      map.set(order.modelName, entry);
    }
  });

  const data = Array.from(map.entries()).map(([name, stats]) => stats.salesValue > 0 ? ({
    name,
    salesValue: stats.salesValue,
    salesLabel: formatCurrency(stats.salesValue),
    orders: stats.orders,
  }) : null).filter(Boolean);

  const total = data.reduce((sum, item) => sum + item.salesValue, 0);
  return data
    .map(item => ({
      ...item,
      percentage: total > 0 ? Number(((item.salesValue / total) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.salesValue - a.salesValue)
    .slice(0, 6);
}

function buildEmployeeData(orders) {
  const map = new Map();
  orders.forEach(order => {
    const name =
      order.staffName ||
      order.staff?.fullName ||
      order.createdByName ||
      order.createdBy ||
      'Không xác định';
    const entry = map.get(name) || { salesValue: 0, orders: 0, completed: 0 };
    entry.salesValue += extractOrderRevenue(order);
    entry.orders += 1;
    const status = (order.status || order.orderStatus || '').toUpperCase();
    if (COMPLETED_STATUSES.includes(status)) {
      entry.completed += 1;
    }
    map.set(name, entry);
  });

  return Array.from(map.entries())
    .map(([name, stats]) => ({
      name,
      salesValue: stats.salesValue,
      salesLabel: formatCurrency(stats.salesValue),
      orders: stats.orders,
      conversion: stats.orders > 0 ? `${((stats.completed / stats.orders) * 100).toFixed(1)}%` : '0%',
    }))
    .sort((a, b) => b.salesValue - a.salesValue)
    .map((item, index) => ({ ...item, rank: index + 1 }))
    .slice(0, 6);
}

const buildConicGradient = (models) => {
  if (!models.length) return 'conic-gradient(#e5e7eb 0 100%)';
  let start = 0;
  const segments = models.map((m, idx) => {
    const percentage = Math.max(0, Math.min(100, m.percentage));
    const end = Math.min(100, start + percentage);
    const segment = `${modelColors[idx % modelColors.length]} ${start}% ${end}%`;
    start = end;
    return segment;
  });
  if (start < 100) {
    segments.push(`#e5e7eb ${start}% 100%`);
  }
  return `conic-gradient(${segments.join(',')})`;
};

function BaoCaoDoanhSo() {
  const dispatch = useDispatch();
  const { orders: rawOrders, loading: ordersLoading } = useSelector((state) => state.orders);
  const orders = useMemo(() => {
    if (Array.isArray(rawOrders)) return rawOrders;
    if (Array.isArray(rawOrders?.data)) return rawOrders.data;
    return [];
  }, [rawOrders]);

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    if (!orders.length && !ordersLoading) {
      dispatch(fetchOrders());
    }
  }, [dispatch, orders.length, ordersLoading]);

  const periodRange = useMemo(
    () => computePeriodRange(selectedPeriod, selectedYear, selectedMonth),
    [selectedPeriod, selectedYear, selectedMonth]
  );

  const filteredOrders = useMemo(
    () => filterOrdersByRange(orders, periodRange),
    [orders, periodRange]
  );

  const previousRange = useMemo(() => shiftRange(periodRange), [periodRange]);
  const previousOrders = useMemo(
    () => filterOrdersByRange(orders, previousRange || []),
    [orders, previousRange]
  );

  const metrics = useMemo(
    () => buildMetrics(filteredOrders, previousOrders),
    [filteredOrders, previousOrders]
  );

  const paidFilteredOrders = useMemo(() => filteredOrders.filter(isPaidOrder), [filteredOrders]);

  const modelData = useMemo(() => buildModelData(paidFilteredOrders), [paidFilteredOrders]);
  const employeeData = useMemo(() => buildEmployeeData(paidFilteredOrders), [paidFilteredOrders]);

  return (
    <div className="w-full max-w-7xl mx-auto px-1.5 sm:px-2 md:px-3 lg:px-4 pt-1 sm:pt-2 pb-2 sm:pb-3 md:pb-4">
      

      {/* Period Selection */}
      <div className="mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Chọn khoảng thời gian</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-lg border transition-all duration-200 ${
                selectedPeriod === period.id
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {period.name}
            </button>
          ))}
        </div>
        
        {selectedPeriod === 'custom' && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {[2022, 2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {months.map((month, index) => (
                  <option key={month} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg shadow p-3 sm:p-3.5">
          <div className="flex items-center">
            <div className="p-2.5 bg-red-100 rounded-lg">
              <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
              
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-3.5">
          <div className="flex items-center">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{metrics.totalOrders}</p>
              
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-3.5">
          <div className="flex items-center">
            <div className="p-2.5 bg-purple-100 rounded-lg">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Giá trị đơn hàng TB</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{formatCurrency(metrics.averageOrderValue)}</p>
              
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Sales by Model */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between">
            <div>
          <h3 className="text-lg font-medium text-gray-900">Doanh số theo mẫu xe</h3>
              <p className="text-sm text-gray-500">Tổng hợp dựa trên sản phẩm trong đơn hàng</p>
            </div>
            <span className="text-xs text-gray-500">{modelData.length} mẫu xe</span>
        </div>
        <div className="p-4">
            {modelData.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                Chưa có dữ liệu mẫu xe cho khoảng thời gian đã chọn
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center">
                  <div
                    className="relative h-56 w-56 rounded-full"
                    style={{ backgroundImage: buildConicGradient(modelData) }}
                aria-label="Biểu đồ tròn doanh số theo mẫu xe"
              >
                    <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Tổng doanh thu</p>
                        <p className="text-xl font-semibold text-gray-900">{formatCurrency(metrics.totalRevenue)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 w-full">
                    {modelData.map((m, idx) => (
                      <div key={m.name} className="flex items-center">
                    <span
                      className="inline-block w-3 h-3 rounded-sm mr-2"
                      style={{ backgroundColor: modelColors[idx % modelColors.length] }}
                    ></span>
                    <span className="text-sm text-gray-700 truncate">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

              <div className="space-y-4">
                  {modelData.map((model, index) => (
                    <div key={model.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div
                        className="h-10 w-10 rounded-md mr-4"
                        style={{ backgroundColor: modelColors[index % modelColors.length] }}
                        aria-hidden="true"
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{model.name}</h4>
                          <p className="text-sm text-gray-500">{model.orders} sản phẩm</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                          <p className="font-medium text-gray-900">{model.salesLabel}</p>
                        <p className="text-sm text-gray-500">{model.percentage}% tổng doanh số</p>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${model.percentage}%`, backgroundColor: modelColors[index % modelColors.length] }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}
        </div>
      </div>

      {/* Sales by Employee */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Doanh số theo nhân viên</h3>
            
        </div>
          {employeeData.length === 0 ? (
            <div className="p-6 text-center text-gray-500">Chưa có dữ liệu nhân viên cho giai đoạn này</div>
          ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh số
                </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số đơn hàng
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xếp hạng
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                  {employeeData.map((employee, index) => (
                    <tr key={employee.name}>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-full mr-4 flex items-center justify-center font-semibold text-gray-600">
                            {employee.name.slice(0, 1).toUpperCase()}
                          </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">Nhân viên bán hàng</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.salesLabel}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="text-sm text-center text-gray-900">{employee.orders}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      #{index + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BaoCaoDoanhSo;
