import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setCredentials } from '../store/slices/authSlice';
import { getAuthFromStorage, getRoleFromPath } from '../utils/roleUtils';

const ProtectedRouteSimple = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const currentRole = useAppSelector((state) => state.auth.role);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if there's a logout flag - if yes, don't restore any auth state
      const logoutFlag = localStorage.getItem('_logout_flag');
      if (logoutFlag) {
        setIsLoading(false);
        return;
      }
      
      const roleFromPath = getRoleFromPath(location.pathname);
      
      // Only restore from localStorage if we're not authenticated AND there's no current role
      // This prevents restoring old auth data after logout
      if (roleFromPath && !isAuthenticated && !currentRole) {
        const authData = getAuthFromStorage(roleFromPath);
        
        if (authData && authData.token) {
          dispatch(setCredentials({
            user: authData.user,
            token: authData.token,
            refreshToken: authData.refreshToken,
            role: authData.role,
          }));
        }
      }
      
      // Wait a bit for Redux to update
      setTimeout(() => {
        setIsLoading(false);
      }, 200);
    };

    checkAuth();
  }, [location.pathname, dispatch, isAuthenticated, currentRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if there's a logout flag - if yes, don't allow access
  const logoutFlag = localStorage.getItem('_logout_flag');
  if (logoutFlag) {
    return <Navigate to="/login" replace />;
  }
  
  const roleFromPath = getRoleFromPath(location.pathname);
  // Only check localStorage if Redux state is not authenticated
  // This prevents using stale localStorage data after logout
  const hasValidAuth = isAuthenticated || (!isAuthenticated && !currentRole && roleFromPath && getAuthFromStorage(roleFromPath)?.token);

  if (!hasValidAuth) {
    return <Navigate to="/login" replace />;
  }

  // Check for pending status
  if (user && user.status === 'PENDING' && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

export default ProtectedRouteSimple;
