
import React, { useMemo, useState } from 'react';

function DealerManagerDashboard() {

  const stats = [
    { title: 'Doanh số tháng', value: '8.5M VNĐ', change: '+15%', color: 'bg-red-500' },
    { title: 'Số đơn hàng', value: '156', change: '+8%', color: 'bg-green-500' },
    { title: 'Nhân viên bán hàng', value: '12', change: '+2', color: 'bg-blue-500' },
    { title: 'Tỷ lệ chuyển đổi', value: '72%', change: '+3%', color: 'bg-purple-500' }
  ];

  const _salesTeam = [
    { name: 'Nguyễn Văn A', sales: '2.1M', orders: 28, conversion: '78%' },
    { name: 'Trần Thị B', sales: '1.8M', orders: 24, conversion: '75%' },
    { name: 'Lê Văn C', sales: '1.6M', orders: 22, conversion: '73%' },
    { name: 'Phạm Thị D', sales: '1.4M', orders: 19, conversion: '71%' }
  ];

  const _debtReport = [
    { customer: 'Công ty ABC', amount: '500,000,000', days: 15, status: 'warning' },
    { customer: 'Ông Nguyễn XYZ', amount: '200,000,000', days: 8, status: 'normal' },
    { customer: 'Chị Trần DEF', amount: '800,000,000', days: 25, status: 'critical' }
  ];


  const _getDebtStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const _getDebtStatusText = (status) => {
    switch (status) {
      case 'critical': return 'Nghiêm trọng';
      case 'warning': return 'Cảnh báo';
      case 'normal': return 'Bình thường';
      default: return status;
    }
  };

  // Fake monthly sales dataset shared by both chart modes (units are arbitrary)
  const salesByMonth = useMemo(() => (
    [
      { label: 'T1', value: 420 },
      { label: 'T2', value: 380 },
      { label: 'T3', value: 460 },
      { label: 'T4', value: 520 },
      { label: 'T5', value: 610 },
      { label: 'T6', value: 570 },
      { label: 'T7', value: 660 },
      { label: 'T8', value: 640 },
      { label: 'T9', value: 700 },
      { label: 'T10', value: 680 },
      { label: 'T11', value: 730 },
      { label: 'T12', value: 760 }
    ]
  ), []);

  const [chartViewMode, setChartViewMode] = useState('bar'); // 'bar' | 'stock'

  function BarChart({ data }) {
    const viewBoxWidth = 640;
    const viewBoxHeight = 240;
    const paddingLeft = 36;
    const paddingRight = 12;
    const paddingTop = 12;
    const paddingBottom = 30;
    const innerWidth = viewBoxWidth - paddingLeft - paddingRight;
    const innerHeight = viewBoxHeight - paddingTop - paddingBottom;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const barGap = 6;
    const barWidth = Math.max(8, Math.floor((innerWidth / data.length) - barGap));

    const yScale = (v) => paddingTop + innerHeight - (v / maxValue) * innerHeight;

    return (
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-64">
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = paddingTop + innerHeight * t;
          return (
            <line key={i} x1={paddingLeft} x2={viewBoxWidth - paddingRight} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const x = paddingLeft + i * (barWidth + barGap);
          const y = yScale(d.value);
          const height = paddingTop + innerHeight - y;
          const prev = i > 0 ? data[i - 1].value : null;
          const delta = prev != null ? d.value - prev : null;
          const deltaPct = prev != null && prev !== 0 ? (delta / prev) * 100 : null;
          const deltaColor = delta == null ? '#6b7280' : delta > 0 ? '#16a34a' : delta < 0 ? '#dc2626' : '#6b7280';
          const deltaArrow = delta == null ? '—' : delta > 0 ? '▲' : delta < 0 ? '▼' : '■';
          const valueLabelY = Math.max(y - 6, paddingTop + 10);
          const momLabelY = Math.max(valueLabelY - 14, paddingTop + 10);
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={barWidth} height={height} fill="url(#barGradient)" rx="4" />
              {/* Month label */}
              <text x={x + barWidth / 2} y={viewBoxHeight - 8} textAnchor="middle" fontSize="10" fill="#6b7280">{d.label}</text>
              {/* Value label */}
              <text x={x + barWidth / 2} y={valueLabelY} textAnchor="middle" fontSize="11" fontWeight="600" fill="#374151">{d.value}</text>
              {/* MoM delta */}
              <text x={x + barWidth / 2} y={momLabelY} textAnchor="middle" fontSize="10" fill={deltaColor}>
                {deltaPct == null ? '—' : `${deltaArrow} ${Math.abs(deltaPct).toFixed(0)}%`}
              </text>
            </g>
          );
        })}
        {/* Y axis */}
        <line x1={paddingLeft} x2={paddingLeft} y1={paddingTop} y2={paddingTop + innerHeight} stroke="#d1d5db" />
        <line x1={paddingLeft} x2={viewBoxWidth - paddingRight} y1={paddingTop + innerHeight} y2={paddingTop + innerHeight} stroke="#d1d5db" />
      </svg>
    );
  }

  function StockChart({ data }) {
    const viewBoxWidth = 640;
    const viewBoxHeight = 240;
    const paddingLeft = 36;
    const paddingRight = 12;
    const paddingTop = 12;
    const paddingBottom = 30;
    const innerWidth = viewBoxWidth - paddingLeft - paddingRight;
    const innerHeight = viewBoxHeight - paddingTop - paddingBottom;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1;
    const minValue = Math.min(...data.map(d => d.value)) * 0.9;
    const xStep = innerWidth / (data.length - 1);
    const xAt = (i) => paddingLeft + i * xStep;
    const yAt = (v) => paddingTop + innerHeight - ((v - minValue) / (maxValue - minValue)) * innerHeight;

    const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xAt(i)} ${yAt(d.value)}`).join(' ');
    const area = `M ${xAt(0)} ${yAt(data[0].value)} ${data.map((d, i) => `L ${xAt(i)} ${yAt(d.value)}`).join(' ')} L ${xAt(data.length - 1)} ${paddingTop + innerHeight} L ${xAt(0)} ${paddingTop + innerHeight} Z`;

    return (
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full h-64">
        <defs>
          <linearGradient id="stockAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = paddingTop + innerHeight * t;
          return (
            <line key={i} x1={paddingLeft} x2={viewBoxWidth - paddingRight} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
          );
        })}
        <path d={area} fill="url(#stockAreaGradient)" />
        <path d={path} fill="none" stroke="#ef4444" strokeWidth="2" />
        {data.map((d, i) => {
          const cx = xAt(i);
          const cy = yAt(d.value);
          const prev = i > 0 ? data[i - 1].value : null;
          const delta = prev != null ? d.value - prev : null;
          const deltaPct = prev != null && prev !== 0 ? (delta / prev) * 100 : null;
          const deltaColor = delta == null ? '#6b7280' : delta > 0 ? '#16a34a' : delta < 0 ? '#dc2626' : '#6b7280';
          const deltaArrow = delta == null ? '—' : delta > 0 ? '▲' : delta < 0 ? '▼' : '■';
          const valueY = Math.max(cy - 10, paddingTop + 10);
          const momY = Math.max(valueY - 14, paddingTop + 10);
          return (
            <g key={d.label}>
              <circle cx={cx} cy={cy} r="3" fill="#ef4444" />
              {/* Value label */}
              <text x={cx} y={valueY} textAnchor="middle" fontSize="11" fontWeight="600" fill="#374151">{d.value}</text>
              {/* MoM delta */}
              <text x={cx} y={momY} textAnchor="middle" fontSize="10" fill={deltaColor}>
                {deltaPct == null ? '—' : `${deltaArrow} ${Math.abs(deltaPct).toFixed(0)}%`}
              </text>
            </g>
          );
        })}
        {/* X axis labels */}
        {data.map((d, i) => (
          <text key={d.label} x={xAt(i)} y={viewBoxHeight - 8} textAnchor="middle" fontSize="10" fill="#6b7280">{d.label}</text>
        ))}
        <line x1={paddingLeft} x2={viewBoxWidth - paddingRight} y1={paddingTop + innerHeight} y2={paddingTop + innerHeight} stroke="#d1d5db" />
      </svg>
    );
  }

  return (
    <>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
          <div className="grid grid-cols-1 gap-6">
            {/* Sales Performance Chart */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Biểu đồ doanh số</h3>
                <div className="inline-flex items-center rounded-md border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setChartViewMode('bar')}
                    className={`${chartViewMode === 'bar' ? 'bg-red-50 text-red-600' : 'bg-white text-gray-700'} px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors`}
                    aria-pressed={chartViewMode === 'bar'}
                  >
                    Biểu đồ đường
                  </button>
                  <div className="h-6 w-px bg-gray-200" />
                  <button
                    onClick={() => setChartViewMode('stock')}
                    className={`${chartViewMode === 'stock' ? 'bg-red-50 text-red-600' : 'bg-white text-gray-700'} px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition-colors`}
                    aria-pressed={chartViewMode === 'stock'}
                  >
                    Biểu đồ đường
                  </button>
                </div>
              </div>
              <div className="p-6">
                {chartViewMode === 'bar' ? (
                  <BarChart data={salesByMonth} />
                ) : (
                  <StockChart data={salesByMonth} />
                )}
              </div>
            </div>
          </div>
    </>
  );
}

export default DealerManagerDashboard;
