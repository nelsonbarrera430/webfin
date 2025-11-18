import { createSlice } from '@reduxjs/toolkit';

const initialState = { assets: {} };

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    setAssets(state, action) {
      const map = {};
      action.payload.forEach(a => {
        if (a.id) map[a.id.toLowerCase()] = a;
      });
      state.assets = map;
    }
  }
});

export const { setAssets } = assetsSlice.actions;
export default assetsSlice.reducer;
