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

    getAllCustomers: builder.query({
      query: () => '/customers/all',
      providesTags: ['Customer'],
    }),

    getCustomerById: builder.query({
      query: (id) => `/customers/id/${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),

    getCustomerByPhone: builder.query({
      query: (phone) => `/customers/phone/${phone}`,
      providesTags: ['Customer'],
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
        url: '/customers/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Customer'],
    }),

    updateCustomer: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/customers/update/${id}`,
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
        url: `/customers/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useGetCustomerByPhoneQuery,
  useSearchCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;

