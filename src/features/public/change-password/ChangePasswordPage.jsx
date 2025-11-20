import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useChangePasswordMutation } from '../../../api/auth/authApi';
import { setCredentials } from '../../../store/slices/authSlice';
import { getRoleDashboardRoute, normalizeRole } from '../../../utils/roleUtils';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';
import { Lock, AlertCircle } from 'lucide-react';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const userRole = useAppSelector((state) => state.auth.role);
  const token = useAppSelector((state) => state.auth.token);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect nếu user không ở trạng thái PENDING
  useEffect(() => {
    if (user && user.status !== 'PENDING') {
      const dashboardRoute = getRoleDashboardRoute(userRole || user.roleName);
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, userRole, navigate]);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!formData.oldPassword) {
      newErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    } else if (formData.newPassword === formData.oldPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu cũ';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      const response = await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      if (response.code === 200) {
        setSuccessMessage('Đổi mật khẩu thành công!');
        
        // Fetch lại thông tin user để có status mới nhất
        if (token) {
          try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';
            
            const userRes = await fetch(`${apiUrl}/users/me`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            const userData = await userRes.json();
            
            if (userRes.ok && userData.code === 200 && userData.data) {
              const userInfo = userData.data;
              const roleName = userInfo.roleName || userInfo.role?.name || '';
              const normalizedRole = normalizeRole(roleName);
              
              // Cập nhật user info trong Redux
              dispatch(
                setCredentials({
                  token,
                  refreshToken,
                  user: userInfo,
                  role: normalizedRole,
                })
              );
            }
          } catch (fetchError) {
            if (import.meta.env.DEV) {
              console.error('Error fetching user info after password change:', fetchError);
            }
            // Vẫn tiếp tục redirect dù có lỗi fetch user
          }
        }

        // Redirect sau 1.5 giây
        setTimeout(() => {
          const dashboardRoute = getRoleDashboardRoute(userRole || user?.roleName);
          navigate(dashboardRoute, { replace: true });
        }, 1500);
      } else {
        setErrorMessage(response.message || 'Có lỗi xảy ra khi đổi mật khẩu');
      }
    } catch (error) {
      setErrorMessage(
        error?.data?.message || 
        error?.message || 
        'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.'
      );
      if (import.meta.env.DEV) {
        console.error('Change password error:', error);
      }
    }
  };

  // Không hiển thị nếu user không ở trạng thái PENDING
  if (!user || user.status !== 'PENDING') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Đổi mật khẩu
          </h1>
          <p className="text-gray-600 text-sm">
            Đây là lần đầu tiên bạn đăng nhập. Vui lòng đổi mật khẩu để tiếp tục sử dụng hệ thống.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Mật khẩu cũ"
            type="password"
            value={formData.oldPassword}
            onChange={(e) => {
              setFormData({ ...formData, oldPassword: e.target.value });
              setErrors({ ...errors, oldPassword: '' });
              setErrorMessage('');
            }}
            error={errors.oldPassword}
            placeholder="Nhập mật khẩu cũ"
            required
          />

          <Input
            label="Mật khẩu mới"
            type="password"
            value={formData.newPassword}
            onChange={(e) => {
              setFormData({ ...formData, newPassword: e.target.value });
              setErrors({ ...errors, newPassword: '' });
              setErrorMessage('');
            }}
            error={errors.newPassword}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            required
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value });
              setErrors({ ...errors, confirmPassword: '' });
              setErrorMessage('');
            }}
            error={errors.confirmPassword}
            placeholder="Nhập lại mật khẩu mới"
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Sau khi đổi mật khẩu thành công, bạn sẽ được chuyển đến trang dashboard.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;

