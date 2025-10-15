import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as storeStockService from '@api/store-stockService';

// Get all store stocks
export const getAllStoreStocksThunk = createAsyncThunk(
    'storeStocks/getAll',
    async (_, { rejectWithValue }) => {
        try {
            return await storeStockService.getAllStoreStocks();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch store stocks');
        }
    }
);

// Get store stocks by store ID
export const getStoreStocksByStoreThunk = createAsyncThunk(
    'storeStocks/getByStore',
    async (storeId, { rejectWithValue }) => {
        try {
            return await storeStockService.getStoreStocksByStore(storeId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch store stocks');
        }
    }
);

// Create store stock
export const createStoreStockThunk = createAsyncThunk(
    'storeStocks/create',
    async (storeStock, { rejectWithValue }) => {
        try {
            return await storeStockService.createStoreStock(storeStock);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to create store stock');
        }
    }
);

// Update store stock
export const updateStoreStockThunk = createAsyncThunk(
    'storeStocks/update',
    async (storeStock, { rejectWithValue }) => {
        try {
            return await storeStockService.updateStoreStock(storeStock);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update store stock');
        }
    }
);

// Update stock quantity
export const updateStockQuantityThunk = createAsyncThunk(
    'storeStocks/updateQuantity',
    async ({ stockId, quantity }, { rejectWithValue }) => {
        try {
            return await storeStockService.updateStockQuantity(stockId, quantity);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update stock quantity');
        }
    }
);

// Update stock price
export const updateStockPriceThunk = createAsyncThunk(
    'storeStocks/updatePrice',
    async ({ stockId, priceOfStore }, { rejectWithValue }) => {
        try {
            return await storeStockService.updateStockPrice(stockId, priceOfStore);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update stock price');
        }
    }
);

// Delete store stock
export const deleteStoreStockThunk = createAsyncThunk(
    'storeStocks/delete',
    async (stockId, { rejectWithValue }) => {
        try {
            await storeStockService.deleteStoreStock(stockId);
            return stockId;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to delete store stock');
        }
    }
);

const initialState = {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
};

const storeStockSlice = createSlice({
    name: 'storeStocks',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetStoreStocks: (state) => {
            state.items = [];
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get all store stocks
            .addCase(getAllStoreStocksThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAllStoreStocksThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Handle both response formats: { data: [...] } or direct array
                state.items = Array.isArray(action.payload?.data) 
                    ? action.payload.data 
                    : Array.isArray(action.payload) 
                    ? action.payload 
                    : [];
                state.error = null;
            })
            .addCase(getAllStoreStocksThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Get store stocks by store
            .addCase(getStoreStocksByStoreThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getStoreStocksByStoreThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = Array.isArray(action.payload?.data) 
                    ? action.payload.data 
                    : Array.isArray(action.payload) 
                    ? action.payload 
                    : [];
                state.error = null;
            })
            .addCase(getStoreStocksByStoreThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Create store stock
            .addCase(createStoreStockThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createStoreStockThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const newItem = action.payload?.data || action.payload;
                if (newItem) {
                    state.items.push(newItem);
                }
                state.error = null;
            })
            .addCase(createStoreStockThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Update store stock
            .addCase(updateStoreStockThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateStoreStockThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedItem = action.payload?.data || action.payload;
                if (updatedItem) {
                    const index = state.items.findIndex(item => item.stockId === updatedItem.stockId);
                    if (index !== -1) {
                        state.items[index] = updatedItem;
                    }
                }
                state.error = null;
            })
            .addCase(updateStoreStockThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Update stock quantity
            .addCase(updateStockQuantityThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateStockQuantityThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedItem = action.payload?.data || action.payload;
                if (updatedItem) {
                    const index = state.items.findIndex(item => item.stockId === updatedItem.stockId);
                    if (index !== -1) {
                        state.items[index] = updatedItem;
                    }
                }
                state.error = null;
            })
            .addCase(updateStockQuantityThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Update stock price
            .addCase(updateStockPriceThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateStockPriceThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updatedItem = action.payload?.data || action.payload;
                if (updatedItem) {
                    const index = state.items.findIndex(item => item.stockId === updatedItem.stockId);
                    if (index !== -1) {
                        state.items[index] = updatedItem;
                    }
                }
                state.error = null;
            })
            .addCase(updateStockPriceThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Delete store stock
            .addCase(deleteStoreStockThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteStoreStockThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = state.items.filter(item => item.stockId !== action.payload);
                state.error = null;
            })
            .addCase(deleteStoreStockThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { clearError, resetStoreStocks } = storeStockSlice.actions;
export default storeStockSlice.reducer;

