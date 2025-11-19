import { baseApi } from '../baseApi';

export const colorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả colors
    getAllColors: builder.query({
      query: () => '/colors/all',
      providesTags: ['Color'],
    }),
    // Lấy color theo ID
    getColorById: builder.query({
      query: (id) => `/colors/${id}`,
      providesTags: ['Color'],
    }),
    // Lấy color theo tên
    getColorByName: builder.query({
      query: (name) => `/colors/name/${name}`,
      providesTags: ['Color'],
    }),
    // Tạo color mới
    createColor: builder.mutation({
      query: (colorData) => ({
        url: '/colors/create',
        method: 'POST',
        body: colorData,
      }),
      invalidatesTags: ['Color'],
    }),
    // Cập nhật color
    updateColor: builder.mutation({
      query: ({ id, ...colorData }) => ({
        url: `/colors/update/${id}`,
        method: 'PUT',
        body: colorData,
      }),
      invalidatesTags: ['Color'],
    }),
    // Xóa color
    deleteColor: builder.mutation({
      query: (id) => ({
        url: `/colors/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Color'],
    }),
  }),
});

export const {
  useGetAllColorsQuery,
  useGetColorByIdQuery,
  useGetColorByNameQuery,
  useCreateColorMutation,
  useUpdateColorMutation,
  useDeleteColorMutation,
} = colorApi;

