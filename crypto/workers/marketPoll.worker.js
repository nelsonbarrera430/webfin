import { apiService } from '../services/apiService.js';

let intervalId = null;
let watchlistIds = [];

async function tick() {
  if (!watchlistIds.length) return;
  try {
    const { prices, changes24h } = await apiService.fetchPrices(watchlistIds);
    self.postMessage({ type: 'MARKET_UPDATE', payload: { prices, changes24h } });

    // Alerta simple (ejemplo con BTC)
    if (prices.bitcoin && prices.bitcoin > 60000) {
      self.postMessage({ type: 'ALERT', payload: { id: crypto.randomUUID(), type: 'alert', message: '¡Bitcoin ha superado los 60,000!' } });
    }
  } catch (err) {
    self.postMessage({ type: 'ERROR', payload: { id: crypto.randomUUID(), type: 'error', message: err.message || String(err) } });
  }
}

self.onmessage = (e) => {
  const { type, payload } = e.data || {};
  if (type === 'START_FEED') {
    watchlistIds = Array.isArray(payload?.assetIds) ? payload.assetIds : [];
    if (intervalId) return;
    intervalId = setInterval(tick, 60000);
    tick();
  }
};
