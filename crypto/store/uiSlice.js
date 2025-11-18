import { createSlice } from '@reduxjs/toolkit';
// Importa la función createSlice de Redux Toolkit, que permite crear slices de estado con reducers y acciones automáticamente.

const initialState = {
  selectedAssetId: 'bitcoin', // Activo seleccionado por defecto en la UI (ejemplo: 'bitcoin').
  searchResults: [],          // Resultados de búsqueda de activos (llenados por search.worker).
  historicalSummary: null,    // Resumen histórico de un activo (llenado por historical.worker).
  analysisReport: null,       // Reporte de análisis de portafolio (llenado por analysis.worker).
  status: 'idle',             // Estado de la UI (ejemplo: 'idle', 'loading', 'succeeded').
  notifications: []           // Lista de notificaciones (errores, alertas, mensajes).
};

const uiSlice = createSlice({
  name: 'ui',          // Nombre del slice, usado internamente por Redux.
  initialState,        // Estado inicial definido arriba.
  reducers: {          // Reducers: funciones que modifican el estado en respuesta a acciones.
    setSearchResults(state, action) {
      // Guarda los resultados de búsqueda en el estado.
      state.searchResults = action.payload || [];
    },
    setHistoricalSummary(state, action) {
      // Guarda el resumen histórico de un activo en el estado.
      state.historicalSummary = action.payload;
    },
    setAnalysisReport(state, action) {
      // Guarda el reporte de análisis de portafolio en el estado.
      state.analysisReport = action.payload;
    },
    setSelectedAsset(state, action) {
      // Cambia el activo seleccionado en la UI.
      state.selectedAssetId = action.payload;
    },
    addNotification(state, action) {
      // Agrega una nueva notificación a la lista.
      state.notifications.push(action.payload);
    },
    clearNotifications(state) {
      // Limpia todas las notificaciones.
      state.notifications = [];
    }
  }
});

export const {
  setSearchResults,      // Acción para actualizar resultados de búsqueda.
  setHistoricalSummary,  // Acción para actualizar resumen histórico.
  setAnalysisReport,     // Acción para actualizar reporte de análisis.
  setSelectedAsset,      // Acción para cambiar activo seleccionado.
  addNotification,       // Acción para agregar notificación.
  clearNotifications     // Acción para limpiar notificaciones.
} = uiSlice.actions;

export default uiSlice.reducer;
// Exporta el reducer del slice para integrarlo en el store principal de Redux.
