import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedAssetId: 'BTC', // Usamos el Símbolo como ID
    searchResults: [], // [{ symbol: 'BTC', name: 'Bitcoin' }]
    historicalSummary: null, // { maxPrice, minPrice, avgPrice }
    analysisReport: null, // { best: { symbol, change }, ... }
    status: 'idle', // 'idle' | 'loading'
    notifications: [], // [{ id, type, message }]
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        // La acción ya estaba aquí, no necesita cambios.
        setSelectedAsset(state, action) {
            state.selectedAssetId = action.payload; // payload: 'ETH'
            // Limpiamos la info histórica al seleccionar un nuevo activo
            state.historicalSummary = null;
            state.analysisReport = null;
        },
        setSearchResults(state, action) {
            state.searchResults = action.payload;
        },
        clearSearchResults(state) {
            state.searchResults = [];
        },
        setHistoricalSummary(state, action) {
            state.historicalSummary = action.payload;
            state.status = 'idle';
        },
        setAnalysisReport(state, action) {
            state.analysisReport = action.payload;
            state.status = 'idle';
        },
        setLoading(state) {
            state.status = 'loading';
        },
        addNotification(state, action) {
            state.notifications.push(action.payload); // Payload del Factory
        },
        clearNotifications(state) {
            state.notifications = [];
        },
    },
});

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
export default uiSlice.reducer;