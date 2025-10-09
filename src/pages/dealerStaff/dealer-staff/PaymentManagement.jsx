import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function PaymentManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('pending');
  
  // Nhận thông tin hợp đồng từ CreateContract nếu có
  const contractData = location.state?.contractData;

  const [payments, setPayments] = useState([
    {
      id: 'TT001',
      orderId: 'DH001',
      customerName: 'Nguyễn Văn A',
      customerPhone: '0901234567',
      vehicle: 'Electra Ascent',
      totalAmount: 1200000000,
      paidAmount: 200000000,
      remainingAmount: 1000000000,
      paymentMethod: 'installment',
      installmentPlan: '36 tháng',
      monthlyPayment: 31000000,
      dueDate: '2024-02-15',
      status: 'pending',
      lastPaymentDate: '2024-01-15',
      nextPaymentDate: '2024-02-15'
    },
    {
      id: 'TT002',
      orderId: 'DH002',
      customerName: 'Lê Văn C',
      customerPhone: '0907654321',
      vehicle: 'Electra CityLink',
      totalAmount: 850000000,
      paidAmount: 850000000,
      remainingAmount: 0,
      paymentMethod: 'bank_transfer',
      dueDate: '2024-01-20',
      status: 'completed',
      lastPaymentDate: '2024-01-20',
      completedDate: '2024-01-20'
    },
    {
      id: 'TT003',
      orderId: 'DH003',
      customerName: 'Trần Thị E',
      customerPhone: '0912345678',
      vehicle: 'Electra Summit',
      totalAmount: 1680000000,
      paidAmount: 1680000000,
      remainingAmount: 0,
      paymentMethod: 'cash',
      status: 'completed',
      lastPaymentDate: '2024-01-05',
      completedDate: '2024-01-05'
    },
    {
      id: 'TT004',
      orderId: 'DH004',
      customerName: 'Hoàng Văn G',
      customerPhone: '0908765432',
      vehicle: 'Electra Micro',
      totalAmount: 750000000,
      paidAmount: 100000000,
      remainingAmount: 650000000,
      paymentMethod: 'installment',
      installmentPlan: '48 tháng',
      monthlyPayment: 15000000,
      dueDate: '2024-02-10',
      status: 'overdue',
      lastPaymentDate: '2024-01-12',
      nextPaymentDate: '2024-02-10'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [newPaymentData, setNewPaymentData] = useState({
    customerName: '',
    customerPhone: '',
    vehicle: '',
    totalAmount: '',
    paymentMethod: '',
    depositAmount: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ thanh toán';
      case 'completed': return 'Đã hoàn thành';
      case 'overdue': return 'Quá hạn';
      case 'partial': return 'Thanh toán một phần';
      default: return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash': return 'Tiền mặt';
      case 'bank_transfer': return 'Chuyển khoản';
      case 'installment': return 'Trả góp';
      case 'lease': return 'Thuê tài chính';
      default: return method;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesTab = activeTab === 'all' || payment.status === activeTab;
    const matchesSearch = !searchTerm || 
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const statusCounts = {
    all: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    overdue: payments.filter(p => p.status === 'overdue').length,
    partial: payments.filter(p => p.status === 'partial').length,
    completed: payments.filter(p => p.status === 'completed').length
  };

  const recordPayment = (paymentId, amount) => {
    setPayments(prev => prev.map(payment => {
      if (payment.id === paymentId) {
        const newPaidAmount = payment.paidAmount + parseInt(amount);
        const newRemainingAmount = payment.totalAmount - newPaidAmount;
        const newStatus = newRemainingAmount <= 0 ? 'completed' : 
                         newPaidAmount > payment.paidAmount ? 'partial' : payment.status;
        
        return {
          ...payment,
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: newStatus,
          lastPaymentDate: new Date().toISOString().split('T')[0],
          ...(newStatus === 'completed' && { completedDate: new Date().toISOString().split('T')[0] })
        };
      }
      return payment;
    }));
    
    setShowPaymentModal(false);
    setPaymentAmount('');
    setSelectedPayment(null);
  };

  // Xử lý dữ liệu hợp đồng từ CreateContract
  useEffect(() => {
    if (contractData) {
      setShowCreatePaymentModal(true);
      setNewPaymentData({
        customerName: contractData.customerName || '',
        customerPhone: contractData.customerPhone || '',
        vehicle: contractData.vehicleModel || '',
        totalAmount: contractData.vehiclePrice || '',
        paymentMethod: contractData.paymentMethod || '',
        depositAmount: contractData.depositAmount || ''
      });
    }
  }, [contractData]);

  const generatePaymentSchedule = (payment) => {
    if (payment.paymentMethod !== 'installment') return [];
    
    const months = parseInt(payment.installmentPlan.split(' ')[0]);
    const schedule = [];
    const startDate = new Date(payment.lastPaymentDate);
    
    for (let i = 1; i <= months; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + i);
      
      schedule.push({
        installment: i,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: payment.monthlyPayment,
        status: i === 1 ? 'current' : 'upcoming'
      });
    }
    
    return schedule;
  };

  const createNewPayment = () => {
    if (!newPaymentData.customerName || !newPaymentData.vehicle || !newPaymentData.totalAmount) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const totalAmount = parseInt(newPaymentData.totalAmount);
    const depositAmount = parseInt(newPaymentData.depositAmount) || 0;
    const remainingAmount = totalAmount - depositAmount;
    
    const newPayment = {
      id: `TT${String(payments.length + 1).padStart(3, '0')}`,
      orderId: `DH${String(payments.length + 1).padStart(3, '0')}`,
      customerName: newPaymentData.customerName,
      customerPhone: newPaymentData.customerPhone,
      vehicle: newPaymentData.vehicle,
      totalAmount: totalAmount,
      paidAmount: depositAmount,
      remainingAmount: remainingAmount,
      paymentMethod: newPaymentData.paymentMethod,
      ...(newPaymentData.paymentMethod === 'installment' && {
        installmentPlan: '36 tháng',
        monthlyPayment: Math.round(remainingAmount / 36),
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }),
      status: depositAmount >= totalAmount ? 'completed' : (depositAmount > 0 ? 'partial' : 'pending'),
      lastPaymentDate: depositAmount > 0 ? new Date().toISOString().split('T')[0] : '',
      ...(depositAmount >= totalAmount && { completedDate: new Date().toISOString().split('T')[0] })
    };

    setPayments([newPayment, ...payments]);
    setShowCreatePaymentModal(false);
    setNewPaymentData({
      customerName: '',
      customerPhone: '',
      vehicle: '',
      totalAmount: '',
      paymentMethod: '',
      depositAmount: ''
    });
    alert('Tạo thanh toán thành công!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dealer-staff')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Quản Lý Thanh Toán</h1>
                <p className="text-sm text-gray-500">Theo dõi thanh toán và công nợ khách hàng</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreatePaymentModal(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tạo thanh toán mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {payments.reduce((sum, p) => sum + p.totalAmount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Tổng doanh thu (VNĐ)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {payments.reduce((sum, p) => sum + p.paidAmount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Đã thu (VNĐ)</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {payments.reduce((sum, p) => sum + p.remainingAmount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Còn nợ (VNĐ)</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{statusCounts.overdue}</div>
              <div className="text-sm text-gray-600">Quá hạn</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'pending', name: 'Chờ thanh toán', count: statusCounts.pending },
              { id: 'overdue', name: 'Quá hạn', count: statusCounts.overdue },
              { id: 'partial', name: 'Một phần', count: statusCounts.partial },
              { id: 'completed', name: 'Hoàn thành', count: statusCounts.completed },
              { id: 'all', name: 'Tất cả', count: statusCounts.all }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Payment List */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Danh sách thanh toán</h3>
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <div 
                    key={payment.id} 
                    className={`p-6 cursor-pointer transition ${
                      selectedPayment?.id === payment.id ? 'bg-red-50 border-l-4 border-red-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <h4 className="text-lg font-semibold text-gray-900 mr-3">
                          {payment.id} / {payment.orderId}
                        </h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.paidAmount.toLocaleString()} / {payment.totalAmount.toLocaleString()} VNĐ
                        </div>
                        <div className="text-xs text-gray-500">
                          Còn lại: {payment.remainingAmount.toLocaleString()} VNĐ
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600 mb-1">Khách hàng:</div>
                        <div className="font-medium text-gray-900">{payment.customerName}</div>
                        <div className="text-gray-500">{payment.customerPhone}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-1">Xe:</div>
                        <div className="font-medium text-gray-900">{payment.vehicle}</div>
                        <div className="text-gray-500">{getPaymentMethodText(payment.paymentMethod)}</div>
                      </div>
                    </div>

                    {payment.paymentMethod === 'installment' && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Trả góp hàng tháng:</span>
                          <span className="font-medium">{payment.monthlyPayment.toLocaleString()} VNĐ</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Kỳ hạn thanh toán tiếp theo:</span>
                          <span className="font-medium text-red-600">
                            {new Date(payment.nextPaymentDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Thanh toán cuối: {new Date(payment.lastPaymentDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex space-x-2">
                        {payment.status !== 'completed' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayment(payment);
                              setShowPaymentModal(true);
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Ghi nhận thanh toán
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle print invoice
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          In hóa đơn
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Tiến độ thanh toán</span>
                        <span>{Math.round((payment.paidAmount / payment.totalAmount) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            payment.status === 'completed' ? 'bg-green-600' : 
                            payment.status === 'overdue' ? 'bg-red-600' : 'bg-blue-600'
                          }`}
                          style={{ width: `${(payment.paidAmount / payment.totalAmount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPayments.length === 0 && (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">Không tìm thấy thanh toán nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {selectedPayment && (
            <div className="w-80">
              <div className="bg-white rounded-lg shadow sticky top-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Chi tiết thanh toán</h3>
                    <button 
                      onClick={() => setSelectedPayment(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Mã thanh toán</div>
                    <div className="text-lg font-bold text-red-600">{selectedPayment.id}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Trạng thái</div>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                      {getStatusText(selectedPayment.status)}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Tổng quan tài chính</div>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tổng giá trị:</span>
                        <span className="font-medium">{selectedPayment.totalAmount.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Đã thanh toán:</span>
                        <span className="font-medium text-green-600">{selectedPayment.paidAmount.toLocaleString()} VNĐ</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Còn lại:</span>
                        <span className="font-bold text-red-600">{selectedPayment.remainingAmount.toLocaleString()} VNĐ</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Phương thức thanh toán</div>
                    <div className="text-sm text-gray-600">{getPaymentMethodText(selectedPayment.paymentMethod)}</div>
                    {selectedPayment.installmentPlan && (
                      <div className="text-xs text-gray-500 mt-1">
                        Kế hoạch: {selectedPayment.installmentPlan} - {selectedPayment.monthlyPayment.toLocaleString()} VNĐ/tháng
                      </div>
                    )}
                  </div>

                  {selectedPayment.paymentMethod === 'installment' && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-2">Lịch trả góp</div>
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                        {generatePaymentSchedule(selectedPayment).slice(0, 6).map((schedule) => (
                          <div key={schedule.installment} className="flex justify-between items-center p-2 text-xs border-b border-gray-100 last:border-b-0">
                            <span>Kỳ {schedule.installment}</span>
                            <span>{new Date(schedule.dueDate).toLocaleDateString('vi-VN')}</span>
                            <span className="font-medium">{schedule.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4 border-t">
                    {selectedPayment.status !== 'completed' && (
                      <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700"
                      >
                        Ghi nhận TT
                      </button>
                    )}
                    <button className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700">
                      In hóa đơn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Ghi nhận thanh toán</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khách hàng
                </label>
                <div className="text-sm text-gray-900">{selectedPayment.customerName}</div>
                <div className="text-xs text-gray-500">{selectedPayment.orderId}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền còn lại
                </label>
                <div className="text-lg font-bold text-red-600">
                  {selectedPayment.remainingAmount.toLocaleString()} VNĐ
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền thanh toán *
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedPayment.remainingAmount}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Nhập số tiền"
                />
              </div>

              {selectedPayment.monthlyPayment && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-800">
                    Gợi ý: Thanh toán hàng tháng {selectedPayment.monthlyPayment.toLocaleString()} VNĐ
                  </div>
                  <button 
                    onClick={() => setPaymentAmount(selectedPayment.monthlyPayment.toString())}
                    className="text-blue-600 text-xs underline"
                  >
                    Áp dụng
                  </button>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentAmount('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                onClick={() => recordPayment(selectedPayment.id, paymentAmount)}
                disabled={!paymentAmount || parseInt(paymentAmount) <= 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Payment Modal */}
      {showCreatePaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo thanh toán mới</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khách hàng *
                </label>
                <input
                  type="text"
                  value={newPaymentData.customerName}
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nhập tên khách hàng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={newPaymentData.customerPhone}
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mẫu xe *
                </label>
                <select
                  value={newPaymentData.vehicle}
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, vehicle: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Chọn mẫu xe</option>
                  <option value="Electra Ascent">Electra Ascent</option>
                  <option value="Electra CityLink">Electra CityLink</option>
                  <option value="Electra GrandTour">Electra GrandTour</option>
                  <option value="Electra Micro">Electra Micro</option>
                  <option value="Electra Summit">Electra Summit</option>
                  <option value="Electra Velocity">Electra Velocity</option>
                  <option value="Electra UrbanPulse">Electra UrbanPulse</option>
                  <option value="Electra Voyager">Electra Voyager</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng giá trị (VNĐ) *
                </label>
                <input
                  type="number"
                  value={newPaymentData.totalAmount}
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, totalAmount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nhập tổng giá trị"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán *
                </label>
                <select
                  value={newPaymentData.paymentMethod}
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Chọn phương thức</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="bank_transfer">Chuyển khoản</option>
                  <option value="installment">Trả góp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền cọc (VNĐ)
                </label>
                <input
                  type="number"
                  value={newPaymentData.depositAmount}
                  onChange={(e) => setNewPaymentData(prev => ({ ...prev, depositAmount: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Nhập số tiền cọc"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => {
                  setShowCreatePaymentModal(false);
                  setNewPaymentData({
                    customerName: '',
                    customerPhone: '',
                    vehicle: '',
                    totalAmount: '',
                    paymentMethod: '',
                    depositAmount: ''
                  });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                onClick={createNewPayment}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Tạo thanh toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentManagement;