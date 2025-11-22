import { baseApi } from '../baseApi';

export const promotionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả promotions
    getAllPromotions: builder.query({
      query: () => '/promotions/all',
      providesTags: ['Promotion'],
    }),
    // Lấy promotions theo model (for CreateOrderPage)
    getPromotionsByModel: builder.query({
      query: (modelId) => `/promotions/model/${modelId}`,
      providesTags: ['Promotion'],
    }),
    // Tạo promotion mới
    createPromotion: builder.mutation({
      query: (promotionData) => ({
        url: '/promotions/create',
        method: 'POST',
        body: promotionData,
      }),
      invalidatesTags: ['Promotion'],
    }),
    // Cập nhật promotion
    updatePromotion: builder.mutation({
      query: ({ promotionId, ...promotionData }) => ({
        url: `/promotions/${promotionId}`,
        method: 'PUT',
        body: promotionData,
      }),
      invalidatesTags: ['Promotion'],
    }),
    // Xóa promotion
    deletePromotion: builder.mutation({
      query: (promotionId) => ({
        url: `/promotions/${promotionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Promotion'],
    }),
    // Lấy danh sách loại promotion
    getPromotionTypes: builder.query({
      query: () => '/promotions/types',
      providesTags: ['Promotion'],
    }),
  }),
});

export const {
  useGetAllPromotionsQuery,
  useGetPromotionsByModelQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useGetPromotionTypesQuery,
} = promotionApi;

