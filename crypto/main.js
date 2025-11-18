import { configureStore } from '@reduxjs/toolkit';
// Importa configureStore de Redux Toolkit para crear el store con reducers combinados.

import authReducer from './store/authSlice.js';
// Importa el reducer de autenticación.

import assetsReducer from './store/assetsSlice.js';
// Importa el reducer que gestiona los activos (assets).

import marketReducer from './store/marketSlice.js';
// Importa el reducer que gestiona precios y cambios de mercado.

import watchlistReducer from './store/watchlistSlice.js';
// Importa el reducer que gestiona la lista de seguimiento (watchlist).

import uiReducer from './store/uiSlice.js';
// Importa el reducer que gestiona estado de UI (búsqueda, reportes, notificaciones, seleccionado).

import { WorkerFacade } from './services/workerFacade.js';
// Importa la fachada que orquesta los Web Workers y conecta con Redux.

import { renderAuth } from './ui/renderAuth.js';
// Importa la función que gestiona la UI de autenticación (login/logout).

import { renderDashboard } from './ui/renderDashboard.js';
// Importa la función que renderiza el dashboard (mercado, histórico, análisis, notificaciones).

import { renderWatchlist } from './ui/renderWatchlist.js';
// Importa la función que renderiza la watchlist y maneja la selección de activos.

import { renderSearch } from './ui/renderSearch.js';
// Importa la función que gestiona la búsqueda en vivo y el listado de resultados.

import { apiService } from './services/apiService.js';
// Importa el servicio de API (Singleton) para llamadas de red (assets, precios, histórico, perfiles).

const store = configureStore({
  // Crea el store de Redux con los reducers combinados.
  reducer: {
    auth: authReducer,         // Estado y acciones de autenticación.
    assets: assetsReducer,     // Mapa normalizado de activos.
    market: marketReducer,     // Precios y cambios en 24h.
    watchlist: watchlistReducer, // Lista de seguimiento del usuario.
    ui: uiReducer,             // Estado UI: resultados, resumen, reportes, notificaciones, seleccionado.
  }
});

const facade = new WorkerFacade(store);
// Instancia la fachada de workers, pasándole el store para poder despachar acciones.

renderAuth(store, apiService);
// Inicializa la lógica de autenticación en la UI.

renderDashboard(store, facade);
// Inicializa el render del dashboard, con acceso al facade para análisis y resumen histórico.

renderWatchlist(store);
// Inicializa el render de la watchlist en la UI.

renderSearch(store, facade);
// Inicializa el render de la búsqueda y delega al worker vía facade.


// Watchlist objetivo (7 monedas, IDs de CoinGecko)
const DEFAULT_WATCHLIST = ['bitcoin','ethereum','solana','cardano','ripple','dogecoin','polkadot'];
// Lista por defecto de activos a monitorear, usando IDs válidos de CoinGecko.

let prevAuthStatus = 'inactive';
// Variable para rastrear el estado previo de autenticación y evitar ejecuciones repetidas.

store.subscribe(() => {
  // Suscripción al store: se ejecuta cada vez que cambia el estado global.
  const state = store.getState();
  // Obtiene el estado actual del store.

  if (state.auth.status !== prevAuthStatus) {
    // Detecta cambios en el estado de autenticación.
    prevAuthStatus = state.auth.status;
    // Actualiza el estado previo.

    if (state.auth.status === 'succeeded') {
      // Si el login se completó correctamente, inicia el flujo de post-login.
      const userId = state.auth.user?.id || 5;
      // Obtiene el ID de usuario desde el estado, con fallback a 5 para demo.

      apiService.getUserProfile(userId)
        // Obtiene el perfil de usuario (puede preparar contexto).
        .then(() => apiService.getWatchlist(userId))
        // Obtiene la watchlist del backend. Si falla o viene vacía, usaremos la por defecto.
        .then(() => {
          // Usamos la lista por defecto para evitar vacíos o items no válidos
          store.dispatch({ type: 'watchlist/setWatchlist', payload: DEFAULT_WATCHLIST });
          // Carga la watchlist en Redux con la lista por defecto.

          // Carga inicial de precios para la watchlist
          return apiService.fetchPrices(DEFAULT_WATCHLIST);
          // Solicita precios y cambios 24h para los activos de la watchlist.
        })
        .then(({ prices, changes24h }) => {
          // Recibe precios y cambios 24h del servicio.
          store.dispatch({ type: 'market/setInitialPrices', payload: prices });
          // Carga precios iniciales en el slice de mercado.

          store.dispatch({ type: 'market/updateLivePrices', payload: { prices, changes24h } });
          // Actualiza precios y cambios en vivo en el slice de mercado.

          // Arranque de workers
          facade.startBootLoad();
          // Inicia el boot.worker para cargar assets globales y preparar el search.worker.

          facade.startMarketFeed(DEFAULT_WATCHLIST);
          // Inicia el marketPoll.worker con la watchlist para el polling de precios cada 60s.
        })
        .catch(err => {
          // Captura errores en cualquier parte del flujo post-login.
          const notif = { id: crypto.randomUUID(), type: 'error', message: err.message || String(err) };
          store.dispatch({ type: 'ui/addNotification', payload: notif });
          // Notifica el error en la UI mediante el slice de UI.
        });
    }
  }
});
