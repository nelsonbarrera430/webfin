const BASE_URL = 'https://api.coingecko.com/api/v3';

self.onmessage = async (e) => {
  const { type, payload } = e.data || {};

  if (type === 'SEARCH') {
    const query = (payload?.query || '').toLowerCase().trim();
    if (!query) return;

    try {
      const res = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
      const data = await res.json();

      const results = (data?.coins || []).slice(0, 20).map(c => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol.toUpperCase()
      }));

      self.postMessage({ type: 'SEARCH_RESULTS', payload: results });
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
