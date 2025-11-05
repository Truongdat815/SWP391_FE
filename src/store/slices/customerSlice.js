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
            console.log('Deleting customer with ID:', customerId, 'Type:', typeof customerId);
            await customerService.deleteCustomer(customerId);
            console.log('Customer deleted successfully');
            return customerId;
        } catch (err) {
            console.error('Error deleting customer:', err);
            
            // Extract error message from various possible structures
            let errorMessage = 'Không thể xóa khách hàng';
            
            if (err?.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            } else if (err?.error) {
                errorMessage = err.error;
            } else if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            // Check for constraint errors and provide user-friendly message
            const errorStr = errorMessage.toString().toLowerCase();
            if (errorStr.includes('reference constraint') || 
                errorStr.includes('fk') || 
                errorStr.includes('contracts') ||
                errorStr.includes('hợp đồng')) {
                errorMessage = 'Không thể xóa khách hàng này vì có đơn hàng đã được tạo hợp đồng. Vui lòng xóa hoặc hủy các hợp đồng liên quan trước khi xóa khách hàng.';
            } else if (errorStr.includes('foreign key') || errorStr.includes('constraint')) {
                errorMessage = 'Không thể xóa khách hàng này vì có dữ liệu liên quan (đơn hàng, hợp đồng, v.v.). Vui lòng xóa các dữ liệu liên quan trước.';
            }
            
            return rejectWithValue(errorMessage);
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
                state.error = null;
                
                // Extract customer data from response structure { code, message, data }
                // Try multiple possible response structures
                let customer = null;
                
                if (action.payload?.data) {
                    customer = action.payload.data;
                } else if (action.payload?.customer) {
                    customer = action.payload.customer;
                } else if (action.payload && typeof action.payload === 'object' && action.payload.customerId) {
                    customer = action.payload;
                } else if (action.payload) {
                    customer = action.payload;
                }
                
                console.log('createCustomerThunk.fulfilled - Full payload:', action.payload);
                console.log('createCustomerThunk.fulfilled - Extracted customer:', customer);
                console.log('createCustomerThunk.fulfilled - Current state.items count:', state.items.length);
                
                if (customer && customer.customerId) {
                    // Kiểm tra xem customer đã tồn tại chưa
                    const existingIndex = state.items.findIndex(c => c.customerId === customer.customerId);
                    if (existingIndex === -1) {
                        // Thêm customer mới vào đầu danh sách
                        state.items.unshift(customer);
                        console.log('✅ Customer added to state. New count:', state.items.length);
                    } else {
                        // Cập nhật customer đã tồn tại
                        console.log('Customer already exists in state, updating...');
                        state.items[existingIndex] = customer;
                    }
                } else {
                    console.warn('⚠️ No valid customer data to add to state. Payload:', action.payload);
                    // Nếu không có customer data, vẫn đánh dấu thành công nhưng không thêm vào state
                    // getAllCustomersThunk sẽ được gọi sau đó để refresh danh sách
                }
                
                console.log('Final state.items count after create:', state.items.length);
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
                state.error = null;
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
                    console.log('First customer storeId:', normalized[0].storeId, 'type:', typeof normalized[0].storeId);
                }
                
                // ✅ CẢI THIỆN LOGIC: Luôn merge để không mất customers vừa tạo
                // Tạo một Map để lưu customers theo customerId (ưu tiên API data vì nó là source of truth từ server)
                const customersMap = new Map();
                const previousStateCount = state.items.length;
                
                // Thêm customers từ API vào Map (ưu tiên cao nhất - data từ server)
                normalized.forEach(customer => {
                    if (customer && customer.customerId) {
                        customersMap.set(customer.customerId, customer);
                    }
                });
                
                // Thêm customers từ state hiện tại vào Map nếu chưa có trong API response
                // Điều này giữ lại customers vừa tạo mà API có thể chưa trả về kịp
                let keptFromState = 0;
                state.items.forEach(customer => {
                    if (customer && customer.customerId && !customersMap.has(customer.customerId)) {
                        // Chỉ giữ lại customers có customerId hợp lệ (đã được server tạo)
                        // Nếu customerId là số dương, nghĩa là đã được lưu vào database
                        const customerId = customer.customerId;
                        if (typeof customerId === 'number' && customerId > 0) {
                            customersMap.set(customerId, customer);
                            keptFromState++;
                            console.log('🔄 Keeping customer from state (not in API yet):', customerId, customer.fullName);
                        }
                    }
                });
                
                // Chuyển Map về array và sort theo customerId giảm dần (mới nhất ở đầu)
                const mergedCustomers = Array.from(customersMap.values());
                mergedCustomers.sort((a, b) => (b.customerId || 0) - (a.customerId || 0));
                
                state.items = mergedCustomers;
                
                console.log('✅ Merged customers: API=', normalized.length, 
                           ', From previous state=', previousStateCount,
                           ', Kept from state=', keptFromState,
                           ', Final total=', mergedCustomers.length);
                console.log('Final customers count in state:', state.items.length);
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
                // Silently handle error - this thunk is deprecated, filtering is done in frontend
                // Don't set error state to avoid UI issues
                state.status = 'succeeded';
                state.error = null;
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