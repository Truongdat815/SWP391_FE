import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, Printer, Plus, Eye, Edit, Truck, Package, Clock, FileText, Upload, Receipt, AlertCircle } from 'lucide-react';
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
  useConfirmReceivingMutation,
  useGetContractQuery,
} from '../../../api/dealerManager/inventoryApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { useGetModelColorsByModelQuery } from '../../../api/dealerStaff/vehicleApi';
import { useGetMyStoreQuery } from '../../../api/dealerManager/storeApi';

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'requests'
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isUploadContractModalOpen, setIsUploadContractModalOpen] = useState(false);
  const [isUploadReceiptModalOpen, setIsUploadReceiptModalOpen] = useState(false);
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
  const { toasts, showToast, removeToast } = useToast();

  // Reset page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, activeTab]);

  const { data: stocksData, isLoading, error } = useGetAllStoreStocksQuery();
  const { data: modelsData } = useGetAllModelsQuery();
  const { data: transactionsData, isLoading: isLoadingTransactions } = useGetAllInventoryTransactionsQuery();
  const { data: modelColorsData } = useGetModelColorsByModelQuery(selectedModelId, {
    skip: !selectedModelId,
  });
  const { data: storeData } = useGetMyStoreQuery();
  const { data: stockDetailData, isLoading: isLoadingStockDetail } = useGetStoreStockByIdQuery(selectedStockId, {
    skip: !selectedStockId,
  });
  const { data: transactionDetailData, isLoading: isLoadingTransactionDetail } = useGetInventoryTransactionByIdQuery(selectedTransactionId, {
    skip: !selectedTransactionId,
  });
  const { data: contractData } = useGetContractQuery(selectedTransactionId, {
    skip: !selectedTransactionId,
  });
  const [createTransaction, { isLoading: isCreating }] = useCreateInventoryTransactionMutation();
  const [downloadContractHtml] = useDownloadContractHtmlMutation();
  const [uploadContract, { isLoading: isUploadingContract }] = useUploadContractMutation();
  const [uploadReceipt, { isLoading: isUploadingReceipt }] = useUploadReceiptMutation();
  const [confirmReceiving, { isLoading: isConfirmingReceiving }] = useConfirmReceivingMutation();

  const store = storeData?.data;

  const stocks = stocksData?.data || [];
  const models = modelsData?.data || [];
  const transactions = transactionsData?.data || [];
  const modelColors = modelColorsData?.data || [];

  // Debug logging trong development
  if (import.meta.env.DEV && transactions.length > 0) {
    console.log('Inventory Transactions Sample:', transactions.slice(0, 2));
    console.log('Transaction fields:', transactions[0] ? Object.keys(transactions[0]) : []);
    // Log quantity và date fields
    if (transactions[0]) {
      const sample = transactions[0];
      console.log('Sample transaction quantity fields:', {
        quantity: sample.quantity,
        importQuantity: sample.importQuantity,
        requestedQuantity: sample.requestedQuantity,
        orderQuantity: sample.orderQuantity,
        requestQuantity: sample.requestQuantity,
      });
      console.log('Sample transaction date fields:', {
        createdAt: sample.createdAt,
        requestDate: sample.requestDate,
        createdDate: sample.createdDate,
        dateCreated: sample.dateCreated,
        orderDate: sample.orderDate,
      });
    }
  }

  // Tính toán metrics - Tính từ quantity thực tế của mỗi stock
  const totalCars = stocks.reduce((sum, stock) => {
    const quantity = parseInt(stock.quantity || stock.stockQuantity || 1);
    return sum + (isNaN(quantity) ? 1 : quantity);
  }, 0);
  
  const arrivingCars = stocks
    .filter((stock) => stock.status === 'IN_TRANSIT' || stock.status === 'ARRIVING')
    .reduce((sum, stock) => {
      const quantity = parseInt(stock.quantity || stock.stockQuantity || 1);
      return sum + (isNaN(quantity) ? 1 : quantity);
    }, 0);
  
  const availableCars = stocks
    .filter((stock) => stock.status === 'AVAILABLE')
    .reduce((sum, stock) => {
      const quantity = parseInt(stock.quantity || stock.stockQuantity || 1);
      return sum + (isNaN(quantity) ? 1 : quantity);
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
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
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
  const transactionPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const transactionStartIndex = (currentPage - 1) * itemsPerPage;
  const transactionEndIndex = transactionStartIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(transactionStartIndex, transactionEndIndex);

  const getTransactionStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Chờ EVM duyệt' },
      ACCEPTED: { variant: 'info', label: 'Đã duyệt' },
      CONFIRMED: { variant: 'info', label: 'Đã xác nhận' },
      DRAFT: { variant: 'default', label: 'Nháp hợp đồng' },
      EVM_SIGNED: { variant: 'info', label: 'Chờ ký hợp đồng' },
      SIGNED: { variant: 'success', label: 'Đã ký hợp đồng' },
      CONTRACT_SIGNED: { variant: 'success', label: 'Đã ký hợp đồng' },
      FILE_UPLOADED: { variant: 'info', label: 'Chờ upload hóa đơn' },
      PAYMENT_CONFIRMED: { variant: 'info', label: 'Đã xác nhận thanh toán' },
      PROCESSING: { variant: 'info', label: 'Đang chuẩn bị' },
      SHIPPING: { variant: 'info', label: 'Đang vận chuyển' },
      IN_TRANSIT: { variant: 'info', label: 'Đang vận chuyển' },
      DELIVERED: { variant: 'success', label: 'Đã nhận xe' },
      COMPLETED: { variant: 'success', label: 'Hoàn thành' },
      REJECTED: { variant: 'error', label: 'Đã từ chối' },
      CANCELLED: { variant: 'default', label: 'Đã hủy' },
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
      errors.modelId = 'Vui lòng chọn model xe';
    }
    if (!formData.colorId) {
      errors.colorId = 'Vui lòng chọn màu sắc';
    }
    if (!formData.quantity || formData.quantity < 1) {
      errors.quantity = 'Số lượng phải lớn hơn 0';
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
      
      // Debug logging
      if (import.meta.env.DEV) {
        console.log('Creating transaction with data:', {
          modelId,
          colorId,
          quantity,
          importQuantity: quantity,
          unitPrice,
          totalPrice,
          storeId: store.storeId,
        });
      }
      
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
        throw new Error('Không thể tải hợp đồng');
      }
      
      const htmlContent = await response.text();
      
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
        console.error(error);
      }
    }
  };

  const handleUploadContract = async (e) => {
    e.preventDefault();
    if (!contractFile || !selectedTransactionId) {
      showToast('Vui lòng chọn file hợp đồng', 'warning');
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
      setSelectedTransactionId(null);
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

  const handleViewShipping = (stock) => {
    showToast('Tính năng vận chuyển đang được phát triển', 'info');
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
                <th>Ngày nhập kho</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStocks.map(stock => `
                <tr>
                  <td>${stock.modelName || 'N/A'}</td>
                  <td>${stock.colorName || 'N/A'}</td>
                  <td>${getStockQuantity(stock)}</td>
                  <td>${getStockStatusBadge(stock).props.children}</td>
                  <td>${formatDate(stock.stockedDate || stock.receivedDate || stock.createdAt)}</td>
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
      showToast(error?.data?.message || 'Có lỗi xảy ra khi upload hóa đơn', 'error');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleConfirmReceiving = async (inventoryId) => {
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn đã nhận được xe?',
      onConfirm: async () => {
        try {
          await confirmReceiving(inventoryId).unwrap();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          showToast('Đã xác nhận nhận xe thành công!', 'success');
        } catch (error) {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi xác nhận nhận xe';
          showToast(errorMessage, 'error');
        }
      },
    });
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
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Kho xe</h1>
            <p className="text-gray-600 mt-1">
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
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'inventory'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package size={20} />
                <span>Kho xe</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock size={20} />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard
                title="Tổng số xe trong kho"
                value={totalCars}
                change=""
                changeType="neutral"
              />
              <MetricCard
                title="Xe sắp về"
                value={arrivingCars}
                change=""
                changeType="neutral"
              />
              <MetricCard
                title="Xe có sẵn"
                value={availableCars}
                change=""
                changeType="neutral"
              />
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-4">
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

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {paginatedStocks.length === 0 ? (
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
                        <Table.Head>SỐ LƯỢNG</Table.Head>
                        <Table.Head>TÌNH TRẠNG</Table.Head>
                        <Table.Head>NGÀY NHẬP KHO</Table.Head>
                        <Table.Head className="text-center">HÀNH ĐỘNG</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {paginatedStocks.map((stock) => {
                        const quantity = getStockQuantity(stock);
                        return (
                          <Table.Row key={stock.storeStockId}>
                            <Table.Cell className="font-medium">
                              {stock.modelName || `Model ${stock.modelId}`}
                            </Table.Cell>
                            <Table.Cell>{stock.colorName || 'N/A'}</Table.Cell>
                            <Table.Cell className="font-semibold">{quantity}</Table.Cell>
                            <Table.Cell>{getStockStatusBadge(stock)}</Table.Cell>
                            <Table.Cell>{formatDate(stock.stockedDate || stock.receivedDate || stock.createdAt)}</Table.Cell>
                            <Table.Cell>
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleViewStockDetail(stock.storeStockId)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Xem chi tiết"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  onClick={() => handleEditStock(stock)}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => handleViewShipping(stock)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Vận chuyển"
                                >
                                  <Truck size={16} />
                                </button>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table>
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
                          <Table.Head>Model</Table.Head>
                          <Table.Head>Màu sắc</Table.Head>
                          <Table.Head>Số lượng</Table.Head>
                          <Table.Head>Ngày tạo</Table.Head>
                          <Table.Head>Trạng thái</Table.Head>
                          <Table.Head>Ghi chú</Table.Head>
                          <Table.Head className="text-center">Hành động</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {paginatedTransactions.map((transaction) => (
                          <Table.Row key={transaction.inventoryId}>
                            <Table.Cell className="font-mono">
                              #{transaction.inventoryId}
                            </Table.Cell>
                            <Table.Cell className="font-medium">
                              {transaction.modelName || `Model ${transaction.modelId}`}
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
                                {/* EVM_SIGNED: Download contract HTML */}
                                {transaction.status === 'EVM_SIGNED' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadContract(transaction.inventoryId)}
                                  >
                                    <Download size={16} className="mr-1" />
                                    Tải hợp đồng
                                  </Button>
                                )}
                                {/* EVM_SIGNED: Upload signed contract */}
                                {transaction.status === 'EVM_SIGNED' && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedTransactionId(transaction.inventoryId);
                                      setIsUploadContractModalOpen(true);
                                    }}
                                  >
                                    <Upload size={16} className="mr-1" />
                                    Upload hợp đồng
                                  </Button>
                                )}
                                {/* FILE_UPLOADED hoặc PAYMENT_CONFIRMED: Upload receipt nếu chưa upload */}
                                {(transaction.status === 'FILE_UPLOADED' || transaction.status === 'PAYMENT_CONFIRMED') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedTransactionId(transaction.inventoryId);
                                      setIsUploadReceiptModalOpen(true);
                                    }}
                                  >
                                    <Receipt size={16} className="mr-1" />
                                    Upload hóa đơn
                                  </Button>
                                )}
                                {/* SHIPPING hoặc IN_TRANSIT: Nhận xe */}
                                {(transaction.status === 'SHIPPING' || transaction.status === 'IN_TRANSIT') && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleConfirmReceiving(transaction.inventoryId)}
                                    disabled={isConfirmingReceiving}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    <Package size={16} className="mr-1" />
                                    {isConfirmingReceiving ? 'Đang xác nhận...' : 'Nhận xe'}
                                  </Button>
                                )}
                                {/* DELIVERED hoặc COMPLETED: Đã nhận */}
                                {(transaction.status === 'DELIVERED' || transaction.status === 'COMPLETED') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewTransactionDetail(transaction.inventoryId)}
                                  >
                                    <Eye size={16} className="mr-1" />
                                    Chi tiết
                                  </Button>
                                )}
                                {/* Các status khác: Xem chi tiết */}
                                {!['SHIPPING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'FILE_UPLOADED', 'PAYMENT_CONFIRMED'].includes(transaction.status) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewTransactionDetail(transaction.inventoryId)}
                                  >
                                    <Eye size={16} className="mr-1" />
                                    Chi tiết
                                  </Button>
                                )}
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))}
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
                Model xe *
              </label>
              <Dropdown
                options={[
                  { value: '', label: 'Chọn model' },
                  ...models.map((model) => ({
                    value: model.modelId?.toString(),
                    label: model.modelName || `Model ${model.modelId}`,
                  })),
                ]}
                value={formData.modelId}
                onChange={(value) => {
                  handleModelChange(value);
                  if (formErrors.modelId) {
                    setFormErrors({ ...formErrors, modelId: '' });
                  }
                }}
                placeholder="Chọn model"
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
                disabled={isCreating || !formData.modelId || !formData.colorId}
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
                Chọn file hợp đồng đã ký (HTML hoặc PDF) *
              </label>
              <input
                type="file"
                accept=".html,.pdf"
                onChange={(e) => setContractFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Vui lòng upload file hợp đồng đã được ký (HTML hoặc PDF)
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
                disabled={isUploadingContract || !contractFile}
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
                Vui lòng upload file biên lai thanh toán (PDF, JPG, PNG)
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
                disabled={isUploadingReceipt || !receiptFile}
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
                  <label className="text-sm font-medium text-gray-500">Ngày nhập kho</label>
                  <p className="text-base text-gray-900">{formatDate(stockDetailData.data.stockedDate || stockDetailData.data.receivedDate || stockDetailData.data.createdAt)}</p>
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
          title="Chi tiết Yêu cầu đặt xe"
          size="lg"
        >
          {isLoadingTransactionDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : transactionDetailData?.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã yêu cầu</label>
                  <p className="text-base font-semibold text-gray-900">#{transactionDetailData.data.inventoryId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">{getTransactionStatusBadge(transactionDetailData.data.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Model</label>
                  <p className="text-base text-gray-900">{transactionDetailData.data.modelName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Màu sắc</label>
                  <p className="text-base text-gray-900">{transactionDetailData.data.colorName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Số lượng</label>
                  <p className="text-base text-gray-900">
                    {transactionDetailData.data.importQuantity || 
                     transactionDetailData.data.quantity || 
                     transactionDetailData.data.requestedQuantity || 
                     0} xe
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="text-base text-gray-900">
                    {formatDate(transactionDetailData.data.createdAt || transactionDetailData.data.requestDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tổng giá</label>
                  <p className="text-base font-semibold text-gray-900">
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
                    <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                    <p className="text-base text-gray-900">{transactionDetailData.data.notes}</p>
                  </div>
                )}
                {/* Hiển thị hợp đồng nếu có */}
                {(transactionDetailData.data.contractFile || transactionDetailData.data.contractPath) && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Hợp đồng</label>
                    {transactionDetailData.data.contractFile ? (
                      <a
                        href={transactionDetailData.data.contractFile}
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
                {transactionDetailData.data.receiptImage && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500 block mb-2">Hóa đơn thanh toán</label>
                    <img
                      src={transactionDetailData.data.receiptImage}
                      alt="Receipt"
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4">
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

        {/* Toast Notifications */}
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </DealerManagerLayout>
  );
};

export default InventoryPage;

