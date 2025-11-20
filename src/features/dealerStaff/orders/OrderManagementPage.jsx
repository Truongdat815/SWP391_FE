import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Eye, Edit, MoreVertical, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useGetAllOrdersQuery } from '../../../api/dealerStaff/orderApi';

const OrderManagementPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'details', 'create'
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: ordersData, isLoading, error } = useGetAllOrdersQuery();

  const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING' || o.status === 'DRAFT').length,
      confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
      completed: orders.filter(o => o.status === 'DELIVERED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    };
  }, [orders]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((order) => {
      const matchesSearch =
        order.orderId?.toString().includes(searchTerm) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { variant: 'warning', label: 'PENDING', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' },
      CONFIRMED: { variant: 'info', label: 'CONFIRMED', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
      DELIVERED: { variant: 'success', label: 'COMPLETED', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' },
      CANCELLED: { variant: 'error', label: 'CANCELLED', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' },
      DRAFT: { variant: 'default', label: 'DRAFT', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A', color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
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
    <DealerStaffLayout>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h1 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight">
              Quản lý Đơn hàng
            </h1>
            <button 
              onClick={() => navigate('/dealer-staff/orders/create')}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-5 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors"
            >
              <Plus size={20} />
              <span className="truncate">Tạo đơn hàng mới</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white border border-slate-200">
              <p className="text-gray-500 text-sm font-medium">Tổng đơn</p>
              <p className="text-slate-900 text-3xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white border border-slate-200">
              <p className="text-gray-500 text-sm font-medium">Đang chờ</p>
              <p className="text-gray-500 text-3xl font-bold">{stats.pending}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white border border-slate-200">
              <p className="text-gray-500 text-sm font-medium">Đã xác nhận</p>
              <p className="text-blue-500 text-3xl font-bold">{stats.confirmed}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white border border-slate-200">
              <p className="text-gray-500 text-sm font-medium">Hoàn thành</p>
              <p className="text-green-500 text-3xl font-bold">{stats.completed}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl p-5 bg-white border border-slate-200">
              <p className="text-gray-500 text-sm font-medium">Đã hủy</p>
              <p className="text-red-500 text-3xl font-bold">{stats.cancelled}</p>
            </div>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex px-6 gap-8">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`flex items-center justify-center border-b-2 ${
                    activeTab === 'all'
                      ? 'border-b-primary text-primary'
                      : 'border-b-transparent text-gray-500 hover:text-slate-900'
                  } pb-3 pt-4`}
                >
                  <p className={`text-sm ${activeTab === 'all' ? 'font-bold' : 'font-medium'}`}>
                    Tất cả đơn hàng
                  </p>
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex items-center justify-center border-b-2 ${
                    activeTab === 'details'
                      ? 'border-b-primary text-primary'
                      : 'border-b-transparent text-gray-500 hover:text-slate-900'
                  } pb-3 pt-4`}
                >
                  <p className={`text-sm ${activeTab === 'details' ? 'font-bold' : 'font-medium'}`}>
                    Chi tiết đơn hàng
                  </p>
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex items-center justify-center border-b-2 ${
                    activeTab === 'create'
                      ? 'border-b-primary text-primary'
                      : 'border-b-transparent text-gray-500 hover:text-slate-900'
                  } pb-3 pt-4`}
                >
                  <p className={`text-sm ${activeTab === 'create' ? 'font-bold' : 'font-medium'}`}>
                    Tạo đơn hàng mới
                  </p>
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-4 px-6 py-4">
              <div className="relative w-full max-w-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search size={20} className="text-gray-400" />
                </div>
                <input
                  className="block w-full rounded-lg border-slate-300 bg-slate-50 py-2.5 pl-10 text-sm focus:border-primary focus:ring-primary"
                  placeholder="Tìm theo mã đơn, tên khách hàng..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="rounded-lg border-slate-300 bg-slate-50 py-2.5 text-sm focus:border-primary focus:ring-primary"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Trạng thái: Tất cả</option>
                  <option value="DRAFT">Draft</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="DELIVERED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-100">
                  <Calendar size={16} />
                  <span>Ngày tạo</span>
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-100">
                  <Filter size={16} />
                  <span>Lọc</span>
                </button>
              </div>
            </div>

            {/* Data Table */}
            {paginatedOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-6 py-3" scope="col">Mã Đơn Hàng</th>
                        <th className="px-6 py-3" scope="col">Tên Khách Hàng</th>
                        <th className="px-6 py-3" scope="col">Tên Xe</th>
                        <th className="px-6 py-3" scope="col">Ngày Tạo</th>
                        <th className="px-6 py-3" scope="col">Trạng Thái</th>
                        <th className="px-6 py-3" scope="col">Tổng Tiền</th>
                        <th className="px-6 py-3" scope="col">Nhân Viên</th>
                        <th className="px-6 py-3" scope="col"><span className="sr-only">Hành động</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order) => (
                        <tr key={order.orderId} className="border-b border-slate-200 hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold text-primary">#{order.orderId || `ELEC-${order.orderId}`}</td>
                          <td className="px-6 py-4 font-medium">{order.customerName || 'N/A'}</td>
                          <td className="px-6 py-4">{order.modelName || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-500">{formatDate(order.createdAt || order.orderDate)}</td>
                          <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                          <td className="px-6 py-4">{formatCurrency(order.totalAmount || order.totalPrice)}</td>
                          <td className="px-6 py-4">{order.staffName || 'N/A'}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-gray-500 hover:text-slate-900">
                              <MoreVertical size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                  <span className="text-sm text-gray-500">
                    Hiển thị <span className="font-semibold text-slate-900">{startIndex + 1}-{Math.min(endIndex, filteredOrders.length)}</span> trên <span className="font-semibold text-slate-900">{filteredOrders.length}</span>
                  </span>
                  <div className="inline-flex items-center gap-2">
                    <button
                      className="rounded-lg border border-slate-300 p-2 text-sm hover:bg-gray-100 disabled:opacity-50"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      className="rounded-lg border border-slate-300 p-2 text-sm hover:bg-gray-100"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DealerStaffLayout>
  );
};

export default OrderManagementPage;
