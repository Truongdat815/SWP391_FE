import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, Upload, CreditCard, Truck, Package, XCircle } from 'lucide-react';

const OrderStatusStepper = ({ 
  currentStatus, 
  size = 'md', 
  orientation = 'horizontal',
  className = '' 
}) => {
  const statuses = [
    { key: 'PENDING', label: 'Chờ xử lý', icon: Clock, color: 'yellow' },
    { key: 'CONFIRMED', label: 'Đã chấp nhận', icon: CheckCircle, color: 'blue' },
    { key: 'FILE_UPLOADED', label: 'Đã upload', icon: Upload, color: 'amber' },
    { key: 'PAYMENT_CONFIRMED', label: 'Đã thanh toán', icon: CreditCard, color: 'teal' },
    { key: 'IN_TRANSIT', label: 'Vận chuyển', icon: Truck, color: 'purple' },
    { key: 'DELIVERED', label: 'Đã giao', icon: Package, color: 'green' },
  ];

  const currentStatusUpper = (currentStatus || '').toUpperCase();
  const currentIndex = statuses.findIndex(s => s.key === currentStatusUpper);
  
  // Handle REJECTED status
  const isRejected = currentStatusUpper === 'REJECTED';

  const getStatusState = (index) => {
    if (isRejected) {
      return 'rejected';
    }
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  const getColorClasses = (color, state) => {
    const colorMap = {
      yellow: {
        completed: 'bg-yellow-500 text-white border-yellow-500',
        current: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/50',
        upcoming: 'bg-gray-100 text-gray-400 border-gray-300',
        rejected: 'bg-gray-100 text-gray-400 border-gray-300'
      },
      blue: {
        completed: 'bg-blue-500 text-white border-blue-500',
        current: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-500 shadow-lg shadow-blue-500/50',
        upcoming: 'bg-gray-100 text-gray-400 border-gray-300',
        rejected: 'bg-gray-100 text-gray-400 border-gray-300'
      },
      amber: {
        completed: 'bg-amber-500 text-white border-amber-500',
        current: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-lg shadow-amber-500/50',
        upcoming: 'bg-gray-100 text-gray-400 border-gray-300',
        rejected: 'bg-gray-100 text-gray-400 border-gray-300'
      },
      teal: {
        completed: 'bg-teal-500 text-white border-teal-500',
        current: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-teal-500 shadow-lg shadow-teal-500/50',
        upcoming: 'bg-gray-100 text-gray-400 border-gray-300',
        rejected: 'bg-gray-100 text-gray-400 border-gray-300'
      },
      purple: {
        completed: 'bg-purple-500 text-white border-purple-500',
        current: 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-purple-500 shadow-lg shadow-purple-500/50',
        upcoming: 'bg-gray-100 text-gray-400 border-gray-300',
        rejected: 'bg-gray-100 text-gray-400 border-gray-300'
      },
      green: {
        completed: 'bg-green-600 text-white border-green-600',
        current: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-600 shadow-lg shadow-green-600/50',
        upcoming: 'bg-gray-100 text-gray-400 border-gray-300',
        rejected: 'bg-gray-100 text-gray-400 border-gray-300'
      }
    };
    return colorMap[color]?.[state] || colorMap.yellow[state];
  };

  const sizes = {
    sm: {
      icon: 'w-4 h-4',
      circle: 'w-8 h-8',
      label: 'text-xs',
      connector: orientation === 'horizontal' ? 'h-0.5' : 'w-0.5'
    },
    md: {
      icon: 'w-5 h-5',
      circle: 'w-10 h-10',
      label: 'text-sm',
      connector: orientation === 'horizontal' ? 'h-1' : 'w-1'
    },
    lg: {
      icon: 'w-6 h-6',
      circle: 'w-12 h-12',
      label: 'text-base',
      connector: orientation === 'horizontal' ? 'h-1' : 'w-1'
    }
  };

  const sizeClasses = sizes[size] || sizes.md;

  if (isRejected) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg"
        >
          <XCircle className="w-6 h-6" />
          <span className="font-semibold">Đơn hàng đã bị từ chối</span>
        </motion.div>
      </div>
    );
  }

  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {statuses.map((status, index) => {
          const state = getStatusState(index);
          const Icon = status.icon;
          const isLast = index === statuses.length - 1;

          return (
            <div key={status.key} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    ${sizeClasses.circle} rounded-full border-2 flex items-center justify-center
                    ${getColorClasses(status.color, state)}
                    transition-all duration-300
                  `}
                >
                  <Icon className={sizeClasses.icon} />
                </motion.div>
                {!isLast && (
                  <div className={`${sizeClasses.connector} flex-1 min-h-8 ${
                    state === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
              <div className="flex-1 pb-8">
                <p className={`${sizeClasses.label} font-medium ${
                  state === 'current' ? 'text-gray-900' : 
                  state === 'completed' ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {status.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between w-full ${className}`}>
      {statuses.map((status, index) => {
        const state = getStatusState(index);
        const Icon = status.icon;
        const isLast = index === statuses.length - 1;

        return (
          <React.Fragment key={status.key}>
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  ${sizeClasses.circle} rounded-full border-2 flex items-center justify-center
                  ${getColorClasses(status.color, state)}
                  transition-all duration-300
                `}
              >
                <Icon className={sizeClasses.icon} />
              </motion.div>
              <p className={`${sizeClasses.label} font-medium text-center max-w-20 ${
                state === 'current' ? 'text-gray-900' : 
                state === 'completed' ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {status.label}
              </p>
            </div>
            {!isLast && (
              <div className={`flex-1 ${sizeClasses.connector} mx-2 ${
                state === 'completed' ? 'bg-green-500' : 'bg-gray-300'
              } transition-all duration-300`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default OrderStatusStepper;

