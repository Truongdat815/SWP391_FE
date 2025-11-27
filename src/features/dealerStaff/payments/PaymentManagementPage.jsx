import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, Calendar, RefreshCw, CreditCard, Banknote, CheckCircle, AlertCircle, MoreVertical } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import Stepper from '../../../components/ui/Stepper';
import { useGetAllPaymentsQuery, useGetPaymentByIdQuery, useCreatePaymentMutation, useConfirmCashPaymentMutation, useGetPaymentsByOrderQuery } from '../../../api/dealerStaff/paymentApi';
import { useGetAllContractsQuery, useGetContractDetailQuery, useCreateContractMutation } from '../../../api/dealerStaff/contractApi';
import { useGetAllOrdersQuery } from '../../../api/dealerStaff/orderApi';
import { formatCurrency, formatDate, getPaymentStatusConfig, getPaymentTypeLabel, getPaymentMethodLabel, getContractStatusConfig, getEffectiveContractStatus, getEffectiveRemainingAmount, isPaymentRequired, getOrderStatusConfig } from '../../../utils/formatters';

const PAYMENT_STEPS = [
  { id: 'contract', label: 'Chọn hợp đồng' },
  { id: 'type', label: 'Loại thanh toán' },
  { id: 'method', label: 'Phương thức' },
];

const PaymentManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Helper functions for date formatting and validation
  const formatDateToInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };


  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const validateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  };

  const validateValueRange = (minValue, maxValue) => {
    if (!minValue || !maxValue) return true;
    const min = parseFloat(minValue);
    const max = parseFloat(maxValue);
    return min <= max;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [totalValueFilter, setTotalValueFilter] = useState({ min: '', max: '' });

  // Handle date range changes with validation
  const handleStartDateChange = (value) => {
    const newDateRange = { ...dateRange, start: value };

    // If end date exists and new start date is after end date, clear end date
    if (newDateRange.end && !validateDateRange(value, newDateRange.end)) {
      newDateRange.end = '';
      toast.warning('Đã xóa ngày kết thúc vì ngày bắt đầu phải trước ngày kết thúc');
    }

    setDateRange(newDateRange);
  };

  const handleEndDateChange = (value) => {
    // Validate that end date is after start date
    if (dateRange.start && !validateDateRange(dateRange.start, value)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    setDateRange({ ...dateRange, end: value });
  };

  // Handle value range changes with validation
  const handleMinValueChange = (value) => {
    // Prevent negative values
    if (parseFloat(value) < 0) {
      toast.error('Giá trị không được âm');
      return;
    }

    const newValueFilter = { ...totalValueFilter, min: value };

    // If max value exists and new min is greater than max, show warning
    if (newValueFilter.max && !validateValueRange(value, newValueFilter.max)) {
      toast.error('Giá trị từ phải nhỏ hơn giá trị đến');
      return;
    }

    setTotalValueFilter(newValueFilter);
  };

  const handleMaxValueChange = (value) => {
    // Prevent negative values
    if (parseFloat(value) < 0) {
      toast.error('Giá trị không được âm');
      return;
    }

    // Validate that max value is greater than min value
    if (totalValueFilter.min && !validateValueRange(totalValueFilter.min, value)) {
      toast.error('Giá trị đến phải lớn hơn giá trị từ');
      return;
    }

    setTotalValueFilter({ ...totalValueFilter, max: value });
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);


  // Create Payment Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedContract, setSelectedContract] = useState(null);
  const [paymentType, setPaymentType] = useState('DEPOSIT'); // Mặc định là DEPOSIT
  const [paymentMethod, setPaymentMethod] = useState('VNPAY'); // Mặc định là VNPAY

  // Payment History Modal
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [selectedOrderForHistory, setSelectedOrderForHistory] = useState(null);
  const [selectedContractType, setSelectedContractType] = useState('DEPOSIT');

  // Confirm Cash Payment Modal
  const [isConfirmCashModalOpen, setIsConfirmCashModalOpen] = useState(false);
  const [selectedPaymentForConfirm, setSelectedPaymentForConfirm] = useState(null);

  const { data: paymentsData, isLoading, error, refetch: refetchPayments } = useGetAllPaymentsQuery();
  const { data: ordersData, isLoading: isLoadingOrders, refetch: refetchOrders } = useGetAllOrdersQuery();
  const { data: contractsData, refetch: refetchContracts } = useGetAllContractsQuery();
  const [createPayment, { isLoading: creatingPayment }] = useCreatePaymentMutation();
  const [confirmCashPayment, { isLoading: isConfirmingCash }] = useConfirmCashPaymentMutation();
  const [createContract, { isLoading: isCreatingContract }] = useCreateContractMutation();

  // Get orderId from route state
  const orderIdFromRoute = location.state?.orderId;
  const highlightOrderId = location.state?.highlightOrderId;

  const payments = Array.isArray(paymentsData?.data) ? paymentsData.data : [];
  const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];
  const contracts = Array.isArray(contractsData?.data) ? contractsData.data : [];

  // Debug logging
  console.log('PaymentManagementPage Debug:', {
    paymentsData,
    contractsData,
    payments: payments.length,
    contracts: contracts.length,
    isLoading,
    error
  });

  // Filter orders for display (only orders that have payments)
  const ordersNeedPayment = useMemo(() => {
    // Only show orders that have at least one payment
    // Match by orderId or orderCode (check both payment and payment.data)
    return orders.filter(order => {
      const hasPayment = payments.some(payment => {
        const paymentOrderCode = payment.orderCode || payment.data?.orderCode;
        const paymentOrderId = payment.orderId || payment.data?.orderId;
        
        return paymentOrderId === order.orderId || 
               paymentOrderCode === order.orderCode;
      });
      return hasPayment;
    });
  }, [orders, payments]);

  // Filter orders based on search, status, date range, and total value
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(ordersNeedPayment)) return [];
    return ordersNeedPayment.filter((order) => {
      const matchesSearch =
        order.orderId?.toString().includes(searchTerm) ||
        order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      // Date range filter
      let matchesDateRange = true;
      if (dateRange.start || dateRange.end) {
        const orderDate = new Date(order.orderDate);
        if (dateRange.start) {
          matchesDateRange = matchesDateRange && orderDate >= new Date(dateRange.start);
        }
        if (dateRange.end) {
          matchesDateRange = matchesDateRange && orderDate <= new Date(dateRange.end);
        }
      }

      // Total value filter
      let matchesTotalValue = true;
      if (totalValueFilter.min || totalValueFilter.max) {
        const totalPayment = order.totalPayment || 0;
        if (totalValueFilter.min) {
          matchesTotalValue = matchesTotalValue && totalPayment >= parseFloat(totalValueFilter.min);
        }
        if (totalValueFilter.max) {
          matchesTotalValue = matchesTotalValue && totalPayment <= parseFloat(totalValueFilter.max);
        }
      }

      return matchesSearch && matchesStatus && matchesDateRange && matchesTotalValue;
    });
  }, [ordersNeedPayment, searchTerm, statusFilter, dateRange, totalValueFilter]);

  // Handle orderId from route state - highlight the order
  useEffect(() => {
    if (highlightOrderId) {
      // Scroll to highlighted order after a short delay
      setTimeout(() => {
        const element = document.getElementById(`order-${highlightOrderId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
          }, 3000);
        }
      }, 500);
      // Clear state
      window.history.replaceState({}, document.title);
    }
  }, [highlightOrderId]);

  // Handle VNPay callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const vnpResponseCode = urlParams.get('vnp_ResponseCode');
    const paymentId = urlParams.get('paymentId');

    if (location.pathname.includes('/payments/callback') && vnpResponseCode) {
      if (vnpResponseCode === '00') {
        // Payment successful
        toast.success('Thanh toán thành công!');
        // Refresh data
        refetchPayments();
        refetchOrders();
        refetchContracts();
        // Navigate to payments page without callback params
        navigate('/dealer-staff/payments', { replace: true });
      } else {
        // Payment failed
        toast.error('Thanh toán thất bại. Vui lòng thử lại.');
        navigate('/dealer-staff/payments', { replace: true });
      }
    }
  }, [location, toast, navigate]);

  // Handle opening payment history modal
  const handleOpenPaymentHistory = (order) => {
    setSelectedOrderForHistory(order);
    
    // Auto-determine contractType: DEPOSIT if no contract exists, SALE if contract exists
    const contractsList = Array.isArray(contracts) ? contracts : [];
    const orderContracts = contractsList.filter(contract => 
      contract && contract.orderId === order.orderId
    );
    const defaultContractType = orderContracts.length === 0 ? 'DEPOSIT' : 'SALE';
    setSelectedContractType(defaultContractType);
    
    setIsPaymentHistoryModalOpen(true);
  };

  const handleClosePaymentHistory = () => {
    setIsPaymentHistoryModalOpen(false);
    setSelectedOrderForHistory(null);
    setSelectedContractType('DEPOSIT');
  };

  // Handle create contract
  const handleCreateContract = async (order) => {
    if (!order) {
      toast.error('Vui lòng chọn đơn hàng');
      return;
    }

    if (!order.orderId) {
      toast.error('Đơn hàng không hợp lệ');
      return;
    }

    if (!selectedContractType || (selectedContractType !== 'DEPOSIT' && selectedContractType !== 'SALE')) {
      toast.error('Vui lòng chọn loại hợp đồng');
      return;
    }

    try {
      // Ensure orderId is a number and contractType is a string
      const payload = {
        orderId: Number(order.orderId),
        contractType: String(selectedContractType)
      };

      console.log('Creating contract with payload:', payload);

      await createContract(payload).unwrap();
      
      toast.success(`Đã tạo hợp đồng ${selectedContractType === 'DEPOSIT' ? 'đặt cọc' : 'bán hàng'} thành công!`);
      refetchContracts();
      refetchOrders();
      setSelectedContractType('DEPOSIT'); // Reset to default
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo hợp đồng');
    }
  };


  // Filter payments
  const filteredPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    // Sort payments by date (newest first)
    const sortedPayments = [...payments].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA; // Descending order (newest first)
    });

    return sortedPayments.filter((payment) => {
      const matchesSearch =
        payment.paymentId?.toString().includes(searchTerm) ||
        payment.paymentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.contractCode?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;

      // Date range filter with validation
      let matchesDateRange = true;
      if (dateRange.start || dateRange.end) {
        const paymentDate = new Date(payment.createdAt || payment.paymentDate);
        if (dateRange.start) {
          const startDate = new Date(dateRange.start);
          matchesDateRange = matchesDateRange && paymentDate >= startDate;
        }
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          // Set end date to end of day for inclusive filtering
          endDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && paymentDate <= endDate;
        }
      }

      // Total value filter with validation
      let matchesTotalValue = true;
      if (totalValueFilter.min || totalValueFilter.max) {
        const paymentAmount = payment.amount || payment.totalAmount || 0;
        if (totalValueFilter.min) {
          const minValue = parseFloat(totalValueFilter.min);
          if (!isNaN(minValue) && minValue >= 0) {
            matchesTotalValue = matchesTotalValue && paymentAmount >= minValue;
          }
        }
        if (totalValueFilter.max) {
          const maxValue = parseFloat(totalValueFilter.max);
          if (!isNaN(maxValue) && maxValue >= 0) {
            matchesTotalValue = matchesTotalValue && paymentAmount <= maxValue;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesDateRange && matchesTotalValue;
    });
  }, [payments, searchTerm, statusFilter, dateRange, totalValueFilter]);


  // Pagination for orders
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const config = getOrderStatusConfig(status);
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Get payments for an order
  const getOrderPayments = (order) => {
    return payments.filter(payment => {
      // Match by orderId or orderCode
      const paymentOrderCode = payment.orderCode || payment.data?.orderCode;
      const paymentOrderId = payment.orderId || payment.data?.orderId;
      
      return paymentOrderId === order.orderId || 
             paymentOrderCode === order.orderCode ||
             paymentOrderCode === order.orderCode;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt || a.data?.createdAt || 0);
      const dateB = new Date(b.createdAt || b.data?.createdAt || 0);
      return dateB - dateA;
    });
  };

  const handleOpenConfirmCashModal = (payment) => {
    setSelectedPaymentForConfirm(payment);
    setIsConfirmCashModalOpen(true);
  };

  const handleCloseConfirmCashModal = () => {
    setIsConfirmCashModalOpen(false);
    setSelectedPaymentForConfirm(null);
  };

  const handleConfirmCash = async () => {
    if (!selectedPaymentForConfirm) return;

    const paymentData = selectedPaymentForConfirm.data || selectedPaymentForConfirm;
    const paymentId = paymentData.paymentId || selectedPaymentForConfirm.paymentId;

    try {
      await confirmCashPayment(paymentId).unwrap();
      toast.success('Xác nhận thanh toán tiền mặt thành công');
      refetchPayments();
      refetchOrders();
      refetchContracts();
      handleCloseConfirmCashModal();
    } catch (error) {
      console.error('Error confirming cash payment:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi xác nhận thanh toán');
    }
  };

  const handleCreatePayment = async () => {
    if (!selectedContract || !paymentType || !paymentMethod) {
      toast.error('Vui lòng hoàn tất tất cả các bước');
      return;
    }

    try {
      const paymentData = {
        contractId: selectedContract.contractId,
        paymentType,
        paymentMethod,
        returnUrl: `${window.location.origin}/dealer-staff/payments/callback`,
      };

      const response = await createPayment(paymentData).unwrap();
      const paymentUrl = response?.data || response?.paymentUrl;

      if (paymentMethod === 'VNPAY' && paymentUrl) {
        // Redirect to VNPay
        toast.success('Đang chuyển đến trang thanh toán VNPay...');
        // Redirect immediately without delay
        window.location.href = paymentUrl;
      } else if (paymentMethod === 'CASH') {
        // Cash payment - success immediately
        toast.success('Đã tạo thanh toán thành công!');
        handleCloseModal();
      } else {
        toast.error('Không thể tạo thanh toán');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
    }
  };

  // Calculate paid amount from contract detail
  const getPaidAmount = (contract) => {
    if (!contract) return 0;
    // Đã trả = Tổng thanh toán - Còn lại
    return (contract.totalPayment || 0) - (contract.remainingAmountToPay || 0);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setPaymentStep(1);
    setSelectedContract(null);
    setPaymentType('DEPOSIT');
    setPaymentMethod('VNPAY');
  };

  const handleNextStep = () => {
    if (paymentStep === 1 && !selectedContract) {
      toast.error('Vui lòng chọn hợp đồng');
      return;
    }
    if (paymentStep === 2 && !paymentType) {
      toast.error('Vui lòng chọn loại thanh toán');
      return;
    }
    setPaymentStep(paymentStep + 1);
  };

  const handleBackStep = () => {
    if (paymentStep > 1) {
      setPaymentStep(paymentStep - 1);
    }
  };

  if (isLoading || isLoadingOrders) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSkeleton className="w-20 h-20" variant="circle" />
        </div>
      </DealerStaffLayout>
    );
  }

  if (error) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
        </div>
      </DealerStaffLayout>
    );
  }

  return (
    <DealerStaffLayout
      title="Quản lý Thanh toán"
      description="Xem, tạo và quản lý các giao dịch thanh toán"
    >
      <div className="mx-auto max-w-[90rem] px-0 py-4 pl-10 pr-10 pt-8 space-y-4">

        {/* Toolbar and Filters */}
        <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-white ">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[300px]">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search size={20} />
                </span>
                <input
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-300 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Tìm theo mã thanh toán, hợp đồng, khách hàng..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="DRAFT">Nháp</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="PENDING_DEPOSIT">Chờ đặt cọc</option>
                <option value="DEPOSIT_PAID">Đã đặt cọc</option>
                <option value="FULLY_PAID">Đã thanh toán đủ</option>
                <option value="DELIVERED">Đã giao</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {/* Additional Filters Row */}
          <div className="flex flex-wrap items-start gap-4 mt-3 pt-3 border-t border-slate-200 pb-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Từ ngày:</label>
              <input
                type="date"
                value={dateRange.start}
                max={getTodayString()}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                title="Chọn ngày (không được sau hôm nay)"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Đến ngày:</label>
              <input
                type="date"
                value={dateRange.end}
                min={dateRange.start || undefined}
                onChange={(e) => handleEndDateChange(e.target.value)}
                disabled={!dateRange.start}
                className={`h-10 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary ${!dateRange.start
                    ? 'bg-slate-100 cursor-not-allowed text-slate-400'
                    : 'bg-slate-50'
                  }`}
                title={!dateRange.start ? "Vui lòng chọn ngày bắt đầu trước" : "Chọn ngày kết thúc"}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Giá trị từ:</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={totalValueFilter.min}
                onChange={(e) => handleMinValueChange(e.target.value)}
                placeholder="0"
                className="h-10 w-32 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                title="Nhập giá trị tối thiểu (không âm)"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Đến:</label>
              <input
                type="number"
                min={totalValueFilter.min || "0"}
                step="1000"
                value={totalValueFilter.max}
                onChange={(e) => handleMaxValueChange(e.target.value)}
                placeholder="∞"
                disabled={!totalValueFilter.min}
                className={`h-10 w-32 rounded-lg border border-slate-300 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary ${!totalValueFilter.min
                    ? 'bg-slate-100 cursor-not-allowed text-slate-400'
                    : 'bg-slate-50'
                  }`}
                title={!totalValueFilter.min ? "Vui lòng nhập giá trị từ trước" : "Nhập giá trị tối đa"}
              />
            </div>
            {(dateRange.start || dateRange.end || totalValueFilter.min || totalValueFilter.max) && (
              <button
                onClick={() => {
                  setDateRange({ start: '', end: '' });
                  setTotalValueFilter({ min: '', max: '' });
                }}
                className="h-10 px-4 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>


        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white ">
          {paginatedOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Không tìm thấy đơn hàng'
                : 'Chưa có đơn hàng nào'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Mã Đơn hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedOrders.map((order) => {
                    const orderPayments = getOrderPayments(order);
                    const isHighlighted = highlightOrderId === order.orderId;

                    return (
                      <motion.tr
                        key={order.orderId}
                        id={`order-${order.orderId}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`hover:bg-slate-50 transition-colors ${isHighlighted ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {order.orderCode || `#${order.orderId}`}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                          {order.customerName || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                          {formatCurrency(order.totalPayment || 0)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            {orderPayments.length > 0 && (
                              <button
                                onClick={() => handleOpenPaymentHistory(order)}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                              >
                                <span>Lịch sử</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-600 ">
              Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
              <span className="font-medium">{Math.min(endIndex, filteredOrders.length)}</span> của{' '}
              <span className="font-medium">{filteredOrders.length}</span> kết quả
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                ←
              </Button>
              <span className="px-3 py-1 text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="h-9 w-9 p-0"
              >
                →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Payment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title="Tạo thanh toán mới"
        size="xl"
      >
        <div className="space-y-6">
          {/* Payment form when contract is selected */}
          {selectedContract ? (
            <div className="space-y-4">
              {/* Contract Info - Compact */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Mã hợp đồng</p>
                    <p className="font-semibold text-slate-900">{selectedContract.contractCode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Ngày hợp đồng</p>
                    <p className="font-semibold text-slate-900">{formatDate(selectedContract.contractDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Khách hàng</p>
                    <p className="font-semibold text-slate-900">{selectedContract.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Tổng thanh toán</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(selectedContract.totalPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Đặt cọc</p>
                    <p className="font-semibold text-blue-600">{formatCurrency(selectedContract.depositPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Còn lại</p>
                    <p className="font-semibold text-orange-600">{formatCurrency(getEffectiveRemainingAmount(selectedContract))}</p>
                  </div>
                </div>
              </div>

              {/* Payment Type Selection - Compact */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Loại thanh toán <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={() => setPaymentType('DEPOSIT')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={getPaidAmount(selectedContract) > 0}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${paymentType === 'DEPOSIT'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-blue-300 bg-white text-slate-700'
                      } ${getPaidAmount(selectedContract) > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle size={18} className={paymentType === 'DEPOSIT' ? 'text-blue-600' : 'text-slate-400'} />
                      <p className="font-semibold text-sm">Đặt cọc</p>
                    </div>
                    <p className="text-xs text-slate-600">{formatCurrency(selectedContract.depositPrice || 0)}</p>
                  </motion.button>
                  <motion.button
                    onClick={() => setPaymentType('BALANCE')}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={getPaidAmount(selectedContract) === 0}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${paymentType === 'BALANCE'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 hover:border-blue-300 bg-white text-slate-700'
                      } ${getPaidAmount(selectedContract) === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle size={18} className={paymentType === 'BALANCE' ? 'text-blue-600' : 'text-slate-400'} />
                      <p className="font-semibold text-sm">Thanh toán số dư</p>
                    </div>
                    <p className="text-xs text-slate-600">{formatCurrency(getEffectiveRemainingAmount(selectedContract) || 0)}</p>
                  </motion.button>
                </div>
              </div>

              {/* Payment Summary - Compact with VNPay info */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-blue-600" />
                    <span className="text-sm font-semibold text-slate-700">Phương thức: VNPay</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Số tiền thanh toán</p>
                    <p className="font-bold text-lg text-blue-600">
                      {formatCurrency(
                        paymentType === 'DEPOSIT'
                          ? (selectedContract.depositPrice || 0)
                          : (getEffectiveRemainingAmount(selectedContract) || 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="px-5"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreatePayment}
                  disabled={!paymentType || creatingPayment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 font-semibold"
                >
                  {creatingPayment ? 'Đang xử lý...' : 'Thanh toán'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Stepper */}
              <Stepper steps={PAYMENT_STEPS} currentStep={paymentStep} />

              {/* Step Content */}
              <div className="min-h-[300px]">
                {/* STEP 1: Select Contract */}
                {paymentStep === 1 && (
                  <motion.div
                    key="payment-step-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 ">
                      Chọn hợp đồng cần thanh toán
                    </h3>

                      <div className="text-center py-8 text-slate-500">
                      Vui lòng chọn hợp đồng từ danh sách hợp đồng để tạo thanh toán
                            </div>
                  </motion.div>
                )}

                {/* STEP 2: Select Payment Type */}
                {paymentStep === 2 && (
                  <motion.div
                    key="payment-step-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 ">
                      Chọn loại thanh toán
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        onClick={() => setPaymentType('DEPOSIT')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${paymentType === 'DEPOSIT'
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                            <AlertCircle className="text-orange-600 " size={24} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              Đặt cọc
                            </h4>
                            <p className="text-sm text-slate-600 ">
                              Thanh toán trước một phần (thường 30% tổng giá trị hợp đồng)
                            </p>
                          </div>
                          {paymentType === 'DEPOSIT' && (
                            <CheckCircle className="text-primary" size={24} />
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        onClick={() => setPaymentType('BALANCE')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${paymentType === 'BALANCE'
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <CheckCircle className="text-green-600 " size={24} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              Thanh toán còn lại
                            </h4>
                            <p className="text-sm text-slate-600 ">
                              Thanh toán phần còn lại sau khi đã đặt cọc
                            </p>
                          </div>
                          {paymentType === 'BALANCE' && (
                            <CheckCircle className="text-primary" size={24} />
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Select Payment Method */}
                {paymentStep === 3 && (
                  <motion.div
                    key="payment-step-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 ">
                      Chọn phương thức thanh toán
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        onClick={() => setPaymentMethod('VNPAY')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'VNPAY'
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <CreditCard className="text-blue-600 " size={24} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              VNPay
                            </h4>
                            <p className="text-sm text-slate-600 ">
                              Thanh toán online qua cổng VNPay
                            </p>
                          </div>
                          {paymentMethod === 'VNPAY' && (
                            <CheckCircle className="text-primary" size={24} />
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        onClick={() => setPaymentMethod('CASH')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'CASH'
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <Banknote className="text-green-600 " size={24} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              Tiền mặt
                            </h4>
                            <p className="text-sm text-slate-600 ">
                              Thanh toán trực tiếp tại cửa hàng
                            </p>
                          </div>
                          {paymentMethod === 'CASH' && (
                            <CheckCircle className="text-primary" size={24} />
                          )}
                        </div>
                      </motion.div>
                    </div>

                    {/* Summary */}
                    {selectedContract && paymentType && paymentMethod && (
                      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold text-slate-900 mb-3">
                          Tóm tắt thanh toán
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600 ">Hợp đồng:</span>
                            <span className="font-medium">HD-{selectedContract.contractId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 ">Loại thanh toán:</span>
                            <span className="font-medium">{getPaymentTypeLabel(paymentType)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 ">Phương thức:</span>
                            <span className="font-medium">{getPaymentMethodLabel(paymentMethod)}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-300 ">
                            <div className="flex justify-between">
                              <span className="font-semibold">Tổng giá trị hợp đồng:</span>
                              <span className="font-bold text-primary">
                                {formatCurrency(selectedContract.totalValue || selectedContract.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t border-slate-200 ">
                <Button
                  variant="outline"
                  onClick={handleBackStep}
                  disabled={paymentStep === 1}
                >
                  Quay lại
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                  >
                    Hủy
                  </Button>
                  {paymentStep < 3 ? (
                    <Button onClick={handleNextStep}>
                      Tiếp tục
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreatePayment}
                      disabled={creatingPayment || !selectedContract || !paymentType || !paymentMethod}
                    >
                      {creatingPayment ? 'Đang xử lý...' : 'Tạo thanh toán'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Payment History Modal */}
      <Modal
        isOpen={isPaymentHistoryModalOpen}
        onClose={handleClosePaymentHistory}
        title="Lịch sử thanh toán"
        size="xl"
      >
        {selectedOrderForHistory && (
          <div className="space-y-4">
            {/* Order Info */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-slate-600">Đơn hàng: </span>
                  <span className="font-semibold">{selectedOrderForHistory.orderCode || `#${selectedOrderForHistory.orderId}`}</span>
                  <span className="text-sm text-slate-600 ml-3">Khách hàng: </span>
                  <span className="font-semibold">{selectedOrderForHistory.customerName || 'N/A'}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">Tổng tiền: <span className="font-bold text-slate-900">{formatCurrency(selectedOrderForHistory.totalPayment || 0)}</span></div>
                </div>
              </div>
            </div>

            {/* Payment Info - Latest Payment Only */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700">Thanh toán mới nhất</h3>

              <div>
                {(() => {
                  const orderPayments = getOrderPayments(selectedOrderForHistory);

                  if (orderPayments.length === 0) {
                    return (
                      <div className="p-6 text-center text-slate-500">
                        Chưa có lịch sử thanh toán nào
                      </div>
                    );
                  }

                  // Get latest payment (first one after sorting)
                  const latestPayment = orderPayments[0];
                  const paymentData = latestPayment.data || latestPayment;
                  const paymentId = paymentData.paymentId || latestPayment.paymentId;
                  const paymentCode = paymentData.paymentCode || latestPayment.paymentCode;
                  const status = paymentData.status || latestPayment.status;
                  const paymentMethod = paymentData.paymentMethod || latestPayment.paymentMethod;
                  const paymentType = paymentData.paymentType || latestPayment.paymentType;
                  const amount = paymentData.amount || latestPayment.amount || latestPayment.totalAmount || 0;
                  const createdAt = paymentData.createdAt || latestPayment.createdAt;

                  return (
                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-slate-900">Payment ID: {paymentId}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              status === 'COMPLETED' || status === 'SUCCESS'
                                    ? 'bg-green-100 text-green-700'
                                : status === 'DEPOSIT_SIGNED'
                                  ? 'bg-blue-100 text-blue-700'
                                : status === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-700'
                                  : status === 'FAILED'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-700'
                                  }`}>
                              {status === 'COMPLETED' ? 'Hoàn thành' :
                                status === 'SUCCESS' ? 'Thành công' :
                                  status === 'DEPOSIT_SIGNED' ? 'Đã ký' :
                                  status === 'PENDING' ? 'Chờ xử lý' :
                                    status === 'FAILED' ? 'Thất bại' : status}
                                </span>
                              </div>
                          <div className="text-sm text-slate-600 space-y-1">
                            <div>
                              <span className="font-medium">Ngày:</span> <span>{formatDate(createdAt)}</span>
                              </div>
                            <div>
                              <span className="font-medium">Phương thức:</span> <span>{paymentMethod === 'VNPAY' ? 'VNPay' : paymentMethod === 'CASH' ? 'Tiền mặt' : paymentMethod}</span>
                            </div>
                            <div>
                              <span className="font-medium">Loại:</span> <span>{paymentType === 'DEPOSIT' ? 'Đặt cọc' : 'Thanh toán số dư'}</span>
                            </div>
                            {paymentCode && (
                              <div>
                                <span className="font-medium">Mã thanh toán:</span> <span>{paymentCode}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold text-lg text-green-600 mb-2">{formatCurrency(amount)}</div>
                          {status === 'DRAFT' && paymentMethod === 'CASH' && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                handleOpenConfirmCashModal(latestPayment);
                                  }}
                              className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                                >
                              Xác nhận tiền mặt
                                </Button>
                              )}
                            </div>
                          </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Cash Payment Modal */}
      <Modal
        isOpen={isConfirmCashModalOpen}
        onClose={handleCloseConfirmCashModal}
        title="Xác nhận thanh toán tiền mặt"
        size="md"
      >
        {selectedPaymentForConfirm && (() => {
          const paymentData = selectedPaymentForConfirm.data || selectedPaymentForConfirm;
          const paymentId = paymentData.paymentId || selectedPaymentForConfirm.paymentId;
          const paymentCode = paymentData.paymentCode || selectedPaymentForConfirm.paymentCode;
          const amount = paymentData.amount || selectedPaymentForConfirm.amount || selectedPaymentForConfirm.totalAmount || 0;
          const paymentMethod = paymentData.paymentMethod || selectedPaymentForConfirm.paymentMethod;
          const paymentType = paymentData.paymentType || selectedPaymentForConfirm.paymentType;
          const createdAt = paymentData.createdAt || selectedPaymentForConfirm.createdAt;

          return (
            <div className="space-y-4">
              {/* Payment Info */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment ID:</span>
                    <span className="font-semibold">{paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Mã thanh toán:</span>
                    <span className="font-semibold">{paymentCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Số tiền:</span>
                    <span className="font-semibold text-green-600 text-base">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Phương thức:</span>
                    <span className="font-semibold">{paymentMethod === 'VNPAY' ? 'VNPay' : paymentMethod === 'CASH' ? 'Tiền mặt' : paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Loại:</span>
                    <span className="font-semibold">{paymentType === 'DEPOSIT' ? 'Đặt cọc' : 'Thanh toán số dư'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ngày tạo:</span>
                    <span className="font-semibold">{formatDate(createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Bạn có chắc chắn muốn xác nhận đã nhận thanh toán tiền mặt cho payment này?
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCloseConfirmCashModal}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirmCash}
                  disabled={isConfirmingCash}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isConfirmingCash ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

    </DealerStaffLayout>
  );
};

export default PaymentManagementPage;


