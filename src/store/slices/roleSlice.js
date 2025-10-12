import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as roleService from '@api/roleService';

export const getAllRolesThunk = createAsyncThunk(
    'roles/getAll',
    async (_, { rejectWithValue }) => {
        try {
            return await roleService.getAllRoles();
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch roles');
        }
    }
);

export const getRoleByRoleNameThunk = createAsyncThunk(
    'roles/getByRoleName',
    async (roleName, { rejectWithValue }) => {
        try {
            return await roleService.getRoleByRoleName(roleName);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to fetch role');
        }
    }
);

export const createRoleThunk = createAsyncThunk(
    'roles/create',
    async (role, { rejectWithValue }) => {
        try {
            return await roleService.createRole(role);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to create role');
        }
    }
);

export const updateRoleThunk = createAsyncThunk(
    'roles/update',
    async (payload, { rejectWithValue }) => {
        try {
            return await roleService.updateRole(payload);
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to update role');
        }
    }
);

export const deleteRoleThunk = createAsyncThunk(
    'roles/delete',
    async (roleId, { rejectWithValue }) => {
        try {
            await roleService.deleteRole(roleId);
            return roleId;
        } catch (err) {
            return rejectWithValue(err.message || 'Failed to delete role');
        }
    }
);

const initialState = {
    items: [],
    selected: null,
    status: 'idle',
    error: null,
};

const roleSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {
        clearSelected(state) {
            state.selected = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllRolesThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getAllRolesThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payload = action.payload;
                const normalized = Array.isArray(payload?.data)
                    ? payload.data
                    : Array.isArray(payload)
                        ? payload
                        : [];
                state.items = normalized;
            })
            .addCase(getAllRolesThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(getRoleByRoleNameThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getRoleByRoleNameThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.selected = action.payload;
            })
            .addCase(getRoleByRoleNameThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(createRoleThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createRoleThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items.push(action.payload);
            })
            .addCase(createRoleThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(updateRoleThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateRoleThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const updated = action.payload;
                state.items = state.items.map((r) => (r.roleId === updated.roleId ? updated : r));
            })
            .addCase(updateRoleThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            .addCase(deleteRoleThunk.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteRoleThunk.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const id = action.payload;
                state.items = state.items.filter((r) => r.roleId !== id);
            })
            .addCase(deleteRoleThunk.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { clearSelected } = roleSlice.actions;
export default roleSlice.reducer;
