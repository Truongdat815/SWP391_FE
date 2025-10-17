import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as appointmentService from '@api/appointmentService';

// Thunks
export const getAllAppointmentsThunk = createAsyncThunk(
    'appointments/getAll',
    async (_, { rejectWithValue }) => {
        try {
            return await appointmentService.getAllAppointments();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch appointments');
        }
    }
);

export const getAppointmentByIdThunk = createAsyncThunk(
    'appointments/getById',
    async (appointmentId, { rejectWithValue }) => {
        try {
            return await appointmentService.getAppointmentById(appointmentId);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch appointment');
        }
    }
);

export const createAppointmentThunk = createAsyncThunk(
    'appointments/create',
    async (appointment, { rejectWithValue }) => {
        try {
            return await appointmentService.createAppointment(appointment);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to create appointment');
        }
    }
);

export const updateAppointmentThunk = createAsyncThunk(
    'appointments/update',
    async ({ appointmentId, data }, { rejectWithValue }) => {
        try {
            return await appointmentService.updateAppointment(appointmentId, data);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update appointment');
        }
    }
);

export const deleteAppointmentThunk = createAsyncThunk(
    'appointments/delete',
    async (appointmentId, { rejectWithValue }) => {
        try {
            await appointmentService.deleteAppointment(appointmentId);
            return appointmentId;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to delete appointment');
        }
    }
);

const initialState = {
    items: [],
    selected: null,
    status: 'idle',
    error: null,
};

const appointmentSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {
        clearSelected(state) {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // get all
            .addCase(getAllAppointmentsThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAllAppointmentsThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(getAllAppointmentsThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // get by id
            .addCase(getAppointmentByIdThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAppointmentByIdThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selected = action.payload;
            })
            .addCase(getAppointmentByIdThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // create
            .addCase(createAppointmentThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createAppointmentThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
            })
            .addCase(createAppointmentThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // update
            .addCase(updateAppointmentThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateAppointmentThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload;
                state.items = state.items.map((a) => (a.appointmentId === updated.appointmentId ? updated : a));
            })
            .addCase(updateAppointmentThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // delete
            .addCase(deleteAppointmentThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteAppointmentThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const id = action.payload;
                state.items = state.items.filter((a) => a.appointmentId !== id);
            })
            .addCase(deleteAppointmentThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearSelected } = appointmentSlice.actions;
export default appointmentSlice.reducer;


