import { baseApi } from '../baseApi';

export const evmStoreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả stores (EVM Staff xem tất cả)
    getAllStores: builder.query({
      query: () => '/stores/all',
      providesTags: ['Branch'],
    }),
    // Lấy stores đang hoạt động
    getActiveStores: builder.query({
      query: () => '/stores/active',
      providesTags: ['Branch'],
    }),
    // Lấy store theo tên
    getStoreByName: builder.query({
      query: (storeName) => `/stores/${storeName}`,
      providesTags: ['Branch'],
    }),
    // Lấy doanh thu tháng của tất cả stores
    getMonthlyRevenue: builder.query({
      query: () => '/stores/revenue/monthly',
      providesTags: ['Branch'],
    }),
    // Lấy danh sách trạng thái store
    getStoreStatuses: builder.query({
      query: () => '/stores/status',
      providesTags: ['Branch'],
    }),
  }),
});

export const {
  useGetAllStoresQuery,
  useGetActiveStoresQuery,
  useGetStoreByNameQuery,
  useGetMonthlyRevenueQuery,
  useGetStoreStatusesQuery,
} = evmStoreApi;

