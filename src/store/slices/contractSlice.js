import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    uploadSignedContract,
    createContractFromOrder
} from '../../api/contractService';

// Async thunks
export const uploadSignedContractThunk = createAsyncThunk(
    'contracts/uploadSigned',
    async ({ contractId, file }, { rejectWithValue }) => {
        try {
            const response = await uploadSignedContract(contractId, file);
            // Return both the response and contractId for state update
            return { ...response, contractId };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createContractFromOrderThunk = createAsyncThunk(
    'contracts/createFromOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await createContractFromOrder(orderId);
            return response;
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
        },
        addContract: (state, action) => {
            state.contracts.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            // Upload signed contract
            .addCase(uploadSignedContractThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(uploadSignedContractThunk.fulfilled, (state, action) => {
                state.loading = false;
                const { contractId, data: url, code, message } = action.payload;
                console.log('Upload fulfilled payload:', action.payload);
                
                // Update the contract with the signed URL
                const index = state.contracts.findIndex(c => c.contractId === contractId);
                if (index !== -1) {
                    console.log('Updating contract at index:', index, 'with URL:', url);
                    state.contracts[index] = {
                        ...state.contracts[index],
                        signedContractFileUrl: url
                    };
                } else {
                    console.log('Contract not found in state for ID:', contractId);
                }
                state.success = message || 'Upload hợp đồng đã ký thành công!';
            })
            .addCase(uploadSignedContractThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create contract from order
            .addCase(createContractFromOrderThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createContractFromOrderThunk.fulfilled, (state, action) => {
                state.loading = false;
                // Response format: { contractId, viewUrl, message }
                const contractData = action.payload;
                state.contracts.push(contractData);
                state.selectedContract = contractData;
                state.success = contractData.message || 'Tạo hợp đồng thành công!';
            })
            .addCase(createContractFromOrderThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, setSelectedContract, clearSelectedContract, addContract } = contractSlice.actions;
export default contractSlice.reducer;

