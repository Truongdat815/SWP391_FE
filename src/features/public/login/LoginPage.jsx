import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { setCredentials, clearAllAuth } from '../../../store/slices/authSlice';
import { useLoginMutation, authApi } from '../../../api/auth/authApi';
import { normalizeRole, getRoleDashboardRoute } from '../../../utils/roleUtils';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login] = useLoginMutation();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const userRole = useAppSelector((state) => state.auth.role);

  // Clear any existing auth state when login page loads
  useEffect(() => {
    dispatch(clearAllAuth());
  }, [dispatch]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && userRole) {
      const dashboardRoute = getRoleDashboardRoute(userRole);
      navigate(dashboardRoute, { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true, // Default to true for better UX
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Clear any existing auth data before login to prevent contamination
    dispatch(clearAllAuth());

    try {
      const res = await login({ email: formData.email, password: formData.password }).unwrap();

      if (import.meta.env.DEV) {
        console.log('Login response:', res);
      }

      if (res.code !== 200) {
        setError(res.message || 'Sai tài khoản hoặc mật khẩu!');
        setIsLoading(false);
        return;
      }

      if (!res.data) {
        setError('Response không hợp lệ từ server.');
        setIsLoading(false);
        return;
      }

      const { accessToken, refreshToken, user } = res.data;

      if (!accessToken) {
        setError('Không nhận được token từ server.');
        setIsLoading(false);
        return;
      }

      // Lưu token vào localStorage NGAY LẬP TỨC
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Nếu có user trong response, dùng luôn
      if (user && (user.roleName || user.role?.name)) {
        const roleName = user.roleName || user.role?.name || '';
        const normalizedRole = normalizeRole(roleName);

        // Clear logout flag before setting credentials
        localStorage.removeItem('_logout_flag');

        dispatch(
          setCredentials({
            token: accessToken,
            refreshToken,
            user,
            role: normalizedRole,
            rememberMe: formData.rememberMe,
          })
        );

        // Invalidate user cache to force fresh data
        dispatch(authApi.util.invalidateTags(['User']));

        // Redirect theo role sử dụng utility function
        const redirectPath = getRoleDashboardRoute(roleName);

        if (import.meta.env.DEV) {
          console.log('User role:', roleName, '→ Normalized:', normalizedRole);
          console.log('Redirecting to:', redirectPath);
        }

        // Use window.location.href to force complete page reload and ensure clean state
        window.location.href = redirectPath;
        return; // Dừng ở đây nếu đã có user
      }

      // Nếu không có user trong response, BẮT BUỘC phải fetch /users/me
      if (import.meta.env.DEV) {
        console.log('Fetching user info from /users/me...');
      }
      const apiUrl = import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api';

      try {
        const userRes = await fetch(`${apiUrl}/users/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const userData = await userRes.json();
        if (import.meta.env.DEV) {
          console.log('User me response:', userData);
        }

        if (userRes.ok && userData.code === 200 && userData.data) {
          const userInfo = userData.data;
          
          // Kiểm tra status DISABLED - không cho phép login
          if (userInfo.status === 'DISABLED' || userInfo.status === 'INACTIVE') {
            setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.');
            setIsLoading(false);
            return;
          }
          
          const roleName = userInfo.roleName || userInfo.role?.name || '';
          const normalizedRole = normalizeRole(roleName);

          // Clear logout flag before setting credentials
          localStorage.removeItem('_logout_flag');

          // Lưu user info vào Redux
          dispatch(
            setCredentials({
              token: accessToken,
              refreshToken,
              user: userInfo,
              role: normalizedRole,
              rememberMe: formData.rememberMe,
            })
          );

          // Invalidate user cache to force fresh data
          dispatch(authApi.util.invalidateTags(['User']));

          // Redirect theo role sử dụng utility function
          const redirectPath = getRoleDashboardRoute(roleName);

          if (import.meta.env.DEV) {
            console.log('User role:', roleName, '→ Normalized:', normalizedRole);
            console.log('Redirecting to:', redirectPath);
          }

          // Use window.location.href to force complete page reload and ensure clean state
          window.location.href = redirectPath;
        } else {
          setError(userData.message || 'Không thể lấy thông tin user. Vui lòng thử lại.');
          setIsLoading(false);
        }
      } catch (userError) {
        if (import.meta.env.DEV) {
          console.error('Error fetching user info:', userError);
        }
        setError('Lỗi khi lấy thông tin user. Vui lòng thử lại.');
        setIsLoading(false);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Login error:', err);
      }

      if (err?.status === 'FETCH_ERROR' || err?.error === 'FETCH_ERROR') {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else if (err?.status === 401 || err?.data?.code === 401) {
        setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
      } else {
        setError(
          err?.data?.message ||
          err?.error?.data?.message ||
          'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border border-gray-200/50">
          {/* Logo Section - Không bị ảnh hưởng bởi form state */}
          <div className="text-center mb-8" style={{ pointerEvents: 'auto', opacity: 1 }}>
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-xl border-2 border-gray-100 transform hover:scale-105 transition-transform duration-300 cursor-default" style={{ pointerEvents: 'auto', opacity: 1 }}>
                <img 
                  src="/images/electra-logo1.png" 
                  alt="Electra Logo" 
                  className="h-20 w-36 object-contain cursor-default"
                  style={{ pointerEvents: 'auto', opacity: 1 }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const fallback = e.target.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center hidden">
                  <span className="text-white font-bold text-2xl">E</span>
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h1>
            <p className="text-gray-600 text-lg">Đăng nhập vào tài khoản của bạn</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm animate-shake">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Input
                label="Email"
                type="email"
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="space-y-1">
              <Input
                label="Mật khẩu"
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) =>
                    setFormData({ ...formData, rememberMe: e.target.checked })
                  }
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-2 text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Quên mật khẩu?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <a href="/" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                Về trang chủ
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;

