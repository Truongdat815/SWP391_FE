import { motion } from 'framer-motion';
import { Package, Users, FileText, ShoppingCart } from 'lucide-react';

const EmptyState = ({ 
  title = 'Không có dữ liệu',
  description = 'Chưa có dữ liệu nào được tìm thấy',
  icon = 'package',
  action,
  actionText,
  roleColor = 'emerald'
}) => {
  const icons = {
    package: <Package className="w-12 h-12 text-gray-400" />,
    users: <Users className="w-12 h-12 text-gray-400" />,
    file: <FileText className="w-12 h-12 text-gray-400" />,
    cart: <ShoppingCart className="w-12 h-12 text-gray-400" />
  };

  const gradientColors = {
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-pink-600',
    green: 'from-green-500 to-emerald-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-16 px-8"
    >
      <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl shadow-inner">
        {icons[icon] || icons.package}
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">{description}</p>
      
      {action && actionText && (
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={action}
          className={`px-8 py-4 bg-gradient-to-r ${gradientColors[roleColor]} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all`}
        >
          {actionText}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;

