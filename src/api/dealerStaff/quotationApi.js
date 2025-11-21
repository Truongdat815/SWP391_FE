import { baseApi } from '../baseApi';

export const quotationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo báo giá
    createQuote: builder.mutation({
      query: (quoteData) => ({
        url: '/orders/create/quote',
        method: 'POST',
        body: quoteData,
      }),
      invalidatesTags: ['Quotation'],
    }),
    // Lấy báo giá theo order ID
    getQuoteByOrderId: builder.query({
      query: (orderId) => `/orders/${orderId}/quote`,
      providesTags: ['Quotation'],
    }),
    // Cập nhật báo giá
    updateQuote: builder.mutation({
      query: ({ orderId, ...quoteData }) => ({
        url: `/order-details/quote/${orderId}`,
        method: 'PUT',
        body: quoteData,
      }),
      invalidatesTags: ['Quotation', 'Order'],
    }),
  }),
});

export const {
  useCreateQuoteMutation,
  useGetQuoteByOrderIdQuery,
  useUpdateQuoteMutation,
} = quotationApi;

