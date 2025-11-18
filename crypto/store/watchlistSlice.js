import { createSlice } from '@reduxjs/toolkit';
// Importa la función createSlice de Redux Toolkit, que permite crear slices de estado con reducers y acciones automáticamente.

const initialState = {
  items: {} // Objeto que representa la watchlist del usuario. 
            // Cada clave es el id de un activo (ej. 'bitcoin'), 
            // y su valor es un objeto con notas asociadas. Ejemplo: { 'bitcoin': { notes: '' } }
};

const watchlistSlice = createSlice({
  name: 'watchlist',   // Nombre del slice, usado internamente por Redux.
  initialState,        // Estado inicial definido arriba.
  reducers: {          // Reducers: funciones que modifican el estado en respuesta a acciones.
    setWatchlist(state, action) {
      // Establece la watchlist completa a partir de un array de ids recibido en el payload.
      const list = action.payload || []; // Si no hay payload, usa un array vacío.
      const map = {};                    // Objeto temporal para mapear los ids.
      list.forEach(id => { map[id] = { notes: '' }; }); // Cada id se guarda con notas vacías.
      state.items = map;                 // Actualiza el estado con el nuevo mapa.
    },
    addToWatchlist(state, action) {
      // Agrega un nuevo activo a la watchlist.
      const id = action.payload;         // Id del activo a agregar.
      if (!state.items[id]) state.items[id] = { notes: '' }; // Solo lo agrega si no existe ya.
    },
    removeFromWatchlist(state, action) {
      // Elimina un activo de la watchlist.
      const id = action.payload;         // Id del activo a eliminar.
      delete state.items[id];            // Borra la entrada correspondiente.
    },
    setNotes(state, action) {
      // Asigna notas a un activo específico en la watchlist.
      const { id, notes } = action.payload; // Extrae id y notas del payload.
      if (state.items[id]) state.items[id].notes = notes; // Si el activo existe, actualiza sus notas.
    }
  }
});

export const { setWatchlist, addToWatchlist, removeFromWatchlist, setNotes } = watchlistSlice.actions;
// Exporta las acciones generadas automáticamente por createSlice para poder despacharlas desde otros módulos.

export default watchlistSlice.reducer;
// Exporta el reducer del slice para integrarlo en el store principal de Redux.
