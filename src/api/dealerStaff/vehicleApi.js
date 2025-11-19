import { baseApi } from '../baseApi';

export const vehicleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả models (public endpoint)
    getAllModels: builder.query({
      query: () => '/models/all',
      providesTags: ['Vehicle'],
    }),
    // Lấy model theo tên
    getModelByName: builder.query({
      query: (name) => `/models/${name}`,
      providesTags: ['Vehicle'],
    }),
    // Lấy tất cả model colors
    getAllModelColors: builder.query({
      query: () => '/model-colors/all',
      providesTags: ['Vehicle'],
    }),
    // Lấy model colors theo model
    getModelColorsByModel: builder.query({
      query: (modelId) => `/model-colors/model/${modelId}`,
      providesTags: ['Vehicle'],
    }),
    // Lấy tất cả colors
    getAllColors: builder.query({
      query: () => '/colors/all',
      providesTags: ['Vehicle'],
    }),
  }),
});

export const {
  useGetAllModelsQuery,
  useGetModelByNameQuery,
  useGetAllModelColorsQuery,
  useGetModelColorsByModelQuery,
  useGetAllColorsQuery,
} = vehicleApi;

