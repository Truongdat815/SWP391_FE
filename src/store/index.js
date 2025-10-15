import { configureStore } from '@reduxjs/toolkit';

import userReducer from './slices/userSlice';
import storeReducer from './slices/storeSlice';
import roleReducer from './slices/roleSlice';
import modelReducer from './slices/modelSlice';
import colorReducer from './slices/colorSlice';
import modelColorReducer from './slices/modelColorSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer, // Add this line
        users: userReducer,
        stores: storeReducer,
        roles: roleReducer,
        models: modelReducer,
        colors: colorReducer,
        modelColors: modelColorReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});