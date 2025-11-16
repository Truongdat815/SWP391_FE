import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import ViewOrders from './ViewOrders';
import { 
  TrendingUp,
  DollarSign,
  ChevronRight,
  Calendar
} from 'lucide-react';

function OrderManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get orders from Redux store (ViewOrders will handle fetching)
  const orders = useSelector((state) => state.orders.orders) || [];

  // Calculate statistics - Filter out CANCELLED orders (consistent with ViewOrders)
  const stats = useMemo(() => {
    // Filter out CANCELLED orders - same logic as ViewOrders
    const validOrders = orders.filter(o => {
      const status = (o.status || '').toUpperCase();
      return status !== 'CANCELLED';
    });

    // Count by status
    const total = validOrders.length;
    const draft = validOrders.filter(o => (o.status || '').toUpperCase() === 'DRAFT').length;
    const confirmed = validOrders.filter(o => (o.status || '').toUpperCase() === 'CONFIRMED').length;
    const completed = validOrders.filter(o => (o.status || '').toUpperCase() === 'COMPLETED').length;
    const pending = validOrders.filter(o => (o.status || '').toUpperCase() === 'PENDING').length;
    
    // Today's orders (excluding CANCELLED)
    const todayOrders = validOrders.filter(o => {
      if (!o.orderDate) return false;
      const orderDate = new Date(o.orderDate);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    });
    
    // Today's revenue - only from orders that have been confirmed or completed
    const todayRevenue = todayOrders
      .filter(o => {
        const status = (o.status || '').toUpperCase();
        return status === 'CONFIRMED' || status === 'COMPLETED' || status === 'PROCESSING';
      })
      .reduce((sum, o) => {
        const payment = parseFloat(o.totalPayment) || parseFloat(o.totalPrice) || parseFloat(o.total_amount) || 0;
        return sum + payment;
      }, 0);
    
    // Total revenue - only from orders that have been confirmed, completed, or processing
    // DRAFT and PENDING orders should not count toward revenue as they're not finalized
    const totalRevenue = validOrders
      .filter(o => {
        const status = (o.status || '').toUpperCase();
        return status === 'CONFIRMED' || status === 'COMPLETED' || status === 'PROCESSING' || status === 'APPROVED';
      })
      .reduce((sum, o) => {
        const payment = parseFloat(o.totalPayment) || parseFloat(o.totalPrice) || parseFloat(o.total_amount) || 0;
        return sum + payment;
      }, 0);

    return { 
      total, 
      draft, 
      confirmed, 
      completed, 
      pending, 
      todayRevenue, 
      todayOrders: todayOrders.length, 
      totalRevenue 
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-4">

        {/* Statistics Cards - 3 Cards Only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Today Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded-lg">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">Đơn hàng hôm nay</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-lg font-bold text-gray-900">{stats.todayOrders.toLocaleString('vi-VN')}</p>
              <p className="text-lg font-bold text-gray-900">đơn</p>
            </div>
          </motion.div>

          {/* Today Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <p className="text-xs text-gray-600">Tổng doanh thu hôm nay</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-lg font-bold text-gray-900">
                {stats.todayRevenue >= 1000000 
                  ? `${(stats.todayRevenue / 1000000).toFixed(1)}M`
                  : stats.todayRevenue >= 1000
                  ? `${(stats.todayRevenue / 1000).toFixed(0)}K`
                  : stats.todayRevenue.toLocaleString('vi-VN')
                }
              </p>
              <p className="text-lg font-bold text-gray-900">VNĐ</p>
            </div>
          </motion.div>

          {/* Pending Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-3.5 w-3.5 text-orange-600" />
                </div>
                <p className="text-xs text-gray-600">Đang chờ xử lý</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-lg font-bold text-gray-900">{(stats.pending + stats.draft).toLocaleString('vi-VN')}</p>
              <p className="text-lg font-bold text-gray-900">đơn</p>
            </div>
          </motion.div>
        </div>

        {/* Content Area - Always show ViewOrders */}
        <ViewOrders />
      </div>
    </div>
  );
}

export default OrderManagement;

