import { baseApi } from '../baseApi';

export const evmInventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả store stocks (EVM Staff xem tất cả)
    getAllStoreStocks: builder.query({
      query: () => '/store-stocks/all',
      providesTags: ['Inventory'],
    }),
    // Lấy số lượng tồn kho (POST với body)
    getStoreStockQuantity: builder.mutation({
      query: ({ modelId, colorId }) => ({
        url: '/store-stocks/quantity',
        method: 'POST',
        body: { modelId, colorId },
      }),
    }),
    // Cập nhật giá của store stock
    updateStoreStockPrice: builder.mutation({
      query: ({ storeStockId, price }) => ({
        url: '/store-stocks/update-price',
        method: 'PUT',
        body: { storeStockId, price },
      }),
      invalidatesTags: ['Inventory'],
    }),
    // Tạo inventory transaction
    createInventoryTransaction: builder.mutation({
      query: (transactionData) => ({
        url: '/inventory-transactions/create',
        method: 'POST',
        body: transactionData,
      }),
      invalidatesTags: ['Inventory'],
    }),
    // Lấy inventory transaction theo ID
    getInventoryTransactionById: builder.query({
      query: (inventoryId) => `/inventory-transactions/${inventoryId}`,
      providesTags: ['Inventory'],
    }),
    // Lấy tất cả inventory transactions
    getAllInventoryTransactions: builder.query({
      query: () => '/inventory-transactions/all',
      providesTags: ['Inventory'],
    }),
    // Lấy inventory transactions theo store stock
    getInventoryTransactionsByStoreStock: builder.query({
      query: (storeStockId) => `/inventory-transactions/store-stock/${storeStockId}`,
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
    // Bắt đầu vận chuyển
    startShipping: builder.mutation({
      query: (inventoryId) => ({
        url: `/inventory-transactions/start-shipping/${inventoryId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Inventory'],
    }),
    // Xác nhận giao hàng
    confirmDelivery: builder.mutation({
      query: (inventoryId) => ({
        url: `/inventory-transactions/confirm-delivery/${inventoryId}`,
        method: 'PUT',
      }),
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
    // Xác nhận thanh toán
    confirmPayment: builder.mutation({
      query: (inventoryId) => ({
        url: `/inventory-transactions/${inventoryId}/confirm-payment`,
        method: 'PUT',
      }),
      invalidatesTags: ['Inventory'],
    }),
    // Hủy yêu cầu
    cancelInventoryRequest: builder.mutation({
      query: (inventoryId) => ({
        url: `/inventory-transactions/${inventoryId}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Inventory'],
    }),
    // Xóa inventory transaction
    deleteInventoryTransaction: builder.mutation({
      query: (inventoryId) => ({
        url: `/inventory-transactions/delete/${inventoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),
    // Lấy danh sách trạng thái inventory transaction
    getInventoryTransactionStatuses: builder.query({
      query: () => '/inventory-transactions/status',
      providesTags: ['Inventory'],
    }),
    // Tạo contract cho inventory transaction
    createContract: builder.mutation({
      query: (inventoryId) => {
        // Không set body field để RTK Query không gửi Content-Type header
        const query = {
          url: `/inventory-transactions/${inventoryId}/create-contract`,
          method: 'POST',
        };
        // Không thêm body field
        return query;
      },
      invalidatesTags: ['Inventory'],
    }),
    // Upload signature image
    uploadSignatureImage: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: '/upload/signature',
          method: 'POST',
          body: formData,
        };
      },
    }),
    // EVM ký hợp đồng (upload signature image)
    signContract: builder.mutation({
      query: ({ inventoryId, evmSignatureImageUrl }) => ({
        url: `/inventory-transactions/${inventoryId}/sign-contract`,
        method: 'POST',
        body: { evmSignatureImageUrl },
      }),
      invalidatesTags: ['Inventory'],
    }),
    // Lấy thông tin contract
    getContract: builder.query({
      query: (inventoryId) => `/inventory-transactions/${inventoryId}/contract`,
      providesTags: ['Inventory'],
    }),
    // Lấy contract HTML để xem
    getContractHtml: builder.query({
      query: (inventoryId) => ({
        url: `/inventory-transactions/${inventoryId}/contract/html`,
        responseHandler: async (response) => {
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Failed to fetch contract HTML');
            throw new Error(errorText);
          }
          const text = await response.text();
          return text; // Trả về HTML string trực tiếp
        },
      }),
      providesTags: ['Inventory'],
    }),
    // Upload vehicle Excel và chuyển trạng thái
    uploadVehicleExcel: builder.mutation({
      query: ({ inventoryId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/vehicles/import/${inventoryId}`,
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response, meta) => {
        // Kiểm tra xem response có chứa lỗi không (dù HTTP status có thể là 201)
        if (response && typeof response === 'object') {
          // Nếu response có message chứa lỗi, throw error
          if (response.message && (
            response.message.includes('Không thể nhập dữ liệu') ||
            response.message.includes('bị trùng') ||
            response.message.includes('duplicate') ||
            response.message.includes('UNIQUE KEY constraint') ||
            response.message.includes('constraint violation')
          )) {
            // Throw error để RTK Query coi đây là lỗi
            throw {
              status: response.code || 400,
              data: {
                code: response.code || 400,
                message: response.message,
                error: 'VALIDATION_ERROR'
              }
            };
          }
        }
        return response;
      },
      invalidatesTags: ['Inventory'],
    }),
  }),
});

export const {
  useGetAllStoreStocksQuery,
  useGetStoreStockQuantityMutation,
  useUpdateStoreStockPriceMutation,
  useCreateInventoryTransactionMutation,
  useGetInventoryTransactionByIdQuery,
  useGetAllInventoryTransactionsQuery,
  useGetInventoryTransactionsByStoreStockQuery,
  useGetInventoryTransactionsByDateRangeQuery,
  useAcceptInventoryRequestMutation,
  useRejectInventoryRequestMutation,
  useStartShippingMutation,
  useConfirmDeliveryMutation,
  useUploadReceiptMutation,
  useConfirmPaymentMutation,
  useCancelInventoryRequestMutation,
  useDeleteInventoryTransactionMutation,
  useGetInventoryTransactionStatusesQuery,
  useCreateContractMutation,
  useUploadSignatureImageMutation,
  useSignContractMutation,
  useGetContractQuery,
  useGetContractHtmlQuery,
  useGetPaymentInfoQuery,
  useUploadVehicleExcelMutation,
} = evmInventoryApi;

