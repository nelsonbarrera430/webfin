import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: {} // { 'bitcoin': { notes: '' } }
};

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    setWatchlist(state, action) {
      const list = action.payload || [];
      const map = {};
      list.forEach(id => { map[id] = { notes: '' }; });
      state.items = map;
    },
    addToWatchlist(state, action) {
      const id = action.payload;
      if (!state.items[id]) state.items[id] = { notes: '' };
    },
    removeFromWatchlist(state, action) {
      const id = action.payload;
      delete state.items[id];
    },
    setNotes(state, action) {
      const { id, notes } = action.payload;
      if (state.items[id]) state.items[id].notes = notes;
    }
  }
});

export const { setWatchlist, addToWatchlist, removeFromWatchlist, setNotes } = watchlistSlice.actions;
export default watchlistSlice.reducer;
