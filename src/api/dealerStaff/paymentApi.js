import { baseApi } from '../baseApi';

export const dsPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo payment và lấy VNPay URL
    createPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/payment/create',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payment'],
    }),
    // Lấy payment theo ID
    getPaymentById: builder.query({
      query: (paymentId) => `/payment/${paymentId}`,
      providesTags: ['Payment'],
    }),
    // Lấy tất cả payments của store
    getAllPayments: builder.query({
      query: () => '/payment/all',
      providesTags: ['Payment'],
    }),
    // Lấy payments theo order
    getPaymentsByOrder: builder.query({
      query: (orderId) => `/payment/order/${orderId}`,
      providesTags: ['Payment'],
    }),
    // Lấy danh sách trạng thái payment
    getPaymentStatuses: builder.query({
      query: () => '/payment/status',
      providesTags: ['Payment'],
    }),
    // Lấy danh sách loại payment
    getPaymentTypes: builder.query({
      query: () => '/payment/types',
      providesTags: ['Payment'],
    }),
    // Lấy danh sách phương thức payment
    getPaymentMethods: builder.query({
      query: () => '/payment/methods',
      providesTags: ['Payment'],
    }),
    // Lấy danh sách cổng thanh toán
    getPaymentGateways: builder.query({
      query: () => '/payment/gateways',
      providesTags: ['Payment'],
    }),
    // Xác nhận thanh toán tiền mặt
    confirmCashPayment: builder.mutation({
      query: (paymentId) => ({
        url: `/payment/${paymentId}/confirm-cash`,
        method: 'PUT',
      }),
      invalidatesTags: ['Payment'],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useGetPaymentByIdQuery,
  useGetAllPaymentsQuery,
  useGetPaymentsByOrderQuery,
  useGetPaymentStatusesQuery,
  useGetPaymentTypesQuery,
  useGetPaymentMethodsQuery,
  useGetPaymentGatewaysQuery,
  useConfirmCashPaymentMutation,
} = dsPaymentApi;

