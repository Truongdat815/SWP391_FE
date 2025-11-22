import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import EVMStaffLayout from '../../../components/layout/EVMStaffLayout';
import { useGetSalesReportQuery, useGetDealerReportQuery, useGetModelReportQuery } from '../../../api/evmStaff/reportApi';
import { useGetMonthlyRevenueQuery } from '../../../api/evmStaff/storeApi';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dealerId, setDealerId] = useState('');
  const [modelId, setModelId] = useState('');
  
  // Tính toán min date cho endDate (startDate + 1 ngày)
  const getMinEndDate = () => {
    if (!startDate) return '';
    const start = new Date(startDate);
    start.setDate(start.getDate() + 1);
    return start.toISOString().split('T')[0];
  };
  
  const minEndDate = getMinEndDate();
  
  // Xử lý khi startDate thay đổi
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // Nếu endDate nhỏ hơn hoặc bằng startDate, tự động cập nhật endDate
    if (endDate && newStartDate) {
      const start = new Date(newStartDate);
      const end = new Date(endDate);
      start.setDate(start.getDate() + 1); // Thêm 1 ngày vào startDate
      
      if (end <= start) {
        // Cập nhật endDate thành startDate + 1 ngày
        setEndDate(start.toISOString().split('T')[0]);
      }
    }
  };
  
  // Xử lý khi endDate thay đổi với validation
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    
    if (!startDate) {
      // Nếu chưa chọn startDate, cho phép chọn bất kỳ
      setEndDate(newEndDate);
      return;
    }
    
    const start = new Date(startDate);
    const end = new Date(newEndDate);
    start.setDate(start.getDate() + 1); // Thêm 1 ngày vào startDate
    
    // Kiểm tra nếu endDate nhỏ hơn hoặc bằng startDate + 1 ngày
    if (end <= start) {
      // Không cho phép chọn, hiển thị cảnh báo
      alert('Ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày');
      return;
    }
    
    setEndDate(newEndDate);
  };

  // Set default date range (last 30 days)
  const getDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const defaultDates = getDefaultDates();
  const finalStartDate = startDate || defaultDates.start;
  const finalEndDate = endDate || defaultDates.end;

  const { data: salesReport, isLoading: isLoadingSales } = useGetSalesReportQuery(
    { startDate: finalStartDate, endDate: finalEndDate },
    { skip: reportType !== 'sales' }
  );

  const { data: dealerReport, isLoading: isLoadingDealer } = useGetDealerReportQuery(
    { dealerId: parseInt(dealerId), startDate: finalStartDate, endDate: finalEndDate },
    { skip: reportType !== 'dealer' || !dealerId }
  );

  const { data: modelReport, isLoading: isLoadingModel } = useGetModelReportQuery(
    { modelId: parseInt(modelId), startDate: finalStartDate, endDate: finalEndDate },
    { skip: reportType !== 'model' || !modelId }
  );

  const { data: revenueData } = useGetMonthlyRevenueQuery();

  const isLoading = isLoadingSales || isLoadingDealer || isLoadingModel;
  const monthlyRevenue = revenueData?.data || [];

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

  return (
    <EVMStaffLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo Cáo</h1>
          <p className="text-gray-600 mt-1">Xem các báo cáo doanh số và thống kê</p>
        </div>

        {/* Report Type Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex gap-4">
            <button
              onClick={() => setReportType('sales')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                reportType === 'sales'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Báo Cáo Doanh Số
            </button>
            <button
              onClick={() => setReportType('dealer')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                reportType === 'dealer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Báo Cáo Theo Đại Lý
            </button>
            <button
              onClick={() => setReportType('model')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                reportType === 'model'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Báo Cáo Theo Mẫu Xe
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Từ ngày"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              max={endDate ? new Date(new Date(endDate).setDate(new Date(endDate).getDate() - 1)).toISOString().split('T')[0] : undefined}
            />
            <Input
              label="Đến ngày"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              min={minEndDate}
              disabled={!startDate}
            />
            {reportType === 'dealer' && (
              <Input
                label="Mã Đại Lý"
                type="number"
                value={dealerId}
                onChange={(e) => setDealerId(e.target.value)}
                placeholder="Nhập mã đại lý"
              />
            )}
            {reportType === 'model' && (
              <Input
                label="Mã Mẫu Xe"
                type="number"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                placeholder="Nhập mã mẫu xe"
              />
            )}
          </div>
        </div>

        {/* Monthly Revenue Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doanh thu tháng này</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(
                    monthlyRevenue.find(
                      (rev) =>
                        rev.month === new Date().getMonth() + 1 &&
                        rev.year === new Date().getFullYear()
                    )?.totalRevenue || 0
                  )}
                </p>
              </div>
              <DollarSign size={32} className="text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {monthlyRevenue.reduce((sum, rev) => sum + (rev.totalOrders || 0), 0)}
                </p>
              </div>
              <ShoppingCart size={32} className="text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tăng trưởng</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">+12.5%</p>
              </div>
              <TrendingUp size={32} className="text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Báo cáo</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {reportType === 'sales' ? 'Doanh số' : reportType === 'dealer' ? 'Đại lý' : 'Mẫu xe'}
                </p>
              </div>
              <BarChart3 size={32} className="text-purple-500" />
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : (
            <div>
              {reportType === 'sales' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Báo Cáo Doanh Số</h2>
                  {salesReport ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tổng doanh thu</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(salesReport?.data?.totalRevenue || salesReport?.totalRevenue || 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tổng số đơn hàng</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {salesReport?.data?.totalOrders || salesReport?.totalOrders || 0}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Không có dữ liệu
                    </div>
                  )}
                </div>
              )}

              {reportType === 'dealer' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Báo Cáo Theo Đại Lý</h2>
                  {dealerReport ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Doanh thu đại lý</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(dealerReport?.data?.totalRevenue || dealerReport?.totalRevenue || 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Số đơn hàng</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {dealerReport?.data?.totalOrders || dealerReport?.totalOrders || 0}
                        </p>
                      </div>
                    </div>
                  ) : !dealerId ? (
                    <div className="text-center text-gray-500 py-8">
                      Vui lòng nhập mã đại lý
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Không có dữ liệu
                    </div>
                  )}
                </div>
              )}

              {reportType === 'model' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Báo Cáo Theo Mẫu Xe</h2>
                  {modelReport ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Doanh thu mẫu xe</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(modelReport?.data?.totalRevenue || modelReport?.totalRevenue || 0)}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Số lượng bán</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {modelReport?.data?.totalSold || modelReport?.totalSold || 0}
                        </p>
                      </div>
                    </div>
                  ) : !modelId ? (
                    <div className="text-center text-gray-500 py-8">
                      Vui lòng nhập mã mẫu xe
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Không có dữ liệu
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </EVMStaffLayout>
  );
};

export default ReportsPage;

