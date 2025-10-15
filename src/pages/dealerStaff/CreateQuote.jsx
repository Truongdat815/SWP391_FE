import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createCustomer } from '../../api/customerService';
import { createOrder, updateOrderStatus } from '../../api/orderService';
import { createOrderDetail } from '../../api/order-detailService';
import { showSuccess, showError } from '../../store/slices/snackbarSlice';
import { useDispatch } from 'react-redux';

function CreateQuote({ onBack }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  
  // State cho các bước
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // State cho thông tin khách hàng (Bước 1)
  const [customerData, setCustomerData] = useState({
    fullName: '',
    address: '',
    email: '',
    phone: ''
  });
  
  // State cho thông tin order (Bước 2)
  const [orderData, setOrderData] = useState(null);
  const [createdCustomerId, setCreatedCustomerId] = useState(null);
  
  // State cho thông tin order detail (Bước 3)
  const [orderDetailData, setOrderDetailData] = useState({
    unitPrice: 0,
    quantity: 1,
    vatAmount: 0,
    licensePlateFee: 0,
    registrationFee: 0,
    discountAmount: 0,
    totalPrice: 0,
    orderId: 0,
    promotionId: 0,
    storeStockId: 0,
    modelName: '',
    colorName: '',
    modelPrice: 0,
    availableStock: 0,
    orderStatus: 'báo giá',
    customerName: '',
    customerPhone: '',
    promotionName: '',
    promotionType: '',
    subtotal: 0,
    totalFees: 0,
    totalTax: 0,
    priceBeforeDiscount: 0,
    finalAmount: 0,
    displayText: '',
    feeBreakdown: '',
    priceBreakdown: ''
  });

  // Danh sách xe trong kho
  const vehicleModels = [
    { storeStockId: 1, name: 'Electra Ascent', basePrice: 320000000, vatRate: 10, color: 'Trắng' },
    { storeStockId: 2, name: 'Electra CityLink', basePrice: 280000000, vatRate: 10, color: 'Đen' },
    { storeStockId: 3, name: 'Electra GrandTour', basePrice: 450000000, vatRate: 10, color: 'Xám' },
    { storeStockId: 4, name: 'Electra Micro', basePrice: 180000000, vatRate: 10, color: 'Xanh' },
    { storeStockId: 5, name: 'Electra Summit', basePrice: 680000000, vatRate: 10, color: 'Đỏ' },
    { storeStockId: 6, name: 'Electra Velocity', basePrice: 850000000, vatRate: 10, color: 'Bạc' },
    { storeStockId: 7, name: 'Electra UrbanPulse', basePrice: 220000000, vatRate: 10, color: 'Vàng' },
    { storeStockId: 8, name: 'Electra Voyager', basePrice: 750000000, vatRate: 10, color: 'Nâu' }
  ];

  // Danh sách khuyến mãi
  const promotions = [
    { promotionId: 0, name: 'Không có khuyến mãi', type: 'none', discountPercent: 0 },
    { promotionId: 1, name: 'Giảm giá 5%', type: 'percentage', discountPercent: 5 },
    { promotionId: 2, name: 'Giảm giá 10%', type: 'percentage', discountPercent: 10 },
    { promotionId: 3, name: 'Giảm giá 15%', type: 'percentage', discountPercent: 15 }
  ];

  // Xử lý thay đổi thông tin khách hàng
  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setCustomerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý thay đổi thông tin order detail
  const handleOrderDetailChange = (field, value) => {
    setOrderDetailData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Tính toán giá trị khi thay đổi
  const calculateValues = () => {
    const selectedVehicle = vehicleModels.find(v => v.storeStockId === orderDetailData.storeStockId);
    const selectedPromotion = promotions.find(p => p.promotionId === orderDetailData.promotionId);
    
    if (selectedVehicle) {
      const subtotal = selectedVehicle.basePrice * orderDetailData.quantity;
      const vatAmount = subtotal * (selectedVehicle.vatRate / 100);
      const discountAmount = selectedPromotion ? subtotal * (selectedPromotion.discountPercent / 100) : 0;
      const totalFees = orderDetailData.licensePlateFee + orderDetailData.registrationFee;
      const finalAmount = subtotal + vatAmount + totalFees - discountAmount;
      
      setOrderDetailData(prev => ({
        ...prev,
        unitPrice: selectedVehicle.basePrice,
        modelPrice: selectedVehicle.basePrice,
        vatAmount: vatAmount,
        discountAmount: discountAmount,
        subtotal: subtotal,
        totalFees: totalFees,
        totalTax: vatAmount,
        priceBeforeDiscount: subtotal + vatAmount + totalFees,
        finalAmount: finalAmount,
        totalPrice: finalAmount,
        modelName: selectedVehicle.name,
        colorName: selectedVehicle.color,
        availableStock: 10, // Mock data
        customerName: customerData.fullName,
        customerPhone: customerData.phone,
        promotionName: selectedPromotion?.name || 'Không có khuyến mãi',
        promotionType: selectedPromotion?.type || 'none',
        displayText: `${selectedVehicle.name} - ${selectedVehicle.color}`,
        feeBreakdown: `Phí biển số: ${orderDetailData.licensePlateFee.toLocaleString('vi-VN')} VNĐ, Phí đăng ký: ${orderDetailData.registrationFee.toLocaleString('vi-VN')} VNĐ`,
        priceBreakdown: `Giá gốc: ${subtotal.toLocaleString('vi-VN')} VNĐ, VAT: ${vatAmount.toLocaleString('vi-VN')} VNĐ, Giảm giá: ${discountAmount.toLocaleString('vi-VN')} VNĐ`
      }));
    }
  };

  // Bước 1: Tạo Customer
  const handleCreateCustomer = async () => {
    if (!customerData.fullName || !customerData.phone || !customerData.address) {
      dispatch(showError('Vui lòng điền đầy đủ thông tin bắt buộc'));
      return;
    }

    setLoading(true);
    try {
      const response = await createCustomer(customerData);
      setCreatedCustomerId(response.data?.customerId || 1); // Mock customerId nếu API chưa trả về
      dispatch(showSuccess('Tạo khách hàng thành công!'));
      setCurrentStep(2);
    } catch (error) {
      dispatch(showError('Lỗi khi tạo khách hàng: ' + error.message));
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Tạo Order
  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const response = await createOrder({ customerId: createdCustomerId || 1 });
      setOrderData(response.data);
      dispatch(showSuccess('Tạo đơn hàng thành công!'));
      setCurrentStep(3);
    } catch (error) {
      dispatch(showError('Lỗi khi tạo đơn hàng: ' + error.message));
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Tạo Order Detail và hoàn thành
  const handleCreateOrderDetail = async () => {
    if (!orderDetailData.storeStockId || orderDetailData.quantity <= 0) {
      dispatch(showError('Vui lòng chọn xe và nhập số lượng'));
      return;
    }

    setLoading(true);
    try {
      const response = await createOrderDetail({
        ...orderDetailData,
        orderId: orderData.orderId
      });
      dispatch(showSuccess('Tạo báo giá thành công!'));
      // Có thể điều hướng đến trang xem báo giá hoặc quay lại dashboard
      if (onBack) {
        onBack();
      }
    } catch (error) {
      dispatch(showError('Lỗi khi tạo báo giá: ' + error.message));
    } finally {
      setLoading(false);
    }
  };

  // Chuyển đổi báo giá thành đơn hàng
  const handleConvertToOrder = async () => {
    setLoading(true);
    try {
      await updateOrderStatus(orderData.orderId, 'pending');
      dispatch(showSuccess('Đã chuyển báo giá thành đơn hàng!'));
    } catch (error) {
      dispatch(showError('Lỗi khi chuyển đổi: ' + error.message));
    } finally {
      setLoading(false);
    }
  };

  // Render bước 1: Tạo Customer
  const renderStep1 = () => (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bước 1: Tạo thông tin khách hàng</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên *
          </label>
          <input
            type="text"
            name="fullName"
            value={customerData.fullName}
            onChange={handleCustomerChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
            value={customerData.phone}
            onChange={handleCustomerChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
            value={customerData.email}
            onChange={handleCustomerChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ *
          </label>
          <textarea
            name="address"
            value={customerData.address}
            onChange={handleCustomerChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          onClick={handleCreateCustomer}
          disabled={loading}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang tạo...' : 'Next'}
        </button>
      </div>
    </div>
  );

  // Render bước 2: Tạo Order
  const renderStep2 = () => (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bước 2: Tạo đơn hàng (trạng thái: báo giá)</h3>
      
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Thông tin khách hàng đã tạo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Họ tên:</span> {customerData.fullName}
          </div>
          <div>
            <span className="font-medium">Số điện thoại:</span> {customerData.phone}
          </div>
          <div>
            <span className="font-medium">Email:</span> {customerData.email || 'Chưa có'}
          </div>
          <div>
            <span className="font-medium">Địa chỉ:</span> {customerData.address}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <button
          onClick={handleCreateOrder}
          disabled={loading}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang tạo...' : 'Next'}
        </button>
      </div>
    </div>
  );

  // Render bước 3: Tạo Order Detail
  const renderStep3 = () => (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bước 3: Tạo chi tiết đơn hàng</h3>
      
      {orderData && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Thông tin đơn hàng</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Mã đơn hàng:</span> {orderData.orderId}
            </div>
            <div>
              <span className="font-medium">Khách hàng:</span> {orderData.customerName}
            </div>
            <div>
              <span className="font-medium">Nhân viên:</span> {orderData.staffName}
            </div>
            <div>
              <span className="font-medium">Cửa hàng:</span> {orderData.storeName}
            </div>
            <div>
              <span className="font-medium">Ngày tạo:</span> {new Date(orderData.orderDate).toLocaleString('vi-VN')}
            </div>
            <div>
              <span className="font-medium">Trạng thái:</span> {orderData.orderStatus || 'báo giá'}
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn mẫu xe *
          </label>
          <select
            value={orderDetailData.storeStockId}
            onChange={(e) => {
              handleOrderDetailChange('storeStockId', parseInt(e.target.value));
              calculateValues();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          >
            <option value={0}>Chọn mẫu xe</option>
            {vehicleModels.map(model => (
              <option key={model.storeStockId} value={model.storeStockId}>
                {model.name} - {model.color} - {model.basePrice.toLocaleString('vi-VN')} VNĐ
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lượng *
          </label>
          <input
            type="number"
            value={orderDetailData.quantity}
            onChange={(e) => {
              handleOrderDetailChange('quantity', parseInt(e.target.value) || 1);
              calculateValues();
            }}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khuyến mãi
          </label>
          <select
            value={orderDetailData.promotionId}
            onChange={(e) => {
              handleOrderDetailChange('promotionId', parseInt(e.target.value));
              calculateValues();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {promotions.map(promo => (
              <option key={promo.promotionId} value={promo.promotionId}>
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
            value={orderDetailData.licensePlateFee}
            onChange={(e) => {
              handleOrderDetailChange('licensePlateFee', parseInt(e.target.value) || 0);
              calculateValues();
            }}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phí đăng ký (VNĐ)
          </label>
          <input
            type="number"
            value={orderDetailData.registrationFee}
            onChange={(e) => {
              handleOrderDetailChange('registrationFee', parseInt(e.target.value) || 0);
              calculateValues();
            }}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Hiển thị báo giá */}
      {orderDetailData.storeStockId > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200 mt-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Báo giá</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Giá gốc</p>
              <p className="text-lg font-bold text-gray-900">
                {orderDetailData.subtotal.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Thuế VAT</p>
              <p className="text-lg font-bold text-blue-600">
                {orderDetailData.vatAmount.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Giảm giá</p>
              <p className="text-lg font-bold text-green-600">
                -{orderDetailData.discountAmount.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            <div className="text-center p-3 bg-emerald-100 rounded-lg border-2 border-emerald-300">
              <p className="text-sm text-emerald-700">Tổng thanh toán</p>
              <p className="text-xl font-bold text-emerald-800">
                {orderDetailData.finalAmount.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between mt-6">
        <button
          onClick={handleCreateOrderDetail}
          disabled={loading || !orderDetailData.storeStockId}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Đang tạo...' : 'Tạo báo giá'}
        </button>
        
        {orderData && (
          <button
            onClick={handleConvertToOrder}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang chuyển...' : 'Chuyển thành đơn hàng'}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tạo báo giá mới</h2>
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <div className="ml-2 text-sm font-medium text-gray-700">
                  {step === 1 && 'Tạo khách hàng'}
                  {step === 2 && 'Tạo đơn hàng'}
                  {step === 3 && 'Chi tiết đơn hàng'}
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step ? 'bg-emerald-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Render current step */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>
    </div>
  );
}

export default CreateQuote;