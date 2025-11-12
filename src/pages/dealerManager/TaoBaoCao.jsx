import { useState } from 'react';

function TaoBaoCao() {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const reportTypes = [
    { id: 'sales', name: 'Báo cáo doanh số', icon: '💰' },
    { id: 'inventory', name: 'Báo cáo tồn kho', icon: '📦' },
    { id: 'employee', name: 'Báo cáo nhân viên', icon: '👥' },
    { id: 'customer', name: 'Báo cáo khách hàng', icon: '👤' },
    { id: 'financial', name: 'Báo cáo tài chính', icon: '💳' }
  ];

  const availableMetrics = [
    { id: 'revenue', name: 'Doanh thu', description: 'Tổng doanh thu trong kỳ' },
    { id: 'orders', name: 'Số đơn hàng', description: 'Tổng số đơn hàng đã bán' },
    { id: 'conversion', name: 'Tỷ lệ chuyển đổi', description: 'Tỷ lệ khách hàng mua hàng' },
    { id: 'inventory', name: 'Tồn kho', description: 'Số lượng xe còn lại' },
    { id: 'employee_performance', name: 'Hiệu suất nhân viên', description: 'Hiệu suất làm việc của nhân viên' },
    { id: 'customer_satisfaction', name: 'Độ hài lòng khách hàng', description: 'Đánh giá từ khách hàng' }
  ];

  const handleMetricToggle = (metricId) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle report creation logic here
    console.log('Creating report:', {
      reportType,
      dateRange,
      selectedMetrics,
      reportTitle,
      reportDescription
    });
    alert('Báo cáo đã được tạo thành công!');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-red-100 rounded-lg mr-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo báo cáo</h1>
            <p className="text-gray-600">Tạo báo cáo tùy chỉnh cho doanh nghiệp</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Report Type Selection */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Loại báo cáo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setReportType(type.id)}
                className={`p-4 border-2 rounded-lg text-left transition ${
                  reportType === type.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{type.icon}</span>
                  <span className="font-medium text-gray-900">{type.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Khoảng thời gian</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày bắt đầu
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày kết thúc
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Metrics Selection */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chọn chỉ số báo cáo</h2>
          <div className="space-y-3">
            {availableMetrics.map((metric) => (
              <label key={metric.id} className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric.id)}
                  onChange={() => handleMetricToggle(metric.id)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <div className="ml-3">
                  <div className="font-medium text-gray-900">{metric.name}</div>
                  <div className="text-sm text-gray-500">{metric.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Report Details */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết báo cáo</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề báo cáo
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Nhập tiêu đề báo cáo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả báo cáo
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Nhập mô tả chi tiết về báo cáo..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {selectedMetrics.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Xem trước báo cáo</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-2">
                <strong>Loại báo cáo:</strong> {reportTypes.find(t => t.id === reportType)?.name}
              </div>
              <div className="mb-2">
                <strong>Khoảng thời gian:</strong> {dateRange.startDate} - {dateRange.endDate}
              </div>
              <div className="mb-2">
                <strong>Chỉ số được chọn:</strong> {selectedMetrics.length} chỉ số
              </div>
              <div className="text-sm text-gray-600">
                {selectedMetrics.map(metricId => {
                  const metric = availableMetrics.find(m => m.id === metricId);
                  return metric ? metric.name : '';
                }).join(', ')}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            disabled={!reportType || !dateRange.startDate || !dateRange.endDate || selectedMetrics.length === 0}
          >
            Tạo báo cáo
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaoBaoCao;
