import { setAssets } from '../store/assetsSlice.js';
import { updateLivePrices } from '../store/marketSlice.js';
import {
  setSearchResults,
  setHistoricalSummary,
  setAnalysisReport,
  addNotification
} from '../store/uiSlice.js';

export class WorkerFacade {
  constructor(store) {
    this.store = store;
    this.bootWorker = new Worker('./workers/boot.worker.js', { type: 'module' });
    this.marketWorker = new Worker('./workers/marketPoll.worker.js', { type: 'module' });
    this.searchWorker = new Worker('./workers/search.worker.js', { type: 'module' });
    this.historicalWorker = new Worker('./workers/historical.worker.js', { type: 'module' });
    this.analysisWorker = new Worker('./workers/analysis.worker.js', { type: 'module' });

    this.bootWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'ASSETS_LOADED') {
        this.store.dispatch(setAssets(payload));
        this.searchWorker.postMessage({ type: 'INIT_ASSETS', payload }); // ✅ inicializa búsqueda
      }
      if (type === 'ERROR') this.store.dispatch(addNotification(payload));
    };

    this.marketWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'MARKET_UPDATE') this.store.dispatch(updateLivePrices(payload));
      if (type === 'ALERT') this.store.dispatch(addNotification(payload));
      if (type === 'ERROR') this.store.dispatch(addNotification(payload));
    };

    this.searchWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'SEARCH_RESULTS') this.store.dispatch(setSearchResults(payload));
      if (type === 'ERROR') this.store.dispatch(addNotification(payload));
    };

    this.historicalWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'HISTORICAL_SUMMARY') this.store.dispatch(setHistoricalSummary(payload));
      if (type === 'ERROR') this.store.dispatch(addNotification(payload));
    };

    this.analysisWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'ANALYSIS_REPORT') this.store.dispatch(setAnalysisReport(payload));
      if (type === 'ERROR') this.store.dispatch(addNotification(payload));
    };
  }

  startBootLoad() {
    this.bootWorker.postMessage({ type: 'LOAD_ASSETS' });
  }

  startMarketFeed(assetIds) {
    this.marketWorker.postMessage({ type: 'START_FEED', payload: { assetIds } });
  }

  searchAssets(query) {
    this.searchWorker.postMessage({ type: 'SEARCH', payload: { query } });
  }

  getHistoricalSummary(assetId) {
    this.historicalWorker.postMessage({ type: 'GET_SUMMARY', payload: { assetId } });
  }

  runAnalysis(strategyName, watchlist, marketData) {
    this.analysisWorker.postMessage({ type: 'RUN', payload: { strategyName, watchlist, marketData } });
  }
}
