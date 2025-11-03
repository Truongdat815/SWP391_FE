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

export const getCustomersByStoreThunk = createAsyncThunk(
    'customers/getByStore',
    async (storeId, { rejectWithValue }) => {
        try {
            return await customerService.getCustomersByStore(storeId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch customers by store');
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
                // Extract customer data from response structure { code, message, data }
                const customer = action.payload?.data || action.payload;
                
                console.log('createCustomerThunk.fulfilled - Customer to add:', customer);
                console.log('createCustomerThunk.fulfilled - Current state.items:', state.items);
                
                if (customer) {
                    // Kiểm tra xem customer đã tồn tại chưa
                    const exists = state.items.some(c => c.customerId === customer.customerId);
                    if (!exists) {
                        state.items.push(customer);
                        console.log('Customer added to state. New count:', state.items.length);
                    } else {
                        console.log('Customer already exists in state, updating...');
                        state.items = state.items.map(c => 
                            c.customerId === customer.customerId ? customer : c
                        );
                    }
                } else {
                    console.warn('No customer data to add to state');
                }
                
                console.log('Final state.items after create:', state.items.length);
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
                
                // Debug log để kiểm tra response structure
                console.log('getAllCustomersThunk response:', payload);
                console.log('Response type:', typeof payload);
                console.log('Is array:', Array.isArray(payload));
                console.log('Has data property:', !!payload?.data);
                if (payload?.data) {
                    console.log('Data is array:', Array.isArray(payload.data));
                    console.log('Data length:', Array.isArray(payload.data) ? payload.data.length : 'N/A');
                }
                
                // Xử lý nhiều cấu trúc response có thể có
                let normalized = [];
                
                if (Array.isArray(payload?.data)) {
                    // Cấu trúc: { data: [...] }
                    normalized = payload.data;
                } else if (Array.isArray(payload?.data?.data)) {
                    // Cấu trúc: { data: { data: [...] } }
                    normalized = payload.data.data;
                } else if (Array.isArray(payload)) {
                    // Cấu trúc: [...] (trực tiếp là array)
                    normalized = payload;
                } else if (payload?.data && typeof payload.data === 'object') {
                    // Có thể là object chứa array bên trong
                    const dataValues = Object.values(payload.data);
                    if (dataValues.length > 0 && Array.isArray(dataValues[0])) {
                        normalized = dataValues[0];
                    }
                }
                
                console.log('Normalized customers from API:', normalized.length);
                if (normalized.length > 0) {
                    console.log('First customer sample:', normalized[0]);
                }
                
                // Merge với customers hiện có để không mất customers vừa tạo (nếu API chưa trả về)
                // Chỉ merge nếu API trả về ít hơn customers hiện có
                if (normalized.length === 0 && state.items.length > 0) {
                    console.log('API returned empty, keeping existing customers:', state.items.length);
                    // Giữ nguyên customers hiện có nếu API trả về rỗng
                    return;
                }
                
                // Merge customers mới với customers hiện có (loại bỏ duplicate)
                const existingIds = new Set(state.items.map(c => c.customerId));
                const newCustomers = normalized.filter(c => !existingIds.has(c.customerId));
                
                if (newCustomers.length > 0) {
                    console.log('Adding new customers:', newCustomers.length);
                    state.items = [...normalized, ...newCustomers];
                } else {
                    state.items = normalized;
                }
                
                console.log('Final customers count:', state.items.length);
            })
            .addCase(getAllCustomersThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(getCustomersByStoreThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getCustomersByStoreThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                
                // Debug log để kiểm tra response structure
                console.log('getCustomersByStoreThunk response:', payload);
                
                // Xử lý nhiều cấu trúc response có thể có
                let normalized = [];
                
                if (Array.isArray(payload?.data)) {
                    normalized = payload.data;
                } else if (Array.isArray(payload?.data?.data)) {
                    normalized = payload.data.data;
                } else if (Array.isArray(payload)) {
                    normalized = payload;
                } else if (payload?.data && typeof payload.data === 'object') {
                    const dataValues = Object.values(payload.data);
                    if (dataValues.length > 0 && Array.isArray(dataValues[0])) {
                        normalized = dataValues[0];
                    }
                }
                
                console.log('Normalized customers by store:', normalized.length);
                if (normalized.length > 0) {
                    console.log('First customer sample:', normalized[0]);
                }
                
                state.items = normalized;
            })
            .addCase(getCustomersByStoreThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                console.error('Failed to fetch customers by store:', action.payload);
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