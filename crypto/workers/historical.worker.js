import { apiService } from '../services/apiService.js';
// Importa el servicio Singleton apiService, encargado de realizar las peticiones de red (proxy + Firebase).

self.onmessage = async (e) => {
  // Listener principal del Web Worker.
  // Se ejecuta cada vez que el worker recibe un mensaje desde el hilo principal.
  const { type, payload } = e.data || {}; // Extrae tipo y payload del mensaje recibido.

  if (type === 'GET_SUMMARY') {
    // Si el mensaje recibido es de tipo 'GET_SUMMARY', significa que se debe calcular un resumen histórico.
    const assetId = payload?.assetId || 'bitcoin';
    // Obtiene el id del activo desde el payload. Si no existe, usa 'bitcoin' por defecto.

    try {
      const candles = await apiService.fetchDailyHistory(assetId, 365);
      // Llama al método fetchDailyHistory del apiService para obtener datos históricos de 365 días.

      const prices = candles.map(c => c.price_close).filter(v => typeof v === 'number');
      // Extrae los precios de cierre de las velas y filtra solo valores numéricos.

      if (!prices.length) {
        // Si no hay precios disponibles, envía un resumen vacío con valores nulos.
        self.postMessage({ 
          type: 'HISTORICAL_SUMMARY', 
          payload: { assetId, maxPrice: null, minPrice: null, avgPrice: null } 
        });
        return; // Termina la ejecución.
      }

      const maxPrice = Math.max(...prices);
      // Calcula el precio máximo.

      const minPrice = Math.min(...prices);
      // Calcula el precio mínimo.

      const avgPrice = prices.reduce((acc, v) => acc + v, 0) / prices.length;
      // Calcula el precio promedio sumando todos los valores y dividiendo por la cantidad.

      self.postMessage({
        // Envía el resumen histórico al hilo principal.
        type: 'HISTORICAL_SUMMARY',
        payload: { assetId, maxPrice, minPrice, avgPrice: Number(avgPrice.toFixed(2)) }
        // Incluye el activo, el máximo, el mínimo y el promedio (redondeado a 2 decimales).
      });
    } catch (err) {
      // Si ocurre un error durante la obtención o cálculo:
      self.postMessage({ 
        type: 'ERROR', 
        payload: { 
          id: crypto.randomUUID(),           // Genera un id único para la notificación de error.
          type: 'error',                     // Tipo de notificación: error.
          message: err.message || String(err) // Mensaje descriptivo del error.
        } 
      });
    }
  }
};
