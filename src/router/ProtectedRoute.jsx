import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setCredentials } from '../store/slices/authSlice';
import { getAuthFromStorage, getRoleFromPath } from '../utils/roleUtils';
import AuthDebug from '../components/debug/AuthDebug';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const currentRole = useAppSelector((state) => state.auth.role);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const lastSyncedPathRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get role from path (memoized)
  const roleFromPath = useMemo(() => getRoleFromPath(location.pathname), [location.pathname]);

  // Initialize auth state on first load
  useEffect(() => {
    console.log('ProtectedRoute initialization:', {
      pathname: location.pathname,
      roleFromPath,
      isAuthenticated,
      currentRole,
    });

    // Use a small delay to ensure Redux store is fully initialized
    const initTimer = setTimeout(() => {
      // Check if we need to sync auth state
      if (roleFromPath) {
        const authData = getAuthFromStorage(roleFromPath);
        console.log('Auth data from storage:', authData);
        
        if (authData && authData.token && (!isAuthenticated || currentRole !== roleFromPath)) {
          console.log('Dispatching setCredentials...');
          dispatch(setCredentials({
            user: authData.user,
            token: authData.token,
            refreshToken: authData.refreshToken,
            role: authData.role,
          }));
        }
      }
      
      // Mark as initialized after checking
      setIsInitialized(true);
    }, 100); // Small delay to ensure Redux is ready

    return () => clearTimeout(initTimer);
  }, []); // Only run on mount

  // Sync auth state with current path's role (only when path changes or role mismatch)
  useEffect(() => {
    if (!isInitialized) return;
    
    // Skip if we've already synced for this exact path and role matches
    if (lastSyncedPathRef.current === location.pathname && currentRole === roleFromPath) {
      return;
    }

    // Only sync if we're on a role-specific route
    if (roleFromPath) {
      const authData = getAuthFromStorage(roleFromPath);
      
      // If we have auth data for this role but Redux state doesn't match, update it
      if (authData && authData.token) {
        // Only sync if the current role doesn't match the path's role
        // This prevents unnecessary dispatches when state is already correct
        if (currentRole !== roleFromPath || !isAuthenticated) {
          dispatch(setCredentials({
            user: authData.user,
            token: authData.token,
            refreshToken: authData.refreshToken,
            role: authData.role,
          }));
        }
        // Mark this path as synced
        lastSyncedPathRef.current = location.pathname;
      } else {
        // No auth data for this role, reset sync tracking
        lastSyncedPathRef.current = null;
      }
    } else {
      // Not a role-specific route, reset sync tracking
      lastSyncedPathRef.current = null;
    }
  }, [location.pathname, roleFromPath, currentRole, isAuthenticated, dispatch, isInitialized]);

  // Check authentication from localStorage if Redux state is not authenticated
  const shouldBeAuthenticated = useMemo(() => {
    console.log('Checking shouldBeAuthenticated:', {
      isAuthenticated,
      roleFromPath,
      isInitialized
    });
    
    if (isAuthenticated) {
      return true;
    }
    
    if (roleFromPath) {
      const authData = getAuthFromStorage(roleFromPath);
      console.log('Auth data check:', authData);
      return !!(authData && authData.token);
    }
    
    return false;
  }, [isAuthenticated, roleFromPath]);

  // Show loading or wait until initialization is complete
  if (!isInitialized) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!shouldBeAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Nếu user ở trạng thái PENDING và không đang ở trang change-password, redirect đến change-password
  if (user && user.status === 'PENDING' && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return (
    <>
      <AuthDebug />
      {children}
    </>
  );
};

export default ProtectedRoute;

