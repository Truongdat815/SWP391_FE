import { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrdersByStaffId } from '../../store/slices/orderSlice';
import { getAllCustomersThunk } from '../../store/slices/customerSlice';
import { getAllAppointmentsThunk } from '../../store/slices/appointmentSlice';
import { getAllFeedbacks } from '../../api/feedbackService';
import { getFeedbackDetailsByFeedbackId } from '../../api/feedbackDetailService';
import { useAuth } from '../../contexts/AuthContext';

const DealerStaffDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const allOrders = useSelector((s) => s.orders.items) || [];
  const customers = useSelector((s) => s.customers.items) || [];
  const appointments = useSelector((s) => s.appointments.items) || [];
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksWithDetails, setFeedbacksWithDetails] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // Get current staff ID
  const currentStaffId = user?.userId || user?.id || user?.user_id;

  // Use ref to prevent duplicate API calls
  const lastFetchedStaffIdRef = useRef(null);
  const hasFetchedFeedbacksRef = useRef(false);
  const hasFetchedCustomersAppointmentsRef = useRef(false);

  // Fetch orders for current staff only
  useEffect(() => {
    // Only fetch if currentStaffId changed or hasn't been fetched yet
    if (currentStaffId && lastFetchedStaffIdRef.current !== currentStaffId) {
      lastFetchedStaffIdRef.current = currentStaffId;
      setLoadingOrders(true);
      dispatch(fetchOrdersByStaffId(currentStaffId))
        .finally(() => setLoadingOrders(false));
    }
  }, [dispatch, currentStaffId]);

  // Load feedbacks with details (rating and content)
  useEffect(() => {
    // Only fetch once
    if (hasFetchedFeedbacksRef.current) {
      return;
    }
    
    hasFetchedFeedbacksRef.current = true;
    
    const loadFeedbacksWithDetails = async () => {
      setLoadingFeedbacks(true);
      try {
        const response = await getAllFeedbacks();
        let feedbacksData = [];
        
        // Handle different response structures
        if (Array.isArray(response)) {
          feedbacksData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          feedbacksData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          feedbacksData = response.data.data;
        }
        
        setFeedbacks(feedbacksData);
        
        // Load details for each feedback
        const feedbacksWithDetailsData = await Promise.all(
          feedbacksData.map(async (feedback) => {
            let feedbackDetail = null;
            try {
              const feedbackId = feedback.feedbackId || feedback.id || feedback.feedback_id;
              if (feedbackId) {
                const detailResponse = await getFeedbackDetailsByFeedbackId(feedbackId);
                let details = null;
                
                if (Array.isArray(detailResponse)) {
                  details = detailResponse;
                } else if (detailResponse?.data) {
                  if (Array.isArray(detailResponse.data)) {
                    details = detailResponse.data;
                  } else if (detailResponse.data?.data && Array.isArray(detailResponse.data.data)) {
                    details = detailResponse.data.data;
                  } else {
                    details = detailResponse.data;
                  }
                } else {
                  details = detailResponse;
                }
                
                if (Array.isArray(details) && details.length > 0) {
                  feedbackDetail = details[0];
                } else if (details && !Array.isArray(details)) {
                  feedbackDetail = details;
                }
              }
            } catch (err) {
              console.log('Error loading feedback detail:', err.message);
            }
            
            return {
              ...feedback,
              rating: feedbackDetail?.rating !== undefined ? parseInt(feedbackDetail.rating) : (feedback.rating ? parseInt(feedback.rating) : 0),
              content: feedbackDetail?.content || feedback.content || 'Không có nội dung',
              category: feedbackDetail?.category ? feedbackDetail.category.toLowerCase() : (feedback.category || 'service').toLowerCase(),
              feedbackDetail: feedbackDetail
            };
          })
        );
        
        setFeedbacksWithDetails(feedbacksWithDetailsData);
      } catch (err) {
        console.error('Error loading feedbacks:', err);
        setFeedbacks([]);
        setFeedbacksWithDetails([]);
      } finally {
        setLoadingFeedbacks(false);
      }
    };
    
    loadFeedbacksWithDetails();
    
    // Fetch customers and appointments only once
    if (!hasFetchedCustomersAppointmentsRef.current) {
      hasFetchedCustomersAppointmentsRef.current = true;
      dispatch(getAllCustomersThunk());
      dispatch(getAllAppointmentsThunk());
    }
  }, [dispatch]);

  // Filter orders to only show current staff's orders (client-side filter as backup)
  const orders = useMemo(() => {
    if (!currentStaffId) return allOrders;
    
    return allOrders.filter(order => {
      const orderStaffId = order.staffId || order.userId || order.staff_id || order.user_id;
      return String(orderStaffId) === String(currentStaffId);
    });
  }, [allOrders, currentStaffId]);

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

  // Tính toán thống kê phản hồi với rating
  const feedbackStats = useMemo(() => {
    const stats = {
      total: feedbacksWithDetails.length,
      pending: feedbacksWithDetails.filter(f => (f.status || '').toUpperCase() === 'PENDING' || (f.status || '').toUpperCase() === 'DRAFT').length,
      resolved: feedbacksWithDetails.filter(f => (f.status || '').toUpperCase() === 'RESOLVED').length,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
    
    // Calculate average rating and distribution
    const ratings = feedbacksWithDetails
      .map(f => f.rating)
      .filter(r => r > 0 && r <= 5);
    
    if (ratings.length > 0) {
      stats.averageRating = (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1);
      
      // Count rating distribution
      ratings.forEach(rating => {
        if (rating >= 1 && rating <= 5) {
          stats.ratingDistribution[rating] = (stats.ratingDistribution[rating] || 0) + 1;
        }
      });
    }
    
    return stats;
  }, [feedbacksWithDetails]);

  // Calculate revenue data from actual orders (last 6 months)
  const revenueData = useMemo(() => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
    const now = new Date();
    const data = months.map((monthLabel, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthOrders = orders.filter(order => {
        const orderDate = order.orderDate || order.createdAt || order.createdDate;
        if (!orderDate) return false;
        const date = new Date(orderDate);
        return date >= monthStart && date <= monthEnd;
      });
      
      const revenue = monthOrders.reduce((sum, o) => sum + (parseFloat(o.totalPrice) || 0), 0);
      
      return {
        month: monthLabel,
        revenue: revenue,
        orders: monthOrders.length
      };
    });
    
    return data;
  }, [orders]);

  // Phân tích đơn hàng theo trạng thái
  const orderStatusData = [
    { name: 'Đã xác nhận', value: orderStats.confirmed, color: '#10b981' },
    { name: 'Đang chờ', value: orderStats.pending, color: '#f59e0b' },
    { name: 'Hoàn thành', value: orderStats.completed, color: '#3b82f6' },
  ];

  // Calculate customer data from actual orders (last 6 months)
  const customerData = useMemo(() => {
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
    const now = new Date();
    const data = months.map((monthLabel, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      // Get unique customers from orders in this month
      const monthOrders = orders.filter(order => {
        const orderDate = order.orderDate || order.createdAt || order.createdDate;
        if (!orderDate) return false;
        const date = new Date(orderDate);
        return date >= monthStart && date <= monthEnd;
      });
      
      // Count unique customers
      const uniqueCustomers = new Set(
        monthOrders
          .map(o => o.customerId || o.customer?.customerId || o.customer_id)
          .filter(id => id)
      );
      
      return {
        month: monthLabel,
        customers: uniqueCustomers.size
      };
    });
    
    return data;
  }, [orders]);

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-3 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col space-y-2">
        {/* Header */}
        <div className="flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">📊 Tổng quan bán hàng</h2>
            <p className="text-gray-600 mt-0.5 text-xs">
              Thống kê và phân tích dữ liệu bán hàng của bạn
              {user?.fullName && ` - ${user.fullName}`}
            </p>
          </div>
          <button 
          onClick={() => {
            if (currentStaffId) {
              dispatch(fetchOrdersByStaffId(currentStaffId));
            }
            dispatch(getAllCustomersThunk());
            dispatch(getAllAppointmentsThunk());
            // Reload feedbacks with details
            const loadFeedbacks = async () => {
              try {
                const response = await getAllFeedbacks();
                let feedbacksData = [];
                
                if (Array.isArray(response)) {
                  feedbacksData = response;
                } else if (response?.data && Array.isArray(response.data)) {
                  feedbacksData = response.data;
                } else if (response?.data?.data && Array.isArray(response.data.data)) {
                  feedbacksData = response.data.data;
                }
                
                setFeedbacks(feedbacksData);
                
                const feedbacksWithDetailsData = await Promise.all(
                  feedbacksData.map(async (feedback) => {
                    let feedbackDetail = null;
                    try {
                      const feedbackId = feedback.feedbackId || feedback.id || feedback.feedback_id;
                      if (feedbackId) {
                        const detailResponse = await getFeedbackDetailsByFeedbackId(feedbackId);
                        let details = null;
                        
                        if (Array.isArray(detailResponse)) {
                          details = detailResponse;
                        } else if (detailResponse?.data) {
                          details = Array.isArray(detailResponse.data) ? detailResponse.data : detailResponse.data;
                        } else {
                          details = detailResponse;
                        }
                        
                        if (Array.isArray(details) && details.length > 0) {
                          feedbackDetail = details[0];
                        } else if (details && !Array.isArray(details)) {
                          feedbackDetail = details;
                        }
                      }
                    } catch (err) {
                      console.log('Error loading feedback detail:', err.message);
                    }
                    
                    return {
                      ...feedback,
                      rating: feedbackDetail?.rating !== undefined ? parseInt(feedbackDetail.rating) : (feedback.rating ? parseInt(feedback.rating) : 0),
                      content: feedbackDetail?.content || feedback.content || 'Không có nội dung',
                      category: feedbackDetail?.category ? feedbackDetail.category.toLowerCase() : (feedback.category || 'service').toLowerCase(),
                      feedbackDetail: feedbackDetail
                    };
                  })
                );
                
                setFeedbacksWithDetails(feedbacksWithDetailsData);
              } catch (err) {
                console.error('Error loading feedbacks:', err);
                setFeedbacks([]);
                setFeedbacksWithDetails([]);
              }
            };
            
            loadFeedbacks();
          }}
          className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-xs font-medium shadow-sm"
          disabled={loadingOrders}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loadingOrders ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 flex-shrink-0">
        {/* Total Orders */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-3 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-medium">Tổng đơn hàng</p>
              <h3 className="text-xl font-bold mt-0.5">{orderStats.total}</h3>
              <p className="text-emerald-100 text-xs mt-0.5">{orderStats.completed} đã hoàn thành</p>
            </div>
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-medium">Tổng doanh thu</p>
              <h3 className="text-xl font-bold mt-0.5">{((orderStats.totalRevenue || 0) / 1000000).toFixed(1)}M</h3>
              <p className="text-blue-100 text-xs mt-0.5">VNĐ</p>
            </div>
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-medium">Khách hàng</p>
              <h3 className="text-xl font-bold mt-0.5">{customerStats.total}</h3>
              <p className="text-purple-100 text-xs mt-0.5">+{customerStats.newThisMonth} mới tháng này</p>
            </div>
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs font-medium">Lịch lái thử</p>
              <h3 className="text-xl font-bold mt-0.5">{appointmentStats.upcoming}</h3>
              <p className="text-orange-100 text-xs mt-0.5">{appointmentStats.today} hôm nay</p>
            </div>
            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-1 min-h-0">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">📈 Doanh thu theo tháng</h3>
              <p className="text-xs text-gray-500 mt-0.5">Xu hướng doanh thu 6 tháng gần nhất</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
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
        </div>

        {/* Customers Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">👥 Khách hàng theo tháng</h3>
              <p className="text-xs text-gray-500 mt-0.5">Số lượng khách hàng mới 6 tháng</p>
            </div>
          </div>
          <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 flex-1 min-h-0">
        {/* Order Status Pie */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-3 flex flex-col min-h-0">
          <div className="mb-2 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900">⚡ Trạng thái đơn hàng</h3>
            <p className="text-xs text-gray-500 mt-0.5">Phân loại theo trạng thái</p>
          </div>
          <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={orderStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={60}
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
        </div>

        {/* Feedback Stats */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-3 flex flex-col min-h-0">
          <div className="mb-2 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900">💬 Phản hồi khách hàng</h3>
            <p className="text-xs text-gray-500 mt-0.5">Thống kê phản hồi</p>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200">
              <p className="text-xs text-gray-600">Tổng số</p>
              <p className="text-lg font-bold text-blue-600 mt-0.5">{feedbackStats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-2 border border-yellow-200">
              <p className="text-xs text-gray-600">Đang chờ xử lý</p>
              <p className="text-lg font-bold text-yellow-600 mt-0.5">{feedbackStats.pending}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-200">
              <p className="text-xs text-gray-600">Đã xử lý</p>
              <p className="text-lg font-bold text-green-600 mt-0.5">{feedbackStats.resolved}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2 border border-amber-200">
              <p className="text-xs text-gray-600">Đánh giá trung bình</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-lg font-bold text-amber-600">{feedbackStats.averageRating || '0.0'}</p>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => {
                    const starValue = i + 1;
                    const isFilled = starValue <= Math.round(parseFloat(feedbackStats.averageRating) || 0);
                    return (
                      <svg
                        key={i}
                        className={`h-3.5 w-3.5 ${isFilled ? 'text-amber-500' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution Chart */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-3 flex flex-col min-h-0">
          <div className="mb-2 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900">⭐ Phân bố đánh giá</h3>
            <p className="text-xs text-gray-500 mt-0.5">Số lượng đánh giá theo sao</p>
          </div>
          <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: '1 sao', value: feedbackStats.ratingDistribution[1] || 0, color: '#ef4444' },
                { name: '2 sao', value: feedbackStats.ratingDistribution[2] || 0, color: '#f97316' },
                { name: '3 sao', value: feedbackStats.ratingDistribution[3] || 0, color: '#eab308' },
                { name: '4 sao', value: feedbackStats.ratingDistribution[4] || 0, color: '#84cc16' },
                { name: '5 sao', value: feedbackStats.ratingDistribution[5] || 0, color: '#10b981' },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`${value} đánh giá`, 'Số lượng']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {[
                  { name: '1 sao', value: feedbackStats.ratingDistribution[1] || 0, color: '#ef4444' },
                  { name: '2 sao', value: feedbackStats.ratingDistribution[2] || 0, color: '#f97316' },
                  { name: '3 sao', value: feedbackStats.ratingDistribution[3] || 0, color: '#eab308' },
                  { name: '4 sao', value: feedbackStats.ratingDistribution[4] || 0, color: '#84cc16' },
                  { name: '5 sao', value: feedbackStats.ratingDistribution[5] || 0, color: '#10b981' },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-3 flex flex-col min-h-0">
          <div className="mb-2 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900">⚡ Thao tác nhanh</h3>
            <p className="text-xs text-gray-500 mt-0.5">Truy cập nhanh các chức năng</p>
          </div>
          <div className="space-y-1.5 flex-1 flex flex-col justify-center">
            <a href="/dealer-staff/order-management" className="block bg-emerald-50 hover:bg-emerald-100 rounded-lg p-2 border border-emerald-200 transition text-center">
              <p className="text-xs font-medium text-emerald-700">Tạo đơn hàng</p>
            </a>
            <a href="/dealer-staff/customer-management" className="block bg-blue-50 hover:bg-blue-100 rounded-lg p-2 border border-blue-200 transition text-center">
              <p className="text-xs font-medium text-blue-700">Quản lý khách hàng</p>
            </a>
            <a href="/dealer-staff/test-drive-schedule" className="block bg-purple-50 hover:bg-purple-100 rounded-lg p-2 border border-purple-200 transition text-center">
              <p className="text-xs font-medium text-purple-700">Lịch lái thử</p>
            </a>
            <a href="/dealer-staff/payment-management" className="block bg-orange-50 hover:bg-orange-100 rounded-lg p-2 border border-orange-200 transition text-center">
              <p className="text-xs font-medium text-orange-700">Thanh toán</p>
            </a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DealerStaffDashboard;

