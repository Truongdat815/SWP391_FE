import { configureStore } from '@reduxjs/toolkit';

import userReducer from '@store/slices/userSlice';
import storeReducer from '@store/slices/storeSlice';
import roleReducer from '@store/slices/roleSlice';
import modelReducer from '@store/slices/modelSlice';
import colorReducer from '@store/slices/colorSlice';
import modelColorReducer from '@store/slices/modelColorSlice';

export const store = configureStore({
    reducer: {
        users: userReducer,
        stores: storeReducer,
        roles: roleReducer,
        models: modelReducer,
        colors: colorReducer,
        modelColors: modelColorReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});


