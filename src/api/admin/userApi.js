import { baseApi } from '../baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/users/create',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    getUserByName: builder.query({
      query: (name) => `/users/${name}`,
      providesTags: ['User'],
    }),
    getAllUsers: builder.query({
      query: () => '/users/all',
      providesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ userId, ...userData }) => ({
        url: `/users/update/${userId}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ userId, ...statusData }) => ({
        url: `/users/${userId}/status`,
        method: 'PUT',
        body: statusData,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/delete/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    getCurrentUser: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateOwnProfile: builder.mutation({
      query: (profileData) => ({
        url: '/users/me/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    getUserStatuses: builder.query({
      query: () => '/users/status',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetUserByNameQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetCurrentUserQuery,
  useUpdateOwnProfileMutation,
  useGetUserStatusesQuery,
} = userApi;

