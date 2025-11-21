import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, Calendar, RefreshCw, CreditCard, Banknote, CheckCircle, AlertCircle, MoreVertical, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import LoadingSkeleton from '../../../components/shared/LoadingSkeleton';
import Stepper from '../../../components/ui/Stepper';
import { useGetAllPaymentsQuery, useGetPaymentByIdQuery, useCreatePaymentMutation } from '../../../api/dealerStaff/paymentApi';
import { useGetAllContractsQuery, useGetContractDetailQuery } from '../../../api/dealerStaff/contractApi';
import { formatCurrency, formatDate, getPaymentStatusConfig, getPaymentTypeLabel, getPaymentMethodLabel, getContractStatusConfig, getEffectiveContractStatus, getEffectiveRemainingAmount, isPaymentRequired } from '../../../utils/formatters';

const PAYMENT_STEPS = [
  { id: 'contract', label: 'Chọn hợp đồng' },
  { id: 'type', label: 'Loại thanh toán' },
  { id: 'method', label: 'Phương thức' },
];

const PaymentManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Payment history modal state
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [selectedContractForHistory, setSelectedContractForHistory] = useState(null);
  
  // Create Payment Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedContract, setSelectedContract] = useState(null);
  const [paymentType, setPaymentType] = useState('DEPOSIT'); // Mặc định là DEPOSIT
  const [paymentMethod, setPaymentMethod] = useState('VNPAY'); // Mặc định là VNPAY
  
  // View Payment Detail Dropdown
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const { data: paymentsData, isLoading, error, refetch: refetchPayments } = useGetAllPaymentsQuery();
  const { data: contractsData, refetch: refetchContracts } = useGetAllContractsQuery();
  const [createPayment, { isLoading: creatingPayment }] = useCreatePaymentMutation();

  // Get contract detail when contractId is provided
  const contractIdFromRoute = location.state?.contractId;
  const { data: contractDetailData, isLoading: isLoadingContractDetail } = useGetContractDetailQuery(contractIdFromRoute, {
    skip: !contractIdFromRoute,
  });

  const payments = Array.isArray(paymentsData?.data) ? paymentsData.data : [];
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

  // Filter contracts that can create payment (only SIGNED status and payment required)
  const availableContracts = useMemo(() => {
    return contracts.filter(contract => 
      contract.status === 'SIGNED' && 
      isPaymentRequired(contract.totalPayment) &&
      getEffectiveRemainingAmount(contract) > 0
    );
  }, [contracts]);

  // Filter contracts for display (need payment)
  const contractsNeedPayment = useMemo(() => {
    console.log('All contracts:', contracts.map(c => ({ 
      id: c.contractId, 
      status: c.status, 
      remainingAmount: c.remainingAmountToPay,
      totalPayment: c.totalPayment,
      effectiveStatus: getEffectiveContractStatus(c),
      effectiveRemaining: getEffectiveRemainingAmount(c)
    })));
    
    // Show all contracts but with effective status and remaining amounts
    const filtered = contracts;
    
    console.log('Filtered contracts for payment:', filtered.map(c => ({ 
      id: c.contractId, 
      status: c.status, 
      remainingAmount: c.remainingAmountToPay,
      effectiveStatus: getEffectiveContractStatus(c),
      effectiveRemaining: getEffectiveRemainingAmount(c)
    })));
    
    // Sort contracts by date (newest first) - create a copy first
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.contractDate || a.createdAt || 0);
      const dateB = new Date(b.contractDate || b.createdAt || 0);
      return dateB - dateA; // Descending order (newest first)
    });
  }, [contracts]);

  // Filter contracts based on search and status
  const filteredContracts = useMemo(() => {
    if (!Array.isArray(contractsNeedPayment)) return [];
    return contractsNeedPayment.filter((contract) => {
      const matchesSearch =
        contract.contractId?.toString().includes(searchTerm) ||
        contract.contractCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.orderId?.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contractsNeedPayment, searchTerm, statusFilter]);

  // Check if contract from route state
  useEffect(() => {
    if (contractIdFromRoute && contractDetailData && !isLoadingContractDetail) {
      const contractDetail = contractDetailData?.data || contractDetailData;
      
      // Check if payment is required
      if (!isPaymentRequired(contractDetail?.totalPayment)) {
        toast.error('Hợp đồng có tổng giá trị <= 5₫ không cần thanh toán');
        window.history.replaceState({}, document.title);
        return;
      }
      
      // Check if contract is SIGNED
      if (contractDetail?.status === 'SIGNED') {
        setSelectedContract(contractDetail);
        setIsCreateModalOpen(true);
        // Set default payment type based on whether deposit has been paid
        // If remainingAmountToPay equals totalPayment, no deposit has been paid yet
        if (contractDetail.remainingAmountToPay === contractDetail.totalPayment) {
          setPaymentType('DEPOSIT');
        } else {
          setPaymentType('BALANCE');
        }
        setPaymentMethod('VNPAY');
      } else {
        toast.error('Chỉ có thể tạo thanh toán khi hợp đồng đã được ký');
      }
      // Clear state
      window.history.replaceState({}, document.title);
    }
  }, [contractIdFromRoute, contractDetailData, isLoadingContractDetail]);

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
  const handleOpenPaymentHistory = (contract) => {
    setSelectedContractForHistory(contract);
    setIsPaymentHistoryModalOpen(true);
  };

  const handleClosePaymentHistory = () => {
    setIsPaymentHistoryModalOpen(false);
    setSelectedContractForHistory(null);
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
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);


  // Pagination for contracts only
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  // Debug logging after all variables are defined
  console.log('PaymentManagementPage Final Debug:', {
    contractsNeedPayment: contractsNeedPayment?.length || 0,
    filteredContracts: filteredContracts?.length || 0,
    paginatedContracts: paginatedContracts?.length || 0,
    totalPages,
    currentPage
  });

  const getStatusBadge = (status, isContract = false, contract = null) => {
    let effectiveStatus = status;
    if (isContract && contract) {
      effectiveStatus = getEffectiveContractStatus(contract);
    }
    const config = isContract ? getContractStatusConfig(effectiveStatus) : getPaymentStatusConfig(status);
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
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

  if (isLoading) {
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
    <DealerStaffLayout>
      <div className="mx-auto max-w-[90rem] px-0 py-4 pl-10 pr-10 pt-8 space-y-4">
          {/* PageHeading */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex min-w-72 flex-col gap-2">
              <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">
                Quản lý Thanh toán
              </h1>
              <p className="text-slate-500 text-base font-normal leading-normal">
                Xem, tạo và quản lý các giao dịch thanh toán
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Tạo Thanh toán</span>
            </Button>
          </div>

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
                <option value="SIGNED">Đã ký</option>
                <option value="DEPOSIT_PAID">Đã đặt cọc</option>
                <option value="FULLY_PAID">Đã thanh toán đủ</option>
              </select>
                <button className="flex items-center gap-2 h-10 px-4 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                  <RefreshCw size={16} />
                  <span className="text-sm font-medium">Làm mới</span>
                </button>
              </div>
            </div>
          </div>


          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white ">
            {paginatedContracts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Không tìm thấy hợp đồng' 
                  : 'Chưa có hợp đồng nào'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Mã Hợp đồng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Ngày hợp đồng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Khách hàng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Tổng giá trị
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Đặt cọc
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                        Còn lại thanh toán
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
                    {paginatedContracts.flatMap((contract) => {
                      // Get payments for this contract
                      const contractPayments = payments.filter(payment => 
                        payment.contractCode === contract.contractCode
                      );
                      
                      const contractRow = (
                        <motion.tr
                          key={contract.contractId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {contract.contractCode}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                            {formatDate(contract.contractDate)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                            {contract.customerName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                            {formatCurrency(contract.totalPayment)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                            {formatCurrency(contract.depositPrice)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-orange-600">
                            {formatCurrency(getEffectiveRemainingAmount(contract))}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {getStatusBadge(contract.status, true, contract)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setIsCreateModalOpen(true);
                                  setPaymentStep(2); // Skip step 1 since contract is already selected
                                  // Set payment type based on contract status
                                  if (contract.status === 'SIGNED' && (contract.remainingAmountToPay === contract.totalPayment)) {
                                    setPaymentType('DEPOSIT');
                                  } else {
                                    setPaymentType('BALANCE');
                                  }
                                  setPaymentMethod('VNPAY'); // Set default payment method
                                }}
                                size="sm"
                                disabled={getEffectiveRemainingAmount(contract) === 0 || !isPaymentRequired(contract.totalPayment)}
                                className="bg-primary hover:bg-primary/90 text-white disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                                title={
                                  !isPaymentRequired(contract.totalPayment) 
                                    ? 'Hợp đồng có tổng giá trị <= 5₫ không cần thanh toán' 
                                    : getEffectiveRemainingAmount(contract) === 0 
                                    ? 'Hợp đồng đã thanh toán đủ' 
                                    : ''
                                }
                              >
                                Tạo thanh toán
                              </Button>
                              
                              {/* Payment History Button */}
                              {contractPayments.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPaymentHistory(contract);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium"
                                >
                                  <span>Lịch sử ({contractPayments.length})</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );

                      return contractRow;
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
                <span className="font-medium">{Math.min(endIndex, filteredContracts.length)}</span> của{' '}
                <span className="font-medium">{filteredContracts.length}</span> kết quả
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
          {/* If contract is selected from route, show payment form directly */}
          {contractIdFromRoute && isLoadingContractDetail ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-600">Đang tải thông tin hợp đồng...</p>
              </div>
            </div>
          ) : contractIdFromRoute && selectedContract ? (
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
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      paymentType === 'DEPOSIT'
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
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      paymentType === 'BALANCE'
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
                  {creatingPayment ? 'Đang xử lý...' : 'Chuyển đến VNPay'}
                </Button>
              </div>
            </div>
          ) : selectedContract && !contractIdFromRoute ? (
            // Direct payment form when contract selected from table
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
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      paymentType === 'DEPOSIT'
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
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      paymentType === 'BALANCE'
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
                  {creatingPayment ? 'Đang xử lý...' : 'Chuyển đến VNPay'}
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
                
                {availableContracts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Không có hợp đồng nào cần thanh toán
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableContracts.map((contract) => (
                      <motion.div
                        key={contract.contractId}
                        onClick={() => setSelectedContract(contract)}
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedContract?.contractId === contract.contractId
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-900 ">
                              Hợp đồng HD-{contract.contractId}
                            </p>
                            <p className="text-sm text-slate-600 ">
                              {contract.customerName} • Đơn hàng #{contract.orderId}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              Ngày tạo: {formatDate(contract.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary text-lg">
                              {formatCurrency(contract.totalValue || contract.totalAmount)}
                            </p>
                            {getStatusBadge(contract.status)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
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
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentType === 'DEPOSIT'
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
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentType === 'BALANCE'
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
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'VNPAY'
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
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === 'CASH'
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
        title={`Lịch sử thanh toán - ${selectedContractForHistory?.contractCode || ''}`}
        className="w-[1200px] max-w-[95vw] h-[700px] max-h-[90vh]"
      >
        {selectedContractForHistory && (
          <div className="space-y-4 h-full overflow-y-auto">
            {/* Contract Info Header */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Mã hợp đồng</p>
                  <p className="font-semibold text-slate-900">{selectedContractForHistory.contractCode}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Khách hàng</p>
                  <p className="font-semibold text-slate-900">{selectedContractForHistory.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Tổng giá trị hợp đồng</p>
                  <p className="font-semibold text-slate-900">{formatCurrency(selectedContractForHistory.totalPayment)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Còn lại thanh toán</p>
                  <p className="font-semibold text-orange-600">{formatCurrency(getEffectiveRemainingAmount(selectedContractForHistory))}</p>
                </div>
              </div>
            </div>

            {/* Payment History Table */}
            <div className="overflow-auto rounded-lg border border-slate-200 max-h-96">
              {(() => {
                const contractPayments = payments.filter(payment => 
                  payment.contractCode === selectedContractForHistory.contractCode
                );

                if (contractPayments.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500">
                      Chưa có lịch sử thanh toán nào
                    </div>
                  );
                }

                return (
                  <table className="min-w-full table-fixed">
                    <colgroup>
                      <col className="w-[15%]" />
                      <col className="w-[15%]" />
                      <col className="w-[12%]" />
                      <col className="w-[12%]" />
                      <col className="w-[15%]" />
                      <col className="w-[16%]" />
                      <col className="w-[15%]" />
                    </colgroup>
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 truncate">
                          Mã thanh toán
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 truncate">
                          Ngày thanh toán
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 truncate">
                          Loại thanh toán
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 truncate">
                          Phương thức
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 truncate">
                          Số tiền
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 truncate">
                          Còn lại
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 truncate">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {contractPayments.map((payment) => (
                        <tr key={payment.paymentId} className="hover:bg-slate-50">
                          <td className="px-3 py-3 text-sm font-medium text-slate-900 truncate">
                            {payment.paymentCode}
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                              <span className="truncate">{formatDate(payment.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              payment.paymentType === 'DEPOSIT' 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {payment.paymentType === 'DEPOSIT' ? 'Đặt cọc' : 'Số dư'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              {payment.paymentMethod === 'VNPAY' ? (
                                <CreditCard size={12} className="text-blue-600 flex-shrink-0" />
                              ) : (
                                <Banknote size={12} className="text-green-600 flex-shrink-0" />
                              )}
                              <span className="font-medium text-slate-700 truncate">
                                {payment.paymentMethod}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm font-semibold text-green-600 truncate">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-3 py-3 text-sm font-semibold text-orange-600 truncate">
                            {formatCurrency(payment.remainPrice)}
                          </td>
                          <td className="px-3 py-3 text-sm">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'SUCCESS'
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-800'
                                : payment.status === 'FAILED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status === 'COMPLETED' ? 'Hoàn thành' : 
                               payment.status === 'SUCCESS' ? 'Thành công' :
                               payment.status === 'PENDING' ? 'Chờ xử lý' : 
                               payment.status === 'FAILED' ? 'Thất bại' :
                               payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>

          </div>
        )}
      </Modal>

    </DealerStaffLayout>
  );
};

export default PaymentManagementPage;


