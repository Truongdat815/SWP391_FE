import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


export const bankApi = createApi({
    reducerPath: 'bankApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://api.banklookup.net' }),
    endpoints: (builder) => ({
        getAllBanks: builder.query({
            query: () => '/bank/list',
        }),
        lookupAccount: builder.mutation({
            query: ({ bank, account }) => {
                console.log('🔍 Environment Variables Check:');
                console.log('VITE_BANK_LOOKUP_API_KEY:', import.meta.env.VITE_BANK_LOOKUP_API_KEY);
                console.log('VITE_BANK_LOOKUP_API_SECRET:', import.meta.env.VITE_BANK_LOOKUP_API_SECRET);

                const headers = {
                    'x-api-key': '1bc48644-fd71-48a0-8149-6fef6d5323d9key',
                    'x-api-secret': 'c160ea80-0b87-4d8e-b88e-4438d1a447c9secret',
                };

                console.log('📤 Request Headers:', headers);
                console.log('📦 Request Payload:', { bank, account });

                return {
                    url: '',
                    method: 'POST',
                    headers,
                    body: {
                        bank,
                        account,
                    },
                };
            },
        }),
    }),
});

export const { useGetAllBanksQuery, useLookupAccountMutation } = bankApi;
