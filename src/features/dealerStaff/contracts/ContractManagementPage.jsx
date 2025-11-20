import { useState, useMemo } from 'react';
import { Search, Filter, Plus, Calendar, Download, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DealerStaffLayout from '../../../components/layout/DealerStaffLayout';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useGetAllContractsQuery } from '../../../api/dealerStaff/contractApi';

const ContractManagementPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const { data: contractsData, isLoading, error } = useGetAllContractsQuery();

  const contracts = Array.isArray(contractsData?.data) ? contractsData.data : [];

  // Filter contracts
  const filteredContracts = useMemo(() => {
    if (!Array.isArray(contracts)) return [];
    return contracts.filter((contract) => {
      const matchesSearch =
        contract.contractId?.toString().includes(searchTerm) ||
        contract.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.orderId?.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      COMPLETED: { color: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300', label: 'COMPLETED' },
      FULLY_PAID: { color: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300', label: 'FULLY_PAID' },
      DEPOSIT_PAID: { color: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300', label: 'DEPOSIT_PAID' },
      SIGNED: { color: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300', label: 'SIGNED' },
      CANCELLED: { color: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300', label: 'CANCELLED' },
      DRAFT: { color: 'bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-slate-300', label: 'DRAFT' },
    };
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800', label: status || 'N/A' };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 pb-4">
          <button 
            onClick={() => navigate('/dealer-staff/dashboard')}
            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-primary dark:hover:text-primary"
          >
            Dashboard
          </button>
          <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/</span>
          <span className="text-slate-800 dark:text-slate-200 text-sm font-medium">Quản lý hợp đồng</span>
        </div>

        {/* Page Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <div className="flex min-w-72 flex-col gap-1">
            <p className="text-slate-900 dark:text-slate-50 text-3xl font-bold leading-tight">Quản lý hợp đồng</p>
            <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
              Xem, tải lên và quản lý trạng thái các hợp đồng bán xe.
            </p>
          </div>
          <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-sm hover:bg-primary/90">
            <Plus size={20} className="mr-2" />
            <span className="truncate">Tạo hợp đồng mới</span>
          </button>
        </div>

        {/* Toolbar & SearchBar */}
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="w-full flex-1">
              <label className="flex flex-col min-w-40 h-10 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-slate-500 dark:text-slate-400 flex border-y border-l border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 items-center justify-center pl-3 rounded-l-lg">
                    <Search size={20} />
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-800 dark:text-slate-200 focus:outline-0 focus:ring-2 focus:ring-primary/50 border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-4 rounded-l-none border-l-0 pl-2 text-sm font-normal leading-normal"
                    placeholder="Tìm theo mã hợp đồng, tên khách hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </label>
            </div>
            <div className="flex w-full items-center justify-end gap-2 md:w-auto">
              <button className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                <Filter size={20} />
              </button>
              <button className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                <Calendar size={20} />
              </button>
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-slate-800 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 dark:bg-slate-200 dark:text-slate-900 shadow-sm hover:bg-slate-700 dark:hover:bg-slate-300">
                <Download size={18} />
                <span className="truncate">Xuất báo cáo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-6 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                {paginatedContracts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
                ) : (
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 sm:pl-6" scope="col">
                          Mã Hợp Đồng
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100" scope="col">
                          Tên Khách Hàng
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100" scope="col">
                          Mã Đơn Hàng
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100" scope="col">
                          Ngày Tạo
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100" scope="col">
                          Tổng Giá Trị
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-100" scope="col">
                          Trạng thái
                        </th>
                        <th className="relative py-3.5 pl-3 pr-4 sm:pr-6" scope="col">
                          <span className="sr-only">Hành Động</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900/50">
                      {paginatedContracts.map((contract) => (
                        <tr key={contract.contractId}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-slate-100 sm:pl-6">
                            HD-{contract.contractId}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {contract.customerName || 'N/A'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-primary hover:underline">
                            <button onClick={() => navigate(`/dealer-staff/orders/${contract.orderId}`)}>
                              DH-{contract.orderId || 'N/A'}
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {formatDate(contract.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {formatCurrency(contract.totalValue || contract.totalAmount)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            {getStatusBadge(contract.status)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button className="text-slate-600 hover:text-primary dark:text-slate-400 dark:hover:text-primary">
                              <MoreVertical size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <nav
          aria-label="Pagination"
          className="mt-6 flex items-center justify-between border-t border-slate-200 px-4 pt-4 sm:px-0 dark:border-slate-800"
        >
          <div className="hidden sm:block">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{' '}
              <span className="font-medium">{Math.min(endIndex, filteredContracts.length)}</span> của{' '}
              <span className="font-medium">{filteredContracts.length}</span> kết quả
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Trang trước
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Trang sau
            </button>
          </div>
        </nav>
      </div>
    </DealerStaffLayout>
  );
};

export default ContractManagementPage;

