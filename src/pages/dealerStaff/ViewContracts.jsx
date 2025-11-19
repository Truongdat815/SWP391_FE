import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  uploadSignedContractThunk,
  fetchAllContractsThunk
} from '../../store/slices/contractSlice';
import { getContractHtml, getContractDetail, getContractById } from '../../api/contractService';
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
  CreditCard,
  Building2,
  FileCheck
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
import Pagination from '../../components/ui/Pagination';

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
  const [showContractDetailModal, setShowContractDetailModal] = useState(false);
  const [contractDetail, setContractDetail] = useState(null);
  const [loadingContractDetail, setLoadingContractDetail] = useState(false);
  const [showContractImageModal, setShowContractImageModal] = useState(false);
  const [contractImage, setContractImage] = useState(null);
  const [loadingContractImage, setLoadingContractImage] = useState(false);
  const [contractInfo, setContractInfo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showPreviewZoom, setShowPreviewZoom] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Use ref to prevent duplicate API calls
  const hasFetchedContractsRef = useRef(false);
  // Ref to store previous preview URL for cleanup
  const prevPreviewUrlRef = useRef(null);

  // Fetch contracts on component mount
  useEffect(() => {
    // Only fetch once
    if (hasFetchedContractsRef.current) {
      return;
    }
    
    hasFetchedContractsRef.current = true;
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

  // Cleanup preview URL when it changes or component unmounts
  useEffect(() => {
    // Cleanup previous URL when previewUrl changes
    if (prevPreviewUrlRef.current) {
      URL.revokeObjectURL(prevPreviewUrlRef.current);
    }
    prevPreviewUrlRef.current = previewUrl;
    
    // Cleanup on unmount
    return () => {
      if (prevPreviewUrlRef.current) {
        URL.revokeObjectURL(prevPreviewUrlRef.current);
      }
    };
  }, [previewUrl]);


  // Filter contracts by search
  const filteredContracts = useMemo(() => {
    return (contracts || [])
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
  }, [contracts, searchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = (contracts || []).length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayContracts = (contracts || []).filter(c => {
      if (!c.contractDate && !c.createdAt) return false;
      const contractDate = new Date(c.contractDate || c.createdAt);
      contractDate.setHours(0, 0, 0, 0);
      return contractDate.getTime() === today.getTime();
    });

    const uploaded = (contracts || []).filter(c => 
      c.signedContractFileUrl || c.contractFileUrl
    ).length;

    const pendingUpload = total - uploaded;

    return {
      total,
      today: todayContracts.length,
      uploaded,
      pendingUpload
    };
  }, [contracts]);

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
    setPreviewUrl(null);
    setIsConfirmed(false);
  };

  const handleCloseModal = () => {
    // Close zoom modal if open
    setShowPreviewZoom(false);
    // Clean up preview URL before closing
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setShowUploadModal(false);
    setSelectedContract(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsConfirmed(false);
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
      
      // Close zoom modal if open
      setShowPreviewZoom(false);
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setSelectedFile(file);
      setIsConfirmed(false);
      
      // Create preview URL for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        // For PDF, don't show preview
        setPreviewUrl(null);
      }
    }
  };

  const handleConfirmImage = () => {
    if (selectedFile) {
      setIsConfirmed(true);
      success('Đã xác nhận ảnh hợp đồng. Bạn có thể upload ngay bây giờ.');
    }
  };

  const handleCancelSelection = () => {
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsConfirmed(false);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
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

  // Handle view contract detail
  const handleViewContractDetail = async (contract) => {
    setContractDetail(null);
    setShowContractDetailModal(true);
    setLoadingContractDetail(true);
    
    try {
      const detail = await getContractDetail(contract.contractId);
      setContractDetail(detail);
    } catch (err) {
      console.error('Error loading contract detail:', err);
      
      // Check for database/SQL errors
      const errorMessage = err.message || '';
      const isDatabaseError = errorMessage.includes('Invalid column') || 
                             errorMessage.includes('JDBC') || 
                             errorMessage.includes('SQL') ||
                             errorMessage.includes('database');
      
      if (isDatabaseError) {
        error('Lỗi cơ sở dữ liệu: ' + errorMessage + '. Vui lòng liên hệ quản trị viên để kiểm tra backend.');
      } else {
        error('Không thể tải chi tiết hợp đồng: ' + errorMessage);
      }
      
      // Close modal on error
      setShowContractDetailModal(false);
    } finally {
      setLoadingContractDetail(false);
    }
  };

  const handleCloseContractDetailModal = () => {
    setShowContractDetailModal(false);
    setContractDetail(null);
  };

  // Handle viewing contract signed image
  const handleViewContractImage = async (contract) => {
    try {
      setLoadingContractImage(true);
      setShowContractImageModal(true);
      
      // Check if contract has signedContractFileUrl directly
      const imageUrl = contract.signedContractFileUrl || contract.contractFileUrl;
      
      if (imageUrl) {
        setContractImage(imageUrl);
        setContractInfo(contract);
      } else {
        // If no direct URL, try to fetch from API
        const contractData = await getContractById(contract.contractId);
        const contractDetail = contractData?.data || contractData;
        
        const fetchedImageUrl = contractDetail?.signedContractFileUrl || contractDetail?.contractFileUrl;
        if (fetchedImageUrl) {
          setContractImage(fetchedImageUrl);
          setContractInfo(contractDetail);
        } else {
          error('Hợp đồng này chưa có ảnh đã ký');
          setShowContractImageModal(false);
        }
      }
    } catch (err) {
      console.error('Error loading contract image:', err);
      error('Không thể tải ảnh hợp đồng: ' + (err.message || err));
      setShowContractImageModal(false);
    } finally {
      setLoadingContractImage(false);
    }
  };

  const handleCloseContractImageModal = () => {
    setShowContractImageModal(false);
    setContractImage(null);
    setContractInfo(null);
  };


  const getStatusText = (status) => {
    if (!status) return 'Không xác định';
    const upperStatus = status.toUpperCase();
    const statusMap = {
      'PENDING': 'Chờ xử lý',
      'DRAFT': 'Bản nháp',
      'ACCEPTED': 'Đã chấp nhận',
      'APPROVED': 'Đã duyệt',
      'CONFIRMED': 'Đã xác nhận',
      'CONTRACT_PENDING': 'Chờ ký hợp đồng',
      'CONTRACT_SIGNED': 'Đã ký hợp đồng',
      'FILE_UPLOADED': 'Đã upload',
      'PAYMENT_CONFIRMED': 'Đã thanh toán',
      'FULLY_PAID': 'Đã thanh toán đủ',
      'SHIPPING': 'Đang vận chuyển',
      'IN_TRANSIT': 'Đang vận chuyển',
      'COMPLETED': 'Đã hoàn thành',
      'DELIVERED': 'Đã giao hàng',
      'FINISH': 'Hoàn thành',
      'REJECTED': 'Đã từ chối',
      'CANCELLED': 'Đã hủy',
      'CANCELED': 'Đã hủy',
      'PROCESSING': 'Đang xử lý'
    };
    return statusMap[upperStatus] || status;
  };

  return (
    <div className="bg-gray-50">
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 pt-0 pb-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          {/* Total Contracts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 pt-3 pb-4 px-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded-lg">
                  <FileText className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600 font-medium">Tổng số hợp đồng</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xl font-bold text-gray-900">{stats.total.toLocaleString('vi-VN')}</p>
              <p className="text-sm font-medium text-gray-600">đơn</p>
            </div>
          </motion.div>

          {/* Today Contracts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 pt-3 pb-4 px-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-100 rounded-lg">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <p className="text-xs text-gray-600 font-medium">Hợp đồng hôm nay</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xl font-bold text-gray-900">{stats.today.toLocaleString('vi-VN')}</p>
              <p className="text-sm font-medium text-gray-600">đơn</p>
            </div>
          </motion.div>

          {/* Uploaded */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 pt-3 pb-4 px-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded-lg">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                </div>
                <p className="text-xs text-gray-600 font-medium">Đã upload</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xl font-bold text-gray-900">{stats.uploaded.toLocaleString('vi-VN')}</p>
              <p className="text-sm font-medium text-gray-600">đơn</p>
            </div>
          </motion.div>

          {/* Pending Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 pt-3 pb-4 px-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                </div>
                <p className="text-xs text-gray-600 font-medium">Chờ upload</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-xl font-bold text-gray-900">{stats.pendingUpload.toLocaleString('vi-VN')}</p>
              <p className="text-sm font-medium text-gray-600">đơn</p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Card */}
        <ModernCard className="overflow-hidden">
          <ModernCardContent>
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã hợp đồng, mã đơn hàng, khách hàng..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
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
          <>
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
                      Số tiền còn lại
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedContracts.map((contract) => (
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
                      <td className="px-3 py-2.5 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {(contract.remainingAmountToPay || 0).toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewContractDetail(contract)}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="Xem chi tiết hợp đồng"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {(contract.signedContractFileUrl || contract.contractFileUrl) ? (
                            <button
                              onClick={() => handleViewContractImage(contract)}
                              className="text-emerald-600 hover:text-emerald-900 transition-colors"
                              title="Xem ảnh hợp đồng đã ký"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleViewContract(contract)}
                              className="text-emerald-600 hover:text-emerald-900 transition-colors"
                              title="Xem hợp đồng HTML"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          
                          {!(contract.signedContractFileUrl || contract.contractFileUrl) ? (
                            <button
                              onClick={() => handleUploadClick(contract)}
                              disabled={uploadingContract === contract.contractId}
                              className="text-blue-600 hover:text-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Upload hợp đồng đã ký"
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
                              title="Quản lý thanh toán"
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredContracts.length}
                  showInfo={true}
                  itemLabel="hợp đồng"
                />
              </div>
            )}
          </>
        )}
      </div>
          </ModernCardContent>
        </ModernCard>
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
                <div className="space-y-3">
                  {/* File Info */}
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
                      onClick={handleCancelSelection}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Chọn lại file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-700">Preview ảnh:</p>
                        <button
                          onClick={() => setShowPreviewZoom(true)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                          title="Click để phóng to"
                        >
                          <Eye className="h-3 w-3" />
                          Phóng to
                        </button>
                      </div>
                      <div 
                        className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:border-blue-400 transition-colors"
                        onClick={() => setShowPreviewZoom(true)}
                        title="Click để phóng to"
                      >
                        <img 
                          src={previewUrl} 
                          alt="Preview hợp đồng"
                          className="w-full h-auto max-h-96 object-contain"
                        />
                      </div>
                      {!isConfirmed && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <p className="text-xs text-blue-700 flex-1">
                            Vui lòng xem lại ảnh và xác nhận đây là ảnh hợp đồng đúng trước khi upload.
                          </p>
                        </div>
                      )}
                      {isConfirmed && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <p className="text-xs text-green-700 flex-1">
                            Đã xác nhận ảnh hợp đồng. Bạn có thể upload ngay bây giờ.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PDF File Indicator */}
                  {selectedFile && selectedFile.type === 'application/pdf' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs font-medium text-blue-900">File PDF đã chọn</p>
                          <p className="text-xs text-blue-700">Vui lòng xác nhận để upload file PDF này.</p>
                        </div>
                      </div>
                    </div>
                  )}
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
                {selectedFile && !isConfirmed && (
                  <button
                    onClick={handleConfirmImage}
                    className="flex items-center px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md text-sm"
                  >
                    <CheckCircle className="h-3 w-3 mr-1.5" />
                    Xác nhận
                  </button>
                )}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !isConfirmed || uploadingContract === selectedContract.contractId}
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

      {/* Contract Detail Modal */}
      <AnimatePresence>
        {showContractDetailModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={handleCloseContractDetailModal}
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
              className="w-full max-w-6xl p-4 border shadow-lg rounded-lg bg-white max-h-[95vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <FileText className="h-6 w-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Chi tiết hợp đồng
                    </h3>
                  </div>
                  {contractDetail && (
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <span className="flex items-center">
                        <Tag className="h-3 w-3 mr-1" />
                        Mã: <span className="font-semibold ml-1">{contractDetail.contractCode || 'N/A'}</span>
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {contractDetail.contractDate ? new Date(contractDetail.contractDate).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCloseContractDetailModal}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {loadingContractDetail ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-600 mr-2" />
                  <span className="text-gray-600 font-medium text-sm">Đang tải chi tiết hợp đồng...</span>
                </div>
              ) : contractDetail ? (
                <div className="space-y-3">
                  {/* Contract Information */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileCheck className="h-4 w-4 text-purple-600" />
                      <h4 className="font-bold text-purple-900 text-sm">Thông tin hợp đồng</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-purple-700">Mã hợp đồng</p>
                        <p className="text-xs font-semibold text-purple-900">{contractDetail.contractCode || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-700">Ngày tạo hợp đồng</p>
                        <p className="text-xs font-semibold text-purple-900">
                          {contractDetail.contractDate ? new Date(contractDetail.contractDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-700">Trạng thái</p>
                        <div className="mt-0.5">
                          <StatusBadge status={contractDetail.status || 'PENDING'} size="sm" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-purple-700">Người upload</p>
                        <p className="text-xs font-semibold text-purple-900">{contractDetail.uploadedBy || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-700">Tiền đặt cọc</p>
                        <p className="text-xs font-semibold text-purple-900">
                          {(contractDetail.depositPrice || 0).toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-700">Tổng thanh toán</p>
                        <p className="text-xs font-semibold text-purple-900">
                          {(contractDetail.totalPayment || 0).toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-purple-700">Còn lại</p>
                        <p className="text-xs font-semibold text-purple-900">
                          {(contractDetail.remainPrice || 0).toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                      {contractDetail.contractFileUrl && (
                        <div>
                          <p className="text-xs text-purple-700">File hợp đồng</p>
                          <a 
                            href={contractDetail.contractFileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-900 underline"
                          >
                            Xem file
                          </a>
                        </div>
                      )}
                    </div>
                    {contractDetail.terms && (
                      <div className="mt-3 pt-3 border-t border-purple-200">
                        <p className="text-xs text-purple-700 mb-1">Điều khoản</p>
                        <p className="text-xs text-purple-900 whitespace-pre-wrap">{contractDetail.terms}</p>
                      </div>
                    )}
                  </div>

                  {/* Order Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Receipt className="h-4 w-4 text-blue-600" />
                      <h4 className="font-bold text-blue-900 text-sm">Thông tin đơn hàng</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-blue-700">Mã đơn hàng</p>
                        <p className="text-xs font-semibold text-blue-900">{contractDetail.orderCode || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Ngày đơn hàng</p>
                        <p className="text-xs font-semibold text-blue-900">
                          {contractDetail.orderDate ? new Date(contractDetail.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Trạng thái đơn hàng</p>
                        <div className="mt-0.5">
                          <StatusBadge status={contractDetail.orderStatus || 'PENDING'} size="sm" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Tổng giá đơn hàng</p>
                        <p className="text-xs font-semibold text-blue-900">
                          {(contractDetail.orderTotalPrice || 0).toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Phí dịch vụ và biển số</p>
                        <p className="text-xs font-semibold text-blue-900">
                          {(contractDetail.orderTotalTaxPrice || 0).toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Tổng khuyến mãi</p>
                        <p className="text-xs font-semibold text-blue-900">
                          {(contractDetail.orderTotalPromotionAmount || 0).toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-blue-700">Tổng thanh toán đơn hàng</p>
                        <p className="text-xs font-bold text-blue-900">
                          {(contractDetail.orderTotalPayment || 0).toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Information */}
                  {contractDetail.customer && (
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-bold text-emerald-900 text-sm">Thông tin khách hàng</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-emerald-700">Họ và tên</p>
                          <p className="text-xs font-semibold text-emerald-900">{contractDetail.customer.fullName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-emerald-700">Số điện thoại</p>
                          <p className="text-xs font-semibold text-emerald-900">{contractDetail.customer.phone || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-emerald-700">Email</p>
                          <p className="text-xs font-semibold text-emerald-900">{contractDetail.customer.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-emerald-700">CMND/CCCD</p>
                          <p className="text-xs font-semibold text-emerald-900">{contractDetail.customer.identificationNumber || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-emerald-700">Địa chỉ</p>
                          <p className="text-xs font-semibold text-emerald-900">{contractDetail.customer.address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Store Information */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Building2 className="h-4 w-4 text-orange-600" />
                      <h4 className="font-bold text-orange-900 text-sm">Thông tin cửa hàng</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-orange-700">Tên cửa hàng</p>
                        <p className="text-xs font-semibold text-orange-900">{contractDetail.storeName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-orange-700">Nhân viên</p>
                        <p className="text-xs font-semibold text-orange-900">{contractDetail.staffName || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-orange-700">Địa chỉ cửa hàng</p>
                        <p className="text-xs font-semibold text-orange-900">{contractDetail.storeAddress || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  {contractDetail.orderDetails && contractDetail.orderDetails.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5">
                        <h4 className="font-bold text-white flex items-center text-sm">
                          <ShoppingBag className="h-4 w-4 mr-1.5" />
                          Chi tiết sản phẩm
                        </h4>
                      </div>
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
                                Giảm giá
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Phí Biển Số và Dịch vụ
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Thành tiền
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {contractDetail.orderDetails.map((item, index) => (
                              <tr key={index} className="hover:bg-purple-50 transition-colors">
                                <td className="px-3 py-2">
                                  <div className="flex items-center">
                                    <div className="h-8 w-8 flex-shrink-0 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                                      <Package className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900 text-sm">{item.modelName || 'N/A'}</div>
                                      <div className="text-xs text-gray-500 flex items-center">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {item.colorName || 'N/A'} - {item.modelYear || 'N/A'} - {item.bodyType || 'N/A'} - {item.seatingCapacity || 'N/A'} chỗ
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md text-xs font-bold">
                                    {item.quantity || 0}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right text-xs font-semibold text-gray-900">
                                  {(item.unitPrice || 0).toLocaleString('vi-VN')}đ
                                </td>
                                <td className="px-3 py-2 text-right text-xs font-semibold text-orange-600">
                                  -{(item.discount || 0).toLocaleString('vi-VN')}đ
                                </td>
                                <td className="px-3 py-2 text-right text-xs font-semibold text-blue-600">
                                  +{(item.totalTax || 0).toLocaleString('vi-VN')}đ
                                </td>
                                <td className="px-3 py-2 text-right text-xs font-bold text-purple-600">
                                  {(item.totalPrice || 0).toLocaleString('vi-VN')}đ
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Payments */}
                  {contractDetail.payments && contractDetail.payments.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5">
                        <h4 className="font-bold text-white flex items-center text-sm">
                          <CreditCard className="h-4 w-4 mr-1.5" />
                          Lịch sử thanh toán
                        </h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Mã thanh toán
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Loại
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Phương thức
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Số tiền
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Còn lại
                              </th>
                              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Trạng thái
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Ngày tạo
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {contractDetail.payments.map((payment, index) => (
                              <tr key={index} className="hover:bg-green-50 transition-colors">
                                <td className="px-3 py-2 text-xs font-semibold text-gray-900">
                                  {payment.paymentCode || 'N/A'}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-900">
                                  {payment.paymentType || 'N/A'}
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-900">
                                  {payment.paymentMethod || 'N/A'}
                                </td>
                                <td className="px-3 py-2 text-right text-xs font-semibold text-green-600">
                                  {(payment.amount || 0).toLocaleString('vi-VN')}đ
                                </td>
                                <td className="px-3 py-2 text-right text-xs font-semibold text-gray-900">
                                  {(payment.remainPrice || 0).toLocaleString('vi-VN')}đ
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <StatusBadge status={payment.status || 'PENDING'} size="sm" />
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-900">
                                  {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Không thể tải chi tiết hợp đồng</p>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-3 border-t border-gray-200 mt-3">
                <button
                  onClick={handleCloseContractDetailModal}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for Contract Signed Image */}
      <AnimatePresence>
        {showContractImageModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={handleCloseContractImageModal}
          >
            {loadingContractImage ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center bg-white rounded-lg p-8"
              >
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
                <span className="text-gray-600 font-medium">Đang tải ảnh hợp đồng...</span>
              </motion.div>
            ) : contractImage ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                onClick={(e) => e.stopPropagation()}
                className="relative inline-block max-w-[90vw] max-h-[90vh]"
              >
                {/* Close Button - positioned close to image */}
                <button
                  onClick={handleCloseContractImageModal}
                  className="absolute -top-2 -right-2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-all shadow-lg"
                >
                  <X className="h-5 w-5" />
                </button>
                
                {/* Image */}
                <img 
                  src={contractImage} 
                  alt="Hợp đồng đã ký"
                  className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                  onError={(e) => {
                    console.error('Error loading contract image:', e);
                    error('Không thể tải ảnh hợp đồng. URL có thể không hợp lệ.');
                    setContractImage(null);
                  }}
                  onLoad={(e) => {
                    // Image loaded successfully
                    const img = e.target;
                    // Ensure image fits within viewport
                    const maxWidth = window.innerWidth * 0.9;
                    const maxHeight = window.innerHeight * 0.9;
                    
                    if (img.naturalWidth > maxWidth || img.naturalHeight > maxHeight) {
                      const ratio = Math.min(maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
                      img.style.maxWidth = `${img.naturalWidth * ratio}px`;
                      img.style.maxHeight = `${img.naturalHeight * ratio}px`;
                    }
                  }}
                />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 25
                }}
                onClick={(e) => e.stopPropagation()}
                className="flex flex-col items-center justify-center bg-white rounded-lg p-12"
              >
                <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Không có ảnh hợp đồng</h4>
                <p className="text-sm text-gray-600 text-center max-w-md">
                  Hợp đồng này chưa có ảnh đã ký. Vui lòng upload ảnh hợp đồng đã ký trước khi xem.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Zoom Modal */}
      <AnimatePresence>
        {showPreviewZoom && previewUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowPreviewZoom(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative inline-block max-w-[95vw] max-h-[95vh]"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPreviewZoom(false)}
                className="absolute -top-2 -right-2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 transition-all shadow-lg"
                title="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
              
              {/* Zoomed Image */}
              <img 
                src={previewUrl} 
                alt="Preview hợp đồng phóng to"
                className="max-w-full max-h-[95vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default ViewContracts;


