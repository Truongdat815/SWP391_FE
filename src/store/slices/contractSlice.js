import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createContract,
    getAllContracts,
    getContractById,
    getContractsByStatus,
    updateContract,
    updateContractStatus,
    deleteContract
} from '../../api/contractService';

// Async thunks
export const fetchContracts = createAsyncThunk(
    'contracts/fetchContracts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllContracts();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchContractById = createAsyncThunk(
    'contracts/fetchContractById',
    async (contractId, { rejectWithValue }) => {
        try {
            const response = await getContractById(contractId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchContractsByStatus = createAsyncThunk(
    'contracts/fetchContractsByStatus',
    async (status, { rejectWithValue }) => {
        try {
            const response = await getContractsByStatus(status);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createNewContract = createAsyncThunk(
    'contracts/createNewContract',
    async (contractData, { rejectWithValue }) => {
        try {
            const response = await createContract(contractData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateContractById = createAsyncThunk(
    'contracts/updateContractById',
    async ({ contractId, contractData }, { rejectWithValue }) => {
        try {
            const response = await updateContract(contractId, contractData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateContractStatusById = createAsyncThunk(
    'contracts/updateContractStatusById',
    async ({ contractId, status }, { rejectWithValue }) => {
        try {
            const response = await updateContractStatus(contractId, status);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteContractById = createAsyncThunk(
    'contracts/deleteContractById',
    async (contractId, { rejectWithValue }) => {
        try {
            await deleteContract(contractId);
            return contractId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    contracts: [],
    selectedContract: null,
    loading: false,
    error: null,
    success: null
};

const contractSlice = createSlice({
    name: 'contracts',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = null;
        },
        setSelectedContract: (state, action) => {
            state.selectedContract = action.payload;
        },
        clearSelectedContract: (state) => {
            state.selectedContract = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all contracts
            .addCase(fetchContracts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContracts.fulfilled, (state, action) => {
                state.loading = false;
                state.contracts = action.payload.data || action.payload;
            })
            .addCase(fetchContracts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch contract by ID
            .addCase(fetchContractById.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchContractById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedContract = action.payload.data || action.payload;
            })
            .addCase(fetchContractById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch contracts by status
            .addCase(fetchContractsByStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchContractsByStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.contracts = action.payload.data || action.payload;
            })
            .addCase(fetchContractsByStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create contract
            .addCase(createNewContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewContract.fulfilled, (state, action) => {
                state.loading = false;
                const contractData = action.payload.data || action.payload;
                state.contracts.push(contractData);
                state.selectedContract = contractData;
                state.success = action.payload.message || 'Tạo hợp đồng thành công!';
            })
            .addCase(createNewContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update contract
            .addCase(updateContractById.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateContractById.fulfilled, (state, action) => {
                state.loading = false;
                const updatedContract = action.payload.data || action.payload;
                const index = state.contracts.findIndex(c => c.contractId === updatedContract.contractId);
                if (index !== -1) {
                    state.contracts[index] = updatedContract;
                }
                state.success = 'Cập nhật hợp đồng thành công!';
            })
            .addCase(updateContractById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update contract status
            .addCase(updateContractStatusById.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateContractStatusById.fulfilled, (state, action) => {
                state.loading = false;
                const updatedContract = action.payload.data || action.payload;
                const index = state.contracts.findIndex(c => c.contractId === updatedContract.contractId);
                if (index !== -1) {
                    state.contracts[index] = updatedContract;
                }
                state.success = 'Cập nhật trạng thái hợp đồng thành công!';
            })
            .addCase(updateContractStatusById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete contract
            .addCase(deleteContractById.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteContractById.fulfilled, (state, action) => {
                state.loading = false;
                state.contracts = state.contracts.filter(c => c.contractId !== action.payload);
                state.success = 'Xóa hợp đồng thành công!';
            })
            .addCase(deleteContractById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, setSelectedContract, clearSelectedContract } = contractSlice.actions;
export default contractSlice.reducer;


