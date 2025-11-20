import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthFromStorage, getRoleFromPath, removeAuthFromStorage } from '../utils/roleUtils';

// Đảm bảo baseUrl luôn có /api ở cuối và không có trailing slash
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Loại bỏ trailing slash nếu có
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  // Default URL
  return 'https://tiembanhvuive.io.vn/api';
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    // Try to get token from Redux state first
    const state = getState();
    let token = state?.auth?.token;
    let role = state?.auth?.role;
    
    // If no token in state, try to get from sessionStorage based on current path
    if (!token) {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const roleFromPath = getRoleFromPath(currentPath);
      
      if (roleFromPath) {
        const authData = getAuthFromStorage(roleFromPath);
        if (authData && authData.token) {
          token = authData.token;
          role = authData.role;
        }
      }
    }
    
    // Fallback: try to get from any role in sessionStorage
    if (!token && typeof window !== 'undefined') {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('auth_')) {
          const authData = getAuthFromStorage(key.replace('auth_', ''));
          if (authData && authData.token) {
            token = authData.token;
            role = authData.role;
            break;
          }
        }
      }
    }
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Set Content-Type for JSON requests (chỉ khi chưa có Content-Type)
    if (!headers.get('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    const state = api.getState();
    const role = state?.auth?.role;
    
    // Clear token from sessionStorage
    if (role) {
      removeAuthFromStorage(role);
    }
    
    // Also clear localStorage for backward compatibility
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Dispatch logout
    api.dispatch({ type: 'auth/logout' });
  }

  if (result?.error?.status === 403) {
    // Chỉ log trong development mode
    if (import.meta.env.DEV) {
      console.error('Forbidden - insufficient permissions');
    }
  }

  if (result?.error?.status >= 500) {
    // Chỉ log trong development mode
    if (import.meta.env.DEV) {
      console.error('Server error:', result.error);
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Customer',
    'Quotation',
    'Order',
    'Contract',
    'Payment',
    'Vehicle',
    'Product',
    'Inventory',
    'Promotion',
    'User',
    'Branch',
    'TestDrive',
    'Feedback',
    'Color',
    'Staff',
    'Report',
    'Role',
  ],
  endpoints: () => ({}),
});

