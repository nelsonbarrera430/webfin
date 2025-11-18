import { CRYPTOCOMPARE_API_KEY, CRYPTOCOMPARE_BASE_URL } from './config.js';

self.onmessage = async (e) => {
    if (e.data.type === 'LOAD_ASSETS') {
        try {
            // Usar el endpoint 'coinlist' para obtener todos los activos
            const url = `${CRYPTOCOMPARE_BASE_URL}/data/all/coinlist?api_key=${CRYPTOCOMPARE_API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Error de red al cargar la lista de monedas');
            }
            
            const data = await response.json();
            
            if (data.Response === 'Error') {
                throw new Error(data.Message);
            }

            // Enviamos solo el objeto 'Data' que contiene las monedas
            self.postMessage({ type: 'BOOT_SUCCESS', payload: data.Data });
            
        } catch (error) {
            self.postMessage({ type: 'BOOT_ERROR', payload: { message: error.message } });
        }
    }
};