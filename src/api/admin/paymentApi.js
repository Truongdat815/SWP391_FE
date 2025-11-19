import { baseApi } from '../baseApi';

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả payments (Admin có thể xem tất cả)
    getAllPayments: builder.query({
      query: () => '/payment/all',
      providesTags: ['Payment'],
    }),
    // Lấy payment theo ID
    getPaymentById: builder.query({
      query: (paymentId) => `/payment/${paymentId}`,
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
    // Lấy danh sách gateway payment
    getPaymentGateways: builder.query({
      query: () => '/payment/gateways',
      providesTags: ['Payment'],
    }),
  }),
});

export const {
  useGetAllPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetPaymentStatusesQuery,
  useGetPaymentTypesQuery,
  useGetPaymentMethodsQuery,
  useGetPaymentGatewaysQuery,
} = paymentApi;

