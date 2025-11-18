import { createSlice } from '@reduxjs/toolkit';

// Define el estado inicial (initialState) del slice 'ui'.
// Este estado controla todos los aspectos de la interfaz de usuario que
// no son datos de mercado o autenticación.
const initialState = {
    // Identificador del activo de criptomoneda que el usuario tiene seleccionado
    // en el panel principal (ej. 'BTC' para Bitcoin).
    selectedAssetId: 'BTC', // Usamos el Símbolo como ID 
    
    // Lista de resultados devueltos por search.worker.js
    searchResults: [], // [{ symbol: 'BTC', name: 'Bitcoin' }]
    
    // Resumen estadístico (Max/Min/Avg) devuelto por historical.worker.js.
    historicalSummary: null, // { maxPrice, minPrice, avgPrice }
    
    // Reporte de análisis devuelto por analysis.worker.js (Strategy Pattern).
    analysisReport: null, // { best: { symbol, change }, ... }
    
    // Estado de carga de las operaciones asíncronas de la UI.
    status: 'idle', // 'idle' | 'loading'
    
    // Mensajes de feedback generados por NotificationFactory y despachados
    // por el WorkerFacade o ApiService.
    notifications: [], // [{ id, type, message }]
};

// Crea el slice de Redux Toolkit para la UI.
const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // Reducer para cambiar el activo principal visualizado.
        setSelectedAsset(state, action) {
            state.selectedAssetId = action.payload; // payload: 'ETH' (Símbolo del activo)
            
            // Limpiamos la info histórica y de análisis para evitar mostrar
            // datos de un activo anterior al cambiar la selección.
            state.historicalSummary = null;
            state.analysisReport = null;
        },
        
        // Reducer para actualizar la lista de resultados de búsqueda (Worker 3).
        setSearchResults(state, action) {
            state.searchResults = action.payload;
        },
        
        // Reducer para limpiar la lista de resultados de búsqueda.
        clearSearchResults(state) {
            state.searchResults = [];
        },
        
        // Reducer para establecer el resumen histórico procesado (Worker 4).
        setHistoricalSummary(state, action) {
            state.historicalSummary = action.payload;
            // Finaliza el estado de carga una vez que se reciben los datos.
            state.status = 'idle';
        },
        
        // Reducer para establecer el reporte de análisis (Worker 5).
        setAnalysisReport(state, action) {
            state.analysisReport = action.payload;
            // Finaliza el estado de carga.
            state.status = 'idle';
        },
        
        // Reducer para establecer el estado general de carga de la UI.
        setLoading(state) {
            state.status = 'loading';
        },
        
        // Reducer para agregar una notificación (generada por el Factory).
        addNotification(state, action) {
            state.notifications.push(action.payload); // Payload del Factory
        },
        
        // Reducer para borrar todas las notificaciones.
        clearNotifications(state) {
            state.notifications = [];
        },
    },
});

// Exporta las acciones generadas automáticamente por createSlice.
export const {
    setSelectedAsset,
    setSearchResults,
    clearSearchResults,
    setHistoricalSummary,
    setAnalysisReport,
    setLoading,
    addNotification,
    clearNotifications,
} = uiSlice.actions;

// Exporta el reducer para ser incluido en el store principal.
export default uiSlice.reducer;