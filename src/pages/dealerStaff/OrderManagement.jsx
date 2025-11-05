import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import CreateOrder from './CreateOrder';
import ViewOrders from './ViewOrders';
import { ShoppingCart, List } from 'lucide-react';

function OrderManagement() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'view'

  // Check if we should switch to view tab from navigation state
  useEffect(() => {
    if (location.state?.tab === 'view') {
      setActiveTab('view');
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex space-x-2 border-b border-gray-200 pb-2">
          <motion.button
            onClick={() => setActiveTab('create')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center px-6 py-3 font-medium rounded-lg transition-all ${
              activeTab === 'create'
                ? 'text-emerald-600 bg-emerald-50 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className={`h-5 w-5 mr-2 ${activeTab === 'create' ? 'text-emerald-600' : 'text-gray-500'}`} />
            Tạo đơn hàng
          </motion.button>
          
          <motion.button
            onClick={() => setActiveTab('view')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center px-6 py-3 font-medium rounded-lg transition-all ${
              activeTab === 'view'
                ? 'text-emerald-600 bg-emerald-50 border-b-2 border-emerald-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <List className={`h-5 w-5 mr-2 ${activeTab === 'view' ? 'text-emerald-600' : 'text-gray-500'}`} />
            Danh sách đơn hàng
          </motion.button>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'create' ? <CreateOrder /> : <ViewOrders />}
      </motion.div>
    </div>
  );
}

export default OrderManagement;

