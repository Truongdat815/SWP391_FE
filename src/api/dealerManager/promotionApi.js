import { baseApi } from '../baseApi';

export const promotionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả promotions
    getAllPromotions: builder.query({
      query: () => '/promotions/all',
      providesTags: ['Promotion'],
    }),
    // Lấy promotion theo tên
    getPromotionByName: builder.query({
      query: (name) => `/promotions/${name}`,
      providesTags: ['Promotion'],
    }),
    // Lấy promotions theo model
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
    // Tạo promotion cho tất cả models
    createPromotionForAllModels: builder.mutation({
      query: (promotionData) => ({
        url: '/promotions/create-for-all-models',
        method: 'POST',
        body: promotionData,
      }),
      invalidatesTags: ['Promotion'],
    }),
    // Cập nhật promotion
    updatePromotion: builder.mutation({
      query: ({ id, ...promotionData }) => ({
        url: `/promotions/${id}`,
        method: 'PUT',
        body: promotionData,
      }),
      invalidatesTags: ['Promotion'],
    }),
    // Cập nhật trạng thái promotion
    updatePromotionStatus: builder.mutation({
      query: ({ promotionId, status }) => ({
        url: `/promotions/${promotionId}/updateStatus`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Promotion'],
    }),
    // Xóa promotion
    deletePromotion: builder.mutation({
      query: (id) => ({
        url: `/promotions/${id}`,
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
  useGetPromotionByNameQuery,
  useGetPromotionsByModelQuery,
  useCreatePromotionMutation,
  useCreatePromotionForAllModelsMutation,
  useUpdatePromotionMutation,
  useUpdatePromotionStatusMutation,
  useDeletePromotionMutation,
  useGetPromotionTypesQuery,
} = promotionApi;

