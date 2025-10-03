import { useState } from 'react';

function PaymentManagement({ onBack }) {
  const [payments, setPayments] = useState([
    {
      id: 1,
      contractNumber: 'HD-001',
      customerName: 'Nguyễn Văn A',
      vehicleModel: 'Electra Ascent',
      totalAmount: 320000000,
      paidAmount: 100000000,
      remainingAmount: 220000000,
      paymentDate: '2024-01-15',
      status: 'partial',
      paymentMethod: 'bank_transfer'
    },
    {
      id: 2,
      contractNumber: 'HD-002',
      customerName: 'Trần Thị B',
      vehicleModel: 'Electra CityLink',
      totalAmount: 280000000,
      paidAmount: 280000000,
      remainingAmount: 0,
      paymentDate: '2024-01-10',
      status: 'completed',
      paymentMethod: 'cash'
    },
    {
      id: 3,
      contractNumber: 'HD-003',
      customerName: 'Lê Văn C',
      vehicleModel: 'Electra GrandTour',
      totalAmount: 450000000,
      paidAmount: 0,
      remainingAmount: 450000000,
      paymentDate: '2024-01-20',
      status: 'pending',
      paymentMethod: 'installment'
    }
  ]);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: '',
    notes: ''
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'partial': return 'Thanh toán một phần';
      case 'pending': return 'Chưa thanh toán';
      default: return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash': return 'Tiền mặt';
      case 'bank_transfer': return 'Chuyển khoản';
      case 'installment': return 'Trả góp';
      default: return method;
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (selectedPayment) {
      const updatedPayments = payments.map(payment => {
        if (payment.id === selectedPayment.id) {
          const newPaidAmount = payment.paidAmount + parseInt(paymentForm.amount);
          const newRemainingAmount = payment.totalAmount - newPaidAmount;
          return {
            ...payment,
            paidAmount: newPaidAmount,
            remainingAmount: newRemainingAmount,
            status: newRemainingAmount === 0 ? 'completed' : 'partial'
          };
        }
        return payment;
      });
      setPayments(updatedPayments);
      setShowPaymentForm(false);
      setSelectedPayment(null);
      setPaymentForm({ amount: '', paymentMethod: '', notes: '' });
      alert('Thanh toán đã được ghi nhận thành công!');
    }
  };

  const openPaymentForm = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentForm(true);
  };

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.paidAmount, 0);
  const pendingAmount = payments.reduce((sum, payment) => sum + payment.remainingAmount, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quản lý thanh toán</h2>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString('vi-VN')} VNĐ</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Công nợ</p>
                <p className="text-2xl font-bold text-gray-900">{pendingAmount.toLocaleString('vi-VN')} VNĐ</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng hợp đồng</p>
                <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ghi nhận thanh toán</h3>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hợp đồng</label>
                  <p className="text-sm text-gray-600">{selectedPayment.contractNumber} - {selectedPayment.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền còn lại</label>
                  <p className="text-sm text-gray-600">{selectedPayment.remainingAmount.toLocaleString('vi-VN')} VNĐ</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền thanh toán *</label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    max={selectedPayment.remainingAmount}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán *</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Chọn phương thức</option>
                    <option value="cash">Tiền mặt</option>
                    <option value="bank_transfer">Chuyển khoản</option>
                    <option value="installment">Trả góp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ghi nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payments List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách thanh toán</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Hợp đồng</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mẫu xe</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tổng tiền</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Đã trả</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Còn lại</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{payment.contractNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{payment.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{payment.vehicleModel}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{payment.totalAmount.toLocaleString('vi-VN')} VNĐ</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{payment.paidAmount.toLocaleString('vi-VN')} VNĐ</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{payment.remainingAmount.toLocaleString('vi-VN')} VNĐ</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {payment.remainingAmount > 0 && (
                        <button
                          onClick={() => openPaymentForm(payment)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ghi nhận thanh toán
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentManagement;
