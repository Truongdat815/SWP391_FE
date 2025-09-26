import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialPayments = [
  { id: 'PAY-001', orderId: 'ORD-001', customer: 'Nguyễn Văn A', amount: 300000000, method: 'Chuyển khoản', date: '2025-09-10', status: 'completed' },
  { id: 'PAY-002', orderId: 'ORD-002', customer: 'Trần Thị B', amount: 200000000, method: 'Tiền mặt', date: '2025-09-12', status: 'pending' },
];

function formatCurrencyVND(value) {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(value || 0));
  } catch {
    return `${Math.round(value || 0).toLocaleString('vi-VN')} ₫`;
  }
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
}

function Payments() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [payments] = useState(initialPayments);

  const filtered = useMemo(() => {
    return payments.filter((p) => `${p.id} ${p.orderId} ${p.customer}`.toLowerCase().includes(query.toLowerCase()));
  }, [payments, query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">PM</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Thanh toán</h1>
                <p className="text-sm text-gray-500">Quản lý các giao dịch thanh toán</p>
              </div>
            </div>
            <div className="space-x-3">
              <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Quay lại</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-lg border-gray-300 focus:ring-green-500 focus:border-green-500" placeholder="Tìm theo mã thanh toán, mã đơn, khách hàng" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã thanh toán</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phương thức</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.orderId}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.customer}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">{formatCurrencyVND(p.amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{p.method}</td>
                  <td className="px-6 py-4 text-sm text-gray-700"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payments;


