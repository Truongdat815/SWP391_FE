import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'https://tiembanhvuive.io.vn/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
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
    console.error('Forbidden - insufficient permissions');
  }

  if (result?.error?.status >= 500) {
    console.error('Server error:', result.error);
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

