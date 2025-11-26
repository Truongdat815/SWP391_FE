import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Plus, Eye, Printer, Check, X, MoreVertical, AlertCircle } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import SearchBar from '../../../components/shared/SearchBar';
import MetricCard from '../../../components/shared/MetricCard';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Dropdown from '../../../components/ui/Dropdown';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import { TableSkeleton, CardSkeleton } from '../../../components/shared/SkeletonLoader';
import EmptyState from '../../../components/shared/EmptyState';
import Toast from '../../../components/shared/Toast';
import { useDebounce } from '../../../hooks/useDebounce';
import { useToast } from '../../../hooks/useToast';
import { useGetAllOrdersQuery, useGetMonthlyRevenueQuery, useGetOrderByIdQuery, useCreateDraftOrderMutation, useConfirmOrderMutation, useRejectOrderMutation } from '../../../api/dealerManager/dmOrderApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';
import { useGetModelColorsByModelQuery } from '../../../api/dealerStaff/vehicleApi';

const OrderManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    modelId: '',
    colorId: '',
    quantity: 1,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null });
  const { toasts, showToast, removeToast } = useToast();

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, modelFilter]);

  const { data: ordersData, isLoading, error } = useGetAllOrdersQuery();
  const { data: revenueData } = useGetMonthlyRevenueQuery();
  const { data: orderDetailData, isLoading: isLoadingOrderDetail } = useGetOrderByIdQuery(selectedOrderId, {
    skip: !selectedOrderId,
  });
  const { data: modelsData } = useGetAllModelsQuery();
  const { data: modelColorsData } = useGetModelColorsByModelQuery(selectedModelId, {
    skip: !selectedModelId,
  });
  const [createDraftOrder, { isLoading: isCreating }] = useCreateDraftOrderMutation();
  const [confirmOrder, { isLoading: isConfirming }] = useConfirmOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();

  const orders = ordersData?.data || [];
  const monthlyRevenue = revenueData?.data || [];
  const models = modelsData?.data || [];
  const modelColors = modelColorsData?.data || [];

  // Tính toán metrics
  const currentMonthRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const revenue = monthlyRevenue.find(
      (rev) => rev.month === currentMonth && rev.year === currentYear
    );
    return revenue?.totalRevenue || 0;
  }, [monthlyRevenue]);

  const pendingOrders = orders.filter(
    (order) => order.status === 'PENDING' || order.status === 'DRAFT'
  ).length;
  const totalOrdersThisMonth = orders.filter((order) => {
    const orderDate = new Date(order.createdAt || order.orderDate);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }).length;
  const deliveringCars = orders.filter((order) => order.status === 'DELIVERING').length;

  // Filter và sắp xếp orders (mới nhất ở trên) - sử dụng debounced search
  const filteredOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch =
        order.orderId?.toString().includes(debouncedSearchTerm) ||
        order.customerName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        order.staffName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesModel =
        modelFilter === 'all' || order.modelName?.toLowerCase().includes(modelFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesModel;
    });
    
    // Sắp xếp theo ngày tạo: mới nhất ở trên
    return filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.orderDate || a.createdDate || 0);
      const dateB = new Date(b.createdAt || b.orderDate || b.createdDate || 0);
      // Sắp xếp giảm dần (mới nhất trước)
      return dateB.getTime() - dateA.getTime();
    });
  }, [orders, debouncedSearchTerm, statusFilter, modelFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'Chờ duyệt' },
      CONFIRMED: { variant: 'info', label: 'Đã xác nhận' },
      DELIVERING: { variant: 'info', label: 'Đang giao' },
      DELIVERED: { variant: 'success', label: 'Hoàn thành' },
      FULLY_PAID: { variant: 'success', label: 'Đã thanh toán' },
      DEPOSIT_PAID: { variant: 'info', label: 'Đã đặt cọc' },
      CONTRACT_SIGNED: { variant: 'info', label: 'Đã ký hợp đồng' },
      CONTRACT_PENDING: { variant: 'warning', label: 'Chờ ký hợp đồng' },
      CANCELLED: { variant: 'error', label: 'Đã hủy' },
      DRAFT: { variant: 'default', label: 'Nháp' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  const formatRevenue = (amount) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} Tỷ`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} Triệu`;
    }
    return formatCurrency(amount);
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailModalOpen(true);
    setOpenMenuId(null);
  };

  const handleOpenCreateOrderModal = () => {
    setIsCreateOrderModalOpen(true);
    setFormData({
      customerName: '',
      customerPhone: '',
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

  // Real-time form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.customerName.trim()) {
      errors.customerName = 'Vui lòng nhập tên khách hàng';
    }
    if (!formData.customerPhone.trim()) {
      errors.customerPhone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
      errors.customerPhone = 'Số điện thoại không hợp lệ';
    }
    if (!formData.modelId) {
      errors.modelId = 'Vui lòng chọn model xe';
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
      showToast('Vui lòng điền đầy đủ và đúng thông tin bắt buộc', 'error');
      return;
    }

    try {
      const orderData = {
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        orderDetails: [
          {
            modelId: parseInt(formData.modelId),
            colorId: parseInt(formData.colorId),
            quantity: parseInt(formData.quantity),
          },
        ],
        notes: formData.notes || undefined,
        status: 'DRAFT',
      };

      await createDraftOrder(orderData).unwrap();
      
      showToast('Tạo đơn hàng thành công!', 'success');
      setIsCreateOrderModalOpen(false);
      setFormData({
        customerName: '',
        customerPhone: '',
        modelId: '',
        colorId: '',
        quantity: 1,
        notes: '',
      });
      setFormErrors({});
      setSelectedModelId('');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi tạo đơn hàng';
      showToast(errorMessage, 'error');
    }
  };

  const handleApproveOrder = async (orderId) => {
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn duyệt đơn hàng này?',
      onConfirm: async () => {
        try {
          await confirmOrder(orderId).unwrap();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          showToast('Đã duyệt đơn hàng thành công!', 'success');
          setOpenMenuId(null);
        } catch (error) {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi duyệt đơn hàng';
          showToast(errorMessage, 'error');
        }
      },
    });
  };

  const handleRejectOrder = async (orderId) => {
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn từ chối đơn hàng này?',
      onConfirm: async () => {
        try {
          await rejectOrder(orderId).unwrap();
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          showToast('Đã từ chối đơn hàng thành công!', 'success');
          setOpenMenuId(null);
        } catch (error) {
          setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          const errorMessage = error?.data?.message || error?.data?.error || error?.data?.errorMessage || error?.message || 'Có lỗi xảy ra khi từ chối đơn hàng';
          showToast(errorMessage, 'error');
        }
      },
    });
  };

  const handleExportReport = async () => {
    try {
      showToast('Đang xuất báo cáo...', 'info');
      
      // Dùng fetch trực tiếp vì RTK Query không hỗ trợ download file tốt
      const baseUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
      const token = localStorage.getItem('accessToken');
      
      // Build query params
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (modelFilter !== 'all') {
        params.append('model', modelFilter);
      }
      
      const queryString = params.toString();
      const url = `${baseUrl}/orders/export${queryString ? `?${queryString}` : ''}`;
      
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
      a.download = `bao-cao-don-hang-${new Date().toISOString().split('T')[0]}.xlsx`;
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

  const handlePrintOrder = (order) => {
    setOpenMenuId(null);
    // Tạo nội dung hóa đơn để in
    const printWindow = window.open('', '_blank');
    const orderDetails = order.getOrderDetailsResponses || order.orderDetails || [];
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn #${order.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            .info-row { margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; margin-top: 20px; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HÓA ĐƠN BÁN HÀNG</h1>
            <p>Mã đơn hàng: #${order.orderId}</p>
          </div>
          <div class="info">
            <div class="info-row"><strong>Khách hàng:</strong> ${order.customerName || 'N/A'}</div>
            <div class="info-row"><strong>Nhân viên:</strong> ${order.staffName || order.createdBy || 'N/A'}</div>
            <div class="info-row"><strong>Ngày tạo:</strong> ${formatDate(order.createdAt || order.orderDate)}</div>
            <div class="info-row"><strong>Trạng thái:</strong> ${getStatusBadge(order.status).props.children}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Mẫu xe</th>
                <th>Màu sắc</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${orderDetails.map(detail => `
                <tr>
                  <td>${detail.modelName || order.modelName || 'N/A'}</td>
                  <td>${detail.colorName || 'N/A'}</td>
                  <td>${detail.quantity || 1}</td>
                  <td>${formatCurrency(detail.price || detail.unitPrice || 0)}</td>
                  <td>${formatCurrency((detail.price || detail.unitPrice || 0) * (detail.quantity || 1))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Tổng cộng: ${formatCurrency(order.totalAmount || order.totalPrice || 0)}</p>
          </div>
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">In hóa đơn</button>
            <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">Đóng</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <DealerManagerLayout>
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <TableSkeleton rows={5} columns={8} />
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
            <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
            <p className="text-gray-600 mt-1">
              Xem, duyệt và theo dõi tất cả đơn hàng từ đội ngũ của bạn.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportReport}>
              <Download size={20} className="mr-2" />
              Xuất Báo Cáo
            </Button>
            <Button onClick={handleOpenCreateOrderModal}>
              <Plus size={20} className="mr-2" />
              Tạo Đơn Hàng Mới
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Tổng Doanh Thu (Tháng)"
            value={formatRevenue(currentMonthRevenue)}
          />
          <MetricCard
            title="Đơn Hàng Chờ Duyệt"
            value={pendingOrders}
          />
          <MetricCard
            title="Tổng Số Đơn Hàng (Tháng)"
            value={totalOrdersThisMonth}
          />
          <MetricCard
            title="Xe Sắp Giao"
            value={deliveringCars}
          />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm theo Mã đơn, Tên khách hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Trạng thái: Tất cả' },
                { value: 'PENDING', label: 'Chờ duyệt' },
                { value: 'CONFIRMED', label: 'Đã xác nhận' },
                { value: 'DELIVERING', label: 'Đang giao' },
                { value: 'DELIVERED', label: 'Hoàn thành' },
                { value: 'FULLY_PAID', label: 'Đã thanh toán' },
                { value: 'CONTRACT_SIGNED', label: 'Đã ký hợp đồng' },
                { value: 'CANCELLED', label: 'Đã hủy' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Mẫu xe: Tất cả' },
                ...Array.from(new Set(orders.map(o => o.modelName).filter(Boolean))).map(modelName => ({
                  value: modelName,
                  label: modelName,
                })),
              ]}
              value={modelFilter}
              onChange={setModelFilter}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {paginatedOrders.length === 0 ? (
            <EmptyState
              icon="search"
              title="Không tìm thấy đơn hàng"
              message={
                filteredOrders.length === 0
                  ? "Hiện tại không có đơn hàng nào. Hãy tạo đơn hàng mới để bắt đầu."
                  : "Không có đơn hàng nào phù hợp với bộ lọc của bạn. Hãy thử thay đổi bộ lọc."
              }
              actionLabel={filteredOrders.length === 0 ? "Tạo đơn hàng mới" : undefined}
              onAction={filteredOrders.length === 0 ? handleOpenCreateOrderModal : undefined}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>MÃ ĐƠN HÀNG</Table.Head>
                      <Table.Head>KHÁCH HÀNG</Table.Head>
                      <Table.Head>NHÂN VIÊN</Table.Head>
                      <Table.Head>MẪU XE / MÀU SẮC</Table.Head>
                      <Table.Head>NGÀY TẠO</Table.Head>
                      <Table.Head>GIÁ TRỊ</Table.Head>
                      <Table.Head>TRẠNG THÁI</Table.Head>
                      <Table.Head className="text-center">HÀNH ĐỘNG</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedOrders.map((order) => (
                      <Table.Row key={order.orderId}>
                        <Table.Cell className="font-mono">
                          #{order.orderId || `ELEC-${order.orderId}`}
                        </Table.Cell>
                        <Table.Cell>{order.customerName || 'N/A'}</Table.Cell>
                        <Table.Cell>{order.staffName || order.createdBy || 'N/A'}</Table.Cell>
                        <Table.Cell>
                          {(() => {
                            // Lấy model và color từ orderDetails nếu có
                            const orderDetails = order.getOrderDetailsResponses || order.orderDetails || order.orderDetailList || [];
                            
                            // Thử lấy từ orderDetails trước
                            if (orderDetails.length > 0) {
                              const firstDetail = orderDetails[0];
                              const modelName = firstDetail.modelName || firstDetail.vehicleModel || firstDetail.carModel || firstDetail.model?.modelName || order.modelName;
                              const colorName = firstDetail.colorName || firstDetail.vehicleColor || firstDetail.carColor || firstDetail.color?.colorName || order.colorName;
                              
                              if (modelName && colorName) {
                                return (
                                  <div className="flex flex-col">
                                    <span className="font-medium">{modelName}</span>
                                    <span className="text-sm text-gray-500">{colorName}</span>
                                  </div>
                                );
                              }
                              if (modelName) {
                                return <span>{modelName}</span>;
                              }
                              if (colorName) {
                                return <span className="text-sm text-gray-500">{colorName}</span>;
                              }
                            }
                            
                            // Thử lấy từ order object trực tiếp (nhiều tên trường khác nhau)
                            const modelName = order.modelName || order.vehicleModel || order.carModel || order.model?.modelName || order.vehicle?.modelName;
                            const colorName = order.colorName || order.vehicleColor || order.carColor || order.color?.colorName || order.vehicle?.colorName;
                            
                            if (modelName && colorName) {
                              return (
                                <div className="flex flex-col">
                                  <span className="font-medium">{modelName}</span>
                                  <span className="text-sm text-gray-500">{colorName}</span>
                                </div>
                              );
                            }
                            if (modelName) {
                              return <span>{modelName}</span>;
                            }
                            if (colorName) {
                              return <span className="text-sm text-gray-500">{colorName}</span>;
                            }
                            
                            // Thử lấy từ vehicle object nếu có
                            if (order.vehicle) {
                              const vehicleModel = order.vehicle.modelName || order.vehicle.model?.modelName;
                              const vehicleColor = order.vehicle.colorName || order.vehicle.color?.colorName;
                              if (vehicleModel && vehicleColor) {
                                return (
                                  <div className="flex flex-col">
                                    <span className="font-medium">{vehicleModel}</span>
                                    <span className="text-sm text-gray-500">{vehicleColor}</span>
                                  </div>
                                );
                              }
                              if (vehicleModel) {
                                return <span>{vehicleModel}</span>;
                              }
                            }
                            
                            // Nếu là đơn nháp và chưa có thông tin
                            if (order.status === 'DRAFT' || order.status === 'PENDING') {
                              return <span className="text-gray-400 italic">Chưa chọn xe</span>;
                            }
                            
                            // Debug log trong development để xem cấu trúc dữ liệu
                            if (import.meta.env.DEV && !modelName && !colorName) {
                              console.log('Order without vehicle info:', {
                                orderId: order.orderId,
                                status: order.status,
                                orderKeys: Object.keys(order),
                                orderDetails: orderDetails,
                              });
                            }
                            
                            return <span className="text-gray-400">N/A</span>;
                          })()}
                        </Table.Cell>
                        <Table.Cell>{formatDate(order.createdAt || order.orderDate)}</Table.Cell>
                        <Table.Cell className="font-medium">
                          {(() => {
                            // Tính tổng từ orderDetails nếu totalAmount/totalPrice không có hoặc bằng 0
                            const totalAmount = order.totalAmount || order.totalPrice;
                            if (totalAmount && totalAmount > 0) {
                              return formatCurrency(totalAmount);
                            }
                            
                            // Thử tính từ orderDetails
                            const orderDetails = order.getOrderDetailsResponses || order.orderDetails || [];
                            if (orderDetails.length > 0) {
                              const calculatedTotal = orderDetails.reduce((sum, detail) => {
                                const price = detail.price || detail.unitPrice || 0;
                                const quantity = detail.quantity || 1;
                                return sum + (price * quantity);
                              }, 0);
                              if (calculatedTotal > 0) {
                                return formatCurrency(calculatedTotal);
                              }
                            }
                            
                            // Nếu là đơn nháp và chưa có giá
                            if (order.status === 'DRAFT' || order.status === 'PENDING') {
                              return <span className="text-gray-400 italic">Chưa tính giá</span>;
                            }
                            
                            return formatCurrency(0);
                          })()}
                        </Table.Cell>
                        <Table.Cell>{getStatusBadge(order.status)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center">
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === order.orderId ? null : order.orderId)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical size={18} />
                              </button>
                              {openMenuId === order.orderId && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                    <div className="py-1">
                                      <button
                                        onClick={() => handleViewDetails(order.orderId)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Eye size={16} />
                                        Xem chi tiết
                                      </button>
                                      {order.status === 'PENDING' && (
                                        <>
                                          <button
                                            onClick={() => handleApproveOrder(order.orderId)}
                                            disabled={isConfirming}
                                            className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            <Check size={16} />
                                            {isConfirming ? 'Đang duyệt...' : 'Duyệt đơn'}
                                          </button>
                                          <button
                                            onClick={() => handleRejectOrder(order.orderId)}
                                            disabled={isRejecting}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            <X size={16} />
                                            {isRejecting ? 'Đang từ chối...' : 'Từ chối'}
                                          </button>
                                        </>
                                      )}
                                      <button
                                        onClick={() => handlePrintOrder(order)}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Printer size={16} />
                                        In hóa đơn
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredOrders.length)}</span> trong{' '}
                  <span className="font-medium">{filteredOrders.length}</span> kết quả
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
                      // Hiển thị trang đầu, cuối, và các trang xung quanh trang hiện tại
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
            </>
          )}
        </div>

        {/* Order Detail Modal */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedOrderId(null);
          }}
          title={`Chi tiết đơn hàng #${selectedOrderId}`}
          size="xl"
        >
          {isLoadingOrderDetail ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : orderDetailData?.data ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Mã đơn hàng</label>
                  <p className="text-lg font-semibold">#{orderDetailData.data.orderId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">{getStatusBadge(orderDetailData.data.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Khách hàng</label>
                  <p className="text-lg">{orderDetailData.data.customerName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nhân viên</label>
                  <p className="text-lg">{orderDetailData.data.staffName || orderDetailData.data.createdBy || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="text-lg">{formatDate(orderDetailData.data.createdAt || orderDetailData.data.orderDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tổng tiền</label>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(orderDetailData.data.totalAmount || orderDetailData.data.totalPrice)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Chi tiết sản phẩm</label>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Mẫu xe</Table.Head>
                        <Table.Head>Màu sắc</Table.Head>
                        <Table.Head>Số lượng</Table.Head>
                        <Table.Head>Đơn giá</Table.Head>
                        <Table.Head>Thành tiền</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {(orderDetailData.data.getOrderDetailsResponses || orderDetailData.data.orderDetails || []).map((detail, index) => (
                        <Table.Row key={index}>
                          <Table.Cell>{detail.modelName || orderDetailData.data.modelName || 'N/A'}</Table.Cell>
                          <Table.Cell>{detail.colorName || 'N/A'}</Table.Cell>
                          <Table.Cell>{detail.quantity || 1}</Table.Cell>
                          <Table.Cell>{formatCurrency(detail.price || detail.unitPrice || 0)}</Table.Cell>
                          <Table.Cell className="font-medium">
                            {formatCurrency((detail.price || detail.unitPrice || 0) * (detail.quantity || 1))}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handlePrintOrder(orderDetailData.data)}
                  className="flex-1"
                >
                  <Printer size={18} className="mr-2" />
                  In hóa đơn
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    setSelectedOrderId(null);
                  }}
                  className="flex-1"
                >
                  Đóng
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">Không tìm thấy thông tin đơn hàng</div>
            </div>
          )}
        </Modal>

        {/* Create Order Modal */}
        <Modal
          isOpen={isCreateOrderModalOpen}
          onClose={() => {
            setIsCreateOrderModalOpen(false);
            setFormData({
              customerName: '',
              customerPhone: '',
              modelId: '',
              colorId: '',
              quantity: 1,
              notes: '',
            });
            setSelectedModelId('');
          }}
          title="Tạo Đơn Hàng Mới"
          size="lg"
        >
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Tên khách hàng *"
                  value={formData.customerName}
                  onChange={(e) => {
                    setFormData({ ...formData, customerName: e.target.value });
                    if (formErrors.customerName) {
                      setFormErrors({ ...formErrors, customerName: '' });
                    }
                  }}
                  required
                />
                {formErrors.customerName && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.customerName}</p>
                )}
              </div>
              <div>
                <Input
                  label="Số điện thoại *"
                  value={formData.customerPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, customerPhone: value });
                    if (formErrors.customerPhone) {
                      setFormErrors({ ...formErrors, customerPhone: '' });
                    }
                  }}
                  required
                />
                {formErrors.customerPhone && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.customerPhone}</p>
                )}
              </div>
            </div>

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
                  setIsCreateOrderModalOpen(false);
                  setFormData({
                    customerName: '',
                    customerPhone: '',
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
                disabled={isCreating || !formData.customerName || !formData.customerPhone || !formData.modelId || !formData.colorId}
              >
                {isCreating ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Đang tạo...
                  </>
                ) : (
                  'Tạo đơn hàng'
                )}
              </Button>
            </div>
          </form>
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

export default OrderManagementPage;

