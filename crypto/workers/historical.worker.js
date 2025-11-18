import { apiService } from '../services/apiService.js';

self.onmessage = async (e) => {
  const { type, payload } = e.data || {};
  if (type === 'GET_SUMMARY') {
    const assetId = payload?.assetId || 'bitcoin';
    try {
      const candles = await apiService.fetchDailyHistory(assetId, 365);
      const prices = candles.map(c => c.price_close).filter(v => typeof v === 'number');
      if (!prices.length) {
        self.postMessage({ type: 'HISTORICAL_SUMMARY', payload: { assetId, maxPrice: null, minPrice: null, avgPrice: null } });
        return;
      }
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const avgPrice = prices.reduce((acc, v) => acc + v, 0) / prices.length;

      self.postMessage({
        type: 'HISTORICAL_SUMMARY',
        payload: { assetId, maxPrice, minPrice, avgPrice: Number(avgPrice.toFixed(2)) }
      });
    } catch (err) {
      self.postMessage({ type: 'ERROR', payload: { id: crypto.randomUUID(), type: 'error', message: err.message || String(err) } });
    }
  }
};
