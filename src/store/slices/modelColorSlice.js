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

// update/delete not exposed by backend swagger; keep only create/list for now

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

const modelColorSlice = createSlice({
    name: 'modelColors',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
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
            .addCase(createModelColorThunk.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            ;
    },
});

export default modelColorSlice.reducer;


