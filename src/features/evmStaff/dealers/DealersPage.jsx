import { useState, useMemo } from 'react';
import { Search, Building2, MapPin, Phone, Store, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Dropdown from '../../../components/ui/Dropdown';
import Button from '../../../components/ui/Button';
import { useGetAllStoresQuery, useGetStoreStatusesQuery } from '../../../api/evmStaff/storeApi';

const DealersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: storesData, isLoading, error } = useGetAllStoresQuery();
  const { data: statusesData } = useGetStoreStatusesQuery();

  const stores = storesData?.data || [];
  const statuses = statusesData?.data || [];

  // Filter stores
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        store.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.storeId?.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || store.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stores, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStores = filteredStores.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { variant: 'success', label: 'Hoạt động' },
      INACTIVE: { variant: 'default', label: 'Không hoạt động' },
      PENDING: { variant: 'warning', label: 'Chờ duyệt' },
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

  if (isLoading) {
    return (
      <EVMStaffLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </EVMStaffLayout>
    );
  }

  // Kiểm tra lỗi 401 (Unauthorized)
  const isUnauthorized = error?.status === 401;

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

  if (error) {
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
              Quản lý Đại lý
            </h1>
            <p className="text-gray-600 mt-1">Xem và quản lý thông tin các đại lý ủy quyền</p>
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

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm theo Tên đại lý, Địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Trạng thái: Tất cả' },
                ...statuses.map((status) => ({
                  value: status,
                  label: status,
                })),
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {paginatedStores.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
              <Store size={48} className="text-gray-300 mb-4" />
              <p>Không tìm thấy đại lý nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head>MÃ ĐẠI LÝ</Table.Head>
                      <Table.Head>TÊN ĐẠI LÝ</Table.Head>
                      <Table.Head>ĐỊA CHỈ</Table.Head>
                      <Table.Head>SỐ ĐIỆN THOẠI</Table.Head>
                      <Table.Head>NGÀY TẠO</Table.Head>
                      <Table.Head>TRẠNG THÁI</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedStores.map((store, index) => (
                      <motion.tr
                        key={store.storeId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <Table.Cell className="font-mono font-medium text-blue-600">#{store.storeId}</Table.Cell>
                        <Table.Cell className="font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                              <Building2 size={16} />
                            </div>
                            {store.storeName || 'N/A'}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                            <span className="text-sm truncate max-w-xs" title={store.address}>{store.address || 'N/A'}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={16} className="text-gray-400 flex-shrink-0" />
                            <span>{store.phone || store.phoneNumber || 'N/A'}</span>
                          </div>
                        </Table.Cell>
                        <Table.Cell>{formatDate(store.createdAt)}</Table.Cell>
                        <Table.Cell>{getStatusBadge(store.status)}</Table.Cell>
                      </motion.tr>
                    ))}
                  </Table.Body>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/30">
                <p className="text-sm text-gray-500">
                  Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredStores.length)} trong{' '}
                  {filteredStores.length} đại lý
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-gray-300 transition-all"
                  >
                    Trước
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${currentPage === page
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:border-gray-300 transition-all"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </EVMStaffLayout>
  );
};

export default DealersPage;
