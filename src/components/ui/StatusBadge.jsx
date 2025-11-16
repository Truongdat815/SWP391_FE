import { motion } from 'framer-motion';
import { statusColors } from '../../styles/designSystem';

// Function to translate status to Vietnamese
const getStatusText = (status) => {
  if (!status) return 'N/A';
  
  const upperStatus = status.toUpperCase();
  const statusMap = {
    'PENDING': 'Chờ xử lý',
    'ACCEPTED': 'Đã chấp nhận',
    'APPROVED': 'Đã duyệt',
    'CONFIRMED': 'Đã xác nhận',
    'CONTRACT_PENDING': 'Chờ ký hợp đồng',
    'CONTRACT_SIGNED': 'Đã ký hợp đồng',
    'FILE_UPLOADED': 'Đã upload',
    'PAYMENT_CONFIRMED': 'Đã thanh toán',
    'FULLY_PAID': 'Đã thanh toán đủ',
    'SHIPPING': 'Đang vận chuyển',
    'IN_TRANSIT': 'Đang vận chuyển',
    'COMPLETED': 'Đã hoàn thành',
    'DELIVERED': 'Đã giao hàng',
    'FINISH': 'Hoàn thành',
    'REJECTED': 'Đã từ chối',
    'CANCELLED': 'Đã hủy',
    'CANCELED': 'Đã hủy',
    'DRAFT': 'Bản nháp',
    'PROCESSING': 'Đang xử lý'
  };
  
  return statusMap[upperStatus] || status;
};

const StatusBadge = ({ status, size = 'md' }) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const upperStatus = status?.toUpperCase();
  const colorConfig = statusColors[upperStatus] || statusColors.PENDING;
  // Return status in Vietnamese
  const text = getStatusText(status);

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-medium shadow-lg
        ${colorConfig.bg} ${colorConfig.text} ${sizes[size]}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${colorConfig.dot} animate-pulse`} />
      {text}
    </motion.span>
  );
};

export default StatusBadge;

