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
  PenTool,
  Upload
} from 'lucide-react';
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
  useCreateContractMutation,
  useUploadSignatureImageMutation,
  useSignContractMutation,
  useGetContractQuery,
} from '../../../api/evmStaff/inventoryApi';

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
  const [isSignContractModalOpen, setIsSignContractModalOpen] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const { toasts, showToast, removeToast } = useToast();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, dealerFilter, timeRangeFilter]);

  const { data: transactionsData, isLoading, error } = useGetAllInventoryTransactionsQuery();
  const { data: storesData, isLoading: isLoadingStores, error: storesError } = useGetAllStoresQuery();
  const { data: statusesData } = useGetInventoryTransactionStatusesQuery();
  const { data: transactionDetail, isLoading: isLoadingDetail } = useGetInventoryTransactionByIdQuery(
    selectedTransactionId,
    { skip: !selectedTransactionId }
  );

  const [acceptRequest] = useAcceptInventoryRequestMutation();
  const [confirmDelivery] = useConfirmDeliveryMutation();
  const [rejectRequest] = useRejectInventoryRequestMutation();
  const [startShipping] = useStartShippingMutation();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [cancelRequest] = useCancelInventoryRequestMutation();
  const [createContract, { isLoading: isCreatingContract }] = useCreateContractMutation();
  const [uploadSignatureImage] = useUploadSignatureImageMutation();
  const [signContract, { isLoading: isSigningContract }] = useSignContractMutation();
  const { data: contractData } = useGetContractQuery(selectedTransactionId, {
    skip: !selectedTransactionId,
  });

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
  if (import.meta.env.DEV && transactions.length > 0) {
    console.log('EVM Staff Transactions Sample:', transactions.slice(0, 2));
    if (transactions[0]) {
      const sample = transactions[0];
      console.log('EVM Staff Transaction fields:', Object.keys(sample));
      console.log('EVM Staff Transaction FULL OBJECT:', sample);
      console.log('EVM Staff Transaction price fields:', {
        totalPrice: sample.totalPrice,
        totalBasePrice: sample.totalBasePrice,
        totalAmount: sample.totalAmount,
        price: sample.price,
        unitPrice: sample.unitPrice,
        unitBasePrice: sample.unitBasePrice,
        modelColorPrice: sample.modelColorPrice,
      });
      console.log('EVM Staff Transaction quantity fields:', {
        importQuantity: sample.importQuantity,
        quantity: sample.quantity,
        requestedQuantity: sample.requestedQuantity,
        orderQuantity: sample.orderQuantity,
        requestQuantity: sample.requestQuantity,
      });
    }
  }
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
      PROCESSING: { variant: 'info', label: 'Đang xử lý' },
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

    const statusOrder = {
      PENDING: 0, DRAFT: 0,
      ACCEPTED: 1, CONFIRMED: 1,
      PROCESSING: 2,
      SHIPPING: 3,
      DELIVERED: 4, COMPLETED: 4,
    };

    const currentStep = statusOrder[status] ?? 0;

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStep,
      active: index === currentStep,
    }));
  };

  const getActionButton = (status, transaction) => {
    if (status === 'PENDING' || status === 'DRAFT') return { text: 'Chấp nhận', type: 'accept' };
    if (status === 'ACCEPTED' || status === 'CONFIRMED') {
      // Sau khi accept, EVM cần tạo hợp đồng
      // Kiểm tra xem đã có contract chưa
      // Nếu đang xem detail của transaction này, dùng contractData
      const isViewingDetail = selectedTransactionId === transaction.inventoryId;
      const contractInfo = isViewingDetail && contractData?.data 
        ? contractData.data 
        : null;
      
      const hasContract = contractInfo || transaction.contractId;
      
      if (!hasContract) {
        // Chưa có contract, hiển thị nút "Tạo hợp đồng"
        return { text: 'Tạo hợp đồng', type: 'createContract' };
      }
      
      // Đã có contract, kiểm tra xem đã ký chưa
      const contractStatus = contractInfo?.status || transaction.contractStatus;
      const hasSignature = contractInfo?.evmSignatureUrl || transaction.evmSignatureUrl;
      
      // Nếu contract status là DRAFT hoặc chưa có signature, hiển thị nút "Ký hợp đồng"
      if (contractStatus === 'DRAFT' || !hasSignature) {
        return { text: 'Ký hợp đồng', type: 'signContract' };
      }
      
      // Đã ký, chờ manager upload hợp đồng đã ký và hóa đơn
      return null;
    }
    if (status === 'EVM_SIGNED') {
      // EVM đã ký, chờ manager ký và upload lại
      return null;
    }
    if (status === 'FILE_UPLOADED' || status === 'SIGNED' || status === 'CONTRACT_SIGNED') {
      // Manager đã upload hợp đồng đã ký, chờ upload hóa đơn
      return null;
    }
    if (status === 'PAYMENT_CONFIRMED') {
      // Đã có cả hợp đồng và hóa đơn, có thể gửi xe
      return { text: 'Bắt đầu vận chuyển', type: 'startShipping' };
    }
    if (status === 'PROCESSING' || status === 'SHIPPING') {
      // Đang vận chuyển, chờ manager nhận xe
      return null;
    }
    if (status === 'DELIVERED' || status === 'COMPLETED') return null;
    return null;
  };

  const canStartShipping = (transaction) => {
    // Chỉ có thể start shipping khi:
    // 1. Status = PAYMENT_CONFIRMED (đã có hợp đồng và hóa đơn)
    // 2. Hoặc kiểm tra có contractFile và receiptImage
    return transaction.status === 'PAYMENT_CONFIRMED' ||
           (transaction.contractFile && transaction.receiptImage);
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

  const handleCreateContract = async (inventoryId) => {
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn tạo hợp đồng cho yêu cầu này?',
      onConfirm: async () => {
        try {
          await createContract(inventoryId).unwrap();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          showToast('Đã tạo hợp đồng thành công! Vui lòng ký hợp đồng.', 'success');
        } catch (error) {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi tạo hợp đồng';
          showToast(errorMessage, 'error');
        }
      },
    });
  };

  const handleSignContract = async (inventoryId) => {
    if (!signatureFile) {
      showToast('Vui lòng chọn file ảnh chữ ký', 'warning');
      return;
    }

    try {
      // Upload signature image lên cloudinary hoặc server trước
      // Ở đây giả sử backend sẽ xử lý upload, ta chỉ cần gửi URL
      // Hoặc có thể upload file trực tiếp nếu API hỗ trợ
      const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
      const token = localStorage.getItem('accessToken');
      
      // Upload signature image
      const formData = new FormData();
      formData.append('file', signatureFile);
      
      const uploadResponse = await fetch(`${baseUrl}/upload/signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Không thể upload ảnh chữ ký');
      }

      const uploadData = await uploadResponse.json();
      const signatureUrl = uploadData.url || uploadData.data?.url;

      if (!signatureUrl) {
        throw new Error('Không nhận được URL ảnh chữ ký');
      }

      // Ký hợp đồng với URL signature
      await signContract({
        inventoryId,
        evmSignatureImageUrl: signatureUrl,
      }).unwrap();

      setIsSignContractModalOpen(false);
      setSignatureFile(null);
      setSignaturePreview(null);
      showToast('Đã ký hợp đồng thành công! Hợp đồng đã được gửi tới Manager.', 'success');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Có lỗi xảy ra khi ký hợp đồng';
      showToast(errorMessage, 'error');
      if (import.meta.env.DEV) {
        console.error('Sign contract error:', error);
      }
    }
  };

  const handleSignatureFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
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
              placeholder="Tìm kiếm theo Mã đơn, Đại lý, Model..."
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
              className="w-40"
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
                      const actionButtonText = getActionButton(transaction.status, transaction);

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
                                    // Debug logging
                                    if (import.meta.env.DEV) {
                                      console.log('EVM Staff - Calculating price:', {
                                        inventoryId: transaction.inventoryId,
                                        unitPrice,
                                        quantity,
                                        calculated,
                                        transaction: transaction,
                                      });
                                    }
                                    
                                    return formatCurrency(calculated);
                                  }
                                }
                                
                                // Debug logging
                                if (import.meta.env.DEV) {
                                  console.log('EVM Staff - Using direct price:', {
                                    inventoryId: transaction.inventoryId,
                                    totalPrice: transaction.totalPrice,
                                    totalBasePrice: transaction.totalBasePrice,
                                    parsedPrice: totalPrice,
                                  });
                                }
                                
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
                            <div className="flex items-center justify-center gap-2">
                              {actionButtonText && transaction.status !== 'COMPLETED' && transaction.status !== 'DELIVERED' && (
                                <>
                                  {actionButtonText.type === 'accept' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleAcceptTransaction(transaction.inventoryId)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                                    >
                                      {actionButtonText.text}
                                    </Button>
                                  )}
                                  {actionButtonText.type === 'createContract' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleCreateContract(transaction.inventoryId)}
                                      disabled={isCreatingContract}
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 disabled:opacity-50"
                                    >
                                      <FileText size={14} className="mr-1" />
                                      {isCreatingContract ? 'Đang tạo...' : actionButtonText.text}
                                    </Button>
                                  )}
                                  {actionButtonText.type === 'signContract' && (
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedTransactionId(transaction.inventoryId);
                                        setIsSignContractModalOpen(true);
                                      }}
                                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1"
                                    >
                                      <PenTool size={14} className="mr-1" />
                                      {actionButtonText.text}
                                    </Button>
                                  )}
                                  {actionButtonText.type === 'startShipping' && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStartShipping(transaction.inventoryId, transaction)}
                                      disabled={!canStartShipping(transaction)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                      title={!canStartShipping(transaction) ? 'Chưa có đủ hợp đồng và hóa đơn' : ''}
                                    >
                                      <Truck size={14} className="mr-1" />
                                      {actionButtonText.text}
                                    </Button>
                                  )}
                                </>
                              )}
                              {(transaction.status === 'PENDING' || transaction.status === 'DRAFT') && (
                                <Button
                                  size="sm"
                                  onClick={() => handleRejectTransaction(transaction.inventoryId)}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                                >
                                  Từ chối
                                </Button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedTransactionId(transaction.inventoryId);
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <ChevronRight size={16} />
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
                <label className="text-sm font-medium text-gray-500">Model</label>
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

      {/* Sign Contract Modal */}
      <Modal
        isOpen={isSignContractModalOpen}
        onClose={() => {
          setIsSignContractModalOpen(false);
          setSignatureFile(null);
          setSignaturePreview(null);
        }}
        title="Ký hợp đồng"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Vui lòng upload ảnh chữ ký của bạn để ký hợp đồng. Ảnh sẽ được sử dụng để ký hợp đồng cho giao dịch này.
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ảnh chữ ký <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                {signaturePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={signaturePreview}
                      alt="Signature preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSignatureFile(null);
                        setSignaturePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <span className="text-xs">×</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click để chọn</span> hoặc kéo thả file
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 5MB)</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleSignatureFileChange}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setIsSignContractModalOpen(false);
                setSignatureFile(null);
                setSignaturePreview(null);
              }}
              variant="outline"
            >
              Hủy
            </Button>
            <Button
              onClick={() => handleSignContract(selectedTransactionId)}
              variant="primary"
              disabled={!signatureFile || isSigningContract}
            >
              {isSigningContract ? 'Đang ký...' : 'Ký hợp đồng'}
            </Button>
          </div>
        </div>
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

      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />
    </EVMStaffLayout>
  );
};

export default DealerOrdersPage;
