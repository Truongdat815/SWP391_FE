import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({ 
  show, 
  onConfirm, 
  onCancel, 
  title = "Xác nhận", 
  message, 
  confirmText = "Xác nhận", 
  cancelText = "Hủy",
  type = "warning" // warning, danger, info
}) => {
  const typeStyles = {
    warning: {
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'from-yellow-100 to-orange-100',
      icon: <AlertTriangle className="w-8 h-8 text-yellow-600" />
    },
    danger: {
      gradient: 'from-red-500 to-pink-500',
      bg: 'from-red-100 to-pink-100',
      icon: <AlertTriangle className="w-8 h-8 text-red-600" />
    },
    info: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-100 to-cyan-100',
      icon: <AlertTriangle className="w-8 h-8 text-blue-600" />
    }
  };

  const style = typeStyles[type] || typeStyles.warning;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className={`flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${style.bg} rounded-3xl shadow-inner`}>
                {style.icon}
              </div>
              
              <p className="text-center text-gray-700 text-base mb-6">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-all"
              >
                {cancelText}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className={`flex-1 px-6 py-3 bg-gradient-to-r ${style.gradient} text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all`}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;

