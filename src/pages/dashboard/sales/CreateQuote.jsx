import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function formatCurrencyVND(value) {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(value || 0));
  } catch {
    return `${Math.round(value || 0).toLocaleString('vi-VN')} ₫`;
  }
}

function CreateQuote() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    model: 'VF8',
    basePrice: 1019000000,
    discount: 0,
    notes: ''
  });

  const models = {
    VF3: 299000000,
    VF5: 529000000,
    VF6: 689000000,
    VF7: 799000000,
    VF8: 1019000000,
    VF9: 1499000000
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModelChange = (e) => {
    const model = e.target.value;
    setForm((prev) => ({ ...prev, model, basePrice: models[model] || 0 }));
  };

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    const numeric = Number(value.replace(/[^0-9]/g, ''));
    setForm((prev) => ({ ...prev, [name]: Number.isFinite(numeric) ? numeric : 0 }));
  };

  const subtotal = useMemo(() => (Number(form.basePrice) || 0), [form.basePrice]);
  const vat = useMemo(() => subtotal * 0.1, [subtotal]);
  const totalBeforeDiscount = useMemo(() => subtotal + vat, [subtotal, vat]);
  const total = useMemo(() => Math.max(0, totalBeforeDiscount - (Number(form.discount) || 0)), [totalBeforeDiscount, form.discount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Đã tạo báo giá thành công!');
    navigate('/dashboard/dealer-staff');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">CQ</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Tạo báo giá</h1>
                <p className="text-sm text-gray-500">Xuất báo giá chi tiết cho khách hàng</p>
              </div>
            </div>
            <div className="space-x-3">
              <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Quay lại</button>
              <button form="create-quote-form" type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Lưu báo giá</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form id="create-quote-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input name="customerName" value={form.customerName} onChange={handleChange} className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" placeholder="Nguyễn Văn A" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" placeholder="09xxxxxxxx" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" placeholder="khachhang@example.com" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin báo giá</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model xe</label>
                  <select value={form.model} onChange={handleModelChange} className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                    {Object.keys(models).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá niêm yết</label>
                  <input name="basePrice" value={form.basePrice.toLocaleString('vi-VN')} onChange={handleMoneyChange} className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chiết khấu</label>
                  <input name="discount" value={form.discount.toLocaleString('vi-VN')} onChange={handleMoneyChange} className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" placeholder="0" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500" rows="3" placeholder="Ghi chú thêm cho báo giá" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tóm tắt</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá xe</span>
                  <span className="font-medium">{formatCurrencyVND(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">VAT 10%</span>
                  <span className="font-medium">{formatCurrencyVND(vat)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">{formatCurrencyVND(totalBeforeDiscount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chiết khấu</span>
                  <span className="font-medium">-{formatCurrencyVND(Number(form.discount) || 0)}</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t">
                  <span className="text-gray-900 font-semibold">Tổng cộng</span>
                  <span className="text-blue-600 font-bold">{formatCurrencyVND(total)}</span>
                </div>
              </div>
              <button form="create-quote-form" type="submit" className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">Tạo báo giá</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateQuote;


