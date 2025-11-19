import { baseApi } from '../baseApi';

export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoleByName: builder.query({
      query: (roleName) => `/roles/${roleName}`,
      providesTags: ['Role'],
    }),
    getAllRoles: builder.query({
      query: () => '/roles/all',
      providesTags: ['Role'],
    }),
    updateRole: builder.mutation({
      query: ({ roleId, ...roleData }) => ({
        url: `/roles/update/${roleId}`,
        method: 'PUT',
        body: roleData,
      }),
      invalidatesTags: ['Role'],
    }),
    deleteRole: builder.mutation({
      query: (roleId) => ({
        url: `/roles/delete/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Role'],
    }),
  }),
});

export const {
  useGetRoleByNameQuery,
  useGetAllRolesQuery,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;

