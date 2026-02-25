import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    currentLead: null,
};

const leadSlice = createSlice({
    name: 'lead',
    initialState,
    reducers: {
        setCurrentLead: (state, action) => {
            state.currentLead = action.payload;
        },
        clearCurrentLead: (state) => {
            state.currentLead = null;
        },
    },
});

export const { setCurrentLead, clearCurrentLead } = leadSlice.actions;

export default leadSlice.reducer;
