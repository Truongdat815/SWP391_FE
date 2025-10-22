import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as inventoryTransactionService from '@api/inventory-transactionService';

// Thunks
export const getAllTransactionsThunk = createAsyncThunk(
    'inventoryTransactions/getAll',
    async (_, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.getAllTransactions();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch inventory transactions');
        }
    }
);

export const getTransactionsByStoreStockThunk = createAsyncThunk(
    'inventoryTransactions/getByStoreStock',
    async (storeStockId, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.getTransactionsByStoreStock(storeStockId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch inventory transactions by store stock');
        }
    }
);

export const createTransactionThunk = createAsyncThunk(
    'inventoryTransactions/create',
    async (payload, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.createTransaction(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to create transaction');
        }
    }
);

export const updateTransactionThunk = createAsyncThunk(
    'inventoryTransactions/update',
    async ({ inventoryId, payload }, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.updateTransaction(inventoryId, payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update transaction');
        }
    }
);

export const deleteTransactionThunk = createAsyncThunk(
    'inventoryTransactions/delete',
    async (inventoryId, { rejectWithValue }) => {
        try {
            await inventoryTransactionService.deleteTransaction(inventoryId);
            return inventoryId;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to delete transaction');
        }
    }
);

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

const inventoryTransactionSlice = createSlice({
    name: 'inventoryTransactions',
    initialState,
    reducers: {
        resetInventoryTransactions(state) {
            state.items = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllTransactionsThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAllTransactionsThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = Array.isArray(action.payload?.data)
                    ? action.payload.data
                    : Array.isArray(action.payload)
                    ? action.payload
                    : [];
            })
            .addCase(getAllTransactionsThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // By store stock
            .addCase(getTransactionsByStoreStockThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getTransactionsByStoreStockThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = Array.isArray(action.payload?.data)
                    ? action.payload.data
                    : Array.isArray(action.payload)
                    ? action.payload
                    : [];
            })
            .addCase(getTransactionsByStoreStockThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // create
            .addCase(createTransactionThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createTransactionThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const created = action.payload?.data || action.payload;
                if (created) state.items.push(created);
            })
            .addCase(createTransactionThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // update
            .addCase(updateTransactionThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateTransactionThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload?.data || action.payload;
                if (updated) {
                    const idx = state.items.findIndex(t => (t.inventoryId ?? t.id) === (updated.inventoryId ?? updated.id));
                    if (idx !== -1) state.items[idx] = updated;
                }
            })
            .addCase(updateTransactionThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // delete
            .addCase(deleteTransactionThunk.fulfilled, (state, action) => {
                const id = action.payload;
                state.items = state.items.filter(t => (t.inventoryId ?? t.id) !== id);
            });
    },
});

export const { resetInventoryTransactions } = inventoryTransactionSlice.actions;
export default inventoryTransactionSlice.reducer;


