import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateOrder() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    // Customer Info
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    // Vehicle Info
    vehicleModel: '',
    vehicleColor: '',
    batteryOption: 'rent',
    accessories: [],
    // Pricing
    vehiclePrice: 0,
    accessoryPrice: 0,
    totalPrice: 0,
    discount: 0,
    finalPrice: 0,
    // Payment
    paymentMethod: '',
    deposit: 0,
    installmentPlan: '',
    // Delivery
    deliveryDate: '',
    deliveryAddress: '',
    insuranceOption: '',
    // Additional
    notes: '',
    salesStaff: 'Nhân viên bán hàng'
  });

  const vehicleModels = [
    { id: 'vf3', name: 'VinFast VF3', price: 299000000 },
    { id: 'vf5', name: 'VinFast VF5 Plus', price: 529000000 },
    { id: 'vf6', name: 'VinFast VF6', price: 689000000 },
    { id: 'vf7', name: 'VinFast VF7', price: 799000000 },
    { id: 'vf8', name: 'VinFast VF8', price: 1019000000 },
    { id: 'vf9', name: 'VinFast VF9', price: 1499000000 }
  ];

  const colors = [
    { id: 'white', name: 'Trắng Ngọc Trai', price: 0 },
    { id: 'black', name: 'Đen Huyền Bí', price: 0 },
    { id: 'red', name: 'Đỏ Lửa', price: 5000000 },
    { id: 'blue', name: 'Xanh Dương Đại Dương', price: 5000000 },
    { id: 'silver', name: 'Bạc Tinh Khôi', price: 3000000 }
  ];

  const accessories = [
    { id: 'sunroof', name: 'Cửa sổ trời toàn cảnh', price: 25000000 },
    { id: 'leather', name: 'Ghế da cao cấp', price: 15000000 },
    { id: 'sound', name: 'Hệ thống âm thanh Harman Kardon', price: 20000000 },
    { id: 'wireless', name: 'Sạc không dây', price: 3000000 },
    { id: 'camera360', name: 'Camera 360 độ', price: 12000000 }
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Thanh toán tiền mặt' },
    { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng' },
    { id: 'installment', name: 'Trả góp qua ngân hàng' },
    { id: 'lease', name: 'Thuê tài chính' }
  ];

  const installmentPlans = [
    { id: '12m', name: '12 tháng', rate: 0.05 },
    { id: '24m', name: '24 tháng', rate: 0.07 },
    { id: '36m', name: '36 tháng', rate: 0.09 },
    { id: '48m', name: '48 tháng', rate: 0.11 },
    { id: '60m', name: '60 tháng', rate: 0.13 }
  ];

  const insuranceOptions = [
    { id: 'basic', name: 'Bảo hiểm cơ bản', price: 5000000 },
    { id: 'premium', name: 'Bảo hiểm cao cấp', price: 12000000 },
    { id: 'comprehensive', name: 'Bảo hiểm toàn diện', price: 18000000 }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAccessoryChange = (accessoryId) => {
    setFormData(prev => ({
      ...prev,
      accessories: prev.accessories.includes(accessoryId)
        ? prev.accessories.filter(id => id !== accessoryId)
        : [...prev.accessories, accessoryId]
    }));
  };

  const calculatePricing = () => {
    const vehicle = vehicleModels.find(v => v.id === formData.vehicleModel);
    const color = colors.find(c => c.id === formData.vehicleColor);
    const selectedAccessories = accessories.filter(a => formData.accessories.includes(a.id));
    const insurance = insuranceOptions.find(i => i.id === formData.insuranceOption);
    
    let vehiclePrice = vehicle ? vehicle.price : 0;
    let colorPrice = color ? color.price : 0;
    let accessoryPrice = selectedAccessories.reduce((sum, acc) => sum + acc.price, 0);
    let insurancePrice = insurance ? insurance.price : 0;
    
    let totalPrice = vehiclePrice + colorPrice + accessoryPrice + insurancePrice;
    let finalPrice = totalPrice - (formData.discount || 0);
    
    return {
      vehiclePrice: vehiclePrice + colorPrice,
      accessoryPrice: accessoryPrice,
      insurancePrice: insurancePrice,
      totalPrice: totalPrice,
      finalPrice: finalPrice
    };
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Order created:', formData);
    alert('Đơn hàng đã được tạo thành công!');
    navigate('/dashboard/dealer-staff');
  };

  const pricing = calculatePricing();
  const monthlyPayment = formData.installmentPlan && pricing.finalPrice > 0 
    ? (pricing.finalPrice - (formData.deposit || 0)) * (1 + (installmentPlans.find(p => p.id === formData.installmentPlan)?.rate || 0)) / parseInt(formData.installmentPlan?.replace('m', '')) || 0
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/dashboard/dealer-staff')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Tạo Đơn Hàng Mới</h1>
                <p className="text-sm text-gray-500">Tạo đơn hàng bán xe cho khách hàng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step >= stepNumber 
                      ? 'bg-red-600 border-red-600 text-white' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {step > stepNumber ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <div className="ml-3">
                    <span className={`text-sm font-medium ${
                      step >= stepNumber ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {stepNumber === 1 && 'Thông tin khách hàng'}
                      {stepNumber === 2 && 'Chọn xe & phụ kiện'}
                      {stepNumber === 3 && 'Thanh toán'}
                      {stepNumber === 4 && 'Xác nhận đơn hàng'}
                    </span>
                  </div>
                  {stepNumber < 4 && (
                    <div className="ml-6 w-16 h-0.5 bg-gray-300"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <form onSubmit={handleSubmit}>
          {/* Step 1: Customer Information */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Thông tin khách hàng</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã khách hàng
                    </label>
                    <input
                      type="text"
                      name="customerId"
                      value={formData.customerId}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Tự động tạo nếu để trống"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhân viên bán hàng
                    </label>
                    <input
                      type="text"
                      name="salesStaff"
                      value={formData.salesStaff}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên khách hàng *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ giao xe
                  </label>
                  <textarea
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle & Accessories */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Vehicle Selection */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Chọn xe</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mẫu xe *
                      </label>
                      <select
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Chọn mẫu xe</option>
                        {vehicleModels.map(vehicle => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.name} - {vehicle.price.toLocaleString()} VNĐ
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Màu sắc *
                      </label>
                      <select
                        name="vehicleColor"
                        value={formData.vehicleColor}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Chọn màu sắc</option>
                        {colors.map(color => (
                          <option key={color.id} value={color.id}>
                            {color.name} {color.price > 0 && `(+${color.price.toLocaleString()} VNĐ)`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày giao dự kiến
                    </label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={formData.deliveryDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Tùy chọn pin</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="batteryOption"
                          value="rent"
                          checked={formData.batteryOption === 'rent'}
                          onChange={handleInputChange}
                          className="mr-3 text-red-600"
                        />
                        <span className="text-sm">Thuê pin - 2.900.000 VNĐ/tháng</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="batteryOption"
                          value="buy"
                          checked={formData.batteryOption === 'buy'}
                          onChange={handleInputChange}
                          className="mr-3 text-red-600"
                        />
                        <span className="text-sm">Mua pin cùng xe</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Accessories */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Phụ kiện tùy chọn</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {accessories.map(accessory => (
                      <label key={accessory.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.accessories.includes(accessory.id)}
                            onChange={() => handleAccessoryChange(accessory.id)}
                            className="mr-3 text-red-600"
                          />
                          <span className="text-sm text-gray-700">{accessory.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          +{accessory.price.toLocaleString()} VNĐ
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Insurance */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Bảo hiểm</h3>
                </div>
                <div className="p-6">
                  <select
                    name="insuranceOption"
                    value={formData.insuranceOption}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Chọn gói bảo hiểm</option>
                    {insuranceOptions.map(insurance => (
                      <option key={insurance.id} value={insurance.id}>
                        {insurance.name} - {insurance.price.toLocaleString()} VNĐ
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Pricing Summary */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Chi tiết giá</h3>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá xe (bao gồm màu sắc):</span>
                    <span className="font-medium">{pricing.vehiclePrice.toLocaleString()} VNĐ</span>
                  </div>
                  {pricing.accessoryPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phụ kiện:</span>
                      <span className="font-medium">{pricing.accessoryPrice.toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  {pricing.insurancePrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bảo hiểm:</span>
                      <span className="font-medium">{pricing.insurancePrice.toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-medium">{pricing.totalPrice.toLocaleString()} VNĐ</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giảm giá (VNĐ)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-red-600">{pricing.finalPrice.toLocaleString()} VNĐ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Phương thức thanh toán</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    {paymentMethods.map(method => (
                      <label key={method.id} className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={handleInputChange}
                          className="mr-3 text-red-600"
                        />
                        <span className="text-sm text-gray-700">{method.name}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tiền đặt cọc (VNĐ)
                    </label>
                    <input
                      type="number"
                      name="deposit"
                      value={formData.deposit}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {formData.paymentMethod === 'installment' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kế hoạch trả góp
                      </label>
                      <select
                        name="installmentPlan"
                        value={formData.installmentPlan}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="">Chọn kế hoạch</option>
                        {installmentPlans.map(plan => (
                          <option key={plan.id} value={plan.id}>
                            {plan.name} (Lãi suất {(plan.rate * 100).toFixed(1)}%/năm)
                          </option>
                        ))}
                      </select>
                      {monthlyPayment > 0 && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                          <span className="text-sm text-blue-800">
                            Trả góp hàng tháng: <span className="font-bold">{monthlyPayment.toLocaleString()} VNĐ</span>
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Order Confirmation */}
          {step === 4 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Xác nhận đơn hàng</h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin khách hàng</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Tên:</span> {formData.customerName}</div>
                      <div><span className="text-gray-600">Điện thoại:</span> {formData.customerPhone}</div>
                      <div><span className="text-gray-600">Email:</span> {formData.customerEmail}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin xe</h4>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-600">Mẫu xe:</span> {vehicleModels.find(v => v.id === formData.vehicleModel)?.name}</div>
                      <div><span className="text-gray-600">Màu sắc:</span> {colors.find(c => c.id === formData.vehicleColor)?.name}</div>
                      <div><span className="text-gray-600">Pin:</span> {formData.batteryOption === 'rent' ? 'Thuê pin' : 'Mua pin'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Tổng kết đơn hàng</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tổng giá trị:</span>
                      <span className="font-medium">{pricing.finalPrice.toLocaleString()} VNĐ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Đặt cọc:</span>
                      <span className="font-medium">{(formData.deposit || 0).toLocaleString()} VNĐ</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Còn lại:</span>
                      <span className="font-bold text-red-600">{(pricing.finalPrice - (formData.deposit || 0)).toLocaleString()} VNĐ</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú đơn hàng
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Ghi chú thêm về đơn hàng..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <div className="flex space-x-3">
              <button 
                type="button"
                onClick={() => navigate('/dashboard/dealer-staff')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              {step > 1 && (
                <button 
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Quay lại
                </button>
              )}
            </div>

            <div>
              {step < totalSteps ? (
                <button 
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Tiếp tục
                </button>
              ) : (
                <button 
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Tạo đơn hàng
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrder;