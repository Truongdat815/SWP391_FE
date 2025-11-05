import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

  // Fetch contracts on mount
  useEffect(() => {
    dispatch(fetchAllContractsThunk());
  }, [dispatch]);

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
        window.open(response.data, '_blank');
        setSuccessMessage('Đang chuyển hướng đến VNPay. Vui lòng hoàn tất thanh toán trên trang VNPay.');
      } else if (paymentForm.paymentMethod === 'CASH') {
        setSuccessMessage('Thanh toán tiền mặt đã được ghi nhận thành công!');
      } else {
        setSuccessMessage('Tạo thanh toán thành công!');
      }

      setShowPaymentModal(false);
      setSelectedContract(null);
      
      // Refresh contracts after payment
      setTimeout(() => {
        dispatch(fetchAllContractsThunk());
      }, 1000);

      // Clear success message after delay
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString('vi-VN')} VNĐ</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Công nợ</p>
                <p className="text-2xl font-bold text-gray-900">{pendingAmount.toLocaleString('vi-VN')} VNĐ</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng hợp đồng</p>
                <p className="text-2xl font-bold text-gray-900">{contractsWithSignedImage.length}</p>
              </div>
            </div>
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
                    Khách hàng
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

                  return (
                    <React.Fragment key={contract.contractId}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {contract.contractCode || `#${contract.contractId}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {contract.customerName || 'N/A'}
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
                <p className="text-sm text-gray-600">
                  {selectedContract.contractCode || `#${selectedContract.contractId}`} - {selectedContract.customerName}
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
