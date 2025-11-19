import { baseApi } from '../baseApi';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả orders (Admin có thể xem tất cả)
    getAllOrders: builder.query({
      query: () => '/orders/all',
      providesTags: ['Order'],
    }),
    // Lấy order theo ID
    getOrderById: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: ['Order'],
    }),
    // Lấy orders theo customer
    getOrdersByCustomer: builder.query({
      query: (customerId) => `/orders/customer/${customerId}`,
      providesTags: ['Order'],
    }),
    // Lấy order details
    getOrderDetails: builder.query({
      query: (orderId) => `/orders/${orderId}/order-details`,
      providesTags: ['Order'],
    }),
    // Lấy danh sách trạng thái order
    getOrderStatuses: builder.query({
      query: () => '/orders/status',
      providesTags: ['Order'],
    }),
    // Xóa order
    deleteOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/delete/${orderId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrdersByCustomerQuery,
  useGetOrderDetailsQuery,
  useGetOrderStatusesQuery,
  useDeleteOrderMutation,
} = orderApi;

