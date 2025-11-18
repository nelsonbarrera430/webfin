import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedAssetId: 'bitcoin',
  searchResults: [],
  historicalSummary: null,
  analysisReport: null,
  status: 'idle',
  notifications: []
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchResults(state, action) {
      state.searchResults = action.payload || [];
    },
    setHistoricalSummary(state, action) {
      state.historicalSummary = action.payload;
    },
    setAnalysisReport(state, action) {
      state.analysisReport = action.payload;
    },
    setSelectedAsset(state, action) {
      state.selectedAssetId = action.payload;
    },
    addNotification(state, action) {
      state.notifications.push(action.payload);
    },
    clearNotifications(state) {
      state.notifications = [];
    }
  }
});

export const {
  setSearchResults,
  setHistoricalSummary,
  setAnalysisReport,
  setSelectedAsset,
  addNotification,
  clearNotifications
} = uiSlice.actions;

export default uiSlice.reducer;
