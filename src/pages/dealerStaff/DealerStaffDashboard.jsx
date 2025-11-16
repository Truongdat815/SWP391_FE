import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders } from '../../store/slices/orderSlice';
import { getAllCustomersThunk } from '../../store/slices/customerSlice';
import { getAllAppointmentsThunk } from '../../store/slices/appointmentSlice';
import { getAllFeedbacks } from '../../api/feedbackService';
import { useAuth } from '../../contexts/AuthContext';

const DealerStaffDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const orders = useSelector((s) => s.orders.orders) || [];
  const customers = useSelector((s) => s.customers.items) || [];
  const appointments = useSelector((s) => s.appointments.items) || [];
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(getAllCustomersThunk());
    dispatch(getAllAppointmentsThunk());
    // Load feedbacks from API
    getAllFeedbacks()
      .then(data => setFeedbacks(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error loading feedbacks:', err);
        setFeedbacks([]);
      });
  }, [dispatch]);

  // Debug: Log orders data
  useEffect(() => {
    if (orders && orders.length > 0) {
      console.log('📦 Orders loaded in dashboard:', orders.length);
      console.log('📦 Sample order:', orders[0]);
      
      // Debug: Đếm các trạng thái
      const statusCounts = {};
      orders.forEach(order => {
        const status = (order.status || '').toUpperCase();
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      console.log('📊 Order status breakdown:', statusCounts);
    } else {
      console.log('⚠️ No orders found or orders array is empty');
    }
  }, [orders]);

  // Debug: Log customers data
  useEffect(() => {
    if (customers && customers.length > 0) {
      console.log('👥 Customers loaded in dashboard:', customers.length);
      console.log('👥 Sample customer:', customers[0]);
      console.log('👥 Sample customer date fields:', {
        createdDate: customers[0].createdDate,
        createdAt: customers[0].createdAt,
        created_at: customers[0].created_at,
        created_date: customers[0].created_date,
      });
    } else {
      console.log('⚠️ No customers found or customers array is empty');
    }
  }, [customers]);

  // Tính toán thống kê đơn hàng
  const orderStats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => {
      const status = (o.status || '').toUpperCase();
      return status === 'PENDING' || status === 'DRAFT';
    }).length;
    const confirmed = orders.filter(o => (o.status || '').toUpperCase() === 'CONFIRMED').length;
    const completed = orders.filter(o => (o.status || '').toUpperCase() === 'COMPLETED').length;
    
    // Tính tổng doanh thu, sử dụng totalPrice hoặc totalPayment
    const totalRevenue = orders.reduce((sum, o) => {
      const price = parseFloat(o.totalPrice) || parseFloat(o.totalPayment) || parseFloat(o.total_amount) || 0;
      return sum + price;
    }, 0);

    return {
      total,
      pending,
      confirmed,
      completed,
      totalRevenue,
    };
  }, [orders]);

  // Tính toán thống kê khách hàng
  const customerStats = useMemo(() => {
    const total = customers.length;
    
    // Tìm ngày tạo của customer - kiểm tra nhiều field có thể có
    const getCustomerCreatedDate = (customer) => {
      return customer.createdDate || customer.createdAt || customer.created_at || customer.created_date || null;
    };
    
    const now = new Date();
    const newThisMonth = customers.filter(c => {
      const createdDateStr = getCustomerCreatedDate(c);
      if (!createdDateStr) return false;
      try {
        const created = new Date(createdDateStr);
        if (isNaN(created.getTime())) return false;
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      } catch {
        return false;
      }
    }).length;

    return {
      total,
      newThisMonth,
    };
  }, [customers]);

  // Tính toán thống kê lịch lái thử
  const appointmentStats = {
    total: appointments.length,
    upcoming: appointments.filter(a => {
      if (!a.appointmentDate) return false;
      const apptDate = new Date(a.appointmentDate);
      const now = new Date();
      return apptDate >= now;
    }).length,
    today: appointments.filter(a => {
      if (!a.appointmentDate) return false;
      const apptDate = new Date(a.appointmentDate);
      const today = new Date();
      return apptDate.toDateString() === today.toDateString();
    }).length,
  };

  // Tính toán thống kê phản hồi
  const feedbackStats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => (f.status || '').toUpperCase() === 'PENDING').length,
    resolved: feedbacks.filter(f => (f.status || '').toUpperCase() === 'RESOLVED').length,
  };

  // Tính toán dữ liệu doanh thu theo tháng từ orders thực tế
  const revenueData = useMemo(() => {
    const now = new Date();
    const last6Months = [];
    
    // Tạo mảng 6 tháng gần nhất
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        monthLabel: `T${date.getMonth() + 1}`,
      });
    }

    // Nhóm orders theo tháng và tính toán
    return last6Months.map(({ month, year, monthLabel }) => {
      const monthOrders = orders.filter(order => {
        if (!order.orderDate) return false;
        const orderDate = new Date(order.orderDate);
        return orderDate.getMonth() + 1 === month && orderDate.getFullYear() === year;
      });

      const revenue = monthOrders.reduce((sum, order) => {
        const price = parseFloat(order.totalPrice) || parseFloat(order.totalPayment) || parseFloat(order.total_amount) || 0;
        return sum + price;
      }, 0);

      return {
        month: monthLabel,
        revenue: revenue,
        orders: monthOrders.length,
      };
    });
  }, [orders]);

  // Phân tích đơn hàng theo trạng thái - tính toán từ dữ liệu thực tế
  const orderStatusData = useMemo(() => {
    // Đếm từng trạng thái
    const statusCounts = {};
    orders.forEach(order => {
      const status = (order.status || '').toUpperCase();
      if (status) {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }
    });

    // Map trạng thái sang tên tiếng Việt và màu sắc
    const statusMap = {
      'DRAFT': { name: 'Nháp', color: '#9ca3af' },
      'PENDING': { name: 'Đang chờ', color: '#f59e0b' },
      'CONFIRMED': { name: 'Đã xác nhận', color: '#10b981' },
      'APPROVED': { name: 'Đã duyệt', color: '#3b82f6' },
      'PROCESSING': { name: 'Đang xử lý', color: '#8b5cf6' },
      'COMPLETED': { name: 'Hoàn thành', color: '#06b6d4' },
      'CANCELLED': { name: 'Đã hủy', color: '#ef4444' },
    };

    // Tạo mảng dữ liệu từ status counts, chỉ hiển thị những status có dữ liệu
    const data = Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: statusMap[status]?.name || status,
        value: count,
        color: statusMap[status]?.color || '#6b7280',
        status: status, // Giữ lại status gốc để debug
      }))
      .filter(item => item.value > 0) // Chỉ hiển thị status có đơn hàng
      .sort((a, b) => b.value - a.value); // Sắp xếp theo số lượng giảm dần

    return data;
  }, [orders]);

  // Tính toán dữ liệu khách hàng theo tháng từ customers thực tế
  const customerData = useMemo(() => {
    const now = new Date();
    const last6Months = [];
    
    // Tạo mảng 6 tháng gần nhất
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        monthLabel: `T${date.getMonth() + 1}`,
      });
    }

    // Helper function để lấy ngày tạo của customer
    const getCustomerCreatedDate = (customer) => {
      return customer.createdDate || customer.createdAt || customer.created_at || customer.created_date || null;
    };

    // Nhóm customers theo tháng và đếm
    return last6Months.map(({ month, year, monthLabel }) => {
      const monthCustomers = customers.filter(customer => {
        const createdDateStr = getCustomerCreatedDate(customer);
        if (!createdDateStr) return false;
        try {
          const createdDate = new Date(createdDateStr);
          if (isNaN(createdDate.getTime())) return false;
          return createdDate.getMonth() + 1 === month && createdDate.getFullYear() === year;
        } catch {
          return false;
        }
      });

      return {
        month: monthLabel,
        customers: monthCustomers.length,
      };
    });
  }, [customers]);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

  return (
    <div className="px-4 py-3 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-medium">Tổng đơn hàng</p>
              <h3 className="text-2xl font-bold mt-1.5">{orderStats.total}</h3>
              <p className="text-emerald-100 text-xs mt-1.5">{orderStats.completed} đã hoàn thành</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium">Tổng doanh thu</p>
              <h3 className="text-2xl font-bold mt-1.5">{((orderStats.totalRevenue || 0) / 1000000).toFixed(1)}M</h3>
              <p className="text-blue-100 text-xs mt-1.5">VNĐ</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-medium">Khách hàng</p>
              <h3 className="text-2xl font-bold mt-1.5">{customerStats.total}</h3>
              <p className="text-purple-100 text-xs mt-1.5">+{customerStats.newThisMonth} mới tháng này</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs font-medium">Lịch lái thử</p>
              <h3 className="text-2xl font-bold mt-1.5">{appointmentStats.upcoming}</h3>
              <p className="text-orange-100 text-xs mt-1.5">{appointmentStats.today} hôm nay</p>
            </div>
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                <linearGradient id="colorRevenueStaff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip 
                formatter={(value) => [`${(value / 1000000).toFixed(1)}M VNĐ`, 'Doanh thu']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenueStaff)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Customers Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">👥 Khách hàng theo tháng</h3>
              <p className="text-xs text-gray-500 mt-0.5">Số lượng khách hàng mới 6 tháng</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={customerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`${value} khách hàng`, 'Số lượng']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="customers" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DealerStaffDashboard;

