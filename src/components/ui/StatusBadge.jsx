import { motion } from 'framer-motion';
import { statusColors } from '../../styles/designSystem';

const StatusBadge = ({ status, size = 'md' }) => {
  const statusMap = {
    'ACTIVE': 'Hoạt động',
    'INACTIVE': 'Không hoạt động',
    'PENDING': 'Chờ duyệt',
    'CONFIRMED': 'Đã xác nhận',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy',
    'DRAFT': 'Nháp',
    'APPROVED': 'Đã phê duyệt',
    'PROCESSING': 'Đang xử lý'
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const upperStatus = status?.toUpperCase();
  const colorConfig = statusColors[upperStatus] || statusColors.PENDING;
  const text = statusMap[upperStatus] || status;

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex items-center gap-2 rounded-full font-medium shadow-lg
        ${colorConfig.bg} ${colorConfig.text} ${sizes[size]}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${colorConfig.dot} animate-pulse`} />
      {text}
    </motion.span>
  );
};

export default StatusBadge;

