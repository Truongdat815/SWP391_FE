import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthFromStorage, getRoleFromPath, removeAuthFromStorage, setAuthToStorage } from '../utils/roleUtils';
import { setCredentials } from '../store/slices/authSlice';

// Mutex để tránh multiple refresh calls đồng thời
let isRefreshing = false;
let refreshPromise = null;
let failedQueue = [];
let lastRefreshTime = 0;
const REFRESH_COOLDOWN = 30000; // 30 seconds cooldown

// Đảm bảo baseUrl luôn có /api ở cuối và không có trailing slash
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Loại bỏ trailing slash nếu có
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  // Trong development, sử dụng proxy qua Vite (tránh CORS)
  // Trong production, sử dụng URL trực tiếp
  if (import.meta.env.DEV) {
    return '/api'; // Sử dụng proxy từ Vite
  }
  // Default URL cho production
  return 'https://tiembanhvuive.io.vn/api';
};

const baseQuery = fetchBaseQuery({
  baseUrl: getBaseUrl(),
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Skip Authorization header for refresh token requests
    if (endpoint === 'refreshToken' || (typeof endpoint === 'string' && endpoint.includes('/auth/refresh'))) {
      headers.set('Content-Type', 'application/json');
      return headers;
    }

    // Try to get token from Redux state first
    const state = getState();
    let token = state?.auth?.token;
    let role = state?.auth?.role;

    // If no token in state, try to get from localStorage based on current path
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

    // Fallback: try to get from any role in localStorage
    if (!token && typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
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

    // Check if this is a FormData upload request
    // Don't set Content-Type for upload endpoints - browser will set it automatically with boundary
    const isUploadRequest = typeof endpoint === 'string' && (
      endpoint.includes('upload-signed') || 
      endpoint.includes('upload-contract') ||
      endpoint.includes('upload-receipt') ||
      endpoint.includes('upload-image') ||
      endpoint.includes('upload-model-color-image')
    );

    // Set Content-Type for JSON requests (chỉ khi chưa có Content-Type và không phải upload request)
    if (!headers.get('Content-Type') && !isUploadRequest) {
      headers.set('Content-Type', 'application/json');
    }

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

  // Xử lý đặc biệt cho FormData upload (upload-signed, upload-contract, etc.)
  // Xóa Content-Type header để browser tự động set với boundary cho FormData
  if (typeof args === 'object' && args?.body instanceof FormData) {
    const modifiedArgs = {
      ...args,
      headers: {
        ...args.headers,
      },
    };
    // Xóa Content-Type nếu có để browser tự động set
    if (modifiedArgs.headers) {
      delete modifiedArgs.headers['Content-Type'];
      delete modifiedArgs.headers['content-type'];
    }
    // Gọi baseQuery với args đã được modify
    let result = await baseQuery(modifiedArgs, api, extraOptions);
    return result;
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

  // ============ AUTO-REFRESH TOKEN LOGIC ============
  if (result?.error?.status === 401) {
    const state = api.getState();
    let refreshToken = state?.auth?.refreshToken;
    const role = state?.auth?.role;
    const user = state?.auth?.user;

    // Fallback: try to get refresh token from localStorage if not in state
    if (!refreshToken && typeof window !== 'undefined') {
      refreshToken = localStorage.getItem('refreshToken');
    }

    // Fallback: try to get refresh token from localStorage based on role
    if (!refreshToken && role && typeof window !== 'undefined') {
      const authData = getAuthFromStorage(role);
      if (authData?.refreshToken) {
        refreshToken = authData.refreshToken;
      }
    }

    if (import.meta.env.DEV) {
      console.log('🔍 Refresh token found:', !!refreshToken);
    }

    // Nếu có refreshToken, thử refresh
    if (refreshToken) {
      // Kiểm tra cooldown để tránh refresh quá thường xuyên
      const now = Date.now();
      if (now - lastRefreshTime < REFRESH_COOLDOWN) {
        if (import.meta.env.DEV) {
          console.log('🚫 Refresh cooldown active, skipping refresh');
        }
        return result;
      }
      // Nếu đang refresh, thêm request vào queue và đợi
      if (isRefreshing) {
        if (import.meta.env.DEV) {
          console.log('⏳ Adding request to queue, waiting for ongoing refresh...');
        }
        
        return new Promise((resolve) => {
          failedQueue.push({
            resolve: (token) => {
              if (token) {
                // Retry với token mới
                baseQuery(args, api, extraOptions).then(resolve);
              } else {
                // Refresh thất bại
                resolve(result);
              }
            }
          });
        });
      }

      // Bắt đầu refresh
      isRefreshing = true;
      lastRefreshTime = now;
      refreshPromise = (async () => {
        try {
          if (import.meta.env.DEV) {
            console.log('🔄 Attempting to refresh token...');
          }

          // Gọi refresh token API - sử dụng fetch trực tiếp để tránh xung đột headers
          let refreshResult;
          try {
            const response = await fetch(`${getBaseUrl()}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // Không gửi Authorization header
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
              const data = await response.json();
              refreshResult = { data };
            } else {
              const errorData = await response.json().catch(() => ({}));
              refreshResult = { 
                error: { 
                  status: response.status, 
                  data: errorData 
                } 
              };
            }
          } catch (fetchError) {
            if (import.meta.env.DEV) {
              console.error('❌ Fetch error during refresh:', fetchError);
            }
            refreshResult = { 
              error: { 
                status: 'FETCH_ERROR', 
                data: { message: fetchError.message } 
              } 
            };
          }

          if (import.meta.env.DEV) {
            console.log('🔍 Refresh response:', refreshResult);
            console.log('🔍 Response data structure:', {
              hasData: !!refreshResult?.data,
              code: refreshResult?.data?.code,
              hasToken: !!refreshResult?.data?.data?.token,
              hasAccessToken: !!refreshResult?.data?.data?.accessToken,
            });
          }

          // Check for successful refresh - handle different response formats
          if (refreshResult?.data) {
            const responseData = refreshResult.data;
            let newAccessToken, newRefreshToken;

            // Handle different API response formats
            if (responseData.code === 200 && responseData.data?.token) {
              // Format: { code: 200, data: { token, expiryDate } } - Refresh endpoint format
              newAccessToken = responseData.data.token;
              newRefreshToken = refreshToken; // Keep the same refresh token
            } else if (responseData.code === 200 && responseData.data?.accessToken) {
              // Format: { code: 200, data: { accessToken, refreshToken } } - Login endpoint format
              newAccessToken = responseData.data.accessToken;
              newRefreshToken = responseData.data.refreshToken || refreshToken;
            } else if (responseData.accessToken) {
              // Format: { accessToken, refreshToken }
              newAccessToken = responseData.accessToken;
              newRefreshToken = responseData.refreshToken || refreshToken;
            } else if (responseData.token) {
              // Format: { token, expiryDate }
              newAccessToken = responseData.token;
              newRefreshToken = refreshToken; // Keep the same refresh token
            } else if (responseData.access_token) {
              // Format: { access_token, refresh_token }
              newAccessToken = responseData.access_token;
              newRefreshToken = responseData.refresh_token || refreshToken;
            }

            if (newAccessToken) {
              if (import.meta.env.DEV) {
                console.log('✅ Token refreshed successfully');
              }

              // Update Redux state
              api.dispatch(setCredentials({
                user,
                token: newAccessToken,
                refreshToken: newRefreshToken,
                role,
              }));

              // Update localStorage
              if (role) {
                setAuthToStorage(role, {
                  user,
                  token: newAccessToken,
                  refreshToken: newRefreshToken,
                  role,
                });
              }

              // Update localStorage for backward compatibility
              if (typeof window !== 'undefined') {
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
              }

              return true; // Refresh thành công
            }
          }

          // Refresh failed
          if (import.meta.env.DEV) {
            console.error('❌ Refresh token failed - No valid token found:', {
              status: refreshResult?.error?.status,
              responseData: refreshResult?.data,
              error: refreshResult?.error,
              expectedFormats: [
                '{ code: 200, data: { token, expiryDate } }',
                '{ code: 200, data: { accessToken, refreshToken } }',
                '{ accessToken, refreshToken }',
                '{ token, expiryDate }',
                '{ access_token, refresh_token }'
              ]
            });
          }
          return false; // Refresh thất bại
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error('❌ Refresh token error:', error);
          }
          return false;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();

      const refreshSuccess = await refreshPromise;

      // Xử lý tất cả requests trong queue
      if (refreshSuccess) {
        // Thông báo cho tất cả requests trong queue
        failedQueue.forEach(({ resolve }) => resolve(true));
        failedQueue = [];
        
        // Retry request gốc với token mới
        result = await baseQuery(args, api, extraOptions);
        return result;
      } else {
        // Thông báo refresh thất bại cho tất cả requests trong queue
        failedQueue.forEach(({ resolve }) => resolve(false));
        failedQueue = [];
        // Refresh thất bại → Logout
        if (import.meta.env.DEV) {
          console.log('🚪 Refresh failed, logging out...');
        }

        // Clear storage
        if (role) {
          removeAuthFromStorage(role);
        }
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }

        // Dispatch logout
        api.dispatch({ type: 'auth/logout' });

        return result;
      }
    } else {
      // Không có refreshToken → Logout ngay
      if (import.meta.env.DEV) {
        console.log('🚪 No refresh token, logging out...');
      }

      // Clear storage
      if (role) {
        removeAuthFromStorage(role);
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }

      // Dispatch logout
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
    'StoreStock',
  ],
  endpoints: () => ({}),
});

