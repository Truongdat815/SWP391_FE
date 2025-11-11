import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  uploadSignedContractThunk,
  fetchAllContractsThunk
} from '../../store/slices/contractSlice';
import { getContractHtml } from '../../api/contractService';
import { getOrderById } from '../../api/orderService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Eye, 
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Package,
  Calendar,
  Download,
  X,
  User,
  Phone,
  DollarSign,
  ShoppingBag,
  UserCircle,
  Receipt,
  Tag,
  CreditCard
} from 'lucide-react';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import StatusBadge from '../../components/ui/StatusBadge';
import { ModernCard, ModernCardHeader, ModernCardContent } from '../../components/ui/ModernCard';
import ModernButton from '../../components/ui/ModernButton';
import { ModernTable, ModernTableHead, ModernTableHeader, ModernTableBody, ModernTableRow, ModernTableCell } from '../../components/ui/ModernTable';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import EmptyState from '../../components/ui/EmptyState';

// Helper function to aggregate order details with same modelId and colorId
const aggregateOrderDetails = (details) => {
  if (!details || details.length === 0) return [];
  
  const aggregatedMap = new Map();
  
  details.forEach((detail) => {
    const key = `${detail.modelId || ''}-${detail.colorId || ''}`;
    
    if (aggregatedMap.has(key)) {
      // Aggregate with existing detail
      const existing = aggregatedMap.get(key);
      const newQuantity = (existing.quantity || 0) + (detail.quantity || 0);
      const unitPrice = existing.unitPrice || detail.unitPrice || detail.unit_price || 0;
      
      // Aggregate VAT (should be proportional to quantity)
      const newVatAmount = (existing.vatAmount || existing.vat_amount || 0) + (detail.vatAmount || detail.vat_amount || 0);
      
      // Aggregate discount (should be proportional to quantity)
      const newDiscountAmount = (existing.discountAmount || existing.discount_amount || 0) + (detail.discountAmount || detail.discount_amount || 0);
      
      // Fees should NOT be multiplied - take from first detail only (fees are per order, not per item)
      // Use the first detail's fees (existing), don't add from the new detail
      const licensePlateFee = existing.licensePlateFee || existing.license_plate_fee || 0;
      const registrationFee = existing.registrationFee || existing.registration_fee || 0;
      
      // Recalculate totalPrice from scratch to ensure it matches quantity=2 scenario:
      // totalPrice = (unitPrice * newQuantity) + VAT + fees - discount
      const subtotal = unitPrice * newQuantity;
      const newTotalPrice = subtotal + newVatAmount + licensePlateFee + registrationFee - newDiscountAmount;
      
      aggregatedMap.set(key, {
        ...existing,
        quantity: newQuantity,
        unitPrice: unitPrice,
        vatAmount: newVatAmount,
        discountAmount: newDiscountAmount,
        licensePlateFee: licensePlateFee, // Keep from first, don't sum
        registrationFee: registrationFee, // Keep from first, don't sum
        totalPrice: newTotalPrice // Recalculated to match quantity=2 scenario
      });
    } else {
      // First occurrence - keep as is
      aggregatedMap.set(key, { ...detail });
    }
  });
  
  return Array.from(aggregatedMap.values());
};

