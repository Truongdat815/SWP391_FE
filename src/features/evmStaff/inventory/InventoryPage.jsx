import { useState, useMemo } from 'react';
import { Search, Plus, Eye, Edit } from 'lucide-react';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import SearchBar from '../../../components/shared/SearchBar';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Dropdown from '../../../components/ui/Dropdown';
import { useGetAllStoreStocksQuery } from '../../../api/evmStaff/inventoryApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: stocksData, isLoading, error } = useGetAllStoreStocksQuery();
  const { data: modelsData } = useGetAllModelsQuery();

  const stocks = stocksData?.data || [];
  const models = modelsData?.data || [];

  // Filter stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesSearch =
        stock.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.modelName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || stock.status === statusFilter;
      const matchesModel =
        modelFilter === 'all' || stock.modelId?.toString() === modelFilter;
      const matchesLocation =
        locationFilter === 'all' || stock.location?.toLowerCase().includes(locationFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesModel && matchesLocation;
    });
  }, [stocks, searchTerm, statusFilter, modelFilter, locationFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStocks = filteredStocks.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      AVAILABLE: { variant: 'success', label: 'AVAILABLE', dot: 'green' },
      SOLD: { variant: 'error', label: 'SOLD', dot: 'red' },
      IN_TRANSIT: { variant: 'warning', label: 'IN_TRANSIT', dot: 'orange' },
      RESERVED: { variant: 'info', label: 'RESERVED', dot: 'blue' },
    };
    const config = statusMap[status] || { variant: 'default', label: status || 'N/A', dot: 'gray' };
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full bg-${config.dot}-500`} />
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US');
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
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý kho xe</h1>
            <p className="text-gray-600 mt-1">
              Quản lý và theo dõi tất cả các xe trong kho.
            </p>
          </div>
          <Button onClick={() => {}}>
            <Plus size={20} className="mr-2" />
            Thêm xe mới
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm kiếm theo VIN, Serial Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Dropdown
              options={[
                { value: 'all', label: 'Trạng thái' },
                { value: 'AVAILABLE', label: 'Available' },
                { value: 'SOLD', label: 'Sold' },
                { value: 'IN_TRANSIT', label: 'In Transit' },
                { value: 'RESERVED', label: 'Reserved' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Dòng xe' },
                ...models.map((model) => ({
                  value: model.modelId?.toString(),
                  label: model.modelName || `Model ${model.modelId}`,
                })),
              ]}
              value={modelFilter}
              onChange={setModelFilter}
            />
            <Dropdown
              options={[
                { value: 'all', label: 'Vị trí' },
                { value: 'hanoi', label: 'Hanoi Dealership' },
                { value: 'hcmc', label: 'HCMC Dealership' },
                { value: 'danang', label: 'Da Nang Dealership' },
              ]}
              value={locationFilter}
              onChange={setLocationFilter}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {paginatedStocks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head className="w-12">
                        <input type="checkbox" className="rounded" />
                      </Table.Head>
                      <Table.Head>VIN</Table.Head>
                      <Table.Head>SERIAL NUMBER</Table.Head>
                      <Table.Head>MODEL</Table.Head>
                      <Table.Head>COLOR</Table.Head>
                      <Table.Head>TRẠNG THÁI</Table.Head>
                      <Table.Head>VỊ TRÍ</Table.Head>
                      <Table.Head>DATE ADDED</Table.Head>
                      <Table.Head className="text-center">ACTIONS</Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {paginatedStocks.map((stock) => (
                      <Table.Row key={stock.storeStockId}>
                        <Table.Cell>
                          <input type="checkbox" className="rounded" />
                        </Table.Cell>
                        <Table.Cell className="font-mono text-sm">
                          {stock.vin || `VIN${stock.storeStockId}`}
                        </Table.Cell>
                        <Table.Cell className="font-mono text-sm">
                          {stock.serialNumber || `SNC${stock.storeStockId}`}
                        </Table.Cell>
                        <Table.Cell>{stock.modelName || 'N/A'}</Table.Cell>
                        <Table.Cell>{stock.colorName || 'N/A'}</Table.Cell>
                        <Table.Cell>{getStatusBadge(stock.status)}</Table.Cell>
                        <Table.Cell>{stock.location || stock.storeName || 'N/A'}</Table.Cell>
                        <Table.Cell>{formatDate(stock.createdAt || stock.stockedDate)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                              <Eye size={16} />
                            </button>
                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                              <Edit size={16} />
                            </button>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredStocks.length)} of{' '}
                  {filteredStocks.length} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
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
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </EVMStaffLayout>
  );
};

export default InventoryPage;

