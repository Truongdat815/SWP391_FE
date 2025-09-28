import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SalesQuoteManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');

  const [quotes, setQuotes] = useState([
    {
      id: 'BG001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0901234567',
      vehicle: 'VinFast VF8 Plus',
      totalAmount: 1200000000,
      status: 'pending',
      createdDate: '2024-01-10',
      validUntil: '2024-01-25',
      salesStaff: 'Trần Thị B'
    },
    {
      id: 'BG002',
      customerName: 'Lê Văn C',
      customerPhone: '0907654321',
      vehicle: 'VinFast VF7 Eco',
      totalAmount: 850000000,
      status: 'approved',
      createdDate: '2024-01-08',
      validUntil: '2024-01-22',
      salesStaff: 'Phạm Văn D'
    },
    {
      id: 'BG003',
      customerName: 'Trần Thị E',
      customerPhone: '0912345678',
      vehicle: 'VinFast VF9 Plus',
      totalAmount: 1680000000,
      status: 'converted',
      createdDate: '2024-01-05',
      validUntil: '2024-01-20',
      salesStaff: 'Nguyễn Văn F'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ phản hồi';
      case 'approved': return 'Đã chấp nhận';
      case 'converted': return 'Đã chuyển đổi';
      case 'expired': return 'Hết hạn';
      case 'rejected': return 'Bị từ chối';
      default: return status;
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const matchesStatus = !filterStatus || quote.status === filterStatus;
    const matchesSearch = !searchTerm || 
      quote.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const updateQuoteStatus = (id, newStatus) => {
    setQuotes(prev => prev.map(quote => 
      quote.id === id ? { ...quote, status: newStatus } : quote
    ));
  };

  const deleteQuote = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa báo giá này?')) {
      setQuotes(prev => prev.filter(quote => quote.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard/dealer-staff')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Quản Lý Báo Giá</h1>
                <p className="text-sm text-gray-500">Tạo và quản lý các báo giá cho khách hàng</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard/dealer-staff/create-quote')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Tạo báo giá mới
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Danh sách báo giá
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Thống kê
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'list' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng báo giá</p>
                    <p className="text-2xl font-semibold text-gray-900">{quotes.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chờ phản hồi</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {quotes.filter(q => q.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã chuyển đổi</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {quotes.filter(q => q.status === 'converted').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tỷ lệ chuyển đổi</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'converted').length / quotes.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-lg font-medium text-gray-900">Danh sách báo giá</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên khách hàng hoặc mã báo giá..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="pending">Chờ phản hồi</option>
                      <option value="approved">Đã chấp nhận</option>
                      <option value="converted">Đã chuyển đổi</option>
                      <option value="expired">Hết hạn</option>
                      <option value="rejected">Bị từ chối</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quote List */}
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
                        Xe
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hết hạn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredQuotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quote.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{quote.customerName}</div>
                            <div className="text-sm text-gray-500">{quote.customerPhone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {quote.vehicle}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {quote.totalAmount.toLocaleString()} VNĐ
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                            {getStatusText(quote.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(quote.createdDate).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(quote.validUntil).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              Xem
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              Sửa
                            </button>
                            {quote.status === 'pending' && (
                              <button 
                                onClick={() => updateQuoteStatus(quote.id, 'approved')}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Duyệt
                              </button>
                            )}
                            {quote.status === 'approved' && (
                              <button 
                                onClick={() => updateQuoteStatus(quote.id, 'converted')}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Chuyển đổi
                              </button>
                            )}
                            <button 
                              onClick={() => deleteQuote(quote.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredQuotes.length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Không tìm thấy báo giá nào</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Monthly Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê theo tháng</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                  <div className="text-sm text-gray-600">Báo giá tháng này</div>
                  <div className="text-xs text-green-600">+15% so với tháng trước</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">8</div>
                  <div className="text-sm text-gray-600">Đã chuyển đổi</div>
                  <div className="text-xs text-green-600">+12% so với tháng trước</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">33%</div>
                  <div className="text-sm text-gray-600">Tỷ lệ chuyển đổi</div>
                  <div className="text-xs text-red-600">-2% so với tháng trước</div>
                </div>
              </div>
            </div>

            {/* Top Vehicles */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Xe được báo giá nhiều nhất</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-red-600">1</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">VinFast VF8</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">12 báo giá</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-red-600">2</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">VinFast VF7</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">8 báo giá</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-red-600">3</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">VinFast VF9</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">6 báo giá</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance by Staff */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hiệu suất nhân viên</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nhân viên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Số báo giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Đã chuyển đổi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tỷ lệ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tổng giá trị
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Trần Thị B
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">8</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">37.5%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">3.2 tỷ VNĐ</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Phạm Văn D
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">6</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">33.3%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2.1 tỷ VNĐ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesQuoteManagement;