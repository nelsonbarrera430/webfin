import { createSlice } from '@reduxjs/toolkit';
// Importa la función createSlice de Redux Toolkit, que permite crear slices de estado con reducers y acciones automáticamente.

const initialState = {
  prices: {},      // Objeto que almacenará los precios actuales de cada activo. Ejemplo: { 'bitcoin': 50000 }
  changes24h: {}   // Objeto que almacenará el cambio porcentual en 24 horas de cada activo. Ejemplo: { 'bitcoin': 1.23 }
};

const marketSlice = createSlice({
  name: 'market',       // Nombre del slice, usado internamente por Redux.
  initialState,         // Estado inicial definido arriba.
  reducers: {           // Reducers: funciones que modifican el estado en respuesta a acciones.
    setInitialPrices(state, action) {
      // Reducer para establecer los precios iniciales de los activos.
      // Combina los precios existentes con los nuevos recibidos en el payload.
      state.prices = { ...state.prices, ...action.payload };
    },
    updateLivePrices(state, action) {
      // Reducer para actualizar precios y cambios en vivo.
      const { prices, changes24h } = action.payload; // Extrae precios y cambios del payload.
      state.prices = { ...state.prices, ...prices };       // Actualiza precios mezclando anteriores y nuevos.
      state.changes24h = { ...state.changes24h, ...changes24h }; // Actualiza cambios mezclando anteriores y nuevos.
    }
  }
});

export const { setInitialPrices, updateLivePrices } = marketSlice.actions;
// Exporta las acciones generadas automáticamente por createSlice para poder despacharlas desde otros módulos.

export default marketSlice.reducer;
// Exporta el reducer del slice para integrarlo en el store principal de Redux.
