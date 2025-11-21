import { useEffect, useRef } from 'react';
import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { setCredentials, logout } from '../store/slices/authSlice';
import { useRefreshTokenMutation } from '../api/auth/authApi';
import { getTokenExpirationInfo } from '../utils/roleUtils';

/**
 * Hook to automatically refresh tokens when they're about to expire
 */
export const useTokenRefresh = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, role, refreshToken } = useAppSelector((state) => state.auth);
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const refreshTimeoutRef = useRef(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !role || !refreshToken) {
      // Clear any existing timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      return;
    }

    const scheduleTokenRefresh = () => {
      const tokenInfo = getTokenExpirationInfo(role);
      
      if (!tokenInfo || tokenInfo.isExpired) {
        // Token is already expired, logout
        dispatch(logout());
        return;
      }

      // Schedule refresh 5 minutes before expiration
      const refreshTime = Math.max(tokenInfo.timeUntilExpiry - (5 * 60 * 1000), 60000); // At least 1 minute
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(async () => {
        if (isRefreshingRef.current) return;
        
        try {
          isRefreshingRef.current = true;
          
          const response = await refreshTokenMutation({
            refreshToken: refreshToken
          }).unwrap();

          if (response.code === 200 && response.data) {
            const { accessToken, refreshToken: newRefreshToken, user } = response.data;
            
            dispatch(setCredentials({
              token: accessToken,
              refreshToken: newRefreshToken || refreshToken,
              user,
              role,
              rememberMe: tokenInfo.rememberMe
            }));

            // Schedule next refresh
            scheduleTokenRefresh();
          } else {
            // Refresh failed, logout
            dispatch(logout());
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Refresh failed, logout
          dispatch(logout());
        } finally {
          isRefreshingRef.current = false;
        }
      }, refreshTime);
    };

    // Initial schedule
    scheduleTokenRefresh();

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [isAuthenticated, role, refreshToken, dispatch, refreshTokenMutation]);

  // Also check token validity on window focus
  useEffect(() => {
    const handleFocus = () => {
      if (!isAuthenticated || !role) return;
      
      const tokenInfo = getTokenExpirationInfo(role);
      if (tokenInfo && tokenInfo.isExpired) {
        dispatch(logout());
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, role, dispatch]);
};
