import { motion } from 'framer-motion';
import { statusColors } from '../../styles/designSystem';

// Function to translate status to Vietnamese
const getStatusText = (status) => {
  if (!status) return 'N/A';
  
  const upperStatus = status.toUpperCase();
  const statusMap = {
    'DRAFT': 'Bản nháp',
    'PENDING': 'Chờ xử lý',
    'SIGNED': 'Đã ký',
    'DEPOSIT_PAID': 'Đã đặt cọc',
    'FULLY_PAID': 'Đã thanh toán',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy',
    'EXPIRED': 'Hết hạn',
    'ACCEPTED': 'Đã chấp nhận',
    'APPROVED': 'Đã duyệt',
    'CONFIRMED': 'Đã xác nhận',
    'CONTRACT_PENDING': 'Chờ ký',
    'CONTRACT_SIGNED': 'Đã ký',
    'FILE_UPLOADED': 'Đã upload',
    'PAYMENT_CONFIRMED': 'Đã thanh toán',
    'SHIPPING': 'Vận chuyển',
    'IN_TRANSIT': 'Vận chuyển',
    'DELIVERED': 'Đã giao',
    'FINISH': 'Hoàn thành',
    'REJECTED': 'Từ chối',
    'CANCELED': 'Đã hủy',
    'PROCESSING': 'Đang xử lý'
  };
  
  return statusMap[upperStatus] || status;
};

const StatusBadge = ({ status, size = 'md' }) => {
  const sizes = {
    sm: 'px-2 py-1 text-xs min-w-[70px]',
    md: 'px-3 py-1.5 text-sm min-w-[90px]',
    lg: 'px-4 py-2 text-base min-w-[110px]'
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

