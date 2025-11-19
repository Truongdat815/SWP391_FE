import { baseApi } from '../baseApi';

export const storeStockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả store stocks
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
  }),
});

export const {
  useGetAllStoreStocksQuery,
  useGetStockQuantityQuery,
  useUpdateStockPriceMutation,
} = storeStockApi;

