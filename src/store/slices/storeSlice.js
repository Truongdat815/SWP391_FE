import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as storeService from '@api/storeService';

export const getAllStoresThunk = createAsyncThunk(
    'stores/getAll',
    async (_, { rejectWithValue }) => {
        try {
            return await storeService.getAllStores();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch stores');
        }
    }
);

export const getStoreByIdThunk = createAsyncThunk(
    'stores/getById',
    async (storeId, { rejectWithValue }) => {
        try {
            return await storeService.getStoreById(storeId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch store');
        }
    }
);

export const createStoreThunk = createAsyncThunk(
    'stores/create',
    async (store, { rejectWithValue }) => {
        try {
            return await storeService.createStore(store);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to create store');
        }
    }
);

export const updateStoreThunk = createAsyncThunk(
    'stores/update',
    async (payload, { rejectWithValue }) => {
        try {
            return await storeService.updateStore(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update store');
        }
    }
);

export const deleteStoreThunk = createAsyncThunk(
    'stores/delete',
    async (storeId, { rejectWithValue }) => {
        try {
            await storeService.deleteStore(storeId);
            return storeId;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to delete store');
        }
    }
);


export const getStoresByStoreNameThunk = createAsyncThunk(
    'stores/getByStoreName',
    async (storeName, { rejectWithValue }) => {
        try {
            return await storeService.getStoresByStoreName(storeName);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch stores by name');
        }
    }
);

export const getStoresByStatusThunk = createAsyncThunk(
    'stores/getByStatus',
    async (status, { rejectWithValue }) => {
        try {
            return await storeService.getStoresByStatus(status);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch stores by status');
        }
    }
);

export const getStoresByProvinceThunk = createAsyncThunk(
    'stores/getByProvince',
    async (provinceName, { rejectWithValue }) => {
        try {
            return await storeService.getStoresByProvince(provinceName);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch stores by province');
        }
    }
);

export const searchStoresThunk = createAsyncThunk(
    'stores/search',
    async (searchParams, { rejectWithValue }) => {
        try {
            return await storeService.searchStores(searchParams);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to search stores');
        }
    }
);

const initialState = {
    items: [],
    selected: null,
    status: 'idle',
    error: null,
};

const storeSlice = createSlice({
    name: 'stores',
    initialState,
    reducers: {
        clearSelected(state) {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllStoresThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAllStoresThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(getAllStoresThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(getStoreByIdThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getStoreByIdThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selected = action.payload;
            })
            .addCase(getStoreByIdThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(createStoreThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createStoreThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
            })
            .addCase(createStoreThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(updateStoreThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateStoreThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload;
                state.items = state.items.map((s) => (s.storeId === updated.storeId ? updated : s));
            })
            .addCase(updateStoreThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(deleteStoreThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteStoreThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const id = action.payload;
                state.items = state.items.filter((s) => s.storeId !== id);
            })
            .addCase(deleteStoreThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

        
            .addCase(getStoresByStoreNameThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getStoresByStoreNameThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(getStoresByStoreNameThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(getStoresByStatusThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getStoresByStatusThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(getStoresByStatusThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(getStoresByProvinceThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getStoresByProvinceThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(getStoresByProvinceThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(searchStoresThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(searchStoresThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(searchStoresThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearSelected } = storeSlice.actions;
export default storeSlice.reducer;
