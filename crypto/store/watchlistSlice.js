import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: {}, // { 'BTC': { notes: 'Comprar más' }, 'ETH': { notes: 'HODL' } }
};

const watchlistSlice = createSlice({
    name: 'watchlist',
    initialState,
    reducers: {
        setWatchlist(state, action) {
            state.items = action.payload; // Payload ya debe estar normalizado
        },
        addWatchlistItem(state, action) {
            // payload: { symbol: 'SOL', data: { notes: '' } }
            const { symbol, data } = action.payload;
            state.items[symbol] = data;
        },
        removeWatchlistItem(state, action) {
            // payload: 'SOL' (el símbolo)
            delete state.items[action.payload];
        },
    },
});

export const { setWatchlist, addWatchlistItem, removeWatchlistItem } = watchlistSlice.actions;
export default watchlistSlice.reducer;