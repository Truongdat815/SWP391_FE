import { baseApi } from '../baseApi';

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy báo cáo doanh số toàn quốc
    getSalesReport: builder.query({
      query: ({ startDate, endDate }) => ({
        url: '/reports/sales',
        params: { startDate, endDate },
      }),
      providesTags: ['Report'],
    }),
    // Lấy báo cáo theo đại lý
    getDealerReport: builder.query({
      query: ({ dealerId, startDate, endDate }) => ({
        url: '/reports/dealer',
        params: { dealerId, startDate, endDate },
      }),
      providesTags: ['Report'],
    }),
    // Lấy báo cáo theo model
    getModelReport: builder.query({
      query: ({ modelId, startDate, endDate }) => ({
        url: '/reports/model',
        params: { modelId, startDate, endDate },
      }),
      providesTags: ['Report'],
    }),
  }),
});

export const {
  useGetSalesReportQuery,
  useGetDealerReportQuery,
  useGetModelReportQuery,
} = reportApi;

