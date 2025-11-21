import { baseApi } from '../baseApi';

export const storeStockApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStoreStocks: builder.query({
            query: () => '/store-stocks/all',
            providesTags: ['StoreStock'],
        }),
    }),
});

export const { useGetStoreStocksQuery } = storeStockApi;
