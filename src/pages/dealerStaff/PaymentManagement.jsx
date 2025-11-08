import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { 
  fetchAllContractsThunk 
} from '../../store/slices/contractSlice';
import { 
  createPayment,
  getPaymentHistoryByContract,
  getPaymentById,
  getAllPayments
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


import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import StatusBadge from '../../components/ui/StatusBadge';
import ModernButton from '../../components/ui/ModernButton';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';
function PaymentManagement() {
  // Modern UI hooks
  const { toast, success, error: showError, hideToast } = useToast();
  const { confirm, showConfirm } = useConfirm();
  
  const dispatch = useDispatch();
  const location = useLocation();
  const { contracts, loading } = useSelector((state) => state.contracts);
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
  const [allPayments, setAllPayments] = useState([]);
  const [loadingAllPayments, setLoadingAllPayments] = useState(false);
  const [recentPaymentIds, setRecentPaymentIds] = useState(new Map()); // Store contractId -> paymentId mapping
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null);
  const [loadingPaymentDetail, setLoadingPaymentDetail] = useState(false);

  // Format contract code to CTR-01, CTR-02, ...
  const formatContractCode = useCallback((contractCode, contractId) => {
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
  }, []);

  // Format order code to ORD-01, ORD-02, ...
  const formatOrderCode = useCallback((orderCode, orderId) => {
    if (orderCode) {
      // If orderCode already has format, extract number or use as is
      const match = orderCode.match(/ORD-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        return `ORD-${String(num).padStart(2, '0')}`;
      }
      // Try to extract number from orderCode
      const numMatch = orderCode.match(/(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1], 10);
        return `ORD-${String(num).padStart(2, '0')}`;
      }
    }
    // Fallback to orderId
    if (orderId) {
      const num = parseInt(orderId, 10);
      return `ORD-${String(num).padStart(2, '0')}`;
    }
    return orderCode || 'N/A';
  }, []);

  // Helper function to normalize contract codes for matching
  const normalizeContractCode = useCallback((code) => {
    if (!code) return '';
    // Remove all non-digit characters and get just the number
    const numMatch = code.toString().match(/(\d+)/);
    if (numMatch) {
      return numMatch[1];
    }
    return code.toString();
  }, []);

  // Helper function to check if payment matches contract
  const paymentMatchesContract = useCallback((payment, contract, contractId) => {
    if (!contract) return false;
    
    // Check by contractId
    if (payment.contractId && payment.contractId === contractId) {
      return true;
    }
    
    // Check by contractCode - normalize both codes for comparison (use original values from API)
    if (payment.contractCode) {
      const paymentCodeNormalized = normalizeContractCode(payment.contractCode);
      const contractCodeNormalized = normalizeContractCode(contract.contractCode);
      
      // Compare normalized codes or exact match
      if (paymentCodeNormalized === contractCodeNormalized ||
          payment.contractCode === contract.contractCode) {
        return true;
      }
    }
    
    return false;
  }, [normalizeContractCode]);

  // Fetch latest payment details after payment completion
  const fetchLatestPaymentDetails = useCallback(async (contractId, showModal = true) => {
    try {
      setLoadingPaymentDetail(true);
      const contract = contracts?.find(c => c.contractId === contractId);
      if (!contract) {
        setLoadingPaymentDetail(false);
        return;
      }
      
      console.log('🔄 Fetching payment details for contract:', contractId);
      
      // Step 1: Use allPayments from state or fetch if not available
      let allPaymentsData = allPayments;
      if (!allPaymentsData || allPaymentsData.length === 0) {
        console.log('📞 Calling GET /payment/all (not in state)');
        const allPaymentsResponse = await getAllPayments();
        allPaymentsData = allPaymentsResponse?.data || allPaymentsResponse || [];
        setAllPayments(allPaymentsData);
        console.log('✅ Received payments from /payment/all:', allPaymentsData.length);
      } else {
        console.log('✅ Using', allPaymentsData.length, 'payments from state');
      }
      
      // Filter payments for this contract and sort by createdAt (newest first)
      const contractPayments = allPaymentsData
        .filter(payment => paymentMatchesContract(payment, contract, contractId))
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
      
      console.log('🔍 Found', contractPayments.length, 'payments for contract');
      
      if (contractPayments.length > 0) {
        const latestPayment = contractPayments[0];
        console.log('💰 Latest payment:', latestPayment);
        
        // Store the payment ID for reference
        setRecentPaymentIds(prev => {
          const next = new Map(prev);
          next.set(contractId, latestPayment.paymentId);
          return next;
        });
        
        // Step 2: Call /payment/{paymentId} to get detailed payment information
        if (latestPayment.paymentId) {
          try {
            console.log(`📞 Calling GET /payment/${latestPayment.paymentId}`);
            const paymentDetailsResponse = await getPaymentById(latestPayment.paymentId);
            const detailedPayment = paymentDetailsResponse?.data || paymentDetailsResponse;
            console.log('✅ Received payment details:', detailedPayment);
            
            // Store payment detail to show in modal
            if (showModal && detailedPayment) {
              setSelectedPaymentDetail(detailedPayment);
              setShowPaymentDetailModal(true);
            }
            
            // Always refresh payment history to include latest payment
            try {
              // Also refresh payment history by contract
              const history = await getPaymentHistoryByContract(contractId);
              const historyData = history?.data || history || [];
              
              // Merge and update payment history
              setPaymentHistories(prev => {
                const existing = prev[contractId] || [];
                // Combine history data with detailed payment
                const allPaymentsList = [...historyData];
                
                // Add detailed payment if not already in history
                const exists = allPaymentsList.some(p => 
                  p.paymentId === detailedPayment.paymentId || 
                  p.paymentCode === detailedPayment.paymentCode
                );
                
                if (!exists && detailedPayment) {
                  allPaymentsList.unshift(detailedPayment);
                }
                
                // Remove duplicates based on paymentId or paymentCode
                const uniquePayments = allPaymentsList.reduce((acc, payment) => {
                  const key = payment.paymentId || payment.paymentCode;
                  if (!acc.find(p => (p.paymentId || p.paymentCode) === key)) {
                    acc.push(payment);
                  }
                  return acc;
                }, []);
                
                // Sort by createdAt (newest first)
                uniquePayments.sort((a, b) => {
                  const dateA = new Date(a.createdAt || 0);
                  const dateB = new Date(b.createdAt || 0);
                  return dateB - dateA;
                });
                
                return {
                  ...prev,
                  [contractId]: uniquePayments
                };
              });
            } catch (historyError) {
              console.error('Error refreshing payment history:', historyError);
            }
          } catch (paymentDetailError) {
            console.error('Error fetching payment details by ID:', paymentDetailError);
            // Fallback: use the payment from getAllPayments
            if (showModal && latestPayment) {
              setSelectedPaymentDetail(latestPayment);
              setShowPaymentDetailModal(true);
            }
            
            // Fallback to just refreshing history by contract
            try {
              const history = await getPaymentHistoryByContract(contractId);
              setPaymentHistories(prev => ({
                ...prev,
                [contractId]: history?.data || history || []
              }));
            } catch (historyError) {
              console.error('Error fetching payment history:', historyError);
            }
          }
        }
      } else {
        console.log('⚠️ No payments found for contract');
      }
    } catch (error) {
      console.error('❌ Error fetching latest payment details:', error);
      showError('Không thể lấy thông tin thanh toán: ' + (error.message || error));
    } finally {
      setLoadingPaymentDetail(false);
    }
  }, [contracts, expandedContracts, showError, allPayments, paymentMatchesContract]);

  // Fetch contracts on mount
  useEffect(() => {
    dispatch(fetchAllContractsThunk());
  }, [dispatch]);

  // Fetch all payments on mount
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoadingAllPayments(true);
        console.log('🔄 Fetching all payments on mount...');
        const response = await getAllPayments();
        const paymentsData = response?.data || response || [];
        console.log('✅ Loaded', paymentsData.length, 'payments');
        setAllPayments(paymentsData);
      } catch (error) {
        console.error('❌ Error fetching all payments:', error);
        showError('Không thể tải danh sách thanh toán: ' + (error.message || error));
      } finally {
        setLoadingAllPayments(false);
      }
    };

    fetchPayments();
  }, [showError]);

  // Auto-load payment histories when contracts and allPayments are ready
  useEffect(() => {
    if (!contracts || contracts.length === 0 || !allPayments || allPayments.length === 0) {
      return;
    }

    // Only process contracts with signed images
    const contractsWithSigned = contracts.filter(
      c => c.signedContractFileUrl || c.contractFileUrl
    );

    // Load payment histories for all contracts with signed images
    contractsWithSigned.forEach((contract) => {
      // Only load if not already loaded
      if (!paymentHistories[contract.contractId] || paymentHistories[contract.contractId].length === 0) {
        const contractPayments = allPayments.filter(payment => 
          paymentMatchesContract(payment, contract, contract.contractId)
        );
        
        if (contractPayments.length > 0) {
          // Sort by createdAt (newest first)
          contractPayments.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
          });
          
          console.log('🔄 Auto-loading', contractPayments.length, 'payments for contract:', contract.contractId);
          setPaymentHistories(prev => ({
            ...prev,
            [contract.contractId]: contractPayments
          }));
        }
      }
    });
  }, [contracts, allPayments, paymentMatchesContract]);

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
          success(`Thanh toán cho hợp đồng ${contract.contractCode || contractId} đã hoàn tất thành công!`);
          
          // Fetch latest payment details using /payment/all and /payment/{paymentId}
          // Show modal with payment details
          fetchLatestPaymentDetails(contractId, true);
          
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
  }, [contracts, pendingPaymentContracts, expandedContracts, fetchLatestPaymentDetails, success]);

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
      
      const response = await createPayment(
        selectedContract.contractId,
        paymentForm.paymentType,
        paymentForm.paymentMethod
      );

      // Store payment ID if available in response
      if (response?.data?.paymentId || response?.paymentId) {
        const paymentId = response?.data?.paymentId || response?.paymentId;
        setRecentPaymentIds(prev => {
          const next = new Map(prev);
          next.set(selectedContract.contractId, paymentId);
          return next;
        });
      }
      
      // If payment method is VNPAY, open payment URL in new window
      if (paymentForm.paymentMethod === 'VNPAY' && (response.data || response)) {
        const paymentUrl = typeof response.data === 'string' ? response.data : response.data?.paymentUrl || response.paymentUrl;
        if (paymentUrl) {
          const paymentWindow = window.open(paymentUrl, '_blank');
          
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
            // User closed payment window, refresh and check payment status
            setTimeout(async () => {
              await dispatch(fetchAllContractsThunk());
              // Fetch payment details using /payment/all and /payment/{paymentId}
              await fetchLatestPaymentDetails(selectedContract.contractId, true);
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
        
          success('Đang chuyển hướng đến VNPay. Vui lòng hoàn tất thanh toán trên trang VNPay. Hệ thống sẽ tự động cập nhật sau khi thanh toán hoàn tất.');
        } else {
          showError('Không thể lấy URL thanh toán VNPay. Vui lòng thử lại.');
        }
      } else if (paymentForm.paymentMethod === 'CASH') {
        success('Thanh toán tiền mặt đã được ghi nhận thành công!');
        // Refresh immediately for cash payments and fetch payment details
        setTimeout(async () => {
          await dispatch(fetchAllContractsThunk());
          // Show payment details modal
          await fetchLatestPaymentDetails(selectedContract.contractId, true);
        }, 500);
      } else {
        success('Tạo thanh toán thành công!');
        setTimeout(async () => {
          await dispatch(fetchAllContractsThunk());
          // Show payment details modal
          await fetchLatestPaymentDetails(selectedContract.contractId, true);
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
      
      // Fetch payment history if not already loaded
      setLoadingHistories(prev => new Set([...prev, contractId]));
      try {
        const contract = contracts?.find(c => c.contractId === contractId);
        let historyData = [];
        
        // First, try to use allPayments from state (already loaded on mount)
        if (allPayments && allPayments.length > 0 && contract) {
          console.log('📋 Using allPayments from state for contract:', contractId);
          const contractPayments = allPayments.filter(payment => 
            paymentMatchesContract(payment, contract, contractId)
          );
          historyData = contractPayments;
          console.log('✅ Found', contractPayments.length, 'payments in allPayments');
        }
        
        // Also try to get payment history by contract API (as backup/merge)
        try {
          const history = await getPaymentHistoryByContract(contractId);
          const historyDataFromAPI = history?.data || history || [];
          
          if (historyDataFromAPI.length > 0) {
            console.log('📋 Also fetched', historyDataFromAPI.length, 'payments from API');
            // Merge with existing data
            const merged = [...historyData, ...historyDataFromAPI];
            // Remove duplicates
            const uniquePayments = merged.reduce((acc, payment) => {
              const key = payment.paymentId || payment.paymentCode;
              if (!acc.find(p => (p.paymentId || p.paymentCode) === key)) {
                acc.push(payment);
              }
              return acc;
            }, []);
            historyData = uniquePayments;
          }
        } catch (error) {
          console.error('Error fetching payment history by contract:', error);
          // Continue with data from allPayments if available
        }
        
        // Sort by createdAt (newest first)
        historyData.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });
        
        console.log('💾 Saving', historyData.length, 'payments to state for contract:', contractId);
        setPaymentHistories(prev => ({
          ...prev,
          [contractId]: historyData
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
                    Mã đơn hàng
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
                            {contract.contractCode || 'N/A'}
                            {isPendingPayment && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Đang xử lý thanh toán
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span className="font-medium text-blue-600">
                              {contract.orderCode || 'N/A'}
                            </span>
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
                          <td colSpan="7" className="px-6 py-4 bg-gray-50">
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
                                          Mã thanh toán
                                        </th>
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
                                          Còn lại
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Trạng thái
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {history.map((payment, idx) => {
                                        const paymentDate = payment.paymentDate || payment.createdAt;
                                        const amount = payment.amount || payment.paymentAmount || 0;
                                        const remainPrice = payment.remainPrice !== undefined ? payment.remainPrice : null;
                                        const paymentCode = payment.paymentCode || payment.code || `PAY-${payment.paymentId || idx + 1}`;
                                        const status = payment.status || 'DRAFT';
                                        
                                        return (
                                          <tr key={payment.paymentId || payment.paymentCode || idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                              {paymentCode}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
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
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                              {getPaymentTypeText(payment.paymentType || payment.type)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                              {getPaymentMethodText(payment.paymentMethod || payment.method)}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 font-medium">
                                              {amount.toLocaleString('vi-VN')} VNĐ
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                              {remainPrice !== null 
                                                ? `${remainPrice.toLocaleString('vi-VN')} VNĐ`
                                                : '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm">
                                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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

      {/* Payment Detail Modal - Show after payment completion */}
      {showPaymentDetailModal && selectedPaymentDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                  Thông tin thanh toán
                </h3>
                <p className="text-sm text-gray-500 mt-1">
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
                <X className="h-6 w-6" />
              </button>
            </div>

            {loadingPaymentDetail ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
                <span className="text-gray-600">Đang tải thông tin thanh toán...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Payment Status Badge */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
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
                    <p className="text-sm text-gray-500 mb-1">Số tiền</p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {(selectedPaymentDetail.amount || 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                </div>

                {/* Payment Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Mã thanh toán</p>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedPaymentDetail.paymentCode || `PAY-${selectedPaymentDetail.paymentId || 'N/A'}`}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Mã hợp đồng</p>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedPaymentDetail.contractCode || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                    <p className="text-base font-semibold text-blue-600">
                      {selectedPaymentDetail.orderCode || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Loại thanh toán</p>
                    <p className="text-base font-semibold text-gray-900">
                      {getPaymentTypeText(selectedPaymentDetail.paymentType)}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Phương thức thanh toán</p>
                    <p className="text-base font-semibold text-gray-900">
                      {getPaymentMethodText(selectedPaymentDetail.paymentMethod)}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Số tiền còn lại</p>
                    <p className="text-base font-semibold text-gray-900">
                      {selectedPaymentDetail.remainPrice !== undefined && selectedPaymentDetail.remainPrice !== null
                        ? `${selectedPaymentDetail.remainPrice.toLocaleString('vi-VN')} VNĐ`
                        : '-'}
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Thời gian tạo</p>
                    <p className="text-base font-semibold text-gray-900">
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

                {/* Payment Summary */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt thanh toán</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Mã thanh toán:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedPaymentDetail.paymentCode || `PAY-${selectedPaymentDetail.paymentId || 'N/A'}`}
                      </span>
                    </div>
                    {selectedPaymentDetail.orderCode && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Mã đơn hàng:</span>
                        <span className="font-semibold text-blue-600">
                          {selectedPaymentDetail.orderCode}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Mã hợp đồng:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedPaymentDetail.contractCode || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-bold text-emerald-600 text-lg">
                        {(selectedPaymentDetail.amount || 0).toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                    {selectedPaymentDetail.remainPrice !== undefined && selectedPaymentDetail.remainPrice !== null && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Còn lại:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedPaymentDetail.remainPrice.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        selectedPaymentDetail.status === 'COMPLETED' || selectedPaymentDetail.status === 'SUCCESS' || selectedPaymentDetail.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : selectedPaymentDetail.status === 'PENDING' || selectedPaymentDetail.status === 'PROCESSING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedPaymentDetail.status === 'COMPLETED' || selectedPaymentDetail.status === 'SUCCESS' || selectedPaymentDetail.status === 'PAID'
                          ? 'Hoàn thành'
                          : selectedPaymentDetail.status === 'PENDING' || selectedPaymentDetail.status === 'PROCESSING'
                          ? 'Đang xử lý'
                          : selectedPaymentDetail.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowPaymentDetailModal(false);
                  setSelectedPaymentDetail(null);
                }}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã hợp đồng</label>
                <p className="text-sm text-gray-600 font-medium">
                  {selectedContract.contractCode || 'N/A'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã đơn hàng</label>
                <p className="text-sm text-blue-600 font-medium">
                  {selectedContract.orderCode || 'N/A'}
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
