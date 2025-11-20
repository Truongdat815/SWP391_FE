import { baseApi } from '../baseApi';

// EVM Staff sử dụng modelApi từ admin
export { 
  useGetAllModelsQuery,
  useGetModelByNameQuery,
  useCreateModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
  useGetBodyTypesQuery,
} from '../admin/modelApi';

// Model Color API cho EVM Staff
export const modelColorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả model colors
    getAllModelColors: builder.query({
      query: () => '/model-colors/all',
      providesTags: ['Product'],
    }),
    // Lấy model colors theo model
    getModelColorsByModel: builder.query({
      query: (modelId) => `/model-colors/model/${modelId}`,
      providesTags: ['Product'],
    }),
    // Lấy model colors theo color
    getModelColorsByColor: builder.query({
      query: (colorId) => `/model-colors/color/${colorId}`,
      providesTags: ['Product'],
    }),
    // Lấy model color theo ID
    getModelColorById: builder.query({
      query: (id) => `/model-colors/${id}`,
      providesTags: ['Product'],
    }),
    // Tạo model color mới
    createModelColor: builder.mutation({
      query: (modelColorData) => ({
        url: '/model-colors/create',
        method: 'POST',
        body: modelColorData,
      }),
      invalidatesTags: ['Product'],
    }),
    // Upload ảnh model color
    uploadModelColorImage: builder.mutation({
      query: ({ modelId, colorId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/model-colors/${modelId}/${colorId}/upload-model-color-image`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Product'],
    }),
    // Cập nhật model color
    updateModelColor: builder.mutation({
      query: ({ id, ...modelColorData }) => ({
        url: `/model-colors/${id}`,
        method: 'PUT',
        body: modelColorData,
      }),
      invalidatesTags: ['Product'],
    }),
    // Cập nhật giá model color
    updateModelColorPrice: builder.mutation({
      query: ({ id, price }) => ({
        url: `/model-colors/${id}/update-price`,
        method: 'PUT',
        body: { price },
      }),
      invalidatesTags: ['Product'],
    }),
    // Xóa model color
    deleteModelColor: builder.mutation({
      query: (id) => ({
        url: `/model-colors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
  }),
});

export const {
  useGetAllModelColorsQuery,
  useGetModelColorsByModelQuery,
  useGetModelColorsByColorQuery,
  useGetModelColorByIdQuery,
  useCreateModelColorMutation,
  useUploadModelColorImageMutation,
  useUpdateModelColorMutation,
  useUpdateModelColorPriceMutation,
  useDeleteModelColorMutation,
} = modelColorApi;

