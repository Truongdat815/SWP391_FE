import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      // Development mode: Nếu không có token, thử dùng mock token hoặc bỏ qua
      // Chỉ áp dụng cho development
      // Trong môi trường dev, không log warning để tránh spam console
      // Có thể thêm mock token nếu backend cho phép
      // headers.set('Authorization', `Bearer mock-dev-token`);
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
    const token = localStorage.getItem('accessToken');

    if (token) {
      // Clear token và dispatch logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      api.dispatch({ type: 'auth/logout' });
    }
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

