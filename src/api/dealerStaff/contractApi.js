import { baseApi } from '../baseApi';
import { getRoleFromPath, getAuthFromStorage } from '../../utils/roleUtils';

export const contractApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo hợp đồng nháp
    createContract: builder.mutation({
      query: (contractData) => ({
        url: '/contracts/contracts',
        method: 'POST',
        body: contractData,
      }),
      invalidatesTags: ['Contract'],
    }),
    // Xem hợp đồng (HTML)
    getContract: builder.query({
      query: (id) => ({
        url: `/contracts/${id}`,
        responseHandler: async (response) => {
          const text = await response.text();
          return text;
        },
      }),
      providesTags: ['Contract'],
    }),
    // Lấy HTML hợp đồng bằng contractId
    getContractHtml: builder.query({
      query: (contractId) => ({
        url: `/contracts/contracts?contractId=${contractId}`,
        responseHandler: async (response) => {
          const text = await response.text();
          return text;
        },
      }),
      providesTags: ['Contract'],
    }),
    // Upload hợp đồng đã ký
    uploadSignedContract: builder.mutation({
      queryFn: async ({ contractId, file }, api, extraOptions, baseQuery) => {
        try {
          // Get base URL and token
          const getBaseUrl = () => {
            const envUrl = import.meta.env.VITE_API_URL;
            if (envUrl) {
              return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
            }
            return 'https://tiembanhvuive.io.vn/api';
          };

          // Get token from Redux state
          const state = api.getState();
          let token = state?.auth?.token;

          // If no token in state, try to get from localStorage
          if (!token && typeof window !== 'undefined') {
            // Try from current path role
            const currentPath = window.location.pathname;
            const roleFromPath = getRoleFromPath(currentPath);
            
            if (roleFromPath) {
              const authData = getAuthFromStorage(roleFromPath);
              if (authData?.token) {
                token = authData.token;
              }
            }

            // Fallback: try any role
            if (!token) {
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('auth_')) {
                  const authData = getAuthFromStorage(key.replace('auth_', ''));
                  if (authData?.token) {
                    token = authData.token;
                    break;
                  }
                }
              }
            }
          }

          // Create FormData
          const formData = new FormData();
          formData.append('file', file);

          // Prepare headers
          const headers = {};
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          // Don't set Content-Type - browser will set it automatically with boundary for FormData

          // Make fetch request
          const response = await fetch(`${getBaseUrl()}/contracts/${contractId}/upload-signed`, {
            method: 'POST',
            headers: headers,
            body: formData,
          });

          // Handle response
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }

          const data = await response.json().catch(() => ({}));
          return { data };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR',
              data: { message: error.message || 'Network error' },
            },
          };
        }
      },
      invalidatesTags: ['Contract'],
    }),
    // Lấy tất cả contracts
    getAllContracts: builder.query({
      query: () => '/contracts/all',
      providesTags: ['Contract'],
    }),
    // Lấy chi tiết contract
    getContractDetail: builder.query({
      query: (id) => `/contracts/detail/${id}`,
      providesTags: ['Contract'],
    }),
    // Lấy danh sách trạng thái contract
    getContractStatuses: builder.query({
      query: () => '/contracts/status',
      providesTags: ['Contract'],
    }),
  }),
});

export const {
  useCreateContractMutation,
  useGetContractQuery,
  useGetContractHtmlQuery,
  useUploadSignedContractMutation,
  useGetAllContractsQuery,
  useGetContractDetailQuery,
  useGetContractStatusesQuery,
} = contractApi;

