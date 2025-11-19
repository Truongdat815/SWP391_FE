import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import ViewOrders from '../dealerStaff/ViewOrders';
import { 
  TrendingUp,
  DollarSign,
  ChevronRight,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';

function OrderManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL or default to 'all'
  // Redirect 'pending' tab to 'all' since pending tab is removed
  const urlTab = searchParams.get('status') || 'all';
  const activeTab = urlTab === 'pending' ? 'all' : urlTab;
  
  // Redirect if user is on pending tab
  useEffect(() => {
    if (urlTab === 'pending') {
      setSearchParams({});
    }
  }, [urlTab, setSearchParams]);
  
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
      delivered: orders.filter(o => (o.status || '').toUpperCase() === 'DELIVERED').length,
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
      label: 'Đã thanh toán xong',
      count: stats.completed,
      color: 'green',
      description: 'Đơn hàng đã thanh toán xong',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'delivered',
      status: 'delivered',
      label: 'Đã giao hàng',
      count: stats.delivered,
      color: 'blue',
      description: 'Đơn hàng đã được giao',
      badgeColor: 'bg-blue-500'
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
      confirmed: isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'text-emerald-600 hover:border-emerald-300',
      delivered: isActive ? 'border-blue-500 bg-blue-50 text-blue-700' : 'text-blue-600 hover:border-blue-300',
      completed: isActive ? 'border-green-500 bg-green-50 text-green-700' : 'text-green-600 hover:border-green-300',
    };
    return colorMap[status] || colorMap.all;
  };

  const getBadgeColorClasses = (status) => {
    const badgeMap = {
      all: 'bg-gray-500 text-white',
      draft: 'bg-gray-500 text-white',
      confirmed: 'bg-emerald-500 text-white',
      delivered: 'bg-blue-500 text-white',
      completed: 'bg-green-500 text-white',
    };
    return badgeMap[status] || badgeMap.all;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 pt-0 pb-4">
        
        {/* Status Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
          {/* Tabs Row */}
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
                    </motion.button>
                  );
                })}
              </nav>
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
                  readOnly={true}
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
