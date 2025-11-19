import { baseApi } from '../baseApi';

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params = {}) => ({
        url: '/customers',
        params,
      }),
      providesTags: ['Customer'],
    }),

    getCustomerById: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),

    searchCustomers: builder.query({
      query: (phone) => ({
        url: '/customers/search',
        params: { phone },
      }),
      providesTags: ['Customer'],
    }),

    createCustomer: builder.mutation({
      query: (body) => ({
        url: '/customers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customer'],
    }),

    updateCustomer: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customer', id },
        'Customer',
      ],
    }),

    deleteCustomer: builder.mutation({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useSearchCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;

