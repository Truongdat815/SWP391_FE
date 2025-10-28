import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    createOrderDetail, 
    validateOrderDetail, 
    getAllOrderDetails, 
    getOrderDetailById, 
    updateOrderDetail, 
    deleteOrderDetail 
} from '../../api/order-detailService';
import { getOrderById } from '../../api/orderService';

// Async thunks
export const createOrderDetailThunk = createAsyncThunk(
    'orderDetails/create',
    async (orderDetailData, { rejectWithValue }) => {
        try {
            const response = await createOrderDetail(orderDetailData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const validateOrderDetailThunk = createAsyncThunk(
    'orderDetails/validate',
    async (orderDetailData, { rejectWithValue }) => {
        try {
            const response = await validateOrderDetail(orderDetailData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchOrderDetails = createAsyncThunk(
    'orderDetails/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllOrderDetails();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchOrderDetailsByOrderId = createAsyncThunk(
    'orderDetails/fetchByOrderId',
    async (orderId, { rejectWithValue }) => {
        try {
            // Use getOrderById which returns order with details
            const response = await getOrderById(orderId);
            console.log('📦 Order with details response:', response);
            
            // Extract order details from response
            // Response structure: { code: 200, data: { getOrderDetailsResponses: [...] } }
            const orderDetails = response?.data?.getOrderDetailsResponses || [];
            return orderDetails;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchOrderDetailById = createAsyncThunk(
    'orderDetails/fetchById',
    async (orderDetailId, { rejectWithValue }) => {
        try {
            const response = await getOrderDetailById(orderDetailId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateOrderDetailThunk = createAsyncThunk(
    'orderDetails/update',
    async ({ orderDetailId, orderDetailData }, { rejectWithValue }) => {
        try {
            const response = await updateOrderDetail(orderDetailId, orderDetailData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteOrderDetailThunk = createAsyncThunk(
    'orderDetails/delete',
    async (orderDetailId, { rejectWithValue }) => {
        try {
            await deleteOrderDetail(orderDetailId);
            return orderDetailId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    items: [],
    selectedOrderDetails: [], // For a specific order
    loading: false,
    error: null,
    success: null,
    validationResult: null
};

const orderDetailSlice = createSlice({
    name: 'orderDetails',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = null;
        },
        clearValidationResult: (state) => {
            state.validationResult = null;
        },
        clearSelectedOrderDetails: (state) => {
            state.selectedOrderDetails = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Create order detail
            .addCase(createOrderDetailThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrderDetailThunk.fulfilled, (state, action) => {
                state.loading = false;
                const data = action.payload?.data || action.payload;
                state.success = 'Thêm sản phẩm vào đơn hàng thành công!';
            })
            .addCase(createOrderDetailThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Validate order detail
            .addCase(validateOrderDetailThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(validateOrderDetailThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.validationResult = action.payload;
            })
            .addCase(validateOrderDetailThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch all order details
            .addCase(fetchOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload?.data || action.payload || [];
            })
            .addCase(fetchOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch order details by order ID
            .addCase(fetchOrderDetailsByOrderId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderDetailsByOrderId.fulfilled, (state, action) => {
                state.loading = false;
                // Action payload is already the array of order details
                state.selectedOrderDetails = Array.isArray(action.payload) ? action.payload : [];
                console.log('✅ Order details loaded:', state.selectedOrderDetails);
            })
            .addCase(fetchOrderDetailsByOrderId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.error('❌ Failed to load order details:', action.payload);
            })
            // Fetch order detail by ID
            .addCase(fetchOrderDetailById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrderDetailById.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(fetchOrderDetailById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update order detail
            .addCase(updateOrderDetailThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderDetailThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.success = 'Cập nhật thành công!';
            })
            .addCase(updateOrderDetailThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete order detail
            .addCase(deleteOrderDetailThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteOrderDetailThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter(item => item.orderDetailId !== action.payload);
                state.success = 'Xóa thành công!';
            })
            .addCase(deleteOrderDetailThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { 
    clearError, 
    clearSuccess, 
    clearValidationResult, 
    clearSelectedOrderDetails 
} = orderDetailSlice.actions;

export default orderDetailSlice.reducer;

