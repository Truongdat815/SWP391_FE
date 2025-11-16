import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle,
  RefreshCw,
  Search,
  Calendar,
  DollarSign,
  FileText,
  Send,
  Edit,
  Upload,
  ArrowUpDown,
  X,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import ModernButton from '../../components/ui/ModernButton';
import OrderStatusStepper from '../../components/ui/OrderStatusStepper';
import { ModernTable, ModernTableHead, ModernTableHeader, ModernTableBody, ModernTableRow, ModernTableCell } from '../../components/ui/ModernTable';
import Pagination from '../../components/ui/Pagination';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';
import { 
  getAllStoreStocksThunk,
  createStoreStockThunk,
  updatePriceByModelColorThunk,
} from '../../store/slices/store-stockSlice';
import { getAllModelColorsThunk } from '../../store/slices/modelColorSlice';
import { getAllModelsThunk } from '../../store/slices/modelSlice';
import { 
  getAllTransactionsThunk,
  createTransactionThunk,
  confirmDeliveryTransactionThunk,
  uploadReceiptThunk,
} from '../../store/slices/inventoryTransactionSlice';
import { fetchActivePromotions } from '../../store/slices/promotionSlice';
import { showError, showSuccess, showWarning } from '../../store/slices/snackbarSlice';

function InventoryManagement() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { toast, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();

  const storeStocks = useSelector((s) => s.storeStocks.items);
  const storeStocksStatus = useSelector((s) => s.storeStocks.status);
  const transactions = useSelector((s) => s.inventoryTransactions.items);
  const transactionsStatus = useSelector((s) => s.inventoryTransactions.status);
  const modelColors = useSelector((s) => s.modelColors.items);
  const models = useSelector((s) => s.models.items);
  const promotions = useSelector((s) => s.promotions.promotions || []);
  const promotionsStatus = useSelector((s) => s.promotions.loading);

  const myStoreId = user?.storeId;

  // Debug: Log user info to verify storeId
  useEffect(() => {
    console.log('User Info:', { 
      userId: user?.userId,
      username: user?.username, 
      role: user?.role, 
      storeId: user?.storeId,
      fullUser: user 
    });
  }, [user]);

  // Tab state - load from localStorage or default to 'inventory'
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('inventoryActiveTab');
    return savedTab || 'inventory';
  });
  
  // Save activeTab to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('inventoryActiveTab', activeTab);
  }, [activeTab]);

  // Inventory table states
  const [flatInventory, setFlatInventory] = useState([]); // Flattened inventory data (each row = model-color combination)
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'in_stock', 'low_stock', 'out_of_stock'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' }); // { key: 'model'|'stock'|'price', direction: 'asc'|'desc' }
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Transactions sort state
  const [transactionsSortOrder, setTransactionsSortOrder] = useState('updated'); // 'newest', 'oldest', or 'updated'
  const [transactionStatusFilter, setTransactionStatusFilter] = useState('all'); // 'all', 'pending', 'accepted', 'uploaded', 'paid', 'shipping', 'delivered'
  const [transactionsCurrentPage, setTransactionsCurrentPage] = useState(1);
  const [transactionsItemsPerPage] = useState(5);
  const [orderIdSortOrder, setOrderIdSortOrder] = useState(null); // 'asc', 'desc', or null
  const [modelSortOrder, setModelSortOrder] = useState(null); // 'a-z', 'z-a', or null
  const [showModelSortMenu, setShowModelSortMenu] = useState(false);
  const [modelSortMenuPosition, setModelSortMenuPosition] = useState({ top: 0, left: 0 });

  // Calculate position for model sort menu
  useEffect(() => {
    if (showModelSortMenu) {
      const button = document.querySelector('.model-sort-button');
      if (button) {
        const rect = button.getBoundingClientRect();
        setModelSortMenuPosition({
          top: rect.bottom + 4,
          left: rect.right - 144 // w-36 = 9rem = 144px
        });
      }
    }
  }, [showModelSortMenu]);

  // Close sort menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showModelSortMenu) {
        const target = event.target;
        if (!target.closest('.sort-menu-container')) {
          setShowModelSortMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelSortMenu]);

  // Request modal states
  const [requestModal, setRequestModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [requestData, setRequestData] = useState({
    storeStockId: '',
    stockInfo: null,
    modelId: '',
    colorId: '',
    importQuantity: ''
  });

  // Upload receipt modal states
  const [uploadReceiptModal, setUploadReceiptModal] = useState(false);
  const [selectedReceiptTransaction, setSelectedReceiptTransaction] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);

  // Confirm delivery modal states
  const [confirmDeliveryModal, setConfirmDeliveryModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Order detail modal states
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);

  // Create initial stock modal states
  const [createStockModal, setCreateStockModal] = useState(false);
  const [createStockData, setCreateStockData] = useState({
    modelId: '',
    colorId: '',
    priceOfStore: '',
    quantity: ''
  });

  // Update price modal states
  const [updatePriceModal, setUpdatePriceModal] = useState(false);
  const [selectedPriceItem, setSelectedPriceItem] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    // Initial load only - no auto-refresh, using realtime updates instead
    dispatch(getAllStoreStocksThunk());
    dispatch(getAllTransactionsThunk());
    dispatch(getAllModelColorsThunk());
    dispatch(getAllModelsThunk());
    dispatch(fetchActivePromotions());

    // Removed auto-refresh interval - using realtime updates instead
    // Removed window focus refresh - using realtime updates instead
  }, [dispatch]);

  // Transform API data to flat list format (each row = model-color combination)
  useEffect(() => {
    if (storeStocksStatus === 'succeeded') {
      if (storeStocks.length > 0) {
        // Filter by my store and flatten to table rows
        const myStoreStocks = storeStocks.filter(s => s.storeId === myStoreId);
        
        const flattened = myStoreStocks.map(stock => ({
          id: stock.stockId,
          stockId: stock.stockId,
          modelId: stock.modelId,
          colorId: stock.colorId,
          model: stock.modelName,
          color: stock.colorName,
          stock: stock.quantity,
          price: stock.priceOfStore,
          storeName: stock.storeName,
          storeId: stock.storeId,
          updatedAt: stock.updatedAt || stock.createdAt || new Date().toISOString()
        }));
        
        setFlatInventory(flattened);
      } else {
        setFlatInventory([]);
      }
    }
  }, [storeStocks, storeStocksStatus, myStoreId]);

  // Filter, sort and paginate inventory data
  const filteredAndSortedInventory = useMemo(() => {
    let result = [...flatInventory];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item =>
        item.model.toLowerCase().includes(term) ||
        item.color.toLowerCase().includes(term) ||
        item.storeName?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(item => {
        if (statusFilter === 'out_of_stock') return item.stock === 0;
        if (statusFilter === 'low_stock') return item.stock > 0 && item.stock <= 3;
        if (statusFilter === 'in_stock') return item.stock > 3;
        return true;
      });
    }

    // Filter by date range
    if (startDate || endDate) {
      result = result.filter(item => {
        const itemDate = new Date(item.updatedAt);
        if (startDate && itemDate < new Date(startDate)) return false;
        if (endDate && itemDate > new Date(endDate + 'T23:59:59')) return false;
        return true;
      });
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal, bVal;
        if (sortConfig.key === 'model') {
          aVal = a.model.toLowerCase();
          bVal = b.model.toLowerCase();
        } else if (sortConfig.key === 'stock') {
          aVal = a.stock;
          bVal = b.stock;
        } else if (sortConfig.key === 'price') {
          aVal = a.price || 0;
          bVal = b.price || 0;
        } else {
          return 0;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [flatInventory, searchTerm, statusFilter, startDate, endDate, sortConfig]);

  // Paginated inventory
  const paginatedInventory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedInventory.slice(startIndex, endIndex);
  }, [filteredAndSortedInventory, currentPage, itemsPerPage]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Get status for inventory item
  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Hết hàng', color: 'red' };
    if (stock <= 3) return { label: 'Sắp hết', color: 'yellow' };
    return { label: 'Còn hàng', color: 'green' };
  };

  // Get my store's transactions (filtered by storeId)
  const myTransactions = useMemo(() => {
    if (!myStoreId) {
      console.log('No storeId found for user');
      return [];
    }
    
    if (!transactions || transactions.length === 0) {
      console.log('No transactions available');
      return [];
    }
    
    console.log('Total transactions:', transactions.length);
    console.log('My storeId:', myStoreId);
    
    // Get all stock IDs that belong to this store
    const myStockIds = new Set(
      storeStocks
        .filter(s => s.storeId === myStoreId)
        .map(s => s.stockId)
    );
    
    console.log('My stock IDs:', Array.from(myStockIds));
    
    const filtered = transactions
      .filter(t => {
        // Method 1: Check if transaction has storeId field directly
        if (t.storeId && t.storeId === myStoreId) {
          console.log('Transaction matched by storeId:', t.inventoryId || t.id, 'status:', t.status);
          return true;
        }
        
        // Method 2: Check if transaction has storeStockId that belongs to my store
        if (t.storeStockId && myStockIds.has(t.storeStockId)) {
          console.log('Transaction matched by storeStockId:', t.inventoryId || t.id, 'status:', t.status);
          return true;
        }
        
        // Method 3: Check if transaction has populated storeStock object
        if (t.storeStock && t.storeStock.storeId === myStoreId) {
          console.log('Transaction matched by storeStock.storeId:', t.inventoryId || t.id, 'status:', t.status);
          return true;
        }
        
        // Method 4: Check if transaction was created by this store (via modelId/colorId match)
        // This handles cases where transaction is created but storeStock doesn't exist yet
        if (t.modelId && t.colorId) {
          const matchingStock = storeStocks.find(s => 
            s.storeId === myStoreId &&
            s.modelId === t.modelId &&
            s.colorId === t.colorId
          );
          if (matchingStock) {
            console.log('Transaction matched by modelId/colorId:', t.inventoryId || t.id, 'status:', t.status);
            return true;
          }
        }
        
        return false;
      })
      .sort((a, b) => {
        // Priority 1: Sort by Order ID if selected
        if (orderIdSortOrder) {
          const idA = a.inventoryId || a.id || 0;
          const idB = b.inventoryId || b.id || 0;
          
          if (orderIdSortOrder === 'asc') {
            return idA - idB; // Từ dưới lên (nhỏ đến lớn)
          } else if (orderIdSortOrder === 'desc') {
            return idB - idA; // Từ trên xuống (lớn đến nhỏ)
          }
        }
        
        // Priority 2: Sort by Model name if selected
        if (modelSortOrder) {
          const modelA = models.find(m => m.modelId === a.modelId);
          const modelB = models.find(m => m.modelId === b.modelId);
          const nameA = modelA?.modelName || '';
          const nameB = modelB?.modelName || '';
          
          if (modelSortOrder === 'a-z') {
            return nameA.localeCompare(nameB, 'vi');
          } else if (modelSortOrder === 'z-a') {
            return nameB.localeCompare(nameA, 'vi');
          }
        }
        
        // Default: Sort by transactionsSortOrder
        if (transactionsSortOrder === 'updated') {
          // Sort by updatedAt (most recent update first), fallback to createdAt
          const dateA = new Date(a.updatedAt || a.createdAt || a.orderDate || a.transactionDate || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || b.orderDate || b.transactionDate || 0).getTime();
          return dateB - dateA; // Most recently updated first
        } else if (transactionsSortOrder === 'newest') {
          // Sort by creation date (newest first)
          const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
          const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
          return dateB - dateA; // Newest first
        } else {
          // Sort by creation date (oldest first)
          const dateA = new Date(a.orderDate || a.createdAt || a.transactionDate || 0).getTime();
          const dateB = new Date(b.orderDate || b.createdAt || b.transactionDate || 0).getTime();
          return dateA - dateB; // Oldest first
        }
      });
    
    console.log('Filtered transactions for my store:', filtered.length);
    console.log('Transaction statuses:', filtered.map(t => ({ id: t.inventoryId || t.id, status: t.status })));
    
    return filtered;
  }, [transactions, storeStocks, myStoreId, transactionsSortOrder, orderIdSortOrder, modelSortOrder, models]);

  // Filter transactions by status
  const filteredTransactions = useMemo(() => {
    let result = myTransactions;
    
    if (transactionStatusFilter !== 'all') {
      result = myTransactions.filter(t => {
        const statusUpper = (t.status || '').toUpperCase();
        
        switch (transactionStatusFilter) {
          case 'pending':
            return statusUpper === 'PENDING';
          case 'accepted':
            return statusUpper === 'ACCEPTED' || statusUpper === 'APPROVED' || statusUpper === 'CONFIRMED' || statusUpper === 'CONTRACT_SIGNED';
          case 'uploaded':
            return statusUpper === 'FILE_UPLOADED';
          case 'paid':
            return statusUpper === 'PAYMENT_CONFIRMED';
          case 'shipping':
            return statusUpper === 'SHIPPING' || statusUpper === 'IN_TRANSIT';
          case 'delivered':
            return statusUpper === 'COMPLETED' || statusUpper === 'DELIVERED' || statusUpper === 'FINISH';
          default:
            return true;
        }
      });
    }
    
    return result;
  }, [myTransactions, transactionStatusFilter]);

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (transactionsCurrentPage - 1) * transactionsItemsPerPage;
    const endIndex = startIndex + transactionsItemsPerPage;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, transactionsCurrentPage, transactionsItemsPerPage]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setTransactionsCurrentPage(1);
  }, [transactionStatusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStock = flatInventory.reduce((sum, item) => sum + item.stock, 0);
    const totalModels = new Set(flatInventory.map(item => item.modelId)).size;
    const totalColors = flatInventory.length;
    
    const pendingCount = myTransactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return status === 'PENDING';
    }).length;
    
    const acceptedCount = myTransactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return status === 'ACCEPTED' || status === 'APPROVED' || status === 'CONFIRMED';
    }).length;
    
    const uploadedCount = myTransactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return status === 'FILE_UPLOADED';
    }).length;
    
    const paidCount = myTransactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return status === 'PAYMENT_CONFIRMED';
    }).length;
    
    const shippingCount = myTransactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return status === 'SHIPPING' || status === 'IN_TRANSIT';
    }).length;
    
    const completedCount = myTransactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return status === 'COMPLETED' || status === 'DELIVERED' || status === 'FINISH';
    }).length;

    return {
      totalStock,
      totalModels,
      totalColors,
      pendingCount,
      acceptedCount,
      uploadedCount,
      paidCount,
      shippingCount,
      completedCount,
      totalTransactions: myTransactions.length
    };
  }, [flatInventory, myTransactions]);

  // Helper functions
  const formatPrice = (price) => {
    if (!price && price !== 0) return '0';
    // Convert to number and round if needed
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0';
    // Format with dots as thousand separators
    return Math.round(numPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `lúc ${hours}:${minutes} ${day} tháng ${month}, ${year}`;
  };

  // Format date short (vắn tắt)
  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format date with time (giờ phút + ngày)
  const formatDateWithTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  // Handle open order detail modal
  const handleOpenOrderDetail = (transaction) => {
    setSelectedOrderDetail(transaction);
    setShowOrderDetailModal(true);
  };

  // Handle close order detail modal
  const handleCloseOrderDetail = () => {
    setShowOrderDetailModal(false);
    setSelectedOrderDetail(null);
  };


  const getColorPreview = (colorName) => {
    const colorMap = {
      'Trắng Ngọc Trai': 'bg-white border border-gray-300',
      'Đen Bóng': 'bg-black',
      'Xanh Dương Đậm': 'bg-blue-800',
      'Đỏ Ruby': 'bg-red-600',
      'Bạc Metallic': 'bg-gray-400',
      'Xám Titan': 'bg-gray-600'
    };
    return colorMap[colorName] || 'bg-gray-300';
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    const colorMap = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'ACCEPTED': 'bg-blue-100 text-blue-800 border-blue-300',
      'APPROVED': 'bg-blue-100 text-blue-800 border-blue-300',
      'CONFIRMED': 'bg-blue-100 text-blue-800 border-blue-300',
      'FILE_UPLOADED': 'bg-amber-100 text-amber-800 border-amber-300',
      'PAYMENT_CONFIRMED': 'bg-teal-100 text-teal-800 border-teal-300',
      'SHIPPING': 'bg-purple-100 text-purple-800 border-purple-300',
      'IN_TRANSIT': 'bg-purple-100 text-purple-800 border-purple-300',
      'COMPLETED': 'bg-green-100 text-green-800 border-green-300',
      'DELIVERED': 'bg-green-100 text-green-800 border-green-300',
      'FINISH': 'bg-green-100 text-green-800 border-green-300',
      'REJECTED': 'bg-red-100 text-red-800 border-red-300'
    };
    return colorMap[statusUpper] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Get promotions filtered by model
  const getFilteredPromotions = (modelId) => {
    if (!modelId || !promotions || promotions.length === 0) return [];
    return promotions.filter(promo => 
      (promo.modelId === modelId || promo.modelId === 0) && promo.active
    );
  };

  // Handle open request modal
  const handleOpenRequest = (modelId = null, colorId = null) => {
    setRequestData({
      storeStockId: '',
      stockInfo: null,
      modelId: modelId || '',
      colorId: colorId || '',
      importQuantity: ''
    });
    setRequestModal(true);
  };

  // Handle submit request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!requestData.importQuantity || parseInt(requestData.importQuantity) <= 0) {
      dispatch(showWarning({ message: 'Vui lòng nhập số lượng lớn hơn 0!' }));
      return;
    }

    if (!requestData.modelId || !requestData.colorId) {
      dispatch(showWarning({ message: 'Thông tin model hoặc màu sắc không hợp lệ!' }));
      return;
    }

    if (!myStoreId) {
      dispatch(showError({ message: 'Không tìm thấy thông tin cửa hàng. Vui lòng đăng nhập lại.' }));
      return;
    }

    try {
      // Find the corresponding storeStock entry
      const stockEntry = storeStocks.find(s => 
        s.storeId === myStoreId &&
        s.modelId === parseInt(requestData.modelId) &&
        s.colorId === parseInt(requestData.colorId)
      );

      console.log('Found stock entry:', stockEntry);
      console.log('User storeId:', myStoreId);
      console.log('Selected modelId:', requestData.modelId, 'colorId:', requestData.colorId);

      // Backend might need storeStockId (ID of existing stock entry)
      // Try sending both storeStockId and other info for backend flexibility
      const payload = stockEntry ? {
        storeStockId: stockEntry.stockId,
        storeId: myStoreId,
        modelId: parseInt(requestData.modelId),
        colorId: parseInt(requestData.colorId),
        importQuantity: parseInt(requestData.importQuantity)
      } : {
        // If no stock entry exists, send all info for backend to create
        storeId: myStoreId,
        modelId: parseInt(requestData.modelId),
        colorId: parseInt(requestData.colorId),
        importQuantity: parseInt(requestData.importQuantity)
      };

      console.log('Creating transaction with payload:', payload);

      const response = await dispatch(createTransactionThunk(payload)).unwrap();
      const createdTransaction = response?.data || response;
      
      console.log('Transaction created successfully:', {
        inventoryId: createdTransaction.inventoryId || createdTransaction.id,
        modelId: createdTransaction.modelId,
        colorId: createdTransaction.colorId,
        storeStockId: createdTransaction.storeStockId,
        storeId: createdTransaction.storeId,
        importQuantity: createdTransaction.importQuantity,
        fullResponse: createdTransaction
      });
      
      // Verify the created transaction has correct modelId and colorId
      if (createdTransaction.modelId !== parseInt(requestData.modelId) || 
          createdTransaction.colorId !== parseInt(requestData.colorId)) {
        console.error('⚠️ WARNING: Created transaction has mismatched model/color!', {
          expected: { modelId: parseInt(requestData.modelId), colorId: parseInt(requestData.colorId) },
          actual: { modelId: createdTransaction.modelId, colorId: createdTransaction.colorId }
        });
        dispatch(showWarning({ 
          message: `⚠️ Cảnh báo: Transaction được tạo nhưng model/color có thể không khớp. Vui lòng kiểm tra lại.` 
        }));
      }
      
      // Get model and color names for success message
      const selectedModel = models.find(m => m.modelId === parseInt(requestData.modelId));
      const selectedColor = modelColors.find(mc => 
        mc.modelId === parseInt(requestData.modelId) && 
        mc.colorId === parseInt(requestData.colorId)
      );
      const modelName = selectedModel?.modelName || 'N/A';
      const colorName = selectedColor?.colorName || 'N/A';
      
      dispatch(showSuccess({ 
        message: `✅ Đã gửi yêu cầu nhập hàng! ${modelName} • ${colorName}, Số lượng: ${requestData.importQuantity} xe` 
      }));
      
      setRequestModal(false);
      setRequestData({
        storeStockId: '',
        stockInfo: null,
        modelId: '',
        colorId: '',
        importQuantity: ''
      });
      
      // Refresh transactions
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể gửi yêu cầu nhập hàng' }));
    }
  };

  // Handle confirm delivery
  const handleOpenConfirmDelivery = (transaction) => {
    const statusUpper = (transaction.status || '').toUpperCase();
    if (statusUpper !== 'SHIPPING' && statusUpper !== 'IN_TRANSIT') {
      dispatch(showWarning({ message: 'Chỉ có thể xác nhận giao hàng khi trạng thái là SHIPPING hoặc IN_TRANSIT' }));
      return;
    }
    setSelectedTransaction(transaction);
    setConfirmDeliveryModal(true);
  };

  const handleConfirmDelivery = async () => {
    if (!selectedTransaction) return;

    // Validate transaction has required info
    const inventoryId = selectedTransaction.inventoryId || selectedTransaction.id;
    const modelId = selectedTransaction.modelId;
    const colorId = selectedTransaction.colorId;
    const storeStockId = selectedTransaction.storeStockId;
    const storeId = selectedTransaction.storeId || myStoreId;

    console.log('Confirming delivery for transaction:', {
      inventoryId,
      modelId,
      colorId,
      storeStockId,
      storeId,
      importQuantity: selectedTransaction.importQuantity,
      fullTransaction: selectedTransaction
    });

    // Validate required fields
    if (!inventoryId) {
      dispatch(showError({ message: 'Lỗi: Không tìm thấy ID của transaction' }));
      return;
    }

    if (!modelId || !colorId) {
      dispatch(showError({ 
        message: `Lỗi: Transaction thiếu thông tin model (${modelId}) hoặc color (${colorId}). Vui lòng liên hệ admin.` 
      }));
      return;
    }

    // Get current stock info before confirmation
    const stock = getStockInfoForTransaction(selectedTransaction);
    
    // If storeStockId exists, verify it matches the model/color
    if (storeStockId && stock) {
      if (stock.modelId !== modelId || stock.colorId !== colorId) {
        dispatch(showError({ 
          message: `⚠️ Cảnh báo: storeStockId (${storeStockId}) không khớp với model/color của transaction. Model: ${stock.modelName} (${stock.modelId}) vs ${modelId}, Color: ${stock.colorName} (${stock.colorId}) vs ${colorId}. Vui lòng kiểm tra lại.` 
        }));
        // Still proceed but log the mismatch
        console.warn('StoreStock mismatch:', {
          transactionModelId: modelId,
          transactionColorId: colorId,
          stockModelId: stock.modelId,
          stockColorId: stock.colorId
        });
      }
    }

    // Find the correct stock entry by modelId + colorId + storeId
    const correctStock = storeStocks.find(s => 
      s.storeId === storeId &&
      s.modelId === modelId &&
      s.colorId === colorId
    );

    if (!correctStock && !storeStockId) {
      dispatch(showError({ 
        message: `Lỗi: Không tìm thấy stock entry cho Model ID ${modelId}, Color ID ${colorId}, Store ID ${storeId}. Vui lòng tạo stock entry trước.` 
      }));
      return;
    }

    const currentQuantity = correctStock?.quantity || stock?.quantity || 0;
    const newQuantity = currentQuantity + selectedTransaction.importQuantity;

    console.log('Stock info:', {
      foundStock: stock,
      correctStock,
      currentQuantity,
      newQuantity,
      willUpdateStockId: correctStock?.stockId || storeStockId
    });

    try {
      await dispatch(confirmDeliveryTransactionThunk(inventoryId)).unwrap();
      
      const stockName = correctStock ? `${correctStock.modelName} • ${correctStock.colorName}` : 
                       stock ? `${stock.modelName} • ${stock.colorName}` : 
                       `Model ${modelId} • Color ${colorId}`;
      
      dispatch(showSuccess({ 
        message: `✅ Đã xác nhận nhận hàng thành công! Đã cập nhật +${selectedTransaction.importQuantity} xe vào kho ${stockName} (từ ${currentQuantity} → ${newQuantity} xe)` 
      }));
      
      setConfirmDeliveryModal(false);
      setSelectedTransaction(null);
      
      // Auto-refresh inventory and transactions to show updated stock
      dispatch(getAllStoreStocksThunk());
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      console.error('Confirm delivery error:', error);
      dispatch(showError({ message: error?.message || 'Không thể xác nhận giao hàng' }));
    }
  };

  // Get stock info for transaction
  const getStockInfoForTransaction = (transaction) => {
    return storeStocks.find(s => s.stockId === transaction.storeStockId);
  };

  // Handle open upload receipt modal
  const handleOpenUploadReceipt = (transaction) => {
    const statusUpper = (transaction.status || '').toUpperCase();
    if (statusUpper !== 'ACCEPTED' && statusUpper !== 'APPROVED' && statusUpper !== 'CONFIRMED' && statusUpper !== 'CONTRACT_SIGNED') {
      dispatch(showWarning({ message: 'Chỉ có thể upload biên lai khi yêu cầu đã được EVM chấp nhận' }));
      return;
    }
    setSelectedReceiptTransaction(transaction);
    setReceiptFile(null);
    setUploadReceiptModal(true);
  };

  // Get status message for transaction
  const getStatusMessage = (statusUpper) => {
    const messages = {
      'PENDING': 'Đang chờ EVM xử lý yêu cầu',
      'CONFIRMED': 'Đã được EVM chấp nhận. Vui lòng upload biên lai thanh toán.',
      'CONTRACT_SIGNED': 'Đã ký hợp đồng. Vui lòng upload biên lai thanh toán.',
      'ACCEPTED': 'Đã được EVM chấp nhận. Vui lòng upload biên lai thanh toán.',
      'APPROVED': 'Đã được EVM duyệt. Vui lòng upload biên lai thanh toán.',
      'FILE_UPLOADED': 'Đã upload biên lai. Đang chờ EVM xác nhận thanh toán.',
      'PAYMENT_CONFIRMED': 'Thanh toán đã được xác nhận. Đang chờ EVM bắt đầu vận chuyển.',
      'IN_TRANSIT': 'Đang vận chuyển. Vui lòng xác nhận khi nhận được hàng.',
      'SHIPPING': 'Đang vận chuyển. Vui lòng xác nhận khi nhận được hàng.',
      'DELIVERED': 'Đã hoàn thành và cập nhật vào kho',
      'COMPLETED': 'Đã hoàn thành và cập nhật vào kho',
      'FINISH': 'Đã hoàn thành và cập nhật vào kho',
      'REJECTED': 'Yêu cầu đã bị từ chối bởi EVM',
      'CANCELLED': 'Yêu cầu đã bị hủy',
      'CANCELED': 'Yêu cầu đã bị hủy'
    };
    return messages[statusUpper] || '';
  };

  // Handle close upload receipt modal
  const handleCloseUploadReceipt = () => {
    setUploadReceiptModal(false);
    setSelectedReceiptTransaction(null);
    setReceiptFile(null);
  };

  // Handle receipt file change
  const handleReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (allow images and PDFs)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        dispatch(showWarning({ message: 'Vui lòng chọn file ảnh (JPG, PNG, GIF) hoặc PDF' }));
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        dispatch(showWarning({ message: 'Kích thước file không được vượt quá 10MB' }));
        return;
      }
      
      setReceiptFile(file);
    }
  };

  // Handle upload receipt
  const handleUploadReceipt = async () => {
    if (!selectedReceiptTransaction) return;
    
    if (!receiptFile) {
      dispatch(showWarning({ message: 'Vui lòng chọn file biên lai để upload' }));
      return;
    }

    const inventoryId = selectedReceiptTransaction.inventoryId || selectedReceiptTransaction.id;
    
    // Validate inventory ID
    if (!inventoryId) {
      dispatch(showError({ message: 'Lỗi: Không tìm thấy ID của transaction. Vui lòng thử lại.' }));
      return;
    }

    try {
      // Refresh transaction data first to ensure we have the latest info
      console.log('Uploading receipt for transaction ID:', inventoryId);
      
      await dispatch(uploadReceiptThunk({ inventoryId, file: receiptFile })).unwrap();
      dispatch(showSuccess({ 
        message: '✅ Đã upload biên lai thanh toán thành công! Vui lòng chờ EVM xác nhận.' 
      }));
      
      handleCloseUploadReceipt();
      
      // Refresh transactions to show updated status
      dispatch(getAllTransactionsThunk());
    } catch (error) {
      console.error('Upload receipt error:', error);
      
      // Handle specific database duplicate error
      const errorMessage = error?.message || '';
      if (errorMessage.includes('Query did not return a unique result') || 
          errorMessage.includes('nhiều bản ghi trùng lặp') ||
          errorMessage.includes('8 results were returned') ||
          errorMessage.includes('results were returned')) {
        
        dispatch(showError({ 
          message: `❌ Lỗi database: Tìm thấy nhiều bản ghi trùng lặp với Transaction ID ${inventoryId} trong database. Đây là lỗi backend cần được sửa. Vui lòng liên hệ admin/backend team để: 1) Kiểm tra duplicate records trong bảng inventory_transactions, 2) Xóa hoặc merge các bản ghi trùng lặp, 3) Đảm bảo inventoryId là unique constraint.` 
        }));
      } else {
        dispatch(showError({ 
          message: errorMessage || 'Không thể upload biên lai. Vui lòng thử lại sau.' 
        }));
      }
    }
  };

  // Handle create initial stock
  const handleOpenCreateStock = () => {
    setCreateStockData({
      modelId: '',
      colorId: '',
      priceOfStore: '',
      quantity: ''
    });
    setCreateStockModal(true);
  };

  const handleCloseCreateStock = () => {
    setCreateStockModal(false);
    setCreateStockData({
      modelId: '',
      colorId: '',
      priceOfStore: '',
      quantity: ''
    });
  };

  const handleSubmitCreateStock = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!createStockData.modelId || !createStockData.colorId || 
        !createStockData.priceOfStore || !createStockData.quantity) {
      dispatch(showWarning({ message: 'Vui lòng điền đầy đủ thông tin!' }));
      return;
    }

    if (parseFloat(createStockData.priceOfStore) <= 0) {
      dispatch(showWarning({ message: 'Giá bán phải lớn hơn 0!' }));
      return;
    }

    if (parseInt(createStockData.quantity) <= 0) {
      dispatch(showWarning({ message: 'Số lượng phải lớn hơn 0!' }));
      return;
    }

    if (!myStoreId) {
      dispatch(showError({ message: 'Không tìm thấy thông tin cửa hàng. Vui lòng đăng nhập lại.' }));
      return;
    }

    try {
      const payload = {
        storeId: myStoreId,
        modelId: parseInt(createStockData.modelId),
        colorId: parseInt(createStockData.colorId),
        priceOfStore: parseFloat(createStockData.priceOfStore),
        quantity: parseInt(createStockData.quantity)
      };

      await dispatch(createStoreStockThunk(payload)).unwrap();
      dispatch(showSuccess({ 
        message: `✅ Đã tạo dữ liệu xe ban đầu thành công!` 
      }));
      
      handleCloseCreateStock();
      
      // Refresh data
      dispatch(getAllStoreStocksThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể tạo dữ liệu xe ban đầu' }));
    }
  };

  // Get available colors for selected model (for create stock)
  const getAvailableColors = () => {
    if (!createStockData.modelId) return [];
    if (!modelColors || !Array.isArray(modelColors) || modelColors.length === 0) return [];
    
    const selectedModelId = String(createStockData.modelId);
    const available = modelColors.filter(mc => {
      // Handle both number and string modelId
      const mcModelId = mc.modelId !== undefined ? String(mc.modelId) : null;
      return mcModelId === selectedModelId;
    });
    
    return available;
  };

  // Get available colors for selected model (for request order)
  const getAvailableColorsForRequest = () => {
    if (!requestData.modelId) return [];
    if (!modelColors || !Array.isArray(modelColors) || modelColors.length === 0) return [];
    
    const selectedModelId = String(requestData.modelId);
    const available = modelColors.filter(mc => {
      // Handle both number and string modelId
      const mcModelId = mc.modelId !== undefined ? String(mc.modelId) : null;
      return mcModelId === selectedModelId;
    });
    
    return available;
  };

  // Handle open update price modal
  const handleOpenUpdatePrice = (item) => {
    setSelectedPriceItem({
      modelId: item.modelId,
      colorId: item.colorId,
      modelName: item.model,
      colorName: item.color,
      currentPrice: item.price
    });
    setNewPrice(item.price?.toString() || '');
    setUpdatePriceModal(true);
  };

  // Handle close update price modal
  const handleCloseUpdatePrice = () => {
    setUpdatePriceModal(false);
    setSelectedPriceItem(null);
    setNewPrice('');
  };

  // Handle submit update price
  const handleSubmitUpdatePrice = async (e) => {
    e.preventDefault();
    
    if (!selectedPriceItem || !newPrice || parseFloat(newPrice) <= 0) {
      dispatch(showWarning({ message: 'Vui lòng nhập giá hợp lệ (lớn hơn 0)!' }));
      return;
    }

    try {
      await dispatch(updatePriceByModelColorThunk({
        modelId: selectedPriceItem.modelId,
        colorId: selectedPriceItem.colorId,
        price: parseFloat(newPrice)
      })).unwrap();
      
      dispatch(showSuccess({ 
        message: `✅ Đã cập nhật giá thành công! ${selectedPriceItem.modelName} • ${selectedPriceItem.colorName}: ${formatPrice(parseFloat(newPrice))} VNĐ` 
      }));
      
      handleCloseUpdatePrice();
      
      // Refresh inventory to show updated price
      dispatch(getAllStoreStocksThunk());
    } catch (error) {
      dispatch(showError({ message: error?.message || 'Không thể cập nhật giá' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
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

        {/* Tabs Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
          <div className="flex gap-2">
            <motion.button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'inventory'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'text-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package className="w-5 h-5" />
                <span>Tồn kho</span>
              </div>
            </motion.button>
            <motion.button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'transactions'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                <span>Lịch sử đặt hàng</span>
                {stats.totalTransactions > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'transactions' ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {stats.totalTransactions}
                  </span>
                )}
              </div>
            </motion.button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'inventory' && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tồn kho hiện tại</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredAndSortedInventory.length} {filteredAndSortedInventory.length === 1 ? 'sản phẩm' : 'sản phẩm'} tìm thấy
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-80">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo model, màu sắc..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <ModernButton
                    onClick={handleOpenRequest}
                    icon={<ShoppingCart className="w-4 h-4" />}
                    roleColor="blue"
                    size="md"
                  >
                    Đặt hàng từ EVM
                  </ModernButton>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-2 mb-6">
                {[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'in_stock', label: 'Còn hàng' },
                  { key: 'low_stock', label: 'Sắp hết' },
                  { key: 'out_of_stock', label: 'Hết hàng' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setStatusFilter(tab.key);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      statusFilter === tab.key
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Inventory Table */}
              {storeStocksStatus === 'loading' ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : filteredAndSortedInventory.length === 0 ? (
                <EmptyState
                  title={searchTerm || statusFilter !== 'all' || startDate || endDate ? 'Không tìm thấy sản phẩm nào' : 'Không có dữ liệu kho hàng'}
                  description={searchTerm || statusFilter !== 'all' || startDate || endDate ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.' : 'Kho hàng hiện tại chưa có sản phẩm nào.'}
                  icon="package"
                  roleColor="emerald"
                />
              ) : (
                <>
                  <ModernTable>
                    <ModernTableHead>
                      <tr>
                        <ModernTableHeader sortable onSort={() => handleSort('model')}>
                          Model • Màu sắc
                        </ModernTableHeader>
                        <ModernTableHeader sortable onSort={() => handleSort('stock')}>
                          Số lượng tồn
                        </ModernTableHeader>
                        <ModernTableHeader sortable onSort={() => handleSort('price')}>
                          Giá bán
                        </ModernTableHeader>
                        <ModernTableHeader>Trạng thái</ModernTableHeader>
                        <ModernTableHeader>Thao tác</ModernTableHeader>
                      </tr>
                    </ModernTableHead>
                    <ModernTableBody>
                      {paginatedInventory.map((item, index) => {
                        const stockStatus = getStockStatus(item.stock);
                        return (
                          <ModernTableRow key={item.id} index={index}>
                            <ModernTableCell>
                              <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 border-white shadow-md ${getColorPreview(item.color)}`}></div>
                                <div>
                                  <div className="font-medium text-gray-900">{item.model}</div>
                                  <div className="text-sm text-gray-500">{item.color}</div>
                                </div>
                              </div>
                            </ModernTableCell>
                            <ModernTableCell>
                              <span className={`text-sm font-bold flex items-center gap-2 ${
                                item.stock === 0 ? 'text-red-600' :
                                item.stock <= 3 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {item.stock === 0 && <AlertCircle className="w-4 h-4" />}
                                {item.stock > 0 && item.stock <= 3 && <AlertCircle className="w-4 h-4" />}
                                {item.stock} xe
                              </span>
                            </ModernTableCell>
                            <ModernTableCell>
                              <button
                                onClick={() => handleOpenUpdatePrice(item)}
                                className="group relative px-3 py-2 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 hover:from-amber-100 hover:to-yellow-100 hover:border-amber-300 hover:shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
                                title="Click để sửa giá"
                              >
                                <span className="text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                                  {formatPrice(item.price)} VNĐ
                                </span>
                                <Edit className="w-3.5 h-3.5 text-amber-600 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110" />
                              </button>
                            </ModernTableCell>
                            <ModernTableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                                stockStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {stockStatus.label}
                              </span>
                            </ModernTableCell>
                            <ModernTableCell>
                              <ModernButton
                                onClick={() => handleOpenRequest(item.modelId, item.colorId)}
                                size="sm"
                                icon={<ShoppingCart className="w-4 h-4" />}
                                roleColor="blue"
                                noHover={true}
                              >
                                Đặt hàng
                              </ModernButton>
                            </ModernTableCell>
                          </ModernTableRow>
                        );
                      })}
                    </ModernTableBody>
                  </ModernTable>

                  {/* Pagination */}
                  {Math.ceil(filteredAndSortedInventory.length / itemsPerPage) > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={Math.ceil(filteredAndSortedInventory.length / itemsPerPage)}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredAndSortedInventory.length}
                        showInfo={true}
                      />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Lịch sử yêu cầu đặt hàng</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredTransactions.length} {filteredTransactions.length === 1 ? 'yêu cầu' : 'yêu cầu'} tìm thấy
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={transactionsSortOrder}
                      onChange={(e) => setTransactionsSortOrder(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm min-w-[180px]"
                    >
                      <option value="updated">Cập nhật mới nhất</option>
                      <option value="newest">Mới nhất</option>
                      <option value="oldest">Cũ nhất</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">
                      Tổng: {stats.totalTransactions} yêu cầu
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 mb-6 w-full">
                {[
                  { key: 'all', label: 'Tất cả', count: stats.totalTransactions },
                  { key: 'pending', label: 'Chờ xử lý', count: stats.pendingCount },
                  { key: 'accepted', label: 'Đã chấp nhận', count: stats.acceptedCount },
                  { key: 'uploaded', label: 'Đã upload', count: stats.uploadedCount },
                  { key: 'paid', label: 'Đã thanh toán', count: stats.paidCount },
                  { key: 'shipping', label: 'Vận chuyển', count: stats.shippingCount },
                  { key: 'delivered', label: 'Đã giao', count: stats.completedCount }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setTransactionStatusFilter(tab.key)}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      transactionStatusFilter === tab.key
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        transactionStatusFilter === tab.key
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {transactionsStatus === 'loading' ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <EmptyState
                  title={transactionStatusFilter !== 'all' ? 'Không tìm thấy yêu cầu nào với trạng thái này' : 'Chưa có yêu cầu nào'}
                  description={transactionStatusFilter !== 'all' ? 'Thử chọn trạng thái khác hoặc xem tất cả yêu cầu.' : 'Các yêu cầu đặt hàng sẽ hiển thị ở đây'}
                  icon="file"
                  roleColor="blue"
                />
              ) : (
                <>
                  <ModernTable>
                    <ModernTableHead>
                      <tr>
                        <ModernTableHeader className="text-left">
                          <div className="flex items-center justify-between w-full">
                            <span className="flex-1">MÃ ĐƠN</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Toggle: null -> 'asc' -> 'desc' -> null
                                if (orderIdSortOrder === null) {
                                  setOrderIdSortOrder('asc');
                                } else if (orderIdSortOrder === 'asc') {
                                  setOrderIdSortOrder('desc');
                                } else {
                                  setOrderIdSortOrder(null);
                                }
                                setShowModelSortMenu(false);
                              }}
                              className="p-1.5 hover:bg-gray-200 rounded transition-colors flex items-center justify-center ml-2"
                              title={
                                orderIdSortOrder === 'asc' ? 'Từ dưới lên' :
                                orderIdSortOrder === 'desc' ? 'Từ trên xuống' :
                                'Sắp xếp'
                              }
                            >
                              {orderIdSortOrder === 'asc' ? (
                                <ArrowUp className="w-4 h-4 text-blue-600" />
                              ) : orderIdSortOrder === 'desc' ? (
                                <ArrowDown className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </ModernTableHeader>
                        <ModernTableHeader>
                          <div className="flex items-center justify-between w-full">
                            <span className="flex-1">MẪU XE</span>
                            <div className="relative sort-menu-container ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowModelSortMenu(!showModelSortMenu);
                                  setShowOrderIdSortMenu(false);
                                }}
                                className="model-sort-button p-1.5 hover:bg-gray-200 rounded transition-colors flex items-center justify-center"
                              >
                                <ArrowUpDown className="w-4 h-4 text-gray-500" />
                              </button>
                              <AnimatePresence>
                                {showModelSortMenu && (
                                  <>
                                    {/* Backdrop to close menu */}
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      exit={{ opacity: 0 }}
                                      className="fixed inset-0 z-[99]"
                                      onClick={() => setShowModelSortMenu(false)}
                                    />
                                    <motion.div
                                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                      transition={{ duration: 0.2 }}
                                      className="fixed w-36 bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden z-[100]"
                                      style={{
                                        top: `${modelSortMenuPosition.top}px`,
                                        left: `${modelSortMenuPosition.left}px`
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                    <div className="py-0.5">
                                      <button
                                        onClick={() => {
                                          setModelSortOrder('a-z');
                                          setShowModelSortMenu(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                                          modelSortOrder === 'a-z' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                                        }`}
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                        A → Z
                                      </button>
                                      <button
                                        onClick={() => {
                                          setModelSortOrder('z-a');
                                          setShowModelSortMenu(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                                          modelSortOrder === 'z-a' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                                        }`}
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                        Z → A
                                      </button>
                                      <div className="border-t border-gray-200 my-0.5"></div>
                                      <button
                                        onClick={() => {
                                          setModelSortOrder(null);
                                          setShowModelSortMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 transition-colors text-gray-500"
                                      >
                                        Bỏ sort
                                      </button>
                                    </div>
                                  </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </ModernTableHeader>
                        <ModernTableHeader className="text-left">Màu</ModernTableHeader>
                        <ModernTableHeader className="text-left">Số lượng</ModernTableHeader>
                        <ModernTableHeader className="text-left">Tổng giá</ModernTableHeader>
                        <ModernTableHeader className="text-left">Trạng thái</ModernTableHeader>
                        <ModernTableHeader className="text-left">Ngày đặt hàng</ModernTableHeader>
                        <ModernTableHeader className="text-left">Ngày giao hàng</ModernTableHeader>
                        <ModernTableHeader className="text-left">Thao tác</ModernTableHeader>
                      </tr>
                    </ModernTableHead>
                    <ModernTableBody>
                      {paginatedTransactions.map((transaction, index) => {
                        const stock = getStockInfoForTransaction(transaction);
                        const statusUpper = (transaction.status || '').toUpperCase();
                        const canConfirmDelivery = statusUpper === 'IN_TRANSIT';
                        const canUploadReceipt = statusUpper === 'CONFIRMED' || 
                                                statusUpper === 'ACCEPTED' || 
                                                statusUpper === 'APPROVED' ||
                                                statusUpper === 'CONTRACT_SIGNED';
                        
                        // Get model and color names from transaction
                        const transactionModel = models.find(m => m.modelId === transaction.modelId);
                        const transactionColor = modelColors.find(mc => 
                          mc.modelId === transaction.modelId && 
                          mc.colorId === transaction.colorId
                        );
                        const modelName = transactionModel?.modelName || stock?.modelName || 'N/A';
                        const colorName = transactionColor?.colorName || stock?.colorName || 'N/A';
                        
                        // Determine delivery date
                        const isDelivered = statusUpper === 'DELIVERED' || statusUpper === 'COMPLETED' || statusUpper === 'FINISH';
                        const deliveryDate = isDelivered 
                          ? (transaction.deliveredDate || transaction.completedDate || transaction.updatedAt || transaction.deliveryDate)
                          : transaction.deliveryDate;
                        
                        return (
                          <ModernTableRow 
                            key={transaction.inventoryId || transaction.id || index} 
                            index={index}
                            className="cursor-pointer hover:bg-blue-50"
                            onClick={() => handleOpenOrderDetail(transaction)}
                          >
                            <ModernTableCell className="text-left">
                              <span className="text-sm font-semibold text-gray-900 pr-1">
                                #{transaction.inventoryId || transaction.id}
                              </span>
                            </ModernTableCell>
                            <ModernTableCell className="text-left">
                              <span className="text-sm text-gray-900">{modelName}</span>
                            </ModernTableCell>
                            <ModernTableCell className="text-left">
                              <span className="text-sm text-gray-900">{colorName}</span>
                            </ModernTableCell>
                            <ModernTableCell className="text-left">
                              <span className="text-sm font-medium text-emerald-600">
                                {transaction.importQuantity} xe
                              </span>
                            </ModernTableCell>
                            <ModernTableCell className="text-left">
                              <span className="text-sm font-semibold text-gray-900">
                                {transaction.totalPrice > 0 ? formatPrice(transaction.totalPrice) : 'N/A'} VNĐ
                              </span>
                            </ModernTableCell>
                            <ModernTableCell className="text-left">
                              <StatusBadge status={transaction.status} size="sm" />
                            </ModernTableCell>
                            <ModernTableCell className="text-left">
                              <span className="text-sm text-gray-600">
                                {formatDateWithTime(transaction.orderDate || transaction.createdAt || transaction.transactionDate)}
                              </span>
                            </ModernTableCell>
                            <ModernTableCell className="text-left">
                              <span className="text-sm text-gray-600">
                                {deliveryDate 
                                  ? formatDateWithTime(deliveryDate)
                                  : '-'
                                }
                              </span>
                            </ModernTableCell>
                            <ModernTableCell className="text-left" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                {(canUploadReceipt || canConfirmDelivery) && (
                                  <>
                                    {canUploadReceipt && (
                                      <ModernButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenUploadReceipt(transaction);
                                        }}
                                        icon={<Upload className="w-3 h-3" />}
                                        roleColor="blue"
                                        size="sm"
                                      >
                                        Đẩy lên
                                      </ModernButton>
                                    )}
                                    {canConfirmDelivery && (
                                      <ModernButton
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenConfirmDelivery(transaction);
                                        }}
                                        icon={<CheckCircle2 className="w-3 h-3" />}
                                        roleColor="green"
                                        size="sm"
                                      >
                                        Xác nhận
                                      </ModernButton>
                                    )}
                                  </>
                                )}
                                {!canUploadReceipt && !canConfirmDelivery && (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </div>
                            </ModernTableCell>
                          </ModernTableRow>
                        );
                      })}
                    </ModernTableBody>
                  </ModernTable>

                  {/* Pagination for Transactions */}
                  {Math.ceil(filteredTransactions.length / transactionsItemsPerPage) > 1 && (
                    <div className="mt-6">
                      <Pagination
                        currentPage={transactionsCurrentPage}
                        totalPages={Math.ceil(filteredTransactions.length / transactionsItemsPerPage)}
                        onPageChange={setTransactionsCurrentPage}
                        itemsPerPage={transactionsItemsPerPage}
                        totalItems={filteredTransactions.length}
                        showInfo={true}
                      />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Detail Modal */}
        <AnimatePresence>
          {showOrderDetailModal && selectedOrderDetail && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
              onClick={handleCloseOrderDetail}
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
                className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Đơn hàng #{selectedOrderDetail.inventoryId || selectedOrderDetail.id}</h3>
                        <p className="text-sm text-blue-100">
                          {formatDateTime(selectedOrderDetail.orderDate || selectedOrderDetail.createdAt || selectedOrderDetail.transactionDate)}
                        </p>
                      </div>
                    </div>
                    {(selectedOrderDetail.status || '').toUpperCase() === 'DELIVERED' || (selectedOrderDetail.status || '').toUpperCase() === 'COMPLETED' ? (
                      <div className="px-4 py-2 bg-green-500 rounded-lg text-white font-semibold text-sm">
                        Đã giao hàng
                      </div>
                    ) : null}
                    <button
                      onClick={handleCloseOrderDetail}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Order Status Stepper */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      Tiến trình đơn hàng
                    </h4>
                    <OrderStatusStepper currentStatus={selectedOrderDetail.status} size="sm" />
                  </div>

                  {/* Order Details */}
                  {(() => {
                    const detailStock = getStockInfoForTransaction(selectedOrderDetail);
                    const detailStatusUpper = (selectedOrderDetail.status || '').toUpperCase();
                    const detailTransactionModel = models.find(m => m.modelId === selectedOrderDetail.modelId);
                    const detailTransactionColor = modelColors.find(mc => 
                      mc.modelId === selectedOrderDetail.modelId && 
                      mc.colorId === selectedOrderDetail.colorId
                    );
                    const detailModelName = detailTransactionModel?.modelName || detailStock?.modelName || 'N/A';
                    const detailColorName = detailTransactionColor?.colorName || detailStock?.colorName || 'N/A';
                    const detailIsDelivered = detailStatusUpper === 'DELIVERED' || detailStatusUpper === 'COMPLETED' || detailStatusUpper === 'FINISH';
                    const detailDeliveryDate = detailIsDelivered 
                      ? (selectedOrderDetail.deliveredDate || selectedOrderDetail.completedDate || selectedOrderDetail.updatedAt || selectedOrderDetail.deliveryDate)
                      : selectedOrderDetail.deliveryDate;

                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 mb-2">Model • Màu</p>
                            <p className="text-sm font-bold text-gray-900">
                              {detailModelName} - {detailColorName}
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 mb-2">Số lượng</p>
                            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {selectedOrderDetail.importQuantity} xe
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 mb-2">Ngày giao hàng</p>
                            <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-500">
                                {detailDeliveryDate 
                                  ? new Date(detailDeliveryDate).toLocaleDateString('vi-VN')
                                  : 'Chưa xác định'
                                }
                              </span>
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 mb-2">Tổng giá</p>
                            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {selectedOrderDetail.totalPrice > 0 ? formatPrice(selectedOrderDetail.totalPrice) : 'N/A'} VNĐ
                            </p>
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        {selectedOrderDetail.totalPrice > 0 && (selectedOrderDetail.unitBasePrice || selectedOrderDetail.discountPercentage > 0) && (
                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
                            <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-emerald-600" />
                              Chi tiết giá
                            </h4>
                            <div className="space-y-2">
                              {selectedOrderDetail.unitBasePrice && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Đơn giá:</span>
                                  <span className="font-medium text-gray-900">{formatPrice(selectedOrderDetail.unitBasePrice)} VNĐ</span>
                                </div>
                              )}
                              {selectedOrderDetail.totalBasePrice && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Tổng cơ bản:</span>
                                  <span className="font-medium text-gray-900">{formatPrice(selectedOrderDetail.totalBasePrice)} VNĐ</span>
                                </div>
                              )}
                              {selectedOrderDetail.discountPercentage > 0 && selectedOrderDetail.totalBasePrice && (
                                <div className="flex justify-between text-sm text-orange-600">
                                  <span>Giảm giá ({selectedOrderDetail.discountPercentage}%):</span>
                                  <span className="font-medium">
                                    -{formatPrice(Math.round(selectedOrderDetail.totalBasePrice * (selectedOrderDetail.discountPercentage / 100)))} VNĐ
                                  </span>
                                </div>
                              )}
                              <div className="pt-2 border-t-2 border-emerald-200 flex justify-between">
                                <span className="text-sm font-bold text-gray-900">Tổng thanh toán:</span>
                                <span className="text-lg font-bold text-emerald-600">{formatPrice(selectedOrderDetail.totalPrice)} VNĐ</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Completion Status */}
                        {(detailStatusUpper === 'DELIVERED' || detailStatusUpper === 'COMPLETED') && (
                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              <span className="text-sm font-semibold text-gray-900">
                                Đã hoàn thành và cập nhật vào kho
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {(() => {
                          const detailCanUploadReceipt = detailStatusUpper === 'CONFIRMED' || 
                                                          detailStatusUpper === 'ACCEPTED' || 
                                                          detailStatusUpper === 'APPROVED' ||
                                                          detailStatusUpper === 'CONTRACT_SIGNED';
                          const detailCanConfirmDelivery = detailStatusUpper === 'IN_TRANSIT';

                          if (detailCanUploadReceipt || detailCanConfirmDelivery) {
                            return (
                              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                {detailCanUploadReceipt && (
                                  <ModernButton
                                    onClick={() => {
                                      handleCloseOrderDetail();
                                      handleOpenUploadReceipt(selectedOrderDetail);
                                    }}
                                    icon={<Upload className="w-4 h-4" />}
                                    roleColor="blue"
                                    size="md"
                                  >
                                    Upload biên lai
                                  </ModernButton>
                                )}
                                {detailCanConfirmDelivery && (
                                  <ModernButton
                                    onClick={() => {
                                      handleCloseOrderDetail();
                                      handleOpenConfirmDelivery(selectedOrderDetail);
                                    }}
                                    icon={<CheckCircle2 className="w-4 h-4" />}
                                    roleColor="green"
                                    size="md"
                                  >
                                    Xác nhận nhận hàng
                                  </ModernButton>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Request Order Modal */}
      <AnimatePresence>
        {requestModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setRequestModal(false)}
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
              className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Đặt hàng từ EVM</h3>
                  <p className="text-sm text-gray-600 mt-1">Chọn model và màu sắc để yêu cầu nhập hàng từ EVM</p>
                </div>
                <button 
                  onClick={() => setRequestModal(false)} 
                  className="text-gray-400"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitRequest} className="space-y-6">
                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={requestData.modelId}
                      onChange={(e) => setRequestData({ ...requestData, modelId: e.target.value, colorId: '' })}
                      className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        requestData.modelId && requestData.colorId ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                      disabled={requestData.modelId && requestData.colorId}
                    >
                      <option value="">-- Chọn model --</option>
                      {models.map(model => (
                        <option key={model.modelId} value={model.modelId}>
                          {model.modelName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Màu sắc <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={requestData.colorId}
                      onChange={(e) => setRequestData({ ...requestData, colorId: e.target.value })}
                      className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        requestData.modelId && requestData.colorId ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                      disabled={!requestData.modelId || (requestData.modelId && requestData.colorId)}
                    >
                      <option value="">-- Chọn màu sắc --</option>
                      {getAvailableColorsForRequest().map(mc => (
                        <option key={mc.colorId || mc.id} value={mc.colorId || mc.id}>
                          {mc.colorName || mc.name || `Màu #${mc.colorId || mc.id}`}
                        </option>
                      ))}
                    </select>
                    {!requestData.modelId ? (
                      <p className="mt-1 text-xs text-gray-500">Vui lòng chọn model trước</p>
                    ) : getAvailableColorsForRequest().length === 0 ? (
                      <p className="mt-1 text-xs text-amber-600">⚠️ Model này chưa có màu sắc nào được cấu hình</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng cần nhập <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={requestData.importQuantity}
                      onChange={(e) => setRequestData({ ...requestData, importQuantity: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      placeholder="Nhập số lượng xe cần nhập"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <motion.button 
                    type="button" 
                    onClick={() => setRequestModal(false)}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium"
                  >
                    Hủy
                  </motion.button>
                  <motion.button 
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Gửi yêu cầu tới EVM
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delivery Modal */}
      <AnimatePresence>
        {confirmDeliveryModal && selectedTransaction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmDeliveryModal(false)}
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
              className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Xác nhận nhận hàng</h3>
                <button 
                  onClick={() => setConfirmDeliveryModal(false)} 
                  className="text-gray-400"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-3">
                    ✅ Bạn có chắc chắn đã nhận được hàng? Sau khi xác nhận, số lượng sẽ được tự động cập nhật vào kho.
                  </p>
                </div>

                {(() => {
                  const stock = getStockInfoForTransaction(selectedTransaction);
                  const transactionModelId = selectedTransaction.modelId;
                  const transactionColorId = selectedTransaction.colorId;
                  
                  // Find correct stock by modelId + colorId
                  const correctStock = storeStocks.find(s => 
                    s.storeId === myStoreId &&
                    s.modelId === transactionModelId &&
                    s.colorId === transactionColorId
                  );
                  
                  // Get model and color names
                  const transactionModel = models.find(m => m.modelId === transactionModelId);
                  const transactionColor = modelColors.find(mc => 
                    mc.modelId === transactionModelId && 
                    mc.colorId === transactionColorId
                  );
                  const modelName = transactionModel?.modelName || correctStock?.modelName || stock?.modelName || 'N/A';
                  const colorName = transactionColor?.colorName || correctStock?.colorName || stock?.colorName || 'N/A';
                  
                  // Get store name
                  const storeName = correctStock?.storeName || stock?.storeName || 'N/A';
                  
                  // Get current stock quantity
                  const currentQty = correctStock?.quantity || stock?.quantity || 0;
                  const newQty = currentQty + selectedTransaction.importQuantity;
                  
                  // Delivery date - show current date when confirming (actual delivery date)
                  const deliveryDate = new Date();
                  
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Mẫu xe:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {modelName} - {colorName}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tên cửa hàng:</span>
                        <span className="text-sm font-medium text-gray-900">{storeName}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Số lượng nhận:</span>
                        <span className="text-sm font-medium text-gray-900">{selectedTransaction.importQuantity} xe</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tồn kho hiện tại:</span>
                        <span className="text-sm font-medium text-gray-900">{currentQty} xe</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tồn kho sau khi nhận:</span>
                        <span className="text-sm font-bold text-green-600">{newQty} xe</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Ngày giao hàng:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {deliveryDate.toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <motion.button 
                    onClick={() => setConfirmDeliveryModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Hủy
                  </motion.button>
                  <motion.button 
                    onClick={handleConfirmDelivery}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md"
                  >
                    Xác nhận nhận hàng
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Receipt Modal */}
      <AnimatePresence>
        {uploadReceiptModal && selectedReceiptTransaction && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseUploadReceipt}
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
              className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Upload biên lai thanh toán</h3>
                  <p className="text-sm text-gray-600 mt-1">Vui lòng upload biên lai thanh toán cho yêu cầu này</p>
                </div>
                <button 
                  onClick={handleCloseUploadReceipt} 
                  className="text-gray-400"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Transaction Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thông tin yêu cầu
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Model • Màu:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {(() => {
                          const stock = getStockInfoForTransaction(selectedReceiptTransaction);
                          return stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A';
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Số lượng:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedReceiptTransaction.importQuantity} xe</span>
                    </div>
                    {selectedReceiptTransaction.totalPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tổng giá:</span>
                        <span className="text-sm font-bold text-emerald-600">
                          {formatPrice(selectedReceiptTransaction.totalPrice)} VNĐ
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn file biên lai <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="receipt-file" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Chọn file</span>
                          <input
                            id="receipt-file"
                            name="receipt-file"
                            type="file"
                            className="sr-only"
                            accept="image/*,.pdf"
                            onChange={handleReceiptFileChange}
                          />
                        </label>
                        <p className="pl-1">hoặc kéo thả vào đây</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF, PDF tối đa 10MB
                      </p>
                      {receiptFile && (
                        <p className="text-sm font-medium text-green-600 mt-2">
                          ✓ Đã chọn: {receiptFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <motion.button 
                    onClick={handleCloseUploadReceipt}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium"
                  >
                    Hủy
                  </motion.button>
                  <motion.button 
                    onClick={handleUploadReceipt}
                    disabled={!receiptFile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload biên lai
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Initial Stock Modal */}
      <AnimatePresence>
        {createStockModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseCreateStock}
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
              className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Tạo dữ liệu xe ban đầu</h3>
                  <p className="text-sm text-gray-600 mt-1">Thêm xe mới vào kho đại lý</p>
                </div>
                <button 
                  onClick={handleCloseCreateStock} 
                  className="text-gray-400"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitCreateStock} className="space-y-6">
                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createStockData.modelId}
                    onChange={(e) => setCreateStockData({ ...createStockData, modelId: e.target.value, colorId: '' })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">-- Chọn model --</option>
                    {models.map(model => (
                      <option key={model.modelId} value={model.modelId}>
                        {model.modelName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Màu sắc <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createStockData.colorId}
                    onChange={(e) => setCreateStockData({ ...createStockData, colorId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                    disabled={!createStockData.modelId}
                  >
                    <option value="">-- Chọn màu sắc --</option>
                    {getAvailableColors().map(mc => (
                      <option key={mc.colorId || mc.id} value={mc.colorId || mc.id}>
                        {mc.colorName || mc.name || `Màu #${mc.colorId || mc.id}`}
                      </option>
                    ))}
                  </select>
                  {!createStockData.modelId ? (
                    <p className="mt-1 text-xs text-gray-500">Vui lòng chọn model trước</p>
                  ) : getAvailableColors().length === 0 ? (
                    <p className="mt-1 text-xs text-amber-600">⚠️ Model này chưa có màu sắc nào được cấu hình</p>
                  ) : null}
                </div>

                {/* Price and Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giá bán (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={createStockData.priceOfStore}
                      onChange={(e) => setCreateStockData({ ...createStockData, priceOfStore: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Ví dụ: 320000000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={createStockData.quantity}
                      onChange={(e) => setCreateStockData({ ...createStockData, quantity: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="Ví dụ: 5"
                      required
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <motion.button 
                    type="button" 
                    onClick={handleCloseCreateStock}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium"
                  >
                    Hủy
                  </motion.button>
                  <motion.button 
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg shadow-md font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tạo dữ liệu
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Price Modal */}
      <AnimatePresence>
        {updatePriceModal && selectedPriceItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseUpdatePrice}
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
              className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Cập nhật giá bán</h3>
                  <p className="text-sm text-gray-600 mt-1">Thay đổi giá bán cho xe này</p>
                </div>
                <button 
                  onClick={handleCloseUpdatePrice} 
                  className="text-gray-400"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitUpdatePrice} className="space-y-4">
                {/* Stock Info */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Thông tin xe
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Model:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedPriceItem.modelName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Màu sắc:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedPriceItem.colorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Giá hiện tại:</span>
                      <span className="text-sm font-bold text-emerald-600">
                        {formatPrice(selectedPriceItem.currentPrice)} VNĐ
                      </span>
                    </div>
                  </div>
                </div>

                {/* New Price Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá bán mới (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    placeholder="Ví dụ: 320000000"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <motion.button 
                    type="button" 
                    onClick={handleCloseUpdatePrice}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium"
                  >
                    Hủy
                  </motion.button>
                  <motion.button 
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg shadow-md font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Cập nhật giá
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

export default InventoryManagement;
