import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Download, Printer, Plus, Eye, Edit, Truck, Package, Clock, FileText, Upload, Receipt } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import SearchBar from '../../../components/shared/SearchBar';
import MetricCard from '../../../components/shared/MetricCard';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Dropdown from '../../../components/ui/Dropdown';
import {
  useGetAllStoreStocksQuery,
  useGetAllInventoryTransactionsQuery,
  useCreateInventoryTransactionMutation,
  useDownloadContractHtmlMutation,
  useUploadContractMutation,
  useUploadReceiptMutation,
} from '../../../api/dealerManager/inventoryApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { useGetModelColorsByModelQuery } from '../../../api/dealerStaff/vehicleApi';
import { useGetMyStoreQuery } from '../../../api/dealerManager/storeApi';

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'requests'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isUploadContractModalOpen, setIsUploadContractModalOpen] = useState(false);
  const [isUploadReceiptModalOpen, setIsUploadReceiptModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [contractFile, setContractFile] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [formData, setFormData] = useState({
    modelId: '',
    colorId: '',
    quantity: 1,
    notes: '',
  });

  const { data: stocksData, isLoading, error } = useGetAllStoreStocksQuery();
  const { data: modelsData } = useGetAllModelsQuery();
  const { data: transactionsData, isLoading: isLoadingTransactions } = useGetAllInventoryTransactionsQuery();
  const { data: modelColorsData } = useGetModelColorsByModelQuery(selectedModelId, {
    skip: !selectedModelId,
  });
  const { data: storeData } = useGetMyStoreQuery();
  const [createTransaction, { isLoading: isCreating }] = useCreateInventoryTransactionMutation();
  const [downloadContractHtml] = useDownloadContractHtmlMutation();
  const [uploadContract, { isLoading: isUploadingContract }] = useUploadContractMutation();
  const [uploadReceipt, { isLoading: isUploadingReceipt }] = useUploadReceiptMutation();

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

  // Filter stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesSearch =
        stock.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.colorName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [stocks, searchTerm]);

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

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.inventoryId?.toString().includes(searchTerm) ||
        transaction.modelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.colorName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [transactions, searchTerm]);

  // Pagination for transactions
  const transactionPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const transactionStartIndex = (currentPage - 1) * itemsPerPage;
  const transactionEndIndex = transactionStartIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(transactionStartIndex, transactionEndIndex);

  const getTransactionStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Chờ duyệt' },
      CONFIRMED: { variant: 'info', label: 'Đã xác nhận' },
      DRAFT: { variant: 'default', label: 'Nháp hợp đồng' },
      EVM_SIGNED: { variant: 'info', label: 'EVM đã ký' },
      SIGNED: { variant: 'success', label: 'Đã ký hợp đồng' },
      CONTRACT_SIGNED: { variant: 'success', label: 'Đã ký hợp đồng' },
      FILE_UPLOADED: { variant: 'info', label: 'Đã upload biên lai' },
      PAYMENT_CONFIRMED: { variant: 'success', label: 'Đã xác nhận thanh toán' },
      IN_TRANSIT: { variant: 'info', label: 'Đang vận chuyển' },
      DELIVERED: { variant: 'success', label: 'Đã giao' },
      REJECTED: { variant: 'error', label: 'Từ chối' },
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

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!store?.storeId) {
      alert('Không tìm thấy thông tin đại lý');
      return;
    }
    try {
      // Tìm storeStockId từ modelId và colorId (nếu có)
      // Nếu không có storeStockId, có thể để null hoặc 0
      const storeStock = stocks.find(
        (stock) => stock.modelId === parseInt(formData.modelId) && stock.colorId === parseInt(formData.colorId)
      );
      
      await createTransaction({
        storeStockId: storeStock?.stockId || null,
        quantity: parseInt(formData.quantity),
        transactionType: 'IN', // Đặt xe từ hãng = nhập vào
        notes: formData.notes || undefined,
        requestedStoreId: store.storeId, // Store của dealer manager
        sourceStoreId: null, // Từ hãng, không có source store
        // Backend có thể cần modelId và colorId để tạo storeStock nếu chưa có
        modelId: parseInt(formData.modelId),
        colorId: parseInt(formData.colorId),
      }).unwrap();
      alert('Yêu cầu đặt xe đã được gửi thành công');
      setIsOrderModalOpen(false);
      setFormData({
        modelId: '',
        colorId: '',
        quantity: 1,
        notes: '',
      });
      setSelectedModelId('');
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu đặt xe');
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
      
      alert('Đã tải hợp đồng thành công. Vui lòng mở file, ký và upload lại.');
    } catch (error) {
      alert('Có lỗi xảy ra khi tải hợp đồng');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleUploadContract = async (e) => {
    e.preventDefault();
    if (!contractFile || !selectedTransactionId) {
      alert('Vui lòng chọn file hợp đồng');
      return;
    }
    try {
      await uploadContract({
        inventoryId: selectedTransactionId,
        file: contractFile,
      }).unwrap();
      alert('Upload hợp đồng thành công');
      setIsUploadContractModalOpen(false);
      setContractFile(null);
      setSelectedTransactionId(null);
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi upload hợp đồng');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  const handleUploadReceipt = async (e) => {
    e.preventDefault();
    if (!receiptFile || !selectedTransactionId) {
      alert('Vui lòng chọn file biên lai');
      return;
    }
    try {
      await uploadReceipt({
        inventoryId: selectedTransactionId,
        file: receiptFile,
      }).unwrap();
      alert('Upload biên lai thành công');
      setIsUploadReceiptModalOpen(false);
      setReceiptFile(null);
      setSelectedTransactionId(null);
    } catch (error) {
      alert(error?.data?.message || 'Có lỗi xảy ra khi upload biên lai');
      if (import.meta.env.DEV) {
        console.error(error);
      }
    }
  };

  // Reset page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  if (isLoading) {
    return (
      <DealerManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
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
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter size={20} />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download size={20} />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Printer size={20} />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {paginatedStocks.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
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
                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                  <Eye size={16} />
                                </button>
                                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                                  <Edit size={16} />
                                </button>
                                <button className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors">
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
                <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
              ) : paginatedTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Không có yêu cầu đặt xe nào</div>
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
                                {/* FILE_UPLOADED: Upload receipt */}
                                {transaction.status === 'FILE_UPLOADED' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedTransactionId(transaction.inventoryId);
                                      setIsUploadReceiptModalOpen(true);
                                    }}
                                  >
                                    <Receipt size={16} className="mr-1" />
                                    Upload biên lai
                                  </Button>
                                )}
                                {/* SIGNED hoặc CONTRACT_SIGNED: Xem chi tiết */}
                                {(transaction.status === 'SIGNED' || transaction.status === 'CONTRACT_SIGNED') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      // TODO: Xem chi tiết
                                    }}
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
                onChange={handleModelChange}
                placeholder="Chọn model"
              />
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
                  onChange={(value) => setFormData({ ...formData, colorId: value })}
                  placeholder="Chọn màu sắc"
                />
              </div>
            )}

            <Input
              label="Số lượng *"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              required
            />

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
                {isCreating ? 'Đang gửi...' : 'Gửi yêu cầu'}
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
      </div>
    </DealerManagerLayout>
  );
};

export default InventoryPage;

