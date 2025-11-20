import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setCredentials } from '../store/slices/authSlice';
import { getAuthFromStorage, getRoleFromPath } from '../utils/roleUtils';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const currentRole = useAppSelector((state) => state.auth.role);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const lastSyncedPathRef = useRef(null);

  // Get role from path (memoized)
  const roleFromPath = useMemo(() => getRoleFromPath(location.pathname), [location.pathname]);

  // Sync auth state with current path's role (only when path changes or role mismatch)
  useEffect(() => {
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
  }, [location.pathname, roleFromPath, currentRole, isAuthenticated, dispatch]);

  // Check authentication from sessionStorage if Redux state is not authenticated
  const shouldBeAuthenticated = useMemo(() => {
    if (isAuthenticated) {
      return true;
    }
    
    if (roleFromPath) {
      const authData = getAuthFromStorage(roleFromPath);
      return !!(authData && authData.token);
    }
    
    return false;
  }, [isAuthenticated, roleFromPath]);

  if (!shouldBeAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu user ở trạng thái PENDING và không đang ở trang change-password, redirect đến change-password
  if (user && user.status === 'PENDING' && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return children;
};

export default ProtectedRoute;

