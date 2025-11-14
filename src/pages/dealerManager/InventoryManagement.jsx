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
  Plus,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Box,
  FileText,
  Send,
  Edit,
  Upload
} from 'lucide-react';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import ModernButton from '../../components/ui/ModernButton';
import OrderStatusStepper from '../../components/ui/OrderStatusStepper';
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

  // Tab state
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'transactions'

  // Inventory view states
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModels, setExpandedModels] = useState(new Set());

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
    // Initial load
    dispatch(getAllStoreStocksThunk());
    dispatch(getAllTransactionsThunk());
    dispatch(getAllModelColorsThunk());
    dispatch(getAllModelsThunk());
    dispatch(fetchActivePromotions());

    // Auto-refresh transactions every 10 seconds to catch updates from EVM staff
    const refreshInterval = setInterval(() => {
      dispatch(getAllTransactionsThunk());
    }, 10000); // Refresh every 10 seconds

    // Also refresh when window regains focus (user switches back to tab)
    const handleFocus = () => {
      dispatch(getAllTransactionsThunk());
      dispatch(getAllStoreStocksThunk());
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch]);

  // Transform API data to match UI format (inventory view)
  useEffect(() => {
    if (storeStocksStatus === 'succeeded') {
      if (storeStocks.length > 0) {
        // Filter by my store
        const myStoreStocks = storeStocks.filter(s => s.storeId === myStoreId);
        
        // Group by model
        const groupedByModel = myStoreStocks.reduce((acc, stock) => {
          const modelName = stock.modelName;
          
          if (!acc[modelName]) {
            acc[modelName] = {
              id: stock.modelId,
              model: modelName,
              totalStock: 0,
              colors: []
            };
          }
          
          acc[modelName].totalStock += stock.quantity;
          acc[modelName].colors.push({
            color: stock.colorName,
            stock: stock.quantity,
            price: stock.priceOfStore,
            stockId: stock.stockId,
            storeName: stock.storeName,
            storeId: stock.storeId,
            modelId: stock.modelId,
            colorId: stock.colorId
          });
          
          return acc;
        }, {});
        
        const transformedInventory = Object.values(groupedByModel);
        setInventory(transformedInventory);
        setFilteredInventory(transformedInventory);
      } else {
        setInventory([]);
        setFilteredInventory([]);
      }
    }
  }, [storeStocks, storeStocksStatus, myStoreId]);

  // Filter inventory based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter(vehicle =>
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.colors.some(colorItem => 
          colorItem.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
          colorItem.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredInventory(filtered);
    }
  }, [searchTerm, inventory]);

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
        // Sort by transaction date (newest first)
        const dateA = new Date(a.orderDate || a.transactionDate || a.createdAt || 0);
        const dateB = new Date(b.orderDate || b.transactionDate || b.createdAt || 0);
        return dateB - dateA;
      });
    
    console.log('Filtered transactions for my store:', filtered.length);
    console.log('Transaction statuses:', filtered.map(t => ({ id: t.inventoryId || t.id, status: t.status })));
    
    return filtered;
  }, [transactions, storeStocks, myStoreId]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStock = inventory.reduce((sum, v) => sum + v.totalStock, 0);
    const totalModels = inventory.length;
    const totalColors = inventory.reduce((sum, v) => sum + v.colors.length, 0);
    
    const pendingCount = myTransactions.filter(t => {
      const status = (t.status || '').toUpperCase();
      return status === 'PENDING';
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
      shippingCount,
      completedCount,
      totalTransactions: myTransactions.length
    };
  }, [inventory, myTransactions]);

  // Helper functions
  const formatPrice = (price) => {
    if (!price && price !== 0) return '0';
    // Convert to number and round if needed
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0';
    // Format with dots as thousand separators
    return Math.round(numPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const toggleExpanded = (modelId) => {
    const newExpanded = new Set(expandedModels);
    if (newExpanded.has(modelId)) {
      newExpanded.delete(modelId);
    } else {
      newExpanded.add(modelId);
    }
    setExpandedModels(newExpanded);
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
  const handleOpenRequest = () => {
    setRequestData({
      storeStockId: '',
      stockInfo: null,
      modelId: '',
      colorId: '',
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

      await dispatch(createTransactionThunk(payload)).unwrap();
      
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

    // Get current stock info before confirmation
    const stock = getStockInfoForTransaction(selectedTransaction);
    const currentQuantity = stock?.quantity || 0;
    const newQuantity = currentQuantity + selectedTransaction.importQuantity;

    try {
      await dispatch(confirmDeliveryTransactionThunk(selectedTransaction.inventoryId || selectedTransaction.id)).unwrap();
      dispatch(showSuccess({ 
        message: `✅ Đã xác nhận nhận hàng thành công! Đã cập nhật +${selectedTransaction.importQuantity} xe vào kho (từ ${currentQuantity} → ${newQuantity} xe)` 
      }));
      
      setConfirmDeliveryModal(false);
      setSelectedTransaction(null);
      
      // Auto-refresh inventory and transactions to show updated stock
      dispatch(getAllStoreStocksThunk());
      dispatch(getAllTransactionsThunk());
    } catch (error) {
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
    if (statusUpper !== 'ACCEPTED' && statusUpper !== 'APPROVED' && statusUpper !== 'CONFIRMED') {
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
      'FILE_UPLOADED': 'Đã upload biên lai. Đang chờ EVM xác nhận thanh toán.',
      'PAYMENT_CONFIRMED': 'Thanh toán đã được xác nhận. Đang chờ EVM bắt đầu vận chuyển.',
      'IN_TRANSIT': 'Đang vận chuyển. Vui lòng xác nhận khi nhận được hàng.',
      'DELIVERED': 'Đã hoàn thành và cập nhật vào kho',
      'REJECTED': 'Yêu cầu đã bị từ chối bởi EVM'
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
  const handleOpenUpdatePrice = (colorItem, vehicle) => {
    setSelectedPriceItem({
      modelId: colorItem.modelId,
      colorId: colorItem.colorId,
      modelName: vehicle.model,
      colorName: colorItem.color,
      currentPrice: colorItem.price
    });
    setNewPrice(colorItem.price?.toString() || '');
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
              {/* Search Bar */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tồn kho hiện tại</h2>
                <div className="flex items-center gap-3">
                  <div className="relative w-80">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo model, màu sắc..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                  <ModernButton
                    onClick={handleOpenCreateStock}
                    icon={<Plus className="w-4 h-4" />}
                    roleColor="emerald"
                    size="md"
                  >
                    Thêm xe
                  </ModernButton>
                </div>
              </div>

              {/* Vehicle Cards Grid */}
              <div className="space-y-4">
                {filteredInventory.length === 0 && storeStocksStatus === 'succeeded' ? (
                  <EmptyState
                    title={searchTerm ? 'Không tìm thấy xe nào' : 'Không có dữ liệu kho hàng'}
                    description={searchTerm ? 'Thử thay đổi từ khóa tìm kiếm.' : 'Kho hàng hiện tại chưa có xe nào.'}
                    icon="package"
                    action={!searchTerm ? handleOpenCreateStock : undefined}
                    actionText={!searchTerm ? 'Tạo dữ liệu xe ban đầu' : undefined}
                    roleColor="emerald"
                  />
                ) : (
                  filteredInventory.map((vehicle) => (
                    <motion.div
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6"
                    >
                      {/* Vehicle Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Package className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{vehicle.model}</h3>
                            <p className="text-gray-600 flex items-center gap-2">
                              <span>Tổng tồn:</span>
                              <span className="font-bold text-emerald-600 text-lg">{vehicle.totalStock} xe</span>
                            </p>
                          </div>
                        </div>
                        <ModernButton
                          onClick={() => toggleExpanded(vehicle.id)}
                          variant="secondary"
                          icon={expandedModels.has(vehicle.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        >
                          {expandedModels.has(vehicle.id) ? 'Ẩn chi tiết' : 'Xem chi tiết màu'}
                        </ModernButton>
                      </div>

                      {/* Color Details Table */}
                      {expandedModels.has(vehicle.id) && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Box className="w-5 h-5 text-emerald-600" />
                              Chi tiết màu sắc
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full">
                                <thead>
                                  <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Màu sắc</th>
                                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Số lượng tồn</th>
                                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Giá bán</th>
                                    <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Thao tác</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {vehicle.colors.map((colorItem, index) => (
                                    <motion.tr 
                                      key={index} 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className=""
                                    >
                                      <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                          <div className={`w-6 h-6 rounded-full border-2 border-white shadow-md ${getColorPreview(colorItem.color)}`}></div>
                                          <span className="text-sm font-medium text-gray-900">{colorItem.color}</span>
                                        </div>
                                      </td>
                                      <td className="py-4 px-4">
                                        <span className={`text-sm font-bold flex items-center gap-2 ${
                                          colorItem.stock === 0 ? 'text-red-600' :
                                          colorItem.stock <= 3 ? 'text-yellow-600' :
                                          'text-green-600'
                                        }`}>
                                          {colorItem.stock === 0 && <AlertCircle className="w-4 h-4" />}
                                          {colorItem.stock > 0 && colorItem.stock <= 3 && <AlertCircle className="w-4 h-4" />}
                                          {colorItem.stock} xe
                                          {colorItem.stock === 0 && ' (Hết hàng)'}
                                          {colorItem.stock > 0 && colorItem.stock <= 3 && ' (Sắp hết)'}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                            <DollarSign className="w-4 h-4 text-emerald-600" />
                                            {formatPrice(colorItem.price)} VNĐ
                                          </span>
                                          <ModernButton
                                            onClick={() => handleOpenUpdatePrice(colorItem, vehicle)}
                                            size="sm"
                                            variant="secondary"
                                            icon={<Edit className="w-3 h-3" />}
                                            roleColor="yellow"
                                          >
                                            Sửa
                                          </ModernButton>
                                        </div>
                                      </td>
                                      <td className="py-4 px-4">
                                        <ModernButton
                                          onClick={handleOpenRequest}
                                          size="sm"
                                          icon={<ShoppingCart className="w-4 h-4" />}
                                          roleColor="blue"
                                          noHover={true}
                                        >
                                          Đặt hàng
                                        </ModernButton>
                                      </td>
                                    </motion.tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
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
                <h2 className="text-2xl font-bold text-gray-900">Lịch sử yêu cầu đặt hàng</h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">
                    Tổng: {stats.totalTransactions} yêu cầu
                  </span>
                </div>
              </div>

              {transactionsStatus === 'loading' ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
                </div>
              ) : myTransactions.length === 0 ? (
                <EmptyState
                  title="Chưa có yêu cầu nào"
                  description="Các yêu cầu đặt hàng sẽ hiển thị ở đây"
                  icon="file"
                  roleColor="blue"
                />
              ) : (
                <div className="space-y-6">
                  {myTransactions.map((transaction, index) => {
                    const stock = getStockInfoForTransaction(transaction);
                    const statusUpper = (transaction.status || '').toUpperCase();
                    const canConfirmDelivery = statusUpper === 'IN_TRANSIT';
                    // Allow upload receipt for CONFIRMED, ACCEPTED, or APPROVED status
                    const canUploadReceipt = statusUpper === 'CONFIRMED' || 
                                            statusUpper === 'ACCEPTED' || 
                                            statusUpper === 'APPROVED';
                    
                    return (
                      <motion.div
                        key={transaction.inventoryId || transaction.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
                      >
                        {/* Order Header with ID and Date */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white/20 rounded-lg">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold">Đơn hàng #{transaction.inventoryId || transaction.id}</h3>
                                <p className="text-sm text-blue-100">
                                  {transaction.orderDate 
                                    ? new Date(transaction.orderDate).toLocaleDateString('vi-VN', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                    : 'N/A'
                                  }
                                </p>
                              </div>
                            </div>
                            <StatusBadge status={transaction.status} size="md" />
                          </div>
                        </div>

                        <div className="p-6 space-y-6">
                          {/* Order Status Stepper */}
                          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              Tiến trình đơn hàng
                            </h4>
                            <OrderStatusStepper currentStatus={transaction.status} size="sm" />
                          </div>
                          
                          {/* Transaction Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                              <p className="text-xs text-gray-500 mb-2 font-medium">Model • Màu</p>
                              <p className="text-sm font-bold text-gray-900">
                                {stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A'}
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                              <p className="text-xs text-gray-500 mb-2 font-medium">Số lượng</p>
                              <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {transaction.importQuantity} xe
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                              <p className="text-xs text-gray-500 mb-2 font-medium">Ngày giao dự kiến</p>
                              <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                {transaction.deliveryDate 
                                  ? new Date(transaction.deliveryDate).toLocaleDateString('vi-VN')
                                  : 'Chưa xác định'
                                }
                              </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                              <p className="text-xs text-gray-500 mb-2 font-medium">Tổng giá</p>
                              <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                {transaction.totalPrice > 0 ? formatPrice(transaction.totalPrice) : 'N/A'} VNĐ
                              </p>
                            </div>
                          </div>

                          {/* Price Breakdown (if available) */}
                          {transaction.totalPrice > 0 && (transaction.unitBasePrice || transaction.discountPercentage > 0) && (
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-200">
                              <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-600" />
                                Chi tiết giá
                              </h4>
                              <div className="space-y-2">
                                {transaction.unitBasePrice && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Đơn giá:</span>
                                    <span className="font-medium text-gray-900">{formatPrice(transaction.unitBasePrice)} VNĐ</span>
                                  </div>
                                )}
                                {transaction.totalBasePrice && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tổng cơ bản:</span>
                                    <span className="font-medium text-gray-900">{formatPrice(transaction.totalBasePrice)} VNĐ</span>
                                  </div>
                                )}
                                {transaction.discountPercentage > 0 && (
                                  <div className="flex justify-between text-sm text-orange-600">
                                    <span>Giảm giá ({transaction.discountPercentage}%):</span>
                                    <span className="font-medium">-{formatPrice(transaction.discountAmount)} VNĐ</span>
                                  </div>
                                )}
                                <div className="pt-2 border-t-2 border-emerald-200 flex justify-between">
                                  <span className="text-sm font-bold text-gray-900">Tổng thanh toán:</span>
                                  <span className="text-lg font-bold text-emerald-600">{formatPrice(transaction.totalPrice)} VNĐ</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Status Message */}
                          {getStatusMessage(statusUpper) && (
                            <div className={`rounded-xl p-4 flex items-center gap-3 ${
                              statusUpper === 'PENDING' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' :
                              statusUpper === 'CONFIRMED' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200' :
                              statusUpper === 'FILE_UPLOADED' ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200' :
                              statusUpper === 'PAYMENT_CONFIRMED' ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200' :
                              statusUpper === 'IN_TRANSIT' ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200' :
                              statusUpper === 'DELIVERED' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' :
                              statusUpper === 'REJECTED' ? 'bg-gradient-to-r from-red-50 to-pink-50 border border-red-200' :
                              'bg-gray-50 border border-gray-200'
                            }`}>
                              {statusUpper === 'PENDING' && <Clock className="w-5 h-5 text-yellow-600" />}
                              {statusUpper === 'CONFIRMED' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                              {statusUpper === 'FILE_UPLOADED' && <Upload className="w-5 h-5 text-amber-600" />}
                              {statusUpper === 'PAYMENT_CONFIRMED' && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
                              {statusUpper === 'IN_TRANSIT' && <Truck className="w-5 h-5 text-purple-600" />}
                              {statusUpper === 'DELIVERED' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                              {statusUpper === 'REJECTED' && <XCircle className="w-5 h-5 text-red-600" />}
                              <p className={`text-sm font-medium ${
                                statusUpper === 'PENDING' ? 'text-yellow-800' :
                                statusUpper === 'CONFIRMED' ? 'text-blue-800' :
                                statusUpper === 'FILE_UPLOADED' ? 'text-amber-800' :
                                statusUpper === 'PAYMENT_CONFIRMED' ? 'text-teal-800' :
                                statusUpper === 'IN_TRANSIT' ? 'text-purple-800' :
                                statusUpper === 'DELIVERED' ? 'text-green-800' :
                                statusUpper === 'REJECTED' ? 'text-red-800' :
                                'text-gray-800'
                              }`}>
                                {getStatusMessage(statusUpper)}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {(canUploadReceipt || canConfirmDelivery) && (
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                              {canUploadReceipt && (
                                <ModernButton
                                  onClick={() => handleOpenUploadReceipt(transaction)}
                                  icon={<Upload className="w-4 h-4" />}
                                  roleColor="blue"
                                  size="md"
                                >
                                  Upload biên lai
                                </ModernButton>
                              )}
                              {canConfirmDelivery && (
                                <ModernButton
                                  onClick={() => handleOpenConfirmDelivery(transaction)}
                                  icon={<CheckCircle2 className="w-4 h-4" />}
                                  roleColor="green"
                                  size="md"
                                >
                                  Xác nhận nhận hàng
                                </ModernButton>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Màu sắc <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={requestData.colorId}
                      onChange={(e) => setRequestData({ ...requestData, colorId: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={!requestData.modelId}
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

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Model • Màu:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(() => {
                        const stock = getStockInfoForTransaction(selectedTransaction);
                        return stock ? `${stock.modelName} • ${stock.colorName}` : 'N/A';
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Số lượng nhận:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedTransaction.importQuantity} xe</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tồn kho hiện tại:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(() => {
                        const stock = getStockInfoForTransaction(selectedTransaction);
                        return stock ? `${stock.quantity} xe` : 'N/A';
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tồn kho sau khi nhận:</span>
                    <span className="text-sm font-bold text-green-600">
                      {(() => {
                        const stock = getStockInfoForTransaction(selectedTransaction);
                        const currentQty = stock?.quantity || 0;
                        return `${currentQty + selectedTransaction.importQuantity} xe`;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ngày giao dự kiến:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedTransaction.deliveryDate 
                        ? new Date(selectedTransaction.deliveryDate).toLocaleDateString('vi-VN')
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

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
