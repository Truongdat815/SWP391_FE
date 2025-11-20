import { useState, useMemo } from 'react';
import { 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  Truck, 
  Package, 
  RefreshCw,
  Upload,
  FileText
} from 'lucide-react';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import MetricCard from '../../../components/shared/MetricCard';
import Badge from '../../../components/ui/Badge';
import Dropdown from '../../../components/ui/Dropdown';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
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
} from '../../../api/evmStaff/inventoryApi';

const DealerOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('all');
  const [dealerFilter, setDealerFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  // Xử lý lỗi 404 cho transactions (EVM Staff có thể không có store)
  const isStoreNotFoundError = (err) => {
    return (
      err?.status === 404 &&
      (err?.data?.message?.includes('Không tìm thấy store') ||
        err?.data?.message?.includes('Not found') ||
        err?.data?.message?.includes('store'))
    );
  };

  // Nếu lỗi 404 (store not found), vẫn hiển thị mảng rỗng thay vì lỗi
  const transactions = isStoreNotFoundError(error) ? [] : (transactionsData?.data || []);
  const stores = storesData?.data || [];
  const statuses = statusesData?.data || [];

  // Tính toán số lượng đơn hàng theo trạng thái
  const statusCounts = useMemo(() => {
    return {
      PENDING: transactions.filter((t) => t.status === 'PENDING' || t.status === 'DRAFT').length,
      CONFIRM_PAYMENT: transactions.filter((t) => t.status === 'DELIVERED').length,
      PROCESSING: transactions.filter((t) => 
        t.status === 'ACCEPTED' || 
        t.status === 'CONFIRMED' || 
        t.status === 'PROCESSING'
      ).length,
      SHIPPING: transactions.filter((t) => t.status === 'SHIPPING').length,
      COMPLETED: transactions.filter((t) => t.status === 'COMPLETED').length,
    };
  }, [transactions]);

  // Filter và sort transactions (mới nhất lên trên)
  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      const matchesSearch =
        transaction.inventoryId?.toString().includes(searchTerm) ||
        transaction.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.modelName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Logic filter status phù hợp với các button filter
      let matchesStatus = true;
      if (statusFilter !== 'all') {
        if (statusFilter === 'PENDING') {
          matchesStatus = transaction.status === 'PENDING' || transaction.status === 'DRAFT';
        } else if (statusFilter === 'ACCEPTED') {
          matchesStatus = transaction.status === 'ACCEPTED' || 
                         transaction.status === 'CONFIRMED' || 
                         transaction.status === 'PROCESSING';
        } else if (statusFilter === 'DELIVERED') {
          matchesStatus = transaction.status === 'DELIVERED';
        } else {
          matchesStatus = transaction.status === statusFilter;
        }
      }
      
      const matchesDealer =
        dealerFilter === 'all' || transaction.storeId?.toString() === dealerFilter;
      return matchesSearch && matchesStatus && matchesDealer;
    });
    
    // Sắp xếp theo orderDate giảm dần (mới nhất lên trên)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.orderDate || a.createdAt || 0);
      const dateB = new Date(b.orderDate || b.createdAt || 0);
      return dateB - dateA; // Giảm dần
    });
  }, [transactions, searchTerm, statusFilter, dealerFilter]);

  // Pagination
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

  const getStatusLabel = (status) => {
    const statusMap = {
      DRAFT: 'Nháp',
      PENDING: 'Chờ xử lý',
      CONFIRMED: 'Đã xác nhận',
      ACCEPTED: 'Đã chấp nhận',
      PROCESSING: 'Đang xử lý',
      SHIPPING: 'Đang vận chuyển',
      DELIVERED: 'Đã giao',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      REJECTED: 'Đã từ chối',
    };
    return statusMap[status] || status || 'N/A';
  };

  // Xác định progress steps dựa trên status
  const getProgressSteps = (status) => {
    const steps = [
      { key: 'PENDING', label: 'Chờ xử lý', icon: Clock },
      { key: 'ACCEPTED', label: 'Đã chấp nhận', icon: CheckCircle2 },
      { key: 'CONTRACT', label: 'Đã ký hợp đồng', icon: FileText },
      { key: 'UPLOADED', label: 'Đã upload', icon: Upload },
      { key: 'PAID', label: 'Đã thanh toán', icon: CreditCard },
      { key: 'SHIPPING', label: 'Vận chuyển', icon: Truck },
      { key: 'DELIVERED', label: 'Đã giao', icon: Package },
    ];

    const statusOrder = {
      PENDING: 0,
      DRAFT: 0,
      ACCEPTED: 1,
      CONFIRMED: 2,
      PROCESSING: 2,
      SHIPPING: 5,
      DELIVERED: 6,
      COMPLETED: 6,
    };

    const currentStep = statusOrder[status] ?? 0;
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStep,
      active: index === currentStep,
    }));
  };

  // Lấy action button text dựa trên status
  const getActionButton = (status) => {
    if (status === 'PENDING' || status === 'DRAFT') return 'Chấp nhận';
    if (status === 'ACCEPTED' || status === 'CONFIRMED') return 'Đã xác nhận';
    if (status === 'SHIPPING') return 'Xác nhận giao';
    if (status === 'DELIVERED') return 'Xác nhận thanh toán';
    if (status === 'COMPLETED') return 'Đã giao';
    return null;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const handleAcceptTransaction = async (inventoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn chấp nhận yêu cầu này?')) {
      try {
        await acceptRequest(inventoryId).unwrap();
        alert('Đã chấp nhận yêu cầu thành công');
      } catch (error) {
        alert('Có lỗi xảy ra khi chấp nhận yêu cầu');
        console.error(error);
      }
    }
  };

  const handleConfirmDelivery = async (inventoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xác nhận đã giao hàng?')) {
      try {
        await confirmDelivery(inventoryId).unwrap();
        alert('Đã xác nhận giao hàng thành công');
      } catch (error) {
        alert('Có lỗi xảy ra khi xác nhận giao hàng');
        console.error(error);
      }
    }
  };

  const handleRejectTransaction = async (inventoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối giao dịch này?')) {
      try {
        await rejectRequest(inventoryId).unwrap();
        alert('Đã từ chối giao dịch thành công');
      } catch (error) {
        alert('Có lỗi xảy ra khi từ chối giao dịch');
        console.error(error);
      }
    }
  };

  const handleStartShipping = async (inventoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn bắt đầu vận chuyển?')) {
      try {
        await startShipping(inventoryId).unwrap();
        alert('Đã bắt đầu vận chuyển thành công');
      } catch (error) {
        alert('Có lỗi xảy ra khi bắt đầu vận chuyển');
        console.error(error);
      }
    }
  };

  const handleConfirmPayment = async (inventoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xác nhận thanh toán?')) {
      try {
        await confirmPayment(inventoryId).unwrap();
        alert('Đã xác nhận thanh toán thành công');
      } catch (error) {
        alert('Có lỗi xảy ra khi xác nhận thanh toán');
        console.error(error);
      }
    }
  };

  const handleCancelTransaction = async (inventoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy giao dịch này?')) {
      try {
        await cancelRequest(inventoryId).unwrap();
        alert('Đã hủy giao dịch thành công');
      } catch (error) {
        alert('Có lỗi xảy ra khi hủy giao dịch');
        console.error(error);
      }
    }
  };

  if (isLoading || isLoadingStores) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </EVMStaffLayout>
    );
  }

  // Kiểm tra lỗi 401 (Unauthorized)
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
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng từ đại lý</h1>
                <p className="text-gray-600 mt-1">Xử lý yêu cầu nhập hàng từ Dealer Manager và Staff</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Cập nhật mới nhất
            </Button>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <MetricCard
            title="Chờ xử lý"
            value={statusCounts.PENDING}
            icon={Clock}
            className="bg-gradient-to-br from-orange-400 to-orange-500 text-white"
          />
          <MetricCard
            title="Xác nhận thanh toán"
            value={statusCounts.CONFIRM_PAYMENT}
            icon={CreditCard}
            className="bg-gradient-to-br from-orange-400 to-orange-500 text-white"
          />
          <MetricCard
            title="Đang xử lý"
            value={statusCounts.PROCESSING}
            icon={CheckCircle2}
            className="bg-gradient-to-br from-teal-400 to-teal-500 text-white"
          />
          <MetricCard
            title="Vận chuyển"
            value={statusCounts.SHIPPING}
            icon={Truck}
            className="bg-gradient-to-br from-purple-400 to-purple-500 text-white"
          />
          <MetricCard
            title="Hoàn thành"
            value={statusCounts.COMPLETED}
            icon={Package}
            className="bg-gradient-to-br from-green-400 to-green-500 text-white"
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm theo Mã giao dịch, Tên đại lý, Model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Khoảng thời gian' },
                { value: 'today', label: 'Hôm nay' },
                { value: 'week', label: 'Tuần này' },
                { value: 'month', label: 'Tháng này' },
              ]}
              value={timeRangeFilter}
              onChange={setTimeRangeFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Đại lý' },
                ...stores.map((store) => ({
                  value: store.storeId?.toString(),
                  label: store.storeName || `Store ${store.storeId}`,
                })),
              ]}
              value={dealerFilter}
              onChange={setDealerFilter}
            />
          </div>
          
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { key: 'PENDING', label: 'Chờ xử lý', icon: Clock, count: statusCounts.PENDING, color: 'orange' },
              { key: 'PROCESSING', label: 'Đang xử lí', icon: FileText, count: statusCounts.PROCESSING, color: 'gray' },
              { key: 'CONFIRM_PAYMENT', label: 'Xác nhận thanh toán', icon: CheckCircle2, count: statusCounts.CONFIRM_PAYMENT, color: 'gray' },
              { key: 'SHIPPING', label: 'Vận chuyển', icon: Truck, count: statusCounts.SHIPPING, color: 'gray' },
              { key: 'COMPLETED', label: 'Hoàn thành', icon: Package, count: statusCounts.COMPLETED, color: 'green' },
            ].map(({ key, label, icon: Icon, count, color }) => {
              const isActive = 
                (key === 'PENDING' && (statusFilter === 'PENDING' || statusFilter === 'DRAFT')) ||
                (key === 'PROCESSING' && (statusFilter === 'ACCEPTED' || statusFilter === 'CONFIRMED' || statusFilter === 'PROCESSING')) ||
                (key === 'CONFIRM_PAYMENT' && statusFilter === 'DELIVERED') ||
                (key === 'SHIPPING' && statusFilter === 'SHIPPING') ||
                (key === 'COMPLETED' && statusFilter === 'COMPLETED');
              
              const buttonClasses = {
                orange: isActive ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
                gray: isActive ? 'bg-gray-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
                green: isActive ? 'bg-green-500 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
              };
              
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'PENDING') setStatusFilter('PENDING');
                    else if (key === 'PROCESSING') setStatusFilter('ACCEPTED');
                    else if (key === 'CONFIRM_PAYMENT') setStatusFilter('DELIVERED');
                    else if (key === 'SHIPPING') setStatusFilter('SHIPPING');
                    else if (key === 'COMPLETED') setStatusFilter('COMPLETED');
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${buttonClasses[color]}`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                  {count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : color === 'green' 
                          ? 'bg-green-100 text-green-700' 
                          : color === 'orange'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Cards */}
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              {isStoreNotFoundError(error) ? (
                <div className="space-y-2">
                  <Package size={64} className="mx-auto text-gray-300" />
                  <p className="text-gray-500 text-lg font-medium">Chưa có giao dịch kho nào trong hệ thống</p>
                  <p className="text-sm text-gray-400">
                    Các giao dịch kho từ đại lý sẽ hiển thị tại đây khi có dữ liệu
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Package size={64} className="mx-auto text-gray-300" />
                  <p className="text-gray-500 text-lg font-medium">Không có dữ liệu giao dịch kho</p>
                </div>
              )}
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300" />
              <p className="text-gray-500 text-lg font-medium mt-4">Không có đơn hàng {statusFilter === 'PENDING' || statusFilter === 'DRAFT' ? 'chờ xử lý' : statusFilter === 'DELIVERED' ? 'cần xác nhận thanh toán' : statusFilter === 'SHIPPING' ? 'đang vận chuyển' : 'phù hợp với bộ lọc'}</p>
              <p className="text-sm text-gray-400 mt-2">
                {statusFilter === 'DELIVERED' 
                  ? 'Các đơn hàng đã upload biên lai cần xác nhận sẽ xuất hiện ở đây'
                  : statusFilter === 'SHIPPING'
                    ? 'Các đơn hàng đang giao sẽ xuất hiện ở đây'
                    : 'Các đơn hàng mới sẽ xuất hiện ở đây'}
              </p>
            </div>
          ) : (
            paginatedTransactions.map((transaction) => {
              const progressSteps = getProgressSteps(transaction.status);
              const actionButtonText = getActionButton(transaction.status);
              
              return (
                <div
                  key={transaction.inventoryId}
                  className="bg-blue-50 rounded-lg border border-blue-200 p-6 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Đơn hàng #{transaction.inventoryId}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        lúc {formatDate(transaction.orderDate)}
                      </p>
                    </div>
                    {actionButtonText && (
                      <Button
                        onClick={() => {
                          if (transaction.status === 'PENDING' || transaction.status === 'DRAFT') {
                            handleAcceptTransaction(transaction.inventoryId);
                          } else if (transaction.status === 'SHIPPING') {
                            handleConfirmDelivery(transaction.inventoryId);
                          } else if (transaction.status === 'DELIVERED') {
                            handleConfirmPayment(transaction.inventoryId);
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {actionButtonText}
                      </Button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="relative pt-4">
                    <div className="flex items-center justify-between relative">
                      {/* Progress Line */}
                      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{
                            width: `${(progressSteps.filter((s) => s.completed).length / progressSteps.length) * 100}%`,
                          }}
                        />
                      </div>
                      
                      {/* Steps */}
                      {progressSteps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                          <div key={step.key} className="flex-1 flex flex-col items-center relative z-10">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                step.completed
                                  ? step.active
                                    ? 'bg-yellow-400 border-yellow-500 text-yellow-700'
                                    : 'bg-blue-500 border-blue-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-400'
                              }`}
                            >
                              <Icon size={20} />
                            </div>
                            <p
                              className={`text-xs mt-2 text-center max-w-[80px] ${
                                step.completed ? 'text-gray-700 font-medium' : 'text-gray-400'
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-200">
                    <div>
                      <p className="text-sm text-gray-500">Model • Màu</p>
                      <p className="text-base font-medium text-gray-900 mt-1">
                        {transaction.modelName || 'N/A'} - {transaction.colorName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Số lượng</p>
                      <p className="text-base font-medium text-gray-900 mt-1">
                        {transaction.importQuantity || 0} xe
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tổng giá</p>
                      <p className="text-base font-medium text-gray-900 mt-1">
                        {formatCurrency(transaction.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination */}
          {paginatedTransactions.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600">
                Hiển thị {startIndex + 1} đến {Math.min(endIndex, filteredTransactions.length)} trong{' '}
                {filteredTransactions.length} kết quả
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
                {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                {totalPages > 3 && <span className="px-2">...</span>}
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
        </div>
      </div>

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
                <label className="text-sm font-medium text-gray-500">Tên đại lý</label>
                <p className="text-base text-gray-900">{transactionDetail.data.storeName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Model</label>
                <p className="text-base text-gray-900">{transactionDetail.data.modelName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Màu</label>
                <p className="text-base text-gray-900">{transactionDetail.data.colorName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số lượng</label>
                <p className="text-base text-gray-900">{transactionDetail.data.importQuantity || 0} xe</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Giá đơn vị</label>
                <p className="text-base text-gray-900">{formatCurrency(transactionDetail.data.unitBasePrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tổng giá gốc</label>
                <p className="text-base text-gray-900">{formatCurrency(transactionDetail.data.totalBasePrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Giảm giá (%)</label>
                <p className="text-base text-gray-900">{transactionDetail.data.discountPercentage || 0}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số tiền giảm</label>
                <p className="text-base text-gray-900">{formatCurrency(transactionDetail.data.discountAmount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tổng giá trị</label>
                <p className="text-base font-semibold text-blue-600">{formatCurrency(transactionDetail.data.totalPrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày đặt</label>
                <p className="text-base text-gray-900">{formatDate(transactionDetail.data.orderDate)}</p>
              </div>
              {transactionDetail.data.deliveryDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày giao</label>
                  <p className="text-base text-gray-900">{formatDate(transactionDetail.data.deliveryDate)}</p>
                </div>
              )}
              {transactionDetail.data.imageUrl && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Hình ảnh biên lai</label>
                  <div className="mt-2">
                    <img
                      src={transactionDetail.data.imageUrl}
                      alt="Biên lai"
                      className="max-w-full h-auto rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">Không tìm thấy thông tin chi tiết</div>
        )}
      </Modal>
    </EVMStaffLayout>
  );
};

export default DealerOrdersPage;

