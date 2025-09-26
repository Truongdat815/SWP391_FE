import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function formatCurrencyVND(value) {
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Math.round(value || 0));
  } catch {
    return `${Math.round(value || 0).toLocaleString('vi-VN')} ₫`;
  }
}

function NewOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    model: 'VF3',
    basePrice: 299000000,
    options: {
      premiumColor: false,
      advancedDriverAssist: false,
      leatherInterior: false
    },
    registrationTaxRate: 12, // %
  });

  const modelBasePrices = {
    VF3: 299000000,
    VF5: 529000000,
    VF6: 689000000,
    VF7: 799000000,
    VF8: 1019000000,
    VF9: 1499000000
  };

  const optionPrices = {
    premiumColor: 8000000,
    advancedDriverAssist: 25000000,
    leatherInterior: 15000000
  };

  const feeTable = {
    registrationFee: 1000000,
    plateFee: 500000,
    civilInsurance: 437000
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleModelChange = (e) => {
    const model = e.target.value;
    setForm((prev) => ({
      ...prev,
      model,
      basePrice: modelBasePrices[model] || 0
    }));
  };

  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      options: { ...prev.options, [name]: checked }
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const numeric = Number(value.replace(/[^0-9]/g, ''));
    setForm((prev) => ({ ...prev, [name]: Number.isFinite(numeric) ? numeric : 0 }));
  };

  const selectedOptionsTotal = useMemo(() => {
    return Object.entries(form.options).reduce((sum, [key, selected]) => {
      return sum + (selected ? (optionPrices[key] || 0) : 0);
    }, 0);
  }, [form.options]);

  const vehicleSubtotal = useMemo(() => {
    return (Number(form.basePrice) || 0) + selectedOptionsTotal;
  }, [form.basePrice, selectedOptionsTotal]);

  const vat = useMemo(() => {
    return vehicleSubtotal * 0.1; // 10%
  }, [vehicleSubtotal]);

  const registrationTax = useMemo(() => {
    const rate = (Number(form.registrationTaxRate) || 0) / 100;
    return vehicleSubtotal * rate;
  }, [vehicleSubtotal, form.registrationTaxRate]);

  const taxesTotal = useMemo(() => vat + registrationTax, [vat, registrationTax]);

  const onRoadFees = useMemo(() => {
    return feeTable.registrationFee + feeTable.plateFee + feeTable.civilInsurance;
  }, []);

  const grandTotal = useMemo(() => vehicleSubtotal + taxesTotal + onRoadFees, [vehicleSubtotal, taxesTotal, onRoadFees]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally: call backend to create order. For now, just navigate back and simulate success.
    alert('Đã tạo đơn hàng mới thành công!');
    navigate('/dashboard/dealer-staff');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">NO</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Tạo đơn hàng mới</h1>
                <p className="text-sm text-gray-500">Nhập thông tin khách hàng và cấu hình xe</p>
              </div>
            </div>
            <div className="space-x-3">
              <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Quay lại</button>
              <button form="new-order-form" type="submit" className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Lưu đơn hàng</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form id="new-order-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Customer + Vehicle */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thông tin khách hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input name="customerName" value={form.customerName} onChange={handleChange} className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500" placeholder="Nguyễn Văn A" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500" placeholder="09xxxxxxxx" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500" placeholder="khachhang@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input name="address" value={form.address} onChange={handleChange} className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500" placeholder="Số nhà, đường, quận, tỉnh/thành" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Cấu hình xe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model xe</label>
                  <select value={form.model} onChange={handleModelChange} className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500">
                    {Object.keys(modelBasePrices).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá niêm yết</label>
                  <input name="basePrice" value={form.basePrice.toLocaleString('vi-VN')} onChange={handleNumberChange} className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500" />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Tùy chọn thêm</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="premiumColor" checked={form.options.premiumColor} onChange={handleOptionChange} className="rounded text-red-600" />
                    <span className="text-sm text-gray-700">Màu sơn đặc biệt (+{formatCurrencyVND(optionPrices.premiumColor)})</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="advancedDriverAssist" checked={form.options.advancedDriverAssist} onChange={handleOptionChange} className="rounded text-red-600" />
                    <span className="text-sm text-gray-700">Gói ADAS (+{formatCurrencyVND(optionPrices.advancedDriverAssist)})</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" name="leatherInterior" checked={form.options.leatherInterior} onChange={handleOptionChange} className="rounded text-red-600" />
                    <span className="text-sm text-gray-700">Nội thất da (+{formatCurrencyVND(optionPrices.leatherInterior)})</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Giá xe + options</p>
                  <p className="text-base font-semibold text-gray-900">{formatCurrencyVND(vehicleSubtotal)}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">Tổng giá options</p>
                  <p className="text-base font-semibold text-gray-900">{formatCurrencyVND(selectedOptionsTotal)}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-xs text-gray-500">VAT (10%)</p>
                  <p className="text-base font-semibold text-gray-900">{formatCurrencyVND(vat)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Taxes + Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Thuế và phí</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thuế trước bạ (%)</label>
                  <input name="registrationTaxRate" value={String(form.registrationTaxRate)} onChange={handleChange} className="w-full rounded-lg border-gray-300 focus:ring-red-500 focus:border-red-500" />
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT 10%</span>
                    <span className="font-medium">{formatCurrencyVND(vat)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thuế trước bạ ({form.registrationTaxRate}%)</span>
                    <span className="font-medium">{formatCurrencyVND(registrationTax)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-800">Tổng thuế</span>
                    <span className="font-semibold">{formatCurrencyVND(taxesTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Phí lăn bánh</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lệ phí trước bạ (đã tính ở trên)</span>
                  <span className="text-gray-500">{formatCurrencyVND(registrationTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lệ phí đăng ký</span>
                  <span className="text-gray-500">{formatCurrencyVND(feeTable.registrationFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí biển số</span>
                  <span className="text-gray-500">{formatCurrencyVND(feeTable.plateFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bảo hiểm dân sự</span>
                  <span className="text-gray-500">{formatCurrencyVND(feeTable.civilInsurance)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-800">Tổng phí lăn bánh</span>
                  <span className="font-semibold">{formatCurrencyVND(onRoadFees)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tổng thanh toán</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá xe + options</span>
                  <span className="font-medium">{formatCurrencyVND(vehicleSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng thuế</span>
                  <span className="font-medium">{formatCurrencyVND(taxesTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí lăn bánh</span>
                  <span className="font-medium">{formatCurrencyVND(onRoadFees)}</span>
                </div>
                <div className="flex justify-between text-base pt-2 border-t">
                  <span className="text-gray-900 font-semibold">Tổng cộng</span>
                  <span className="text-red-600 font-bold">{formatCurrencyVND(grandTotal)}</span>
                </div>
              </div>
              <button form="new-order-form" type="submit" className="mt-4 w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700">Tạo đơn hàng</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewOrder;


