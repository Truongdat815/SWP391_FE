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
  fetchFn: async (input, init) => {
    // Xử lý đặc biệt cho các endpoint create-contract
    const url = typeof input === 'string' ? input : input?.url || '';
    if (url.includes('create-contract')) {
      // Xóa Content-Type header và body nếu body không tồn tại
      if (init) {
        // Xóa body nếu là undefined, null, hoặc empty string
        if (init.body === undefined || init.body === null || init.body === '') {
          delete init.body;
        }
        // Xóa Content-Type header để tránh lỗi 415
        if (init.headers) {
          const headers = new Headers(init.headers);
          headers.delete('Content-Type');
          headers.delete('content-type');
          init.headers = headers;
        }
      }
    }
    // Gọi fetch mặc định
    return fetch(input, init);
  },
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
    
    // KHÔNG set Content-Type mặc định
    // RTK Query sẽ tự động set Content-Type khi có body
    // Việc set Content-Type khi không có body sẽ gây lỗi 415 Unsupported Media Type
    
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  // Xử lý đặc biệt cho các endpoint create-contract (không có body)
  // Xóa Content-Type header nếu request không có body để tránh lỗi 415
  if (typeof args === 'object' && args?.url && args?.url.includes('create-contract')) {
    // Kiểm tra xem có body không (undefined, null, hoặc không có field body)
    const hasBody = args.body !== undefined && args.body !== null && args.body !== '';
    
    if (!hasBody) {
      // Tạo một args mới không có Content-Type trong headers
      const modifiedArgs = {
        ...args,
        headers: {
          ...args.headers,
        },
      };
      // Xóa Content-Type nếu có
      if (modifiedArgs.headers) {
        delete modifiedArgs.headers['Content-Type'];
        delete modifiedArgs.headers['content-type'];
      }
      // Xóa body field nếu có
      if (modifiedArgs.body === undefined || modifiedArgs.body === null) {
        delete modifiedArgs.body;
      }
      // Gọi baseQuery với args đã được modify
      let result = await baseQuery(modifiedArgs, api, extraOptions);
      return result;
    }
  }
  
  let result = await baseQuery(args, api, extraOptions);

  // Xử lý lỗi 404 cho các endpoint có thể không có dữ liệu (EVM Staff)
  // Các endpoint này có thể trả về 404 khi không có store hoặc dữ liệu
  const url = typeof args === 'string' ? args : args?.url || '';
  const allow404Endpoints = [
    '/orders/all',
    '/store-stocks/all',
    '/inventory-transactions/all',
  ];

  if (result?.error?.status === 404 && allow404Endpoints.some(endpoint => url.includes(endpoint))) {
    // Trả về response hợp lệ với dữ liệu rỗng thay vì error
    return {
      data: { data: [], code: 200, message: 'No data found' },
      meta: result.meta,
    };
  }

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
    'Model',
    'Store',
  ],
  endpoints: () => ({}),
});

