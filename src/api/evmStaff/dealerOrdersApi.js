import { baseApi } from '../baseApi';

export const dealerOrdersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả orders từ đại lý (EVM Staff xem tất cả)
    getAllDealerOrders: builder.query({
      query: () => '/orders/all',
      providesTags: ['Order'],
    }),
    // Lấy order theo ID
    getDealerOrderById: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: ['Order'],
    }),
    // Xử lý đơn hàng (approve/reject)
    processDealerOrder: builder.mutation({
      query: ({ orderId, action, ...data }) => ({
        url: `/orders/${orderId}/${action}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),
    // Lấy order details
    getDealerOrderDetails: builder.query({
      query: (orderId) => `/orders/${orderId}/order-details`,
      providesTags: ['Order'],
    }),
    // Lấy danh sách trạng thái order
    getOrderStatuses: builder.query({
      query: () => '/orders/status',
      providesTags: ['Order'],
    }),
  }),
});

export const {
  useGetAllDealerOrdersQuery,
  useGetDealerOrderByIdQuery,
  useProcessDealerOrderMutation,
  useGetDealerOrderDetailsQuery,
  useGetOrderStatusesQuery,
} = dealerOrdersApi;

