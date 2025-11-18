import store from './store/index.js';
import { ApiService } from './services/apiService.js';
import { WorkerFacade } from './services/workerFacade.js';
import { initAuthView, renderUserProfile } from './ui/auth.js';
import { initDashboardView, renderPriceFeed, renderSearchResults, renderHistoricalSummary, renderAnalysisReport, renderWatchlist } from './ui/dashboard.js';
import { setLoginSuccess, setLoginFailed, setLoginLoading } from './store/authSlice.js';
import { setWatchlist } from './store/watchlistSlice.js';
import { addNotification, clearNotifications, setHistoricalSummary, setAnalysisReport, setSelectedAsset } from './store/uiSlice.js';
import { NotificationFactory } from './patterns/factory/NotificationFactory.js';
import { setInitialPrices } from './store/marketSlice.js';
import { CRYPTOCOMPARE_API_KEY, CRYPTOCOMPARE_BASE_URL } from './workers/config.js';

// --- 1. Inicialización de Servicios ---
// Instancia los servicios principales para la comunicación (API y Workers).
const apiService = new ApiService(store);
const workerFacade = new WorkerFacade(store);

// --- 2. Observador de Redux (El "Reactor") ---
// Implementa el Patrón Reactor: reacciona a los cambios de estado global.
let currentState = store.getState();

store.subscribe(() => {
    const nextState = store.getState();

    // Reaccionar a cambios en el estado de autenticación (succeeded, failed, inactive)
    if (currentState.auth.status !== nextState.auth.status) {
        handleAuthChange(nextState);
    }

    // CRÍTICO: Reaccionar si el activo seleccionado ha cambiado (al hacer clic en la búsqueda)
    if (currentState.ui.selectedAssetId !== nextState.ui.selectedAssetId) {
        const symbol = nextState.ui.selectedAssetId;
        if (symbol) {
            console.log(`[Reactor] Activo UI cambiado a: ${symbol}. Botón 'Cargar Resumen Histórico' habilitado.`);
        }
    }
    
    // Reaccionar a cambios en la UI (notificaciones, datos de workers)
    if (currentState.ui.notifications !== nextState.ui.notifications) {
        renderNotifications(nextState.ui.notifications);
    }
    
    // Si los precios (Worker 2) o los assets (Worker 1) cambian, re-renderizar el feed de precios
    if (currentState.market.prices !== nextState.market.prices || 
        currentState.assets.status !== nextState.assets.status) {
        
        if (Object.keys(nextState.market.prices).length > 0) {
            renderPriceFeed(nextState.market.prices, nextState.assets.assets);
        }
    }

    // Reacciones a resultados de Workers
    if (currentState.ui.searchResults !== nextState.ui.searchResults) {
        renderSearchResults(nextState.ui.searchResults);
    }
    if (currentState.ui.historicalSummary !== nextState.ui.historicalSummary) {
        renderHistoricalSummary(nextState.ui.historicalSummary); // Worker 4
    }
    if (currentState.ui.analysisReport !== nextState.ui.analysisReport) {
        renderAnalysisReport(nextState.ui.analysisReport); // Worker 5
    }
    
    // Actualizar el estado actual para la próxima comparación
    currentState = nextState;
});

// --- 3. Flujo de Datos y Lógica de UI ---

/**
 * Controla la visibilidad de las vistas (login/dashboard) basado en el estado de auth.
 */
function handleAuthChange(state) {
    if (state.auth.status === 'succeeded') {
        // Muestra el dashboard y oculta el login
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('dashboard-view').classList.remove('hidden');
        
        // Inicia la cascada de carga del dashboard
        startDashboardFlow(state.auth.user);

    } else if (state.auth.status === 'inactive') {
        // Muestra el login y oculta el dashboard
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('dashboard-view').classList.add('hidden');
        store.dispatch(clearNotifications());
    }
}

/**
 * Inicia la cadena de carga del dashboard: Perfil -> Watchlist -> Precios Iniciales -> Workers.
 */
