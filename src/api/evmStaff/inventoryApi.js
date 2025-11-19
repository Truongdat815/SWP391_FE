import { baseApi } from '../baseApi';

export const evmInventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả store stocks (EVM Staff xem tất cả)
    getAllStoreStocks: builder.query({
      query: () => '/store-stocks/all',
      providesTags: ['Inventory'],
    }),
    // Lấy inventory transactions
    getAllInventoryTransactions: builder.query({
      query: () => '/inventory-transactions/all',
      providesTags: ['Inventory'],
    }),
    // Lấy inventory transactions theo khoảng thời gian
    getInventoryTransactionsByDateRange: builder.query({
      query: ({ start, end }) => ({
        url: '/inventory-transactions/date-range',
        params: { start, end },
      }),
      providesTags: ['Inventory'],
    }),
    // Chấp nhận yêu cầu chuyển kho
    acceptInventoryRequest: builder.mutation({
      query: (inventoryId) => ({
        url: `/inventory-transactions/accept/${inventoryId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Inventory'],
    }),
    // Từ chối yêu cầu chuyển kho
    rejectInventoryRequest: builder.mutation({
      query: (inventoryId) => ({
        url: `/inventory-transactions/reject/${inventoryId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetAllStoreStocksQuery,
  useGetAllInventoryTransactionsQuery,
  useGetInventoryTransactionsByDateRangeQuery,
  useAcceptInventoryRequestMutation,
  useRejectInventoryRequestMutation,
} = evmInventoryApi;

