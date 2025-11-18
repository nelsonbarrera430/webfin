import { createSlice } from '@reduxjs/toolkit';

// Define el estado inicial (initialState) del slice 'watchlist'.
const initialState = {
    // El estado se almacena como un objeto (mapa normalizado).
    // Las claves son los símbolos de los activos ('BTC', 'ETH').
    // Esto permite búsquedas O(1) y facilita CRUD (Crear, Leer, Actualizar, Eliminar).
    items: {}, // { 'BTC': { notes: 'Comprar más' }, 'ETH': { notes: 'HODL' } }
};

// Crea el slice de Redux Toolkit para la Watchlist.
const watchlistSlice = createSlice({
    name: 'watchlist',
    initialState,
    reducers: {
        // Reducer para inicializar la Watchlist al inicio de sesión.
        // Utilizado después de que el ApiService carga los datos de JSONPlaceholder.
        setWatchlist(state, action) {
            // El payload debe ser un objeto normalizado listo para reemplazar el estado.
            state.items = action.payload; 
        },
        
        // Reducer para agregar un nuevo activo a la Watchlist.
        addWatchlistItem(state, action) {
            // Se desestructura el símbolo y los datos del payload.
            // payload: { symbol: 'SOL', data: { notes: '' } }
            const { symbol, data } = action.payload;
            // Añade o actualiza el elemento usando el símbolo como clave.
            state.items[symbol] = data; 
        },
        
        // Reducer para eliminar un activo de la Watchlist.
        removeWatchlistItem(state, action) {
            // El payload es directamente el símbolo del activo a eliminar.
            // payload: 'SOL' (el símbolo)
            // Utiliza 'delete' seguro gracias a Immer/Redux Toolkit.
            delete state.items[action.payload];
        },
    },
});

// Exporta las acciones para que el Facade, UI o ApiService pueda despacharlas.
export const { setWatchlist, addWatchlistItem, removeWatchlistItem } = watchlistSlice.actions;
// Exporta el reducer para ser incluido en la configuración del store principal (configureStore).
export default watchlistSlice.reducer;