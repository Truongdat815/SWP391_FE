import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { get } from '@/api/client';

function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      get('/api/orders/all'), // In absence of single order endpoint, list and find
      get(`/api/order-details/order/${orderId}`)
    ])
      .then(([ordersRes, detailsRes]) => {
        if (!mounted) return;
        const orders = Array.isArray(ordersRes?.data?.data) ? ordersRes.data.data : [];
        setOrder(orders.find(o => String(o.orderId) === String(orderId)) || null);
        setDetails(Array.isArray(detailsRes?.data?.data) ? detailsRes.data.data : []);
      })
      .catch((err) => {
        console.error('Lỗi lấy chi tiết đơn hàng:', err);
        setError('Không thể tải chi tiết đơn hàng');
      })
      .finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [orderId]);

  return (
    <div className="px-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng #{orderId}</h1>
            <p className="text-gray-600 mt-1">Thông tin và các dòng hàng của đơn</p>
          </div>
          <Link to="/admin/orders" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">Quay lại</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        {loading && <div className="text-sm text-gray-600">Đang tải...</div>}
        {error && !loading && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500">Khách hàng</p>
                <p className="text-gray-900 font-medium">{order?.customerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nhân viên phụ trách</p>
                <p className="text-gray-900 font-medium">{order?.staffName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <p className="text-gray-900 font-medium">{order?.status || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng tiền</p>
                <p className="text-gray-900 font-semibold">{(order?.totalPrice || 0).toLocaleString('vi-VN')} VNĐ</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p className="text-gray-900 font-medium">{order?.orderDate || '—'}</p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Các dòng hàng</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mẫu xe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Màu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trước KM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {details.map((d, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.modelName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.colorName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{d.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(d.priceBeforeDiscount || 0).toLocaleString('vi-VN')} VNĐ</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(d.discountAmount || 0).toLocaleString('vi-VN')} VNĐ</td>
                      </tr>
                    ))}
                    {details.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">Không có dòng hàng</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderDetail;




