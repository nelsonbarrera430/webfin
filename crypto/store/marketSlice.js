import { createSlice } from '@reduxjs/toolkit';

// Define el estado inicial (initialState) del slice de mercado.
const initialState = {
    // prices: Objeto que almacena el precio actual de cada criptomoneda, mapeado por su símbolo.
    prices: {}, // { 'BTC': 50000.10, 'ETH': 3000.50 }
};

// Crea un "slice" de Redux para la gestión de los datos de mercado.
const marketSlice = createSlice({
    name: 'market', // Nombre usado como prefijo para las acciones (ej: 'market/updatePrices').
    initialState, // Estado inicial definido arriba.
    reducers: { // Objeto que define las funciones para actualizar el estado.
        
        // Reducer para la carga inicial de precios (por ejemplo, después del login).
        setInitialPrices(state, action) {
            // El payload reemplaza completamente el objeto de precios actual.
            state.prices = action.payload; 
        },
        
        // Reducer para las actualizaciones de precios en tiempo real (generalmente desde un Web Worker).
        updatePrices(state, action) {
            // action.payload debe ser un objeto como: { 'BTC': 50001.20, 'ETH': 3001.05 }
            
            // Object.assign() fusiona el payload (nuevos precios) con el estado existente (state.prices).
            // Esto actualiza los precios existentes y añade cualquier nuevo símbolo.
            Object.assign(state.prices, action.payload);
        },
    },
});

// Exporta las funciones de acción generadas automáticamente por createSlice.
export const { setInitialPrices, updatePrices } = marketSlice.actions;
// Exporta el reducer principal para ser combinado en la store de Redux.
export default marketSlice.reducer;