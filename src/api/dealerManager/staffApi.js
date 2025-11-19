import { baseApi } from '../baseApi';

export const staffApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy tất cả staff của store hiện tại (Dealer Staff role)
    getAllStaff: builder.query({
      query: () => '/users/all',
      providesTags: ['Staff'],
    }),
    // Lấy staff theo ID
    getStaffById: builder.query({
      query: (staffId) => `/users/${staffId}`,
      providesTags: ['Staff'],
    }),
    // Tạo staff mới
    createStaff: builder.mutation({
      query: (staffData) => ({
        url: '/users/create',
        method: 'POST',
        body: staffData,
      }),
      invalidatesTags: ['Staff'],
    }),
    // Cập nhật staff
    updateStaff: builder.mutation({
      query: ({ userId, ...staffData }) => ({
        url: `/users/update/${userId}`,
        method: 'PUT',
        body: staffData,
      }),
      invalidatesTags: ['Staff'],
    }),
    // Cập nhật trạng thái staff
    updateStaffStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: `/users/${userId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Staff'],
    }),
    // Xóa staff
    deleteStaff: builder.mutation({
      query: (userId) => ({
        url: `/users/delete/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Staff'],
    }),
  }),
});

export const {
  useGetAllStaffQuery,
  useGetStaffByIdQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useUpdateStaffStatusMutation,
  useDeleteStaffMutation,
} = staffApi;