function ViewContracts() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { contracts, loading } = useSelector((state) => state.contracts);
  
  // Modern UI hooks
  const { toast, success, error, hideToast } = useToast();
  const { confirm, showConfirm } = useConfirm();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingContract, setUploadingContract] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // Fetch contracts on component mount
  useEffect(() => {
    dispatch(fetchAllContractsThunk());
  }, [dispatch]);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      success(location.state.message);
      
      // Clear the location state
      window.history.replaceState({}, document.title);
    }
  }, [location, success]);


  // Filter contracts by search
  const filteredContracts = (contracts || [])
    .filter(contract => 
      contract.contractId?.toString().includes(searchTerm) ||
      contract.contractCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort from newest to oldest by contractDate or createdAt
      const dateA = new Date(a.contractDate || a.createdAt || 0);
      const dateB = new Date(b.contractDate || b.createdAt || 0);
      return dateB - dateA; // Descending order (newest first)
    });

  // Handle view contract HTML
  const handleViewContract = async (contract) => {
    try {
      // Fetch HTML with authentication
      const htmlContent = await getContractHtml(contract.contractId);
      
      // Create blob URL from HTML
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Open blob URL in new tab
      window.open(blobUrl, '_blank');
      
      // Clean up blob URL after 1 minute
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err) {
      console.error('Error viewing contract:', err);
      error('Không thể mở hợp đồng: ' + err.message);
    }
  };

  // Handle upload signed contract
  const handleUploadClick = (contract) => {
    setSelectedContract(contract);
    setShowUploadModal(true);
    setSelectedFile(null);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
    setSelectedContract(null);
    setSelectedFile(null);
  };

  const handleViewOrder = async (contract) => {
    setSelectedOrder(null);
    setShowOrderModal(true);
    setLoadingOrderDetails(true);
    
    try {
      const orderResponse = await getOrderById(contract.orderId);
      const order = orderResponse.data || orderResponse;
      setSelectedOrder(order);
      
      // Backend returns product details in 'getOrderDetailsResponses' array
      const rawDetails = order.getOrderDetailsResponses || [];
      
      // Aggregate details with same modelId and colorId (in case quantity was increased)
      const aggregatedDetails = aggregateOrderDetails(rawDetails);
      setOrderDetails(aggregatedDetails);
    } catch (err) {
      console.error('Error loading order:', err);
      error('Không thể tải thông tin đơn hàng: ' + err.message);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
    setOrderDetails([]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        error('Chỉ chấp nhận file ảnh (JPG, PNG) hoặc PDF');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        error('Kích thước file không được vượt quá 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedContract) {
      error('Vui lòng chọn file để upload');
      return;
    }

    try {
      setUploadingContract(selectedContract.contractId);
      
      const result = await dispatch(uploadSignedContractThunk({
        contractId: selectedContract.contractId,
        file: selectedFile
      })).unwrap();
      
      console.log('Upload result:', result);
      
      handleCloseModal();
      success('Upload hợp đồng đã ký thành công!');
      
      // Refresh contracts list
      dispatch(fetchAllContractsThunk());
      
    } catch (err) {
      console.error('Error uploading contract:', err);
      
      // Check for CHECK constraint violation error
      const errorMessage = err.message || err.toString() || '';
      const errorLower = errorMessage.toLowerCase();
      
      if (errorLower.includes('check constraint') || 
          errorLower.includes('ck__orders__status') ||
          errorLower.includes('conflicted with the check constraint')) {
        error('Lỗi: Backend đang cập nhật trạng thái đơn hàng với giá trị không hợp lệ. Vui lòng liên hệ quản trị viên để kiểm tra backend.');
      } else {
        error('Không thể upload hợp đồng: ' + errorMessage);
      }
    } finally {
      setUploadingContract(null);
    }
  };

  // Handle payment click - navigate to PaymentManagement
  const handlePaymentClick = (contract) => {
    navigate('/dealer-staff/payment-management', {
      state: { contractId: contract.contractId }
    });
  };


  const getStatusText = (status) => {
    if (!status) return status || 'N/A';
    // Return status in English as from API response
    return status.toUpperCase();
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
              <FileText className="h-6 w-6 text-emerald-600 mr-2" />
              Quản Lý Hợp Đồng
            </h1>
            <p className="text-gray-600 mt-0.5 text-sm">
              Danh sách hợp đồng đã tạo - Xem và upload hợp đồng đã ký
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã hợp đồng, mã đơn hàng, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
            <span className="text-gray-600 text-sm">Đang tải hợp đồng...</span>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-base">Không có hợp đồng nào</p>
            <p className="text-gray-400 text-xs mt-1.5">Các hợp đồng đã tạo sẽ xuất hiện ở đây</p>
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
                    Ngày tạo
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tổng thanh toán
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Đã upload
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Hợp đồng đã ký
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => (
                  <tr key={contract.contractId} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contract.contractCode || 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleViewOrder(contract)}
                        className="text-blue-600 hover:text-blue-900 hover:underline transition-colors font-medium"
                      >
                        {contract.orderCode || 'N/A'}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900">
                      {contract.contractDate ? new Date(contract.contractDate).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <StatusBadge status={contract.status || 'PENDING'} size="sm" />
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {(contract.totalPayment || 0).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900">
                      {contract.signedContractFileUrl || contract.contractFileUrl ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Đã upload
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md bg-yellow-100 text-yellow-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Chưa upload
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900">
                      {(contract.signedContractFileUrl || contract.contractFileUrl) ? (
                        <a 
                          href={contract.signedContractFileUrl || contract.contractFileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 transition-colors underline font-medium text-xs"
                        >
                          Xem hợp đồng đã ký
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewContract(contract)}
                          className="text-emerald-600 hover:text-emerald-900 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {!(contract.signedContractFileUrl || contract.contractFileUrl) ? (
                          <button
                            onClick={() => handleUploadClick(contract)}
                            disabled={uploadingContract === contract.contractId}
                            className="text-blue-600 hover:text-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploadingContract === contract.contractId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePaymentClick(contract)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md p-4 border shadow-lg rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Upload Hợp Đồng Đã Ký
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  Mã hợp đồng: <span className="font-semibold">{selectedContract.contractCode || `#${selectedContract.contractId}`}</span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Upload Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Chọn file hợp đồng đã ký
                </label>
                <input 
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-gray-500
                    file:mr-3 file:py-1.5 file:px-3
                    file:rounded-lg file:border-0
                    file:text-xs file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Chấp nhận: JPG, PNG, PDF (tối đa 10MB)
                </p>
              </div>

              {selectedFile && (
                <div className="p-2.5 bg-gray-50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadingContract === selectedContract.contractId}
                  className="flex items-center px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {uploadingContract === selectedContract.contractId ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      Đang upload...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-1.5" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderModal && selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={handleCloseOrderModal}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-7xl p-4 border shadow-lg rounded-lg bg-white max-h-[95vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Receipt className="h-6 w-6 text-emerald-600" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Chi tiết đơn hàng
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <span className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      Mã: <span className="font-semibold ml-1">{selectedOrder.orderCode || 'N/A'}</span>
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseOrderModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Customer Information */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <h4 className="font-bold text-blue-900 text-sm">Thông tin khách hàng</h4>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start">
                      <UserCircle className="h-3 w-3 text-blue-600 mr-1.5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-blue-700">Tên khách hàng</p>
                        <p className="text-xs font-semibold text-blue-900">{selectedOrder.customerName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-3 w-3 text-blue-600 mr-1.5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-blue-700">Số điện thoại</p>
                        <p className="text-xs font-semibold text-blue-900">{selectedOrder.customerPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <h4 className="font-bold text-emerald-900 text-sm">Tổng quan tài chính</h4>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-emerald-700">Tổng giá sản phẩm:</span>
                      <span className="text-xs font-semibold text-emerald-900">
                        {(selectedOrder.totalPrice || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-emerald-700">Thuế VAT:</span>
                      <span className="text-xs font-semibold text-orange-600">
                        +{(selectedOrder.totalTaxPrice || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="pt-1.5 border-t-2 border-emerald-300">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-900">Tổng thanh toán:</span>
                        <span className="text-base font-bold text-emerald-600">
                          {(selectedOrder.totalPayment || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2.5">
                    <h4 className="font-bold text-white flex items-center text-sm">
                      <ShoppingBag className="h-4 w-4 mr-1.5" />
                      Chi tiết sản phẩm
                    </h4>
                  </div>
                  
                  {loadingOrderDetails ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mr-2" />
                      <span className="text-gray-600 font-medium text-sm">Đang tải chi tiết sản phẩm...</span>
                    </div>
                  ) : orderDetails.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Sản phẩm
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Số lượng
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Đơn giá
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              Thành tiền
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {orderDetails.map((item, index) => (
                            <tr key={index} className="hover:bg-emerald-50 transition-colors">
                              <td className="px-3 py-2">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 flex-shrink-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
                                    <Package className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 text-sm">{item.modelName || 'N/A'}</div>
                                    <div className="text-xs text-gray-500 flex items-center">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {item.colorName || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-xs font-bold">
                                  {item.quantity || 0}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right text-xs font-semibold text-gray-900">
                                {(item.unitPrice || 0).toLocaleString('vi-VN')}đ
                              </td>
                              <td className="px-3 py-2 text-right text-xs font-bold text-emerald-600">
                                {(item.totalPrice || 0).toLocaleString('vi-VN')}đ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Chưa có sản phẩm trong đơn hàng</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-3 border-t border-gray-200 mt-3">
                <button
                  onClick={handleCloseOrderModal}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default ViewContracts;


