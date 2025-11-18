import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  status: 'inactive'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginSuccess(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.status = 'succeeded';
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = 'inactive';
    }
  }
});

export const { setLoginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
