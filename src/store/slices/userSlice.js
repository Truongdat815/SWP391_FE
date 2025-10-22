import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '@api/userService';

export const createUserThunk = createAsyncThunk(
    'users/create',
    async (user, { rejectWithValue }) => {
        try {
            return await userService.createUser(user);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to create user');
        }
    }
);

export const updateUserThunk = createAsyncThunk(
    'users/update',
    async (payload, { rejectWithValue }) => {
        try {
            return await userService.updateUser(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update user');
        }
    }
);

export const getUserByNameThunk = createAsyncThunk(
    'users/getByName',
    async (name, { rejectWithValue }) => {
        try {
            return await userService.getUserByName(name);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch user');
        }
    }
);

export const getAllUsersThunk = createAsyncThunk(
    'users/getAll',
    async (_, { rejectWithValue }) => {
        try {
            return await userService.getAllUsers();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch users');
        }
    }
);

export const deleteUserThunk = createAsyncThunk(
    'users/delete',
    async (userId, { rejectWithValue }) => {
        try {
            await userService.deleteUser(userId);
            return userId;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to delete user');
        }
    }
);

const initialState = {
    items: [],
    selected: null,
    status: 'idle',
    error: null,
};

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearSelected(state) {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createUserThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createUserThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const newUser = action.payload?.data || action.payload;
                state.items.push(newUser);
            })
            .addCase(createUserThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(updateUserThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateUserThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload;
                state.items = state.items.map((u) => (u.userId === updated.userId ? updated : u));
            })
            .addCase(updateUserThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(getUserByNameThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getUserByNameThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selected = action.payload;
            })
            .addCase(getUserByNameThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(getAllUsersThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAllUsersThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                
                // Handle different response structures
                let normalized = [];
                if (Array.isArray(payload?.data?.data)) {
                    normalized = payload.data.data;
                } else if (Array.isArray(payload?.data)) {
                    normalized = payload.data;
                } else if (Array.isArray(payload)) {
                    normalized = payload;
                }
                
                state.items = normalized;
            })
            .addCase(getAllUsersThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(deleteUserThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteUserThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const userId = action.payload;
                state.items = state.items.filter((u) => u.userId !== userId);
            })
            .addCase(deleteUserThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearSelected } = userSlice.actions;
export default userSlice.reducer;


