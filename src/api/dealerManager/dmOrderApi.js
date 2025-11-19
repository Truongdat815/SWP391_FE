import { baseApi } from '../baseApi';

export const dmOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả orders của store hiện tại
    getAllOrders: builder.query({
      query: () => '/orders/all',
      providesTags: ['Order'],
    }),
    // Lấy order theo ID
    getOrderById: builder.query({
      query: (orderId) => `/orders/${orderId}`,
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
    // Lấy orders theo staff
    getOrdersByStaff: builder.query({
      query: (staffId) => `/orders/staff/${staffId}`,
      providesTags: ['Order'],
    }),
    // Lấy orders của staff hiện tại
    getMyStaffOrders: builder.query({
      query: () => '/orders/staff',
      providesTags: ['Order'],
    }),
    // Lấy doanh thu tháng của store
    getMonthlyRevenue: builder.query({
      query: () => '/orders/revenue/monthly',
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
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useConfirmOrderMutation,
  useGetOrdersByStaffQuery,
  useGetMyStaffOrdersQuery,
  useGetMonthlyRevenueQuery,
  useGetOrderDetailsQuery,
  useGetOrderStatusesQuery,
} = dmOrderApi;

