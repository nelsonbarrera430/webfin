import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/authSlice.js';
import assetsReducer from './store/assetsSlice.js';
import marketReducer from './store/marketSlice.js';
import watchlistReducer from './store/watchlistSlice.js';
import uiReducer from './store/uiSlice.js';

import { WorkerFacade } from './services/workerFacade.js';
import { renderAuth } from './ui/renderAuth.js';
import { renderDashboard } from './ui/renderDashboard.js';
import { renderWatchlist } from './ui/renderWatchlist.js';
import { renderSearch } from './ui/renderSearch.js';
import { apiService } from './services/apiService.js';

const store = configureStore({
  reducer: {
    auth: authReducer,
    assets: assetsReducer,
    market: marketReducer,
    watchlist: watchlistReducer,
    ui: uiReducer,
  }
});

const facade = new WorkerFacade(store);

renderAuth(store, apiService);
renderDashboard(store, facade);
renderWatchlist(store);
renderSearch(store, facade);

// Watchlist objetivo (7 monedas, IDs de CoinGecko)
const DEFAULT_WATCHLIST = ['bitcoin','ethereum','solana','cardano','ripple','dogecoin','polkadot'];

let prevAuthStatus = 'inactive';
store.subscribe(() => {
  const state = store.getState();

  if (state.auth.status !== prevAuthStatus) {
    prevAuthStatus = state.auth.status;

    if (state.auth.status === 'succeeded') {
      const userId = state.auth.user?.id || 5;

      apiService.getUserProfile(userId)
        .then(() => apiService.getWatchlist(userId))
        .then(() => {
          // Usamos la lista por defecto para evitar vacíos o items no válidos
          store.dispatch({ type: 'watchlist/setWatchlist', payload: DEFAULT_WATCHLIST });

          // Carga inicial de precios para la watchlist
          return apiService.fetchPrices(DEFAULT_WATCHLIST);
        })
        .then(({ prices, changes24h }) => {
          store.dispatch({ type: 'market/setInitialPrices', payload: prices });
          store.dispatch({ type: 'market/updateLivePrices', payload: { prices, changes24h } });

          // Arranque de workers
          facade.startBootLoad();
          facade.startMarketFeed(DEFAULT_WATCHLIST);
        })
        .catch(err => {
          const notif = { id: crypto.randomUUID(), type: 'error', message: err.message || String(err) };
          store.dispatch({ type: 'ui/addNotification', payload: notif });
        });
    }
  }
});
