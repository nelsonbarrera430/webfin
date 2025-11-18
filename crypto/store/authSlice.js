import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null, // Almacenará { id, email, first_name, last_name, avatar }
    token: null,
    status: 'inactive', // 'inactive' | 'loading' | 'succeeded' | 'failed'
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoginLoading(state) {
            state.status = 'loading';
        },
        setLoginSuccess(state, action) {
            state.status = 'succeeded';
            state.user = action.payload.user; // Espera { user: profileData }
            state.token = action.payload.token;
        },
        setLoginFailed(state) {
            state.status = 'failed';
            state.user = null;
            state.token = null;
        },
        setLogout(state) {
            state.status = 'inactive';
            state.user = null;
            state.token = null;
        },
    },
});

export const { setLoginLoading, setLoginSuccess, setLoginFailed, setLogout } = authSlice.actions;
export default authSlice.reducer;