import { useState, useEffect } from 'react';

function DealerStaffDashboard() {
  // State cho danh sách báo giá
  const [quotes, setQuotes] = useState([]);

  // Mock data cho báo giá - trong thực tế sẽ lấy từ API
  const mockQuotes = [
    {
      id: 1,
      quoteNumber: 'BQ-001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0123456789',
      quoteDate: '2024-01-15',
      status: 'draft',
      totalAmount: 320000000,
      notes: 'Khách hàng quan tâm đến mẫu xe này'
    },
    {
      id: 2,
      quoteNumber: 'BQ-002',
      customerName: 'Trần Thị B',
      customerPhone: '0987654321',
      quoteDate: '2024-01-16',
      status: 'draft',
      totalAmount: 450000000,
      notes: 'Báo giá mới tạo'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setQuotes(mockQuotes);
  }, []);

  // Stats data with trends
  const stats = [
    { 
      title: 'Xe đang bán', 
      value: '0', 
      change: '+0%',
      changeType: 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    { 
      title: 'Đơn hàng', 
      value: '0', 
      change: '+0%',
      changeType: 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      title: 'Khách hàng', 
      value: '0', 
      change: '+0%',
      changeType: 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      title: 'Doanh thu', 
      value: '0 VNĐ', 
      change: '+0%',
      changeType: 'neutral',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
  ];


  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  // Hàm chuyển báo giá thành đơn hàng
  const handleConvertToOrder = (quoteId) => {
    setQuotes(prev => prev.map(quote => 
      quote.id === quoteId 
        ? { ...quote, status: 'pending' }
        : quote
    ));
    alert('Báo giá đã được chuyển thành đơn hàng chờ duyệt!');
  };

  // Hàm xóa báo giá khi khách từ chối
  const handleDeleteQuote = (quoteId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo giá này?')) {
      setQuotes(prev => prev.filter(quote => quote.id !== quoteId));
      alert('Báo giá đã được xóa!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Bản nháp';
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                  {stat.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className={`text-sm font-medium ${getChangeColor(stat.changeType)}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>


      {/* Quote Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Quản lý báo giá</h2>
        </div>

        <div>
          <div className="space-y-4">
            {quotes.length > 0 ? (
              <div className="space-y-3">
                {quotes.map((quote) => (
                  <div key={quote.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-medium text-gray-900">{quote.quoteNumber}</h3>
                            <p className="text-sm text-gray-600">{quote.customerName} - {quote.customerPhone}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Ngày tạo</p>
                            <p className="font-medium text-gray-900">{new Date(quote.quoteDate).toLocaleDateString('vi-VN')}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Tổng tiền</p>
                            <p className="font-medium text-gray-900">{quote.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
                          </div>
                          <div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                              {getStatusText(quote.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {quote.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleConvertToOrder(quote.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Chuyển thành đơn hàng
                            </button>
                            <button
                              onClick={() => handleDeleteQuote(quote.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              Xóa báo giá
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {quote.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Ghi chú:</strong> {quote.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có báo giá nào</h3>
                <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo báo giá mới.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Biểu đồ doanh số</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
          <div className="text-center">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-500 font-medium">Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DealerStaffDashboard;