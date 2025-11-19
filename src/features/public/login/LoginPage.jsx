import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../hooks/useAppDispatch';
import { setCredentials } from '../../../store/slices/authSlice';
import { useLoginMutation } from '../../../api/auth/authApi';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Card from '../../../components/ui/Card';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login] = useLoginMutation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

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
      if (user && user.roleName) {
        const roleName = user.roleName || user.role?.name || '';
        dispatch(
          setCredentials({
            token: accessToken,
            refreshToken,
            user,
            role: roleName,
          })
        );
        
        // Redirect theo role
        let redirectPath = '/';
        if (roleName === 'ADMIN' || roleName === 'Admin' || roleName === 'admin') {
          redirectPath = '/admin/dashboard';
        } else if (roleName === 'DEALER_STAFF' || roleName === 'Dealer Staff') {
          redirectPath = '/dealer-staff/dashboard';
        } else if (roleName === 'DEALER_MANAGER' || roleName === 'Dealer Manager') {
          redirectPath = '/dealer-manager/dashboard';
        } else if (roleName === 'EVM_STAFF' || roleName === 'EVM Staff') {
          redirectPath = '/evm-staff/dashboard';
        }
        
        if (import.meta.env.DEV) {
          console.log('Redirecting to:', redirectPath);
        }
        navigate(redirectPath);
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
          const roleName = userInfo.roleName || userInfo.role?.name || '';
          
          // Lưu user info vào Redux
          dispatch(
            setCredentials({
              token: accessToken,
              refreshToken,
              user: userInfo,
              role: roleName,
            })
          );
          
          // Redirect theo role
          let redirectPath = '/';
          if (roleName === 'ADMIN' || roleName === 'Admin' || roleName === 'admin') {
            redirectPath = '/admin/dashboard';
          } else if (roleName === 'DEALER_STAFF' || roleName === 'Dealer Staff') {
            redirectPath = '/dealer-staff/dashboard';
          } else if (roleName === 'DEALER_MANAGER' || roleName === 'Dealer Manager') {
            redirectPath = '/dealer-manager/dashboard';
          } else if (roleName === 'EVM_STAFF' || roleName === 'EVM Staff') {
            redirectPath = '/evm-staff/dashboard';
          }
          
          if (import.meta.env.DEV) {
            console.log('Redirecting to:', redirectPath);
          }
          navigate(redirectPath);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Electra</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h1>
          <p className="text-gray-600">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="Nhập email của bạn"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Về trang chủ
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;

