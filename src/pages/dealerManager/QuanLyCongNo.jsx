import { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

function QuanLyCongNo() {
  const { toast, success, showError, hideToast } = useToast();
  const { confirm, showConfirm, hideConfirm } = useConfirm();
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
    success('Công nợ đã được thêm thành công!');
  };

  const handlePayment = (debt) => {
    setSelectedDebt(debt);
    setShowPaymentModal(true);
  };

  const handleSendReminder = (debtId) => {
    console.log('Sending reminder for debt:', debtId);
    success('Đã gửi thông báo nhắc nở đến khách hàng!');
  };

  const handleExportReport = async () => {
    try {
      const exportData = filteredDebts.map((debt, index) => ({
        stt: index + 1,
        khachHang: debt.customerName,
        soDienThoai: debt.customerPhone,
        email: debt.customerEmail,
        soTienNo: debt.amount,
        soTienGoc: debt.originalAmount,
        daThanhToan: debt.originalAmount - debt.amount,
        ngayTao: formatDate(debt.createdDate),
        ngayDenHan: formatDate(debt.dueDate),
        soNgayQuaHan: debt.daysOverdue > 0 ? debt.daysOverdue : 0,
        trangThai: getStatusText(debt.status),
        moTa: debt.description,
      }));

      const summaryData = [
        { thongKe: 'Tổng số khoản nợ', giaTri: debts.length },
        { thongKe: 'Tổng công nợ (VNĐ)', giaTri: totalDebt },
        { thongKe: 'Số khoản quá hạn', giaTri: overdueDebts.length },
        { thongKe: 'Số khoản nghiêm trọng', giaTri: criticalDebts.length },
        { thongKe: 'Ngày xuất báo cáo', giaTri: new Date().toLocaleString('vi-VN') },
      ];

      const workbook = new ExcelJS.Workbook();

      // Sheet 1: Tổng quan
      const summarySheet = workbook.addWorksheet('Tổng quan');
      summarySheet.columns = [
        { header: 'Thống kê', key: 'thongKe', width: 25 },
        { header: 'Giá trị', key: 'giaTri', width: 25 },
      ];
      summarySheet.addRows(summaryData);

      // Sheet 2: Chi tiết công nợ
      const detailsSheet = workbook.addWorksheet('Chi tiết công nợ');
      detailsSheet.columns = [
        { header: 'STT', key: 'stt', width: 5 },
        { header: 'Khách hàng', key: 'khachHang', width: 25 },
        { header: 'Số điện thoại', key: 'soDienThoai', width: 15 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Số tiền nợ (VNĐ)', key: 'soTienNo', width: 18 },
        { header: 'Số tiền gốc (VNĐ)', key: 'soTienGoc', width: 18 },
        { header: 'Đã thanh toán (VNĐ)', key: 'daThanhToan', width: 20 },
        { header: 'Ngày tạo', key: 'ngayTao', width: 12 },
        { header: 'Ngày đến hạn', key: 'ngayDenHan', width: 12 },
        { header: 'Số ngày quá hạn', key: 'soNgayQuaHan', width: 15 },
        { header: 'Trạng thái', key: 'trangThai', width: 15 },
        { header: 'Mô tả', key: 'moTa', width: 40 },
      ];
      detailsSheet.addRows(exportData);

      // Sheet 3: Lịch sử thanh toán
      const paymentHistory = [];
      debts.forEach(debt => {
        debt.paymentHistory.forEach(payment => {
          paymentHistory.push({
            khachHang: debt.customerName,
            ngayThanhToan: payment.date,
            soTien: payment.amount,
            ghiChu: payment.note,
          });
        });
      });
      if (paymentHistory.length > 0) {
        const paymentSheet = workbook.addWorksheet('Lịch sử thanh toán');
        paymentSheet.columns = [
          { header: 'Khách hàng', key: 'khachHang', width: 25 },
          { header: 'Ngày thanh toán', key: 'ngayThanhToan', width: 15 },
          { header: 'Số tiền (VNĐ)', key: 'soTien', width: 18 },
          { header: 'Ghi chú', key: 'ghiChu', width: 40 },
        ];
        paymentSheet.addRows(paymentHistory);
      }

      // Sheet 4: Phân loại theo trạng thái
      const statusBreakdown = [
        { trangThai: 'Bình thường', soLuong: debts.filter(d => d.status === 'normal').length, tongNo: debts.filter(d => d.status === 'normal').reduce((sum, d) => sum + d.amount, 0) },
        { trangThai: 'Cảnh báo', soLuong: debts.filter(d => d.status === 'warning').length, tongNo: debts.filter(d => d.status === 'warning').reduce((sum, d) => sum + d.amount, 0) },
        { trangThai: 'Quá hạn', soLuong: debts.filter(d => d.status === 'overdue').length, tongNo: debts.filter(d => d.status === 'overdue').reduce((sum, d) => sum + d.amount, 0) },
        { trangThai: 'Nghiêm trọng', soLuong: debts.filter(d => d.status === 'critical').length, tongNo: debts.filter(d => d.status === 'critical').reduce((sum, d) => sum + d.amount, 0) },
      ];
      const statusSheet = workbook.addWorksheet('Phân loại trạng thái');
      statusSheet.columns = [
        { header: 'Trạng thái', key: 'trangThai', width: 20 },
        { header: 'Số lượng', key: 'soLuong', width: 12 },
        { header: 'Tổng nợ (VNĐ)', key: 'tongNo', width: 18 },
      ];
      statusSheet.addRows(statusBreakdown);

      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const fileName = `BaoCaoCongNo_${timestamp}.xlsx`;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, fileName);
      success(`Đã xuất báo cáo thành công!\nFile: ${fileName}`);
    } catch (error) {
      console.error('Lỗi khi xuất báo cáo:', error);
      showError('Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại!');
    }
  };

  return (
    <div>
      {/* Toast Notifications */}
      <Toast 
        show={toast.show} 
        type={toast.type} 
        message={toast.message} 
        onClose={hideToast}
      />
      
      {/* Confirm Dialog */}
      <ConfirmDialog
        show={confirm.show}
        title={confirm.title}
        message={confirm.message}
        type={confirm.type}
        confirmText={confirm.confirmText}
        cancelText={confirm.cancelText}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
      />

      <div className="max-w-7xl mx-auto p-4">
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
              <h1 className="text-2xl font-bold text-gray-900">Quản lý công nợ</h1>
              <p className="text-gray-600">Theo dõi và quản lý công nợ khách hàng</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <motion.button
              onClick={() => setShowAddModal(true)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 shadow-md hover:shadow-xl transition-all flex items-center gap-2"
            >
              <motion.svg 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </motion.svg>
              Thêm công nợ
            </motion.button>
            <motion.button
              onClick={handleExportReport}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md hover:shadow-xl transition-all flex items-center gap-2"
            >
              <motion.svg 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                whileHover={{ y: 2 }}
                transition={{ duration: 0.3 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </motion.svg>
              Xuất báo cáo
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b mb-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
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

            <div className="bg-white rounded-lg shadow p-4">
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

            <div className="bg-white rounded-lg shadow p-4">
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

            <div className="bg-white rounded-lg shadow p-4">
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
          <div className="bg-white rounded-lg shadow p-4">
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền nợ
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày đến hạn
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDebts.map((debt) => (
                    <tr key={debt.id}>
                      <td className="px-3 py-2.5 whitespace-nowrap">
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
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(debt.amount)}</div>
                        <div className="text-sm text-gray-500">
                          Gốc: {formatCurrency(debt.originalAmount)}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(debt.dueDate)}</div>
                        {debt.daysOverdue > 0 && (
                          <div className="text-sm text-red-600">Quá hạn {debt.daysOverdue} ngày</div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(debt.status)}`}>
                          {getStatusText(debt.status)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => handlePayment(debt)}
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow hover:shadow-md transition-all text-sm"
                          >
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              Thanh toán
                            </span>
                          </motion.button>
                          <motion.button
                            onClick={() => handleSendReminder(debt.id)}
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 shadow hover:shadow-md transition-all text-sm"
                          >
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                              Nhắc nở
                            </span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow hover:shadow-md transition-all text-sm"
                          >
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Chi tiết
                            </span>
                          </motion.button>
                        </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Debt by Status Chart */}
            <div className="bg-white rounded-lg shadow p-4">
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
            <div className="bg-white rounded-lg shadow p-4">
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
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-4 border shadow-2xl rounded-lg bg-white max-h-[90vh] overflow-y-auto"
            >
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
                  <motion.button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 shadow-md transition-colors"
                  >
                    Thêm
                  </motion.button>
                </div>
              </form>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedDebt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-4 border shadow-2xl rounded-lg bg-white"
            >
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
                  <motion.button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md transition-colors"
                  >
                    Ghi nhận
                  </motion.button>
                </div>
              </form>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

export default QuanLyCongNo;
