import { baseApi } from '../baseApi';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả store stocks của store hiện tại
    getAllStoreStocks: builder.query({
      query: () => '/store-stocks/all',
      providesTags: ['Inventory'],
    }),
    // Lấy số lượng tồn kho theo model và color
    // Note: Tài liệu nói GET nhưng có body, dùng mutation để an toàn
    getStockQuantity: builder.mutation({
      query: ({ modelId, colorId }) => ({
        url: '/store-stocks/quantity',
        method: 'GET',
        body: { modelId, colorId },
      }),
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
    // Lấy contract HTML (dùng mutation vì cần custom response handling)
    downloadContractHtml: builder.mutation({
      query: (inventoryId) => ({
        url: `/inventory-transactions/${inventoryId}/contract/html`,
        responseHandler: async (response) => {
          if (!response.ok) {
            throw new Error('Failed to download contract');
          }
          const text = await response.text();
          return { html: text };
        },
      }),
    }),
    // Upload contract đã ký
    uploadContract: builder.mutation({
      query: ({ inventoryId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/inventory-transactions/${inventoryId}/upload-contract`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Inventory'],
    }),
    // Upload biên lai thanh toán
    uploadReceipt: builder.mutation({
      query: ({ inventoryId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/inventory-transactions/${inventoryId}/upload-receipt`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Inventory'],
    }),
    // Lấy store stock theo ID
    getStoreStockById: builder.query({
      query: (storeStockId) => `/store-stocks/${storeStockId}`,
      providesTags: ['Inventory'],
    }),
    // Lấy inventory transaction theo ID
    getInventoryTransactionById: builder.query({
      query: (inventoryId) => `/inventory-transactions/${inventoryId}`,
      providesTags: ['Inventory'],
    }),
    // Xuất báo cáo inventory
    exportInventory: builder.query({
      query: (params) => ({
        url: '/store-stocks/export',
        method: 'GET',
        params,
        responseHandler: async (response) => {
          if (!response.ok) {
            throw new Error('Failed to export inventory');
          }
          const blob = await response.blob();
          return blob;
        },
      }),
    }),
  }),
});

export const {
  useGetAllStoreStocksQuery,
  useGetStockQuantityMutation,
  useUpdateStockPriceMutation,
  useGetAllInventoryTransactionsQuery,
  useCreateInventoryTransactionMutation,
  useDownloadContractHtmlMutation,
  useUploadContractMutation,
  useUploadReceiptMutation,
  useGetStoreStockByIdQuery,
  useGetInventoryTransactionByIdQuery,
  useLazyExportInventoryQuery,
} = inventoryApi;

