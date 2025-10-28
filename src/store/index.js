import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import storeReducer from './slices/storeSlice';
import roleReducer from './slices/roleSlice';
import modelReducer from './slices/modelSlice';
import colorReducer from './slices/colorSlice';
import modelColorReducer from './slices/modelColorSlice';
import authReducer from './slices/authSlice';
import storeStockReducer from './slices/store-stockSlice';
import snackbarReducer from './slices/snackbarSlice';
import customerReducer from './slices/customerSlice';
import orderReducer from './slices/orderSlice';
import orderDetailReducer from './slices/orderDetailSlice';
import inventoryTransactionReducer from './slices/inventoryTransactionSlice';
import appointmentReducer from './slices/appointmentSlice';
import promotionReducer from './slices/promotionSlice';
import contractReducer from './slices/contractSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        stores: storeReducer,
        roles: roleReducer,
        models: modelReducer,
        colors: colorReducer,
        modelColors: modelColorReducer,
        storeStocks: storeStockReducer,
        inventoryTransactions: inventoryTransactionReducer,
        snackbar: snackbarReducer,
        customers: customerReducer,
        orders: orderReducer,
        orderDetails: orderDetailReducer,
        appointments: appointmentReducer,
        promotions: promotionReducer,
        contracts: contractReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});