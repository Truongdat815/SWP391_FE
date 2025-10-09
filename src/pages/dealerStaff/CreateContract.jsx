import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateContract({ onBack }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    vehicleModel: '',
    vehiclePrice: '',
    depositAmount: '',
    contractDate: '',
    deliveryDate: '',
    paymentMethod: '',
    terms: '',
    notes: ''
  });

  const [contracts, setContracts] = useState([
    {
      id: 1,
      contractNumber: 'HD-001',
      customerName: 'Nguyễn Văn A',
      vehicleModel: 'Electra Ascent',
      contractDate: '2024-01-15',
      totalAmount: 320000000,
      status: 'active'
    },
    {
      id: 2,
      contractNumber: 'HD-002',
      customerName: 'Trần Thị B',
      vehicleModel: 'Electra CityLink',
      contractDate: '2024-01-10',
      totalAmount: 280000000,
      status: 'completed'
    }
  ]);

  const vehicleModels = [
    { id: 'ascent', name: 'Electra Ascent', price: 320000000 },
    { id: 'citylink', name: 'Electra CityLink', price: 280000000 },
    { id: 'grandtour', name: 'Electra GrandTour', price: 450000000 },
    { id: 'micro', name: 'Electra Micro', price: 180000000 },
    { id: 'summit', name: 'Electra Summit', price: 680000000 },
    { id: 'velocity', name: 'Electra Velocity', price: 850000000 },
    { id: 'urbanpulse', name: 'Electra UrbanPulse', price: 220000000 },
    { id: 'voyager', name: 'Electra Voyager', price: 750000000 }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedModel = vehicleModels.find(model => model.id === formData.vehicleModel);
    const newContract = {
      id: Date.now(),
      contractNumber: `HD-${String(contracts.length + 1).padStart(3, '0')}`,
      customerName: formData.customerName,
      vehicleModel: selectedModel.name,
      contractDate: formData.contractDate,
      totalAmount: selectedModel.price,
      status: 'active'
    };
    setContracts([newContract, ...contracts]);
    
    // Chuẩn bị dữ liệu để chuyển sang trang thanh toán
    const contractData = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      customerAddress: formData.customerAddress,
      vehicleModel: selectedModel.name,
      vehiclePrice: selectedModel.price,
      depositAmount: formData.depositAmount || 0,
      contractDate: formData.contractDate,
      deliveryDate: formData.deliveryDate,
      paymentMethod: formData.paymentMethod,
      terms: formData.terms,
      notes: formData.notes
    };
    
    // Reset form
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      customerAddress: '',
      vehicleModel: '',
      vehiclePrice: '',
      depositAmount: '',
      contractDate: '',
      deliveryDate: '',
      paymentMethod: '',
      terms: '',
      notes: ''
    });
    
    // Chuyển sang trang thanh toán với dữ liệu hợp đồng
    navigate('/dealer-staff/payment-management', { 
      state: { contractData: contractData } 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang hiệu lực';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tạo hợp đồng mới</h2>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contract Form */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hợp đồng</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                    <textarea
                      name="customerAddress"
                      value={formData.customerAddress}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Thông tin xe</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mẫu xe *</label>
                    <select
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">Chọn mẫu xe</option>
                      {vehicleModels.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name} - {model.price.toLocaleString('vi-VN')} VNĐ
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Chi tiết hợp đồng</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ký hợp đồng *</label>
                      <input
                        type="date"
                        name="contractDate"
                        value={formData.contractDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày giao xe dự kiến</label>
                      <input
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán *</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    >
                      <option value="">Chọn phương thức</option>
                      <option value="cash">Tiền mặt</option>
                      <option value="bank_transfer">Chuyển khoản</option>
                      <option value="installment">Trả góp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền cọc</label>
                    <input
                      type="number"
                      name="depositAmount"
                      value={formData.depositAmount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Nhập số tiền cọc"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Điều khoản hợp đồng</label>
                <textarea
                  name="terms"
                  value={formData.terms}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Nhập các điều khoản của hợp đồng..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Nhập ghi chú thêm..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Tạo hợp đồng & Chuyển sang thanh toán
              </button>
            </form>
          </div>

          {/* Contracts List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách hợp đồng</h3>
            <div className="space-y-4">
              {contracts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Chưa có hợp đồng nào</p>
                </div>
              ) : (
                contracts.map((contract) => (
                  <div key={contract.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{contract.contractNumber}</h4>
                        <p className="text-sm text-gray-600">{contract.customerName}</p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {getStatusText(contract.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Mẫu xe:</p>
                        <p className="font-medium">{contract.vehicleModel}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Ngày ký:</p>
                        <p className="font-medium">{contract.contractDate}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tổng giá trị:</span>
                        <span className="font-semibold text-gray-900">
                          {contract.totalAmount.toLocaleString('vi-VN')} VNĐ
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateContract;
