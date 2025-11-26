import { baseApi } from '../baseApi';

export const companyBankAccountApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createCompanyBankAccount: builder.mutation({
            query: (data) => ({
                url: '/company-bank-accounts/create',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['CompanyBankAccount'],
        }),
        getAllCompanyBankAccounts: builder.query({
            query: () => '/company-bank-accounts/all',
            providesTags: ['CompanyBankAccount'],
        }),
        getCompanyBankAccountById: builder.query({
            query: (accountId) => `/company-bank-accounts/${accountId}`,
            providesTags: ['CompanyBankAccount'],
        }),
        updateCompanyBankAccount: builder.mutation({
            query: ({ accountId, ...data }) => ({
                url: `/company-bank-accounts/update/${accountId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['CompanyBankAccount'],
        }),
    }),
});

export const {
    useCreateCompanyBankAccountMutation,
    useGetAllCompanyBankAccountsQuery,
    useGetCompanyBankAccountByIdQuery,
    useUpdateCompanyBankAccountMutation,
} = companyBankAccountApi;
