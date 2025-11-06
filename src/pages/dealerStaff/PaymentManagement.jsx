import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  fetchAllContractsThunk 
} from '../../store/slices/contractSlice';
import { 
  createPayment,
  getPaymentHistoryByContract 
} from '../../api/paymentService';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  DollarSign,
  CreditCard,
  History,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

function PaymentManagement() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { contracts, loading } = useSelector((state) => state.contracts);
  
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
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
  const [pendingPaymentContracts, setPendingPaymentContracts] = useState(new Set());
  const [pollingIntervals, setPollingIntervals] = useState(new Map());

  // Fetch contracts on mount
  useEffect(() => {
    dispatch(fetchAllContractsThunk());
  }, [dispatch]);

  // Check for payment completion and update UI
  useEffect(() => {
    if (!contracts || contracts.length === 0) return;

    // Check each pending payment contract to see if payment was completed
    pendingPaymentContracts.forEach(contractId => {
      const contract = contracts.find(c => c.contractId === contractId);
      if (contract) {
        const total = contract.totalPayment || 0;
        const paid = contract.paidAmount || 0;
        const remaining = total - paid;
        
        // If payment is completed (no remaining), stop polling and show success
        if (remaining <= 0) {
          // Stop polling for this contract
          setPollingIntervals(prev => {
            const next = new Map(prev);
            const interval = next.get(contractId);
            if (interval) {
              clearInterval(interval);
              next.delete(contractId);
            }
            return next;
          });
          
          // Remove from pending list
          setPendingPaymentContracts(prev => {
            const next = new Set(prev);
            next.delete(contractId);
            return next;
          });
          
          // Show success message
          setSuccessMessage(`Thanh toán cho hợp đồng ${formatContractCode(contract.contractCode, contract.contractId)} đã hoàn tất thành công!`);
          setTimeout(() => setSuccessMessage(null), 5000);
          
          // Refresh payment history if expanded
          if (expandedContracts.has(contractId)) {
            // Refresh payment history for this contract
            setLoadingHistories(prev => new Set([...prev, contractId]));
            getPaymentHistoryByContract(contractId)
              .then(history => {
                setPaymentHistories(prev => ({
                  ...prev,
                  [contractId]: history?.data || history || []
                }));
              })
              .catch(error => {
                console.error('Error refreshing payment history:', error);
                setPaymentHistories(prev => ({
                  ...prev,
                  [contractId]: []
                }));
              })
              .finally(() => {
                setLoadingHistories(prev => {
                  const next = new Set(prev);
                  next.delete(contractId);
                  return next;
                });
              });
          }
        }
      }
    });
  }, [contracts, pendingPaymentContracts, expandedContracts]);

  // Handle contractId from navigation state
  useEffect(() => {
    if (location.state?.contractId) {
      const contractId = location.state.contractId;
      setHighlightedContractId(contractId);
      
      // Scroll to the contract after a short delay to ensure DOM is updated
      setTimeout(() => {
        const element = document.getElementById(`contract-row-${contractId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Polling mechanism to check payment status
  useEffect(() => {
    if (pendingPaymentContracts.size === 0) return;

    const checkPaymentStatus = async () => {
      try {
        // Refresh contracts to get latest payment status
        await dispatch(fetchAllContractsThunk());
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Check immediately, then every 5 seconds
    checkPaymentStatus();
    const interval = setInterval(checkPaymentStatus, 5000);

    return () => clearInterval(interval);
  }, [pendingPaymentContracts, dispatch]);

  // Handle window focus - refresh when user returns from VNPay
  useEffect(() => {
    const handleFocus = () => {
      if (pendingPaymentContracts.size > 0) {
        // User returned from payment window, refresh contracts
        dispatch(fetchAllContractsThunk());
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [pendingPaymentContracts, dispatch]);

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      pollingIntervals.forEach((interval) => clearInterval(interval));
      setPollingIntervals(new Map());
    };
  }, []);

  // Format contract code to CTR-01, CTR-02, ...
  const formatContractCode = (contractCode, contractId) => {
    if (contractCode) {
      // If contractCode already has format, extract number or use as is
      const match = contractCode.match(/CTR-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        return `CTR-${String(num).padStart(2, '0')}`;
      }
      // Try to extract number from contractCode
      const numMatch = contractCode.match(/(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        return `CTR-${String(num).padStart(2, '0')}`;
      }
    }
    // Fallback to contractId
    if (contractId) {
      const num = parseInt(contractId, 10);
      return `CTR-${String(num).padStart(2, '0')}`;
    }
    return contractCode || 'N/A';
  };

  // Filter contracts that have signed contract file uploaded
  const contractsWithSignedImage = (contracts || []).filter(
    contract => contract.signedContractFileUrl || contract.contractFileUrl
  );

  // Calculate summary statistics
  const totalRevenue = contractsWithSignedImage.reduce(
    (sum, contract) => sum + (contract.paidAmount || 0), 0
  );
  
  const pendingAmount = contractsWithSignedImage.reduce(
    (sum, contract) => {
      const total = contract.totalPayment || 0;
      const paid = contract.paidAmount || 0;
      return sum + Math.max(0, total - paid);
    }, 0
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
      setErrorMessage(null);
      
      const response = await createPayment(
        selectedContract.contractId,
        paymentForm.paymentType,
        paymentForm.paymentMethod
      );

      // If payment method is VNPAY, open payment URL in new window
      if (paymentForm.paymentMethod === 'VNPAY' && response.data) {
        const paymentWindow = window.open(response.data, '_blank');
        
        // Add contract to pending payments list for polling
        setPendingPaymentContracts(prev => new Set([...prev, selectedContract.contractId]));
        
        // Start polling for this specific contract
        const pollInterval = setInterval(async () => {
          try {
            await dispatch(fetchAllContractsThunk());
            
            // Check if payment is completed by comparing old and new paid amounts
            // This will be checked in the next render cycle
          } catch (error) {
            console.error('Error polling payment status:', error);
          }
        }, 3000); // Poll every 3 seconds
        
        setPollingIntervals(prev => {
          const next = new Map(prev);
          next.set(selectedContract.contractId, pollInterval);
          return next;
        });
        
        // Auto-stop polling after 10 minutes (safety timeout)
        setTimeout(() => {
          setPollingIntervals(prev => {
            const next = new Map(prev);
            const interval = next.get(selectedContract.contractId);
            if (interval) {
              clearInterval(interval);
              next.delete(selectedContract.contractId);
            }
            return next;
          });
          setPendingPaymentContracts(prev => {
            const next = new Set(prev);
            next.delete(selectedContract.contractId);
            return next;
          });
        }, 600000); // 10 minutes
        
        // Monitor payment window - if closed, check payment status
        const checkWindowClosed = setInterval(() => {
          if (paymentWindow && paymentWindow.closed) {
            clearInterval(checkWindowClosed);
            // User closed payment window, refresh and stop polling after delay
            setTimeout(() => {
              dispatch(fetchAllContractsThunk());
              // Stop polling for this contract after checking
              setPollingIntervals(prev => {
                const next = new Map(prev);
                const interval = next.get(selectedContract.contractId);
                if (interval) {
                  clearInterval(interval);
                  next.delete(selectedContract.contractId);
                }
                return next;
              });
              setPendingPaymentContracts(prev => {
                const next = new Set(prev);
                next.delete(selectedContract.contractId);
                return next;
              });
            }, 2000);
          }
        }, 1000);
        
        setSuccessMessage('Đang chuyển hướng đến VNPay. Vui lòng hoàn tất thanh toán trên trang VNPay. Hệ thống sẽ tự động cập nhật sau khi thanh toán hoàn tất.');
      } else if (paymentForm.paymentMethod === 'CASH') {
        setSuccessMessage('Thanh toán tiền mặt đã được ghi nhận thành công!');
        // Refresh immediately for cash payments
        setTimeout(() => {
          dispatch(fetchAllContractsThunk());
        }, 500);
      } else {
        setSuccessMessage('Tạo thanh toán thành công!');
        setTimeout(() => {
          dispatch(fetchAllContractsThunk());
        }, 500);
      }

      setShowPaymentModal(false);
      setSelectedContract(null);

      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 8000);

    } catch (error) {
      console.error('Error creating payment:', error);
      setErrorMessage('Không thể tạo thanh toán: ' + (error.message || error));
      setTimeout(() => setErrorMessage(null), 5000);
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
      // Fetch payment history if not already loaded
      if (!paymentHistories[contractId]) {
        setLoadingHistories(prev => new Set([...prev, contractId]));
        try {
          const history = await getPaymentHistoryByContract(contractId);
          setPaymentHistories(prev => ({
            ...prev,
            [contractId]: history?.data || history || []
          }));
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
    }
    setExpandedContracts(newExpanded);
  };

  const getStatusColor = (contract) => {
    const total = contract.totalPayment || 0;
    const paid = contract.paidAmount || 0;
    const remaining = total - paid;
    
    if (remaining <= 0) return 'bg-green-100 text-green-800';
    if (paid > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (contract) => {
    const total = contract.totalPayment || 0;
    const paid = contract.paidAmount || 0;
    const remaining = total - paid;
    
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
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <DollarSign className="h-8 w-8 text-emerald-600 mr-3" />
              Quản Lý Thanh Toán
            </h1>
            <p className="text-gray-600 mt-1">
              Thanh toán cho các hợp đồng đã có chữ ký
            </p>
          </div>
        </div>

        
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Đang tải hợp đồng...</span>
          </div>
        ) : contractsWithSignedImage.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Không có hợp đồng nào có chữ ký</p>
            <p className="text-gray-400 text-sm mt-2">Các hợp đồng đã upload chữ ký sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã hợp đồng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng thanh toán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đã trả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Còn lại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contractsWithSignedImage.map((contract) => {
                  const total = contract.totalPayment || 0;
                  const paid = contract.paidAmount || 0;
                  const remaining = Math.max(0, total - paid);
                  const isExpanded = expandedContracts.has(contract.contractId);
                  const history = paymentHistories[contract.contractId] || [];
                  const isLoadingHistory = loadingHistories.has(contract.contractId);
                  const isPendingPayment = pendingPaymentContracts.has(contract.contractId);

                  return (
                    <React.Fragment key={contract.contractId}>
                      <tr 
                        id={`contract-row-${contract.contractId}`}
                        className={`hover:bg-gray-50 transition-colors ${
                          highlightedContractId === contract.contractId 
                            ? 'bg-blue-50 border-l-4 border-blue-500 shadow-sm' 
                            : isPendingPayment
                            ? 'bg-yellow-50 border-l-4 border-yellow-400'
                            : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            {formatContractCode(contract.contractCode, contract.contractId)}
                            {isPendingPayment && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Đang xử lý thanh toán
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {total.toLocaleString('vi-VN')} VNĐ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {paid.toLocaleString('vi-VN')} VNĐ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {remaining.toLocaleString('vi-VN')} VNĐ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract)}`}>
                            {getStatusText(contract)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handlePaymentClick(contract)}
                              disabled={processingPayment === contract.contractId || remaining <= 0}
                              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {processingPayment === contract.contractId ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                                  Đang xử lý...
                                </>
                              ) : (
                                'Thanh toán'
                              )}
                            </button>
                            <button
                              onClick={() => togglePaymentHistory(contract.contractId)}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm flex items-center"
                            >
                              <History className="h-4 w-4 mr-2" />
                              {isExpanded ? 'Ẩn lịch sử' : 'Lịch sử'}
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 ml-2" />
                              ) : (
                                <ChevronDown className="h-4 w-4 ml-2" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 bg-gray-50">
                            {isLoadingHistory ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-emerald-600 mr-2" />
                                <span className="text-gray-600">Đang tải lịch sử thanh toán...</span>
                              </div>
                            ) : history.length > 0 ? (
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                  <History className="h-4 w-4 mr-2" />
                                  Lịch sử thanh toán
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Ngày thanh toán
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Loại thanh toán
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Phương thức
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Số tiền
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Trạng thái
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {history.map((payment, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                          <td className="px-4 py-2 text-sm text-gray-900">
                                            {payment.paymentDate 
                                              ? new Date(payment.paymentDate).toLocaleDateString('vi-VN')
                                              : 'N/A'}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-900">
                                            {getPaymentTypeText(payment.paymentType || payment.type)}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-900">
                                            {getPaymentMethodText(payment.paymentMethod || payment.method)}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                                            {(payment.amount || payment.paymentAmount || 0).toLocaleString('vi-VN')} VNĐ
                                          </td>
                                          <td className="px-4 py-2 text-sm">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                              payment.status === 'COMPLETED' || payment.status === 'SUCCESS' 
                                                ? 'bg-green-100 text-green-800'
                                                : payment.status === 'PENDING'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                              {payment.status === 'COMPLETED' || payment.status === 'SUCCESS' 
                                                ? 'Hoàn thành'
                                                : payment.status === 'PENDING'
                                                ? 'Đang xử lý'
                                                : payment.status || 'N/A'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">
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

      {/* Payment Modal */}
      {showPaymentModal && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tạo thanh toán</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedContract(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hợp đồng</label>
                <p className="text-sm text-gray-600 font-medium">
                  {formatContractCode(selectedContract.contractCode, selectedContract.contractId)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tổng thanh toán</label>
                <p className="text-sm text-gray-600 font-medium">
                  {(selectedContract.totalPayment || 0).toLocaleString('vi-VN')} VNĐ
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đã trả</label>
                <p className="text-sm text-gray-600">
                  {(selectedContract.paidAmount || 0).toLocaleString('vi-VN')} VNĐ
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Còn lại</label>
                <p className="text-sm text-gray-600 font-medium">
                  {Math.max(0, (selectedContract.totalPayment || 0) - (selectedContract.paidAmount || 0)).toLocaleString('vi-VN')} VNĐ
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại thanh toán *</label>
                <select
                  value={paymentForm.paymentType}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="DEPOSIT">Đặt cọc</option>
                  <option value="BALANCE">Thanh toán số dư</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán *</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="VNPAY">VNPay</option>
                  <option value="CASH">Tiền mặt</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedContract(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreatePayment}
                  disabled={processingPayment === selectedContract.contractId}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {processingPayment === selectedContract.contractId ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
