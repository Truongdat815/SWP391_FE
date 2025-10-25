import { useState } from 'react';
import * as XLSX from 'xlsx';

function QuanLyCongNo() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const [newDebt, setNewDebt] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    amount: '',
    dueDate: '',
    description: ''
  });

  const debts = [
    {
      id: 1,
      customerName: 'Công ty TNHH ABC',
      customerPhone: '0901234567',
      customerEmail: 'contact@abc.com',
      amount: 500000000,
      originalAmount: 500000000,
      dueDate: '2024-01-15',
      createdDate: '2023-12-01',
      status: 'overdue',
      daysOverdue: 25,
      description: 'Mua xe Electra Ascent - Đơn hàng #EV001',
      paymentHistory: [
        { date: '2023-12-15', amount: 0, note: 'Chưa thanh toán' }
      ]
    },
    {
      id: 2,
      customerName: 'Ông Nguyễn Văn X',
      customerPhone: '0901234568',
      customerEmail: 'nguyenvanx@email.com',
      amount: 200000000,
      originalAmount: 300000000,
      dueDate: '2024-02-10',
      createdDate: '2024-01-10',
      status: 'warning',
      daysOverdue: 8,
      description: 'Mua xe Electra CityLink - Đơn hàng #EV002',
      paymentHistory: [
        { date: '2024-01-25', amount: 100000000, note: 'Thanh toán một phần' }
      ]
    },
    {
      id: 3,
      customerName: 'Chị Trần Thị Y',
      customerPhone: '0901234569',
      customerEmail: 'tranthiy@email.com',
      amount: 800000000,
      originalAmount: 800000000,
      dueDate: '2024-03-20',
      createdDate: '2024-02-20',
      status: 'critical',
      daysOverdue: 35,
      description: 'Mua xe Electra GrandTour - Đơn hàng #EV003',
      paymentHistory: [
        { date: '2024-02-20', amount: 0, note: 'Chưa thanh toán' }
      ]
    },
    {
      id: 4,
      customerName: 'Công ty XYZ Ltd',
      customerPhone: '0901234570',
      customerEmail: 'info@xyz.com',
      amount: 150000000,
      originalAmount: 600000000,
      dueDate: '2024-04-05',
      createdDate: '2024-03-05',
      status: 'normal',
      daysOverdue: 0,
      description: 'Mua 2 xe Electra Summit - Đơn hàng #EV004',
      paymentHistory: [
        { date: '2024-03-15', amount: 300000000, note: 'Thanh toán 50%' },
        { date: '2024-03-25', amount: 150000000, note: 'Thanh toán thêm 25%' }
      ]
    }
  ];

  const statusOptions = [
    { id: 'all', name: 'Tất cả trạng thái' },
    { id: 'normal', name: 'Bình thường' },
    { id: 'warning', name: 'Cảnh báo' },
    { id: 'overdue', name: 'Quá hạn' },
    { id: 'critical', name: 'Nghiêm trọng' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-orange-100 text-orange-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'critical': return 'Nghiêm trọng';
      case 'overdue': return 'Quá hạn';
      case 'warning': return 'Cảnh báo';
      case 'normal': return 'Bình thường';
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || debt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);
  const overdueDebts = debts.filter(debt => debt.status === 'overdue' || debt.status === 'critical');
  const criticalDebts = debts.filter(debt => debt.status === 'critical');

  const handleAddDebt = (e) => {
    e.preventDefault();
    console.log('Adding debt:', newDebt);
    setShowAddModal(false);
    setNewDebt({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      amount: '',
      dueDate: '',
      description: ''
    });
    alert('Công nợ đã được thêm thành công!');
  };

  const handlePayment = (debt) => {
    setSelectedDebt(debt);
    setShowPaymentModal(true);
  };

  const handleSendReminder = (debtId) => {
    console.log('Sending reminder for debt:', debtId);
    alert('Đã gửi thông báo nhắc nở đến khách hàng!');
  };

  const handleExportReport = () => {
    try {
      // Chuẩn bị dữ liệu cho Excel
      const exportData = filteredDebts.map((debt, index) => ({
        'STT': index + 1,
        'Khách hàng': debt.customerName,
        'Số điện thoại': debt.customerPhone,
        'Email': debt.customerEmail,
        'Số tiền nợ (VNĐ)': debt.amount,
        'Số tiền gốc (VNĐ)': debt.originalAmount,
        'Đã thanh toán (VNĐ)': debt.originalAmount - debt.amount,
        'Ngày tạo': formatDate(debt.createdDate),
        'Ngày đến hạn': formatDate(debt.dueDate),
        'Số ngày quá hạn': debt.daysOverdue > 0 ? debt.daysOverdue : 0,
        'Trạng thái': getStatusText(debt.status),
        'Mô tả': debt.description,
      }));

      // Thêm thống kê tổng quan
      const summaryData = [
        { 'Thống kê': 'Tổng số khoản nợ', 'Giá trị': debts.length },
        { 'Thống kê': 'Tổng công nợ (VNĐ)', 'Giá trị': totalDebt },
        { 'Thống kê': 'Số khoản quá hạn', 'Giá trị': overdueDebts.length },
        { 'Thống kê': 'Số khoản nghiêm trọng', 'Giá trị': criticalDebts.length },
        { 'Thống kê': 'Ngày xuất báo cáo', 'Giá trị': new Date().toLocaleString('vi-VN') },
      ];

      // Tạo workbook
      const wb = XLSX.utils.book_new();

      // Sheet 1: Tổng quan
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng quan');

      // Sheet 2: Chi tiết công nợ
      const wsDetails = XLSX.utils.json_to_sheet(exportData);
      
      // Thiết lập độ rộng cột
      const colWidths = [
        { wch: 5 },  // STT
        { wch: 25 }, // Khách hàng
        { wch: 15 }, // SĐT
        { wch: 30 }, // Email
        { wch: 18 }, // Số tiền nợ
        { wch: 18 }, // Số tiền gốc
        { wch: 20 }, // Đã thanh toán
        { wch: 12 }, // Ngày tạo
        { wch: 12 }, // Ngày đến hạn
        { wch: 15 }, // Số ngày quá hạn
        { wch: 15 }, // Trạng thái
        { wch: 40 }, // Mô tả
      ];
      wsDetails['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, wsDetails, 'Chi tiết công nợ');

      // Sheet 3: Lịch sử thanh toán
      const paymentHistory = [];
      debts.forEach(debt => {
        debt.paymentHistory.forEach(payment => {
          paymentHistory.push({
            'Khách hàng': debt.customerName,
            'Ngày thanh toán': payment.date,
            'Số tiền (VNĐ)': payment.amount,
            'Ghi chú': payment.note,
          });
        });
      });
      
      if (paymentHistory.length > 0) {
        const wsPayment = XLSX.utils.json_to_sheet(paymentHistory);
        wsPayment['!cols'] = [
          { wch: 25 }, // Khách hàng
          { wch: 15 }, // Ngày
          { wch: 18 }, // Số tiền
          { wch: 40 }, // Ghi chú
        ];
        XLSX.utils.book_append_sheet(wb, wsPayment, 'Lịch sử thanh toán');
      }

      // Sheet 4: Phân loại theo trạng thái
      const statusBreakdown = [
        { 'Trạng thái': 'Bình thường', 'Số lượng': debts.filter(d => d.status === 'normal').length, 'Tổng nợ (VNĐ)': debts.filter(d => d.status === 'normal').reduce((sum, d) => sum + d.amount, 0) },
        { 'Trạng thái': 'Cảnh báo', 'Số lượng': debts.filter(d => d.status === 'warning').length, 'Tổng nợ (VNĐ)': debts.filter(d => d.status === 'warning').reduce((sum, d) => sum + d.amount, 0) },
        { 'Trạng thái': 'Quá hạn', 'Số lượng': debts.filter(d => d.status === 'overdue').length, 'Tổng nợ (VNĐ)': debts.filter(d => d.status === 'overdue').reduce((sum, d) => sum + d.amount, 0) },
        { 'Trạng thái': 'Nghiêm trọng', 'Số lượng': debts.filter(d => d.status === 'critical').length, 'Tổng nợ (VNĐ)': debts.filter(d => d.status === 'critical').reduce((sum, d) => sum + d.amount, 0) },
      ];
      const wsStatus = XLSX.utils.json_to_sheet(statusBreakdown);
      wsStatus['!cols'] = [
        { wch: 20 }, // Trạng thái
        { wch: 12 }, // Số lượng
        { wch: 18 }, // Tổng nợ
      ];
      XLSX.utils.book_append_sheet(wb, wsStatus, 'Phân loại trạng thái');

      // Tạo tên file với timestamp
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const fileName = `BaoCaoCongNo_${timestamp}.xlsx`;

      // Xuất file
      XLSX.writeFile(wb, fileName);
      
      alert(`Đã xuất báo cáo thành công!\nFile: ${fileName}`);
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      alert('Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg mr-4">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý công nợ</h1>
              <p className="text-gray-600">Theo dõi và quản lý công nợ khách hàng</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm công nợ
            </button>
            <button
              onClick={handleExportReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Danh sách công nợ
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Phân tích
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng công nợ</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(totalDebt)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Công nợ quá hạn</p>
                  <p className="text-2xl font-semibold text-gray-900">{overdueDebts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nghiêm trọng</p>
                  <p className="text-2xl font-semibold text-gray-900">{criticalDebts.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng khách hàng</p>
                  <p className="text-2xl font-semibold text-gray-900">{debts.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Debts Alert */}
          {criticalDebts.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <svg className="h-6 w-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-red-800">Cảnh báo công nợ nghiêm trọng</h3>
              </div>
              <div className="space-y-3">
                {criticalDebts.map((debt) => (
                  <div key={debt.id} className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{debt.customerName}</p>
                      <p className="text-sm text-gray-600">Quá hạn {debt.daysOverdue} ngày - {formatCurrency(debt.amount)}</p>
                    </div>
                    <button
                      onClick={() => handleSendReminder(debt.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                    >
                      Nhắc nở
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List Tab */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên khách hàng..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  {statusOptions.map(status => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                  Lọc nâng cao
                </button>
              </div>
            </div>
          </div>

          {/* Debt List */}
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền nợ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đến hạn
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDebts.map((debt) => (
                    <tr key={debt.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-300 rounded-full mr-4 flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">
                              {debt.customerName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{debt.customerName}</div>
                            <div className="text-sm text-gray-500">{debt.customerPhone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(debt.amount)}</div>
                        <div className="text-sm text-gray-500">
                          Gốc: {formatCurrency(debt.originalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(debt.dueDate)}</div>
                        {debt.daysOverdue > 0 && (
                          <div className="text-sm text-red-600">Quá hạn {debt.daysOverdue} ngày</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(debt.status)}`}>
                          {getStatusText(debt.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handlePayment(debt)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Thanh toán
                        </button>
                        <button
                          onClick={() => handleSendReminder(debt.id)}
                          className="text-yellow-600 hover:text-yellow-900 mr-3"
                        >
                          Nhắc nở
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debt by Status Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Phân bố công nợ theo trạng thái</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Bình thường</span>
                  </div>
                  <span className="text-sm font-medium">1 khoản</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Cảnh báo</span>
                  </div>
                  <span className="text-sm font-medium">1 khoản</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Quá hạn</span>
                  </div>
                  <span className="text-sm font-medium">1 khoản</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
                    <span className="text-sm text-gray-600">Nghiêm trọng</span>
                  </div>
                  <span className="text-sm font-medium">1 khoản</span>
                </div>
              </div>
            </div>

            {/* Payment Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Xu hướng thanh toán</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-500">Biểu đồ xu hướng thanh toán</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm công nợ mới</h3>
              <form onSubmit={handleAddDebt} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                  <input
                    type="text"
                    value={newDebt.customerName}
                    onChange={(e) => setNewDebt({...newDebt, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={newDebt.customerPhone}
                    onChange={(e) => setNewDebt({...newDebt, customerPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newDebt.customerEmail}
                    onChange={(e) => setNewDebt({...newDebt, customerEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền nợ</label>
                  <input
                    type="number"
                    value={newDebt.amount}
                    onChange={(e) => setNewDebt({...newDebt, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đến hạn</label>
                  <input
                    type="date"
                    value={newDebt.dueDate}
                    onChange={(e) => setNewDebt({...newDebt, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={newDebt.description}
                    onChange={(e) => setNewDebt({...newDebt, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                  >
                    Thêm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedDebt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ghi nhận thanh toán</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600">Khách hàng: <span className="font-medium">{selectedDebt.customerName}</span></p>
                <p className="text-sm text-gray-600">Số tiền nợ: <span className="font-medium text-red-600">{formatCurrency(selectedDebt.amount)}</span></p>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thanh toán</label>
                  <input
                    type="number"
                    max={selectedDebt.amount}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
                    <option value="cash">Tiền mặt</option>
                    <option value="transfer">Chuyển khoản</option>
                    <option value="card">Thẻ tín dụng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ghi chú về khoản thanh toán..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Ghi nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuanLyCongNo;
