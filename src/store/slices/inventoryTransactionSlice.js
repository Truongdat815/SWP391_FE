import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as inventoryTransactionService from '@api/inventory-transactionService';

// Thunks
export const getAllTransactionsThunk = createAsyncThunk(
    'inventoryTransactions/getAll',
    async (_, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.getAllTransactions();
        } catch (err) {
            // Nếu là 404, return empty array thay vì reject
            if (err.status === 404) {
                return { data: [] };
            }
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

export const getTransactionByIdThunk = createAsyncThunk(
    'inventoryTransactions/getById',
    async (inventoryId, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.getTransactionById(inventoryId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch inventory transaction by id');
        }
    }
);

export const getTransactionsByDateRangeThunk = createAsyncThunk(
    'inventoryTransactions/getByDateRange',
    async ({ startDate, endDate }, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.getTransactionsByDateRange(startDate, endDate);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch inventory transactions by date range');
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

export const acceptTransactionThunk = createAsyncThunk(
    'inventoryTransactions/accept',
    async (inventoryId, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.acceptTransaction(inventoryId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to accept transaction');
        }
    }
);

export const rejectTransactionThunk = createAsyncThunk(
    'inventoryTransactions/reject',
    async (inventoryId, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.rejectTransaction(inventoryId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to reject transaction');
        }
    }
);

export const startShippingTransactionThunk = createAsyncThunk(
    'inventoryTransactions/startShipping',
    async (inventoryId, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.startShippingTransaction(inventoryId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to start shipping');
        }
    }
);

export const confirmDeliveryTransactionThunk = createAsyncThunk(
    'inventoryTransactions/confirmDelivery',
    async (inventoryId, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.confirmDeliveryTransaction(inventoryId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to confirm delivery');
        }
    }
);

export const confirmPaymentTransactionThunk = createAsyncThunk(
    'inventoryTransactions/confirmPayment',
    async (inventoryId, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.confirmPaymentTransaction(inventoryId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to confirm payment');
        }
    }
);

export const uploadReceiptThunk = createAsyncThunk(
    'inventoryTransactions/uploadReceipt',
    async ({ inventoryId, file }, { rejectWithValue }) => {
        try {
            return await inventoryTransactionService.uploadReceipt(inventoryId, file);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to upload receipt');
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
            // By ID
            .addCase(getTransactionByIdThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getTransactionByIdThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const transaction = action.payload?.data || action.payload;
                if (transaction) {
                    const idx = state.items.findIndex(t => (t.inventoryId ?? t.id) === (transaction.inventoryId ?? transaction.id));
                    if (idx !== -1) {
                        state.items[idx] = transaction;
                    } else {
                        state.items.push(transaction);
                    }
                }
            })
            .addCase(getTransactionByIdThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // By date range
            .addCase(getTransactionsByDateRangeThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getTransactionsByDateRangeThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = Array.isArray(action.payload?.data)
                    ? action.payload.data
                    : Array.isArray(action.payload)
                    ? action.payload
                    : [];
            })
            .addCase(getTransactionsByDateRangeThunk.rejected, (state, action) => {
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
            })
            // accept
            .addCase(acceptTransactionThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(acceptTransactionThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload?.data || action.payload;
                if (updated) {
                    const idx = state.items.findIndex(t => (t.inventoryId ?? t.id) === (updated.inventoryId ?? updated.id));
                    if (idx !== -1) {
                        state.items[idx] = updated;
                    } else {
                        // If transaction not found, add it to the list
                        state.items.push(updated);
                    }
                }
            })
            .addCase(acceptTransactionThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // reject
            .addCase(rejectTransactionThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(rejectTransactionThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload?.data || action.payload;
                if (updated) {
                    const idx = state.items.findIndex(t => (t.inventoryId ?? t.id) === (updated.inventoryId ?? updated.id));
                    if (idx !== -1) {
                        state.items[idx] = updated;
                    } else {
                        // If transaction not found, add it to the list
                        state.items.push(updated);
                    }
                }
            })
            .addCase(rejectTransactionThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // start shipping
            .addCase(startShippingTransactionThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(startShippingTransactionThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload?.data || action.payload;
                if (updated) {
                    const idx = state.items.findIndex(t => (t.inventoryId ?? t.id) === (updated.inventoryId ?? updated.id));
                    if (idx !== -1) {
                        state.items[idx] = updated;
                    } else {
                        // If transaction not found, add it to the list
                        state.items.push(updated);
                    }
                }
            })
            .addCase(startShippingTransactionThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // confirm delivery
            .addCase(confirmDeliveryTransactionThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(confirmDeliveryTransactionThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload?.data || action.payload;
                if (updated) {
                    const idx = state.items.findIndex(t => (t.inventoryId ?? t.id) === (updated.inventoryId ?? updated.id));
                    if (idx !== -1) state.items[idx] = updated;
                }
            })
            .addCase(confirmDeliveryTransactionThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // confirm payment
            .addCase(confirmPaymentTransactionThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(confirmPaymentTransactionThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload?.data || action.payload;
                if (updated) {
                    const idx = state.items.findIndex(t => (t.inventoryId ?? t.id) === (updated.inventoryId ?? updated.id));
                    if (idx !== -1) {
                        state.items[idx] = updated;
                    } else {
                        state.items.push(updated);
                    }
                }
            })
            .addCase(confirmPaymentTransactionThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // upload receipt
            .addCase(uploadReceiptThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(uploadReceiptThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload?.data || action.payload;
                if (updated) {
                    const idx = state.items.findIndex(t => (t.inventoryId ?? t.id) === (updated.inventoryId ?? updated.id));
                    if (idx !== -1) {
                        state.items[idx] = updated;
                    } else {
                        // If transaction not found, add it to the list
                        state.items.push(updated);
                    }
                }
            })
            .addCase(uploadReceiptThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { resetInventoryTransactions } = inventoryTransactionSlice.actions;
export default inventoryTransactionSlice.reducer;


