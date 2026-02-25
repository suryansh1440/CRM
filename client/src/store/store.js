import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import leadReducer from './leadSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        lead: leadReducer
    },
});
