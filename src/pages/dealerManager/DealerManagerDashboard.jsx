import { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders, fetchOrdersByStaffId } from '../../store/slices/orderSlice';
import { getAllStoreStocksThunk } from '../../store/slices/store-stockSlice';
import { fetchPromotions } from '../../store/slices/promotionSlice';
import { getAllUsersThunk } from '../../store/slices/userSlice';
import { getAllFeedbacks } from '../../api/feedbackService';
import { getFeedbackDetailsByFeedbackId } from '../../api/feedbackDetailService';
import { useAuth } from '../../contexts/AuthContext';

const DealerManagerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const allOrders = useSelector((s) => s.orders.items) || [];
  const storeStocks = useSelector((s) => s.storeStocks.items) || [];
  const promotions = useSelector((s) => s.promotions.promotions) || [];
  const users = useSelector((s) => s.users.items) || [];
  
  // State for staff filter
  const [selectedStaffId, setSelectedStaffId] = useState('all'); // 'all' means show all orders
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksWithDetails, setFeedbacksWithDetails] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [currentFeedbackPage, setCurrentFeedbackPage] = useState(1);
  const [feedbacksPerPage] = useState(3);
  const [activeTab, setActiveTab] = useState(1); // 1: Overview, 2: Status & Inventory, 3: Promotions & Feedback

  // Get list of staff (Dealer Staff role)
  const staffList = useMemo(() => {
    return users.filter(u => 
      u.roleName === 'Dealer Staff' || 
      u.roleName === 'Nhân viên cửa hàng' ||
      u.roleId === 4 // Assuming roleId 4 is Dealer Staff
    );
  }, [users]);

  // Use ref to prevent duplicate API calls
  const lastFetchedStaffIdRef = useRef(null);
  const hasFetchedFeedbacksRef = useRef(false);
  const hasFetchedOtherDataRef = useRef(false);

  // Fetch orders based on selected staff
  useEffect(() => {
    // Only fetch if selectedStaffId changed or hasn't been fetched yet
    if (lastFetchedStaffIdRef.current !== selectedStaffId) {
      lastFetchedStaffIdRef.current = selectedStaffId;
      setLoadingOrders(true);
      if (selectedStaffId === 'all') {
        dispatch(fetchOrders()).finally(() => setLoadingOrders(false));
      } else {
        dispatch(fetchOrdersByStaffId(selectedStaffId)).finally(() => setLoadingOrders(false));
      }
    }
  }, [dispatch, selectedStaffId]);

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
        setCurrentFeedbackPage(1); // Reset to first page when data changes
      } catch (err) {
        console.error('Error loading feedbacks:', err);
        setFeedbacks([]);
        setFeedbacksWithDetails([]);
        setCurrentFeedbackPage(1);
      } finally {
        setLoadingFeedbacks(false);
      }
    };
    
    loadFeedbacksWithDetails();
    
    // Fetch other data only once
    if (!hasFetchedOtherDataRef.current) {
      hasFetchedOtherDataRef.current = true;
      dispatch(getAllStoreStocksThunk());
      dispatch(fetchPromotions());
      dispatch(getAllUsersThunk());
    }
  }, [dispatch]);

  // Filter orders based on selected staff (client-side filter as backup)
  const orders = useMemo(() => {
    if (selectedStaffId === 'all') {
      return allOrders;
    }
    // Filter by staffId, userId, or staff_id
    return allOrders.filter(order => {
      const orderStaffId = order.staffId || order.userId || order.staff_id || order.user_id;
      return String(orderStaffId) === String(selectedStaffId);
    });
  }, [allOrders, selectedStaffId]);

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
          <p className="text-gray-600 mt-0.5 text-sm">
            {selectedStaffId === 'all' 
              ? 'Thống kê và phân tích dữ liệu đại lý (Tất cả nhân viên)'
              : `Thống kê và phân tích dữ liệu của ${staffList.find(s => String(s.userId || s.id || s.user_id) === String(selectedStaffId))?.fullName || staffList.find(s => String(s.userId || s.id || s.user_id) === String(selectedStaffId))?.name || 'Nhân viên'}`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Staff Filter Dropdown */}
          <div className="relative">
            <label className="text-xs text-gray-600 mr-2">Lọc theo nhân viên:</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm min-w-[200px]"
              disabled={loadingOrders}
            >
              <option value="all">Tất cả nhân viên</option>
              {staffList.map((staff) => {
                const staffId = staff.userId || staff.id || staff.user_id;
                const staffName = staff.fullName || staff.name || staff.username || `Staff ${staffId}`;
                return (
                  <option key={staffId} value={staffId}>
                    {staffName}
                  </option>
                );
              })}
            </select>
          </div>
          <button 
            onClick={() => {
              if (selectedStaffId === 'all') {
                dispatch(fetchOrders());
              } else {
                dispatch(fetchOrdersByStaffId(selectedStaffId));
              }
              dispatch(getAllStoreStocksThunk());
              dispatch(fetchPromotions());
            }}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm"
            disabled={loadingOrders}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loadingOrders ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-1">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab(1)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 1
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Tổng quan & Doanh thu
          </button>
          <button
            onClick={() => setActiveTab(2)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 2
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⚡ Trạng thái & Tồn kho
          </button>
          <button
            onClick={() => setActiveTab(3)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 3
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            💬 Khuyến mãi & Phản hồi
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Revenue */}
      {activeTab === 1 && (
        <>
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
        </>
      )}

      {/* Tab 2: Status & Inventory */}
      {activeTab === 2 && (
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
      )}

      {/* Tab 3: Promotions & Feedback */}
      {activeTab === 3 && (
        <>
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

            {/* Feedback Stats */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4">
              <div className="mb-3">
                <h3 className="text-base font-semibold text-gray-900">💬 Phản hồi khách hàng</h3>
                <p className="text-xs text-gray-500 mt-0.5">Thống kê phản hồi</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200">
                  <p className="text-xs text-gray-600">Tổng số</p>
                  <p className="text-xl font-bold text-blue-600">{feedbackStats.total}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 border border-green-200">
                  <p className="text-xs text-gray-600">Đã xử lý</p>
                  <p className="text-xl font-bold text-green-600">{feedbackStats.resolved}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2 border border-amber-200">
                  <p className="text-xs text-gray-600">Đánh giá TB</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xl font-bold text-amber-600">{feedbackStats.averageRating || '0.0'}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => {
                        const starValue = i + 1;
                        const isFilled = starValue <= Math.round(parseFloat(feedbackStats.averageRating) || 0);
                        return (
                          <svg
                            key={i}
                            className={`h-3 w-3 ${isFilled ? 'text-amber-500' : 'text-gray-300'}`}
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
          </div>

          {/* Rating Distribution Chart and Recent Feedbacks */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 flex flex-col h-full">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-900">⭐ Phân bố đánh giá</h3>
                <p className="text-xs text-gray-500 mt-0.5">Số lượng đánh giá theo sao</p>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                {(() => {
                  const ratingData = [
                    { name: '1 sao', value: feedbackStats.ratingDistribution[1] || 0, color: '#ef4444' },
                    { name: '2 sao', value: feedbackStats.ratingDistribution[2] || 0, color: '#f97316' },
                    { name: '3 sao', value: feedbackStats.ratingDistribution[3] || 0, color: '#eab308' },
                    { name: '4 sao', value: feedbackStats.ratingDistribution[4] || 0, color: '#84cc16' },
                    { name: '5 sao', value: feedbackStats.ratingDistribution[5] || 0, color: '#10b981' },
                  ];
                  const maxValue = Math.max(...ratingData.map(d => d.value));
                  const yAxisMax = maxValue === 0 ? 1 : Math.ceil(maxValue * 1.1);
                  
                  return (
                    <BarChart
                      data={ratingData}
                      margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                        allowDecimals={false}
                        domain={[0, yAxisMax]}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} đánh giá`, 'Số lượng']}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {ratingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  );
                })()}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Feedbacks with Details */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-md p-3">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">📝 Phản hồi gần đây</h3>
            {feedbacksWithDetails.length > 0 && (
              <span className="text-xs text-gray-500">
                Tổng: {feedbacksWithDetails.length} phản hồi
              </span>
            )}
          </div>
        </div>
        {loadingFeedbacks ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600">Đang tải phản hồi...</p>
          </div>
        ) : feedbacksWithDetails.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Chưa có phản hồi nào</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {feedbacksWithDetails
                .slice((currentFeedbackPage - 1) * feedbacksPerPage, currentFeedbackPage * feedbacksPerPage)
                .map((feedback, index) => {
                  const rating = Math.max(0, Math.min(5, parseInt(feedback.rating) || 0));
                  const content = feedback.content || 'Không có nội dung';
                  const customerName = feedback.customerName || feedback.customer?.name || 'Khách hàng';
                  const feedbackDate = feedback.createdDate || feedback.createdAt || feedback.date;
                  const status = (feedback.status || '').toUpperCase();
                  
                  return (
                    <div key={feedback.feedbackId || feedback.id || index} className="border border-gray-200 rounded-lg p-2.5 hover:shadow-sm transition">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-semibold text-gray-900 truncate">{customerName}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                              status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                              status === 'PENDING' || status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {status === 'RESOLVED' ? 'Đã xử lý' : status === 'PENDING' || status === 'DRAFT' ? 'Đang chờ' : status}
                            </span>
                            {feedbackDate && (
                              <span className="text-xs text-gray-400 flex-shrink-0">
                                {new Date(feedbackDate).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }, (_, i) => {
                                const starValue = i + 1;
                                const isFilled = starValue <= rating;
                                return (
                                  <svg
                                    key={i}
                                    className={`h-3 w-3 ${isFilled ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                );
                              })}
                            </div>
                            <span className="text-xs text-gray-500">({rating}/5)</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs text-gray-700 bg-gray-50 rounded p-1.5 border border-gray-200 line-clamp-2">
                          {content}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Pagination */}
            {feedbacksWithDetails.length > feedbacksPerPage && (
              <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                <div className="text-xs text-gray-500">
                  Trang {currentFeedbackPage}/{Math.ceil(feedbacksWithDetails.length / feedbacksPerPage)}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentFeedbackPage(prev => Math.max(1, prev - 1))}
                    disabled={currentFeedbackPage === 1}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      currentFeedbackPage === 1
                        ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Trước
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(feedbacksWithDetails.length / feedbacksPerPage) }, (_, i) => {
                      const page = i + 1;
                      const totalPages = Math.ceil(feedbacksWithDetails.length / feedbacksPerPage);
                      
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentFeedbackPage - 1 && page <= currentFeedbackPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentFeedbackPage(page)}
                            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                              currentFeedbackPage === page
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentFeedbackPage - 2 || page === currentFeedbackPage + 2) {
                        return (
                          <span key={page} className="px-2 text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentFeedbackPage(prev => Math.min(Math.ceil(feedbacksWithDetails.length / feedbacksPerPage), prev + 1))}
                    disabled={currentFeedbackPage >= Math.ceil(feedbacksWithDetails.length / feedbacksPerPage)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      currentFeedbackPage >= Math.ceil(feedbacksWithDetails.length / feedbacksPerPage)
                        ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DealerManagerDashboard;

