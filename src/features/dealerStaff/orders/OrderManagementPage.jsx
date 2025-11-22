import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, FileText, ShoppingBag, CheckCircle, Package, DollarSign, List, Grid, ChevronDown, Eye, Truck, Filter, RefreshCw, XCircle, Edit } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { useToast } from '../../../components/ui/Toast';
import MetricCard from '../../../components/shared/MetricCard';
import { useGetAllOrdersQuery, useGetOrderByIdQuery, useDeleteOrderMutation, useConfirmOrderMutation, useDeliverOrderMutation } from '../../../api/dealerStaff/orderApi';
import { useCreateContractMutation, useGetContractDetailQuery, useGetAllContractsQuery } from '../../../api/dealerStaff/contractApi';
import { getAuthFromStorage, getRoleFromPath } from '../../../utils/roleUtils';
import { formatCurrency, formatDate, getOrderStatusConfig, isPaymentRequired } from '../../../utils/formatters';
import OrderDetailsExpanded from './OrderDetailsExpanded';
import OrderCard from './OrderCard';

const OrderManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isConfirmOrderModalOpen, setIsConfirmOrderModalOpen] = useState(false);
  const [isConfirmContractModalOpen, setIsConfirmContractModalOpen] = useState(false);
  const [isConfirmDeliverModalOpen, setIsConfirmDeliverModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

  const { data: ordersData, isLoading, error, refetch } = useGetAllOrdersQuery();
  const { data: contractsData } = useGetAllContractsQuery();
  const [deleteOrder, { isLoading: isDeletingOrder }] = useDeleteOrderMutation();
  const [confirmOrder, { isLoading: isConfirmingOrder }] = useConfirmOrderMutation();
  const [deliverOrder, { isLoading: isDeliveringOrder }] = useDeliverOrderMutation();
  const [createContract, { isLoading: isCreatingContract }] = useCreateContractMutation();
  
  // Get order detail when viewing
  const { data: orderDetailData, isLoading: isLoadingOrderDetail } = useGetOrderByIdQuery(selectedOrder?.orderId, {
    skip: !selectedOrder?.orderId || !isViewModalOpen,
  });

  // Get contract detail when modal is open
  const { data: contractDetailData } = useGetContractDetailQuery(selectedContractId, {
    skip: !selectedContractId || !isContractModalOpen,
  });

  // Handle navigation from contracts page
  useEffect(() => {
    if (location.state?.openOrderDetail && location.state?.orderId && ordersData?.data) {
      const targetOrder = ordersData.data.find(order => order.orderId === location.state.orderId);
      if (targetOrder) {
        setSelectedOrder(targetOrder);
        setIsViewModalOpen(true);
        // Clear the navigation state to prevent reopening on re-renders
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, ordersData?.data, navigate, location.pathname]);


  const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];
  const contracts = Array.isArray(contractsData?.data) ? contractsData.data : [];

  // Helper function to check if contract has been uploaded
  const hasUploadedContract = (contract) => {
    if (!contract) return false;
    const signedContractFileUrl = contract?.contractFileUrl || contract?.signedContractFileUrl;
    return signedContractFileUrl && 
           typeof signedContractFileUrl === 'string' && 
           signedContractFileUrl.trim().length > 0;
  };

  // Helper function to get effective order status considering contract
  const getEffectiveOrderStatus = (order) => {
    // If order already has FULLY_PAID status, return it
    if (order.status === 'FULLY_PAID' || order.status === 'DELIVERED') {
      return order.status;
    }

    // Check if order has a contract with totalPayment = 0 AND contract has been uploaded
    if (order.contractId) {
      const contract = contracts.find(c => c.contractId === order.contractId);
      if (contract && !isPaymentRequired(contract.totalPayment) && hasUploadedContract(contract)) {
        // Contract has totalPayment <= 5 AND has been uploaded, consider as FULLY_PAID
        return 'FULLY_PAID';
      }
    }

    return order.status;
  };

  // Calculate stats
  const stats = useMemo(() => {
    // Only count revenue from orders with specific statuses
    const revenueStatuses = ['DEPOSITED', 'FULLY_PAID', 'DELIVERED'];
    const revenue = orders
      .filter(o => revenueStatuses.includes(o.status))
      .reduce((sum, o) => sum + (o.totalPayment || 0), 0);

    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING' || o.status === 'DRAFT').length,
      confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
      completed: orders.filter(o => o.status === 'FULLY_PAID').length,
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length,
      revenue: revenue,
    };
  }, [orders]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];

    let filtered = orders.filter((order) => {
      const matchesSearch =
        order.orderId?.toString().includes(searchTerm) ||
        order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      const matchesContract = contractFilter === 'all' ||
        (contractFilter === 'with_contract' && order.contractId) ||
        (contractFilter === 'no_contract' && !order.contractId);

      return matchesSearch && matchesStatus && matchesContract;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.orderDate) - new Date(a.orderDate);
        case 'date_asc':
          return new Date(a.orderDate) - new Date(b.orderDate);
        case 'amount_desc':
          return (b.totalPayment || 0) - (a.totalPayment || 0);
        case 'amount_asc':
          return (a.totalPayment || 0) - (b.totalPayment || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, contractFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusBadge = (status, order) => {
    // Use effective status instead of raw status
    const effectiveStatus = getEffectiveOrderStatus(order);
    const config = getOrderStatusConfig(effectiveStatus);
    const isDraft = status === 'DRAFT';

    if (isDraft) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleConfirmOrderFromStatus(order);
          }}
          disabled={isConfirmingOrder}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color} hover:opacity-80 cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
          title="Click để xác nhận đơn hàng"
        >
          {config.label}
        </button>
      );
    }

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleConfirmOrderFromStatus = (order) => {
    if (order.status !== 'DRAFT') {
      toast.error('Chỉ có thể xác nhận đơn hàng ở trạng thái nháp');
      return;
    }
    
    setSelectedOrder(order);
    setIsConfirmOrderModalOpen(true);
  };

  const handleConfirmOrderConfirmed = async () => {
    if (!selectedOrder) return;

    try {
      await confirmOrder(selectedOrder.orderId).unwrap();
      toast.success('Đã xác nhận đơn hàng thành công!');
      setIsConfirmOrderModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error confirming order:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi xác nhận đơn hàng');
    }
  };

  const handleDeliverOrder = (order) => {
    setSelectedOrder(order);
    setIsConfirmDeliverModalOpen(true);
  };

  const handleDeliverOrderConfirmed = async () => {
    if (!selectedOrder) return;

    try {
      // Backend automatically updates order status to FULLY_PAID when contract with totalPayment = 0 is uploaded
      // So we can directly deliver the order
      await deliverOrder(selectedOrder.orderId).unwrap();
      toast.success('Đã giao hàng thành công!');
      setIsConfirmDeliverModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error delivering order:', error);
      const errorMessage = error?.data?.message || error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái giao hàng';
      
      // If error mentions payment, provide more helpful message
      if (errorMessage.includes('thanh toán') || errorMessage.includes('payment')) {
        toast.error('Vui lòng đảm bảo đơn hàng đã được thanh toán đầy đủ trước khi giao hàng');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleCreateContract = async (order) => {
    try {
      const response = await createContract({ orderId: order.orderId }).unwrap();
      const contractData = response?.data || response;

      // Điều hướng đến trang quản lý hợp đồng với highlight
      const contractId = contractData?.contractId || contractData?.id;
      navigate('/dealer-staff/contracts', {
        state: {
          highlightContractId: contractId,
          newContract: true
        }
      });
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo hợp đồng');
    }
  };

  const handleContractClick = (order) => {
    if (!order.contractId || order.contractId <= 0) {
      // Chưa có hợp đồng - hiển thị modal xác nhận
      if (canCreateContract(order)) {
        setSelectedOrder(order);
        setIsConfirmContractModalOpen(true);
      } else {
        toast.error('Đơn hàng chưa được xác nhận, không thể tạo hợp đồng');
      }
    } else {
      // Đã có hợp đồng - kiểm tra xem có fileUrl không
      const contract = contracts.find(c => c.contractId === order.contractId);
      if (contract) {
        const signedContractFileUrl = contract?.contractFileUrl || contract?.signedContractFileUrl;
        // Nếu hợp đồng đã được upload, mở fileUrl trực tiếp
        if (signedContractFileUrl && 
            typeof signedContractFileUrl === 'string' && 
            signedContractFileUrl.trim().length > 0) {
          window.open(signedContractFileUrl, '_blank');
          return;
        }
      }
      // Nếu chưa có fileUrl, mở trang view contract
      const url = `/dealer-staff/contracts/${order.contractId}/view`;
      window.open(url, '_blank');
    }
  };

  const handleCreateContractConfirmed = async () => {
    if (!selectedOrder) return;

    try {
      const response = await createContract({ orderId: selectedOrder.orderId }).unwrap();
      const contractData = response?.data || response;

      setIsConfirmContractModalOpen(false);
      setSelectedOrder(null);

      // Điều hướng đến trang quản lý hợp đồng với highlight
      const contractId = contractData?.contractId || contractData?.id;
      navigate('/dealer-staff/contracts', {
        state: {
          highlightContractId: contractId,
          newContract: true
        }
      });
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo hợp đồng');
    }
  };

  const handleViewContract = async (contractId) => {
    try {
      // First, get contract detail to check if it has signed contract
      const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
      const apiUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

      // Get auth token
      const currentPath = window.location.pathname;
      const roleFromPath = getRoleFromPath(currentPath);
      let token = null;

      if (roleFromPath) {
        const authData = getAuthFromStorage(roleFromPath);
        token = authData?.token;
      }

      // Get contract detail
      const detailResponse = await fetch(`${apiUrl}/contracts/detail/${contractId}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (detailResponse.ok) {
        const detailData = await detailResponse.json();
        const contractDetail = detailData?.data || detailData;

        // Check both contractFileUrl and signedContractFileUrl for compatibility
        const signedContractFileUrl = contractDetail?.contractFileUrl || contractDetail?.signedContractFileUrl;
        const hasSignedContract = signedContractFileUrl &&
          typeof signedContractFileUrl === 'string' &&
          signedContractFileUrl.trim().length > 0;

        // If contract has signed file, open image in new tab
        if (hasSignedContract) {
          window.open(signedContractFileUrl, '_blank');
          return;
        }
      }

      // If no signed contract, fetch HTML and open in new tab
      const response = await fetch(`${apiUrl}/contracts/${contractId}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contract');
      }

      const htmlContent = await response.text();

      // Create blob URL and open in new tab
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');

      // Clean up blob URL after window opens
      if (newWindow) {
        newWindow.onload = () => {
          setTimeout(() => URL.revokeObjectURL(url), 100);
        };
      } else {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast.error('Không thể tải hợp đồng');
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      await deleteOrder(selectedOrder.orderId).unwrap();
      toast.success('Đã xóa đơn hàng thành công!');
      setIsDeleteModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi xóa đơn hàng');
    }
  };


  const handleOpenViewModal = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleEditOrder = (order) => {
    navigate(`/dealer-staff/orders/create`, { state: { orderId: order.orderId } });
  };

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateQuote = (order) => {
    // Navigate to CreateOrderPage step 2 with existing order data
    navigate('/dealer-staff/orders/create', { 
      state: { 
        editMode: true,
        orderId: order.orderId,
        orderData: order,
        startStep: 2
      } 
    });
  };


  const canUpdateQuote = (order) => {
    return order.status === 'DRAFT' || order.status === 'CONFIRMED';
  };

  const canCreateContract = (order) => {
    return order.status === 'CONFIRMED' || order.status === 'APPROVED';
  };

  if (isLoading) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </DealerStaffLayout>
    );
  }

  if (error) {
    return (
      <DealerStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Có lỗi xảy ra khi tải dữ liệu.</div>
        </div>
      </DealerStaffLayout>
    );
  }

  return (
    <DealerStaffLayout
      title="Quản lý Đơn hàng"
      description="Theo dõi và xử lý các đơn đặt hàng xe."
    >
      <div className="mx-auto max-w-[90rem] px-0 py-4 pl-10 pr-10 pt-8 space-y-4">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard
            title="Tổng đơn"
            value={stats.total}
            icon={ShoppingBag}
            className="border-l-4 border-l-blue-500 compact"
            compact
          />
          <MetricCard
            title="Đã xác nhận"
            value={stats.confirmed}
            icon={CheckCircle}
            className="border-l-4 border-l-blue-600 compact"
            compact
          />
          <MetricCard
            title="Đã thanh toán"
            value={stats.completed + stats.delivered}
            icon={Package}
            className="border-l-4 border-l-green-500 compact"
            compact
          />
          <MetricCard
            title="Đã giao hàng"
            value={stats.delivered}
            icon={Truck}
            className="border-l-4 border-l-green-600 compact"
            compact
          />
          <MetricCard
            title="Doanh thu"
            value={formatCurrency(stats.revenue)}
            className="border-l-4 border-l-purple-500 compact"
            compact
          />
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row gap-4 justify-between items-center">
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                placeholder="Tìm mã đơn, khách hàng, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap justify-end">
              {/* Status Filter */}
              <div className="relative">
                <select
                  className="pl-3 pr-8 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white appearance-none cursor-pointer text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="DRAFT">Nháp</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="CONTRACT_PENDING">Hợp đồng</option>
                  <option value="CONTRACT_SIGNED">Đã ký</option>
                  <option value="FULLY_PAID">Đã thanh toán đủ</option>
                  <option value="DELIVERED">Đã giao</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              {/* Contract Filter */}
              <div className="relative">
                <select
                  className="pl-3 pr-8 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white appearance-none cursor-pointer text-sm"
                  value={contractFilter}
                  onChange={(e) => setContractFilter(e.target.value)}
                >
                  <option value="all">Hợp đồng: Tất cả</option>
                  <option value="with_contract">Có hợp đồng</option>
                  <option value="no_contract">Chưa có hợp đồng</option>
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  className="pl-3 pr-8 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white appearance-none cursor-pointer text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date_desc">Mới nhất</option>
                  <option value="date_asc">Cũ nhất</option>
                  <option value="amount_desc">Giá cao nhất</option>
                  <option value="amount_asc">Giá thấp nhất</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2.5 transition-colors ${viewMode === 'table'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  title="Table view"
                >
                  <List size={18} />
                </button>
                <div className="w-px h-6 bg-slate-200"></div>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-2.5 transition-colors ${viewMode === 'card'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  title="Card view"
                >
                  <Grid size={18} />
                </button>
              </div>

              <Button variant="outline" onClick={() => refetch()} className="p-2.5">
                <RefreshCw size={18} />
              </Button>
            </div>
          </div>

          {/* Data Display */}
          {paginatedOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="p-4 rounded-full bg-slate-100">
                  <ShoppingBag size={32} className="text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-900">Không tìm thấy đơn hàng</p>
                <p className="text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác</p>
              </div>
            </div>
          ) : (
            <>
              {/* Table View */}
              {viewMode === 'table' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">STT</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã Đơn</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Khách Hàng</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sản Phẩm</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Tiền</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày Tạo</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng Thái</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Hợp Đồng</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th> 
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {paginatedOrders.map((order, index) => {
                        const sttNumber = (currentPage - 1) * itemsPerPage + index + 1;
                        return (
                            <tr
                              key={order.orderId}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                <span className="text-sm font-medium text-slate-600">{sttNumber}</span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-blue-600">{order.orderCode || order.orderId}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div>
                                  <p className="font-medium text-slate-900">{order.customerName || 'N/A'}</p>
                                  <p className="text-xs text-slate-500">{order.customerPhone || ''}</p>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  {order.getOrderDetailsResponses?.map((detail, idx) => (
                                    <span key={idx} className="text-sm text-slate-700">
                                      {detail.modelName} - {detail.quantity} xe
                                    </span>
                                  )) || <span className="text-sm text-gray-400">-</span>}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-slate-900">
                                {formatCurrency(order.totalPayment || 0)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                                {formatDate(order.orderDate)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                {getStatusBadge(order.status, order)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleContractClick(order)}
                                  disabled={isCreatingContract}
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${order.contractId && order.contractId > 0
                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer'
                                    : canCreateContract(order)
                                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                  <FileText size={12} className="mr-1" />
                                  {order.contractId && order.contractId > 0 ? 'Đã có' : 'Chưa có'}
                                </button>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleOpenViewModal(order)}
                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                                    title="Xem chi tiết"
                                  >
                                    <Eye size={18} />
                                  </button>
                                  {/* Update Quote Button - Only for DRAFT orders */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (order.status === 'DRAFT') {
                                        handleUpdateQuote(order);
                                      }
                                    }}
                                    disabled={order.status !== 'DRAFT'}
                                    className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                                      order.status === 'DRAFT'
                                        ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                                        : 'text-transparent cursor-default'
                                    }`}
                                    title={order.status === 'DRAFT' ? 'Chỉnh sửa đơn hàng' : ''}
                                  >
                                    <Edit size={18} />
                                  </button>
                                  {/* Delete Button - Only for DRAFT orders */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (order.status === 'DRAFT') {
                                        handleDeleteClick(order);
                                      }
                                    }}
                                    disabled={order.status !== 'DRAFT'}
                                    className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                                      order.status === 'DRAFT'
                                        ? 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                        : 'text-transparent cursor-default'
                                    }`}
                                    title={order.status === 'DRAFT' ? 'Xóa đơn hàng' : ''}
                                  >
                                    <XCircle size={18} />
                                  </button>
                                  {/* Deliver Button - Always render but conditionally visible */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const effectiveStatus = getEffectiveOrderStatus(order);
                                      if (effectiveStatus === 'FULLY_PAID') {
                                        handleDeliverOrder(order);
                                      }
                                    }}
                                    disabled={isDeliveringOrder || getEffectiveOrderStatus(order) !== 'FULLY_PAID'}
                                    className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                                      getEffectiveOrderStatus(order) === 'FULLY_PAID'
                                        ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                        : 'text-transparent cursor-default'
                                    }`}
                                    title={getEffectiveOrderStatus(order) === 'FULLY_PAID' ? 'Giao hàng' : ''}
                                  >
                                    <Truck size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Card View */}
              {viewMode === 'card' && (
                <div className="px-3 py-6 bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedOrders.map((order) => (
                      <OrderCard
                        key={order.orderId}
                        order={order}
                        contracts={contracts}
                        onView={handleOpenViewModal}
                        onCreateContract={handleCreateContract}
                        onViewContract={handleViewContract}
                        onDeliverOrder={handleDeliverOrder}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="text-sm text-slate-500">
              
                  
                  <span className="font-medium text-slate-900">{filteredOrders.length}</span> đơn hàng
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="flex items-center px-3 text-sm font-medium text-slate-700">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Order Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Chi tiết đơn hàng"
        size="lg"
      >
        {isLoadingOrderDetail ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <div className="text-slate-500 text-lg">Đang tải chi tiết đơn hàng...</div>
            </div>
          </div>
        ) : orderDetailData?.data ? (
          <div className="max-h-[85vh] overflow-y-auto">
            <OrderDetailsExpanded order={orderDetailData.data} onViewContract={handleViewContract} />
          </div>
        ) : selectedOrder ? (
          <div className="max-h-[85vh] overflow-y-auto">
            <OrderDetailsExpanded order={selectedOrder} onViewContract={handleViewContract} />
          </div>
        ) : null}
      </Modal>

      {/* Contract Modal - Show signed image or message */}
      <Modal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false);
          setSelectedContractId(null);
        }}
        title="Hợp đồng"
        size="lg"
      >
        <div className="space-y-4">
          {(() => {
            const contractDetail = contractDetailData?.data || contractDetailData;
            const signedContractFileUrl = contractDetail?.contractFileUrl || contractDetail?.signedContractFileUrl;
            const hasSignedContract = signedContractFileUrl &&
              typeof signedContractFileUrl === 'string' &&
              signedContractFileUrl.trim().length > 0;

            return hasSignedContract ? (
              <>
                <p className="text-sm text-slate-600">Hợp đồng đã được ký:</p>
                <div className="flex justify-center">
                  <img
                    src={signedContractFileUrl}
                    alt="Hợp đồng đã ký"
                    className="max-w-full h-auto rounded-lg border border-slate-200"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <FileText size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 text-lg font-medium">Hợp đồng chưa được ký</p>
                <p className="text-slate-500 text-sm">Vui lòng kiểm tra lại sau hoặc liên hệ khách hàng</p>
              </div>
            );
          })()}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsContractModalOpen(false);
                setSelectedContractId(null);
              }}
            >
              Đóng
            </Button>
            {contractDetailData?.data?.contractId && (
              <Button
                onClick={() => {
                  const url = `/dealer-staff/contracts/${contractDetailData.data.contractId}/view`;
                  window.open(url, '_blank');
                }}
              >
                Xem chi tiết hợp đồng
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedOrder(null);
        }}
        title="Xác nhận xóa đơn hàng"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg text-red-900">
            <XCircle className="flex-shrink-0 text-red-600" size={24} />
            <div>
              <h4 className="font-semibold">Xoá đơn hàng</h4>
              <p className="text-sm mt-1">
                Bạn có chắc chắn muốn xóa đơn hàng <span className="font-bold">#{selectedOrder?.orderCode || selectedOrder?.orderId}</span>?
                Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedOrder(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleDeleteOrder}
              disabled={isDeletingOrder}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingOrder ? 'Đang xóa...' : 'Xóa đơn hàng'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Order Modal */}
      <Modal
        isOpen={isConfirmOrderModalOpen}
        onClose={() => {
          setIsConfirmOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        title="Xác nhận đơn hàng"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg text-blue-900">
            <CheckCircle className="flex-shrink-0 text-blue-600" size={24} />
            <div>
              <h4 className="font-semibold">Xác nhận đơn hàng</h4>
              <p className="text-sm mt-1">
                Bạn có chắc chắn muốn xác nhận đơn hàng <span className="font-bold">#{selectedOrder?.orderCode || selectedOrder?.orderId}</span>?
                Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái "Đã xác nhận".
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmOrderModalOpen(false);
                setSelectedOrder(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmOrderConfirmed}
              disabled={isConfirmingOrder}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isConfirmingOrder ? 'Đang xác nhận...' : 'Xác nhận đơn hàng'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Create Contract Modal */}
      <Modal
        isOpen={isConfirmContractModalOpen}
        onClose={() => {
          setIsConfirmContractModalOpen(false);
          setSelectedOrder(null);
        }}
        title="Tạo hợp đồng"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg text-green-900">
            <FileText className="flex-shrink-0 text-green-600" size={24} />
            <div>
              <h4 className="font-semibold">Tạo hợp đồng</h4>
              <p className="text-sm mt-1">
                Bạn có chắc chắn muốn tạo hợp đồng cho đơn hàng <span className="font-bold">#{selectedOrder?.orderCode || selectedOrder?.orderId}</span>?
                Hợp đồng sẽ được tạo và bạn có thể quản lý trong trang Hợp đồng.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmContractModalOpen(false);
                setSelectedOrder(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateContractConfirmed}
              disabled={isCreatingContract}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCreatingContract ? 'Đang tạo...' : 'Tạo hợp đồng'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Deliver Order Modal */}
      <Modal
        isOpen={isConfirmDeliverModalOpen}
        onClose={() => {
          setIsConfirmDeliverModalOpen(false);
          setSelectedOrder(null);
        }}
        title="Xác nhận giao hàng"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg text-green-900">
            <Truck className="flex-shrink-0 text-green-600" size={24} />
            <div>
              <h4 className="font-semibold">Giao hàng</h4>
              <p className="text-sm mt-1">
                Bạn có chắc chắn muốn đánh dấu đơn hàng <span className="font-bold">#{selectedOrder?.orderCode || selectedOrder?.orderId}</span> là đã giao hàng?
                Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái "Đã giao hàng".
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDeliverModalOpen(false);
                setSelectedOrder(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleDeliverOrderConfirmed}
              disabled={isDeliveringOrder}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isDeliveringOrder ? 'Đang xử lý...' : 'Xác nhận giao hàng'}
            </Button>
          </div>
        </div>
      </Modal>

    </DealerStaffLayout>
  );
};

export default OrderManagementPage;
