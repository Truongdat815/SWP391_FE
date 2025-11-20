import { useState, useMemo } from 'react';
import {
  Clock,
  CreditCard,
  CheckCircle2,
  Truck,
  Package,
  RefreshCw,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
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
  const [itemsPerPage] = useState(10);
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

  const isStoreNotFoundError = (err) => {
    return (
      err?.status === 404 &&
      (err?.data?.message?.includes('Không tìm thấy store') ||
        err?.data?.message?.includes('Not found') ||
        err?.data?.message?.includes('store'))
    );
  };

  const transactions = isStoreNotFoundError(error) ? [] : (transactionsData?.data || []);
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
        transaction.inventoryId?.toString().includes(searchTerm) ||
        transaction.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.modelName?.toLowerCase().includes(searchTerm.toLowerCase());

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
      return matchesSearch && matchesStatus && matchesDealer;
    });

    return filtered.sort((a, b) => {
      const dateA = new Date(a.orderDate || a.createdAt || 0);
      const dateB = new Date(b.orderDate || b.createdAt || 0);
      return dateB - dateA;
    });
  }, [transactions, searchTerm, statusFilter, dealerFilter]);

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

  const getActionButton = (status) => {
    if (status === 'PENDING' || status === 'DRAFT') return 'Chấp nhận';
    if (status === 'ACCEPTED' || status === 'CONFIRMED') return 'Xác nhận thanh toán';
    if (status === 'PROCESSING') return 'Bắt đầu vận chuyển';
    if (status === 'SHIPPING') return 'Xác nhận giao';
    if (status === 'DELIVERED' || status === 'COMPLETED') return 'Đã giao';
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
      return date.toLocaleDateString('vi-VN');
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
                className="p-12 text-center"
              >
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">Không có đơn hàng</p>
                <p className="text-sm text-gray-400 mt-2">
                  Các đơn hàng sẽ hiển thị tại đây
                </p>
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
                      const actionButtonText = getActionButton(transaction.status);

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
                              {transaction.importQuantity || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-600">
                              {formatDate(transaction.orderDate)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(transaction.totalPrice)}
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
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (transaction.status === 'PENDING' || transaction.status === 'DRAFT') {
                                      handleAcceptTransaction(transaction.inventoryId);
                                    } else if (transaction.status === 'ACCEPTED' || transaction.status === 'CONFIRMED') {
                                      handleConfirmPayment(transaction.inventoryId);
                                    } else if (transaction.status === 'PROCESSING') {
                                      handleStartShipping(transaction.inventoryId);
                                    } else if (transaction.status === 'SHIPPING') {
                                      handleConfirmDelivery(transaction.inventoryId);
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                                >
                                  {actionButtonText}
                                </Button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedTransactionId(transaction.inventoryId);
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              {totalPages > 5 && <span className="px-2">...</span>}
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
                <p className="text-base text-gray-900">{transactionDetail.data.importQuantity || 0} xe</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Tổng giá</label>
                <p className="text-base font-semibold text-gray-900">{formatCurrency(transactionDetail.data.totalPrice)}</p>
              </div>
            </div>
            {transactionDetail.data.receiptImage && (
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Biên lai thanh toán</label>
                <img
                  src={transactionDetail.data.receiptImage}
                  alt="Receipt"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
        )}
      </Modal>
    </EVMStaffLayout>
  );
};

export default DealerOrdersPage;
