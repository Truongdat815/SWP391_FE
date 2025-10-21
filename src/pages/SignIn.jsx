import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, clearError } from '../store/slices/authSlice';
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/images/logo.png";
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { PageTransition } from '../components/Animated';

function SignIn() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { getDefaultRoute } = useAuth();
  const { status, error } = useSelector(state => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    dispatch(clearError());
    
    // Mock login for testing - remove this when you have real credentials
    if (formData.email === 'test@admin.com' && formData.password === '123456') {
      const mockUser = {
        userId: 1,
        storeId: 1,
        roleId: 1,
        fullName: 'Test Admin',
        roleName: 'admin',
        email: 'test@admin.com'
      };
      
      // Save to localStorage
      localStorage.setItem('access_token', 'mock_token');
      localStorage.setItem('refresh_token', 'mock_refresh_token');
      localStorage.setItem('user_info', JSON.stringify(mockUser));
      
      console.log('Mock login successful, navigating to /admin');
      navigate('/admin');
      return;
    }
    
    try {
      const result = await dispatch(loginThunk(formData));
      
      console.log('Login result:', result); // Debug log
      
      if (loginThunk.fulfilled.match(result)) {
        console.log('Login successful, navigating...'); // Debug log
        
        // Get user info from result
        const user = result.payload.user;
        console.log('User info:', user); // Debug log
        
        // Navigate based on role (corrected mapping)
        const roleRoutes = {
          'admin': '/admin',
          'dealer manager': '/dealer-manager',
          'dealer-manager': '/dealer-manager', 
          'dealer staff': '/dealer-staff',
          'dealer-staff': '/dealer-staff',
          'evm staff': '/evm-staff',
          'evm-staff': '/evm-staff'
        };
        
        // Also check by roleId for more reliable mapping
        const roleIdRoutes = {
          1: '/admin',           // Admin
          2: '/evm-staff',       // EVM Staff  
          3: '/dealer-manager',  // Dealer Manager
          4: '/dealer-staff'     // Dealer Staff
        };
        
        // Try roleId first, then fallback to roleName
        let targetRoute = '/dealer-staff'; // default
        
        if (user.roleId && roleIdRoutes[user.roleId]) {
          targetRoute = roleIdRoutes[user.roleId];
        } else {
          const userRole = user.roleName?.toLowerCase();
          targetRoute = roleRoutes[userRole] || '/dealer-staff';
        }
        
        console.log('User roleId:', user.roleId); // Debug log
        console.log('User roleName:', user.roleName); // Debug log
        console.log('Target route:', targetRoute); // Debug log
        console.log('Full user object:', user); // Debug log
        
        // Force navigation with timeout to ensure state is updated
        setTimeout(() => {
          navigate(targetRoute);
        }, 100);
      } else {
        console.log('Login failed:', result); // Debug log
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
        {/* Back to Home */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Quay lại trang chủ
          </Link>
        </div>

        {/* Sign In Card */}
        <Card>
          <CardContent className="p-8">
          <div className="text-center mb-8">
            <img src={logo} alt="Electra" className="h-10 w-auto mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Đăng nhập
            </h2>
            <p className="text-gray-600">
              Chào mừng trở lại với <span className="text-green-600">Electra</span>
            </p>
          </div>
        
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-gray-900"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded bg-white text-gray-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            <Button type="submit" disabled={status === 'loading'} className="w-full">
              {status === 'loading' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                  </svg>
                  Đăng nhập
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

export default SignIn;