async function startDashboardFlow(user) {
    try {
        // 1. Renderiza el perfil de usuario.
        renderUserProfile(user);

        // 2. Carga y despacha la Watchlist simulada (API Call #1 - JSONPlaceholder)
        await apiService.getWatchlist(1); // Espera la llamada simulada
        
        // Lista de símbolos simulada para la Watchlist (en un entorno real vendría de la API)
        const watchlistSymbols = ['BTC', 'ETH', 'DOGE', 'ADA', 'SOL'];

        // Normaliza la Watchlist para el Redux Store
        const normalizedWatchlist = {};
        watchlistSymbols.forEach(symbol => {
            normalizedWatchlist[symbol] = { notes: `Nota para ${symbol}` };
        });
        store.dispatch(setWatchlist(normalizedWatchlist));

        // ✅ Renderiza los símbolos en el panel lateral de la UI
        renderWatchlist(watchlistSymbols); 

        // 3. Cargar precios iniciales de la Watchlist (API Call #2 - CryptoCompare)
        console.log('Watchlist cargada, buscando datos iniciales de CryptoCompare...');
        
        const fsyms = watchlistSymbols.join(',');
        const tsyms = 'USD';
        
        const url = `${CRYPTOCOMPARE_BASE_URL}/data/pricemulti?fsyms=${fsyms}&tsyms=${tsyms}&api_key=${CRYPTOCOMPARE_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Error de red al cargar precios: ${response.statusText}`);
        
        const priceData = await response.json();

        if (priceData.Response === 'Error') {
            throw new Error(`API de CryptoCompare: ${priceData.Message}`);
        }
        
        // Normaliza los datos de precios para el store
        const initialPrices = {};
        for (const [symbol, values] of Object.entries(priceData)) {
            if (values.USD) {
                initialPrices[symbol] = values.USD;
            }
        }
        
        if (Object.keys(initialPrices).length === 0) {
            throw new Error('No se pudieron obtener datos de precios iniciales.');
        }

        store.dispatch(setInitialPrices(initialPrices));

        console.log('Precios iniciales cargados. Iniciando workers de fondo...');
        
        // 4. Iniciar Worker 1 (Boot Load - Carga el caché de todos los activos)
        workerFacade.startBootLoad();
        
        // 5. Iniciar Worker 2 (Market Polling - Mantiene el feed de precios actualizado)
        workerFacade.startMarketFeed(watchlistSymbols); 


    } catch (err) {
        console.error('Error en el flujo del dashboard:', err);
        // Usa el Notification Factory para crear y despachar la notificación de error
        const notif = NotificationFactory.create('error', err.message);
        store.dispatch(addNotification(notif));
    }
}

/**
 * Renderiza y gestiona el ciclo de vida de las notificaciones en la UI.
 */
function renderNotifications(notifications) {
    const container = document.getElementById('notification-container');
    container.innerHTML = '';
    if (!notifications || notifications.length === 0) {
        return;
    }
    
    // Usa un Set para evitar mensajes duplicados si se despachan muy rápido
    const uniqueMessages = new Set();
    
    notifications.forEach(notif => {
        if (uniqueMessages.has(notif.message)) return;
        uniqueMessages.add(notif.message);

        const el = document.createElement('div');
        el.className = `notification ${notif.type}`;
        el.textContent = notif.message;
        
        // Programa la eliminación de la notificación de la UI
        setTimeout(() => {
            el.remove();
        }, 5000);
        
        container.appendChild(el);
    });

    // Programa la limpieza del estado de Redux para las notificaciones
    setTimeout(() => {
        store.dispatch(clearNotifications());
    }, 5100);
}

// --- 4. Conexión de Vistas (Event Listeners) ---

/**
 * Inicializa el listener del formulario de autenticación.
 * La función de callback maneja la lógica de negocio del login.
 */
initAuthView(async (email, password) => {
    store.dispatch(setLoginLoading());
    store.dispatch(clearNotifications()); 
    
    try {
        // 1. Login (API Call #1)
        const data = await apiService.login(email, password);
        // 2. Obtener Perfil (API Call #2)
        const profile = await apiService.getUserProfile(2);
        // Despacha el éxito del login y los datos del perfil
        store.dispatch(setLoginSuccess({ token: data.token, user: profile.data }));

    } catch (err) {
        store.dispatch(setLoginFailed());
        const notif = NotificationFactory.create('error', 'Login fallido. Verifica tus credenciales.');
        store.dispatch(addNotification(notif));
    }
});

/**
 * Inicializa los listeners de los botones y campos de búsqueda del dashboard.
 * Cada handler llama al WorkerFacade para delegar el trabajo.
 */
initDashboardView({
    // Handler para la búsqueda de activos (Worker 3)
    onSearch: (query) => {
        const { assets } = store.getState().assets; // Obtiene el caché de activos (Worker 1)
        if (assets) {
            workerFacade.searchAssets(query, assets); // Delega la búsqueda al Worker 3
        }
    },
    // Handler para cargar el resumen histórico (Worker 4)
    onLoadHistory: () => {
        const { selectedAssetId } = store.getState().ui;
        
        if (selectedAssetId) { 
            // Pasa el símbolo seleccionado al Worker 4
            workerFacade.getHistoricalSummary(selectedAssetId);
        } else {
            const notif = NotificationFactory.create('info', 'Por favor, selecciona un activo de la barra de búsqueda primero.');
            store.dispatch(addNotification(notif));
        }
    },
    // Handler para ejecutar el análisis (Worker 5)
    onRunAnalysis: () => {
        const { watchlist } = store.getState();
        const { prices } = store.getState().market;
        // Ejecuta el análisis de la estrategia 'BEST_PERFORMER' sobre la Watchlist y los precios actuales
        workerFacade.runAnalysis('BEST_PERFORMER', watchlist.items, prices);
    },
    // Handler al hacer clic en un resultado de búsqueda
    onAssetSelect: (symbol) => {
        // Actualiza el estado UI con el activo seleccionado
        store.dispatch(setSelectedAsset(symbol)); 
        console.log(`Activo seleccionado: ${symbol}. Puedes hacer clic en 'Cargar Resumen' ahora.`);
    }
});

// Iniciar la app
console.log('Aplicación iniciada.');