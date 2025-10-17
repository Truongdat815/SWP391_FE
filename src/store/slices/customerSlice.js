import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllCustomers, createCustomer, getCustomerById, updateCustomer, deleteCustomer } from '../../api/customerService';

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllCustomers();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCustomer = createAsyncThunk(
  'customers/addCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await createCustomer(customerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchCustomerById',
  async (customerId, { rejectWithValue }) => {
    try {
      const response = await getCustomerById(customerId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCustomerById = createAsyncThunk(
  'customers/updateCustomerById',
  async ({ customerId, customerData }, { rejectWithValue }) => {
    try {
      const response = await updateCustomer(customerId, customerData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCustomerById = createAsyncThunk(
  'customers/deleteCustomerById',
  async (customerId, { rejectWithValue }) => {
    try {
      await deleteCustomer(customerId);
      return customerId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null,
  success: null
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add customer
      .addCase(addCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.push(action.payload);
        state.success = 'Khách hàng đã được thêm thành công!';
      })
      .addCase(addCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch customer by ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update customer
      .addCase(updateCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(customer => customer.customerId === action.payload.customerId);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        state.success = 'Thông tin khách hàng đã được cập nhật!';
      })
      .addCase(updateCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete customer
      .addCase(deleteCustomerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(customer => customer.customerId !== action.payload);
        state.success = 'Khách hàng đã được xóa!';
      })
      .addCase(deleteCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, setSelectedCustomer, clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;
