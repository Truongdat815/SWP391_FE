import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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
  X
} from 'lucide-react';

import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

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
      showError('Không thể tải danh sách hợp đồng: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Fetch all payments
  const fetchAllPayments = useCallback(async () => {
    try {
        const response = await getAllPayments();
      const paymentsData = Array.isArray(response) ? response : (response?.data || []);
        setAllPayments(paymentsData);
      } catch (error) {
      console.error('Error fetching payments:', error);
        showError('Không thể tải danh sách thanh toán: ' + (error.message || error));
      }
  }, [showError]);

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
          } else if (paymentData.status === 'FAILED' || paymentData.status === 'CANCELLED') {
            showError('Thanh toán đã bị hủy hoặc thất bại.');
          }
        }
      } else if (vnpResponseCode === '00') {
        // VNPay success response
        success('Thanh toán đã hoàn tất thành công!');
        await fetchContracts();
        await fetchAllPayments();
      } else if (vnpResponseCode) {
        // VNPay error response
        showError('Thanh toán đã bị hủy hoặc thất bại.');
        await fetchContracts();
        await fetchAllPayments();
      }
    } catch (error) {
      console.error('Error handling payment callback:', error);
      showError('Không thể xử lý kết quả thanh toán: ' + (error.message || error));
    } finally {
      setLoadingPaymentDetail(false);
    }
  }, [fetchContracts, fetchAllPayments, success, showError]);

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

  // Handle contractId from navigation state
  useEffect(() => {
    if (location.state?.contractId) {
      const contractId = location.state.contractId;
      setHighlightedContractId(contractId);
      
      // Scroll to the contract after a short delay
      setTimeout(() => {
        const element = document.getElementById(`contract-row-${contractId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Filter contracts that have signed contract file uploaded
  const contractsWithSignedImage = (contracts || []).filter(
    contract => contract.contractFileUrl
  );

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
          showError('Không thể lấy URL thanh toán VNPay. Vui lòng thử lại.');
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
      showError('Không thể tạo thanh toán: ' + (error.message || error));
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

  const getStatusColor = (contract) => {
    const remaining = calculateRemainingAmount(contract, allPayments);
    const paid = calculatePaidAmount(contract, allPayments);
    
    if (remaining <= 0) return 'bg-green-100 text-green-800';
    if (paid > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (contract) => {
    const remaining = calculateRemainingAmount(contract, allPayments);
    const paid = calculatePaidAmount(contract, allPayments);
    
    if (remaining <= 0) return 'Hoàn thành';
    if (paid > 0) return 'Thanh toán một phần';
    return 'Chưa thanh toán';
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
    <div className="max-w-7xl mx-auto">
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

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-3 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <DollarSign className="h-6 w-6 text-emerald-600 mr-2" />
              Quản Lý Thanh Toán
            </h1>
            <p className="text-gray-600 mt-0.5 text-sm">
              Thanh toán cho các hợp đồng đã có chữ ký
            </p>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-0.5">Tổng doanh thu</p>
            <p className="text-xl font-bold text-emerald-600">
              {totalRevenue.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-0.5">Số tiền còn lại</p>
            <p className="text-xl font-bold text-yellow-600">
              {pendingAmount.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
            <span className="text-gray-600 text-sm">Đang tải hợp đồng...</span>
          </div>
        ) : contractsWithSignedImage.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-base">Không có hợp đồng nào có chữ ký</p>
            <p className="text-gray-400 text-xs mt-1.5">Các hợp đồng đã upload chữ ký sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mã hợp đồng
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tổng thanh toán
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Đã trả
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Còn lại
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contractsWithSignedImage.map((contract) => {
                  const total = contract.totalPayment || 0;
                  const paid = calculatePaidAmount(contract, allPayments);
                  const remaining = calculateRemainingAmount(contract, allPayments);
                  const isExpanded = expandedContracts.has(contract.contractId);
                  const history = paymentHistories[contract.contractId] || [];
                  const isLoadingHistory = loadingHistories.has(contract.contractId);

                  return (
                    <React.Fragment key={contract.contractId}>
                      <tr 
                        id={`contract-row-${contract.contractId}`}
                        className={`hover:bg-gray-50 transition-colors ${
                          highlightedContractId === contract.contractId 
                            ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' 
                            : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
                            {contract.contractCode || 'N/A'}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span className="font-medium text-blue-600">
                              {contract.orderCode || 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {total.toLocaleString('vi-VN')} VNĐ
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900">
                          {paid.toLocaleString('vi-VN')} VNĐ
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900">
                          {remaining.toLocaleString('vi-VN')} VNĐ
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${getStatusColor(contract)}`}>
                            {getStatusText(contract)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePaymentClick(contract)}
                              disabled={processingPayment === contract.contractId || remaining <= 0}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            >
                              {processingPayment === contract.contractId ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin inline mr-1.5" />
                                  Đang xử lý...
                                </>
                              ) : (
                                'Thanh toán'
                              )}
                            </button>
                            <button
                              onClick={() => togglePaymentHistory(contract.contractId)}
                              className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs flex items-center"
                            >
                              <History className="h-3 w-3 mr-1.5" />
                              {isExpanded ? 'Ẩn lịch sử' : 'Lịch sử'}
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3 ml-1.5" />
                              ) : (
                                <ChevronDown className="h-3 w-3 ml-1.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" className="px-3 py-2.5 bg-gray-50">
                            {isLoadingHistory ? (
                              <div className="flex items-center justify-center py-3">
                                <Loader2 className="h-4 w-4 animate-spin text-emerald-600 mr-2" />
                                <span className="text-gray-600 text-xs">Đang tải lịch sử thanh toán...</span>
                              </div>
                            ) : history.length > 0 ? (
                              <div className="bg-white rounded-lg border border-gray-200 p-3">
                                <h4 className="text-xs font-semibold text-gray-900 mb-2 flex items-center">
                                  <History className="h-3 w-3 mr-1.5" />
                                  Lịch sử thanh toán
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">
                                          Mã thanh toán
                                        </th>
                                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">
                                          Ngày thanh toán
                                        </th>
                                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">
                                          Loại thanh toán
                                        </th>
                                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">
                                          Phương thức
                                        </th>
                                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">
                                          Số tiền
                                        </th>
                                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">
                                          Còn lại
                                        </th>
                                        <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-700 uppercase">
                                          Trạng thái
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {history.map((payment, idx) => {
                                        const paymentDate = payment.createdAt;
                                        const amount = payment.amount || 0;
                                        const remainPrice = payment.remainPrice !== undefined ? payment.remainPrice : null;
                                        const paymentCode = payment.paymentCode || `PAY-${payment.paymentId || idx + 1}`;
                                        const status = payment.status || 'DRAFT';
                                        
                                        return (
                                          <tr key={payment.paymentId || payment.paymentCode || idx} className="hover:bg-gray-50">
                                            <td className="px-2 py-1.5 text-xs font-medium text-gray-900">
                                              {paymentCode}
                                            </td>
                                            <td className="px-2 py-1.5 text-xs text-gray-900">
                                              {paymentDate 
                                                ? new Date(paymentDate).toLocaleString('vi-VN', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                  })
                                                : 'N/A'}
                                            </td>
                                            <td className="px-2 py-1.5 text-xs text-gray-900">
                                              {getPaymentTypeText(payment.paymentType)}
                                            </td>
                                            <td className="px-2 py-1.5 text-xs text-gray-900">
                                              {getPaymentMethodText(payment.paymentMethod)}
                                            </td>
                                            <td className="px-2 py-1.5 text-xs text-gray-900 font-medium">
                                              {amount.toLocaleString('vi-VN')} VNĐ
                                            </td>
                                            <td className="px-2 py-1.5 text-xs text-gray-900">
                                              {remainPrice !== null 
                                                ? `${remainPrice.toLocaleString('vi-VN')} VNĐ`
                                                : '-'}
                                            </td>
                                            <td className="px-2 py-1.5 text-xs">
                                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-md ${
                                                status === 'COMPLETED' || status === 'SUCCESS' || status === 'PAID'
                                                  ? 'bg-green-100 text-green-800'
                                                  : status === 'PENDING' || status === 'PROCESSING'
                                                  ? 'bg-yellow-100 text-yellow-800'
                                                  : status === 'DRAFT'
                                                  ? 'bg-gray-100 text-gray-800'
                                                  : status === 'FAILED' || status === 'CANCELLED'
                                                  ? 'bg-red-100 text-red-800'
                                                  : 'bg-gray-100 text-gray-800'
                                              }`}>
                                                {status === 'COMPLETED' || status === 'SUCCESS' || status === 'PAID'
                                                  ? 'Hoàn thành'
                                                  : status === 'PENDING' || status === 'PROCESSING'
                                                  ? 'Đang xử lý'
                                                  : status === 'DRAFT'
                                                  ? 'Nháp'
                                                  : status === 'FAILED'
                                                  ? 'Thất bại'
                                                  : status === 'CANCELLED'
                                                  ? 'Đã hủy'
                                                  : status || 'N/A'}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-3 text-gray-500 text-xs">
                                Chưa có lịch sử thanh toán
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Detail Modal - Show after payment completion */}
      {showPaymentDetailModal && selectedPaymentDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Thông tin thanh toán
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Chi tiết giao dịch thanh toán
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentDetailModal(false);
                  setSelectedPaymentDetail(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingPaymentDetail ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                <span className="text-gray-600 text-sm">Đang tải thông tin thanh toán...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Payment Status Badge */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Trạng thái</p>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${
                      selectedPaymentDetail.status === 'COMPLETED' || selectedPaymentDetail.status === 'SUCCESS' || selectedPaymentDetail.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : selectedPaymentDetail.status === 'PENDING' || selectedPaymentDetail.status === 'PROCESSING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedPaymentDetail.status === 'DRAFT'
                        ? 'bg-gray-100 text-gray-800'
                        : selectedPaymentDetail.status === 'FAILED'
                        ? 'bg-red-100 text-red-800'
                        : selectedPaymentDetail.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedPaymentDetail.status === 'COMPLETED' || selectedPaymentDetail.status === 'SUCCESS' || selectedPaymentDetail.status === 'PAID'
                        ? 'Hoàn thành'
                        : selectedPaymentDetail.status === 'PENDING' || selectedPaymentDetail.status === 'PROCESSING'
                        ? 'Đang xử lý'
                        : selectedPaymentDetail.status === 'DRAFT'
                        ? 'Nháp'
                        : selectedPaymentDetail.status === 'FAILED'
                        ? 'Thất bại'
                        : selectedPaymentDetail.status === 'CANCELLED'
                        ? 'Đã hủy'
                        : selectedPaymentDetail.status || 'N/A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Số tiền</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {(selectedPaymentDetail.amount || 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>

                {/* Payment Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Mã thanh toán</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPaymentDetail.paymentCode || `PAY-${selectedPaymentDetail.paymentId || 'N/A'}`}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Mã hợp đồng</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPaymentDetail.contractCode || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Loại thanh toán</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getPaymentTypeText(selectedPaymentDetail.paymentType)}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Phương thức thanh toán</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getPaymentMethodText(selectedPaymentDetail.paymentMethod)}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Số tiền còn lại</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedPaymentDetail.remainPrice !== undefined && selectedPaymentDetail.remainPrice !== null
                        ? `${selectedPaymentDetail.remainPrice.toLocaleString('vi-VN')} VNĐ`
                        : '-'}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">Thời gian tạo</p>
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
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowPaymentDetailModal(false);
                  setSelectedPaymentDetail(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900">Tạo thanh toán</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedContract(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Mã hợp đồng</label>
                <p className="text-xs text-gray-600 font-medium">
                  {selectedContract.contractCode || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Mã đơn hàng</label>
                <p className="text-xs text-blue-600 font-medium">
                  {selectedContract.orderCode || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Tổng thanh toán</label>
                <p className="text-xs text-gray-600 font-medium">
                  {(selectedContract.totalPayment || 0).toLocaleString('vi-VN')} VNĐ
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Đã trả</label>
                <p className="text-xs text-gray-600">
                  {calculatePaidAmount(selectedContract, allPayments).toLocaleString('vi-VN')} VNĐ
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Còn lại</label>
                <p className="text-xs text-gray-600 font-medium">
                  {calculateRemainingAmount(selectedContract, allPayments).toLocaleString('vi-VN')} VNĐ
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Loại thanh toán *</label>
                <select
                  value={paymentForm.paymentType}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentType: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="DEPOSIT">Đặt cọc</option>
                  <option value="BALANCE">Thanh toán số dư</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Phương thức thanh toán *</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="VNPAY">VNPay</option>
                  <option value="CASH">Tiền mặt</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedContract(null);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreatePayment}
                  disabled={processingPayment === selectedContract.contractId}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                >
                  {processingPayment === selectedContract.contractId ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentManagement;
