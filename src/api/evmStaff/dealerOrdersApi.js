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
    // Lấy order details
    getDealerOrderDetails: builder.query({
      query: (orderId) => `/orders/${orderId}/order-details`,
      providesTags: ['Order'],
    }),
    // Lấy orders theo customer
    getOrdersByCustomer: builder.query({
      query: (customerId) => `/orders/customer/${customerId}`,
      providesTags: ['Order'],
    }),
    // Xác nhận order từ draft
    confirmOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/confirm`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
    // Đánh dấu đơn hàng đã giao
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
    // Xóa order
    deleteOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/delete/${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
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
  useGetDealerOrderDetailsQuery,
  useGetOrdersByCustomerQuery,
  useConfirmOrderMutation,
  useDeliverOrderMutation,
  useDeleteOrderMutation,
  useGetOrderStatusesQuery,
} = dealerOrdersApi;

