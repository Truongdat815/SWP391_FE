import { baseApi } from '../baseApi';

export const storeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createStore: builder.mutation({
      query: (storeData) => ({
        url: '/stores/create',
        method: 'POST',
        body: storeData,
      }),
      invalidatesTags: ['Branch'],
    }),
    uploadStoreImage: builder.mutation({
      query: ({ storeId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/stores/${storeId}/upload-image`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Branch'],
    }),
    getStoreByName: builder.query({
      query: (storeName) => `/stores/${storeName}`,
      providesTags: ['Branch'],
    }),
    getAllStores: builder.query({
      query: () => '/stores/all',
      providesTags: ['Branch'],
    }),
    getActiveStores: builder.query({
      query: () => '/stores/active',
      providesTags: ['Branch'],
    }),
    updateStore: builder.mutation({
      query: ({ storeId, ...storeData }) => ({
        url: `/stores/update/${storeId}`,
        method: 'PUT',
        body: storeData,
      }),
      invalidatesTags: ['Branch'],
    }),
    toggleStoreStatus: builder.mutation({
      query: (storeId) => ({
        url: `/stores/toggle-status/${storeId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Branch'],
    }),
    deleteStore: builder.mutation({
      query: (storeId) => ({
        url: `/stores/delete/${storeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Branch'],
    }),
    getMonthlyRevenue: builder.query({
      query: () => '/stores/revenue/monthly',
      providesTags: ['Branch'],
    }),
    getTotalMonthlyRevenue: builder.query({
      query: () => '/stores/revenue/total-monthly',
      providesTags: ['Branch'],
    }),
    getStoreStatuses: builder.query({
      query: () => '/stores/status',
      providesTags: ['Branch'],
    }),
  }),
});

export const {
  useCreateStoreMutation,
  useUploadStoreImageMutation,
  useGetStoreByNameQuery,
  useGetAllStoresQuery,
  useGetActiveStoresQuery,
  useUpdateStoreMutation,
  useToggleStoreStatusMutation,
  useDeleteStoreMutation,
  useGetMonthlyRevenueQuery,
  useGetTotalMonthlyRevenueQuery,
  useGetStoreStatusesQuery,
} = storeApi;

