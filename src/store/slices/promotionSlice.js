import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createPromotion,
    getAllPromotions,
    getPromotionByName,
    updatePromotion,
    deletePromotion,
    getActivePromotions
} from '../../api/promotionService';

// Async thunks
export const fetchPromotions = createAsyncThunk(
    'promotions/fetchPromotions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAllPromotions();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchActivePromotions = createAsyncThunk(
    'promotions/fetchActivePromotions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getActivePromotions();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createNewPromotion = createAsyncThunk(
    'promotions/createNewPromotion',
    async (promotionData, { rejectWithValue }) => {
        try {
            const response = await createPromotion(promotionData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updatePromotionById = createAsyncThunk(
    'promotions/updatePromotionById',
    async ({ promotionId, promotionData }, { rejectWithValue }) => {
        try {
            const response = await updatePromotion(promotionId, promotionData);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deletePromotionById = createAsyncThunk(
    'promotions/deletePromotionById',
    async (promotionId, { rejectWithValue }) => {
        try {
            await deletePromotion(promotionId);
            return promotionId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    promotions: [],
    activePromotions: [],
    selectedPromotion: null,
    loading: false,
    error: null,
    success: null
};

const promotionSlice = createSlice({
    name: 'promotions',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = null;
        },
        setSelectedPromotion: (state, action) => {
            state.selectedPromotion = action.payload;
        },
        clearSelectedPromotion: (state) => {
            state.selectedPromotion = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch all promotions
            .addCase(fetchPromotions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPromotions.fulfilled, (state, action) => {
                state.loading = false;
                state.promotions = action.payload.data || action.payload;
            })
            .addCase(fetchPromotions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch active promotions
            .addCase(fetchActivePromotions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchActivePromotions.fulfilled, (state, action) => {
                state.loading = false;
                state.activePromotions = action.payload;
            })
            .addCase(fetchActivePromotions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create promotion
            .addCase(createNewPromotion.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewPromotion.fulfilled, (state, action) => {
                state.loading = false;
                const promotionData = action.payload.data || action.payload;
                state.promotions.push(promotionData);
                state.success = action.payload.message || 'Tạo khuyến mãi thành công!';
            })
            .addCase(createNewPromotion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update promotion
            .addCase(updatePromotionById.pending, (state) => {
                state.loading = true;
            })
            .addCase(updatePromotionById.fulfilled, (state, action) => {
                state.loading = false;
                const updatedPromotion = action.payload.data || action.payload;
                const index = state.promotions.findIndex(p => p.promotionId === updatedPromotion.promotionId);
                if (index !== -1) {
                    state.promotions[index] = updatedPromotion;
                }
                state.success = 'Cập nhật khuyến mãi thành công!';
            })
            .addCase(updatePromotionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete promotion
            .addCase(deletePromotionById.pending, (state) => {
                state.loading = true;
            })
            .addCase(deletePromotionById.fulfilled, (state, action) => {
                state.loading = false;
                state.promotions = state.promotions.filter(p => p.promotionId !== action.payload);
                state.success = 'Xóa khuyến mãi thành công!';
            })
            .addCase(deletePromotionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, setSelectedPromotion, clearSelectedPromotion } = promotionSlice.actions;
export default promotionSlice.reducer;


