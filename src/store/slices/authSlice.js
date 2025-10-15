import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../api/authService';

// Login thunk
export const loginThunk = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            
            console.log('Login API response:', response); // Debug log
            
            // Check if login is successful
            if (response.code === 0 || response.message === 'User login successfully') {
                const { accessToken, refreshToken } = response.data || response;
                
                // Save tokens to localStorage
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', refreshToken);
                
                // Get user info from API - only use /api/users/all
                console.log('Getting user info for email:', credentials.email);
                
                // Get all users and find by email
                const allUsersResponse = await authService.getAllUsers();
                console.log('All users response:', allUsersResponse);
                const allUsers = allUsersResponse.data || allUsersResponse;
                const userInfo = allUsers.find(user => user.email === credentials.email);
                
                if (!userInfo) {
                    throw new Error('User info not found');
                }
                
                // Save user info to localStorage
                localStorage.setItem('user_info', JSON.stringify(userInfo));
                
                return {
                    tokens: response.data || response,
                    user: userInfo
                };
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            return rejectWithValue(err.message || 'Login failed');
        }
    }
);

// Refresh token thunk
export const refreshTokenThunk = createAsyncThunk(
    'auth/refreshToken',
    async (_, { rejectWithValue }) => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }
            
            const response = await authService.refreshToken(refreshToken);
            
            if (response.code === 0) {
                const { accessToken, refreshToken: newRefreshToken } = response.data;
                
                localStorage.setItem('access_token', accessToken);
                localStorage.setItem('refresh_token', newRefreshToken);
                
                return response.data;
            } else {
                throw new Error(response.message || 'Token refresh failed');
            }
        } catch (err) {
            return rejectWithValue(err.message || 'Token refresh failed');
        }
    }
);

// Initialize auth state from localStorage
const initializeAuthState = () => {
    const userInfo = localStorage.getItem('user_info');
    const accessToken = localStorage.getItem('access_token');
    
    if (userInfo && accessToken) {
        try {
            return {
                isAuthenticated: true,
                user: JSON.parse(userInfo),
                tokens: {
                    accessToken,
                    refreshToken: localStorage.getItem('refresh_token')
                }
            };
        } catch (error) {
            console.error('Error parsing stored user info:', error);
        }
    }
    
    return {
        isAuthenticated: false,
        user: null,
        tokens: null
    };
};

const initialState = {
    ...initializeAuthState(),
    status: 'idle',
    error: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            authService.logout();
            state.isAuthenticated = false;
            state.user = null;
            state.tokens = null;
            state.status = 'idle';
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(loginThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.tokens = action.payload.tokens;
                state.error = null;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.isAuthenticated = false;
                state.user = null;
                state.tokens = null;
                state.error = action.payload;
            })
            
            // Refresh token cases
            .addCase(refreshTokenThunk.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(refreshTokenThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.tokens = action.payload;
                state.error = null;
            })
            .addCase(refreshTokenThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.isAuthenticated = false;
                state.user = null;
                state.tokens = null;
                state.error = action.payload;
            });
    }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;