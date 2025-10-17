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
        snackbar: snackbarReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});