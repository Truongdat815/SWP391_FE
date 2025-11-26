import { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  CreditCard,
  CheckCircle2,
  Truck,
  Package,
  RefreshCw,
  ChevronRight,
  Calendar,
  AlertCircle,
  FileText,
  Eye,
  Receipt,
  XCircle,
  Upload,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Badge from '../../../components/ui/Badge';
import Dropdown from '../../../components/ui/Dropdown';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { TableSkeleton } from '../../../components/shared/SkeletonLoader';
import EmptyState from '../../../components/shared/EmptyState';
import Toast from '../../../components/shared/Toast';
import { useDebounce } from '../../../hooks/useDebounce';
import { useToast } from '../../../hooks/useToast';
import { useGetAllStoresQuery } from '../../../api/evmStaff/storeApi';
import {
  useGetAllInventoryTransactionsQuery,
  useGetInventoryTransactionByIdQuery,
  useGetInventoryTransactionStatusesQuery,
  useAcceptInventoryRequestMutation,
  useConfirmDeliveryMutation,
  useRejectInventoryRequestMutation,
  useStartShippingMutation,
  useConfirmPaymentMutation,
  useCancelInventoryRequestMutation,
  useGetContractQuery,
  useGetPaymentInfoQuery,
  useUploadVehicleExcelMutation,
} from '../../../api/evmStaff/inventoryApi';
import { getAuthFromStorage } from '../../../utils/roleUtils';

const DealerOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('all');
  const [dealerFilter, setDealerFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isViewReceiptModalOpen, setIsViewReceiptModalOpen] = useState(false);
  const [isPaymentInfoModalOpen, setIsPaymentInfoModalOpen] = useState(false);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState(null);
  const [isViewContractModalOpen, setIsViewContractModalOpen] = useState(false);
  const [selectedContractImage, setSelectedContractImage] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const [isUploadExcelModalOpen, setIsUploadExcelModalOpen] = useState(false);
  const [selectedExcelFile, setSelectedExcelFile] = useState(null);
  const [selectedTransactionForExcel, setSelectedTransactionForExcel] = useState(null);
  const [excelValidationError, setExcelValidationError] = useState(null);
  const [isValidatingExcel, setIsValidatingExcel] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, dealerFilter, timeRangeFilter]);

  // Auto-refresh transactions mỗi 10 giây và khi focus lại tab
  const { data: transactionsData, isLoading, error, refetch: refetchTransactions } = useGetAllInventoryTransactionsQuery(undefined, {
    pollingInterval: 10000, // Tự động refetch mỗi 10 giây
    refetchOnFocus: true, // Tự động refetch khi user quay lại tab
    refetchOnReconnect: true, // Tự động refetch khi reconnect
  });
  const { data: storesData, isLoading: isLoadingStores, error: storesError } = useGetAllStoresQuery();
  const { data: statusesData } = useGetInventoryTransactionStatusesQuery();
  // Auto-refresh transaction detail khi có transaction được chọn
  const { data: transactionDetail, isLoading: isLoadingDetail, refetch: refetchTransactionDetail } = useGetInventoryTransactionByIdQuery(
    selectedTransactionId,
    { 
      skip: !selectedTransactionId,
      pollingInterval: selectedTransactionId ? 10000 : 0, // Tự động refetch mỗi 10 giây nếu có transaction được chọn
      refetchOnFocus: true,
    }
  );

  const [acceptRequest] = useAcceptInventoryRequestMutation();
  const [confirmDelivery] = useConfirmDeliveryMutation();
  const [rejectRequest] = useRejectInventoryRequestMutation();
  const [startShipping] = useStartShippingMutation();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [cancelRequest] = useCancelInventoryRequestMutation();
  const [uploadVehicleExcel, { isLoading: isUploadingExcel }] = useUploadVehicleExcelMutation();
  const [isCreatingContract, setIsCreatingContract] = useState(false);
  const { data: contractData } = useGetContractQuery(selectedTransactionId, {
    skip: !selectedTransactionId,
    refetchOnFocus: true, // Tự động refetch khi focus lại tab
  });
  const { data: paymentInfoData, isLoading: isLoadingPaymentInfo, error: paymentInfoError } = useGetPaymentInfoQuery(selectedTransactionId, {
    skip: !selectedTransactionId || !isPaymentInfoModalOpen,
    refetchOnFocus: true, // Tự động refetch khi focus lại tab
  });
  // Hàm mở hợp đồng trong tab mới hoặc modal
  const handleViewContract = async (inventoryId, transaction = null) => {
    try {
      if (!inventoryId) {
        showToast('Không tìm thấy mã yêu cầu. Vui lòng thử lại sau.', 'error');
        return;
      }
      
      // Gọi API để lấy contract
      const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
      const url = `${baseUrl}/inventory-transactions/${inventoryId}/contract`;
      
      const authData = getAuthFromStorage('evmStaff');
      const token = authData?.token;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to fetch contract');
        showToast('Không thể tải hợp đồng: ' + errorText, 'error');
        return;
      }
      
      const data = await response.json();
      
      // Lấy contractFileUrl từ response
      // Response có thể là { data: { contractFileUrl: ... } } hoặc { contractFileUrl: ... }
      const contractFileUrl = data?.data?.contractFileUrl || data?.contractFileUrl;
      
      // Kiểm tra xem có HTML không (nếu không có contractFileUrl, có thể là HTML)
      const contractHtml = data?.data?.html || data?.html;
      
      // Nếu status là FILE_UPLOADED → luôn hiển thị modal (hợp đồng Manager đã upload)
      const isFileUploaded = transaction?.status === 'FILE_UPLOADED';
      
      if (contractFileUrl) {
        // Nếu có contractFileUrl (ảnh) → hiển thị trong modal
        setSelectedContractImage(contractFileUrl);
        setIsViewContractModalOpen(true);
      } else if (contractHtml && !isFileUploaded) {
        // Nếu có HTML → mở trong tab mới
        const fullHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Hợp Đồng</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', serif;
      padding: 20px;
      background-color: #f5f5f5;
      overflow-x: auto;
    }
    .contract-container {
      max-width: 100%;
      margin: 0 auto;
      background: white;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .contract-container {
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="contract-container">
    ${contractHtml}
  </div>
</body>
</html>`;
        
        // Tạo blob URL và mở trong tab mới
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, '_blank');
        
        // Cleanup blob URL sau khi window đóng
        if (newWindow) {
          newWindow.addEventListener('beforeunload', () => {
            URL.revokeObjectURL(blobUrl);
          });
        } else {
          // Nếu popup bị chặn, thử dùng cách khác
          showToast('Popup bị chặn. Vui lòng cho phép popup để xem hợp đồng.', 'warning');
          URL.revokeObjectURL(blobUrl);
        }
      } else {
        // Nếu không có cả contractFileUrl và HTML, thử gọi API HTML
        const htmlUrl = `${baseUrl}/inventory-transactions/${inventoryId}/contract/html`;
        const htmlResponse = await fetch(htmlUrl, {
          method: 'GET',
          headers: headers,
        });
        
        if (htmlResponse.ok) {
          const htmlText = await htmlResponse.text();
          const fullHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Hợp Đồng</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', serif;
      padding: 20px;
      background-color: #f5f5f5;
      overflow-x: auto;
    }
    .contract-container {
      max-width: 100%;
      margin: 0 auto;
      background: white;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .contract-container {
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="contract-container">
    ${htmlText}
  </div>
</body>
</html>`;
          
          // Tạo blob URL và mở trong tab mới
          const blob = new Blob([fullHtml], { type: 'text/html' });
          const blobUrl = URL.createObjectURL(blob);
          const newWindow = window.open(blobUrl, '_blank');
          
          // Cleanup blob URL sau khi window đóng
          if (newWindow) {
            newWindow.addEventListener('beforeunload', () => {
              URL.revokeObjectURL(blobUrl);
            });
          } else {
            showToast('Popup bị chặn. Vui lòng cho phép popup để xem hợp đồng.', 'warning');
            URL.revokeObjectURL(blobUrl);
          }
        } else {
          showToast('Không tìm thấy hợp đồng. Vui lòng thử lại sau.', 'error');
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error viewing contract:', error);
      }
      showToast('Có lỗi xảy ra khi xem hợp đồng', 'error');
    }
  };

  const isStoreNotFoundError = (err) => {
    return (
      err?.status === 404 &&
      (err?.data?.message?.includes('Không tìm thấy store') ||
        err?.data?.message?.includes('Not found') ||
        err?.data?.message?.includes('store'))
    );
  };

  const transactions = isStoreNotFoundError(error) ? [] : (transactionsData?.data || []);
  
  // Debug logging trong development
  // Removed debug logs to prevent data exposure
  const stores = storesData?.data || [];
  const statuses = statusesData?.data || [];

  const statusCounts = useMemo(() => {
    return {
      PENDING: transactions.filter((t) => t.status === 'PENDING' || t.status === 'DRAFT').length,
      CONFIRM_PAYMENT: transactions.filter((t) => t.status === 'ACCEPTED' || t.status === 'CONFIRMED').length,
      PROCESSING: transactions.filter((t) => t.status === 'PROCESSING').length,
      SHIPPING: transactions.filter((t) => t.status === 'SHIPPING').length,
      COMPLETED: transactions.filter((t) => t.status === 'COMPLETED' || t.status === 'DELIVERED').length,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        transaction.inventoryId?.toString().includes(debouncedSearchTerm) ||
        transaction.storeName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        transaction.modelName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'PENDING') {
          matchesStatus = transaction.status === 'PENDING' || transaction.status === 'DRAFT';
        } else if (statusFilter === 'ACCEPTED') {
          matchesStatus = transaction.status === 'ACCEPTED' || transaction.status === 'CONFIRMED';
        } else if (statusFilter === 'PROCESSING') {
          matchesStatus = transaction.status === 'PROCESSING';
        } else if (statusFilter === 'SHIPPING') {
          matchesStatus = transaction.status === 'SHIPPING';
        } else if (statusFilter === 'COMPLETED') {
          matchesStatus = transaction.status === 'COMPLETED' || transaction.status === 'DELIVERED';
        } else {
          matchesStatus = transaction.status === statusFilter;
        }
      }

      const matchesDealer =
        dealerFilter === 'all' || transaction.storeId?.toString() === dealerFilter;
      
      // Time range filter
      let matchesTimeRange = true;
      if (timeRangeFilter !== 'all') {
        const transactionDate = new Date(transaction.orderDate || transaction.createdAt);
        const now = new Date();
        if (timeRangeFilter === 'today') {
          matchesTimeRange = transactionDate.toDateString() === now.toDateString();
        } else if (timeRangeFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesTimeRange = transactionDate >= weekAgo;
        } else if (timeRangeFilter === 'month') {
          matchesTimeRange = transactionDate.getMonth() === now.getMonth() && 
                           transactionDate.getFullYear() === now.getFullYear();
        }
      }
      
      return matchesSearch && matchesStatus && matchesDealer && matchesTimeRange;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.orderDate || a.createdAt || 0);
      const dateB = new Date(b.orderDate || b.createdAt || 0);
      return dateB - dateA;
    });
  }, [transactions, debouncedSearchTerm, statusFilter, dealerFilter, timeRangeFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: { variant: 'default', label: 'Nháp' },
      PENDING: { variant: 'warning', label: 'Chờ xử lý' },
      CONFIRMED: { variant: 'info', label: 'Đã xác nhận' },
      ACCEPTED: { variant: 'info', label: 'Đã chấp nhận' },
      EVM_SIGNED: { variant: 'info', label: 'Chờ ký hợp đồng' },
      SIGNED: { variant: 'success', label: 'Đã ký hợp đồng' },
      CONTRACT_SIGNED: { variant: 'success', label: 'Đã ký hợp đồng' },
      FILE_UPLOADED: { variant: 'info', label: 'Đã upload hóa đơn' },
      PAYMENT_CONFIRMED: { variant: 'info', label: 'Đã xác nhận thanh toán' },
      PROCESSING: { variant: 'info', label: 'Đang xử lý' },
      IN_TRANSIT: { variant: 'info', label: 'Đang vận chuyển' },
      SHIPPING: { variant: 'info', label: 'Đang vận chuyển' },
      DELIVERED: { variant: 'success', label: 'Đã giao' },
      COMPLETED: { variant: 'success', label: 'Hoàn thành' },
      CANCELLED: { variant: 'error', label: 'Đã hủy' },
      REJECTED: { variant: 'error', label: 'Đã từ chối' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProgressSteps = (status) => {
    const steps = [
      { key: 'PENDING', label: 'Chờ xử lý', icon: Clock },
      { key: 'CONFIRM_PAYMENT', label: 'Thanh toán', icon: CreditCard },
      { key: 'PROCESSING', label: 'Đang xử lý', icon: CheckCircle2 },
      { key: 'SHIPPING', label: 'Vận chuyển', icon: Truck },
      { key: 'COMPLETED', label: 'Hoàn thành', icon: Package },
    ];

    // Map tất cả các status vào đúng step tương ứng
    const statusOrder = {
      // Step 0: Chờ xử lý
      PENDING: 0,
      DRAFT: 0,
      
      // Step 1: Thanh toán (EVM đã duyệt, đã tạo hợp đồng, Manager đã ký, đã upload hóa đơn, đã xác nhận thanh toán)
      ACCEPTED: 1,
      CONFIRMED: 1,
      EVM_SIGNED: 1,
      SIGNED: 1,
      CONTRACT_SIGNED: 1,
      FILE_UPLOADED: 1,
      PAYMENT_CONFIRMED: 1,
      
      // Step 2: Đang xử lý (EVM đã xác nhận thanh toán, đang chuẩn bị)
      PROCESSING: 2,
      
      // Step 3: Vận chuyển (đang vận chuyển)
      SHIPPING: 3,
      IN_TRANSIT: 3,
      
      // Step 4: Hoàn thành (đã giao, đã hoàn thành)
      DELIVERED: 4,
      COMPLETED: 4,
    };

    const currentStep = statusOrder[status] ?? 0;

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStep,
      active: index === currentStep,
    }));
  };

  const getActionButtons = (status, transaction) => {
    const buttons = [];
    
    // Nếu bị từ chối → không có nút gì
    if (status === 'REJECTED') {
      return buttons;
    }
    
    // Giai đoạn 1: Manager gửi yêu cầu (PENDING/DRAFT)
    if (status === 'PENDING' || status === 'DRAFT') {
      buttons.push({ text: 'Chấp nhận', type: 'accept' });
      return buttons;
    }
    
    // Giai đoạn 2: EVM đã duyệt (ACCEPTED/CONFIRMED) - Chờ tạo hợp đồng
    if (status === 'ACCEPTED' || status === 'CONFIRMED') {
      const isViewingDetail = selectedTransactionId === transaction.inventoryId;
      const contractInfo = isViewingDetail && contractData?.data 
        ? contractData.data 
        : null;
      
      const hasContract = contractInfo || 
                         transaction.contractId || 
                         transaction.contractFile || 
                         transaction.contractPath ||
                         transaction.contractUrl ||
                         transaction.contract;
      
      if (!hasContract) {
        buttons.push({ text: 'Tạo hợp đồng', type: 'createContract' });
      } else {
        buttons.push({ text: 'Xem hợp đồng', type: 'viewContract' });
      }
      return buttons;
    }
    
    // Giai đoạn 3: EVM đã tạo hợp đồng (EVM_SIGNED) - Chờ Manager ký
    if (status === 'EVM_SIGNED') {
      buttons.push({ text: 'Xem hợp đồng', type: 'viewContract' });
      return buttons;
    }
    
    // Giai đoạn 4: Manager đã upload hợp đồng (SIGNED/CONTRACT_SIGNED) - Chờ upload hóa đơn
    // Lưu ý: "Xem thông tin thanh toán" chỉ hiển thị ở Manager, không hiển thị ở EVM Staff
    if (status === 'SIGNED' || status === 'CONTRACT_SIGNED') {
      buttons.push({ text: 'Xem hợp đồng', type: 'viewContract' });
      return buttons;
    }
    
    // Giai đoạn 5: Manager đã upload hóa đơn (FILE_UPLOADED)
    if (status === 'FILE_UPLOADED') {
      // Luôn hiển thị nút "Xem hóa đơn đã thanh toán" khi status là FILE_UPLOADED
      // imageUrl là của hóa đơn thanh toán
      const hasReceipt = transaction.receiptImage ||
                        transaction.receiptPath ||
                        transaction.receiptUrl ||
                        transaction.receiptFile ||
                        transaction.receipt ||
                        transaction.imageUrl;
      
      if (hasReceipt) {
        buttons.push({ text: 'Xem hóa đơn đã thanh toán', type: 'viewReceipt' });
      }
      
      // Luôn hiển thị nút "Xem hợp đồng" (hợp đồng Manager đã upload) khi status là FILE_UPLOADED
      // Gọi API /inventory-transactions/{inventoryId}/contract để lấy contractFileUrl
      buttons.push({ text: 'Xem hợp đồng', type: 'viewContract' });
      
      // Kiểm tra có cả contract và receipt để xác nhận thanh toán
      if (hasReceipt) {
        buttons.push({ text: 'Xác nhận đã thanh toán', type: 'confirmPayment' });
      }
      
      return buttons;
    }
    
    // Giai đoạn 6: EVM đã xác nhận thanh toán (PAYMENT_CONFIRMED) - Chờ vận chuyển
    if (status === 'PAYMENT_CONFIRMED') {
      // Luôn hiển thị nút "Xem hợp đồng" (hợp đồng Manager đã upload)
      buttons.push({ text: 'Xem hợp đồng', type: 'viewContract' });
      
      // Luôn hiển thị nút "Xem hóa đơn thanh toán" khi status là PAYMENT_CONFIRMED
      // imageUrl là của hóa đơn thanh toán
      const hasReceipt = transaction.receiptImage ||
                        transaction.receiptPath ||
                        transaction.receiptUrl ||
                        transaction.receiptFile ||
                        transaction.receipt ||
                        transaction.imageUrl;
      
      if (hasReceipt) {
        buttons.push({ text: 'Xem hóa đơn thanh toán', type: 'viewReceipt' });
      }
      
      // Nút "Gửi file Excel xe" (thay thế "Bắt đầu vận chuyển")
      buttons.push({ text: 'Gửi file Excel xe', type: 'uploadVehicleExcel' });
      return buttons;
    }
    
    // Giai đoạn 7: Đang vận chuyển (SHIPPING/IN_TRANSIT)
    if (status === 'SHIPPING' || status === 'IN_TRANSIT') {
      // Luôn hiển thị nút "Xem hợp đồng" (hợp đồng Manager đã upload)
      buttons.push({ text: 'Xem hợp đồng', type: 'viewContract' });
      
      // Luôn hiển thị nút "Xem hóa đơn thanh toán"
      // imageUrl là của hóa đơn thanh toán
      const hasReceipt = transaction.receiptImage ||
                        transaction.receiptPath ||
                        transaction.receiptUrl ||
                        transaction.receiptFile ||
                        transaction.receipt ||
                        transaction.imageUrl;
      
      if (hasReceipt) {
        buttons.push({ text: 'Xem hóa đơn thanh toán', type: 'viewReceipt' });
      }
      
      return buttons;
    }
    
    // Giai đoạn 8: Đã giao (DELIVERED/COMPLETED)
    if (status === 'DELIVERED' || status === 'COMPLETED') {
      // Luôn hiển thị nút "Xem hợp đồng" (hợp đồng Manager đã upload)
      buttons.push({ text: 'Xem hợp đồng', type: 'viewContract' });
      
      // Luôn hiển thị nút "Xem hóa đơn thanh toán"
      // imageUrl là của hóa đơn thanh toán
      const hasReceipt = transaction.receiptImage ||
                        transaction.receiptPath ||
                        transaction.receiptUrl ||
                        transaction.receiptFile ||
                        transaction.receipt ||
                        transaction.imageUrl;
      
      if (hasReceipt) {
        buttons.push({ text: 'Xem hóa đơn thanh toán', type: 'viewReceipt' });
      }
      
      return buttons;
    }
    
    // Các status khác không có nút action đặc biệt
    return buttons;
  };

  const canStartShipping = (transaction) => {
    // Chỉ có thể start shipping khi:
    // 1. Status = PAYMENT_CONFIRMED (đã có hợp đồng và hóa đơn)
    // 2. Hoặc kiểm tra có contractFile/contractPath/contractUrl và receiptImage/receiptPath/receiptUrl
    const hasContract = transaction.contractFile || 
                       transaction.contractPath ||
                       transaction.contractUrl ||
                       transaction.contractId ||
                       transaction.contract;
    
    const hasReceipt = transaction.receiptImage ||
                      transaction.receiptPath ||
                      transaction.receiptUrl ||
                      transaction.receiptFile ||
                      transaction.receipt;
    
    return transaction.status === 'PAYMENT_CONFIRMED' ||
           (hasContract && hasReceipt);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'N/A';
    }
  };

  const handleAcceptTransaction = async (inventoryId) => {
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn chấp nhận yêu cầu này?',
      onConfirm: async () => {
        try {
          await acceptRequest(inventoryId).unwrap();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          showToast('Đã chấp nhận yêu cầu thành công!', 'success');
        } catch (error) {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi chấp nhận yêu cầu';
          showToast(errorMessage, 'error');
        }
      },
    });
  };

  const handleRejectTransaction = async (inventoryId) => {
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn từ chối yêu cầu này?',
      onConfirm: async () => {
        try {
          await rejectRequest(inventoryId).unwrap();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          showToast('Đã từ chối yêu cầu thành công!', 'success');
        } catch (error) {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi từ chối yêu cầu';
          showToast(errorMessage, 'error');
        }
      },
    });
  };

  const handleConfirmDelivery = async (inventoryId) => {
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn xác nhận đã giao hàng?',
      onConfirm: async () => {
        try {
          await confirmDelivery(inventoryId).unwrap();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          showToast('Đã xác nhận giao hàng thành công!', 'success');
        } catch (error) {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi xác nhận giao hàng';
          showToast(errorMessage, 'error');
        }
      },
    });
  };

  const handleStartShipping = async (inventoryId, transaction) => {
    // Kiểm tra điều kiện trước khi cho phép shipping
    if (!canStartShipping(transaction)) {
      showToast('Chưa thể vận chuyển. Vui lòng đảm bảo đã có hợp đồng đã ký và hóa đơn thanh toán.', 'warning');
      return;
    }

    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn bắt đầu vận chuyển xe? Xe sẽ được gửi tới đại lý.',
      onConfirm: async () => {
        try {
          await startShipping(inventoryId).unwrap();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          showToast('Đã bắt đầu vận chuyển thành công! Xe đang trên đường tới đại lý.', 'success');
        } catch (error) {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi bắt đầu vận chuyển';
          showToast(errorMessage, 'error');
        }
      },
    });
  };

  // Validate Excel file trước khi upload
  const validateExcelFile = (file, expectedQuantity) => {
    return new Promise((resolve, reject) => {
      // File validation - logs removed to prevent data exposure
      
      // Kiểm tra file trước khi đọc
      if (!file) {
        reject({
          type: 'READ_ERROR',
          message: 'Không có file được chọn. Vui lòng chọn file Excel.'
        });
        return;
      }
      
      // Kiểm tra định dạng file
      const validExtensions = ['.xlsx', '.xls'];
      const fileName = file.name.toLowerCase();
      const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidExtension) {
        reject({
          type: 'READ_ERROR',
          message: 'File không đúng định dạng. Vui lòng chọn file Excel (.xlsx hoặc .xls).'
        });
        return;
      }
      
      // Kiểm tra kích thước file (tối đa 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        reject({
          type: 'READ_ERROR',
          message: `File quá lớn (${(file.size / 1024 / 1024).toFixed(2)}MB). Kích thước tối đa: 10MB.`
        });
        return;
      }
      
      if (file.size === 0) {
        reject({
          type: 'READ_ERROR',
          message: 'File rỗng. Vui lòng chọn file Excel có dữ liệu.'
        });
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          if (!e.target || !e.target.result) {
            throw new Error('Không thể đọc dữ liệu từ file');
          }
          
          const data = new Uint8Array(e.target.result);
          
          if (!data || data.length === 0) {
            throw new Error('File không chứa dữ liệu');
          }
          
          // Kiểm tra magic bytes để xác nhận đây là Excel file
          // Excel file (.xlsx) bắt đầu với PK (ZIP format)
          // Excel file (.xls) có signature khác
          const isXLSX = data[0] === 0x50 && data[1] === 0x4B; // PK (ZIP signature)
          const isXLS = data[0] === 0xD0 && data[1] === 0xCF && data[2] === 0x11 && data[3] === 0xE0; // OLE2 signature
          
          if (!isXLSX && !isXLS) {
            if (import.meta.env.DEV) {
              console.error('File signature check failed:', {
                firstBytes: Array.from(data.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '),
                fileName: file.name
              });
            }
            throw new Error('File không phải là định dạng Excel hợp lệ. Vui lòng đảm bảo file là .xlsx hoặc .xls');
          }
          
          // File signature validated
          
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('File Excel không có sheet nào');
          }
          
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          
          if (!firstSheet) {
            throw new Error('Không thể đọc sheet đầu tiên');
          }
          
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          // Bỏ qua header row (row đầu tiên) và filter bỏ các dòng trống
          const dataRows = jsonData.slice(1).filter(row => {
            // Dòng hợp lệ phải có ít nhất 1 cell không rỗng
            return row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
          });
          
          // Validate số lượng
          if (dataRows.length !== expectedQuantity) {
            reject({
              type: 'QUANTITY_MISMATCH',
              message: `Số lượng xe trong Excel (${dataRows.length}) không khớp với số lượng đặt (${expectedQuantity})`,
              expected: expectedQuantity,
              actual: dataRows.length
            });
            return;
          }
          
          // Validate format và check duplicate
          const vehicles = [];
          const vins = new Set();
          const engineNumbers = new Set();
          const batterySerials = new Set();
          const errors = [];
          
          dataRows.forEach((row, index) => {
            const vin = String(row[0] || '').trim();
            const engineNumber = String(row[1] || '').trim();
            const batterySerial = String(row[2] || '').trim();
            
            // Validate format
            if (vin.length !== 17) {
              errors.push(`Dòng ${index + 2}: Mã VIN phải có đúng 17 ký tự (hiện tại: ${vin.length})`);
            }
            if (engineNumber.length !== 6) {
              errors.push(`Dòng ${index + 2}: Số máy phải có đúng 6 ký tự (hiện tại: ${engineNumber.length})`);
            }
            if (batterySerial.length !== 10) {
              errors.push(`Dòng ${index + 2}: Số seri pin phải có đúng 10 ký tự (hiện tại: ${batterySerial.length})`);
            }
            
            // Check duplicate trong file
            if (vins.has(vin)) {
              errors.push(`Dòng ${index + 2}: Mã VIN "${vin}" bị trùng trong file`);
            }
            if (engineNumbers.has(engineNumber)) {
              errors.push(`Dòng ${index + 2}: Số máy "${engineNumber}" bị trùng trong file`);
            }
            if (batterySerials.has(batterySerial)) {
              errors.push(`Dòng ${index + 2}: Số seri pin "${batterySerial}" bị trùng trong file`);
            }
            
            vins.add(vin);
            engineNumbers.add(engineNumber);
            batterySerials.add(batterySerial);
            
            vehicles.push({ vin, engineNumber, batterySerial });
          });
          
          if (errors.length > 0) {
            reject({
              type: 'VALIDATION_ERROR',
              message: 'File Excel có lỗi xác thực',
              errors: errors
            });
            return;
          }
          
          resolve(vehicles);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('Error parsing Excel file:', error);
          }
          reject({
            type: 'PARSE_ERROR',
            message: `Không thể đọc file Excel: ${error.message || 'Vui lòng kiểm tra định dạng file.'}`,
            error: error.message
          });
        }
      };
      
      reader.onerror = (error) => {
        if (import.meta.env.DEV) {
          console.error('FileReader error:', error);
          console.error('File details:', {
            name: file.name,
            size: file.size,
            type: file.type
          });
        }
        reject({ 
          type: 'READ_ERROR', 
          message: `Không thể đọc file "${file.name}". Vui lòng kiểm tra file có bị hỏng hoặc đang được sử dụng bởi ứng dụng khác không.` 
        });
      };
      
      reader.onabort = () => {
        reject({
          type: 'READ_ERROR',
          message: 'Đọc file bị hủy. Vui lòng thử lại.'
        });
      };
      
      try {
        // Kiểm tra xem FileReader có được hỗ trợ không
        if (typeof FileReader === 'undefined') {
          reject({
            type: 'READ_ERROR',
            message: 'Trình duyệt không hỗ trợ đọc file. Vui lòng sử dụng trình duyệt khác.'
          });
          return;
        }
        
        // Starting file read
        
        reader.readAsArrayBuffer(file);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error starting file read:', error);
          console.error('Error stack:', error.stack);
        }
        reject({
          type: 'READ_ERROR',
          message: `Không thể bắt đầu đọc file: ${error.message || 'Vui lòng thử lại.'}`
        });
      }
    });
  };

  // Handler mở modal upload Excel
  const handleUploadVehicleExcel = (inventoryId, transaction) => {
    setSelectedTransactionForExcel({ inventoryId, transaction });
    setSelectedExcelFile(null);
    setExcelValidationError(null);
    setIsUploadExcelModalOpen(true);
  };

  // Handler submit Excel
  const handleSubmitExcel = async () => {
    if (!selectedExcelFile) {
      showToast('Vui lòng chọn file Excel', 'error');
      return;
    }
    
    // File info validation - logs removed to prevent data exposure
    
    const expectedQuantity = selectedTransactionForExcel.transaction.importQuantity || 
                            selectedTransactionForExcel.transaction.quantity;
    
    setIsValidatingExcel(true);
    setExcelValidationError(null);
    
    try {
      // Validate trước khi upload
      await validateExcelFile(selectedExcelFile, expectedQuantity);
      
      // Uploading Excel file to server
      
      const uploadResult = await uploadVehicleExcel({
        inventoryId: selectedTransactionForExcel.inventoryId,
        file: selectedExcelFile
      }).unwrap();
      
      // Upload successful - response logged only on error
      
      // Kiểm tra xem backend có trả về lỗi trong message không (dù code là 201)
      // Backend có thể trả về code 201 nhưng message chứa lỗi
      if (uploadResult?.message && (
        uploadResult.message.includes('Không thể nhập dữ liệu') ||
        uploadResult.message.includes('bị trùng') ||
        uploadResult.message.includes('duplicate') ||
        uploadResult.message.includes('UNIQUE KEY constraint') ||
        uploadResult.message.includes('constraint violation')
      )) {
        // Đây là lỗi, throw error để xử lý trong catch block
        // KHÔNG tiếp tục xử lý (không gọi startShipping, không refresh, không show success)
        throw {
          data: {
            code: uploadResult.code || 400,
            message: uploadResult.message,
            error: 'VALIDATION_ERROR'
          }
        };
      }
      
      // Sau khi upload thành công, kiểm tra số lượng vehicles để đảm bảo không vượt quá số lượng đặt
      try {
        // Đợi một chút để backend xử lý xong
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refetch để kiểm tra số lượng vehicles thực tế
        const refetchResult = await refetchTransactions();
        const currentTransaction = refetchResult?.data?.data?.find(
          t => t.inventoryId === selectedTransactionForExcel.inventoryId
        );
        
        if (currentTransaction && currentTransaction.vehicles) {
          const actualVehicleCount = currentTransaction.vehicles.length;
          
          // Nếu số lượng vehicles vượt quá số lượng đặt, báo lỗi
          if (actualVehicleCount > expectedQuantity) {
            throw {
              data: {
                code: 400,
                message: `Số lượng xe đã nhập (${actualVehicleCount}) vượt quá số lượng đặt (${expectedQuantity}). Có thể do upload nhiều lần hoặc dữ liệu bị trùng. Vui lòng liên hệ quản trị viên.`,
                error: 'QUANTITY_EXCEEDED'
              }
            };
          }
        }
      } catch (checkError) {
        // Nếu là lỗi quantity exceeded, throw lại
        if (checkError?.data?.error === 'QUANTITY_EXCEEDED') {
          throw checkError;
        }
        // Các lỗi khác (network, etc.) thì ignore, vì upload đã thành công
      }
      
      // Kiểm tra xem backend có tự động chuyển status không
      // Nếu không, gọi API startShipping để chuyển status sang IN_TRANSIT
      try {
        // Đợi một chút để backend xử lý xong
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refetch để kiểm tra status hiện tại
        const refetchResult = await refetchTransactions();
        const currentTransaction = refetchResult?.data?.data?.find(
          t => t.inventoryId === selectedTransactionForExcel.inventoryId
        );
        
          // Checking transaction status
        
        // Nếu status chưa phải IN_TRANSIT, gọi API startShipping
        if (currentTransaction && currentTransaction.status !== 'IN_TRANSIT' && currentTransaction.status !== 'SHIPPING') {
          try {
            await startShipping(selectedTransactionForExcel.inventoryId).unwrap();
          } catch (startShippingError) {
            if (import.meta.env.DEV) {
              console.warn('Failed to call startShipping:', startShippingError);
            }
            // Không throw error, vì có thể backend đã tự động chuyển status
          }
        }
      } catch (checkError) {
        // Ignore error, vẫn tiếp tục
        if (import.meta.env.DEV) {
          console.warn('Error checking status:', checkError);
        }
      }
      
      setIsUploadExcelModalOpen(false);
      setSelectedExcelFile(null);
      setExcelValidationError(null);
      
      // Force refresh transactions ngay lập tức để cập nhật status
      setTimeout(async () => {
        try {
          // Refetch ngay lập tức
          const refetchResult = await refetchTransactions();
          
          // Refetch completed - status updated
          
          // Nếu đang xem transaction detail, refetch luôn
          if (selectedTransactionId === selectedTransactionForExcel.inventoryId) {
            try {
              await refetchTransactionDetail();
            } catch (err) {
              // Ignore nếu không có transaction detail
            }
          }
        } catch (refetchError) {
          // Ignore refetch error, invalidatesTags sẽ tự động refresh sau
          if (import.meta.env.DEV) {
            console.warn('Failed to refetch transactions:', refetchError);
          }
        }
      }, 1000); // Đợi 1 giây để backend xử lý xong
      
      showToast('Đã gửi file Excel thành công! Trạng thái đã chuyển sang đang vận chuyển.', 'success');
    } catch (error) {
      // Log chi tiết lỗi để debug
      if (import.meta.env.DEV) {
        console.error('Excel upload error:', error);
        console.error('Error type:', error?.type);
        console.error('Error data:', error?.data);
        console.error('Error message:', error?.message);
      }
      
      if (error.type === 'QUANTITY_MISMATCH') {
        setExcelValidationError({
          type: 'quantity',
          message: error.message,
          expected: error.expected,
          actual: error.actual
        });
      } else if (error.type === 'VALIDATION_ERROR' || error.type === 'PARSE_ERROR' || error.type === 'READ_ERROR') {
        setExcelValidationError({
          type: 'validation',
          message: error.message,
          errors: error.errors || []
        });
      } else if (error?.data?.error === 'VALIDATION_ERROR' || error?.data?.error === 'QUANTITY_EXCEEDED' || error?.data?.errorMessage === 'VALIDATION_ERROR' || error?.data?.message?.includes('Không thể nhập dữ liệu')) {
        // Lỗi từ backend (duplicate trong database hoặc validation khác)
        let errorMessage = error.data.message || error.data.errorMessage || 'File Excel không hợp lệ';
        
        // Xử lý lỗi NullPointerException - Vehicle.getStatus() is null
        if (errorMessage.includes('getStatus()') || errorMessage.includes('VehicleStatus') || errorMessage.includes('is null') || errorMessage.includes('NullPointerException')) {
          errorMessage = 'Lỗi hệ thống: Backend không thể xử lý dữ liệu xe do thiếu thông tin trạng thái. Vui lòng liên hệ quản trị viên để kiểm tra và sửa lỗi backend. Lỗi kỹ thuật: ' + errorMessage;
        } else {
          // Parse message để tìm giá trị bị trùng
          let duplicateValue = '';
          const valueMatch = errorMessage.match(/duplicate key value is \(([^)]+)\)/i) || 
                            errorMessage.match(/value is \(([^)]+)\)/i) ||
                            errorMessage.match(/\(([A-Z0-9]+)\)/);
          
          if (valueMatch && valueMatch[1]) {
            duplicateValue = valueMatch[1];
          }
          
          // Parse để xác định loại dữ liệu bị trùng (VIN, battery, engine)
          let duplicateType = 'dữ liệu';
          if (errorMessage.includes('battery') || errorMessage.includes('battery_no')) {
            duplicateType = 'Số seri pin';
          } else if (errorMessage.includes('vin')) {
            duplicateType = 'Mã VIN';
          } else if (errorMessage.includes('engine') || errorMessage.includes('engine_no')) {
            duplicateType = 'Số máy';
          }
          
          if (duplicateValue) {
            errorMessage = `Dữ liệu trong file Excel bị trùng với dữ liệu đã có trong hệ thống. ${duplicateType} bị trùng: ${duplicateValue}. Vui lòng kiểm tra lại file Excel.`;
          } else if (!errorMessage.includes('Dữ liệu trong file Excel bị trùng')) {
            // Nếu message chưa có tiếng Việt, thêm vào
            errorMessage = `Dữ liệu trong file Excel bị trùng hoặc không hợp lệ. ${errorMessage}`;
          }
        }
        
        setExcelValidationError({
          type: 'backend',
          message: errorMessage,
          details: error.data.details
        });
      } else {
        // Lỗi từ backend hoặc network
        let errorMessage = error?.data?.message || 
                          error?.data?.errorMessage || 
                          error?.data?.error || 
                          error?.message || 
                          'Có lỗi xảy ra khi upload file Excel. Vui lòng thử lại.';
        
        // Xử lý lỗi JavaScript (Cannot access before initialization, etc.)
        if (errorMessage.includes('Cannot access') || 
            errorMessage.includes('before initialization') ||
            errorMessage.includes('is not defined') ||
            errorMessage.includes('ReferenceError')) {
          errorMessage = 'Có lỗi xảy ra khi xử lý file Excel. Vui lòng thử lại hoặc liên hệ quản trị viên.';
        }
        
        // Xử lý lỗi 404 Not Found - Backend chưa implement API
        if (error?.status === 404 || error?.data?.status === 404 || errorMessage.includes('Not Found') || errorMessage.includes('404')) {
          errorMessage = 'API endpoint chưa được implement ở backend. Vui lòng liên hệ backend developer để implement endpoint: POST /vehicles/import/{transactionId}';
        }
        
        // Xử lý lỗi 417 Expectation Failed - Backend validation error
        if (error?.status === 417 || error?.data?.status === 417 || error?.statusCode === 417) {
          if (errorMessage.includes('getStatus()') || errorMessage.includes('VehicleStatus') || errorMessage.includes('is null')) {
            errorMessage = 'Lỗi hệ thống: Backend không thể xử lý dữ liệu xe do thiếu thông tin trạng thái. Vui lòng liên hệ quản trị viên để kiểm tra và sửa lỗi backend.';
          } else {
            errorMessage = 'Lỗi xác thực từ backend: ' + (errorMessage || 'Backend không thể xử lý dữ liệu. Vui lòng kiểm tra lại file Excel hoặc liên hệ quản trị viên.');
          }
        }
        
        // Xử lý lỗi duplicate key constraint - chuyển sang tiếng Việt
        if (errorMessage.includes('UNIQUE KEY constraint') || 
            errorMessage.includes('duplicate key') || 
            errorMessage.includes('Cannot insert duplicate key')) {
          
          // Parse để tìm giá trị bị trùng
          let duplicateValue = '';
          const valueMatch = errorMessage.match(/duplicate key value is \(([^)]+)\)/i) || 
                            errorMessage.match(/value is \(([^)]+)\)/i);
          
          if (valueMatch && valueMatch[1]) {
            duplicateValue = valueMatch[1];
          }
          
          if (duplicateValue) {
            errorMessage = `Dữ liệu trong file Excel bị trùng với dữ liệu đã có trong hệ thống. Giá trị bị trùng: ${duplicateValue}. Vui lòng kiểm tra lại file Excel.`;
          } else {
            errorMessage = 'Dữ liệu trong file Excel bị trùng với dữ liệu đã có trong hệ thống. Vui lòng kiểm tra lại file Excel.';
          }
        }
        
        setExcelValidationError({
          type: 'unknown',
          message: errorMessage
        });
      }
      
      // Reset loading state
      setIsValidatingExcel(false);
    } finally {
      setIsValidatingExcel(false);
    }
  };

  const handleCreateContract = async (inventoryId) => {
    // Kiểm tra xem transaction đã có contract chưa
    const transaction = transactions.find(t => t.inventoryId === inventoryId);
    if (transaction) {
      const hasContract = transaction.contractId || 
                         transaction.contractFile || 
                         transaction.contractPath ||
                         transaction.contractUrl ||
                         transaction.contract;
      
      if (hasContract) {
        showToast('Hợp đồng cho giao dịch tồn kho này đã tồn tại', 'error');
        return;
      }
    }

    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn tạo hợp đồng cho yêu cầu này?',
      onConfirm: async () => {
        setIsCreatingContract(true);
        try {
          // Sử dụng fetch trực tiếp để tránh RTK Query tự động thêm Content-Type header
          const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
          const url = `${baseUrl}/inventory-transactions/${inventoryId}/create-contract`;
          
          // Lấy token từ sessionStorage
          const authData = getAuthFromStorage('evmStaff');
          const token = authData?.token;
          
          const headers = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          // KHÔNG thêm Content-Type header
          
          const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            // KHÔNG có body
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to create contract' }));
            throw { status: response.status, data: errorData };
          }
          
          const result = await response.json();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          setIsCreatingContract(false);
          showToast('Đã tạo hợp đồng thành công! Hợp đồng đã được ký và gửi tới Manager.', 'success');
          
          // Refresh transactions để cập nhật UI (status sẽ chuyển thành EVM_SIGNED)
          try {
            await refetchTransactions();
          } catch (refetchError) {
            // Ignore refetch error, invalidatesTags sẽ tự động refresh
            if (import.meta.env.DEV) {
              console.warn('Failed to refetch transactions:', refetchError);
            }
          }
          
          // Đợi một chút để đảm bảo hợp đồng đã được tạo xong trên server
          // Sau đó mở hợp đồng trong tab mới
          setTimeout(() => {
            handleViewContract(inventoryId);
            
            // Log để debug (nếu cần)
            // Contract created successfully
          }, 500); // Đợi 500ms để server xử lý xong
        } catch (error) {
          setIsCreatingContract(false);
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          // Log chi tiết lỗi để debug
          if (import.meta.env.DEV) {
            console.error('Error creating contract:', error);
            console.error('Error details:', {
              status: error?.status,
              data: error?.data,
              message: error?.message,
            });
          }
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi tạo hợp đồng';
          showToast(errorMessage, 'error');
        }
      },
    });
  };


  const handleConfirmPayment = async (inventoryId) => {
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn xác nhận thanh toán?',
      onConfirm: async () => {
        try {
          await confirmPayment(inventoryId).unwrap();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          showToast('Đã xác nhận thanh toán thành công!', 'success');
        } catch (error) {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi xác nhận thanh toán';
          showToast(errorMessage, 'error');
        }
      },
    });
  };

  if (isLoading || isLoadingStores) {
    return (
      <EVMStaffLayout>
        <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <TableSkeleton rows={8} columns={9} />
          </div>
        </div>
      </EVMStaffLayout>
    );
  }

  const isUnauthorized = error?.status === 401 || storesError?.status === 401;

  if (isUnauthorized) {
    return (
      <EVMStaffLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-yellow-600 text-lg font-medium">
            ⚠️ Bạn chưa đăng nhập hoặc token đã hết hạn
          </div>
          <div className="text-gray-600 text-sm">
            Vui lòng đăng nhập để truy cập các tính năng này.
          </div>
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Đi đến trang đăng nhập
          </a>
        </div>
      </EVMStaffLayout>
    );
  }

  const hasError = error && !isStoreNotFoundError(error);

  if (hasError && !isUnauthorized) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>
        </div>
      </EVMStaffLayout>
    );
  }

  return (
    <EVMStaffLayout>
      <motion.div
        className="space-y-6 p-6 bg-gray-50/50 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Quản lý đơn hàng
            </h1>
            <p className="text-gray-600 mt-1">Theo dõi và xử lý đơn hàng từ đại lý</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-white shadow-sm hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Cập nhật
          </Button>
        </div>

        {/* Filters & Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          <div className="flex overflow-x-auto scrollbar-hide p-1 gap-1">
            {[
              { key: 'all', label: 'Tất cả', count: transactions.length },
              { key: 'PENDING', label: 'Chờ xử lý', count: statusCounts.PENDING },
              { key: 'ACCEPTED', label: 'Thanh toán', count: statusCounts.CONFIRM_PAYMENT },
              { key: 'PROCESSING', label: 'Đang xử lý', count: statusCounts.PROCESSING },
              { key: 'SHIPPING', label: 'Vận chuyển', count: statusCounts.SHIPPING },
              { key: 'COMPLETED', label: 'Hoàn thành', count: statusCounts.COMPLETED },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2
                  ${statusFilter === tab.key
                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                {tab.label}
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  ${statusFilter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'}
                `}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Advanced Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Tìm kiếm theo Mã đơn, Đại lý, Mẫu xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="flex gap-2">
            <Dropdown
              options={[
                { value: 'all', label: 'Tất cả thời gian' },
                { value: 'today', label: 'Hôm nay' },
                { value: 'week', label: 'Tuần này' },
                { value: 'month', label: 'Tháng này' },
              ]}
              value={timeRangeFilter}
              onChange={setTimeRangeFilter}
              className="w-48 min-w-[180px]"
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Tất cả đại lý' },
                ...stores.map((store) => ({
                  value: store.storeId?.toString(),
                  label: store.storeName || `Store ${store.storeId}`,
                })),
              ]}
              value={dealerFilter}
              onChange={setDealerFilter}
              className="w-48"
            />
          </div>
        </div>

        {/* Order Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait">
            {paginatedTransactions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState
                  icon="package"
                  title="Không có đơn hàng"
                  message={
                    filteredTransactions.length === 0
                      ? "Hiện tại không có đơn hàng nào từ đại lý. Các đơn hàng sẽ hiển thị tại đây khi có."
                      : "Không tìm thấy đơn hàng phù hợp với bộ lọc của bạn. Hãy thử thay đổi bộ lọc."
                  }
                />
              </motion.div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Mã ĐH
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Đại lý
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Sản phẩm
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        SL
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Ngày đặt
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tiến trình
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedTransactions.map((transaction, index) => {
                      const progressSteps = getProgressSteps(transaction.status);
                      const actionButtons = getActionButtons(transaction.status, transaction);
                      
                      // Status and buttons checked - logs removed to prevent data exposure

                      return (
                        <motion.tr
                          key={transaction.inventoryId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                              #{transaction.inventoryId}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.storeName || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{transaction.modelName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{transaction.colorName || 'N/A'}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {(() => {
                                // Kiểm tra cả null/undefined, không skip khi === 0
                                const quantity = transaction.importQuantity !== null && transaction.importQuantity !== undefined ? transaction.importQuantity :
                                               transaction.quantity !== null && transaction.quantity !== undefined ? transaction.quantity :
                                               transaction.requestedQuantity !== null && transaction.requestedQuantity !== undefined ? transaction.requestedQuantity :
                                               transaction.orderQuantity !== null && transaction.orderQuantity !== undefined ? transaction.orderQuantity :
                                               transaction.requestQuantity !== null && transaction.requestQuantity !== undefined ? transaction.requestQuantity :
                                               0;
                                return quantity;
                              })()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600">
                              {formatDate(transaction.orderDate)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              {(() => {
                                // Đọc trực tiếp từ response - ưu tiên các field có thể có
                                // Parse để đảm bảo là number, không skip giá trị 0
                                let totalPrice = null;
                                
                                if (transaction.totalPrice !== null && transaction.totalPrice !== undefined) {
                                  totalPrice = parseFloat(transaction.totalPrice) || 0;
                                } else if (transaction.totalBasePrice !== null && transaction.totalBasePrice !== undefined) {
                                  totalPrice = parseFloat(transaction.totalBasePrice) || 0;
                                } else if (transaction.totalAmount !== null && transaction.totalAmount !== undefined) {
                                  totalPrice = parseFloat(transaction.totalAmount) || 0;
                                } else if (transaction.price !== null && transaction.price !== undefined) {
                                  totalPrice = parseFloat(transaction.price) || 0;
                                }
                                
                                // Nếu không có totalPrice, tính từ unitPrice * quantity
                                if (totalPrice === null || totalPrice === undefined || (totalPrice === 0 && transaction.importQuantity > 0)) {
                                  const unitPrice = parseFloat(transaction.unitPrice || transaction.unitBasePrice || transaction.price || transaction.modelColorPrice || 0) || 0;
                                  const quantity = parseFloat(transaction.importQuantity || transaction.quantity || transaction.requestedQuantity || transaction.orderQuantity || transaction.requestQuantity || 0) || 0;
                                  const calculated = unitPrice * quantity;
                                  
                                  // Chỉ dùng calculated nếu totalPrice thực sự không có (null/undefined)
                                  if (totalPrice === null || totalPrice === undefined) {
                                    // Price calculated
                                    
                                    return formatCurrency(calculated);
                                  }
                                }
                                
                                // Using direct price
                                
                                return formatCurrency(totalPrice || 0);
                              })()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {progressSteps.map((step, idx) => {
                                const Icon = step.icon;
                                return (
                                  <div
                                    key={idx}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${step.completed
                                        ? step.active
                                          ? 'bg-blue-500 border-blue-600 text-white'
                                          : 'bg-blue-500 border-blue-600 text-white'
                                        : 'bg-gray-100 border-gray-300 text-gray-400'
                                      }`}
                                    title={step.label}
                                  >
                                    <Icon size={12} />
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {getStatusBadge(transaction.status)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2 flex-nowrap whitespace-nowrap">
                              {actionButtons.map((btn, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    if (btn.type === 'accept') {
                                      handleAcceptTransaction(transaction.inventoryId);
                                    } else if (btn.type === 'createContract') {
                                      handleCreateContract(transaction.inventoryId);
                                    } else if (btn.type === 'viewContract') {
                                      handleViewContract(transaction.inventoryId, transaction);
                                    } else if (btn.type === 'viewPaymentInfo') {
                                      setSelectedTransactionId(transaction.inventoryId);
                                      setIsPaymentInfoModalOpen(true);
                                    } else if (btn.type === 'viewReceipt') {
                                      // imageUrl là của hóa đơn thanh toán
                                      const receiptImage = transaction.receiptImage || 
                                                         transaction.receiptFile || 
                                                         transaction.receiptPath || 
                                                         transaction.receiptUrl ||
                                                         transaction.imageUrl;
                                      setSelectedReceiptImage(receiptImage);
                                      setIsViewReceiptModalOpen(true);
                                    } else if (btn.type === 'confirmPayment') {
                                      handleConfirmPayment(transaction.inventoryId);
                                    } else if (btn.type === 'startShipping') {
                                      handleStartShipping(transaction.inventoryId, transaction);
                                    } else if (btn.type === 'uploadVehicleExcel') {
                                      handleUploadVehicleExcel(transaction.inventoryId, transaction);
                                    }
                                  }}
                                  disabled={btn.type === 'createContract' && isCreatingContract}
                                  className={`
                                    p-2 rounded-lg transition-colors flex items-center justify-center
                                    ${btn.type === 'accept' ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed' : ''}
                                    ${btn.type === 'createContract' ? 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed' : ''}
                                    ${btn.type === 'viewContract' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
                                    ${btn.type === 'viewPaymentInfo' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}
                                    ${btn.type === 'viewReceipt' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : ''}
                                    ${btn.type === 'confirmPayment' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : ''}
                                    ${btn.type === 'startShipping' ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed' : ''}
                                    ${btn.type === 'uploadVehicleExcel' ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed' : ''}
                                  `}
                                  title={btn.type === 'startShipping' && !canStartShipping(transaction) 
                                    ? 'Chưa có đủ hợp đồng và hóa đơn' 
                                    : (btn.type === 'createContract' && isCreatingContract ? 'Đang tạo...' : btn.text)}
                                >
                                  {btn.type === 'accept' && <CheckCircle2 size={18} />}
                                  {btn.type === 'createContract' && <FileText size={18} />}
                                  {btn.type === 'viewContract' && <FileText size={18} />}
                                  {btn.type === 'viewPaymentInfo' && <CreditCard size={18} />}
                                  {btn.type === 'viewReceipt' && <Receipt size={18} />}
                                  {btn.type === 'confirmPayment' && <CreditCard size={18} />}
                                  {btn.type === 'startShipping' && <Truck size={18} />}
                                  {btn.type === 'uploadVehicleExcel' && <Upload size={18} />}
                                </button>
                              ))}
                              {(transaction.status === 'PENDING' || transaction.status === 'DRAFT') && (
                                <button
                                  onClick={() => handleRejectTransaction(transaction.inventoryId)}
                                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center"
                                  title="Từ chối"
                                >
                                  <XCircle size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedTransactionId(transaction.inventoryId);
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                                title="Xem chi tiết"
                              >
                                <Eye size={18} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {paginatedTransactions.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600">
              Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
              <span className="font-medium">{Math.min(endIndex, filteredTransactions.length)}</span> trong{' '}
              <span className="font-medium">{filteredTransactions.length}</span> kết quả
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Tiếp
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTransactionId(null);
        }}
        title="Chi tiết Giao dịch Kho"
        size="lg"
      >
        {isLoadingDetail ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          </div>
        ) : transactionDetail?.data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Mã giao dịch</label>
                <p className="text-base font-semibold text-gray-900">#{transactionDetail.data.inventoryId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                <div className="mt-1">{getStatusBadge(transactionDetail.data.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Đại lý</label>
                <p className="text-base text-gray-900">{transactionDetail.data.storeName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày đặt</label>
                <p className="text-base text-gray-900">{formatDate(transactionDetail.data.orderDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mẫu xe</label>
                <p className="text-base text-gray-900">{transactionDetail.data.modelName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Màu sắc</label>
                <p className="text-base text-gray-900">{transactionDetail.data.colorName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số lượng</label>
                <p className="text-base text-gray-900">
                  {transactionDetail.data.importQuantity || 
                   transactionDetail.data.quantity || 
                   transactionDetail.data.requestedQuantity || 
                   transactionDetail.data.orderQuantity ||
                   transactionDetail.data.requestQuantity ||
                   0} xe
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tổng giá</label>
                <p className="text-base font-semibold text-gray-900">
                  {(() => {
                    const detail = transactionDetail.data;
                    // Ưu tiên: totalPrice > totalBasePrice > totalAmount > price
                    let totalPrice = detail.totalPrice || 
                                    detail.totalBasePrice ||
                                    detail.totalAmount || 
                                    detail.price;
                    
                    // Nếu không có totalPrice, tính từ unitPrice * quantity
                    if (!totalPrice || totalPrice === 0) {
                      const unitPrice = detail.unitPrice || 
                                       detail.unitBasePrice ||
                                       detail.price || 
                                       detail.modelColorPrice || 
                                       0;
                      const quantity = detail.importQuantity || 
                                     detail.quantity || 
                                     detail.requestedQuantity || 
                                     detail.orderQuantity ||
                                     detail.requestQuantity ||
                                     0;
                      totalPrice = unitPrice * quantity;
                    }
                    
                    return formatCurrency(totalPrice || 0);
                  })()}
                </p>
              </div>
            </div>
            {/* Hiển thị hợp đồng nếu có */}
            {(transactionDetail.data.contractFile || transactionDetail.data.contractPath) && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Hợp đồng đã ký</label>
                {transactionDetail.data.contractFile ? (
                  <a
                    href={transactionDetail.data.contractFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Xem hợp đồng
                  </a>
                ) : (
                  <p className="text-sm text-gray-600">Đã có hợp đồng</p>
                )}
              </div>
            )}
            {/* Hiển thị hóa đơn nếu có */}
            {transactionDetail.data.receiptImage && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Hóa đơn thanh toán</label>
                <img
                  src={transactionDetail.data.receiptImage}
                  alt="Receipt"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}
            {/* Hiển thị thông báo nếu chưa đủ điều kiện để shipping */}
            {transactionDetail.data.status === 'PAYMENT_CONFIRMED' && !canStartShipping(transactionDetail.data) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Chưa thể vận chuyển. Vui lòng đảm bảo đã có hợp đồng đã ký và hóa đơn thanh toán từ đại lý.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
        title="Xác nhận"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-gray-700">{confirmModal.message}</p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
              variant="outline"
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                if (confirmModal.onConfirm) {
                  confirmModal.onConfirm();
                }
              }}
              variant="primary"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Receipt Modal */}
      <Modal
        isOpen={isViewReceiptModalOpen}
        onClose={() => {
          setIsViewReceiptModalOpen(false);
          setSelectedReceiptImage(null);
        }}
        title="Hóa Đơn Thanh Toán"
        size="lg"
      >
        {selectedReceiptImage ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={selectedReceiptImage}
                alt="Hóa đơn thanh toán"
                className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="16"%3EKhông thể tải hình ảnh%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsViewReceiptModalOpen(false);
                  setSelectedReceiptImage(null);
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không có hình ảnh hóa đơn
          </div>
        )}
        </Modal>

        {/* View Contract Modal */}
        <Modal
          isOpen={isViewContractModalOpen}
          onClose={() => {
            setIsViewContractModalOpen(false);
            setSelectedContractImage(null);
          }}
          title="Hợp Đồng"
          size="lg"
        >
          {selectedContractImage ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedContractImage}
                  alt="Hợp đồng"
                  className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="16"%3EKhông thể tải hình ảnh%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewContractModalOpen(false);
                    setSelectedContractImage(null);
                  }}
                >
                  Đóng
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không có hình ảnh hợp đồng
            </div>
          )}
        </Modal>

        {/* Payment Info Modal */}
      <Modal
        isOpen={isPaymentInfoModalOpen}
        onClose={() => {
          setIsPaymentInfoModalOpen(false);
          setSelectedTransactionId(null);
        }}
        title="Thông Tin Chuyển Khoản"
        size="lg"
      >
        {isLoadingPaymentInfo ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Đang tải thông tin thanh toán...</div>
          </div>
        ) : paymentInfoError ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="text-red-500 font-semibold">Không thể tải thông tin thanh toán</div>
            <div className="text-sm text-gray-500">
              {paymentInfoError?.data?.message || paymentInfoError?.message || 'Có lỗi xảy ra khi tải thông tin thanh toán'}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setIsPaymentInfoModalOpen(false);
                setSelectedTransactionId(null);
              }}
              className="mt-4"
            >
              Đóng
            </Button>
          </div>
        ) : paymentInfoData?.data ? (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Thông tin tài khoản nhận tiền</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngân hàng:</span>
                  <span className="font-semibold">{paymentInfoData.data.bankName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tài khoản:</span>
                  <span className="font-semibold font-mono">{paymentInfoData.data.accountNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chủ tài khoản:</span>
                  <span className="font-semibold">{paymentInfoData.data.accountHolderName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-red-600">
                    {paymentInfoData.data.totalAmount 
                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentInfoData.data.totalAmount)
                      : 'N/A'}
                  </span>
                </div>
                {paymentInfoData.data.transactionCode && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã giao dịch:</span>
                    <span className="font-semibold font-mono">{paymentInfoData.data.transactionCode}</span>
                  </div>
                )}
                {paymentInfoData.data.note && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <span className="text-gray-600">Ghi chú:</span>
                    <p className="text-sm text-gray-700 mt-1">{paymentInfoData.data.note}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Lưu ý:</strong> Vui lòng kiểm tra thông tin thanh toán trước khi xác nhận.
              </p>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => {
                  setIsPaymentInfoModalOpen(false);
                  setSelectedTransactionId(null);
                }}
              >
                Đã hiểu
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-2">
            <div className="text-gray-500">Không có thông tin thanh toán</div>
            <Button
              variant="outline"
              onClick={() => {
                setIsPaymentInfoModalOpen(false);
                setSelectedTransactionId(null);
              }}
              className="mt-4"
            >
              Đóng
            </Button>
          </div>
        )}
      </Modal>

      {/* Upload Vehicle Excel Modal */}
      <Modal
        isOpen={isUploadExcelModalOpen}
        onClose={() => {
          setIsUploadExcelModalOpen(false);
          setSelectedExcelFile(null);
          setExcelValidationError(null);
        }}
        title="Gửi file Excel thông tin xe"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">Yêu cầu file Excel:</p>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>3 cột: Mã VIN (17 ký tự), Số máy (6 ký tự), Số seri pin (10 ký tự)</li>
              <li>Số lượng dòng phải khớp với số lượng đặt: <strong>{selectedTransactionForExcel?.transaction?.importQuantity || selectedTransactionForExcel?.transaction?.quantity || 0}</strong></li>
              <li>Không được có dữ liệu trùng trong file</li>
            </ul>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file Excel (.xlsx, .xls)
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  setSelectedExcelFile(e.target.files[0]);
                  setExcelValidationError(null);
                }}
                id="excel-file-input"
                className="hidden"
              />
              <label
                htmlFor="excel-file-input"
                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border-0 cursor-pointer hover:bg-blue-100 transition-colors"
              >
                Chọn file
              </label>
              {selectedExcelFile ? (
                <span className="ml-4 text-sm text-gray-600">
                  {selectedExcelFile.name}
                </span>
              ) : (
                <span className="ml-4 text-sm text-gray-500">
                  Chưa chọn file
                </span>
              )}
            </div>
            {selectedExcelFile && (
              <p className="mt-2 text-sm text-gray-600">
                Đã chọn: {selectedExcelFile.name}
              </p>
            )}
          </div>
          
          {/* Hiển thị lỗi xác thực */}
          {excelValidationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-2">Lỗi xác thực:</p>
              {excelValidationError.type === 'quantity' && (
                <div>
                  <p className="text-sm text-red-700">{excelValidationError.message}</p>
                  <p className="text-sm text-red-600 mt-1">
                    Số lượng yêu cầu: {excelValidationError.expected} | 
                    Số lượng trong file: {excelValidationError.actual}
                  </p>
                </div>
              )}
              {excelValidationError.type === 'validation' && (
                <div>
                  <p className="text-sm text-red-700 mb-2">{excelValidationError.message}</p>
                  <ul className="text-sm text-red-600 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                    {excelValidationError.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {excelValidationError.type === 'backend' && (
                <div>
                  <p className="text-sm text-red-700">{excelValidationError.message}</p>
                  {excelValidationError.details && (
                    <div className="mt-2 text-sm text-red-600">
                      {excelValidationError.details.duplicateVins && (
                        <p>VIN trùng: {excelValidationError.details.duplicateVins.join(', ')}</p>
                      )}
                      {excelValidationError.details.duplicateEngineNumbers && (
                        <p>Số máy trùng: {excelValidationError.details.duplicateEngineNumbers.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {excelValidationError.type === 'unknown' && (
                <p className="text-sm text-red-700">{excelValidationError.message}</p>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadExcelModalOpen(false);
                setSelectedExcelFile(null);
                setExcelValidationError(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitExcel}
              disabled={isValidatingExcel || isUploadingExcel}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isValidatingExcel || isUploadingExcel ? 'Đang xử lý...' : 'Gửi'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </EVMStaffLayout>
  );
};

export default DealerOrdersPage;
