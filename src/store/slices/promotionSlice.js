import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    createPromotion,
    createPromotionForAllModels,
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

export const createNewPromotionForAllModels = createAsyncThunk(
    'promotions/createPromotionForAllModels',
    async (promotionData, { rejectWithValue }) => {
        try {
            const response = await createPromotionForAllModels(promotionData);
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
                const allPromotions = action.payload.data || action.payload;
                
                // Process promotions: if there are multiple promotions with same details but different modelIds,
                // and one has modelId = 0, only keep that one
                if (Array.isArray(allPromotions)) {
                    const processedPromotions = [];
                    const groupedPromotions = new Map();
                    
                    // Group by promotion details (excluding modelId)
                    allPromotions.forEach(promo => {
                        const key = `${promo.promotionName || ''}_${promo.promotionType || ''}_${promo.amount || 0}_${promo.startDate || ''}_${promo.endDate || ''}_${promo.storeId || 0}`;
                        if (!groupedPromotions.has(key)) {
                            groupedPromotions.set(key, []);
                        }
                        groupedPromotions.get(key).push(promo);
                    });
                    
                    // For each group, if there's modelId = 0, only keep that one
                    // If multiple promotions with same details but different modelIds (and no modelId = 0),
                    // create a summary promotion with modelId = 0
                    groupedPromotions.forEach((group) => {
                        const allModelsPromo = group.find(p => p.modelId === 0 || p.modelId === null);
                        if (allModelsPromo) {
                            processedPromotions.push(allModelsPromo);
                        } else if (group.length > 1) {
                            // Multiple promotions with same details but different modelIds
                            // Create a summary promotion with modelId = 0
                            const firstPromo = group[0];
                            const summaryPromo = {
                                ...firstPromo,
                                modelId: 0,
                                promotionId: firstPromo.promotionId || 0,
                                // Store all related promotion IDs for deletion
                                relatedPromotionIds: group.map(p => p.promotionId).filter(id => id && !id.toString().startsWith('summary_'))
                            };
                            processedPromotions.push(summaryPromo);
                        } else {
                            // Single promotion in group
                            processedPromotions.push(...group);
                        }
                    });
                    
                    state.promotions = processedPromotions;
                } else {
                    state.promotions = allPromotions;
                }
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
            // Create promotion for all models
            .addCase(createNewPromotionForAllModels.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewPromotionForAllModels.fulfilled, (state, action) => {
                state.loading = false;
                // The response might be an array of promotions created for all models
                const promotionData = action.payload.data || action.payload;
                if (Array.isArray(promotionData)) {
                    // If array, check if there's a promotion with modelId = 0
                    const allModelsPromo = promotionData.find(p => p.modelId === 0);
                    if (allModelsPromo) {
                        // Only add the one with modelId = 0
                        state.promotions.push(allModelsPromo);
                    } else if (promotionData.length > 0) {
                        // If no modelId = 0, create a summary promotion with modelId = 0
                        const firstPromo = promotionData[0];
                        const summaryPromo = {
                            ...firstPromo,
                            modelId: 0,
                            promotionId: firstPromo.promotionId || 0
                        };
                        state.promotions.push(summaryPromo);
                    }
                } else {
                    // Single promotion, ensure modelId is 0
                    const promo = { ...promotionData, modelId: 0 };
                    state.promotions.push(promo);
                }
                state.success = action.payload.message || 'Tạo khuyến mãi cho tất cả model thành công!';
            })
            .addCase(createNewPromotionForAllModels.rejected, (state, action) => {
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


