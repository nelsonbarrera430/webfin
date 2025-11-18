import { apiService } from '../services/apiService.js';
// Importa el servicio Singleton apiService, encargado de realizar las peticiones de red (ej. precios de mercado).

let intervalId = null;
// Variable para almacenar el identificador del intervalo (setInterval).
// Se usa para evitar crear múltiples intervalos de polling.

let watchlistIds = [];
// Array que contendrá los IDs de los activos que se van a monitorear en el feed de mercado.

async function tick() {
  // Función que se ejecuta periódicamente para obtener precios actualizados.
  if (!watchlistIds.length) return; 
  // Si la lista de activos está vacía, no hace nada.

  try {
    const { prices, changes24h } = await apiService.fetchPrices(watchlistIds);
    // Llama al método fetchPrices del apiService para obtener precios y cambios en 24h de los activos en la watchlist.

    self.postMessage({ type: 'MARKET_UPDATE', payload: { prices, changes24h } });
    // Envía un mensaje al hilo principal con los precios y cambios actualizados.

    // Alerta simple (ejemplo con BTC)
    if (prices.bitcoin && prices.bitcoin > 60000) {
      // Si el precio de Bitcoin existe y supera los 60,000 USD:
      self.postMessage({ 
        type: 'ALERT', 
        payload: { 
          id: crypto.randomUUID(),              // Genera un id único para la alerta.
          type: 'alert',                        // Tipo de notificación: alerta.
          message: '¡Bitcoin ha superado los 60,000!' // Mensaje de alerta.
        } 
      });
    }
  } catch (err) {
    // Si ocurre un error durante la obtención de precios:
    self.postMessage({ 
      type: 'ERROR', 
      payload: { 
        id: crypto.randomUUID(),               // Genera un id único para la notificación de error.
        type: 'error',                         // Tipo de notificación: error.
        message: err.message || String(err)    // Mensaje descriptivo del error.
      } 
    });
  }
}

self.onmessage = (e) => {
  // Listener principal del Web Worker.
  // Se ejecuta cada vez que el worker recibe un mensaje desde el hilo principal.
  const { type, payload } = e.data || {}; // Extrae tipo y payload del mensaje recibido.

  if (type === 'START_FEED') {
    // Si el mensaje recibido es de tipo 'START_FEED', significa que se debe iniciar el feed de mercado.
    watchlistIds = Array.isArray(payload?.assetIds) ? payload.assetIds : [];
    // Obtiene los IDs de los activos desde el payload. Si no es un array válido, usa lista vacía.

    if (intervalId) return;
    // Si ya existe un intervalo en ejecución, no crea otro (evita duplicados).

    intervalId = setInterval(tick, 60000);
    // Configura un intervalo para ejecutar la función tick cada 60 segundos.

    tick();
    // Ejecuta la función tick inmediatamente para obtener datos sin esperar al primer intervalo.
  }
};
