import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, Download, Printer, Plus, Eye, Edit, Package, Clock, FileText, Upload, Receipt, AlertCircle, CreditCard, Hash, Car, Palette, Calendar, DollarSign, FileText as FileTextIcon, StickyNote } from 'lucide-react';
import * as XLSX from 'xlsx';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import SearchBar from '../../../components/shared/SearchBar';
import MetricCard from '../../../components/shared/MetricCard';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import { TableSkeleton, CardSkeleton } from '../../../components/shared/SkeletonLoader';
import EmptyState from '../../../components/shared/EmptyState';
import Toast from '../../../components/shared/Toast';
import { useDebounce } from '../../../hooks/useDebounce';
import { useToast } from '../../../hooks/useToast';
import {
  useGetAllStoreStocksQuery,
  useGetAllInventoryTransactionsQuery,
  useCreateInventoryTransactionMutation,
  useDownloadContractHtmlMutation,
  useUploadContractMutation,
  useUploadReceiptMutation,
  useGetStoreStockByIdQuery,
  useGetInventoryTransactionByIdQuery,
  useConfirmDeliveryMutation,
  useGetPaymentInfoQuery,
  useGetContractQuery,
  useGetVehicleExcelQuery,
  useGetSoldVehiclesQuery,
} from '../../../api/dealerManager/inventoryApi';
import { getAuthFromStorage } from '../../../utils/roleUtils';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { useGetModelColorsByModelQuery } from '../../../api/dealerStaff/vehicleApi';
import { useGetMyStoreQuery } from '../../../api/dealerManager/storeApi';

