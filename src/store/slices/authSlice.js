import { createSlice } from '@reduxjs/toolkit';
import { getAuthFromStorage, getRoleFromPath, setAuthToStorage, removeAuthFromStorage } from '../../utils/roleUtils';

// Get initial auth state from localStorage
const getInitialAuth = () => {
  // Clean up any expired tokens first
  try {
    const { cleanupExpiredTokens } = require('../../utils/roleUtils');
    cleanupExpiredTokens();
  } catch (error) {
    console.warn('Could not cleanup expired tokens:', error);
  }
  
  // Try to get role from current path (if available)
  const currentPath = window.location.pathname;
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
  
  // Fallback: check all roles in localStorage
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
      
      // Remove from localStorage
      if (role) {
        removeAuthFromStorage(role);
      }
      
      // Also clear old localStorage keys for backward compatibility
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

