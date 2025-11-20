import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Calendar, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useGetAllPaymentsQuery } from '../../../api/dealerStaff/paymentApi';

const PaymentManagementPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const { data: paymentsData, isLoading, error } = useGetAllPaymentsQuery();

  const payments = Array.isArray(paymentsData?.data) ? paymentsData.data : [];

  // Filter payments
  const filteredPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    return payments.filter((payment) => {
      const matchesSearch =
        payment.paymentId?.toString().includes(searchTerm) ||
        payment.contractId?.toString().includes(searchTerm) ||
        payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      COMPLETED: { color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300', label: 'COMPLETED' },
      CONFIRMED: { color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300', label: 'CONFIRMED' },
      PENDING: { color: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300', label: 'PENDING' },
      FAILED: { color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300', label: 'FAILED' },
    };
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status || 'N/A' };
    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VND';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
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
        <div className="mx-auto max-w-7xl">
          {/* PageHeading */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-72 flex-col gap-2">
              <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">
                Quản lý Thanh toán
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                View, create, and manage all payment transactions.
              </p>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2">
              <Plus size={16} />
              <span className="truncate">Tạo Thanh toán</span>
            </button>
          </div>

          {/* Toolbar and Filters */}
          <div className="mt-8 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={20} />
                  </span>
                  <input
                    className="w-full h-10 pl-10 pr-4 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-primary focus:border-primary"
                    placeholder="Search by Contract ID, Customer Name..."
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 text-sm font-medium leading-normal text-slate-900 dark:text-slate-300">
                  <span>All Statuses</span>
                  <span className="text-base">▼</span>
                </button>
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-4 text-sm font-medium leading-normal text-slate-900 dark:text-slate-300">
                  <span>Date Range</span>
                  <span className="text-base">▼</span>
                </button>
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-transparent text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-3">
                  <RefreshCw size={20} />
                  <span className="truncate">Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-6">
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
              {paginatedPayments.length === 0 ? (
                <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        <th className="w-12 p-4 text-left">
                          <input
                            className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-1 focus:ring-offset-0 focus:ring-primary"
                            type="checkbox"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          ID Thanh toán
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          ID Hợp đồng
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Tên Khách hàng
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Số tiền
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Ngày tạo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {paginatedPayments.map((payment) => (
                        <tr key={payment.paymentId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-4">
                            <input
                              className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 bg-transparent text-primary checked:bg-primary checked:border-primary focus:ring-1 focus:ring-offset-0 focus:ring-primary"
                              type="checkbox"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            PAY-{payment.paymentId || '00000'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            CON-{payment.contractId || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {payment.customerName || 'N/A'}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(payment.createdAt || payment.paymentDate)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-primary hover:text-primary/80">
                            <button>Xem Chi tiết</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">{Math.min(endIndex, filteredPayments.length)}</span> of{' '}
              <span className="font-medium">{filteredPayments.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                ←
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary bg-primary text-white">
                {currentPage}
              </button>
              {currentPage + 1 <= totalPages && (
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {currentPage + 1}
                </button>
              )}
              {currentPage + 2 <= totalPages && (
                <button
                  onClick={() => setCurrentPage(currentPage + 2)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {currentPage + 2}
                </button>
              )}
              <span className="text-gray-500">...</span>
              {totalPages > currentPage + 2 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </DealerStaffLayout>
  );
};

export default PaymentManagementPage;

