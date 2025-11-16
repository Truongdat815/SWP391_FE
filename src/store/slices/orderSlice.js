import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createOrder, 
  getAllOrders, 
  getOrderById, 
  updateOrder, 
  updateOrderStatus, 
  deleteOrder,
  getOrdersByStatus,
  getOrdersByDateRange,
  getOrdersByCustomer,
  getOrdersByStaffId,
  confirmOrder
} from '../../api/orderService';

// Async thunks
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllOrders();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewOrder = createAsyncThunk(
  'orders/createNewOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await createOrder(orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await getOrderById(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderById = createAsyncThunk(
  'orders/updateOrderById',
  async ({ orderId, orderData }, { rejectWithValue }) => {
    try {
      const response = await updateOrder(orderId, orderData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatusById = createAsyncThunk(
  'orders/updateOrderStatusById',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await updateOrderStatus(orderId, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteOrderById = createAsyncThunk(
  'orders/deleteOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      await deleteOrder(orderId);
      return orderId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrdersByStatus = createAsyncThunk(
  'orders/fetchOrdersByStatus',
  async (status, { rejectWithValue }) => {
    try {
      const response = await getOrdersByStatus(status);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrdersByDateRange = createAsyncThunk(
  'orders/fetchOrdersByDateRange',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await getOrdersByDateRange(startDate, endDate);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrdersByCustomer = createAsyncThunk(
  'orders/fetchOrdersByCustomer',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await getOrdersByCustomer(customerId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrdersByStaffId = createAsyncThunk(
  'orders/fetchOrdersByStaffId',
  async (staffId, { rejectWithValue }) => {
    try {
      const response = await getOrdersByStaffId(staffId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const confirmOrderThunk = createAsyncThunk(
  'orders/confirmOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await confirmOrder(orderId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  success: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both response formats: { data: [...] } or direct array
        const payload = action.payload;
        // Extract data from response if API returns { code, message, data }
        const ordersData = payload?.data || payload;
        state.orders = Array.isArray(ordersData) ? ordersData : [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create order
      .addCase(createNewOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Extract data from response if API returns { code, message, data }
        const orderData = action.payload.data || action.payload;
        state.orders.push(orderData);
        state.success = 'Tạo đơn hàng thành công!';
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order
      .addCase(updateOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(order => order.orderId === action.payload.orderId);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.success = 'Đơn hàng đã được cập nhật!';
      })
      .addCase(updateOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatusById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatusById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(order => order.orderId === action.payload.orderId);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        state.success = 'Trạng thái đơn hàng đã được cập nhật!';
      })
      .addCase(updateOrderStatusById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete order
      .addCase(deleteOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(order => order.orderId !== action.payload);
        state.success = 'Đơn hàng đã được xóa!';
      })
      .addCase(deleteOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch orders by status
      .addCase(fetchOrdersByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByStatus.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.orders = Array.isArray(payload?.data) 
          ? payload.data 
          : Array.isArray(payload) 
          ? payload 
          : [];
      })
      .addCase(fetchOrdersByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch orders by date range
      .addCase(fetchOrdersByDateRange.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByDateRange.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.orders = Array.isArray(payload?.data) 
          ? payload.data 
          : Array.isArray(payload) 
          ? payload 
          : [];
      })
      .addCase(fetchOrdersByDateRange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch orders by customer
      .addCase(fetchOrdersByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.orders = Array.isArray(payload?.data) 
          ? payload.data 
          : Array.isArray(payload) 
          ? payload 
          : [];
      })
      .addCase(fetchOrdersByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch orders by staff ID
      .addCase(fetchOrdersByStaffId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersByStaffId.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.orders = Array.isArray(payload?.data) 
          ? payload.data 
          : Array.isArray(payload) 
          ? payload 
          : [];
      })
      .addCase(fetchOrdersByStaffId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm order
      .addCase(confirmOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Extract data from response
        const confirmedOrder = action.payload?.data || action.payload;
        
        // Update order in state if it exists
        if (confirmedOrder && confirmedOrder.orderId) {
          const index = state.orders.findIndex(o => 
            String(o.orderId) === String(confirmedOrder.orderId)
          );
          if (index !== -1) {
            // Update existing order with new data from response
            state.orders[index] = {
              ...state.orders[index],
              ...confirmedOrder,
              status: confirmedOrder.status || 'CONFIRMED',
              getOrderDetailsResponses: confirmedOrder.getOrderDetailsResponses || [],
              totalPrice: confirmedOrder.totalPrice || 0,
              totalTaxPrice: confirmedOrder.totalTaxPrice || 0,
              totalPromotionAmount: confirmedOrder.totalPromotionAmount || 0,
              totalPayment: confirmedOrder.totalPayment || 0
            };
          } else {
            // Add new order if not found
            state.orders.push(confirmedOrder);
          }
        }
        state.success = 'Đơn hàng đã được xác nhận!';
      })
      .addCase(confirmOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, setSelectedOrder, clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
