/**
 * Format currency to Vietnamese Dong
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0₫';
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
};

/**
 * Format date to Vietnamese locale
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  } catch {
    return 'N/A';
  }
};

/**
 * Format datetime to Vietnamese locale
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  } catch {
    return 'N/A';
  }
};

/**
 * Get order status badge config
 * @param {string} status - Order status
 * @returns {object} Badge configuration
 */
export const getOrderStatusConfig = (status) => {
  const statusMap = {
    DRAFT: {
      color: 'bg-slate-100 text-slate-800',
      label: 'Nháp'
    },
    PENDING: {
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Chờ xử lý'
    },
    CONFIRMED: {
      color: 'bg-blue-100 text-blue-800',
      label: 'Đã xác nhận'
    },
    APPROVED: {
      color: 'bg-purple-100 text-purple-800',
      label: 'Đã phê duyệt'
    },
    FULLY_PAID: {
      color: 'bg-emerald-100 text-emerald-800',
      label: 'Đã thanh toán đủ'
    },
    DELIVERED: {
      color: 'bg-green-100 text-green-800',
      label: 'Đã giao hàng'
    },
    CANCELLED: {
      color: 'bg-red-100 text-red-800',
      label: 'Đã hủy'
    },
    CONTRACT_PENDING: {
      color: 'bg-orange-100 text-orange-800',
      label: 'Hợp đồng'
    },
    CONTRACT_SIGNED: {
      color: 'bg-indigo-100 text-indigo-800',
      label: 'Đã ký'
    },
    DEPOSIT_PAID: {
      color: 'bg-amber-100 text-amber-800',
      label: 'Đã đặt cọc'
    },
  };
  return statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status || 'N/A' };
};

/**
 * Get contract status badge config
 * @param {string} status - Contract status
 * @returns {object} Badge configuration
 */
export const getContractStatusConfig = (status) => {
  const statusMap = {
    DRAFT: {
      color: 'bg-slate-100 text-slate-800',
      label: 'Nháp'
    },
    SIGNED: {
      color: 'bg-blue-100 text-blue-800',
      label: 'Đã ký'
    },
    DEPOSIT_PAID: {
      color: 'bg-orange-100 text-orange-800',
      label: 'Đã đặt cọc'
    },
    FULLY_PAID: {
      color: 'bg-emerald-100 text-emerald-800',
      label: 'Đã thanh toán đủ'
    },
    COMPLETED: {
      color: 'bg-green-100 text-green-800',
      label: 'Hoàn thành'
    },
    CANCELLED: {
      color: 'bg-red-100 text-red-800',
      label: 'Đã hủy'
    },
  };
  return statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status || 'N/A' };
};

/**
 * Get payment status badge config
 * @param {string} status - Payment status
 * @returns {object} Badge configuration
 */
export const getPaymentStatusConfig = (status) => {
  const statusMap = {
    PENDING: {
      color: 'bg-yellow-100 text-yellow-800',
      label: 'Chờ thanh toán'
    },
    CONFIRMED: {
      color: 'bg-blue-100 text-blue-800',
      label: 'Đã xác nhận'
    },
    COMPLETED: {
      color: 'bg-green-100 text-green-800',
      label: 'Hoàn thành'
    },
    SUCCESS: {
      color: 'bg-green-100 text-green-800',
      label: 'Thành công'
    },
    FAILED: {
      color: 'bg-red-100 text-red-800',
      label: 'Thất bại'
    },
  };
  return statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status || 'N/A' };
};

/**
 * Get payment type label
 * @param {string} type - Payment type
 * @returns {string} Label
 */
export const getPaymentTypeLabel = (type) => {
  const typeMap = {
    DEPOSIT: 'Đặt cọc',
    BALANCE: 'Thanh toán còn lại',
  };
  return typeMap[type] || type;
};

/**
 * Get payment method label
 * @param {string} method - Payment method
 * @returns {string} Label
 */
export const getPaymentMethodLabel = (method) => {
  const methodMap = {
    VNPAY: 'VNPay',
    CASH: 'Tiền mặt',
  };
  return methodMap[method] || method;
};

/**
 * Check if contract needs payment based on total amount
 * @param {number} totalPayment - Total payment amount
 * @returns {boolean} True if payment is needed, false if auto-paid
 */
export const isPaymentRequired = (totalPayment) => {
  return (totalPayment || 0) > 5;
};

/**
 * Get effective contract status considering auto-payment rule
 * @param {object} contract - Contract object
 * @returns {string} Effective status
 */
export const getEffectiveContractStatus = (contract) => {
  if (!contract) return 'DRAFT';
  
  // If total payment <= 5, automatically consider as FULLY_PAID
  if (!isPaymentRequired(contract.totalPayment)) {
    return 'FULLY_PAID';
  }
  
  return contract.status;
};

/**
 * Get effective remaining amount considering auto-payment rule
 * @param {object} contract - Contract object
 * @returns {number} Effective remaining amount
 */
export const getEffectiveRemainingAmount = (contract) => {
  if (!contract) return 0;
  
  // If total payment <= 5, remaining amount is 0
  if (!isPaymentRequired(contract.totalPayment)) {
    return 0;
  }
  
  return contract.remainingAmountToPay || 0;
};

