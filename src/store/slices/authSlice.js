import { createSlice } from '@reduxjs/toolkit';
import { getAuthFromStorage, getRoleFromPath, setAuthToStorage, removeAuthFromStorage } from '../../utils/roleUtils';

// Get initial auth state from sessionStorage
const getInitialAuth = () => {
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
      };
    }
  }
  
  // Fallback: check all roles in sessionStorage
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('auth_')) {
      const authData = getAuthFromStorage(key.replace('auth_', ''));
      if (authData && authData.token) {
        return {
          user: authData.user,
          token: authData.token,
          refreshToken: authData.refreshToken,
          role: authData.role,
          isAuthenticated: true,
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
  };
};

const initialAuth = getInitialAuth();

const initialState = {
  user: initialAuth.user,
  token: initialAuth.token,
  refreshToken: initialAuth.refreshToken,
  isAuthenticated: initialAuth.isAuthenticated,
  role: initialAuth.role,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, refreshToken, role } = action.payload;
      
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || state.refreshToken;
      state.role = role;
      state.isAuthenticated = true;
      
      // Save to sessionStorage with role-based key
      if (role && token) {
        setAuthToStorage(role, {
          user,
          token,
          refreshToken: refreshToken || state.refreshToken,
          role,
        });
      }
    },
    logout: (state) => {
      const role = state.role;
      
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.isAuthenticated = false;
      
      // Remove from sessionStorage
      if (role) {
        removeAuthFromStorage(role);
      }
      
      // Also clear localStorage for backward compatibility
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

