import { createSlice } from '@reduxjs/toolkit';
import { getAuthFromStorage, getRoleFromPath, setAuthToStorage, removeAuthFromStorage, cleanupExpiredTokens } from '../../utils/roleUtils';

// Get initial auth state from localStorage
const getInitialAuth = () => {
  // Check if there's a logout flag - if yes, don't restore any auth state
  const logoutFlag = localStorage.getItem('_logout_flag');
  if (logoutFlag) {
    // Clear the flag and return empty state
    localStorage.removeItem('_logout_flag');
    return {
      user: null,
      token: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
      rememberMe: false,
    };
  }
  
  // Clean up any expired tokens first
  try {
    cleanupExpiredTokens();
  } catch (error) {
    console.warn('Could not cleanup expired tokens:', error);
  }
  
  // If we're on login page, don't restore any auth state to prevent issues
  const currentPath = window.location.pathname;
  if (currentPath === '/login' || currentPath === '/') {
    return {
      user: null,
      token: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
      rememberMe: false,
    };
  }
  
  // Try to get role from current path (if available)
  const roleFromPath = getRoleFromPath(currentPath);
  
  if (roleFromPath) {
    const authData = getAuthFromStorage(roleFromPath);
    if (authData) {
      return {
        user: authData.user,
        token: authData.token,
        refreshToken: authData.refreshToken,
        role: authData.role,
        isAuthenticated: !!authData.token,
        rememberMe: authData.rememberMe || false,
      };
    }
  }
  
  // Fallback: check all roles in localStorage (only if not on login page)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('auth_')) {
      const authData = getAuthFromStorage(key.replace('auth_', ''));
      if (authData && authData.token) {
        return {
          user: authData.user,
          token: authData.token,
          refreshToken: authData.refreshToken,
          role: authData.role,
          isAuthenticated: true,
          rememberMe: authData.rememberMe || false,
        };
      }
    }
  }
  
  return {
    user: null,
    token: null,
    refreshToken: null,
    role: null,
    isAuthenticated: false,
    rememberMe: false,
  };
};

const initialAuth = getInitialAuth();

const initialState = {
  user: initialAuth.user,
  token: initialAuth.token,
  refreshToken: initialAuth.refreshToken,
  isAuthenticated: initialAuth.isAuthenticated,
  role: initialAuth.role,
  rememberMe: initialAuth.rememberMe,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken, role, rememberMe } = action.payload;
      
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || state.refreshToken;
      state.role = role;
      state.isAuthenticated = true;
      state.rememberMe = rememberMe !== undefined ? rememberMe : state.rememberMe;
      
      // Save to localStorage with role-based key and expiration
      if (role && token) {
        setAuthToStorage(role, {
          user,
          token,
          refreshToken: refreshToken || state.refreshToken,
          role,
        }, state.rememberMe);
      }
    },
    logout: (state) => {
      const role = state.role;
      
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.rememberMe = false;
      
      // Set logout flag to prevent auto-restore
      localStorage.setItem('_logout_flag', Date.now().toString());
      
      // Remove from localStorage - clear ALL auth data
      if (role) {
        removeAuthFromStorage(role);
      }
      
      // Clear ALL possible auth keys to prevent cross-contamination
      const allRoles = ['ADMIN', 'DEALER_STAFF', 'DEALER_MANAGER', 'EVM_STAFF'];
      allRoles.forEach(r => {
        localStorage.removeItem(`auth_${r}`);
      });
      
      // Also clear old localStorage keys for backward compatibility
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth_default');
      
      // Clear sessionStorage as well
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.clear();
      }
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearAllAuth: (state) => {
      // Force clear all auth state and storage
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.rememberMe = false;
      
      // Set logout flag to prevent auto-restore
      localStorage.setItem('_logout_flag', Date.now().toString());
      
      // Clear ALL possible auth keys
      const allRoles = ['ADMIN', 'DEALER_STAFF', 'DEALER_MANAGER', 'EVM_STAFF'];
      allRoles.forEach(r => {
        localStorage.removeItem(`auth_${r}`);
      });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth_default');
      
      // Clear sessionStorage as well
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.clear();
      }
    },
  },
});

export const { setCredentials, logout, updateUser, clearAllAuth } = authSlice.actions;
export default authSlice.reducer;

