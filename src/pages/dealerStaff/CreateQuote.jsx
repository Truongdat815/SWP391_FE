import { useState } from 'react';

function CreateQuote({ onBack }) {
  // State cho thông tin đơn hàng (orders table) - phù hợp với cấu trúc database
  const [orderData, setOrderData] = useState({
    order_id: null, // Sẽ được tạo tự động
    contract_id: null, // Có thể null ban đầu
    customer_id: '', // Sẽ được tạo từ thông tin khách hàng
    staff_id: 'DS001', // Sẽ được set từ session
    total_price: 0, // Tổng tiền hàng (tính từ order_details)
    total_tax_price: 0, // Tổng thuế VAT (tính từ order_details)
    total_promotion_amount: 0, // Tổng khuyến mãi (tính từ order_details)
    total_payment: 0, // Tổng thanh toán cuối cùng
    status: 'draft', // draft, pending, approved, rejected
    order_date: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
    notes: ''
  });

  // State cho chi tiết đơn hàng (order_detail table)
  const [orderDetails, setOrderDetails] = useState([{
    order_detail_id: 1,
    store_stock_id: '',
    unit_price: 0,
    quantity: 1,
    vat_amount: 0,
    licensePlate_fee: 0,
    registration_fee: 0,
    discount_amount: 0,
    promotion_id: null,
    total_price: 0
  }]);

  // State cho customer info (mở rộng với thông tin chi tiết)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    occupation: '',
    idNumber: '',
    notes: ''
  });

  // Danh sách xe trong kho (store_stock)
  const vehicleModels = [
    { store_stock_id: 1, name: 'Electra Ascent', base_price: 320000000, vat_rate: 10 },
    { store_stock_id: 2, name: 'Electra CityLink', base_price: 280000000, vat_rate: 10 },
    { store_stock_id: 3, name: 'Electra GrandTour', base_price: 450000000, vat_rate: 10 },
    { store_stock_id: 4, name: 'Electra Micro', base_price: 180000000, vat_rate: 10 },
    { store_stock_id: 5, name: 'Electra Summit', base_price: 680000000, vat_rate: 10 },
    { store_stock_id: 6, name: 'Electra Velocity', base_price: 850000000, vat_rate: 10 },
    { store_stock_id: 7, name: 'Electra UrbanPulse', base_price: 220000000, vat_rate: 10 },
    { store_stock_id: 8, name: 'Electra Voyager', base_price: 750000000, vat_rate: 10 }
  ];

  // Danh sách khuyến mãi
  const promotions = [
    { promotion_id: 1, name: 'Không có khuyến mãi', discount_percent: 0 },
    { promotion_id: 2, name: 'Giảm giá 5%', discount_percent: 5 },
    { promotion_id: 3, name: 'Giảm giá 10%', discount_percent: 10 },
    { promotion_id: 4, name: 'Giảm giá 15%', discount_percent: 15 }
  ];

  // Hàm cập nhật thông tin khách hàng
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hàm cập nhật thông tin đơn hàng
  const handleOrderChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hàm cập nhật chi tiết đơn hàng
  const handleOrderDetailChange = (index, field, value) => {
    const updatedDetails = [...orderDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value
    };

    // Tính toán lại các giá trị
    const detail = updatedDetails[index];
    const vehicle = vehicleModels.find(v => v.store_stock_id === detail.store_stock_id);
    
    if (vehicle) {
      detail.unit_price = vehicle.base_price;
      const subtotal = detail.unit_price * detail.quantity;
      detail.vat_amount = subtotal * (vehicle.vat_rate / 100);
      
      // Tính discount từ promotion
      const promotion = promotions.find(p => p.promotion_id === detail.promotion_id);
      const discountAmount = promotion ? subtotal * (promotion.discount_percent / 100) : 0;
      detail.discount_amount = discountAmount;
      
      detail.total_price = subtotal + detail.vat_amount + detail.licensePlate_fee + detail.registration_fee - discountAmount;
    }

    setOrderDetails(updatedDetails);
    
    // Tự động tính toán lại tổng tiền khi có thay đổi
    setTimeout(() => {
      calculateOrderTotals();
    }, 0);
  };

  // Thêm dòng sản phẩm mới
  const addOrderDetail = () => {
    const newDetail = {
      order_detail_id: orderDetails.length + 1,
      store_stock_id: '',
      unit_price: 0,
      quantity: 1,
      vat_amount: 0,
      licensePlate_fee: 0,
      registration_fee: 0,
      discount_amount: 0,
      promotion_id: null,
      total_price: 0
    };
    setOrderDetails([...orderDetails, newDetail]);
  };

  // Xóa dòng sản phẩm
  const removeOrderDetail = (index) => {
    if (orderDetails.length > 1) {
      setOrderDetails(orderDetails.filter((_, i) => i !== index));
    }
  };

  // Tính tổng đơn hàng và cập nhật orderData
  const calculateOrderTotals = () => {
    const total_price = orderDetails.reduce((sum, detail) => sum + (detail.unit_price * detail.quantity), 0);
    const total_tax_price = orderDetails.reduce((sum, detail) => sum + detail.vat_amount, 0);
    const total_promotion_amount = orderDetails.reduce((sum, detail) => sum + detail.discount_amount, 0);
    const total_payment = orderDetails.reduce((sum, detail) => sum + detail.total_price, 0);

    // Cập nhật orderData với các giá trị tính toán
    setOrderData(prev => ({
      ...prev,
      total_price,
      total_tax_price,
      total_promotion_amount,
      total_payment,
      updated_at: new Date().toISOString()
    }));

    return {
      total_price,
      total_tax_price,
      total_promotion_amount,
      total_payment
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Đảm bảo tính toán tổng tiền trước khi submit
    calculateOrderTotals();
    
    // Chuẩn bị dữ liệu để gửi lên server theo cấu trúc bảng orders
    const orderPayload = {
      // Dữ liệu bảng orders
      order: {
        contract_id: orderData.contract_id,
        customer_id: orderData.customer_id, // Sẽ được tạo từ customerInfo
        staff_id: orderData.staff_id,
        total_price: orderData.total_price,
        total_tax_price: orderData.total_tax_price,
        total_promotion_amount: orderData.total_promotion_amount,
        total_payment: orderData.total_payment,
        status: 'draft', // Luôn đặt trạng thái là draft khi tạo báo giá
        order_date: orderData.order_date,
        updated_at: orderData.updated_at,
        notes: orderData.notes
      },
      // Dữ liệu khách hàng (để tạo customer record)
      customer: customerInfo,
      // Chi tiết đơn hàng
      order_details: orderDetails
    };
    
    console.log('Quote created with full order data:', orderPayload);
    alert('Báo giá đã được tạo thành công với trạng thái "Bản nháp"!');
    
    // TODO: Gửi dữ liệu lên API
    // fetch('/api/orders', { 
    //   method: 'POST', 
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(orderPayload) 
    // })
    
    // Sau khi tạo thành công, có thể điều hướng về dashboard
    if (onBack) {
      onBack();
    }
  };

  // Hàm chuyển đổi báo giá thành đơn hàng
  const handleConvertToOrder = () => {
    if (orderData.status === 'draft') {
      const updatedOrderData = {
        ...orderData,
        status: 'pending'
      };
      setOrderData(updatedOrderData);
      alert('Báo giá đã được chuyển thành đơn hàng chờ duyệt!');
    } else {
      alert('Chỉ có thể chuyển đổi báo giá ở trạng thái "Bản nháp" thành đơn hàng!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tạo báo giá mới</h2>
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors bg-white text-gray-900"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
            
            {/* Personal Information */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">Thông tin cá nhân</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={customerInfo.dateOfBirth}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  <select
                    name="gender"
                    value={customerInfo.gender}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nghề nghiệp
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={customerInfo.occupation}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">Thông tin liên hệ</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ *
                  </label>
                  <textarea
                    name="address"
                    value={customerInfo.address}
                    onChange={handleCustomerChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                    placeholder="Nhập địa chỉ chi tiết..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Identity Information */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-800 mb-3">Thông tin định danh</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số CMND/CCCD
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={customerInfo.idNumber}
                    onChange={handleCustomerChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                    placeholder="Nhập số CMND/CCCD"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h4 className="text-md font-medium text-gray-800 mb-3">Ghi chú thêm</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú về khách hàng
                </label>
                <textarea
                  name="notes"
                  value={customerInfo.notes}
                  onChange={handleCustomerChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                  placeholder="Nhập ghi chú thêm về khách hàng (nếu có)..."
                />
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h3>
            
            {/* Basic Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày tạo *
                </label>
                <input
                  type="date"
                  name="order_date"
                  value={orderData.order_date}
                  onChange={handleOrderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái *
                </label>
                <select
                  name="status"
                  value={orderData.status}
                  onChange={handleOrderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                  required
                >
                  <option value="draft">Bản nháp</option>
                  <option value="pending">Chờ duyệt</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã hợp đồng (nếu có)
                </label>
                <input
                  type="text"
                  name="contract_id"
                  value={orderData.contract_id || ''}
                  onChange={handleOrderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
                  placeholder="Tự động tạo sau khi duyệt"
                />
              </div>
            </div>

            {/* Order Summary - Real-time calculation */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Tổng kết đơn hàng (tự động tính toán)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng tiền hàng</p>
                  <p className="text-lg font-bold text-gray-900">
                    {orderData.total_price.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng thuế VAT</p>
                  <p className="text-lg font-bold text-blue-600">
                    {orderData.total_tax_price.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng khuyến mãi</p>
                  <p className="text-lg font-bold text-green-600">
                    -{orderData.total_promotion_amount.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div className="text-center p-3 bg-emerald-100 rounded-lg border-2 border-emerald-300">
                  <p className="text-sm text-emerald-700">Tổng thanh toán</p>
                  <p className="text-xl font-bold text-emerald-800">
                    {orderData.total_payment.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã nhân viên
                </label>
                <input
                  type="text"
                  name="staff_id"
                  value={orderData.staff_id}
                  onChange={handleOrderChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 bg-white text-gray-900 bg-white text-gray-900"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cập nhật lần cuối
                </label>
                <input
                  type="text"
                  value={new Date(orderData.updated_at).toLocaleString('vi-VN')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 bg-white text-gray-900 bg-white text-gray-900"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn hàng</h3>
              <button
                type="button"
                onClick={addOrderDetail}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center bg-white text-gray-900"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm sản phẩm
              </button>
            </div>

            {orderDetails.map((detail, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-900">Sản phẩm #{index + 1}</h4>
                  {orderDetails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOrderDetail(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Vehicle Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mẫu xe *
                    </label>
                    <select
                      value={detail.store_stock_id}
                      onChange={(e) => handleOrderDetailChange(index, 'store_stock_id', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                      required
                    >
                      <option value="">Chọn mẫu xe</option>
                      {vehicleModels.map(model => (
                        <option key={model.store_stock_id} value={model.store_stock_id}>
                          {model.name} - {model.base_price.toLocaleString('vi-VN')} VNĐ
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng *
                    </label>
                    <input
                      type="number"
                      value={detail.quantity}
                      onChange={(e) => handleOrderDetailChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                      required
                    />
                  </div>

                  {/* Promotion */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khuyến mãi
                    </label>
                    <select
                      value={detail.promotion_id || ''}
                      onChange={(e) => handleOrderDetailChange(index, 'promotion_id', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">Không có khuyến mãi</option>
                      {promotions.map(promo => (
                        <option key={promo.promotion_id} value={promo.promotion_id}>
                          {promo.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Unit Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đơn giá
                    </label>
                    <input
                      type="text"
                      value={detail.unit_price.toLocaleString('vi-VN') + ' VNĐ'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 bg-white text-gray-900 bg-white text-gray-900"
                    />
                  </div>

                  {/* License Plate Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phí biển số (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={detail.licensePlate_fee}
                      onChange={(e) => handleOrderDetailChange(index, 'licensePlate_fee', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>

                  {/* Registration Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phí đăng ký (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={detail.registration_fee}
                      onChange={(e) => handleOrderDetailChange(index, 'registration_fee', parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                    />
                  </div>

                  {/* VAT Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thuế VAT
                    </label>
                    <input
                      type="text"
                      value={detail.vat_amount.toLocaleString('vi-VN') + ' VNĐ'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 bg-white text-gray-900 bg-white text-gray-900"
                    />
                  </div>

                  {/* Total Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thành tiền
                    </label>
                    <input
                      type="text"
                      value={detail.total_price.toLocaleString('vi-VN') + ' VNĐ'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-emerald-100 text-emerald-700 font-semibold bg-white text-gray-900 bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>


          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="notes"
              value={orderData.notes}
              onChange={handleOrderChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 bg-white text-gray-900"
              placeholder="Nhập ghi chú thêm (nếu có)..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              {orderData.status === 'draft' && (
                <button
                  type="button"
                  onClick={handleConvertToOrder}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center bg-white text-gray-900"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Chuyển thành đơn hàng
                </button>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors bg-white text-gray-900"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors bg-white text-gray-900"
              >
                Tạo báo giá
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateQuote;
