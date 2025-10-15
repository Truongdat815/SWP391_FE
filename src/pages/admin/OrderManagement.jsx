import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '@/api/client';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    get('/api/orders/all')
      .then((res) => setOrders(Array.isArray(res?.data?.data) ? res.data.data : []))
      .catch((err) => {
        console.error('Lỗi lấy đơn hàng:', err);
        setError('Không thể tải danh sách đơn hàng');
      })
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (status) => {
    const map = {
      COMPLETED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      CANCELLED: 'bg-red-100 text-red-800',
      PROCESSING: 'bg-blue-100 text-blue-800'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="px-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-gray-600 mt-1">Xem và quản lý các đơn hàng</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading && <div className="text-sm text-gray-600">Đang tải danh sách đơn hàng...</div>}
        {error && !loading && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((o) => (
                  <tr key={o.orderId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{o.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{o.customerName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{o.staffName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(o.totalPrice || 0).toLocaleString('vi-VN')} VNĐ</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.orderDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link to={`/admin/orders/${o.orderId}`} className="text-blue-600 hover:text-blue-900">Chi tiết</Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">Không có đơn hàng</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderManagement;




