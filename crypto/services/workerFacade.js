// services/workerFacade.js
// Patrón Facade: Oculta la complejidad de la gestión de 5 workers
// y centraliza la comunicación con Redux.

import { setAssetsLoading, setAssetsSuccess } from '../store/assetsSlice.js';
import { updatePrices } from '../store/marketSlice.js';
import { setSearchResults, setHistoricalSummary, setAnalysisReport, setLoading, addNotification } from '../store/uiSlice.js';
import { NotificationFactory } from '../patterns/factory/NotificationFactory.js';

export class WorkerFacade {
    constructor(store) {
        this.store = store;
        
        // Crear los workers como Módulos para que puedan usar 'import'
        this.bootWorker = new Worker('./workers/boot.worker.js', { type: 'module' });
        this.marketPollWorker = new Worker('./workers/marketPoll.worker.js', { type: 'module' });
        this.searchWorker = new Worker('./workers/search.worker.js', { type: 'module' });
        this.historicalWorker = new Worker('./workers/historical.worker.js', { type: 'module' });
        this.analysisWorker = new Worker('./workers/analysis.worker.js', { type: 'module' });

        // Configurar los 'onmessage' (Observador 1)
        this.setupListeners();
    }

    setupListeners() {
        // 1. Boot Worker (Carga Estática)
        this.bootWorker.onmessage = (e) => {
            const { type, payload } = e.data;
            if (type === 'BOOT_SUCCESS') {
                this.store.dispatch(setAssetsSuccess(payload));
            } else if (type === 'BOOT_ERROR') {
                const notif = NotificationFactory.create('error', payload.message);
                this.store.dispatch(addNotification(notif));
            }
        };

        // 2. Market Poll Worker (Precios en vivo)
        this.marketPollWorker.onmessage = (e) => {
            const { type, payload } = e.data;
            if (type === 'MARKET_UPDATE') {
                this.store.dispatch(updatePrices(payload));
            } else if (type === 'MARKET_ERROR') {
                // Silencioso para no molestar al usuario con errores de polling
                console.error('Error en Market Poll:', payload.message);
            }
        };

        // 3. Search Worker (Búsqueda)
        this.searchWorker.onmessage = (e) => {
            const { type, payload } = e.data;
            if (type === 'SEARCH_SUCCESS') {
                this.store.dispatch(setSearchResults(payload));
            }
        };

        // 4. Historical Worker (Resumen)
        this.historicalWorker.onmessage = (e) => {
            const { type, payload } = e.data;
            if (type === 'HISTORY_SUCCESS') {
                this.store.dispatch(setHistoricalSummary(payload));
            } else if (type === 'HISTORY_ERROR') {
                this.store.dispatch(setHistoricalSummary(null)); // Limpiar
                const notif = NotificationFactory.create('error', payload.message);
                this.store.dispatch(addNotification(notif));
            }
        };

        // 5. Analysis Worker (Strategy)
        this.analysisWorker.onmessage = (e) => {
            const { type, payload } = e.data;
            if (type === 'ANALYSIS_SUCCESS') {
                this.store.dispatch(setAnalysisReport(payload));
            } else if (type === 'ANALYSIS_ERROR') {
                this.store.dispatch(setAnalysisReport(null));
                const notif = NotificationFactory.create('error', payload.message);
                this.store.dispatch(addNotification(notif));
            }
        };
    }

    // --- Métodos Públicos del Facade ---

    startBootLoad() {
        this.store.dispatch(setAssetsLoading());
        this.bootWorker.postMessage({ type: 'LOAD_ASSETS' });
    }

    // 🔴 CORRECCIÓN CLAVE: Aceptar los símbolos y pasarlos al worker
    startMarketFeed(symbols) {
        this.marketPollWorker.postMessage({ 
            type: 'START_POLLING',
            payload: { symbols } // Envía los símbolos al worker
        });
    }

    stopMarketFeed() {
        this.marketPollWorker.postMessage({ type: 'STOP_POLLING' });
    }

    /**
     * Busca activos.
     * @param {string} query - El término de búsqueda.
     * @param {object} allAssets - La lista completa de assets (del assetsSlice).
     */
    searchAssets(query, allAssets) {
        // Lógica adaptada: El worker no hace fetch, filtra la lista que le pasamos.
        // Esto honra el "off-thread CPU work" para una lista grande.
        this.searchWorker.postMessage({ 
            type: 'FILTER_ASSETS', 
            payload: { query, allAssets } 
        });
    }

    getHistoricalSummary(assetSymbol) {
        this.store.dispatch(setLoading());
        this.historicalWorker.postMessage({
            type: 'GET_HISTORY',
            payload: { symbol: assetSymbol }
        });
    }
    
    runAnalysis(strategyName, watchlist, marketData) {
        this.store.dispatch(setLoading());
        this.analysisWorker.postMessage({
            type: 'RUN_ANALYSIS',
            payload: { strategyName, watchlist, marketData }
        });
    }
}