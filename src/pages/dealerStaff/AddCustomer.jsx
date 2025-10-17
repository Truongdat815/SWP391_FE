import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCustomer, clearError, clearSuccess } from '../../store/slices/customerSlice';
import { X, User, Phone, Mail, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

function AddCustomer({ onBack, onSuccess }) {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.customers);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear messages when component mounts
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
  }, [dispatch]);

  // Handle success message
  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearSuccess());
        if (onSuccess) {
          onSuccess();
        }
        // Navigate back to create order page after successful customer creation
        if (onBack) {
          onBack();
        }
      }, 2000);
    }
  }, [success, dispatch, onSuccess, onBack]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên, Số điện thoại, Địa chỉ)');
      return;
    }

    // Validate fullName length
    if (formData.fullName.trim().length < 2) {
      alert('Họ và tên phải có ít nhất 2 ký tự');
      return;
    }

    // Validate fullName max length
    if (formData.fullName.trim().length > 100) {
      alert('Họ và tên không được vượt quá 100 ký tự');
      return;
    }

    // Validate address length
    if (formData.address.trim().length < 10) {
      alert('Địa chỉ phải có ít nhất 10 ký tự');
      return;
    }

    // Validate address max length
    if (formData.address.trim().length > 200) {
      alert('Địa chỉ không được vượt quá 200 ký tự');
      return;
    }

    // Validate email format if provided
    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      alert('Vui lòng nhập email hợp lệ');
      return;
    }

    // Validate email length if provided
    if (formData.email && formData.email.trim() && formData.email.trim().length > 100) {
      alert('Email không được vượt quá 100 ký tự');
      return;
    }

    // Validate phone format
    const phoneNumber = formData.phone.replace(/\s/g, '');
    if (!/^0[0-9]{9,10}$/.test(phoneNumber)) {
      alert('Vui lòng nhập số điện thoại hợp lệ (bắt đầu bằng 0, có 10-11 chữ số)');
      return;
    }

    // Prepare data according to API format - only send required fields
    const customerData = {
      fullName: formData.fullName.trim(),
      address: formData.address.trim(),
      email: formData.email ? formData.email.trim() : '',
      phone: phoneNumber
    };

    console.log('Sending customer data:', customerData);

    try {
      const result = await dispatch(addCustomer(customerData)).unwrap();
      console.log('Customer created successfully:', result);
    } catch (error) {
      console.error('Error adding customer:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast Notifications */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
          <span className="text-red-700">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <User className="h-8 w-8 text-emerald-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Thêm khách hàng mới</h2>
          </div>
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors bg-white text-gray-900"
          >
            <X className="h-5 w-5 mr-2" />
            Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-2" />
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Địa chỉ *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900"
                  placeholder="Nhập địa chỉ chi tiết..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors bg-white text-gray-900"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang thêm...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Thêm khách hàng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCustomer;
