import { apiService } from '../services/apiService.js';

self.onmessage = async (e) => {
  const { type } = e.data || {};
  if (type === 'LOAD_ASSETS') {
    try {
      const assets = await apiService.fetchAllAssets();

      // ✅ Notifica al store
      self.postMessage({ type: 'ASSETS_LOADED', payload: assets });

      // ✅ También inicializa el search.worker
      postMessage({ type: 'INIT_ASSETS', payload: assets });
    } catch (err) {
      self.postMessage({
        type: 'ERROR',
        payload: {
          id: crypto.randomUUID(),
          type: 'error',
          message: err.message || String(err)
        }
      });
    }
  }
};
