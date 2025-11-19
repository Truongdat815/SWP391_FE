import { useState } from 'react';

function BaoCaoDoanhSo() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const salesData = {
    monthly: {
      totalRevenue: '8.5M VNĐ',
      totalOrders: 156,
      conversionRate: '72%',
      averageOrderValue: '54,487 VNĐ',
      growth: '+15%'
    },
    byModel: [
      { name: 'Electra Ascent', sales: '2.1M VNĐ', orders: 28, percentage: 24.7 },
      { name: 'Electra CityLink', sales: '1.8M VNĐ', orders: 24, percentage: 21.2 },
      { name: 'Electra GrandTour', sales: '1.6M VNĐ', orders: 22, percentage: 18.8 },
      { name: 'Electra Summit', sales: '1.4M VNĐ', orders: 19, percentage: 16.5 },
      { name: 'Electra Velocity', sales: '1.2M VNĐ', orders: 17, percentage: 14.1 },
      { name: 'Electra Micro', sales: '0.4M VNĐ', orders: 6, percentage: 4.7 }
    ],
    byEmployee: [
      { name: 'Nguyễn Văn A', sales: '2.1M VNĐ', orders: 28, conversion: '78%' },
      { name: 'Trần Thị B', sales: '1.8M VNĐ', orders: 24, conversion: '75%' },
      { name: 'Lê Văn C', sales: '1.6M VNĐ', orders: 22, conversion: '73%' },
      { name: 'Phạm Thị D', sales: '1.4M VNĐ', orders: 19, conversion: '71%' },
      { name: 'Hoàng Văn E', sales: '1.2M VNĐ', orders: 17, conversion: '69%' },
      { name: 'Vũ Thị F', sales: '0.4M VNĐ', orders: 6, conversion: '65%' }
    ],
    trends: [
      { month: 'Tháng 1', revenue: '7.2M', orders: 132 },
      { month: 'Tháng 2', revenue: '7.8M', orders: 145 },
      { month: 'Tháng 3', revenue: '8.1M', orders: 149 },
      { month: 'Tháng 4', revenue: '8.5M', orders: 156 }
    ]
  };

  // Colors for models (tailwind palette hex values)
  const modelColors = ['#ef4444', '#10b981', '#3b82f6', '#a855f7', '#f59e0b', '#64748b'];

  const buildConicGradient = (models) => {
    let start = 0;
    const segments = models.map((m, idx) => {
      const end = start + m.percentage;
      const segment = `${modelColors[idx % modelColors.length]} ${start}% ${end}%`;
      start = end;
      return segment;
    });
    return `conic-gradient(${segments.join(',')})`;
  };

  const periods = [
    { id: 'week', name: 'Tuần này' },
    { id: 'month', name: 'Tháng này' },
    { id: 'quarter', name: 'Quý này' },
    { id: 'year', name: 'Năm này' },
    { id: 'custom', name: 'Tùy chỉnh' }
  ];

  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const handleExport = (format) => {
    alert(`Đang xuất báo cáo doanh số định dạng ${format.toUpperCase()}...`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
            <div className="p-2 sm:p-2.5 md:p-3 bg-red-100 rounded-lg flex-shrink-0">
              <svg className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Báo cáo doanh số</h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5 sm:mt-1">Phân tích chi tiết doanh số bán hàng</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Xuất PDF</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base font-medium whitespace-nowrap"
            >
              <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-5 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Chọn khoảng thời gian</h2>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {periods.map((period) => (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base rounded-lg border transition-all duration-200 ${
                selectedPeriod === period.id
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {period.name}
            </button>
          ))}
        </div>
        
        {selectedPeriod === 'custom' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {[2022, 2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-semibold text-gray-900">{salesData.monthly.totalRevenue}</p>
              <p className="text-sm text-green-600">{salesData.monthly.growth}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-semibold text-gray-900">{salesData.monthly.totalOrders}</p>
              <p className="text-sm text-green-600">+8%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tỷ lệ chuyển đổi</p>
              <p className="text-2xl font-semibold text-gray-900">{salesData.monthly.conversionRate}</p>
              <p className="text-sm text-green-600">+3%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Giá trị đơn hàng TB</p>
              <p className="text-2xl font-semibold text-gray-900">{salesData.monthly.averageOrderValue}</p>
              <p className="text-sm text-green-600">+5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Model */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="px-3 py-2.5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Doanh số theo mẫu xe</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Donut Chart */}
            <div className="col-span-1 flex flex-col items-center">
              <div
                className="relative h-64 w-64 rounded-full"
                style={{ backgroundImage: buildConicGradient(salesData.byModel) }}
                aria-label="Biểu đồ tròn doanh số theo mẫu xe"
              >
                <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Tổng doanh thu</p>
                    <p className="text-xl font-semibold text-gray-900">{salesData.monthly.totalRevenue}</p>
                  </div>
                </div>
              </div>
              {/* Legend */}
              <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 w-full">
                {salesData.byModel.map((m, idx) => (
                  <div key={idx} className="flex items-center">
                    <span
                      className="inline-block w-3 h-3 rounded-sm mr-2"
                      style={{ backgroundColor: modelColors[idx % modelColors.length] }}
                    ></span>
                    <span className="text-sm text-gray-700 truncate">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {salesData.byModel.map((model, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div
                        className="h-10 w-10 rounded-md mr-4"
                        style={{ backgroundColor: modelColors[index % modelColors.length] }}
                        aria-hidden="true"
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{model.name}</h4>
                        <p className="text-sm text-gray-500">{model.orders} đơn hàng</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{model.sales}</p>
                        <p className="text-sm text-gray-500">{model.percentage}% tổng doanh số</p>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${model.percentage}%`, backgroundColor: modelColors[index % modelColors.length] }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales by Employee */}
      <div className="bg-white rounded-lg shadow mb-4">
        <div className="px-3 py-2.5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Doanh số theo nhân viên</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhân viên
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doanh số
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số đơn hàng
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ lệ chuyển đổi
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xếp hạng
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.byEmployee.map((employee, index) => (
                <tr key={index}>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-300 rounded-full mr-4"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">Nhân viên bán hàng</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.sales}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.orders}</div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {employee.conversion}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      #{index + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Trends */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-3 py-2.5 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Xu hướng doanh số</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {salesData.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-red-100 rounded-lg mr-4 flex items-center justify-center">
                    <span className="text-red-600 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{trend.month}</h4>
                    <p className="text-sm text-gray-500">{trend.orders} đơn hàng</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{trend.revenue}</p>
                  <p className="text-sm text-green-600">+{Math.floor(Math.random() * 20 + 5)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BaoCaoDoanhSo;
