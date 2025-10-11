import { configureStore } from '@reduxjs/toolkit';

import userReducer from '@store/slices/userSlice';
import storeReducer from '@store/slices/storeSlice';

export const store = configureStore({
    reducer: {
        users: userReducer,
        stores: storeReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});