const InventoryPage = () => {
  // Khôi phục trạng thái từ localStorage khi component mount
  const getStoredState = () => {
    try {
      const stored = localStorage.getItem('inventoryPageState');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          activeTab: parsed.activeTab || 'inventory',
          currentPage: parsed.currentPage || 1,
          searchTerm: parsed.searchTerm || '',
        };
      }
    } catch (error) {
      console.warn('Failed to load stored state:', error);
    }
    return {
      activeTab: 'inventory',
      currentPage: 1,
      searchTerm: '',
    };
  };

  const initialState = getStoredState();
  const [activeTab, setActiveTab] = useState(initialState.activeTab); // 'inventory' or 'requests'
  const [searchTerm, setSearchTerm] = useState(initialState.searchTerm);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(initialState.currentPage);
  const [inventoryItemsPerPage] = useState(5); // 5 mẫu mỗi trang cho kho xe
  const [transactionItemsPerPage] = useState(10); // 10 mẫu mỗi trang cho yêu cầu đặt xe
  
  // Track xem đã load từ storage chưa để tránh reset page không cần thiết
  const isInitialMount = useRef(true);
  const prevActiveTab = useRef(initialState.activeTab);
  const prevSearchTerm = useRef(initialState.searchTerm);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isUploadContractModalOpen, setIsUploadContractModalOpen] = useState(false);
  const [isUploadReceiptModalOpen, setIsUploadReceiptModalOpen] = useState(false);
  const [isPaymentInfoModalOpen, setIsPaymentInfoModalOpen] = useState(false);
  const [isViewReceiptModalOpen, setIsViewReceiptModalOpen] = useState(false);
  const [selectedReceiptImage, setSelectedReceiptImage] = useState(null);
  const [isViewContractModalOpen, setIsViewContractModalOpen] = useState(false);
  const [selectedContractImage, setSelectedContractImage] = useState(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [selectedStockId, setSelectedStockId] = useState(null);
  const [isStockDetailModalOpen, setIsStockDetailModalOpen] = useState(false);
  const [isTransactionDetailModalOpen, setIsTransactionDetailModalOpen] = useState(false);
  const [isEditStockModalOpen, setIsEditStockModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [contractFile, setContractFile] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState('');
  // Removed useLazyExportInventoryQuery - using fetch directly instead
  const [formData, setFormData] = useState({
    modelId: '',
    colorId: '',
    quantity: 1,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const [inventoryViewTab, setInventoryViewTab] = useState('available'); // 'available' hoặc 'sold'
  const [deliveryVehicles, setDeliveryVehicles] = useState([]);
  const [isViewExcelModalOpen, setIsViewExcelModalOpen] = useState(false);
  const [viewExcelData, setViewExcelData] = useState([]); // Data để hiển thị trong modal
  const [isLoadingExcelData, setIsLoadingExcelData] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // Lưu trạng thái vào localStorage khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('inventoryPageState', JSON.stringify({
        activeTab,
        currentPage,
        searchTerm,
      }));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }, [activeTab, currentPage, searchTerm]);

  // Reset page when search or tab changes (chỉ khi user thay đổi, không phải khi load từ storage)
  useEffect(() => {
    // Bỏ qua lần đầu mount (đã load từ storage)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Chỉ reset nếu tab hoặc search term thay đổi thực sự
    if (prevActiveTab.current !== activeTab || prevSearchTerm.current !== debouncedSearchTerm) {
      setCurrentPage(1);
      prevActiveTab.current = activeTab;
      prevSearchTerm.current = debouncedSearchTerm;
    }
  }, [debouncedSearchTerm, activeTab]);

  // Auto-refresh stocks mỗi 15 giây (ít thường xuyên hơn vì ít thay đổi)
  const { data: stocksData, isLoading, error } = useGetAllStoreStocksQuery(undefined, {
    pollingInterval: 15000, // Tự động refetch mỗi 15 giây
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const { data: modelsData } = useGetAllModelsQuery();
  // Auto-refresh transactions mỗi 10 giây và khi focus lại tab
  const { data: transactionsData, isLoading: isLoadingTransactions, refetch: refetchTransactions } = useGetAllInventoryTransactionsQuery(undefined, {
    pollingInterval: 10000, // Tự động refetch mỗi 10 giây
    refetchOnFocus: true, // Tự động refetch khi user quay lại tab
    refetchOnReconnect: true, // Tự động refetch khi reconnect
  });
  const { data: modelColorsData } = useGetModelColorsByModelQuery(selectedModelId, {
    skip: !selectedModelId,
  });
  const { data: storeData } = useGetMyStoreQuery();
  const { data: stockDetailData, isLoading: isLoadingStockDetail } = useGetStoreStockByIdQuery(selectedStockId, {
    skip: !selectedStockId,
  });
  // Fetch transaction detail khi có selectedTransactionId (để có data mới nhất sau khi upload contract)
  // Auto-refresh khi có transaction được chọn
  const { data: transactionDetailData, isLoading: isLoadingTransactionDetail, refetch: refetchTransactionDetail } = useGetInventoryTransactionByIdQuery(selectedTransactionId, {
    skip: !selectedTransactionId,
    pollingInterval: selectedTransactionId ? 10000 : 0, // Tự động refetch mỗi 10 giây nếu có transaction được chọn
    refetchOnFocus: true,
  });
  const { data: contractData } = useGetContractQuery(selectedTransactionId, {
    skip: !selectedTransactionId,
    refetchOnFocus: true, // Tự động refetch khi focus lại tab
  });
  const { data: paymentInfoData, isLoading: isLoadingPaymentInfo, error: paymentInfoError } = useGetPaymentInfoQuery(selectedTransactionId, {
    skip: !selectedTransactionId || !isPaymentInfoModalOpen,
  });
  const [createTransaction, { isLoading: isCreating }] = useCreateInventoryTransactionMutation();
  const [downloadContractHtml] = useDownloadContractHtmlMutation();
  const [uploadContract, { isLoading: isUploadingContract }] = useUploadContractMutation();
  const [uploadReceipt, { isLoading: isUploadingReceipt }] = useUploadReceiptMutation();
  const [confirmDelivery, { isLoading: isConfirmingDelivery }] = useConfirmDeliveryMutation();

  const store = storeData?.data;
  const { data: soldVehiclesData } = useGetSoldVehiclesQuery(store?.storeId, {
    skip: !store?.storeId || inventoryViewTab !== 'sold' || activeTab !== 'inventory',
  });

  const stocks = stocksData?.data || [];
  const models = modelsData?.data || [];
  const transactions = transactionsData?.data || [];
  const modelColors = modelColorsData?.data || [];


  // Tính toán metrics - Tính từ quantity thực tế của mỗi stock
  // Tổng số xe trong kho = chỉ tính xe còn trong kho (không tính đã bán)
  const totalCars = stocks
    .filter((stock) => stock.status !== 'SOLD')
    .reduce((sum, stock) => {
    const quantity = parseInt(stock.quantity || stock.stockQuantity || 1);
    return sum + (isNaN(quantity) ? 1 : quantity);
  }, 0);
  
  // Xe sắp về = tổng số lượng từ các inventory transactions đang trong trạng thái vận chuyển
  const arrivingCars = transactions
    .filter((transaction) => {
      const status = transaction.status;
      // Các trạng thái cho biết xe đang được vận chuyển
      return status === 'IN_TRANSIT' || 
             status === 'PAYMENT_CONFIRMED'; // Đã thanh toán, đang chờ vận chuyển
    })
    .reduce((sum, transaction) => {
      // Lấy số lượng từ transaction
      const quantity = parseInt(
        transaction.quantity || 
        transaction.requestedQuantity || 
        transaction.importQuantity ||
        transaction.orderQuantity ||
        0
      );
      return sum + (isNaN(quantity) ? 0 : quantity);
    }, 0);
  
  // Xe có sẵn = tổng số lượng của tất cả các xe có quantity > 0 (có thể bán được)
  const availableCars = stocks.reduce((sum, stock) => {
    const quantity = parseInt(stock.quantity || stock.stockQuantity || 0);
    // Chỉ tính những xe có số lượng > 0 (còn hàng)
    return sum + (isNaN(quantity) || quantity <= 0 ? 0 : quantity);
    }, 0);

  // Filter stocks - sử dụng debounced search
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesSearch =
        stock.modelName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        stock.colorName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [stocks, debouncedSearchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredStocks.length / inventoryItemsPerPage);
  const startIndex = (currentPage - 1) * inventoryItemsPerPage;
  const endIndex = startIndex + inventoryItemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, endIndex);

  // Hàm lấy số lượng từ stock
  const getStockQuantity = (stock) => {
    const quantity = parseInt(stock.quantity || stock.stockQuantity || 0);
    return isNaN(quantity) ? 0 : quantity;
  };

  // Hàm lấy trạng thái dựa trên số lượng
  const getStockStatusBadge = (stock) => {
    const quantity = getStockQuantity(stock);
    
    if (quantity === 0) {
      return <Badge variant="error">Hết</Badge>;
    } else if (quantity <= 3) {
      return <Badge variant="warning">Sắp hết</Badge>;
    } else {
      return <Badge variant="success">Còn hàng</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      AVAILABLE: { variant: 'success', label: 'Có sẵn' },
      IN_TRANSIT: { variant: 'info', label: 'Đang vận chuyển' },
      SOLD: { variant: 'default', label: 'Đã bán' },
      RESERVED: { variant: 'warning', label: 'Đã đặt' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  // Helper component để hiển thị button với icon và tooltip
  const IconButton = ({ icon: Icon, text, onClick, variant = "outline", size = "sm", disabled = false, className = "", ...props }) => {
    return (
      <div className="relative group inline-block">
        <Button
          size={size}
          variant={variant}
          onClick={onClick}
          disabled={disabled}
          className={`p-2 ${className}`}
          {...props}
        >
          <Icon size={16} />
        </Button>
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          {text}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    );
  };

  // Helper functions để tái sử dụng
  // Kiểm tra transaction có hợp đồng, hợp đồng đã upload, và hóa đơn
  const getTransactionChecks = (transaction) => {
    // Kiểm tra xem có hợp đồng không
    const hasContractFields = transaction.contractId || 
                             transaction.contract ||
                             transaction.contractFile ||
                             transaction.contractPath ||
                             transaction.contractUrl;
    
    const hasContractByStatus = transaction.status === 'EVM_SIGNED' ||
                               transaction.status === 'CONFIRMED' ||
                               transaction.status === 'SIGNED' ||
                               transaction.status === 'CONTRACT_SIGNED' ||
                               transaction.status === 'FILE_UPLOADED' ||
                               transaction.status === 'PAYMENT_CONFIRMED' ||
                               transaction.status === 'IN_TRANSIT' ||
                               transaction.status === 'DELIVERED';
    
    const hasContract = hasContractFields || hasContractByStatus;
    
    // Kiểm tra xem Manager đã upload hợp đồng đã ký chưa
    const hasUploadedContract = transaction.contractFile || 
                               transaction.contractPath ||
                               transaction.contractUrl ||
                               transaction.status === 'SIGNED' ||
                               transaction.status === 'CONTRACT_SIGNED' ||
                               transaction.status === 'FILE_UPLOADED' ||
                               transaction.status === 'PAYMENT_CONFIRMED' ||
                               transaction.status === 'IN_TRANSIT' ||
                               transaction.status === 'DELIVERED';
    
    // Kiểm tra xem có hóa đơn không
    // imageUrl là của hóa đơn thanh toán
    const hasReceipt = transaction.receiptImage || 
                      transaction.receiptFile ||
                      transaction.receiptPath ||
                      transaction.receiptUrl ||
                      transaction.imageUrl;
    
    // Kiểm tra xem Manager đã upload hóa đơn chưa
    const hasUploadedReceipt = transaction.receiptImage || 
                              transaction.receiptFile ||
                              transaction.receiptPath ||
                              transaction.receiptUrl ||
                              transaction.imageUrl ||
                              transaction.status === 'FILE_UPLOADED' ||
                              transaction.status === 'PAYMENT_CONFIRMED';
    
    return { hasContract, hasUploadedContract, hasReceipt, hasUploadedReceipt };
  };

  // Lấy receipt image từ nhiều nguồn
  const getReceiptImage = (transaction, transactionDetailData = null, refetchResult = null) => {
    let receiptImage = null;
    
    // Ưu tiên 1: Từ refetchResult (data mới nhất)
    if (refetchResult?.data?.data) {
      receiptImage = refetchResult.data.data.receiptImage || 
                    refetchResult.data.data.receiptFile || 
                    refetchResult.data.data.receiptPath || 
                    refetchResult.data.data.receiptUrl ||
                    refetchResult.data.data.imageUrl;
    }
    
    // Ưu tiên 2: Từ refetchResult.data (nếu không có trong data.data)
    if (!receiptImage && refetchResult?.data) {
      receiptImage = refetchResult.data.receiptImage || 
                    refetchResult.data.receiptFile || 
                    refetchResult.data.receiptPath || 
                    refetchResult.data.receiptUrl ||
                    refetchResult.data.imageUrl;
    }
    
    // Ưu tiên 3: Từ transaction hiện tại
    if (!receiptImage) {
      receiptImage = transaction.receiptImage || 
                    transaction.receiptFile || 
                    transaction.receiptPath || 
                    transaction.receiptUrl ||
                    transaction.imageUrl;
    }
    
    // Ưu tiên 4: Từ transactionDetailData (nếu đã có sẵn)
    if (!receiptImage && transactionDetailData?.data) {
      receiptImage = transactionDetailData.data.receiptImage || 
                    transactionDetailData.data.receiptFile || 
                    transactionDetailData.data.receiptPath || 
                    transactionDetailData.data.receiptUrl ||
                    transactionDetailData.data.imageUrl;
    }
    
    // Ưu tiên 5: Từ transactionDetailData trực tiếp
    if (!receiptImage && transactionDetailData) {
      receiptImage = transactionDetailData.receiptImage || 
                    transactionDetailData.receiptFile || 
                    transactionDetailData.receiptPath || 
                    transactionDetailData.receiptUrl ||
                    transactionDetailData.imageUrl;
    }
    
    return receiptImage;
  };

  // Handler để xem hóa đơn với logic lấy receipt image
  const handleViewReceipt = async (transaction, shouldRefetch = false) => {
    setSelectedTransactionId(transaction.inventoryId);
    let receiptImage = null;
    
    if (shouldRefetch && transaction.inventoryId) {
      try {
        const result = await refetchTransactionDetail();
        receiptImage = getReceiptImage(transaction, transactionDetailData, result);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('Failed to refetch transaction detail:', err);
        }
        // Fallback to current data
        receiptImage = getReceiptImage(transaction, transactionDetailData);
      }
    } else {
      receiptImage = getReceiptImage(transaction, transactionDetailData);
    }
    
    if (!receiptImage) {
      showToast('Không tìm thấy hóa đơn. Vui lòng thử lại sau.', 'warning');
      return;
    }
    
    setSelectedReceiptImage(receiptImage);
    setIsViewReceiptModalOpen(true);
  };

  // Filter và sắp xếp transactions (mới nhất lên đầu) - sử dụng debounced search
  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        transaction.inventoryId?.toString().includes(debouncedSearchTerm) ||
        transaction.modelName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        transaction.colorName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      return matchesSearch;
    });
    
    // Sắp xếp theo ngày tạo: mới nhất lên đầu
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.requestDate || a.createdDate || a.dateCreated || a.orderDate || 0);
      const dateB = new Date(b.createdAt || b.requestDate || b.createdDate || b.dateCreated || b.orderDate || 0);
      return dateB.getTime() - dateA.getTime(); // Giảm dần (mới nhất trước)
    });
  }, [transactions, debouncedSearchTerm]);

  // Pagination for transactions
  const transactionPages = Math.ceil(filteredTransactions.length / transactionItemsPerPage);
  const transactionStartIndex = (currentPage - 1) * transactionItemsPerPage;
  const transactionEndIndex = transactionStartIndex + transactionItemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(transactionStartIndex, transactionEndIndex);

  const getTransactionStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Chờ duyệt' },
      CONFIRMED: { variant: 'info', label: 'Đã xác nhận' },
        EVM_SIGNED: { variant: 'info', label: 'Chờ ký hợp đồng' },
      SIGNED: { variant: 'success', label: 'Đã ký hợp đồng' },
      CONTRACT_SIGNED: { variant: 'success', label: 'Đã ký hợp đồng' },
        FILE_UPLOADED: { variant: 'info', label: 'Đã tải lên hóa đơn' },
        PAYMENT_CONFIRMED: { variant: 'info', label: 'Đã xác nhận thanh toán' },
      IN_TRANSIT: { variant: 'info', label: 'Đang vận chuyển' },
        DELIVERED: { variant: 'success', label: 'Đã nhận xe' },
        REJECTED: { variant: 'error', label: 'Đã từ chối' },
        CANCELLED: { variant: 'default', label: 'Đã hủy đơn' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleOpenOrderModal = () => {
    setIsOrderModalOpen(true);
    setFormData({
      modelId: '',
      colorId: '',
      quantity: 1,
      notes: '',
    });
    setSelectedModelId('');
  };

  const handleModelChange = (modelId) => {
    setSelectedModelId(modelId);
    setFormData({ ...formData, modelId, colorId: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!store?.storeId) {
      showToast('Không tìm thấy thông tin đại lý', 'error');
      return false;
    }
    if (!formData.modelId) {
      errors.modelId = 'Vui lòng chọn mẫu xe';
    }
    if (!formData.colorId) {
      errors.colorId = 'Vui lòng chọn màu sắc';
    }
    const quantity = parseFloat(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || !Number.isInteger(quantity) || quantity < 1) {
      errors.quantity = 'Số lượng phải là số nguyên dương lớn hơn 0';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const modelId = parseInt(formData.modelId);
    const colorId = parseInt(formData.colorId);
    const quantity = parseInt(formData.quantity) || 1;
    
    try {
      // Tìm storeStockId từ modelId và colorId (nếu có)
      const storeStock = stocks.find(
        (stock) => stock.modelId === modelId && stock.colorId === colorId
      );
      
      // Tìm giá gốc từ modelColor
      const modelColor = modelColors.find(
        (mc) => mc.modelId === modelId && mc.colorId === colorId
      );
      
      const unitPrice = modelColor?.price || 0;
      const totalPrice = unitPrice * quantity;
      
      // Gửi đúng field mà backend cần
      await createTransaction({
        modelId: modelId,
        colorId: colorId,
        importQuantity: quantity,
      }).unwrap();
      setIsOrderModalOpen(false);
      showToast(`Yêu cầu đặt xe đã được gửi thành công! Tổng tiền: ${new Intl.NumberFormat('vi-VN').format(totalPrice)}₫. Đang chờ EVM Staff duyệt.`, 'success');
      setFormData({
        modelId: '',
        colorId: '',
        quantity: 1,
        notes: '',
      });
      setFormErrors({});
      setSelectedModelId('');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi tạo yêu cầu đặt xe';
      showToast(errorMessage, 'error');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleDownloadContract = async (inventoryId) => {
    try {
      // Dùng fetch trực tiếp vì RTK Query không hỗ trợ download file tốt
      const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${baseUrl}/inventory-transactions/${inventoryId}/contract/html`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        // Kiểm tra status code để hiển thị thông báo phù hợp
        if (response.status === 404) {
          throw new Error('Hợp đồng chưa được tạo. Vui lòng đợi EVM Staff tạo hợp đồng.');
        } else if (response.status === 403) {
          throw new Error('Bạn không có quyền truy cập hợp đồng này.');
        } else {
          const errorText = await response.text().catch(() => '');
          throw new Error(errorText || 'Không thể tải hợp đồng');
        }
      }
      
      const htmlContent = await response.text();
      
      // Kiểm tra xem response có phải là HTML hợp lệ không
      if (!htmlContent || htmlContent.trim().length === 0) {
        throw new Error('Hợp đồng trống hoặc chưa được tạo.');
      }
      
      // Tạo blob và download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hop-dong-${inventoryId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast('Đã tải hợp đồng thành công. Vui lòng mở file, ký và upload lại.', 'success');
    } catch (error) {
      const errorMessage = error?.message || 'Có lỗi xảy ra khi tải hợp đồng';
      showToast(errorMessage, 'error');
      if (import.meta.env.DEV) {
        console.error('Error downloading contract:', error);
      }
    }
  };

  const handleUploadContract = async (e) => {
    e.preventDefault();
    if (!contractFile || !selectedTransactionId) {
      showToast('Vui lòng chọn file hợp đồng', 'warning');
      return;
    }
    
    // Validate file type: chỉ cho phép PDF hoặc hình ảnh
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const fileType = contractFile.type || '';
    const fileName = contractFile.name || '';
    const isValidType = allowedTypes.includes(fileType) || 
                       fileName.toLowerCase().endsWith('.pdf') ||
                       fileName.toLowerCase().endsWith('.jpg') ||
                       fileName.toLowerCase().endsWith('.jpeg') ||
                       fileName.toLowerCase().endsWith('.png');
    
    if (!isValidType) {
      showToast('File phải là PDF hoặc hình ảnh (JPG, PNG)', 'error');
      return;
    }
    try {
      await uploadContract({
        inventoryId: selectedTransactionId,
        file: contractFile,
      }).unwrap();
      showToast('Upload hợp đồng thành công', 'success');
      setIsUploadContractModalOpen(false);
      setContractFile(null);
      
      // Sau khi upload contract thành công, tự động gọi payment-info và hiển thị modal
      // Payment info sẽ được fetch tự động khi isPaymentInfoModalOpen = true
      setIsPaymentInfoModalOpen(true);
      
      // Refresh transactions để có data mới nhất
      try {
        await refetchTransactions();
      } catch (refetchError) {
        // Ignore refetch error, invalidatesTags sẽ tự động refresh
        if (import.meta.env.DEV) {
          console.warn('Failed to refetch transactions:', refetchError);
        }
      }
      // Không set selectedTransactionId = null để giữ lại cho payment info modal
    } catch (error) {
      showToast(error?.data?.message || 'Có lỗi xảy ra khi upload hợp đồng', 'error');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleViewStockDetail = (stockId) => {
    setSelectedStockId(stockId);
    setIsStockDetailModalOpen(true);
  };

  const handleEditStock = (stock) => {
    setSelectedStockId(stock.storeStockId);
    setIsEditStockModalOpen(true);
  };


  const handleExportInventory = async () => {
    try {
      showToast('Đang xuất báo cáo...', 'info');
      
      // Dùng fetch trực tiếp vì RTK Query không hỗ trợ download file tốt
      const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
      const token = localStorage.getItem('accessToken');
      
      const url = `${baseUrl}/store-stocks/export`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể xuất báo cáo');
      }
      
      // Lấy blob từ response
      const blob = await response.blob();
      
      // Tạo download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `bao-cao-kho-xe-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      showToast('Xuất báo cáo thành công!', 'success');
    } catch (error) {
      const errorMessage = error?.message || 'Có lỗi xảy ra khi xuất báo cáo';
      showToast(errorMessage, 'error');
      if (import.meta.env.DEV) {
        console.error('Export error:', error);
      }
    }
  };

  const handlePrintInventory = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Báo cáo kho xe</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>BÁO CÁO KHO XE</h1>
          <p>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</p>
          <table>
            <thead>
              <tr>
                <th>Mẫu xe</th>
                <th>Màu sắc</th>
                <th>Số lượng</th>
                <th>Tình trạng</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStocks.map(stock => `
                <tr>
                  <td>${stock.modelName || 'N/A'}</td>
                  <td>${stock.colorName || 'N/A'}</td>
                  <td>${getStockQuantity(stock)}</td>
                  <td>${getStockStatusBadge(stock).props.children}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">In báo cáo</button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">Đóng</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleViewTransactionDetail = (transactionId) => {
    setSelectedTransactionId(transactionId);
    setIsTransactionDetailModalOpen(true);
  };

  const handleUploadReceipt = async (e) => {
    e.preventDefault();
    if (!receiptFile || !selectedTransactionId) {
      showToast('Vui lòng chọn file biên lai', 'warning');
      return;
    }
    
    // Không cần validate contract ở đây vì:
    // 1. UI đã kiểm tra và chỉ hiển thị nút khi có hợp đồng
    // 2. Backend sẽ validate và trả về lỗi nếu chưa có hợp đồng
    // 3. Validation client-side có thể không chính xác nếu data chưa được refresh
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const fileType = receiptFile.type || '';
    const fileName = receiptFile.name || '';
    const isValidType = allowedTypes.includes(fileType) || 
                       fileName.toLowerCase().endsWith('.pdf') ||
                       fileName.toLowerCase().endsWith('.jpg') ||
                       fileName.toLowerCase().endsWith('.jpeg') ||
                       fileName.toLowerCase().endsWith('.png');
    
    if (!isValidType) {
      showToast('File không hợp lệ. Vui lòng chọn file PDF, JPG, JPEG hoặc PNG', 'error');
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (receiptFile.size > maxSize) {
      const fileSizeMB = (receiptFile.size / (1024 * 1024)).toFixed(2);
      showToast(`File quá lớn (${fileSizeMB}MB). Vui lòng chọn file nhỏ hơn 10MB hoặc nén file trước khi upload.`, 'error');
      return;
    }
    
    try {
      await uploadReceipt({
        inventoryId: selectedTransactionId,
        file: receiptFile,
      }).unwrap();
      showToast('Upload hóa đơn thanh toán thành công! EVM Staff sẽ kiểm tra và gửi xe.', 'success');
      setIsUploadReceiptModalOpen(false);
      setReceiptFile(null);
      setSelectedTransactionId(null);
    } catch (error) {
      // Improved error handling
      let errorMessage = 'Có lỗi xảy ra khi upload hóa đơn';
      
      // Check for specific error types
      if (error?.status === 413) {
        // 413 = Payload Too Large - Server reject file
        const fileSizeMB = receiptFile ? (receiptFile.size / (1024 * 1024)).toFixed(2) : 'N/A';
        errorMessage = `Server từ chối file vì quá lớn (${fileSizeMB}MB). Vui lòng chọn file nhỏ hơn 10MB hoặc nén file trước khi upload.`;
      } else if (error?.status === 500 || error?.status === '500') {
        // 500 = Internal Server Error
        errorMessage = error?.data?.message || 
                      error?.data?.error || 
                      error?.data?.errorMessage ||
                      'Lỗi hệ thống server. Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
      } else if (error?.status === 400 || error?.status === '400') {
        // 400 Bad Request - có thể là field name không đúng hoặc validation error
        errorMessage = error?.data?.message || 
                      error?.data?.error || 
                      error?.data?.errorMessage ||
                      'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại file và thử lại.';
      } else if (error?.status === 'FETCH_ERROR' || error?.error === 'FETCH_ERROR' || error?.message?.includes('CORS') || error?.message?.includes('Failed to fetch') || error?.message?.includes('network') || error?.message?.includes('NetworkError')) {
        // CORS hoặc network error
        if (error?.message?.includes('CORS') || error?.message?.toLowerCase().includes('cors')) {
          errorMessage = 'Lỗi CORS: Backend chưa cấu hình cho phép request từ localhost. Vui lòng liên hệ quản trị viên để cấu hình CORS.';
        } else {
          errorMessage = 'Lỗi kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc liên hệ quản trị viên.';
        }
      } else if (error?.data) {
        // Hiển thị thông báo từ backend (có thể là validation error về contract)
        errorMessage = error.data.message || 
                      error.data.error || 
                      error.data.errorMessage || 
                      (typeof error.data === 'string' ? error.data : null) ||
                      errorMessage;
        
        // Nếu backend báo lỗi về contract, hiển thị thông báo rõ ràng hơn
        if (errorMessage && (errorMessage.includes('hợp đồng') || errorMessage.includes('contract') || errorMessage.includes('CONTRACT_SIGNED'))) {
          errorMessage = 'Vui lòng upload hợp đồng trước khi upload biên lai thanh toán.';
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Log detailed error in development
      if (import.meta.env.DEV) {
        console.error('Upload receipt error:', error);
        console.error('Error details:', {
          status: error?.status,
          data: error?.data,
          message: error?.message,
          inventoryId: selectedTransactionId,
          fileName: receiptFile?.name,
          fileSize: receiptFile?.size,
          fileSizeMB: receiptFile ? (receiptFile.size / (1024 * 1024)).toFixed(2) : 'N/A',
          fileType: receiptFile?.type,
          fullError: error,
          errorDataString: JSON.stringify(error?.data),
        });
      }
      
      showToast(errorMessage, 'error');
    }
  };

  // Removed downloadAndParseExcel - now using GET /inventory-transactions/{inventoryId} to get vehicles data

  const handleConfirmDelivery = async (inventoryId, transaction) => {
    // Lấy dữ liệu vehicles từ API thay vì tải file Excel
    let vehicles = [];
    
    if (transaction?.status === 'IN_TRANSIT') {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
        const token = localStorage.getItem('accessToken');
        
        const response = await fetch(`${baseUrl}/inventory-transactions/${inventoryId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Không thể lấy dữ liệu xe');
        }
        
        const data = await response.json();
        const transactionData = data.data || data;
        
        // Lấy vehicles từ transaction
        const transactionVehicles = transactionData.vehicles || [];
        
        if (transactionVehicles.length > 0) {
          // Format data để gửi lên backend
          vehicles = transactionVehicles.map(vehicle => ({
            vin: vehicle.vin || vehicle.VIN || '',
            engineNumber: vehicle.engineNo || vehicle.engineNumber || vehicle.engine_no || '',
            batterySerial: vehicle.batteryNo || vehicle.batterySerial || vehicle.battery_no || ''
          })).filter(v => v.vin || v.engineNumber || v.batterySerial); // Filter bỏ vehicle rỗng
        }
        
        setDeliveryVehicles(vehicles);
      } catch (error) {
        showToast(error.message || 'Không thể lấy dữ liệu xe. Vui lòng thử lại.', 'error');
        return;
      }
    }
    
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn đã nhận được xe? Thông tin xe sẽ được lưu vào kho.',
      onConfirm: async () => {
        try {
          await confirmDelivery({ 
            inventoryId,
            vehicles: vehicles.length > 0 ? vehicles : undefined
          }).unwrap();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          setDeliveryVehicles([]);
          showToast('Đã xác nhận nhận xe thành công!', 'success');
        } catch (error) {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi xác nhận nhận xe';
          showToast(errorMessage, 'error');
        }
      },
    });
  };

  // Handler xem Excel - lấy dữ liệu từ API
  const handleViewExcel = async (inventoryId) => {
    setIsLoadingExcelData(true);
    setIsViewExcelModalOpen(true);
    setViewExcelData([]);
    
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${baseUrl}/inventory-transactions/${inventoryId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể lấy dữ liệu Excel');
      }
      
      const data = await response.json();
      const transaction = data.data || data;
      
      // Lấy vehicles từ transaction
      const vehicles = transaction.vehicles || [];
      
      if (vehicles.length === 0) {
        showToast('Chưa có dữ liệu xe trong đơn hàng này.', 'info');
        setIsViewExcelModalOpen(false);
        return;
      }
      
      // Format data để hiển thị
      const excelData = vehicles.map(vehicle => ({
        vin: vehicle.vin || vehicle.VIN || '',
        engineNumber: vehicle.engineNo || vehicle.engineNumber || vehicle.engine_no || '',
        batterySerial: vehicle.batteryNo || vehicle.batterySerial || vehicle.battery_no || ''
      }));
      
      setViewExcelData(excelData);
    } catch (error) {
      const errorMessage = error.message || 'Không thể lấy dữ liệu Excel';
      showToast(errorMessage, 'error');
      setIsViewExcelModalOpen(false);
      
      if (import.meta.env.DEV) {
        console.error('View Excel error:', error);
      }
    } finally {
      setIsLoadingExcelData(false);
    }
  };
  
  const handleViewContract = async (inventoryId, transaction = null) => {
    try {
      if (!inventoryId) {
        showToast('Không tìm thấy mã yêu cầu. Vui lòng thử lại sau.', 'error');
        return;
      }
      
      // Gọi API để lấy contract
      const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
      const url = `${baseUrl}/inventory-transactions/${inventoryId}/contract`;
      
      const authData = getAuthFromStorage('dealerManager');
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
      
      if (contractFileUrl) {
        // Nếu có contractFileUrl (ảnh) → hiển thị trong modal
        setSelectedContractImage(contractFileUrl);
        setIsViewContractModalOpen(true);
      } else if (contractHtml) {
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

  // Reset page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  if (isLoading) {
    return (
      <DealerManagerLayout>
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <TableSkeleton rows={5} columns={6} />
          </div>
        </div>
      </DealerManagerLayout>
    );
  }

  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = error?.status === 401;
  
  if (isUnauthorized) {
    return (
      <DealerManagerLayout>
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
      </DealerManagerLayout>
    );
  }

  if (error) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>
        </div>
      </DealerManagerLayout>
    );
  }

  return (
    <DealerManagerLayout>
      <div className="space-y-3 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Kho xe</h1>
            <p className="text-gray-600 text-sm mt-0.5">
              Xem và quản lý tất cả các xe có trong kho của bạn.
            </p>
          </div>
          {activeTab === 'inventory' && (
            <Button onClick={handleOpenOrderModal}>
              <Plus size={20} className="mr-2" />
              Đặt xe từ hãng
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 px-4 py-2 text-center font-medium transition-colors ${
                activeTab === 'inventory'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package size={18} />
                <span>Kho xe</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-4 py-2 text-center font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock size={18} />
                <span>Yêu cầu đặt xe</span>
                {transactions.filter((t) => t.status === 'PENDING').length > 0 && (
                  <Badge variant="warning">
                    {transactions.filter((t) => t.status === 'PENDING').length}
                  </Badge>
                )}
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'inventory' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                <p className="text-xs font-medium text-gray-600 mb-0.5">Tổng số xe trong kho</p>
                <p className="text-xl font-bold text-gray-900">{totalCars}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                <p className="text-xs font-medium text-gray-600 mb-0.5">Xe sắp về</p>
                <p className="text-xl font-bold text-gray-900">{arrivingCars}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                <p className="text-xs font-medium text-gray-600 mb-0.5">Xe có sẵn</p>
                <p className="text-xl font-bold text-gray-900">{availableCars}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <SearchBar
                    placeholder="Tìm kiếm theo Mẫu xe, Màu sắc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setIsFilterModalOpen(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Lọc"
                >
                  <Filter size={20} />
                </button>
                <button 
                  onClick={handleExportInventory}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Xuất báo cáo"
                >
                  <Download size={20} />
                </button>
                <button 
                  onClick={handlePrintInventory}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="In báo cáo"
                >
                  <Printer size={20} />
                </button>
              </div>
            </div>

            {/* Tab selector cho kho hàng */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setInventoryViewTab('available')}
                  className={`flex-1 px-4 py-3 font-medium text-sm ${
                    inventoryViewTab === 'available'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Xe chưa bán
                </button>
                <button
                  onClick={() => setInventoryViewTab('sold')}
                  className={`flex-1 px-4 py-3 font-medium text-sm ${
                    inventoryViewTab === 'sold'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Xe đã bán
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {inventoryViewTab === 'available' ? (
                paginatedStocks.length === 0 ? (
                  <EmptyState
                    icon="package"
                    title="Không có xe trong kho"
                    message={
                      filteredStocks.length === 0
                        ? "Hiện tại không có xe nào trong kho. Hãy đặt xe từ hãng để bắt đầu."
                        : "Không tìm thấy xe phù hợp với từ khóa tìm kiếm."
                    }
                    actionLabel={filteredStocks.length === 0 ? "Đặt xe từ hãng" : undefined}
                    onAction={filteredStocks.length === 0 ? handleOpenOrderModal : undefined}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.Head>MẪU XE</Table.Head>
                          <Table.Head>MÀU SẮC</Table.Head>
                          <Table.Head>MÃ VIN</Table.Head>
                          <Table.Head>SỐ MÁY</Table.Head>
                          <Table.Head>SỐ SERI PIN</Table.Head>
                          <Table.Head>SỐ LƯỢNG</Table.Head>
                          <Table.Head>TÌNH TRẠNG</Table.Head>
                          <Table.Head className="text-center">HÀNH ĐỘNG</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {paginatedStocks.flatMap((stock) => {
                          const quantity = getStockQuantity(stock);
                          // Lấy danh sách xe chưa bán của stock này (giả sử backend trả về vehicles array)
                          const availableVehicles = stock.vehicles?.filter(v => !v.isSold) || [];
                          
                          if (availableVehicles.length === 0) {
                            return [
                              <Table.Row key={`stock-empty-${stock.storeStockId}`}>
                                <Table.Cell className="font-medium">
                                  {stock.modelName || `Mẫu xe ${stock.modelId}`}
                                </Table.Cell>
                                <Table.Cell>{stock.colorName || 'N/A'}</Table.Cell>
                                <Table.Cell colSpan={5} className="text-center text-gray-500">
                                  Chưa có xe trong kho
                                </Table.Cell>
                                <Table.Cell>
                                  <div className="flex items-center justify-center gap-2">
                                    <button 
                                      onClick={() => handleViewStockDetail(stock.storeStockId)}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                      title="Xem chi tiết"
                                    >
                                      <Eye size={16} />
                                    </button>
                                  </div>
                                </Table.Cell>
                              </Table.Row>
                            ];
                          }
                          
                          return availableVehicles.map((vehicle, index) => (
                            <Table.Row key={`stock-${stock.storeStockId}-vehicle-${vehicle.vin || vehicle.vehicleId || index}`}>
                              {index === 0 && (
                                <>
                                  <Table.Cell rowSpan={availableVehicles.length} className="font-medium">
                                    {stock.modelName || `Mẫu xe ${stock.modelId}`}
                                  </Table.Cell>
                                  <Table.Cell rowSpan={availableVehicles.length}>
                                    {stock.colorName || 'N/A'}
                                  </Table.Cell>
                                </>
                              )}
                              <Table.Cell className="font-mono text-sm">{vehicle.vin || 'N/A'}</Table.Cell>
                              <Table.Cell className="font-mono text-sm">{vehicle.engineNumber || 'N/A'}</Table.Cell>
                              <Table.Cell className="font-mono text-sm">{vehicle.batterySerial || vehicle.batterySerialNumber || 'N/A'}</Table.Cell>
                              {index === 0 && (
                                <>
                                  <Table.Cell rowSpan={availableVehicles.length} className="font-semibold">
                                    {availableVehicles.length}
                                  </Table.Cell>
                                  <Table.Cell rowSpan={availableVehicles.length}>
                                    {getStockStatusBadge(stock)}
                                  </Table.Cell>
                                  <Table.Cell rowSpan={availableVehicles.length}>
                                    <div className="flex items-center justify-center gap-2">
                                      <button 
                                        onClick={() => handleViewStockDetail(stock.storeStockId)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Xem chi tiết"
                                      >
                                        <Eye size={16} />
                                      </button>
                                    </div>
                                  </Table.Cell>
                                </>
                              )}
                            </Table.Row>
                          ));
                        })}
                      </Table.Body>
                    </Table>
                  </div>
                )
              ) : (
                <div className="overflow-x-auto">
                  {soldVehiclesData?.data && soldVehiclesData.data.length > 0 ? (
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.Head>MẪU XE</Table.Head>
                          <Table.Head>MÀU SẮC</Table.Head>
                          <Table.Head>MÃ VIN</Table.Head>
                          <Table.Head>SỐ MÁY</Table.Head>
                          <Table.Head>SỐ SERI PIN</Table.Head>
                          <Table.Head>KHÁCH HÀNG</Table.Head>
                          <Table.Head>MÃ ĐƠN</Table.Head>
                          <Table.Head>NGÀY BÁN</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {soldVehiclesData.data.map((vehicle, index) => (
                          <Table.Row key={vehicle.vehicleId || vehicle.vin || `sold-vehicle-${index}`}>
                            <Table.Cell className="font-medium">
                              {vehicle.modelName || 'N/A'}
                            </Table.Cell>
                            <Table.Cell>{vehicle.colorName || 'N/A'}</Table.Cell>
                            <Table.Cell className="font-mono text-sm">{vehicle.vin || 'N/A'}</Table.Cell>
                            <Table.Cell className="font-mono text-sm">{vehicle.engineNumber || 'N/A'}</Table.Cell>
                            <Table.Cell className="font-mono text-sm">{vehicle.batterySerial || vehicle.batterySerialNumber || 'N/A'}</Table.Cell>
                            <Table.Cell>
                              {vehicle.customerName || 'N/A'}
                              {vehicle.customerPhone && (
                                <span className="text-gray-500 text-xs block">{vehicle.customerPhone}</span>
                              )}
                            </Table.Cell>
                            <Table.Cell className="font-mono text-sm">
                              {vehicle.orderId ? `#${vehicle.orderId}` : 'N/A'}
                            </Table.Cell>
                            <Table.Cell>
                              {vehicle.soldDate ? formatDate(vehicle.soldDate) : 'N/A'}
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  ) : (
                    <EmptyState
                      icon="package"
                      title="Không có xe đã bán"
                      message="Hiện tại chưa có xe nào đã được bán."
                    />
                  )}
                </div>
              )}

              {/* Pagination */}
              {filteredStocks.length > 0 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredStocks.length)} của{' '}
                    {filteredStocks.length}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <SearchBar
                placeholder="Tìm kiếm theo mã yêu cầu, model, màu sắc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {isLoadingTransactions ? (
                <div className="p-4">
                  <TableSkeleton rows={5} columns={8} />
                </div>
              ) : paginatedTransactions.length === 0 ? (
                <EmptyState
                  icon="inbox"
                  title="Không có yêu cầu đặt xe"
                  message={
                    filteredTransactions.length === 0
                      ? "Hiện tại không có yêu cầu đặt xe nào. Hãy tạo yêu cầu mới để bắt đầu."
                      : "Không tìm thấy yêu cầu phù hợp với từ khóa tìm kiếm."
                  }
                />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.Head>Mã yêu cầu</Table.Head>
                          <Table.Head>Mẫu xe</Table.Head>
                          <Table.Head>Màu sắc</Table.Head>
                          <Table.Head>Số lượng</Table.Head>
                          <Table.Head>Ngày tạo</Table.Head>
                          <Table.Head>Trạng thái</Table.Head>
                          <Table.Head>Ghi chú</Table.Head>
                          <Table.Head className="text-center">Hành động</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {paginatedTransactions.map((transaction) => {
                          // Status checked - logs removed to prevent data exposure
                          
                          return (
                            <Table.Row key={transaction.inventoryId}>
                            <Table.Cell className="font-mono">
                              #{transaction.inventoryId}
                            </Table.Cell>
                            <Table.Cell className="font-medium">
                              {transaction.modelName || `Mẫu xe ${transaction.modelId}`}
                            </Table.Cell>
                            <Table.Cell>{transaction.colorName || 'N/A'}</Table.Cell>
                            <Table.Cell className="font-semibold">
                              {(() => {
                                // Ưu tiên các field quantity từ transaction
                                const quantity = transaction.quantity || 
                                                transaction.importQuantity || 
                                                transaction.requestedQuantity || 
                                                transaction.orderQuantity || 
                                                transaction.requestQuantity;
                                
                                if (quantity !== undefined && quantity !== null) {
                                  const qty = parseInt(quantity);
                                  return isNaN(qty) ? 1 : qty;
                                }
                                
                                // Nếu có storeStockId, tìm storeStock và lấy quantity
                                if (transaction.storeStockId) {
                                  const relatedStock = stocks.find(
                                    (stock) => stock.storeStockId === transaction.storeStockId || 
                                               stock.stockId === transaction.storeStockId
                                  );
                                  if (relatedStock) {
                                    const stockQuantity = parseInt(relatedStock.quantity || relatedStock.stockQuantity || 1);
                                    return isNaN(stockQuantity) ? 1 : stockQuantity;
                                  }
                                }
                                
                                // Cuối cùng mới dùng default 1
                                return 1;
                              })()}
                            </Table.Cell>
                            <Table.Cell>
                              {(() => {
                                // Kiểm tra nhiều field có thể chứa ngày tạo
                                const dateStr = transaction.createdAt || 
                                              transaction.requestDate || 
                                              transaction.createdDate || 
                                              transaction.dateCreated ||
                                              transaction.orderDate;
                                
                                if (dateStr) {
                                  return formatDate(dateStr);
                                }
                                return 'N/A';
                              })()}
                            </Table.Cell>
                            <Table.Cell>{getTransactionStatusBadge(transaction.status)}</Table.Cell>
                            <Table.Cell className="max-w-xs truncate">
                              {transaction.notes || '-'}
                            </Table.Cell>
                            <Table.Cell>
                              <div className="flex items-center justify-center gap-2">
                                {/* Flow mới theo yêu cầu */}
                                {(() => {
                                  // Nếu bị từ chối hoặc hủy → không có nút gì
                                  if (transaction.status === 'REJECTED' || transaction.status === 'CANCELLED') {
                                    return null;
                                  }
                                  
                                  // Các status không hiển thị nút "Xem hóa đơn": PENDING, CONFIRMED, EVM_SIGNED, CONTRACT_SIGNED, REJECTED, CANCELLED
                                  const hiddenReceiptStatuses = ['PENDING', 'CONFIRMED', 'EVM_SIGNED', 'CONTRACT_SIGNED', 'REJECTED', 'CANCELLED'];
                                  const canViewReceipt = !hiddenReceiptStatuses.includes(transaction.status);
                                  
                                  // Sử dụng helper function để kiểm tra
                                  const { hasContract, hasUploadedContract, hasReceipt, hasUploadedReceipt } = getTransactionChecks(transaction);
                                  
                                  // Giai đoạn 1: EVM đã ký hợp đồng (EVM_SIGNED) - Chờ Manager ký
                                  // Không hiển thị "Upload hợp đồng" khi đã xác nhận (CONFIRMED) hoặc sau đó
                                  const isStage1 = (transaction.status === 'EVM_SIGNED' || 
                                                  (hasContract && !hasUploadedContract)) &&
                                                  transaction.status !== 'CONFIRMED' &&
                                                  transaction.status !== 'PAYMENT_CONFIRMED' &&
                                                  transaction.status !== 'IN_TRANSIT' &&
                                                  transaction.status !== 'DELIVERED';
                                  
                                  // Giai đoạn 2: Manager đã upload hợp đồng (SIGNED/CONTRACT_SIGNED) - Chờ upload hóa đơn
                                  const isStage2 = (transaction.status === 'SIGNED' || 
                                                   transaction.status === 'CONTRACT_SIGNED') &&
                                                   !hasUploadedReceipt &&
                                                   transaction.status !== 'CONFIRMED' &&
                                                   transaction.status !== 'PAYMENT_CONFIRMED' &&
                                                   transaction.status !== 'IN_TRANSIT' &&
                                                   transaction.status !== 'DELIVERED';
                                  
                                  // Giai đoạn 3: Manager đã upload hóa đơn (FILE_UPLOADED) hoặc đã xác nhận thanh toán
                                  const isStage3 = transaction.status === 'FILE_UPLOADED' || 
                                                  transaction.status === 'PAYMENT_CONFIRMED' ||
                                                  (hasUploadedReceipt && transaction.status !== 'IN_TRANSIT' && 
                                                   transaction.status !== 'DELIVERED');
                                  
                                  return (
                                    <>
                                      {/* Giai đoạn 1: EVM đã ký hợp đồng - Chờ Manager ký */}
                                      {isStage1 && (
                                        <>
                                          {/* Xem hợp đồng từ EVM */}
                                          {hasContract && (
                                            <IconButton
                                              icon={FileText}
                                              text="Xem hợp đồng"
                                              onClick={() => handleViewContract(transaction.inventoryId, transaction)}
                                            />
                                          )}
                                          {/* Upload hợp đồng đã ký */}
                                          <IconButton
                                            icon={Upload}
                                            text="Upload hợp đồng"
                                            onClick={() => {
                                              setSelectedTransactionId(transaction.inventoryId);
                                              setIsUploadContractModalOpen(true);
                                            }}
                                          />
                                          {/* Xem chi tiết */}
                                          <IconButton
                                            icon={Eye}
                                            text="Xem chi tiết"
                                            onClick={() => handleViewTransactionDetail(transaction.inventoryId)}
                                          />
                                        </>
                                      )}
                                      
                                      {/* Giai đoạn 2: Manager đã upload hợp đồng - Chờ upload hóa đơn */}
                                      {isStage2 && (
                                        <>
                                          {/* Xem hợp đồng Manager đã upload */}
                                          <IconButton
                                            icon={FileText}
                                            text="Xem hợp đồng"
                                            onClick={() => handleViewContract(transaction.inventoryId, transaction)}
                                          />
                                          {/* Xem thông tin thanh toán */}
                                          <IconButton
                                            icon={CreditCard}
                                            text="Xem thông tin thanh toán"
                                            onClick={() => {
                                              setSelectedTransactionId(transaction.inventoryId);
                                              setIsPaymentInfoModalOpen(true);
                                            }}
                                          />
                                          {/* Xem chi tiết */}
                                          <IconButton
                                            icon={Eye}
                                            text="Xem chi tiết"
                                            onClick={() => handleViewTransactionDetail(transaction.inventoryId)}
                                          />
                                          {/* Upload hóa đơn thanh toán */}
                                          <IconButton
                                            icon={Receipt}
                                            text="Upload hóa đơn thanh toán"
                                            onClick={async () => {
                                              setSelectedTransactionId(transaction.inventoryId);
                                              if (transaction.inventoryId) {
                                                try {
                                                  await refetchTransactionDetail();
                                                } catch (err) {
                                                  if (import.meta.env.DEV) {
                                                    console.warn('Failed to refetch transaction detail:', err);
                                                  }
                                                }
                                              }
                                              setIsUploadReceiptModalOpen(true);
                                            }}
                                          />
                                        </>
                                      )}
                                      
                                      {/* Giai đoạn 3: Manager đã upload hóa đơn - Chỉ hiển thị xem, không có upload */}
                                      {isStage3 && (
                                        <>
                                          {/* Xem hóa đơn đã upload - Luôn hiển thị khi status là FILE_UPLOADED */}
                                          <IconButton
                                            icon={Receipt}
                                            text="Xem hóa đơn đã upload"
                                            onClick={() => handleViewReceipt(transaction, true)}
                                          />
                                          {/* Xem hợp đồng Manager đã upload - Luôn hiển thị khi có hợp đồng hoặc status là PAYMENT_CONFIRMED */}
                                          {(hasUploadedContract || hasContract || transaction.status === 'PAYMENT_CONFIRMED') && (
                                            <IconButton
                                              icon={FileText}
                                              text="Xem hợp đồng"
                                              onClick={() => handleViewContract(transaction.inventoryId, transaction)}
                                            />
                                          )}
                                          {/* Xem chi tiết */}
                                          <IconButton
                                            icon={Eye}
                                            text="Xem chi tiết"
                                            onClick={() => handleViewTransactionDetail(transaction.inventoryId)}
                                          />
                                        </>
                                      )}
                                      
                                      {/* Nút "Xem hóa đơn" cho các status khác (không phải PENDING, CONFIRMED, EVM_SIGNED, CONTRACT_SIGNED, REJECTED, CANCELLED) */}
                                      {/* Chỉ hiển thị khi không phải các stage trên và không phải PAYMENT_CONFIRMED, IN_TRANSIT, DELIVERED */}
                                      {canViewReceipt && hasReceipt && !isStage1 && !isStage2 && !isStage3 && 
                                       transaction.status !== 'PAYMENT_CONFIRMED' &&
                                       transaction.status !== 'IN_TRANSIT' &&
                                       transaction.status !== 'DELIVERED' && (
                                        <IconButton
                                          icon={Receipt}
                                          text="Xem hóa đơn"
                                          onClick={() => handleViewReceipt(transaction, false)}
                                        />
                                      )}
                                      
                                      {/* Button "Xem chi tiết" chung - chỉ hiển thị khi không có trong các stage */}
                                      {!isStage1 && !isStage2 && !isStage3 && 
                                       transaction.status !== 'IN_TRANSIT' &&
                                       transaction.status !== 'DELIVERED' && (
                                        <IconButton
                                          icon={Eye}
                                          text="Xem chi tiết"
                                          onClick={() => handleViewTransactionDetail(transaction.inventoryId)}
                                        />
                                      )}
                                    </>
                                  );
                                })()}
                                {/* DELIVERED: Xem hợp đồng, Xem hóa đơn, và Xem chi tiết */}
                                {transaction.status === 'DELIVERED' && (() => {
                                  const { hasContract, hasUploadedContract, hasReceipt } = getTransactionChecks(transaction);
                                  
                                  return (
                                    <>
                                      {/* Xem hợp đồng */}
                                      {(hasUploadedContract || hasContract) && (
                                        <IconButton
                                          icon={FileText}
                                          text="Xem hợp đồng"
                                          onClick={() => handleViewContract(transaction.inventoryId, transaction)}
                                        />
                                      )}
                                      {/* Xem hóa đơn đã upload */}
                                      {hasReceipt && (
                                        <IconButton
                                          icon={Receipt}
                                          text="Xem hóa đơn"
                                          onClick={() => handleViewReceipt(transaction, false)}
                                        />
                                      )}
                                      {/* Xem chi tiết */}
                                      <IconButton
                                        icon={Eye}
                                        text="Xem chi tiết"
                                        onClick={() => handleViewTransactionDetail(transaction.inventoryId)}
                                      />
                                    </>
                                  );
                                })()}
                                {/* IN_TRANSIT: Xem hợp đồng, Xem hóa đơn, Tải Excel, và Đã nhận được hàng */}
                                {transaction.status === 'IN_TRANSIT' && (() => {
                                  const { hasContract, hasUploadedContract, hasReceipt } = getTransactionChecks(transaction);
                                  
                                  return (
                                    <>
                                      {/* Xem hợp đồng */}
                                      {(hasUploadedContract || hasContract) && (
                                        <IconButton
                                          icon={FileText}
                                          text="Xem hợp đồng"
                                          onClick={() => handleViewContract(transaction.inventoryId, transaction)}
                                        />
                                      )}
                                      {/* Xem hóa đơn đã upload */}
                                      {hasReceipt && (
                                        <IconButton
                                          icon={Receipt}
                                          text="Xem hóa đơn"
                                          onClick={() => handleViewReceipt(transaction, false)}
                                        />
                                      )}
                                      {/* Xem file Excel xe */}
                                      <IconButton
                                        icon={Eye}
                                        text="Xem file Excel xe"
                                        onClick={() => handleViewExcel(transaction.inventoryId)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                      />
                                      {/* Đã nhận được hàng */}
                                      <IconButton
                                        icon={Package}
                                        text={isConfirmingDelivery ? 'Đang xác nhận...' : 'Đã nhận được hàng'}
                                        onClick={() => handleConfirmDelivery(transaction.inventoryId, transaction)}
                                        disabled={isConfirmingDelivery}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      />
                                    </>
                                  );
                                })()}
                              </div>
                            </Table.Cell>
                          </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {filteredTransactions.length > 0 && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Hiển thị {transactionStartIndex + 1}-{Math.min(transactionEndIndex, filteredTransactions.length)} của{' '}
                        {filteredTransactions.length}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Trước
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === transactionPages}
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {/* Order Modal */}
        <Modal
          isOpen={isOrderModalOpen}
          onClose={() => {
            setIsOrderModalOpen(false);
            setFormData({
              modelId: '',
              colorId: '',
              quantity: 1,
              notes: '',
            });
            setSelectedModelId('');
          }}
          title="Đặt xe từ hãng"
          size="lg"
        >
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mẫu xe *
              </label>
              <Dropdown
                options={[
                  { value: '', label: 'Chọn mẫu xe' },
                  ...models.map((model) => ({
                    value: model.modelId?.toString(),
                    label: model.modelName || `Mẫu xe ${model.modelId}`,
                  })),
                ]}
                value={formData.modelId}
                onChange={(value) => {
                  handleModelChange(value);
                  if (formErrors.modelId) {
                    setFormErrors({ ...formErrors, modelId: '' });
                  }
                }}
                placeholder="Chọn mẫu xe"
              />
              {formErrors.modelId && (
                <p className="text-sm text-red-600 mt-1">{formErrors.modelId}</p>
              )}
            </div>

            {selectedModelId && modelColors.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Màu sắc *
                </label>
                <Dropdown
                  options={[
                    { value: '', label: 'Chọn màu sắc' },
                    ...modelColors.map((modelColor) => ({
                      value: modelColor.colorId?.toString(),
                      label: modelColor.colorName || `Màu ${modelColor.colorId}`,
                    })),
                  ]}
                  value={formData.colorId}
                  onChange={(value) => {
                    setFormData({ ...formData, colorId: value });
                    if (formErrors.colorId) {
                      setFormErrors({ ...formErrors, colorId: '' });
                    }
                  }}
                  placeholder="Chọn màu sắc"
                />
                {formErrors.colorId && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.colorId}</p>
                )}
              </div>
            )}

            <div>
            <Input
              label="Số lượng *"
              type="number"
              min="1"
              value={formData.quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  setFormData({ ...formData, quantity: value });
                  if (formErrors.quantity) {
                    setFormErrors({ ...formErrors, quantity: '' });
                  }
                }}
              required
            />
              {formErrors.quantity && (
                <p className="text-sm text-red-600 mt-1">{formErrors.quantity}</p>
              )}
            </div>

            {/* Hiển thị giá tiền */}
            {formData.modelId && formData.colorId && formData.quantity > 0 && (() => {
              const selectedModelColor = modelColors.find(
                (mc) => mc.modelId === parseInt(formData.modelId) && mc.colorId === parseInt(formData.colorId)
              );
              const unitPrice = selectedModelColor?.price || 0;
              const totalPrice = unitPrice * formData.quantity;
              
              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Giá đơn vị:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {unitPrice > 0 
                        ? new Intl.NumberFormat('vi-VN').format(unitPrice) + '₫'
                        : 'Chưa có giá'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-blue-200 pt-2">
                    <span className="text-base font-semibold text-gray-900">Tổng tiền:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {totalPrice > 0 
                        ? new Intl.NumberFormat('vi-VN').format(totalPrice) + '₫'
                        : '0₫'
                      }
                    </span>
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Nhập ghi chú nếu có..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOrderModalOpen(false);
                  setFormData({
                    modelId: '',
                    colorId: '',
                    quantity: 1,
                    notes: '',
                  });
                  setSelectedModelId('');
                }}
                className="flex-1"
                disabled={isCreating}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Đang gửi...
                  </>
                ) : (
                  'Gửi yêu cầu'
                )}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Upload Contract Modal */}
        <Modal
          isOpen={isUploadContractModalOpen}
          onClose={() => {
            setIsUploadContractModalOpen(false);
            setContractFile(null);
            setSelectedTransactionId(null);
          }}
          title="Upload Hợp Đồng Đã Ký"
          size="md"
        >
          <form onSubmit={handleUploadContract} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file hợp đồng đã ký (PDF hoặc hình ảnh) *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Validate file type: chỉ cho phép PDF hoặc hình ảnh
                    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                    const fileType = file.type || '';
                    const fileName = file.name || '';
                    const isValidType = allowedTypes.includes(fileType) || 
                                       fileName.toLowerCase().endsWith('.pdf') ||
                                       fileName.toLowerCase().endsWith('.jpg') ||
                                       fileName.toLowerCase().endsWith('.jpeg') ||
                                       fileName.toLowerCase().endsWith('.png');
                    
                    if (!isValidType) {
                      showToast('File phải là PDF hoặc hình ảnh (JPG, PNG)', 'error');
                      e.target.value = ''; // Reset input
                      setContractFile(null);
                      return;
                    }
                    
                    setContractFile(file);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Vui lòng upload file hợp đồng đã được ký (PDF hoặc hình ảnh: JPG, PNG)
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUploadContractModalOpen(false);
                  setContractFile(null);
                  setSelectedTransactionId(null);
                }}
                className="flex-1"
                disabled={isUploadingContract}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isUploadingContract}
              >
                {isUploadingContract ? 'Đang upload...' : 'Upload'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Upload Receipt Modal */}
        <Modal
          isOpen={isUploadReceiptModalOpen}
          onClose={() => {
            setIsUploadReceiptModalOpen(false);
            setReceiptFile(null);
            setSelectedTransactionId(null);
          }}
          title="Upload Biên Lai Thanh Toán"
          size="md"
        >
          <form onSubmit={handleUploadReceipt} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn file biên lai thanh toán (PDF hoặc hình ảnh) *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setReceiptFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Vui lòng upload file biên lai thanh toán (PDF, JPG, PNG). Kích thước tối đa: 10MB.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUploadReceiptModalOpen(false);
                  setReceiptFile(null);
                  setSelectedTransactionId(null);
                }}
                className="flex-1"
                disabled={isUploadingReceipt}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isUploadingReceipt}
              >
                {isUploadingReceipt ? 'Đang upload...' : 'Upload'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Stock Detail Modal */}
        <Modal
          isOpen={isStockDetailModalOpen}
          onClose={() => {
            setIsStockDetailModalOpen(false);
            setSelectedStockId(null);
          }}
          title="Chi tiết Kho xe"
          size="lg"
        >
          {isLoadingStockDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : stockDetailData?.data ? (
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mẫu xe</label>
                  <p className="text-base font-semibold text-gray-900">{stockDetailData.data.modelName || 'N/A'}</p>
              </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Màu sắc</label>
                  <p className="text-base text-gray-900">{stockDetailData.data.colorName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số lượng</label>
                  <p className="text-base font-semibold text-gray-900">{getStockQuantity(stockDetailData.data)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tình trạng</label>
                  <div className="mt-1">{getStockStatusBadge(stockDetailData.data)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(stockDetailData.data.status)}</div>
                </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                  variant="outline"
                  onClick={() => {
                    setIsStockDetailModalOpen(false);
                    setSelectedStockId(null);
                  }}
              >
                Đóng
              </Button>
            </div>
          </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
          )}
        </Modal>

        {/* Transaction Detail Modal */}
        <Modal
          isOpen={isTransactionDetailModalOpen}
          onClose={() => {
            setIsTransactionDetailModalOpen(false);
            setSelectedTransactionId(null);
          }}
          title="Chi tiết yêu cầu đặt xe"
          size="lg"
        >
          {isLoadingTransactionDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : transactionDetailData?.data ? (
          <div className="space-y-5">
              {/* Header đơn giản */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mã yêu cầu</p>
                  <p className="text-xl font-semibold text-gray-900">#{transactionDetailData.data.inventoryId}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-2">Trạng thái</p>
                  <div>{getTransactionStatusBadge(transactionDetailData.data.status)}</div>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu xe</label>
                  <p className="text-base text-gray-900">{transactionDetailData.data.modelName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                  <p className="text-base text-gray-900">{transactionDetailData.data.colorName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                  <p className="text-base text-gray-900">
                    {transactionDetailData.data.importQuantity || 
                     transactionDetailData.data.quantity || 
                     transactionDetailData.data.requestedQuantity || 
                     0} xe
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                  <p className="text-base text-gray-900">
                    {formatDate(
                      transactionDetailData.data.createdAt || 
                      transactionDetailData.data.requestDate || 
                      transactionDetailData.data.createdDate || 
                      transactionDetailData.data.dateCreated ||
                      transactionDetailData.data.orderDate
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng giá</label>
                  <p className="text-xl font-semibold text-gray-900">
                    {(() => {
                      const detail = transactionDetailData.data;
                      let totalPrice = detail.totalPrice || 
                                      detail.totalBasePrice ||
                                      detail.totalAmount || 
                                      detail.price;
                      
                      if (!totalPrice || totalPrice === 0) {
                        const unitPrice = detail.unitPrice || 
                                         detail.unitBasePrice ||
                                         detail.price || 
                                         detail.modelColorPrice || 
                                         0;
                        const quantity = detail.importQuantity || 
                                       detail.quantity || 
                                       detail.requestedQuantity || 
                                       0;
                        totalPrice = unitPrice * quantity;
                      }
                      
                      return new Intl.NumberFormat('vi-VN').format(totalPrice || 0) + '₫';
                    })()}
                  </p>
                </div>
                {transactionDetailData.data.notes && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                      {transactionDetailData.data.notes}
                    </p>
                  </div>
                )}
                {/* Hợp đồng */}
                {(transactionDetailData.data.contractFile || transactionDetailData.data.contractPath) && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hợp đồng</label>
                    {transactionDetailData.data.contractFile ? (
                      <a
                        href={transactionDetailData.data.contractFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Xem hợp đồng
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600">Đã có hợp đồng</p>
                    )}
                  </div>
                )}
                {/* Hóa đơn thanh toán */}
                {transactionDetailData.data.receiptImage && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hóa đơn thanh toán</label>
                    <img
                      src={transactionDetailData.data.receiptImage}
                      alt="Receipt"
                      className="max-w-full h-auto rounded border border-gray-200"
                    />
                  </div>
                )}
              </div>
              
              {/* Footer buttons */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTransactionDetailModalOpen(false);
                    setSelectedTransactionId(null);
                  }}
                >
                  Đóng
                </Button>
              </div>
          </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
          )}
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

        {/* Filter Modal */}
        <Modal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          title="Lọc kho xe"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Tính năng lọc nâng cao đang được phát triển. Hiện tại bạn có thể sử dụng thanh tìm kiếm để lọc theo tên model hoặc màu sắc.</p>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsFilterModalOpen(false)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Stock Modal - Placeholder */}
        <Modal
          isOpen={isEditStockModalOpen}
          onClose={() => {
            setIsEditStockModalOpen(false);
            setSelectedStockId(null);
          }}
          title="Chỉnh sửa Kho xe"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Tính năng chỉnh sửa kho xe đang được phát triển.</p>
            <div className="flex justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditStockModalOpen(false);
                  setSelectedStockId(null);
                }}
              >
                Đóng
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

        {/* Payment Info Modal - Hiển thị sau khi upload contract */}
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
              {import.meta.env.DEV && (
                <div className="text-xs text-gray-400 mt-2">
                  Error: {JSON.stringify(paymentInfoError, null, 2)}
                </div>
              )}
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
                  <strong>Lưu ý:</strong> Vui lòng chuyển khoản đúng số tiền và ghi rõ mã giao dịch (nếu có) trong nội dung chuyển khoản.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <div className="text-gray-500">Không có thông tin thanh toán</div>
              <div className="text-sm text-gray-400">
                Vui lòng thử lại sau hoặc liên hệ quản trị viên
              </div>
              {import.meta.env.DEV && (
                <div className="text-xs text-gray-400 mt-2">
                  Debug: selectedTransactionId = {selectedTransactionId}, paymentInfoData = {JSON.stringify(paymentInfoData, null, 2)}
                </div>
              )}
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
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                setIsPaymentInfoModalOpen(false);
                setSelectedTransactionId(null);
              }}
            >
              Đã hiểu
            </Button>
          </div>
        </Modal>

        {/* View Excel Modal */}
        <Modal
          isOpen={isViewExcelModalOpen}
          onClose={() => {
            setIsViewExcelModalOpen(false);
            setViewExcelData([]);
          }}
          title="Nội dung file Excel thông tin xe"
          size="lg"
        >
          {isLoadingExcelData ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : viewExcelData.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">STT</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mã VIN</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Số máy</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Số seri pin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {viewExcelData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{row.vin || '-'}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{row.engineNumber || '-'}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900">{row.batterySerial || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setIsViewExcelModalOpen(false);
                    setViewExcelData([]);
                  }}
                >
                  Đóng
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Không có dữ liệu để hiển thị
            </div>
          )}
        </Modal>

        {/* Toast Notifications */}
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </DealerManagerLayout>
  );
};

export default InventoryPage;

