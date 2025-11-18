import store from './store/index.js';
import { ApiService } from './services/apiService.js';
import { WorkerFacade } from './services/workerFacade.js';
import { initAuthView, renderUserProfile } from './ui/auth.js';
// Importación COMPLETA de funciones de dashboard
import { initDashboardView, renderPriceFeed, renderSearchResults, renderHistoricalSummary, renderAnalysisReport, renderWatchlist } from './ui/dashboard.js';
import { setLoginSuccess, setLoginFailed, setLoginLoading } from './store/authSlice.js';
import { setWatchlist } from './store/watchlistSlice.js';
// Importación CRÍTICA para que la búsqueda funcione (setSelectedAsset)
import { addNotification, clearNotifications, setHistoricalSummary, setAnalysisReport, setSelectedAsset } from './store/uiSlice.js';
import { NotificationFactory } from './patterns/factory/NotificationFactory.js';
import { setInitialPrices } from './store/marketSlice.js';
// Importar para el Fetch 3 (API Real)
import { CRYPTOCOMPARE_API_KEY, CRYPTOCOMPARE_BASE_URL } from './workers/config.js'; 

// --- 1. Inicialización de Servicios ---
const apiService = new ApiService(store); 
const workerFacade = new WorkerFacade(store); 

// --- 2. Observador de Redux (El "Reactor") ---
let currentState = store.getState();
store.subscribe(() => {
    const nextState = store.getState();

    // Reaccionar a cambios en el estado de autenticación
    if (currentState.auth.status !== nextState.auth.status) {
        handleAuthChange(nextState);
    }

    // Reaccionar a cambios en la UI (notificaciones, datos de workers)
    if (currentState.ui.notifications !== nextState.ui.notifications) {
        renderNotifications(nextState.ui.notifications);
    }
    
    // Si los precios o los assets cambian, intentar re-renderizar
    if (currentState.market.prices !== nextState.market.prices || 
        currentState.assets.status !== nextState.assets.status) {
        
        if (Object.keys(nextState.market.prices).length > 0) {
            renderPriceFeed(nextState.market.prices, nextState.assets.assets);
        }
    }

    if (currentState.ui.searchResults !== nextState.ui.searchResults) {
        renderSearchResults(nextState.ui.searchResults);
    }
    if (currentState.ui.historicalSummary !== nextState.ui.historicalSummary) {
        renderHistoricalSummary(nextState.ui.historicalSummary);
    }
    if (currentState.ui.analysisReport !== nextState.ui.analysisReport) {
        renderAnalysisReport(nextState.ui.analysisReport);
    }
    
    // Actualizar el estado actual
    currentState = nextState;
});

// --- 3. Flujo de Datos y Lógica de UI ---

function handleAuthChange(state) {
    if (state.auth.status === 'succeeded') {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('dashboard-view').classList.remove('hidden');
        
        startDashboardFlow(state.auth.user);

    } else if (state.auth.status === 'inactive') {
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('dashboard-view').classList.add('hidden');
        store.dispatch(clearNotifications());
    }
}

/**
 * Inicia la cadena de promesas anidadas para cargar el perfil, la watchlist y los precios reales (una vez).
 */
