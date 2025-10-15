import { useEffect, useState } from 'react';
import { get } from '@/api/client';

function PromotionManagement() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    get('/api/promotions/all')
      .then((res) => setPromotions(Array.isArray(res?.data?.data) ? res.data.data : []))
      .catch((err) => {
        console.error('Lỗi lấy danh sách khuyến mãi:', err);
        setError('Không thể tải danh sách khuyến mãi');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-6 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
        <p className="text-gray-600 mt-1">Xem và quản lý các chương trình khuyến mãi</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {loading && <div className="text-sm text-gray-600">Đang tải danh sách khuyến mãi...</div>}
        {error && !loading && <div className="text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên KM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promotions.map((p) => (
                  <tr key={p.promotionId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{p.promotionName}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{p.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.promotionType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.startDate} → {p.endDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {p.active ? 'Đang hoạt động' : 'Tạm tắt'}
                      </span>
                    </td>
                  </tr>
                ))}
                {promotions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500">Không có khuyến mãi</td>
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

export default PromotionManagement;




