import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    open: false,
    message: '',
    severity: 'info', // 'success', 'error', 'warning', 'info'
    duration: 4000, // milliseconds
    action: null, // optional action button
};

const snackbarSlice = createSlice({
    name: 'snackbar',
    initialState,
    reducers: {
        showSnackbar: (state, action) => {
            const { message, severity = 'info', duration = 4000, action: actionButton = null } = action.payload;
            state.open = true;
            state.message = message;
            state.severity = severity;
            state.duration = duration;
            state.action = actionButton;
        },
        hideSnackbar: (state) => {
            state.open = false;
            state.message = '';
            state.severity = 'info';
            state.duration = 4000;
            state.action = null;
        },
        // Convenience methods for different severity levels
        showSuccess: (state, action) => {
            const { message, duration = 4000, action: actionButton = null } = action.payload;
            state.open = true;
            state.message = message;
            state.severity = 'success';
            state.duration = duration;
            state.action = actionButton;
        },
        showError: (state, action) => {
            const { message, duration = 6000, action: actionButton = null } = action.payload;
            state.open = true;
            state.message = message;
            state.severity = 'error';
            state.duration = duration;
            state.action = actionButton;
        },
        showWarning: (state, action) => {
            const { message, duration = 5000, action: actionButton = null } = action.payload;
            state.open = true;
            state.message = message;
            state.severity = 'warning';
            state.duration = duration;
            state.action = actionButton;
        },
        showInfo: (state, action) => {
            const { message, duration = 4000, action: actionButton = null } = action.payload;
            state.open = true;
            state.message = message;
            state.severity = 'info';
            state.duration = duration;
            state.action = actionButton;
        },
    },
});

export const { 
    showSnackbar, 
    hideSnackbar, 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo 
} = snackbarSlice.actions;

export default snackbarSlice.reducer;
