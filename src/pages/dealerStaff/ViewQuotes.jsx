import { useState, useEffect } from 'react';

function ViewQuotes({ onBack }) {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Mock data - trong thực tế sẽ lấy từ API
  const mockQuotes = [
    {
      id: 1,
      quoteNumber: 'BQ-001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0123456789',
      customerEmail: 'nguyenvana@email.com',
      quoteDate: '2024-01-15',
      status: 'draft',
      totalAmount: 320000000,
      items: [
        { name: 'Electra Ascent', quantity: 1, unitPrice: 320000000, total: 320000000 }
      ],
      notes: 'Khách hàng quan tâm đến mẫu xe này'
    },
    {
      id: 2,
      quoteNumber: 'BQ-002',
      customerName: 'Trần Thị B',
      customerPhone: '0987654321',
      customerEmail: 'tranthib@email.com',
      quoteDate: '2024-01-16',
      status: 'pending',
      totalAmount: 450000000,
      items: [
        { name: 'Electra GrandTour', quantity: 1, unitPrice: 450000000, total: 450000000 }
      ],
      notes: 'Đã chuyển thành đơn hàng chờ duyệt'
    },
    {
      id: 3,
      quoteNumber: 'BQ-003',
      customerName: 'Lê Văn C',
      customerPhone: '0111222333',
      customerEmail: 'levanc@email.com',
      quoteDate: '2024-01-17',
      status: 'approved',
      totalAmount: 280000000,
      items: [
        { name: 'Electra CityLink', quantity: 1, unitPrice: 280000000, total: 280000000 }
      ],
      notes: 'Báo giá đã được duyệt'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setQuotes(mockQuotes);
    setFilteredQuotes(mockQuotes);
  }, []);

  useEffect(() => {
    let filtered = quotes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.customerPhone.includes(searchTerm)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    setFilteredQuotes(filtered);
  }, [searchTerm, statusFilter, quotes]);

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

  const handleViewDetails = (quote) => {
    setSelectedQuote(quote);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedQuote(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quản lý báo giá</h2>
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm theo tên khách hàng, mã báo giá, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>
        </div>

        {/* Quotes Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã báo giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {quote.quoteNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{quote.customerName}</div>
                    <div className="text-sm text-gray-500">{quote.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(quote.quoteDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                      {getStatusText(quote.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quote.totalAmount.toLocaleString('vi-VN')} VNĐ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(quote)}
                      className="text-emerald-600 hover:text-emerald-900 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có báo giá nào</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Không tìm thấy báo giá phù hợp với bộ lọc.' 
                : 'Bắt đầu bằng cách tạo báo giá mới.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal for Quote Details */}
      {showModal && selectedQuote && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Chi tiết báo giá - {selectedQuote.quoteNumber}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên khách hàng</label>
                    <p className="text-sm text-gray-900">{selectedQuote.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                    <p className="text-sm text-gray-900">{selectedQuote.customerPhone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedQuote.customerEmail}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                    <p className="text-sm text-gray-900">{new Date(selectedQuote.quoteDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>

              {/* Quote Items */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Chi tiết sản phẩm</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Sản phẩm</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Số lượng</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Đơn giá</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-700">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuote.items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="py-2 text-sm text-gray-900">{item.unitPrice.toLocaleString('vi-VN')} VNĐ</td>
                          <td className="py-2 text-sm text-gray-900">{item.total.toLocaleString('vi-VN')} VNĐ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Quote Summary */}
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Tổng tiền:</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {selectedQuote.totalAmount.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedQuote.status)}`}>
                    {getStatusText(selectedQuote.status)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedQuote.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Ghi chú</h4>
                  <p className="text-sm text-gray-700">{selectedQuote.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
                {selectedQuote.status === 'draft' && (
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Chuyển thành đơn hàng
                  </button>
                )}
                <button
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  In báo giá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewQuotes;
