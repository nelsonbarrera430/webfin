import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import assetsReducer from './assetsSlice.js';
import marketReducer from './marketSlice.js';
import watchlistReducer from './watchlistSlice.js';
import uiReducer from './uiSlice.js';

const store = configureStore({
    reducer: {
        auth: authReducer,
        assets: assetsReducer,
        market: marketReducer,
        watchlist: watchlistReducer,
        ui: uiReducer,
    },
});

export default store;