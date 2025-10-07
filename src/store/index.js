import { configureStore } from '@reduxjs/toolkit';

import userReducer from '@store/slices/userSlice';

export const store = configureStore({
    reducer: {
        users: userReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});


