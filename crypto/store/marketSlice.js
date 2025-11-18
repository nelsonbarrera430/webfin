import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    prices: {}, // { 'BTC': 50000.10, 'ETH': 3000.50 }
};

const marketSlice = createSlice({
    name: 'market',
    initialState,
    reducers: {
        // Para la carga inicial (Fetch 3 en main.js)
        setInitialPrices(state, action) {
            state.prices = action.payload;
        },
        // Para las actualizaciones del worker de polling
        updatePrices(state, action) {
            // action.payload debe ser un objeto como: { 'BTC': 50001.20, 'ETH': 3001.05 }
            // Object.assign actualiza los precios existentes y añade los nuevos
            Object.assign(state.prices, action.payload);
        },
    },
});

export const { setInitialPrices, updatePrices } = marketSlice.actions;
export default marketSlice.reducer;