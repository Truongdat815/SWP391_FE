import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as colorService from '@api/colorService';

export const getAllColorsThunk = createAsyncThunk(
    'colors/getAll',
    async (_, { rejectWithValue }) => {
        try {
            return await colorService.getAllColors();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch colors');
        }
    }
);

export const createColorThunk = createAsyncThunk(
    'colors/create',
    async (color, { rejectWithValue }) => {
        try {
            return await colorService.createColor(color);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to create color');
        }
    }
);

export const updateColorThunk = createAsyncThunk(
    'colors/update',
    async (payload, { rejectWithValue }) => {
        try {
            return await colorService.updateColor(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update color');
        }
    }
);

export const deleteColorThunk = createAsyncThunk(
    'colors/delete',
    async (colorId, { rejectWithValue }) => {
        try {
            await colorService.deleteColor(colorId);
            return colorId;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to delete color');
        }
    }
);

const initialState = {
    items: [],
    status: 'idle',
    error: null,
};

const colorSlice = createSlice({
    name: 'colors',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllColorsThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAllColorsThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(getAllColorsThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(createColorThunk.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })

            .addCase(updateColorThunk.fulfilled, (state, action) => {
                const updated = action.payload;
                state.items = state.items.map((c) => (c.colorId === updated.colorId ? updated : c));
            })

            .addCase(deleteColorThunk.fulfilled, (state, action) => {
                const id = action.payload;
                state.items = state.items.filter((c) => c.colorId !== id);
            });
    },
});

export default colorSlice.reducer;


