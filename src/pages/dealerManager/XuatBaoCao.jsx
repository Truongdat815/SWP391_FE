import { useState } from 'react';

function XuatBaoCao() {
  console.log('XuatBaoCao component is rendering');
  const [selectedReports, setSelectedReports] = useState([]);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [emailRecipients, setEmailRecipients] = useState('');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);

  const availableReports = [
    {
      id: 'sales_summary',
      name: 'Tổng quan doanh số',
      description: 'Báo cáo tổng quan về doanh số bán hàng',
      icon: '💰',
      category: 'sales',
      size: '2.3 MB',
      lastGenerated: '2024-01-15'
    },
    {
      id: 'sales_by_model',
      name: 'Doanh số theo mẫu xe',
      description: 'Phân tích doanh số chi tiết theo từng mẫu xe',
      icon: '🚗',
      category: 'sales',
      size: '1.8 MB',
      lastGenerated: '2024-01-14'
    },
    {
      id: 'employee_performance',
      name: 'Hiệu suất nhân viên',
      description: 'Báo cáo hiệu suất làm việc của nhân viên',
      icon: '👥',
      category: 'hr',
      size: '1.2 MB',
      lastGenerated: '2024-01-13'
    },
    {
      id: 'debt_report',
      name: 'Báo cáo công nợ',
      description: 'Tình hình công nợ khách hàng',
      icon: '💳',
      category: 'finance',
      size: '0.9 MB',
      lastGenerated: '2024-01-12'
    },
    {
      id: 'inventory_report',
      name: 'Báo cáo tồn kho',
      description: 'Tình hình tồn kho xe và phụ tung',
      icon: '📦',
      category: 'inventory',
      size: '1.5 MB',
      lastGenerated: '2024-01-11'
    },
    {
      id: 'customer_analysis',
      name: 'Phân tích khách hàng',
      description: 'Thông tin và hành vi khách hàng',
      icon: '👤',
      category: 'customer',
      size: '2.1 MB',
      lastGenerated: '2024-01-10'
    },
    {
      id: 'financial_summary',
      name: 'Tổng quan tài chính',
      description: 'Báo cáo tổng quan tình hình tài chính',
      icon: '📊',
      category: 'finance',
      size: '3.2 MB',
      lastGenerated: '2024-01-09'
    },
    {
      id: 'marketing_roi',
      name: 'ROI Marketing',
      description: 'Hiệu quả đầu tư marketing và quảng cáo',
      icon: '📈',
      category: 'marketing',
      size: '1.7 MB',
      lastGenerated: '2024-01-08'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả', color: 'bg-gray-100' },
    { id: 'sales', name: 'Bán hàng', color: 'bg-red-100' },
    { id: 'finance', name: 'Tài chính', color: 'bg-green-100' },
    { id: 'hr', name: 'Nhân sự', color: 'bg-blue-100' },
    { id: 'inventory', name: 'Kho hàng', color: 'bg-yellow-100' },
    { id: 'customer', name: 'Khách hàng', color: 'bg-purple-100' },
    { id: 'marketing', name: 'Marketing', color: 'bg-pink-100' }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredReports = selectedCategory === 'all' 
    ? availableReports 
    : availableReports.filter(report => report.category === selectedCategory);

  const handleReportToggle = (reportId) => {
    setSelectedReports(prev => 
      prev.includes(reportId) 
        ? prev.filter(id => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === filteredReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(filteredReports.map(report => report.id));
    }
  };

  const handleExport = (e) => {
    e.preventDefault();
    if (selectedReports.length === 0) {
      alert('Vui lòng chọn ít nhất một báo cáo để xuất!');
      return;
    }

    const selectedReportNames = selectedReports.map(id => {
      const report = availableReports.find(r => r.id === id);
      return report ? report.name : '';
    }).join(', ');

    console.log('Exporting reports:', {
      reports: selectedReports,
      format: exportFormat,
      dateRange,
      emailRecipients,
      includeCharts,
      includeDetails
    });

    alert(`Đang xuất ${selectedReports.length} báo cáo (${selectedReportNames}) định dạng ${exportFormat.toUpperCase()}...`);
  };

  const handleQuickExport = (reportId, format) => {
    const report = availableReports.find(r => r.id === reportId);
    console.log(`Quick export: ${report.name} as ${format}`);
    alert(`Đang xuất "${report.name}" định dạng ${format.toUpperCase()}...`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : 'bg-gray-100';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 rounded-lg mr-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Xuất báo cáo</h1>
            <p className="text-gray-600">Xuất và chia sẻ báo cáo doanh nghiệp</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-2">
          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Danh mục báo cáo</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg border transition ${
                    selectedCategory === category.id
                      ? 'bg-green-600 text-white border-green-600'
                      : `${category.color} text-gray-700 border-gray-300 hover:bg-opacity-80`
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Report List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Chọn báo cáo</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Đã chọn: {selectedReports.length}/{filteredReports.length}
                  </span>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    {selectedReports.length === filteredReports.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedReports.includes(report.id)}
                          onChange={() => handleReportToggle(report.id)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-4"
                        />
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{report.icon}</span>
                          <div>
                            <h3 className="font-medium text-gray-900">{report.name}</h3>
                            <p className="text-sm text-gray-500">{report.description}</p>
                            <div className="flex items-center mt-1 space-x-4">
                              <span className="text-xs text-gray-400">Kích thước: {report.size}</span>
                              <span className="text-xs text-gray-400">Cập nhật: {formatDate(report.lastGenerated)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)} text-gray-700`}>
                          {categories.find(c => c.id === report.category)?.name}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleQuickExport(report.id, 'pdf')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Xuất PDF"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleQuickExport(report.id, 'excel')}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Xuất Excel"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Export Settings */}
        <div className="space-y-6">
          {/* Export Format */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Định dạng xuất</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">PDF - Phù hợp để in và chia sẻ</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">Excel - Phù hợp để phân tích dữ liệu</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="word"
                  checked={exportFormat === 'word'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">Word - Phù hợp để chỉnh sửa</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="powerpoint"
                  checked={exportFormat === 'powerpoint'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700">PowerPoint - Phù hợp để thuyết trình</span>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Khoảng thời gian</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tùy chọn xuất</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeCharts}
                  onChange={(e) => setIncludeCharts(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Bao gồm biểu đồ</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Bao gồm chi tiết</span>
              </label>
            </div>
          </div>

          {/* Email Recipients */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gửi email (tùy chọn)</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ email (cách nhau bằng dấu phẩy)
              </label>
              <textarea
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
                placeholder="example@email.com, another@email.com"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Export Button */}
          <form onSubmit={handleExport}>
            <button
              type="submit"
              disabled={selectedReports.length === 0}
              className={`w-full py-3 px-4 rounded-lg font-medium transition ${
                selectedReports.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Xuất báo cáo ({selectedReports.length})
              </div>
            </button>
          </form>

          {/* Recent Exports */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xuất gần đây</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Báo cáo doanh số tháng 1</p>
                  <p className="text-xs text-gray-500">PDF - 2.3 MB</p>
                </div>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Tải lại
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Hiệu suất nhân viên Q4</p>
                  <p className="text-xs text-gray-500">Excel - 1.8 MB</p>
                </div>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Tải lại
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Báo cáo công nợ</p>
                  <p className="text-xs text-gray-500">PDF - 0.9 MB</p>
                </div>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Tải lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default XuatBaoCao;
