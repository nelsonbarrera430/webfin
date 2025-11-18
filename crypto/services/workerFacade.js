// Importa las acciones de Redux Toolkit desde los distintos slices
import { setAssets } from '../store/assetsSlice.js';              // Acción para guardar lista de activos
import { updateLivePrices } from '../store/marketSlice.js';       // Acción para actualizar precios en vivo
import {
  setSearchResults,                                              // Acción para guardar resultados de búsqueda
  setHistoricalSummary,                                          // Acción para guardar resumen histórico
  setAnalysisReport,                                             // Acción para guardar reporte de análisis
  addNotification                                                // Acción para mostrar notificaciones
} from '../store/uiSlice.js';

// Clase principal que actúa como Facade para gestionar los 5 Web Workers
export class WorkerFacade {
  constructor(store) {
    this.store = store; // Guarda referencia al store de Redux

    // Inicializa los 5 workers con sus respectivos archivos
    this.bootWorker = new Worker('./workers/boot.worker.js', { type: 'module' });          // Worker de carga inicial
    this.marketWorker = new Worker('./workers/marketPoll.worker.js', { type: 'module' });  // Worker de feed de mercado
    this.searchWorker = new Worker('./workers/search.worker.js', { type: 'module' });      // Worker de búsqueda
    this.historicalWorker = new Worker('./workers/historical.worker.js', { type: 'module' }); // Worker de histórico
    this.analysisWorker = new Worker('./workers/analysis.worker.js', { type: 'module' });  // Worker de análisis

    // Listener para mensajes del bootWorker
    this.bootWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'ASSETS_LOADED') {
        this.store.dispatch(setAssets(payload)); // Guarda activos en el store
        this.searchWorker.postMessage({ type: 'INIT_ASSETS', payload }); // Inicializa búsqueda con esos activos
      }
      if (type === 'ERROR') this.store.dispatch(addNotification(payload)); // Muestra notificación de error
    };

    // Listener para mensajes del marketWorker
    this.marketWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'MARKET_UPDATE') this.store.dispatch(updateLivePrices(payload)); // Actualiza precios en vivo
      if (type === 'ALERT') this.store.dispatch(addNotification(payload));          // Notificación de alerta
      if (type === 'ERROR') this.store.dispatch(addNotification(payload));          // Notificación de error
    };

    // Listener para mensajes del searchWorker
    this.searchWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'SEARCH_RESULTS') this.store.dispatch(setSearchResults(payload)); // Guarda resultados de búsqueda
      if (type === 'ERROR') this.store.dispatch(addNotification(payload));           // Notificación de error
    };

    // Listener para mensajes del historicalWorker
    this.historicalWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'HISTORICAL_SUMMARY') this.store.dispatch(setHistoricalSummary(payload)); // Guarda resumen histórico
      if (type === 'ERROR') this.store.dispatch(addNotification(payload));                   // Notificación de error
    };

    // Listener para mensajes del analysisWorker
    this.analysisWorker.onmessage = (e) => {
      const { type, payload } = e.data;
      if (type === 'ANALYSIS_REPORT') this.store.dispatch(setAnalysisReport(payload)); // Guarda reporte de análisis
      if (type === 'ERROR') this.store.dispatch(addNotification(payload));             // Notificación de error
    };
  }

  // Método para iniciar la carga inicial de activos
  startBootLoad() {
    this.bootWorker.postMessage({ type: 'LOAD_ASSETS' });
  }

  // Método para iniciar el feed de mercado (polling de precios)
  startMarketFeed(assetIds) {
    this.marketWorker.postMessage({ type: 'START_FEED', payload: { assetIds } });
  }

  // Método para ejecutar búsqueda de activos
  searchAssets(query) {
    this.searchWorker.postMessage({ type: 'SEARCH', payload: { query } });
  }

  // Método para obtener resumen histórico de un activo
  getHistoricalSummary(assetId) {
    this.historicalWorker.postMessage({ type: 'GET_SUMMARY', payload: { assetId } });
  }

  // Método para ejecutar análisis de portafolio con una estrategia
  runAnalysis(strategyName, watchlist, marketData) {
    this.analysisWorker.postMessage({ type: 'RUN', payload: { strategyName, watchlist, marketData } });
  }
}
