import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const initialOrders = [
  { id: 'ORD-001', customer: 'Nguyễn Văn A', model: 'VF8', total: 1120000000, status: 'pending', date: '2025-09-01' },
  { id: 'ORD-002', customer: 'Trần Thị B', model: 'VF5', total: 560000000, status: 'processing', date: '2025-09-05' },
  { id: 'ORD-003', customer: 'Lê Văn C', model: 'VF9', total: 1650000000, status: 'completed', date: '2025-09-12' },
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
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status] || map.cancelled}`}>{status}</span>;
}

function Orders() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [orders] = useState(initialOrders);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchText = `${o.id} ${o.customer} ${o.model}`.toLowerCase().includes(query.toLowerCase());
      const matchStatus = status === 'all' ? true : o.status === status;
      return matchText && matchStatus;
    });
  }, [orders, query, status]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">OM</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Quản lý đơn hàng</h1>
                <p className="text-sm text-gray-500">Theo dõi và xử lý đơn hàng</p>
              </div>
            </div>
            <div className="space-x-3">
              <button onClick={() => navigate('/dashboard/dealer-staff/orders/new')} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Tạo đơn hàng</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Tìm theo mã đơn, khách hàng, model" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{o.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{o.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{o.model}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">{formatCurrencyVND(o.total)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700"><StatusBadge status={o.status} /></td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 mr-2">Xem</button>
                    <button className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Cập nhật</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Orders;


