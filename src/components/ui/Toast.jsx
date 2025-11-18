import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ show, type = 'success', message, onClose, duration = 3000 }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  };

  const styles = {
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
    error: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
    info: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-2 right-4 z-[9999] max-w-md"
        >
          <div className={`${styles[type]} rounded-2xl shadow-2xl backdrop-blur-lg px-6 py-4 flex items-center gap-4`}>
            <div className="flex-shrink-0">
              {icons[type]}
            </div>
            <p className="flex-1 font-medium text-sm">{message}</p>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

