import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isAuthenticated: false,
    loading: true,
    user: null, // can store admin profile data here if needed
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
        },
        setAuthLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { setCredentials, logout, setAuthLoading } = authSlice.actions;

export default authSlice.reducer;
