import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  prices: {},      // { 'bitcoin': 50000 }
  changes24h: {}   // { 'bitcoin': 1.23 }
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setInitialPrices(state, action) {
      state.prices = { ...state.prices, ...action.payload };
    },
    updateLivePrices(state, action) {
      const { prices, changes24h } = action.payload;
      state.prices = { ...state.prices, ...prices };
      state.changes24h = { ...state.changes24h, ...changes24h };
    }
  }
});

export const { setInitialPrices, updateLivePrices } = marketSlice.actions;
export default marketSlice.reducer;
