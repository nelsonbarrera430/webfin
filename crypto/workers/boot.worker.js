import { apiService } from '../services/apiService.js';
// Importa el servicio Singleton apiService, encargado de realizar las peticiones de red (proxy + Firebase).

self.onmessage = async (e) => {
  // Listener principal del Web Worker.
  // Se ejecuta cada vez que el worker recibe un mensaje desde el hilo principal.
  const { type } = e.data || {}; // Extrae el tipo de mensaje del objeto recibido.

  if (type === 'LOAD_ASSETS') {
    // Si el mensaje recibido es de tipo 'LOAD_ASSETS', significa que se deben cargar todos los activos.
    try {
      const assets = await apiService.fetchAllAssets();
      // Llama al método fetchAllAssets del apiService para obtener la lista completa de activos.

      // ✅ Notifica al store
      self.postMessage({ type: 'ASSETS_LOADED', payload: assets });
      // Envía un mensaje de vuelta al hilo principal con los activos cargados.
      // Este mensaje será procesado por el WorkerFacade y despachado al store (assetsSlice).

      // ✅ También inicializa el search.worker
      postMessage({ type: 'INIT_ASSETS', payload: assets });
      // Envía otro mensaje para inicializar el search.worker con los activos cargados.
      // Esto permite que el worker de búsqueda tenga datos disponibles para filtrar.

    } catch (err) {
      // Si ocurre un error durante la carga de activos:
      self.postMessage({
        type: 'ERROR',
        payload: {
          id: crypto.randomUUID(),           // Genera un id único para la notificación de error.
          type: 'error',                     // Tipo de notificación: error.
          message: err.message || String(err) // Mensaje descriptivo del error.
        }
      });
      // Envía un mensaje de error al hilo principal para que se muestre en la UI.
    }
  }
};
