import { configureStore } from '@reduxjs/toolkit';

import userReducer from '@store/slices/userSlice';
import storeReducer from '@store/slices/storeSlice';
import roleReducer from '@store/slices/roleSlice';
import modelReducer from '@store/slices/modelSlice';
import colorReducer from '@store/slices/colorSlice';

export const store = configureStore({
    reducer: {
        users: userReducer,
        stores: storeReducer,
        roles: roleReducer,
        models: modelReducer,
        colors: colorReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});


