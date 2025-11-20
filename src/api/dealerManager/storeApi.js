import { baseApi } from '../baseApi';

export const dmStoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy thông tin store của dealer manager hiện tại (từ /stores/all, chỉ có 1 store)
    getMyStore: builder.query({
      query: () => '/stores/all',
      providesTags: ['Branch'],
      transformResponse: (response) => {
        // Lấy store đầu tiên từ array (dealer manager chỉ có 1 store)
        const stores = response?.data || [];
        return { data: stores[0] || null };
      },
    }),
    // Cập nhật thông tin store
    updateMyStore: builder.mutation({
      query: ({ storeId, ...storeData }) => ({
        url: `/stores/update/${storeId}`,
        method: 'PUT',
        body: storeData,
      }),
      invalidatesTags: ['Branch'],
    }),
    // Lấy doanh thu tháng của store (từ /stores/revenue/monthly, lọc store của mình)
    getMonthlyRevenue: builder.query({
      query: () => '/stores/revenue/monthly',
      providesTags: ['Branch'],
      transformResponse: (response) => {
        // Lấy revenue của store đầu tiên (dealer manager chỉ có 1 store)
        const revenues = response?.data || [];
        return { data: revenues[0] || null };
      },
    }),
  }),
});

export const {
  useGetMyStoreQuery,
  useUpdateMyStoreMutation,
  useGetMonthlyRevenueQuery,
} = dmStoreApi;

