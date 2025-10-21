import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as modelColorService from '@api/modelColorService';

export const getAllModelColorsThunk = createAsyncThunk(
    'modelColors/getAll',
    async (_, { rejectWithValue }) => {
        try {
            return await modelColorService.getAllModelColors();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch model colors');
        }
    }
);

export const createModelColorThunk = createAsyncThunk(
    'modelColors/create',
    async (payload, { rejectWithValue }) => {
        try {
            return await modelColorService.createModelColor(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to create model color');
        }
    }
);

export const updateModelColorThunk = createAsyncThunk(
    'modelColors/update',
    async (payload, { rejectWithValue }) => {
        try {
            return await modelColorService.updateModelColor(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update model color');
        }
    }
);

export const deleteModelColorThunk = createAsyncThunk(
    'modelColors/delete',
    async ({ modelId, colorId }, { rejectWithValue }) => {
        try {
            await modelColorService.deleteModelColor(modelId, colorId);
            return { modelId, colorId };
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to delete model color');
        }
    }
);

export const getColorsByModelIdThunk = createAsyncThunk(
    'modelColors/getColorsByModelId',
    async (modelId, { rejectWithValue }) => {
        try {
            return await modelColorService.getColorsByModelId(modelId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch colors for model');
        }
    }
);

const initialState = {
    items: [],
    colorsByModel: [],
    status: 'idle',
    error: null,
};

const modelColorSlice = createSlice({
    name: 'modelColors',
    initialState,
    reducers: {
        clearColorsByModel(state) {
            state.colorsByModel = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Get all model-colors
            .addCase(getAllModelColorsThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAllModelColorsThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(getAllModelColorsThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Create model-color
            .addCase(createModelColorThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createModelColorThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
            })
            .addCase(createModelColorThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Update model-color
            .addCase(updateModelColorThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateModelColorThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload;
                state.items = state.items.map((mc) =>
                    mc.modelId === updated.modelId && mc.colorId === updated.colorId
                        ? updated
                        : mc
                );
            })
            .addCase(updateModelColorThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Delete model-color
            .addCase(deleteModelColorThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteModelColorThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const { modelId, colorId } = action.payload;
                state.items = state.items.filter(
                    (mc) => !(mc.modelId === modelId && mc.colorId === colorId)
                );
            })
            .addCase(deleteModelColorThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Get colors by modelId
            .addCase(getColorsByModelIdThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getColorsByModelIdThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.colorsByModel = normalized;
            })
            .addCase(getColorsByModelIdThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearColorsByModel } = modelColorSlice.actions;
export default modelColorSlice.reducer;


