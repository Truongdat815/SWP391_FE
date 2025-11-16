import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import ViewOrders from './ViewOrders';
import { 
  TrendingUp,
  DollarSign,
  ChevronRight,
  Calendar,
  FileText,
  AlertCircle,
  PlusCircle
} from 'lucide-react';

function OrderManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL or default to 'all'
  const activeTab = searchParams.get('status') || 'all';
  
  // Get orders from Redux store
  const orders = useSelector((state) => state.orders.orders) || [];
  const { contracts } = useSelector((state) => state.contracts) || { contracts: [] };

  // Map contracts to orders for quick lookup
  const ordersWithContracts = useMemo(() => {
    const contractMap = {};
    if (contracts && Array.isArray(contracts)) {
      contracts.forEach(contract => {
        if (contract.orderId) {
          contractMap[contract.orderId] = contract;
        }
      });
    }
    return contractMap;
  }, [contracts]);

  // Calculate statistics by status
  const stats = useMemo(() => {
    const validOrders = orders.filter(o => {
      const status = (o.status || '').toUpperCase();
      return status !== 'CANCELLED';
    });

    // Count by status
    const statusCounts = {
      all: orders.length, // Include cancelled for total
      draft: orders.filter(o => (o.status || '').toUpperCase() === 'DRAFT').length,
      pending: orders.filter(o => (o.status || '').toUpperCase() === 'PENDING').length,
      approved: orders.filter(o => (o.status || '').toUpperCase() === 'APPROVED').length,
      confirmed: orders.filter(o => (o.status || '').toUpperCase() === 'CONFIRMED').length,
      processing: orders.filter(o => (o.status || '').toUpperCase() === 'PROCESSING').length,
      completed: orders.filter(o => (o.status || '').toUpperCase() === 'COMPLETED').length,
      cancelled: orders.filter(o => (o.status || '').toUpperCase() === 'CANCELLED').length,
    };
    
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

    // Total revenue
    const totalRevenue = validOrders
      .filter(o => {
        const status = (o.status || '').toUpperCase();
        return status === 'CONFIRMED' || status === 'COMPLETED' || status === 'PROCESSING' || status === 'APPROVED';
      })
      .reduce((sum, o) => {
        const payment = parseFloat(o.totalPayment) || parseFloat(o.totalPrice) || parseFloat(o.total_amount) || 0;
        return sum + payment;
      }, 0);

    // Orders confirmed but no contract yet
    const confirmedWithoutContract = validOrders.filter(o => {
      const status = (o.status || '').toUpperCase();
      return status === 'CONFIRMED' && !ordersWithContracts[o.orderId];
    }).length;

    // Need attention (DRAFT + PENDING)
    const needAttention = statusCounts.draft + statusCounts.pending;

    return { 
      ...statusCounts,
      needAttention,
      confirmedWithoutContract,
      todayRevenue, 
      todayOrders: todayOrders.length, 
      totalRevenue 
    };
  }, [orders, ordersWithContracts]);

  // Tab configuration based on order statuses
  const statusTabs = [
    {
      id: 'all',
      status: 'all',
      label: 'Tất cả đơn hàng',
      count: stats.all,
      color: 'gray',
      description: 'Xem tất cả đơn hàng',
      badgeColor: 'bg-gray-500'
    },
    {
      id: 'draft',
      status: 'draft',
      label: 'Bản nháp',
      count: stats.draft,
      color: 'gray',
      description: 'Đơn hàng chưa hoàn tất',
      badgeColor: 'bg-gray-500',
      priority: stats.draft > 0
    },
    {
      id: 'pending',
      status: 'pending',
      label: 'Chờ xử lý',
      count: stats.pending,
      color: 'yellow',
      description: 'Đơn hàng đang chờ xử lý',
      badgeColor: 'bg-yellow-500',
      priority: stats.pending > 0
    },
    {
      id: 'confirmed',
      status: 'confirmed',
      label: 'Đã xác nhận',
      count: stats.confirmed,
      color: 'emerald',
      description: 'Đơn hàng đã xác nhận',
      badgeColor: 'bg-emerald-500'
    },
    {
      id: 'completed',
      status: 'completed',
      label: 'Đã hoàn thành',
      count: stats.completed,
      color: 'green',
      description: 'Đơn hàng đã hoàn thành',
      badgeColor: 'bg-green-500'
    }
  ];

  // Handle tab change
  const handleTabChange = (status) => {
    if (status === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ status });
    }
    // Scroll to top when tab changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get color classes based on status
  const getStatusColorClasses = (status, isActive) => {
    const colorMap = {
      all: isActive ? 'border-gray-500 bg-gray-50 text-gray-700' : 'text-gray-600 hover:border-gray-300',
      draft: isActive ? 'border-gray-500 bg-gray-50 text-gray-700' : 'text-gray-600 hover:border-gray-300',
      pending: isActive ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'text-yellow-600 hover:border-yellow-300',
      confirmed: isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'text-emerald-600 hover:border-emerald-300',
      completed: isActive ? 'border-green-500 bg-green-50 text-green-700' : 'text-green-600 hover:border-green-300',
    };
    return colorMap[status] || colorMap.all;
  };

  const getBadgeColorClasses = (status) => {
    const badgeMap = {
      all: 'bg-gray-500 text-white',
      draft: 'bg-gray-500 text-white',
      pending: 'bg-yellow-500 text-white',
      confirmed: 'bg-emerald-500 text-white',
      completed: 'bg-green-500 text-white',
    };
    return badgeMap[status] || badgeMap.all;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 pt-0 pb-4">
        
        {/* Statistics Cards - Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          {/* Today Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => handleTabChange('all')}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600 font-medium">Đơn hàng hôm nay</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xl font-bold text-gray-900">{stats.todayOrders.toLocaleString('vi-VN')}</p>
              <p className="text-sm font-medium text-gray-600">đơn</p>
            </div>
          </motion.div>

          {/* Today Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="text-xs text-gray-600 font-medium">Doanh thu hôm nay</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xl font-bold text-gray-900">
                {stats.todayRevenue >= 1000000 
                  ? `${(stats.todayRevenue / 1000000).toFixed(1)}M`
                  : stats.todayRevenue >= 1000
                  ? `${(stats.todayRevenue / 1000).toFixed(0)}K`
                  : stats.todayRevenue.toLocaleString('vi-VN')
                }
              </p>
              <p className="text-sm font-medium text-gray-600">VNĐ</p>
            </div>
          </motion.div>

          {/* Need Attention - Clickable to Draft tab */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => handleTabChange('draft')}
            className={`bg-white rounded-lg shadow-sm border-2 p-3 hover:shadow-md transition-all cursor-pointer ${
              activeTab === 'draft' || activeTab === 'pending'
                ? 'border-orange-500 bg-orange-50' 
                : stats.needAttention > 0
                ? 'border-orange-300 hover:border-orange-400'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-xs text-gray-600 font-medium">Cần xử lý</p>
              </div>
              {stats.needAttention > 0 && (
                <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                  {stats.needAttention}
                </span>
              )}
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xl font-bold text-gray-900">{stats.needAttention.toLocaleString('vi-VN')}</p>
              <p className="text-sm font-medium text-gray-600">đơn</p>
            </div>
          </motion.div>

          {/* Confirmed Without Contract */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => handleTabChange('confirmed')}
            className={`bg-white rounded-lg shadow-sm border-2 p-3 hover:shadow-md transition-all cursor-pointer ${
              activeTab === 'confirmed' 
                ? 'border-emerald-500 bg-emerald-50' 
                : stats.confirmedWithoutContract > 0
                ? 'border-amber-300 hover:border-amber-400'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-xs text-gray-600 font-medium">Chưa có hợp đồng</p>
              </div>
              {stats.confirmedWithoutContract > 0 && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">
                  {stats.confirmedWithoutContract}
                </span>
              )}
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xl font-bold text-gray-900">{stats.confirmedWithoutContract.toLocaleString('vi-VN')}</p>
              <p className="text-sm font-medium text-gray-600">đơn</p>
            </div>
          </motion.div>
        </div>

        {/* Status Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
          {/* Tabs Row with Create Button */}
          <div className="flex items-center justify-between border-b border-gray-200">
            {/* Tabs */}
            <div className="overflow-x-auto scrollbar-hide flex-1">
              <nav className="flex" aria-label="Status Tabs">
                {statusTabs.map((tab) => {
                  const isActive = activeTab === tab.status;
                  const colorClasses = getStatusColorClasses(tab.status, isActive);
                  const badgeClasses = getBadgeColorClasses(tab.status);
                  
                  return (
                    <motion.button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.status)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-3 transition-all relative min-w-fit
                        ${colorClasses}
                        ${isActive ? 'font-semibold' : ''}
                      `}
                      title={tab.description}
                    >
                      <span>{tab.label}</span>
                      {tab.count > 0 && (
                        <span className={`
                          px-2 py-0.5 rounded-full text-xs font-bold
                          ${badgeClasses}
                        `}>
                          {tab.count}
                        </span>
                      )}
                      {/* Priority indicator */}
                      {tab.priority && tab.count > 0 && !isActive && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-orange-500 rounded-full animate-pulse"></span>
                      )}
                    </motion.button>
                  );
                })}
              </nav>
            </div>
            
            {/* Create Order Button */}
            <div className="px-4 py-2 flex-shrink-0">
              <motion.button
                onClick={() => navigate('/dealer-staff/create-order')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md font-medium text-sm whitespace-nowrap"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Tạo đơn hàng mới
              </motion.button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Pass status filter to ViewOrders */}
                <ViewOrders 
                  defaultStatusFilter={activeTab === 'all' ? 'all' : activeTab}
                  activeTab={activeTab}
                  ordersWithContracts={ordersWithContracts}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderManagement;
