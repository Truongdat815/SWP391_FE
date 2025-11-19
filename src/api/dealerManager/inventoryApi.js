import { baseApi } from '../baseApi';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả store stocks của store hiện tại
    getAllStoreStocks: builder.query({
      query: () => '/store-stocks/all',
      providesTags: ['Inventory'],
    }),
    // Lấy số lượng tồn kho theo model và color
    getStockQuantity: builder.query({
      query: ({ modelId, colorId }) => ({
        url: '/store-stocks/quantity',
        method: 'POST',
        body: { modelId, colorId },
      }),
      providesTags: ['Inventory'],
    }),
    // Cập nhật giá của store stock
    updateStockPrice: builder.mutation({
      query: ({ storeStockId, price }) => ({
        url: '/store-stocks/update-price',
        method: 'PUT',
        body: { storeStockId, price },
      }),
      invalidatesTags: ['Inventory'],
    }),
    // Lấy tất cả inventory transactions
    getAllInventoryTransactions: builder.query({
      query: () => '/inventory-transactions/all',
      providesTags: ['Inventory'],
    }),
    // Tạo inventory transaction (yêu cầu chuyển kho)
    createInventoryTransaction: builder.mutation({
      query: (transactionData) => ({
        url: '/inventory-transactions/create',
        method: 'POST',
        body: transactionData,
      }),
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetAllStoreStocksQuery,
  useGetStockQuantityQuery,
  useUpdateStockPriceMutation,
  useGetAllInventoryTransactionsQuery,
  useCreateInventoryTransactionMutation,
} = inventoryApi;

