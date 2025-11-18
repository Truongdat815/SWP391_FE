import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllContracts } from '../../api/contractService';
import { 
  createPayment,
  getPaymentById,
  getAllPayments,
  filterPaymentsByContract
} from '../../api/paymentService';
import { 
  CheckCircle, 
  Loader2,
  DollarSign,
  CreditCard,
  History,
  ChevronDown,
  ChevronUp,
  X,
  TrendingUp,
  FileText,
  Receipt,
  Calendar
} from 'lucide-react';

import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import { ModernCard, ModernCardHeader, ModernCardContent } from '../../components/ui/ModernCard';
import { ModernTable, ModernTableHead, ModernTableHeader, ModernTableBody, ModernTableRow, ModernTableCell } from '../../components/ui/ModernTable';
import ModernButton from '../../components/ui/ModernButton';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';

function PaymentManagement() {
  // Modern UI hooks
  const { toast, success, error: showError, hideToast } = useToast();
  const { confirm, showConfirm } = useConfirm();
  
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [contracts, setContracts] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    paymentType: 'DEPOSIT',
    paymentMethod: 'VNPAY'
  });
  const [expandedContracts, setExpandedContracts] = useState(new Set());
  const [paymentHistories, setPaymentHistories] = useState({});
  const [loadingHistories, setLoadingHistories] = useState(new Set());
  const [highlightedContractId, setHighlightedContractId] = useState(null);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);
  const [loadingPaymentDetail, setLoadingPaymentDetail] = useState(false);

  // Calculate paidAmount for a contract by summing completed payments
  const calculatePaidAmount = useCallback((contract, payments) => {
    if (!contract || !payments || payments.length === 0) {
      return 0;
    }
    
    const contractPayments = filterPaymentsByContract(
      payments, 
      contract.contractId, 
      contract.contractCode
    );
    
    // Sum only completed payments
    return contractPayments
      .filter(payment => payment.status === 'COMPLETED' || payment.status === 'SUCCESS' || payment.status === 'PAID')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
                }, []);
                
  // Calculate remaining amount
  const calculateRemainingAmount = useCallback((contract, payments) => {
    const total = contract.totalPayment || 0;
    const paid = calculatePaidAmount(contract, payments);
    return Math.max(0, total - paid);
  }, [calculatePaidAmount]);

  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllContracts();
      const contractsData = Array.isArray(response) ? response : (response?.data || []);
      setContracts(contractsData);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all payments
  const fetchAllPayments = useCallback(async () => {
    try {
        const response = await getAllPayments();
      const paymentsData = Array.isArray(response) ? response : (response?.data || []);
        setAllPayments(paymentsData);
      } catch (error) {
      console.error('Error fetching payments:', error);
      }
  }, []);

  // Handle payment callback
  const handlePaymentCallback = useCallback(async (paymentId, status, vnpResponseCode) => {
    try {
      setLoadingPaymentDetail(true);
      
      // If paymentId is provided, fetch payment details
      if (paymentId) {
        const paymentResponse = await getPaymentById(paymentId);
        const paymentData = paymentResponse?.data || paymentResponse;
        
        if (paymentData) {
          setSelectedPaymentDetail(paymentData);
          setShowPaymentDetailModal(true);
          
          // Refresh contracts and payments
          await fetchContracts();
          await fetchAllPayments();
          
          // Show success message if payment completed
          if (paymentData.status === 'COMPLETED' || paymentData.status === 'SUCCESS' || paymentData.status === 'PAID') {
            success('Thanh toán đã hoàn tất thành công!');
          }
        }
      } else if (vnpResponseCode === '00') {
        // VNPay success response
        success('Thanh toán đã hoàn tất thành công!');
        await fetchContracts();
        await fetchAllPayments();
      } else if (vnpResponseCode) {
        // VNPay error response
        await fetchContracts();
        await fetchAllPayments();
      }
    } catch (error) {
      console.error('Error handling payment callback:', error);
    } finally {
      setLoadingPaymentDetail(false);
    }
  }, [fetchContracts, fetchAllPayments, success]);

  // Fetch data on mount
  useEffect(() => {
    fetchContracts();
    fetchAllPayments();
  }, [fetchContracts, fetchAllPayments]);

  // Handle payment callback from VNPay
  useEffect(() => {
    const paymentId = searchParams.get('paymentId') || searchParams.get('vnp_TxnRef');
    const status = searchParams.get('status');
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    
    // Also check localStorage for pending payment ID
    const pendingPaymentId = localStorage.getItem('pendingPaymentId');
    
    if (paymentId || status || vnp_ResponseCode || pendingPaymentId) {
      // Handle VNPay callback
      const idToUse = paymentId || pendingPaymentId;
      handlePaymentCallback(idToUse, status, vnp_ResponseCode);
      
      // Clean up URL params and localStorage
      if (paymentId || status || vnp_ResponseCode) {
        setSearchParams({}, { replace: true });
      }
      if (pendingPaymentId) {
        localStorage.removeItem('pendingPaymentId');
      }
    }
  }, [searchParams, setSearchParams, handlePaymentCallback]);

  // Handle contractId from navigation state - auto open payment modal
  useEffect(() => {
    if (location.state?.contractId && !loading && contracts.length > 0) {
      const contractId = location.state.contractId;
      
      // Find the contract in all contracts
      const contract = contracts.find(c => c.contractId === contractId);
      
      if (contract) {
        // Set highlighted contract ID for visual indication
        setHighlightedContractId(contractId);
        
        // Auto-open payment modal for this contract
        setSelectedContract(contract);
        setShowPaymentModal(true);
        setPaymentForm({
          paymentType: 'DEPOSIT',
          paymentMethod: 'VNPAY'
        });
        
        // Scroll to the contract in the table if it exists (only if contract has signed file)
        setTimeout(() => {
          const element = document.getElementById(`contract-row-${contractId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
      
      // Clear the state after handling
      window.history.replaceState({}, document.title);
    }
  }, [location, contracts, loading]);

  // Filter contracts that have signed contract file uploaded and sort from newest to oldest
  const contractsWithSignedImage = (contracts || [])
    .filter(contract => contract.contractFileUrl)
    .sort((a, b) => {
      // Sort from newest to oldest by contractDate or createdAt
      const dateA = new Date(a.contractDate || a.createdAt || 0);
      const dateB = new Date(b.contractDate || b.createdAt || 0);
      return dateB - dateA; // Descending order (newest first)
    });


  // Calculate summary statistics
  const totalRevenue = contractsWithSignedImage.reduce(
    (sum, contract) => sum + calculatePaidAmount(contract, allPayments), 0
  );
  
  const pendingAmount = contractsWithSignedImage.reduce(
    (sum, contract) => sum + calculateRemainingAmount(contract, allPayments), 0
  );

  const handlePaymentClick = (contract) => {
    setSelectedContract(contract);
    setShowPaymentModal(true);
    setPaymentForm({
      paymentType: 'DEPOSIT',
      paymentMethod: 'VNPAY'
    });
  };

  const handleCreatePayment = async () => {
    if (!selectedContract) return;

    try {
      setProcessingPayment(selectedContract.contractId);
      
      const response = await createPayment(
        selectedContract.contractId,
        paymentForm.paymentType,
        paymentForm.paymentMethod
      );

      // If payment method is VNPAY, redirect to payment URL
      if (paymentForm.paymentMethod === 'VNPAY') {
        // Handle different response structures
        let paymentUrl = null;
        let paymentId = null;
        
        // Response could be: {paymentUrl: "...", paymentId: 1} or {data: {paymentUrl: "...", paymentId: 1}} or just the URL string
        if (typeof response === 'string') {
          paymentUrl = response;
        } else if (response?.paymentUrl) {
          paymentUrl = response.paymentUrl;
          paymentId = response.paymentId;
        } else if (response?.data?.paymentUrl) {
          paymentUrl = response.data.paymentUrl;
          paymentId = response.data.paymentId;
        } else if (response?.data && typeof response.data === 'string') {
          paymentUrl = response.data;
          paymentId = response.paymentId;
        }
        
        if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.startsWith('http')) {
          // Store paymentId in localStorage for callback handling
          if (paymentId) {
            localStorage.setItem('pendingPaymentId', paymentId.toString());
          }
          
          // Redirect to VNPay
          window.location.href = paymentUrl;
          return; // Don't close modal or show success yet - user will be redirected
        } else {
          console.error('Invalid payment URL response:', response);
        }
      } else if (paymentForm.paymentMethod === 'CASH') {
        // For cash payments, show success immediately
        success('Thanh toán tiền mặt đã được ghi nhận thành công!');
        
        // Refresh data
        setTimeout(async () => {
          await fetchContracts();
          await fetchAllPayments();
          
          // Show payment details if paymentId is available
          if (response?.paymentId || response?.data?.paymentId) {
            const paymentId = response?.paymentId || response?.data?.paymentId;
            try {
              const paymentResponse = await getPaymentById(paymentId);
              const paymentData = paymentResponse?.data || paymentResponse;
              if (paymentData) {
                setSelectedPaymentDetail(paymentData);
                setShowPaymentDetailModal(true);
              }
            } catch (error) {
              console.error('Error fetching payment details:', error);
            }
          }
        }, 500);
      } else {
        success('Tạo thanh toán thành công!');
        setTimeout(async () => {
          await fetchContracts();
          await fetchAllPayments();
        }, 500);
      }

      setShowPaymentModal(false);
      setSelectedContract(null);

    } catch (error) {
      console.error('Error creating payment:', error);
    } finally {
      setProcessingPayment(null);
    }
  };

  const togglePaymentHistory = async (contractId) => {
    const newExpanded = new Set(expandedContracts);
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId);
    } else {
      newExpanded.add(contractId);
      
      // Check if payment history is already loaded
      if (paymentHistories[contractId] && paymentHistories[contractId].length > 0) {
        setExpandedContracts(newExpanded);
        return;
      }
      
      // Fetch payment history by filtering allPayments
      setLoadingHistories(prev => new Set([...prev, contractId]));
      
      try {
        const contract = contracts?.find(c => c.contractId === contractId);
        if (contract && allPayments.length > 0) {
          const contractPayments = filterPaymentsByContract(
            allPayments, 
            contractId, 
            contract.contractCode
          );
        
        // Sort by createdAt (newest first)
          contractPayments.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        
        setPaymentHistories(prev => ({
          ...prev,
            [contractId]: contractPayments
          }));
        } else {
          setPaymentHistories(prev => ({
            ...prev,
            [contractId]: []
          }));
        }
      } catch (error) {
        console.error('Error fetching payment history:', error);
        setPaymentHistories(prev => ({
          ...prev,
          [contractId]: []
        }));
      } finally {
        setLoadingHistories(prev => {
          const next = new Set(prev);
          next.delete(contractId);
          return next;
        });
      }
    }
    setExpandedContracts(newExpanded);
  };

  // Get contract payment status for StatusBadge
  const getContractPaymentStatus = (contract) => {
    const remaining = calculateRemainingAmount(contract, allPayments);
    const paid = calculatePaidAmount(contract, allPayments);
    
    if (remaining <= 0) return 'COMPLETED';
    if (paid > 0) return 'PROCESSING';
    return 'PENDING';
  };

  const getPaymentTypeText = (type) => {
    switch (type) {
      case 'DEPOSIT': return 'Đặt cọc';
      case 'BALANCE': return 'Thanh toán số dư';
      default: return type;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'VNPAY': return 'VNPay';
      case 'CASH': return 'Tiền mặt';
      default: return method;
    }
  };

  return (
    <div className="max-w-7xl mx-auto -mt-4">
      {/* Toast Notifications */}
      <Toast 
        show={toast.show} 
        type={toast.type} 
        message={toast.message} 
        onClose={hideToast}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        show={confirm.show}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />

      {/* Header with Statistics */}
      <div className="mb-6 pt-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
        
         
        </motion.div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ModernCard hover gradient roleColor="emerald">
              <ModernCardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Số tiền đã nhận</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {totalRevenue.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <ModernCard hover gradient roleColor="yellow">
              <ModernCardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Số tiền còn lại</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {pendingAmount.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  
                </div>
              </ModernCardContent>
            </ModernCard>
          </motion.div>
        </div>
      </div>

      {/* Contracts Table */}
      <ModernCard>
        <ModernCardHeader
          title="Danh sách thanh toán theo hợp đồng"
          subtitle={`${contractsWithSignedImage.length} hợp đồng có chữ ký`}
          icon={<FileText className="w-5 h-5" />}
          roleColor="emerald"
        />
        <ModernCardContent>
          {loading ? (
            <div className="py-8">
              <div className="overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      {[...Array(6)].map((_, i) => (
                        <th key={i} className="px-3 py-2.5">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {[...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(6)].map((_, j) => (
                          <td key={j} className="px-3 py-2.5">
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : contractsWithSignedImage.length === 0 ? (
            <EmptyState
              title="Không có hợp đồng nào có chữ ký"
              description="Các hợp đồng đã upload chữ ký sẽ xuất hiện ở đây"
              icon="file"
            />
          ) : (
            <ModernTable className="w-full">
              <ModernTableHead>
                <tr>
                  <ModernTableHeader className="w-[16%]">Mã hợp đồng</ModernTableHeader>
                  <ModernTableHeader className="w-[16%]">Tổng thanh toán</ModernTableHeader>
                  <ModernTableHeader className="w-[16%]">Đã trả</ModernTableHeader>
                  <ModernTableHeader className="w-[16%]">Còn lại</ModernTableHeader>
                  <ModernTableHeader className="w-[16%]">Trạng thái</ModernTableHeader>
                  <ModernTableHeader className="w-[20%] pl-11">Thao tác</ModernTableHeader>
                </tr>
              </ModernTableHead>
              <ModernTableBody>
                <AnimatePresence>
                  {contractsWithSignedImage.map((contract, index) => {
                    const total = contract.totalPayment || 0;
                    const paid = calculatePaidAmount(contract, allPayments);
                    const remaining = calculateRemainingAmount(contract, allPayments);
                    const isExpanded = expandedContracts.has(contract.contractId);
                    const history = paymentHistories[contract.contractId] || [];
                    const isLoadingHistory = loadingHistories.has(contract.contractId);
                    const isHighlighted = highlightedContractId === contract.contractId;

                    return (
                      <React.Fragment key={contract.contractId}>
                        <motion.tr
                          id={`contract-row-${contract.contractId}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className={`group hover:bg-gradient-to-r hover:from-emerald-50/40 hover:to-teal-50/40 transition-all duration-150 ${
                            isHighlighted ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' : ''
                          }`}
                        >
                          <ModernTableCell className="whitespace-nowrap text-sm font-medium text-gray-900">
                            <Link 
                              to="/dealer-staff/contract-management" 
                              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                            >
                              <FileText className="w-4 h-4 text-emerald-500" />
                              {contract.contractCode || 'N/A'}
                            </Link>
                          </ModernTableCell>
                          <ModernTableCell className="whitespace-nowrap text-sm text-gray-900 font-medium">
                            {total.toLocaleString('vi-VN')} VNĐ
                          </ModernTableCell>
                          <ModernTableCell className="whitespace-nowrap text-sm text-gray-900">
                            {paid.toLocaleString('vi-VN')} VNĐ
                          </ModernTableCell>
                          <ModernTableCell className="whitespace-nowrap text-sm text-gray-900">
                            {remaining.toLocaleString('vi-VN')} VNĐ
                          </ModernTableCell>
                          <ModernTableCell className="whitespace-nowrap">
                            <StatusBadge 
                              status={getContractPaymentStatus(contract)} 
                              size="sm"
                            />
                          </ModernTableCell>
                          <ModernTableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <ModernButton
                                onClick={() => handlePaymentClick(contract)}
                                disabled={processingPayment === contract.contractId || remaining <= 0}
                                variant="primary"
                                size="sm"
                                loading={processingPayment === contract.contractId}
                                roleColor="emerald"
                                className="text-xs"
                              >
                                Thanh toán
                              </ModernButton>
                              <ModernButton
                                onClick={() => togglePaymentHistory(contract.contractId)}
                                variant="secondary"
                                size="sm"
                                icon={isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                className="text-xs"
                              >
                                {isExpanded ? 'Ẩn lịch sử' : 'Lịch sử'}
                              </ModernButton>
                            </div>
                          </ModernTableCell>
                        </motion.tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan="6" className="px-0 py-0 bg-white border-b border-gray-200">
                              <motion.div
                                initial={{ opacity: 0, maxHeight: 0 }}
                                animate={{ opacity: 1, maxHeight: 1000 }}
                                exit={{ opacity: 0, maxHeight: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden bg-gray-50"
                              >
                                <div className="px-4 py-4">
                                  {isLoadingHistory ? (
                                    <div className="flex items-center justify-center py-6">
                                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600 mr-2" />
                                      <span className="text-gray-600 text-xs">Đang tải lịch sử thanh toán...</span>
                                    </div>
                                  ) : history.length > 0 ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                        <History className="w-4 h-4 text-emerald-600" />
                                        <h4 className="text-sm font-semibold text-gray-900">
                                          Lịch sử thanh toán
                                        </h4>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-50">
                                            <tr>
                                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                                                Mã thanh toán
                                              </th>
                                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                                                Ngày thanh toán
                                              </th>
                                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                                                Loại thanh toán
                                              </th>
                                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                                                Phương thức
                                              </th>
                                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                                                Số tiền
                                              </th>
                                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                                                Còn lại
                                              </th>
                                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">
                                                Trạng thái
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-gray-100">
                                            {history.map((payment, idx) => {
                                              const paymentDate = payment.createdAt;
                                              const amount = payment.amount || 0;
                                              const remainPrice = payment.remainPrice !== undefined ? payment.remainPrice : null;
                                              const paymentCode = payment.paymentCode || `PAY-${payment.paymentId || idx + 1}`;
                                              const status = payment.status || 'DRAFT';
                                              
                                              return (
                                                <tr key={payment.paymentId || payment.paymentCode || idx} className="hover:bg-gray-50 transition-colors">
                                                  <td className="px-3 py-2 text-xs font-medium text-gray-900">
                                                    {paymentCode}
                                                  </td>
                                                  <td className="px-3 py-2 text-xs text-gray-900">
                                                    <div className="flex items-center gap-1">
                                                      <Calendar className="w-3 h-3 text-gray-400" />
                                                      {paymentDate 
                                                        ? new Date(paymentDate).toLocaleString('vi-VN', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                          })
                                                        : 'N/A'}
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-2 text-xs text-gray-900">
                                                    {getPaymentTypeText(payment.paymentType)}
                                                  </td>
                                                  <td className="px-3 py-2 text-xs text-gray-900">
                                                    {getPaymentMethodText(payment.paymentMethod)}
                                                  </td>
                                                  <td className="px-3 py-2 text-xs text-gray-900 font-medium">
                                                    {amount.toLocaleString('vi-VN')} VNĐ
                                                  </td>
                                                  <td className="px-3 py-2 text-xs text-gray-900">
                                                    {remainPrice !== null 
                                                      ? `${remainPrice.toLocaleString('vi-VN')} VNĐ`
                                                      : '-'}
                                                  </td>
                                                  <td className="px-3 py-2 text-xs">
                                                    <StatusBadge status={status} size="sm" />
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center py-6 text-gray-500 text-xs">
                                      <History className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                      Chưa có lịch sử thanh toán
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </AnimatePresence>
              </ModernTableBody>
            </ModernTable>
          )}
        </ModernCardContent>
      </ModernCard>

      {/* Payment Detail Modal - Show after payment completion */}
      <AnimatePresence>
      {showPaymentDetailModal && selectedPaymentDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPaymentDetailModal(false);
                setSelectedPaymentDetail(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Thông tin thanh toán</h3>
                    <p className="text-sm text-gray-600 mt-0.5">Chi tiết giao dịch thanh toán</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentDetailModal(false);
                    setSelectedPaymentDetail(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
            {loadingPaymentDetail ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                <span className="text-gray-600 text-sm">Đang tải thông tin thanh toán...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Payment Status Badge */}
                      <ModernCard hover={false} className="bg-gradient-to-r from-emerald-50 to-teal-50">
                        <ModernCardContent>
                          <div className="flex items-center justify-between">
                  <div>
                              <p className="text-xs text-gray-600 mb-1">Trạng thái</p>
                              <StatusBadge 
                                status={selectedPaymentDetail.status} 
                                size="md"
                              />
                  </div>
                  <div className="text-right">
                              <p className="text-xs text-gray-600 mb-1">Số tiền</p>
                              <p className="text-2xl font-bold text-emerald-600">
                      {(selectedPaymentDetail.amount || 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>
                        </ModernCardContent>
                      </ModernCard>

                {/* Payment Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ModernCard hover={false}>
                          <ModernCardContent>
                            <p className="text-xs text-gray-500 mb-1">Mã thanh toán</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPaymentDetail.paymentCode || `PAY-${selectedPaymentDetail.paymentId || 'N/A'}`}
                    </p>
                          </ModernCardContent>
                        </ModernCard>

                        <ModernCard hover={false}>
                          <ModernCardContent>
                            <p className="text-xs text-gray-500 mb-1">Mã hợp đồng</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPaymentDetail.contractCode || 'N/A'}
                    </p>
                          </ModernCardContent>
                        </ModernCard>

                        <ModernCard hover={false}>
                          <ModernCardContent>
                            <p className="text-xs text-gray-500 mb-1">Loại thanh toán</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getPaymentTypeText(selectedPaymentDetail.paymentType)}
                    </p>
                          </ModernCardContent>
                        </ModernCard>

                        <ModernCard hover={false}>
                          <ModernCardContent>
                            <p className="text-xs text-gray-500 mb-1">Phương thức thanh toán</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getPaymentMethodText(selectedPaymentDetail.paymentMethod)}
                    </p>
                          </ModernCardContent>
                        </ModernCard>

                        <ModernCard hover={false}>
                          <ModernCardContent>
                            <p className="text-xs text-gray-500 mb-1">Số tiền còn lại</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPaymentDetail.remainPrice !== undefined && selectedPaymentDetail.remainPrice !== null
                        ? `${selectedPaymentDetail.remainPrice.toLocaleString('vi-VN')} VNĐ`
                        : '-'}
                    </p>
                          </ModernCardContent>
                        </ModernCard>

                        <ModernCard hover={false}>
                          <ModernCardContent>
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Thời gian tạo
                            </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPaymentDetail.createdAt
                        ? new Date(selectedPaymentDetail.createdAt).toLocaleString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })
                        : 'N/A'}
                    </p>
                          </ModernCardContent>
                        </ModernCard>
                      </div>
                    </div>
                  )}
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <ModernButton
                  onClick={() => {
                    setShowPaymentDetailModal(false);
                    setSelectedPaymentDetail(null);
                  }}
                  variant="primary"
                  size="md"
                  roleColor="emerald"
                >
                  Đóng
                </ModernButton>
              </div>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedContract && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowPaymentModal(false);
                setSelectedContract(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Tạo thanh toán</h3>
                    <p className="text-sm text-gray-600 mt-0.5">Nhập thông tin thanh toán cho hợp đồng</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedContract(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Content */}
              <div className="px-6 py-4 overflow-y-auto flex-1">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <ModernCard hover={false} className="bg-gray-50">
                        <ModernCardContent>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Mã hợp đồng</label>
                          <p className="text-sm text-gray-900 font-semibold">
                            {selectedContract.contractCode || 'N/A'}
                          </p>
                        </ModernCardContent>
                      </ModernCard>

                      <ModernCard hover={false} className="bg-blue-50">
                        <ModernCardContent>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Mã đơn hàng</label>
                          <p className="text-sm text-blue-600 font-semibold">
                            {selectedContract.orderCode || 'N/A'}
                          </p>
                        </ModernCardContent>
                      </ModernCard>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <ModernCard hover={false} className="bg-gray-50">
                        <ModernCardContent>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Tổng thanh toán</label>
                          <p className="text-sm text-gray-900 font-semibold">
                            {(selectedContract.totalPayment || 0).toLocaleString('vi-VN')} VNĐ
                          </p>
                        </ModernCardContent>
                      </ModernCard>

                      <ModernCard hover={false} className="bg-green-50">
                        <ModernCardContent>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Đã trả</label>
                          <p className="text-sm text-green-600 font-semibold">
                            {calculatePaidAmount(selectedContract, allPayments).toLocaleString('vi-VN')} VNĐ
                          </p>
                        </ModernCardContent>
                      </ModernCard>

                      <ModernCard hover={false} className="bg-yellow-50">
                        <ModernCardContent>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Còn lại</label>
                          <p className="text-sm text-yellow-600 font-semibold">
                            {calculateRemainingAmount(selectedContract, allPayments).toLocaleString('vi-VN')} VNĐ
                          </p>
                        </ModernCardContent>
                      </ModernCard>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Loại thanh toán *</label>
                      <select
                        value={paymentForm.paymentType}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentType: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors"
                      >
                        <option value="DEPOSIT">Đặt cọc</option>
                        <option value="BALANCE">Thanh toán số dư</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Phương thức thanh toán *</label>
                      <select
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors"
                      >
                        <option value="VNPAY">VNPay</option>
                        <option value="CASH">Tiền mặt</option>
                      </select>
                    </div>
                  </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                <ModernButton
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedContract(null);
                  }}
                  variant="secondary"
                  size="md"
                >
                  Hủy
                </ModernButton>
                <ModernButton
                  onClick={handleCreatePayment}
                  disabled={processingPayment === selectedContract.contractId}
                  variant="primary"
                  size="md"
                  loading={processingPayment === selectedContract.contractId}
                  roleColor="emerald"
                >
                  Xác nhận
                </ModernButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PaymentManagement;
