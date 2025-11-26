import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../api/baseApi';
import { bankApi } from '../api/public/bankApi';
import authReducer from './slices/authSlice';

// Import all API slices to ensure they're registered
import '../api/dealerStaff/storeStockApi';
import '../api/dealerStaff/customerApi';
import '../api/dealerStaff/orderApi';
import '../api/dealerStaff/contractApi';
import '../api/dealerStaff/paymentApi';
import '../api/dealerStaff/quotationApi';
import '../api/admin/modelApi';
import '../api/admin/storeStockApi';
import '../api/evmStaff/productApi';
import '../api/dealerManager/promotionApi';
import '../api/auth/authApi';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [bankApi.reducerPath]: bankApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware).concat(bankApi.middleware),
});

setupListeners(store.dispatch);

export default store;

