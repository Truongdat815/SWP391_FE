import { baseApi } from '../baseApi';

export const modelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả models
    getAllModels: builder.query({
      query: () => '/models/all',
      providesTags: ['Model'],
    }),
    // Lấy model theo tên
    getModelByName: builder.query({
      query: (name) => `/models/${name}`,
      providesTags: ['Model'],
    }),
    // Tạo model mới
    createModel: builder.mutation({
      query: (modelData) => ({
        url: '/models/create',
        method: 'POST',
        body: modelData,
      }),
      invalidatesTags: ['Model'],
    }),
    // Cập nhật model
    updateModel: builder.mutation({
      query: ({ id, ...modelData }) => ({
        url: `/models/update/${id}`,
        method: 'PUT',
        body: modelData,
      }),
      invalidatesTags: ['Model'],
    }),
    // Xóa model
    deleteModel: builder.mutation({
      query: (id) => ({
        url: `/models/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Model'],
    }),
    // Lấy danh sách body types
    getBodyTypes: builder.query({
      query: () => '/models/body-types',
      providesTags: ['Model'],
    }),
  }),
});

export const {
  useGetAllModelsQuery,
  useGetModelByNameQuery,
  useCreateModelMutation,
  useUpdateModelMutation,
  useDeleteModelMutation,
  useGetBodyTypesQuery,
} = modelApi;

