import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as customerService from '../../api/customerService';

export const createCustomerThunk = createAsyncThunk(
    'customers/create',
    async (customer, { rejectWithValue }) => {
        try {
            return await customerService.createCustomer(customer);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to create customer');
        }
    }
);

export const updateCustomerThunk = createAsyncThunk(
    'customers/update',
    async (payload, { rejectWithValue }) => {
        try {
            return await customerService.updateCustomer(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update customer');
        }
    }
);

export const getCustomerByIdThunk = createAsyncThunk(
    'customers/getById',
    async (id, { rejectWithValue }) => {
        try {
            return await customerService.getCustomerById(id);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch customer');
        }
    }
);

export const getAllCustomersThunk = createAsyncThunk(
    'customers/getAll',
    async (_, { rejectWithValue }) => {
        try {
            return await customerService.getAllCustomers();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch customers');
        }
    }
);

export const deleteCustomerThunk = createAsyncThunk(
    'customers/delete',
    async (customerId, { rejectWithValue }) => {
        try {
            await customerService.deleteCustomer(customerId);
            return customerId;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to delete customer');
        }
    }
);

const initialState = {
    items: [],
    selected: null,
    status: 'idle',
    error: null,
};

const customerSlice = createSlice({
    name: 'customers',
    initialState,
    reducers: {
        clearSelected(state) {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createCustomerThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createCustomerThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
            })
            .addCase(createCustomerThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(updateCustomerThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateCustomerThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload;
                state.items = state.items.map((c) => (c.customerId === updated.customerId ? updated : c));
            })
            .addCase(updateCustomerThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(getCustomerByIdThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getCustomerByIdThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selected = action.payload;
            })
            .addCase(getCustomerByIdThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(getAllCustomersThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAllCustomersThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(getAllCustomersThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(deleteCustomerThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteCustomerThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const id = action.payload;
                state.items = state.items.filter((c) => c.customerId !== id);
            })
            .addCase(deleteCustomerThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearSelected } = customerSlice.actions;
export default customerSlice.reducer;