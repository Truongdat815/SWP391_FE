import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchOrders } from '../../store/slices/orderSlice';
import CreateOrder from './CreateOrder';
import ViewOrders from './ViewOrders';
import { 
  ShoppingCart, 
  Receipt, 
  TrendingUp,
  Package,
  PlusCircle,
  FileText,
  DollarSign,
  ChevronRight,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Calendar
} from 'lucide-react';

function OrderManagement() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  
  // Fetch orders for statistics
  const orders = useSelector((state) => state.orders.orders) || [];
  
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    // Handle navigation state if needed
    if (location.state?.tab === 'view') {
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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
        {/* Header with Create Order Button */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <motion.button
            onClick={() => setShowCreateOrder(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md font-medium"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Tạo đơn hàng
          </motion.button>
        </div>

        {/* Statistics Cards - 3 Cards Only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* Today Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1 bg-blue-100 rounded-lg">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 mb-0.5">Đơn hàng hôm nay</p>
            <p className="text-lg font-bold text-gray-900">{stats.todayOrders}</p>
            <p className="text-xs text-gray-500 mt-0.5">Đơn hàng</p>
          </motion.div>

          {/* Today Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1 bg-emerald-100 rounded-lg">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 mb-0.5">Tổng doanh thu hôm nay</p>
            <p className="text-lg font-bold text-gray-900">
              {stats.todayRevenue >= 1000000 
                ? `${(stats.todayRevenue / 1000000).toFixed(1)}M`
                : stats.todayRevenue >= 1000
                ? `${(stats.todayRevenue / 1000).toFixed(0)}K`
                : stats.todayRevenue.toLocaleString('vi-VN')
              }
            </p>
            <p className="text-xs text-gray-500 mt-0.5">VNĐ</p>
          </motion.div>

          {/* Pending Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="p-1 bg-orange-100 rounded-lg">
                <TrendingUp className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-600 mb-0.5">Đang chờ xử lý</p>
            <p className="text-lg font-bold text-gray-900">{stats.pending + stats.draft}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stats.draft} nháp, {stats.pending} chờ xác nhận</p>
          </motion.div>
        </div>

        {/* Content Area - Always show ViewOrders */}
        <ViewOrders />

        {/* Create Order Popup */}
        {showCreateOrder && (
          <CreateOrder
            isOpen={showCreateOrder}
            onClose={() => setShowCreateOrder(false)}
          />
        )}
      </div>
    </div>
  );
}

export default OrderManagement;

