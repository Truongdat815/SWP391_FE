import { baseApi } from '../baseApi';

export const dsOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả orders của staff hiện tại
    getAllOrders: builder.query({
      query: () => '/orders/all',
      providesTags: ['Order'],
    }),
    // Lấy order theo ID
    getOrderById: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: ['Order'],
    }),
    // Tạo draft order
    createDraftOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders/create',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order'],
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
    // Lấy orders theo customer
    getOrdersByCustomer: builder.query({
      query: (customerId) => `/orders/customer/${customerId}`,
      providesTags: ['Order'],
    }),
    // Lấy orders của staff hiện tại
    getMyOrders: builder.query({
      query: () => '/orders/staff',
      providesTags: ['Order'],
    }),
    // Lấy orders và thống kê theo staffId
    getOrdersByStaffId: builder.query({
      query: (staffId) => `/orders/staff/${staffId}`,
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
  useCreateDraftOrderMutation,
  useConfirmOrderMutation,
  useDeliverOrderMutation,
  useGetOrdersByCustomerQuery,
  useGetMyOrdersQuery,
  useGetOrdersByStaffIdQuery,
  useGetOrderDetailsQuery,
  useGetOrderStatusesQuery,
  useDeleteOrderMutation,
} = dsOrderApi;

