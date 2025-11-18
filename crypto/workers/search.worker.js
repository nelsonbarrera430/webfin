const BASE_URL = 'https://api.coingecko.com/api/v3';
// Constante con la URL base de la API de CoinGecko, usada para realizar búsquedas de criptomonedas.

self.onmessage = async (e) => {
  // Listener principal del Web Worker.
  // Se ejecuta cada vez que el worker recibe un mensaje desde el hilo principal.
  const { type, payload } = e.data || {}; 
  // Extrae el tipo de mensaje y el payload del objeto recibido.

  if (type === 'SEARCH') {
    // Si el mensaje recibido es de tipo 'SEARCH', significa que se debe realizar una búsqueda de activos.
    const query = (payload?.query || '').toLowerCase().trim();
    // Obtiene el texto de búsqueda desde el payload, lo convierte a minúsculas y elimina espacios.
    if (!query) return;
    // Si la consulta está vacía, no hace nada y termina.

    try {
      const res = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
      // Realiza una petición HTTP GET a la API de CoinGecko para buscar activos según el query.
      // encodeURIComponent asegura que el texto de búsqueda sea válido en la URL.

      if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
      // Si la respuesta no es exitosa (status diferente de 200), lanza un error con el código de estado.

      const data = await res.json();
      // Convierte la respuesta en formato JSON.

      const results = (data?.coins || []).slice(0, 20).map(c => ({
        // Toma la lista de monedas devuelta por la API (data.coins).
        // Limita los resultados a los primeros 20.
        // Mapea cada moneda a un objeto con id, nombre y símbolo en mayúsculas.
        id: c.id,
        name: c.name,
        symbol: c.symbol.toUpperCase()
      }));

      self.postMessage({ type: 'SEARCH_RESULTS', payload: results });
      // Envía los resultados de la búsqueda al hilo principal.
    } catch (err) {
      // Si ocurre un error durante la búsqueda o el fetch:
      self.postMessage({
        type: 'ERROR',
        payload: {
          id: crypto.randomUUID(),             // Genera un id único para la notificación de error.
          type: 'error',                       // Tipo de notificación: error.
          message: err.message || String(err)  // Mensaje descriptivo del error.
        }
      });
      // Envía un mensaje de error al hilo principal para que se muestre en la UI.
    }
  }
};
