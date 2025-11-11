import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { changePassword } from '../../api/authService';
import { logout } from '../../store/slices/authSlice';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/images/logo.png';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { PageTransition } from '../../components/Animated';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';

function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { toast, hideToast, success, error } = useToast();

  // Redirect nếu user không có hoặc status không phải PENDING
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    // Kiểm tra status chính xác hơn
    const userStatus = user.status ? user.status.toUpperCase().trim() : '';
    
    // Nếu user đã có status khác PENDING, redirect đến trang chính
    if (userStatus && userStatus !== 'PENDING') {
      console.log('ChangePassword - user status is NOT PENDING:', userStatus, 'redirecting to role page');
      const roleRoutes = {
        1: '/admin',
        2: '/evm-staff',
        3: '/dealer-manager',
        4: '/dealer-staff'
      };
      const targetRoute = roleRoutes[user.roleId] || '/signin';
      navigate(targetRoute);
    } else {
      console.log('ChangePassword - user status is PENDING:', userStatus);
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Gọi API đổi mật khẩu
      const response = await changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      console.log('Change password response:', response); // Debug log

      // Kiểm tra response - có thể backend trả về status trong data
      const responseStatus = response?.data?.status;
      console.log('Status from change password response:', responseStatus);

      // Nếu response vẫn có status PENDING, có thể backend chưa cập nhật ngay
      // Hoặc backend sẽ cập nhật status sau khi đổi mật khẩu thành công
      if (responseStatus === 'PENDING') {
        console.warn('Warning: Status in response is still PENDING. Backend may update it asynchronously.');
        // Đợi lâu hơn để backend có thời gian cập nhật status
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Nếu status đã là ACTIVE, chỉ cần đợi ngắn
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.');

      // Logout user hiện tại
      dispatch(logout());

      // Redirect về trang đăng nhập sau 1 giây nữa
      setTimeout(() => {
        navigate('/signin');
      }, 1000);
    } catch (err) {
      console.error('Change password error:', err);
      error(err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Kiểm tra status chính xác hơn - nếu không phải PENDING thì không render form
  const userStatus = user?.status ? user.status.toUpperCase().trim() : '';
  if (!user || (userStatus && userStatus !== 'PENDING')) {
    // useEffect đã xử lý redirect ở trên, chỉ return null để không render form
    return null;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Toast Notifications */}
          <Toast 
            show={toast.show} 
            type={toast.type} 
            message={toast.message} 
            onClose={hideToast}
          />

          {/* Change Password Card */}
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <img src={logo} alt="Electra" className="h-10 w-auto mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Đổi mật khẩu
                </h2>
                <p className="text-gray-600">
                  Đây là lần đăng nhập đầu tiên của bạn. Vui lòng đổi mật khẩu để tiếp tục.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Mật khẩu hiện tại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                      </div>
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        autoComplete="current-password"
                        required
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 transition-colors bg-white ${
                          errors.currentPassword 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                        }`}
                        placeholder="Nhập mật khẩu hiện tại"
                        value={formData.currentPassword}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                      </div>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 transition-colors bg-white ${
                          errors.newPassword 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                        }`}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                      Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        className={`block w-full pl-10 pr-3 py-3 border rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 transition-colors bg-white ${
                          errors.confirmPassword 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                        }`}
                        placeholder="Nhập lại mật khẩu mới"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                      Xác nhận đổi mật khẩu
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}

export default ChangePassword;

