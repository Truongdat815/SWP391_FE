import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as modelService from '@api/modelService';

// Thunks
export const getAllModelsThunk = createAsyncThunk(
    'models/getAll',
    async (_, { rejectWithValue }) => {
        try {
            return await modelService.getAllModels();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch models');
        }
    }
);

export const getModelByIdThunk = createAsyncThunk(
    'models/getById',
    async (modelId, { rejectWithValue }) => {
        try {
            return await modelService.getModelById(modelId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch model');
        }
    }
);

export const createModelThunk = createAsyncThunk(
    'models/create',
    async (model, { rejectWithValue }) => {
        try {
            return await modelService.createModel(model);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to create model');
        }
    }
);

export const updateModelThunk = createAsyncThunk(
    'models/update',
    async (payload, { rejectWithValue }) => {
        try {
            return await modelService.updateModel(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update model');
        }
    }
);

export const deleteModelThunk = createAsyncThunk(
    'models/delete',
    async (modelId, { rejectWithValue }) => {
        try {
            await modelService.deleteModel(modelId);
            return modelId;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to delete model');
        }
    }
);

export const getColorsByModelNameThunk = createAsyncThunk(
    'models/getColorsByModelName',
    async (modelName, { rejectWithValue }) => {
        try {
            return await modelService.getColorsByModelName(modelName);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch colors for model');
        }
    }
);

export const getModelsByColorNameThunk = createAsyncThunk(
    'models/getModelsByColorName',
    async (colorName, { rejectWithValue }) => {
        try {
            return await modelService.getModelsByColorName(colorName);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch models by color');
        }
    }
);

export const addColorToModelThunk = createAsyncThunk(
    'models/addColorToModel',
    async (payload, { rejectWithValue }) => {
        try {
            return await modelService.addColorToModel(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to add color to model');
        }
    }
);

export const removeColorFromModelThunk = createAsyncThunk(
    'models/removeColorFromModel',
    async (payload, { rejectWithValue }) => {
        try {
            await modelService.removeColorFromModel(payload);
            return payload;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to remove color from model');
        }
    }
);

const initialState = {
    items: [],
    selected: null,
    colorsOfSelectedModel: [],
    status: 'idle',
    error: null,
};

const modelSlice = createSlice({
    name: 'models',
    initialState,
    reducers: {
        clearSelected(state) {
            state.selected = null;
            state.colorsOfSelectedModel = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // get all
            .addCase(getAllModelsThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAllModelsThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(getAllModelsThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // get by id
            .addCase(getModelByIdThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getModelByIdThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selected = action.payload;
            })
            .addCase(getModelByIdThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // create
            .addCase(createModelThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createModelThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
            })
            .addCase(createModelThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // update
            .addCase(updateModelThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateModelThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload;
                state.items = state.items.map((m) => (m.modelId === updated.modelId ? updated : m));
            })
            .addCase(updateModelThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // delete
            .addCase(deleteModelThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteModelThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const id = action.payload;
                state.items = state.items.filter((m) => m.modelId !== id);
            })
            .addCase(deleteModelThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // colors by model name
            .addCase(getColorsByModelNameThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getColorsByModelNameThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.colorsOfSelectedModel = normalized;
            })
            .addCase(getColorsByModelNameThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // models by color
            .addCase(getModelsByColorNameThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getModelsByColorNameThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(getModelsByColorNameThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // add/remove color
            .addCase(addColorToModelThunk.fulfilled, (state) => {
                // Optimistic refresh is handled by re-querying getColorsByModelName from UI
            })
            .addCase(removeColorFromModelThunk.fulfilled, (state, action) => {
                const { colorId } = action.payload || {};
                if (!colorId) return;
                state.colorsOfSelectedModel = state.colorsOfSelectedModel.filter((c) => (c.colorId ?? c.id) !== colorId);
            });
    },
});

export const { clearSelected } = modelSlice.actions;
export default modelSlice.reducer;


