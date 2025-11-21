import { baseApi } from '../baseApi';

export const storeStockApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStoreStocks: builder.query({
            query: () => ({
                url: '/store-stocks/all',
                method: 'GET',
            }),
            providesTags: ['StoreStock'],
            transformResponse: (response) => {
                console.log('Store Stock API Response:', response);
                
                // Handle different response formats
                if (response?.data && Array.isArray(response.data)) {
                    return {
                        ...response,
                        data: response.data.map(item => ({
                            // Map to consistent field names
                            storeStockId: item.stockId,
                            stockId: item.stockId,
                            storeId: item.storeId,
                            storeName: item.storeName,
                            modelId: item.modelId,
                            modelName: item.modelName,
                            colorId: item.colorId,
                            color: item.colorName, // Map colorName to color for backward compatibility
                            colorName: item.colorName,
                            basePrice: item.basePrice,
                            priceOfStore: item.priceOfStore,
                            quantity: item.quantity,
                            availableStock: item.availableStock,
                            // Keep original data as well
                            ...item
                        }))
                    };
                }
                
                // If response is direct array
                if (Array.isArray(response)) {
                    return { 
                        data: response.map(item => ({
                            storeStockId: item.stockId,
                            stockId: item.stockId,
                            storeId: item.storeId,
                            storeName: item.storeName,
                            modelId: item.modelId,
                            modelName: item.modelName,
                            colorId: item.colorId,
                            color: item.colorName,
                            colorName: item.colorName,
                            basePrice: item.basePrice,
                            priceOfStore: item.priceOfStore,
                            quantity: item.quantity,
                            availableStock: item.availableStock,
                            ...item
                        }))
                    };
                }
                
                // Default empty response
                return { data: [] };
            },
        }),
        
        getStoreStockById: builder.query({
            query: (id) => ({
                url: `/store-stocks/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'StoreStock', id }],
        }),
        
        updateStoreStock: builder.mutation({
            query: ({ id, ...patch }) => ({
                url: `/store-stocks/${id}`,
                method: 'PUT',
                body: patch,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'StoreStock', id },
                'StoreStock',
            ],
        }),
    }),
});

export const {
    useGetStoreStocksQuery,
    useGetStoreStockByIdQuery,
    useUpdateStoreStockMutation,
} = storeStockApi;
