import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function QuoteOrderManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Main quote/order data (matches orders table)
  const [orderData, setOrderData] = useState({
    customer_id: '',
    staff_id: '1', // Current staff ID
    contract_id: '',
    order_date: new Date().toISOString().split('T')[0],
    status: 'quote_pending', // Bắt đầu với trạng thái báo giá
    valid_until: '', // Ngày hết hạn báo giá (chỉ hiện khi là báo giá)
    notes: ''
  });

  // Initialize data from navigation state if available
  useEffect(() => {
    if (location.state?.quoteData) {
      const { quoteData, mode } = location.state;
      
      // Map existing quote data to orderData format
      setOrderData({
        customer_id: quoteData.customerName || '',
        staff_id: '1',
        contract_id: quoteData.contract_id || '',
        order_date: quoteData.createdDate || new Date().toISOString().split('T')[0],
        status: mode === 'convert' ? 'order_pending' : quoteData.status || 'quote_pending',
        valid_until: quoteData.validUntil || '',
        notes: quoteData.notes || ''
      });

      // If converting, auto-generate contract_id if not exists
      if (mode === 'convert' && !quoteData.contract_id) {
        setOrderData(prev => ({
          ...prev,
          contract_id: `CONTRACT_${Date.now()}`
        }));
      }
    }
  }, [location.state]);

  // Kiểm tra xem đang ở trạng thái báo giá hay đơn hàng
  const isQuoteMode = orderData.status.startsWith('quote_');
  const isOrderMode = orderData.status.startsWith('order_');

  // Order details (matches order_detail table) - supports multiple items
  const [orderDetails, setOrderDetails] = useState([
    {
      store_stock_id: '',
      promotion_id: '',
      unit_price: 0,
      quantity: 1,
      vat_amount: 0,
      licensePlate_fee: 0,
      registration_fee: 0,
      discount_amount: 0,
      total_price: 0
    }
  ]);

  const [errors, setErrors] = useState({});

  // Available vehicles in stock
  const availableVehicles = [
    { 
      store_stock_id: 'ST001', 
      name: 'Electra Ascent', 
      unit_price: 2500000000,
      color: 'Trắng Ngọc Trai',
      available: 5
    },
    { 
      store_stock_id: 'ST002', 
      name: 'Electra CityLink', 
      unit_price: 850000000,
      color: 'Xanh Dương Đậm',
      available: 3
    },
    { 
      store_stock_id: 'ST003', 
      name: 'Electra GrandTour', 
      unit_price: 1500000000,
      color: 'Đen Bóng',
      available: 2
    },
    { 
      store_stock_id: 'ST004', 
      name: 'Electra Summit', 
      unit_price: 2100000000,
      color: 'Bạc Metallic',
      available: 4
    }
  ];

  // Available promotions
  const availablePromotions = [
    { promotion_id: 'PROMO001', name: 'Giảm giá 5%', discount_percent: 5 },
    { promotion_id: 'PROMO002', name: 'Giảm giá 10%', discount_percent: 10 },
    { promotion_id: 'PROMO003', name: 'Giảm giá 15%', discount_percent: 15 }
  ];

  // Handle order data changes
  const handleOrderDataChange = (field, value) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle order detail changes
  const handleOrderDetailChange = (index, field, value) => {
    setOrderDetails(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-calculate based on vehicle selection
      if (field === 'store_stock_id') {
        const selectedVehicle = availableVehicles.find(v => v.store_stock_id === value);
        if (selectedVehicle) {
          updated[index].unit_price = selectedVehicle.unit_price;
        }
      }
      
      // Auto-calculate VAT (10% of unit price)
      if (field === 'unit_price' || field === 'quantity') {
        const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : updated[index].unit_price;
        const quantity = field === 'quantity' ? parseInt(value) || 1 : updated[index].quantity;
        updated[index].vat_amount = unitPrice * quantity * 0.1;
      }
      
      // Auto-calculate discount based on promotion
      if (field === 'promotion_id') {
        const selectedPromo = availablePromotions.find(p => p.promotion_id === value);
        if (selectedPromo) {
          const baseAmount = updated[index].unit_price * updated[index].quantity;
          updated[index].discount_amount = baseAmount * (selectedPromo.discount_percent / 100);
        } else {
          updated[index].discount_amount = 0;
        }
      }
      
      // Calculate total price
      const baseAmount = updated[index].unit_price * updated[index].quantity;
      const vatAmount = updated[index].vat_amount || 0;
      const discountAmount = updated[index].discount_amount || 0;
      const licensePlateFee = updated[index].licensePlate_fee || 0;
      const registrationFee = updated[index].registration_fee || 0;
      
      updated[index].total_price = baseAmount + vatAmount - discountAmount + licensePlateFee + registrationFee;
      
      return updated;
    });
  };

  // Add new order detail
  const addOrderDetail = () => {
    setOrderDetails(prev => [...prev, {
      store_stock_id: '',
      promotion_id: '',
      unit_price: 0,
      quantity: 1,
      vat_amount: 0,
      licensePlate_fee: 0,
      registration_fee: 0,
      discount_amount: 0,
      total_price: 0
    }]);
  };

  // Remove order detail
  const removeOrderDetail = (index) => {
    if (orderDetails.length > 1) {
      setOrderDetails(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Calculate totals
  const calculateOrderTotals = () => {
    const totalPrice = orderDetails.reduce((sum, detail) => sum + (detail.total_price || 0), 0);
    const totalTaxPrice = orderDetails.reduce((sum, detail) => sum + (detail.vat_amount || 0), 0);
    const totalPromotionAmount = orderDetails.reduce((sum, detail) => sum + (detail.discount_amount || 0), 0);
    const totalLicensePlateFee = orderDetails.reduce((sum, detail) => sum + (detail.licensePlate_fee || 0), 0);
    const totalRegistrationFee = orderDetails.reduce((sum, detail) => sum + (detail.registration_fee || 0), 0);
    
    return {
      total_price: totalPrice,
      total_tax_price: totalTaxPrice,
      total_promotion_amount: totalPromotionAmount,
      total_licensePlate_fee: totalLicensePlateFee,
      total_registration_fee: totalRegistrationFee,
      total_payment: totalPrice
    };
  };

  // Convert quote to order
  const convertQuoteToOrder = () => {
    setOrderData(prev => ({
      ...prev,
      status: 'order_pending',
      order_date: new Date().toISOString().split('T')[0], // Update to current date
      contract_id: prev.contract_id || `CONTRACT_${Date.now()}` // Auto-generate contract if empty
    }));
  };

  // Convert order to quote
  const convertOrderToQuote = () => {
    setOrderData(prev => ({
      ...prev,
      status: 'quote_pending',
      valid_until: prev.valid_until || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
    }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!orderData.customer_id.trim()) {
      newErrors.customer_id = 'Vui lòng nhập ID khách hàng';
    }
    
    if (isQuoteMode && !orderData.valid_until) {
      newErrors.valid_until = 'Vui lòng chọn ngày hết hạn báo giá';
    }
    
    if (isOrderMode && !orderData.contract_id.trim()) {
      newErrors.contract_id = 'Vui lòng nhập số hợp đồng';
    }
    
    // Validate order details
    orderDetails.forEach((detail, index) => {
      if (!detail.store_stock_id) {
        newErrors[`orderDetail_${index}_vehicle`] = 'Vui lòng chọn xe';
      }
      if (detail.quantity < 1) {
        newErrors[`orderDetail_${index}_quantity`] = 'Số lượng phải lớn hơn 0';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare data for submission
    const submissionData = {
      order: {
        ...orderData,
        order_id: isQuoteMode ? `Q${Date.now()}` : `ORD${Date.now()}`,
        ...calculateOrderTotals()
      },
      order_details: orderDetails.map((detail, index) => ({
        ...detail,
        order_detail_id: isQuoteMode ? `QD${Date.now()}_${index}` : `OD${Date.now()}_${index}`
      }))
    };
    
    console.log('Submitting data:', submissionData);
    alert(`${isQuoteMode ? 'Báo giá' : 'Đơn hàng'} đã được tạo thành công!`);
    
    // Navigate back to management page
    navigate('/dealer-staff/sales-quote');
  };

  const totals = calculateOrderTotals();

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-3 md:px-4 lg:px-2 py-3 sm:py-4 md:py-5">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {isQuoteMode ? 'Tạo báo giá mới' : 'Quản lý đơn hàng'}
              </h1>
              <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${
                isQuoteMode 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {isQuoteMode ? '📋 Báo giá' : '📦 Đơn hàng'}
              </span>
            </div>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">
              {isQuoteMode ? 'Tạo báo giá cho khách hàng' : 'Quản lý thông tin đơn hàng'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/dealer-staff')}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Quay lại Dashboard</span>
            <span className="sm:hidden">Quay lại</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5">
        {/* Order Information */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
              {isQuoteMode ? 'Thông tin báo giá' : 'Thông tin đơn hàng'}
            </h2>
            
            {/* Conversion buttons */}
            <div className="flex items-center space-x-2">
              {isQuoteMode && orderData.status === 'quote_approved' && (
                <button
                  type="button"
                  onClick={convertQuoteToOrder}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Chuyển thành đơn hàng
                </button>
              )}
              {isOrderMode && (
                <button
                  type="button"
                  onClick={convertOrderToQuote}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ↩️ Chuyển về báo giá
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Khách hàng *
              </label>
              <input
                type="text"
                value={orderData.customer_id}
                onChange={(e) => handleOrderDataChange('customer_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.customer_id ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập ID khách hàng"
              />
              {errors.customer_id && (
                <p className="text-red-500 text-sm mt-1">{errors.customer_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={orderData.status}
                onChange={(e) => handleOrderDataChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {isQuoteMode ? (
                  <>
                    <option value="quote_pending">Báo giá chờ phản hồi</option>
                    <option value="quote_approved">Báo giá đã được chấp nhận</option>
                    <option value="quote_rejected">Báo giá bị từ chối</option>
                  </>
                ) : (
                  <>
                    <option value="order_pending">Đơn hàng chờ xử lý</option>
                    <option value="order_confirmed">Đơn hàng đã xác nhận</option>
                    <option value="order_processing">Đang xử lý</option>
                    <option value="order_completed">Hoàn thành</option>
                  </>
                )}
              </select>
            </div>

            {isQuoteMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày hết hạn báo giá *
                </label>
                <input
                  type="date"
                  value={orderData.valid_until}
                  onChange={(e) => handleOrderDataChange('valid_until', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.valid_until ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.valid_until && (
                  <p className="text-red-500 text-sm mt-1">{errors.valid_until}</p>
                )}
              </div>
            )}

            {isOrderMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số hợp đồng *
                </label>
                <input
                  type="text"
                  value={orderData.contract_id}
                  onChange={(e) => handleOrderDataChange('contract_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.contract_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nhập số hợp đồng"
                />
                {errors.contract_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.contract_id}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày tạo
              </label>
              <input
                type="date"
                value={orderData.order_date}
                onChange={(e) => handleOrderDataChange('order_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={orderData.notes}
              onChange={(e) => handleOrderDataChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nhập ghi chú..."
            />
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {isQuoteMode ? 'Chi tiết báo giá' : 'Chi tiết đơn hàng'}
            </h2>
            <button
              type="button"
              onClick={addOrderDetail}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              + Thêm xe
            </button>
          </div>

          <div className="space-y-4">
            {orderDetails.map((detail, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Xe #{index + 1}</h3>
                  {orderDetails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOrderDetail(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn xe *
                    </label>
                    <select
                      value={detail.store_stock_id}
                      onChange={(e) => handleOrderDetailChange(index, 'store_stock_id', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`orderDetail_${index}_vehicle`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Chọn xe...</option>
                      {availableVehicles.map(vehicle => (
                        <option key={vehicle.store_stock_id} value={vehicle.store_stock_id}>
                          {vehicle.name} - {vehicle.color} ({vehicle.available} xe có sẵn)
                        </option>
                      ))}
                    </select>
                    {errors[`orderDetail_${index}_vehicle`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`orderDetail_${index}_vehicle`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đơn giá (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={detail.unit_price}
                      onChange={(e) => handleOrderDetailChange(index, 'unit_price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={detail.quantity}
                      onChange={(e) => handleOrderDetailChange(index, 'quantity', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`orderDetail_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors[`orderDetail_${index}_quantity`] && (
                      <p className="text-red-500 text-sm mt-1">{errors[`orderDetail_${index}_quantity`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khuyến mãi
                    </label>
                    <select
                      value={detail.promotion_id}
                      onChange={(e) => handleOrderDetailChange(index, 'promotion_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Không áp dụng</option>
                      {availablePromotions.map(promo => (
                        <option key={promo.promotion_id} value={promo.promotion_id}>
                          {promo.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phí biển số (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={detail.licensePlate_fee}
                      onChange={(e) => handleOrderDetailChange(index, 'licensePlate_fee', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phí đăng ký (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={detail.registration_fee}
                      onChange={(e) => handleOrderDetailChange(index, 'registration_fee', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Detail Summary */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Thành tiền:</span>
                      <div className="font-medium">{(detail.unit_price * detail.quantity).toLocaleString('vi-VN')} VNĐ</div>
                    </div>
                    <div>
                      <span className="text-gray-600">VAT (10%):</span>
                      <div className="font-medium">{(detail.vat_amount || 0).toLocaleString('vi-VN')} VNĐ</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Giảm giá:</span>
                      <div className="font-medium text-green-600">-{(detail.discount_amount || 0).toLocaleString('vi-VN')} VNĐ</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Tổng cộng:</span>
                      <div className="font-bold text-blue-600">{(detail.total_price || 0).toLocaleString('vi-VN')} VNĐ</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {isQuoteMode ? 'Tóm tắt báo giá' : 'Tóm tắt đơn hàng'}
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Tổng tiền hàng:</span>
                <span>{totals.total_price.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng VAT:</span>
                <span>{totals.total_tax_price.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Tổng giảm giá:</span>
                <span>-{totals.total_promotion_amount.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              {totals.total_licensePlate_fee > 0 && (
                <div className="flex justify-between">
                  <span>Tổng phí biển số:</span>
                  <span>{totals.total_licensePlate_fee.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              )}
              {totals.total_registration_fee > 0 && (
                <div className="flex justify-between">
                  <span>Tổng phí đăng ký:</span>
                  <span>{totals.total_registration_fee.toLocaleString('vi-VN')} VNĐ</span>
                </div>
              )}
              
              <div className="flex justify-between border-t pt-3 text-lg font-bold text-emerald-600">
                <span>Tổng thanh toán:</span>
                <span>{totals.total_payment.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {isQuoteMode ? 'Tạo báo giá' : 'Cập nhật đơn hàng'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/dealer-staff/sales-quote')}
              className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default QuoteOrderManagement;