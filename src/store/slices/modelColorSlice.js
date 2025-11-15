import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as modelColorService from '@api/modelColorService';

// Thunks
export const getAllModelColorsThunk = createAsyncThunk(
    'modelColors/getAll',
    async (_, { rejectWithValue, getState }) => {
        try {
            // Get user role from auth state to determine if we need all model colors
            const state = getState();
            const user = state.auth?.user;
            const userRole = user?.roleId || user?.roleName?.toLowerCase() || '';
            
            // EVM Staff (roleId: 2) and Admin (roleId: 1) don't have storeId, need all model colors
            const isEvmStaff = userRole === 2 || userRole === 'evm-staff' || 
                              (typeof userRole === 'string' && userRole.includes('nhân viên hãng xe'));
            const isAdmin = userRole === 1 || userRole === 'admin' || 
                           (typeof userRole === 'string' && userRole.includes('quản trị viên'));
            
            // If user is EVM Staff or Admin, request all model colors without store filter
            const options = (isEvmStaff || isAdmin) ? { all: true } : {};
            
            return await modelColorService.getAllModelColors(options);
        } catch (err) {
            // Handle specific error code 1004 (store not found) for EVM Staff
            const errorCode = err.code || (err.response?.code);
            const errorMessage = err.message || '';
            
            if (errorCode === 1004 || errorMessage.includes('Không tìm thấy store') || errorMessage.includes('1004')) {
                // User is likely EVM Staff/Admin without storeId, retry with all=true
                console.log('Store not found error (1004), retrying with all=true for EVM Staff/Admin');
                try {
                    return await modelColorService.getAllModelColors({ all: true });
                } catch (retryErr) {
                    console.error('Retry failed:', retryErr);
                    return rejectWithValue(retryErr.message || 'Failed to fetch model colors');
                }
            }
            return rejectWithValue(err.message || 'Failed to fetch model colors');
        }
    }
);

export const getModelColorsByModelIdThunk = createAsyncThunk(
    'modelColors/getByModelId',
    async (modelId, { rejectWithValue }) => {
        try {
            return await modelColorService.getModelColorsByModelId(modelId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch model colors by model');
        }
    }
);

export const getModelColorsByColorIdThunk = createAsyncThunk(
    'modelColors/getByColorId',
    async (colorId, { rejectWithValue }) => {
        try {
            return await modelColorService.getModelColorsByColorId(colorId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch model colors by color');
        }
    }
);

export const createModelColorThunk = createAsyncThunk(
    'modelColors/create',
    async (data, { rejectWithValue }) => {
        try {
            return await modelColorService.createModelColor(data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to create model color');
        }
    }
);

export const updateModelColorThunk = createAsyncThunk(
    'modelColors/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await modelColorService.updateModelColor(id, data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update model color');
        }
    }
);

export const deleteModelColorThunk = createAsyncThunk(
    'modelColors/delete',
    async (id, { rejectWithValue }) => {
        try {
            await modelColorService.deleteModelColor(id);
            return id;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to delete model color');
        }
    }
);

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

const modelColorSlice = createSlice({
    name: 'modelColors',
    initialState,
    reducers: {
        clearModelColors(state) {
            state.items = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all
            .addCase(getAllModelColorsThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAllModelColorsThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                state.items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
            })
            .addCase(getAllModelColorsThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                // Keep existing items if any, don't clear them on error
                // This allows UI to still display data even if refresh fails
                if (state.items.length === 0) {
                    state.items = [];
                }
            })
            
            // Get by model ID
            .addCase(getModelColorsByModelIdThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getModelColorsByModelIdThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(getModelColorsByModelIdThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // Get by color ID
            .addCase(getModelColorsByColorIdThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(getModelColorsByColorIdThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
            })
            .addCase(getModelColorsByColorIdThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // Create
            .addCase(createModelColorThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createModelColorThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
            })
            .addCase(createModelColorThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // Update
            .addCase(updateModelColorThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateModelColorThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload;
                const index = state.items.findIndex(item => item.modelColorId === updated.modelColorId);
                if (index !== -1) {
                    state.items[index] = updated;
                }
            })
            .addCase(updateModelColorThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            
            // Delete
            .addCase(deleteModelColorThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(deleteModelColorThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const modelColorId = action.payload;
                state.items = state.items.filter(item => item.modelColorId !== modelColorId);
            })
            .addCase(deleteModelColorThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearModelColors } = modelColorSlice.actions;
export default modelColorSlice.reducer;
