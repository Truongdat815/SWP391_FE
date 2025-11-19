import { useState, useMemo } from 'react';
import { Search, Filter, Download, Printer, Plus, Eye, Edit, Truck } from 'lucide-react';
import DealerManagerLayout from '../../../components/layout/DealerManagerLayout';
import SearchBar from '../../../components/shared/SearchBar';
import MetricCard from '../../../components/shared/MetricCard';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useGetAllStoreStocksQuery } from '../../../api/dealerManager/inventoryApi';
import { useGetAllModelsQuery } from '../../../api/admin/modelApi';

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: stocksData, isLoading, error } = useGetAllStoreStocksQuery();
  const { data: modelsData } = useGetAllModelsQuery();

  const stocks = stocksData?.data || [];
  const models = modelsData?.data || [];

  // Tính toán metrics
  const totalCars = stocks.length;
  const arrivingCars = stocks.filter(
    (stock) => stock.status === 'IN_TRANSIT' || stock.status === 'ARRIVING'
  ).length;
  const availableCars = stocks.filter((stock) => stock.status === 'AVAILABLE').length;

  // Filter stocks
  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesSearch =
        stock.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Kho xe - Đại lý ABC</h1>
          <p className="text-gray-600 mt-1">
            Xem và quản lý tất cả các xe có trong kho của bạn.
          </p>
        </div>

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
                placeholder="Tìm kiếm theo Số VIN, Mẫu xe..."
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
            <Button onClick={() => {}}>
              <Plus size={20} className="mr-2" />
              Đặt xe từ hãng
            </Button>
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
                    <Table.Head>SỐ VIN</Table.Head>
                    <Table.Head>TÌNH TRẠNG</Table.Head>
                    <Table.Head>VỊ TRÍ</Table.Head>
                    <Table.Head>NGÀY NHẬP KHO</Table.Head>
                    <Table.Head className="text-center">HÀNH ĐỘNG</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedStocks.map((stock) => (
                    <Table.Row key={stock.storeStockId}>
                      <Table.Cell className="font-medium">
                        {stock.modelName || `Model ${stock.modelId}`}
                      </Table.Cell>
                      <Table.Cell>{stock.colorName || 'N/A'}</Table.Cell>
                      <Table.Cell className="font-mono text-sm">
                        {stock.vin || `VIN${stock.storeStockId}`}
                      </Table.Cell>
                      <Table.Cell>{getStatusBadge(stock.status)}</Table.Cell>
                      <Table.Cell>{stock.location || 'Kho chính'}</Table.Cell>
                      <Table.Cell>{formatDate(stock.createdAt || stock.stockedDate)}</Table.Cell>
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
                  ))}
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
      </div>
    </DealerManagerLayout>
  );
};

export default InventoryPage;

