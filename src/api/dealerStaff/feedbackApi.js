import { baseApi } from '../baseApi';

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo feedback
    createFeedback: builder.mutation({
      query: (feedbackData) => ({
        url: '/feedbacks/create',
        method: 'POST',
        body: feedbackData,
      }),
      invalidatesTags: ['Feedback'],
    }),
    // Lấy feedback theo ID
    getFeedbackById: builder.query({
      query: (feedbackId) => `/feedbacks/${feedbackId}`,
      providesTags: ['Feedback'],
    }),
    // Lấy tất cả feedbacks
    getAllFeedbacks: builder.query({
      query: () => '/feedbacks/all',
      providesTags: ['Feedback'],
    }),
    // Lấy feedbacks theo order
    getFeedbacksByOrder: builder.query({
      query: (orderId) => `/feedbacks/order/${orderId}`,
      providesTags: ['Feedback'],
    }),
    // Cập nhật feedback
    updateFeedback: builder.mutation({
      query: ({ feedbackId, ...feedbackData }) => ({
        url: `/feedbacks/update/${feedbackId}`,
        method: 'PUT',
        body: feedbackData,
      }),
      invalidatesTags: ['Feedback'],
    }),
    // Xóa feedback
    deleteFeedback: builder.mutation({
      query: (feedbackId) => ({
        url: `/feedbacks/delete/${feedbackId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Feedback'],
    }),
    // Lấy danh sách trạng thái feedback
    getFeedbackStatuses: builder.query({
      query: () => '/feedbacks/status',
      providesTags: ['Feedback'],
    }),
    // Lấy danh sách categories feedback
    getFeedbackCategories: builder.query({
      query: () => '/feedbacks/categories',
      providesTags: ['Feedback'],
    }),
    // Tạo feedback detail
    createFeedbackDetail: builder.mutation({
      query: (detailData) => ({
        url: '/feedback-details/create',
        method: 'POST',
        body: detailData,
      }),
      invalidatesTags: ['Feedback'],
    }),
  }),
});

export const {
  useCreateFeedbackMutation,
  useGetFeedbackByIdQuery,
  useGetAllFeedbacksQuery,
  useGetFeedbacksByOrderQuery,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetFeedbackStatusesQuery,
  useGetFeedbackCategoriesQuery,
  useCreateFeedbackDetailMutation,
} = feedbackApi;

