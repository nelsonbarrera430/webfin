import { CRYPTOCOMPARE_API_KEY, CRYPTOCOMPARE_BASE_URL } from './config.js';

// workers/boot.worker.js
// Tarea: Carga Estática Masiva (Worker 1). Obtiene la lista completa de activos.
// Beneficio: La aplicación arranca rápido mientras los datos base se cargan en segundo plano.

self.onmessage = async (e) => {
    // El worker solo procesa el mensaje si recibe la orden 'LOAD_ASSETS' del WorkerFacade.
    if (e.data.type === 'LOAD_ASSETS') {
        try {
            // Construye la URL para obtener la lista completa de monedas (coinlist) de CryptoCompare.
            const url = `${CRYPTOCOMPARE_BASE_URL}/data/all/coinlist?api_key=${CRYPTOCOMPARE_API_KEY}`;
            
            // Realiza la petición de red (fetch) en el hilo del worker.
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Error de red al cargar la lista de monedas');
            }
            
            const data = await response.json();
            
            // Verifica si la API de CryptoCompare devolvió un error en la estructura JSON.
            if (data.Response === 'Error') {
                throw new Error(data.Message);
            }

            // Envía los datos de las monedas (data.Data) de vuelta al Facade en el hilo principal.
            // Esto se despachará al assetsSlice de Redux.
            self.postMessage({ type: 'BOOT_SUCCESS', payload: data.Data });
            
        } catch (error) {
            // Maneja cualquier error de red o de la API y lo notifica al hilo principal.
            self.postMessage({ type: 'BOOT_ERROR', payload: { message: error.message } });
        }
    }
};