async function startDashboardFlow(user) {
    try {
        // 1. Renderizar perfil
        renderUserProfile(user);

        // 2. Cargar Watchlist simulada (usamos 15 criptos populares)
        await apiService.getWatchlist(1); 
        
        // 🛑 NUEVA LISTA DE 15 CRIPTOMONEDAS
        const watchlistSymbols = [
            'BTC', 'ETH', 'SOL', 'ADA', 'XRP', 
            'DOGE', 'DOT', 'LINK', 'MATIC', 'AVAX',
            'LTC', 'BCH', 'XLM', 'UNI', 'ETC'
        ];

        const normalizedWatchlist = {};
        watchlistSymbols.forEach(symbol => {
            normalizedWatchlist[symbol] = { notes: `Nota para ${symbol}` };
        });
        store.dispatch(setWatchlist(normalizedWatchlist));

        // Renderizar la Watchlist en la UI (Panel Lateral)
        renderWatchlist(watchlistSymbols); 

        // 3. (Fetch 3 - REAL) Cargar precios iniciales (UNA SOLA LLAMADA)
        console.log(`Watchlist cargada, buscando datos iniciales REALES de CryptoCompare para ${watchlistSymbols.length} símbolos... (Llamada 1)`);
        
        const fsyms = watchlistSymbols.join(',');
        const tsyms = 'USD';
        
        const url = `${CRYPTOCOMPARE_BASE_URL}/data/pricemulti?fsyms=${fsyms}&tsyms=${tsyms}&api_key=${CRYPTOCOMPARE_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error de red al cargar precios: ${response.statusText}`);
        
        const priceData = await response.json();

        if (priceData.Response === 'Error') {
            throw new Error(`API de CryptoCompare: ${priceData.Message}. Vuelve a cargar si tu cuota se ha reiniciado.`);
        }
        
        const initialPrices = {};
        for (const [symbol, values] of Object.entries(priceData)) {
            if (values.USD) {
                initialPrices[symbol] = values.USD;
            }
        }
        
        if (Object.keys(initialPrices).length === 0) {
            throw new Error('No se pudieron obtener datos de precios iniciales. Verifica tu clave de API.');
        }

        store.dispatch(setInitialPrices(initialPrices));

        console.log('Precios INICIALES REALES cargados. Iniciando workers de fondo...');
        
        // Iniciar Worker 1 (Boot) - ¡Esta es nuestra API CALL #2!
        workerFacade.startBootLoad();
        
        // 🛑 COMENTADO: Desactivamos el Worker 2 (Polling) para evitar el Rate Limit.
        // workerFacade.startMarketFeed(watchlistSymbols); 


    } catch (err) {
        console.error('Error en el flujo del dashboard:', err);
        const notif = NotificationFactory.create('error', err.message);
        store.dispatch(addNotification(notif));
    }
}

function renderNotifications(notifications) {
    const container = document.getElementById('notification-container');
    container.innerHTML = '';
    if (!notifications || notifications.length === 0) {
        return;
    }
    
    const uniqueMessages = new Set();
    
    notifications.forEach(notif => {
        if (uniqueMessages.has(notif.message)) return;
        uniqueMessages.add(notif.message);

        const el = document.createElement('div');
        el.className = `notification ${notif.type}`;
        el.textContent = notif.message;
        
        setTimeout(() => {
            el.remove();
        }, 5000);
        
        container.appendChild(el);
    });

    setTimeout(() => {
        store.dispatch(clearNotifications());
    }, 5100);
}

// --- 4. Conexión de Vistas (Event Listeners) ---

initAuthView(async (email, password) => {
    store.dispatch(setLoginLoading());
    store.dispatch(clearNotifications()); 
    
    try {
        const data = await apiService.login(email, password);
        const profile = await apiService.getUserProfile(2);
        store.dispatch(setLoginSuccess({ token: data.token, user: profile.data }));

    } catch (err) {
        store.dispatch(setLoginFailed());
        const notif = NotificationFactory.create('error', 'Login fallido. Verifica tus credenciales.');
        store.dispatch(addNotification(notif));
    }
});

initDashboardView({
    onSearch: (query) => {
        const { assets } = store.getState().assets;
        if (assets) {
            workerFacade.searchAssets(query, assets);
        }
    },
    onLoadHistory: () => {
        const { selectedAssetId } = store.getState().ui;
        if (selectedAssetId) {
            workerFacade.getHistoricalSummary(selectedAssetId);
        }
    },
    onRunAnalysis: () => {
        const { watchlist } = store.getState();
        const { prices } = store.getState().market;
        workerFacade.runAnalysis('BEST_PERFORMER', watchlist.items, prices);
    },
    onAssetSelect: (symbol) => {
        store.dispatch(setSelectedAsset(symbol)); 
        console.log(`Activo seleccionado: ${symbol}. Puedes hacer clic en 'Cargar Resumen' ahora.`);
    }
});

// Iniciar la app
console.log('Aplicación iniciada.');