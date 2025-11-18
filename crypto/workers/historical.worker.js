import { CRYPTOCOMPARE_API_KEY, CRYPTOCOMPARE_BASE_URL } from './config.js';

// workers/historical.worker.js
// Tarea: Procesar Datos Históricos Pesados (Worker 4).
// Carga 365 días de datos y calcula estadísticas fuera del hilo principal.

self.onmessage = async (e) => {
    // El worker solo procesa el mensaje si recibe la orden 'GET_HISTORY' del WorkerFacade.
    if (e.data.type === 'GET_HISTORY') {
        const { symbol } = e.data.payload; // Símbolo del activo solicitado (ej. 'BTC')
        
        try {
            // --- 1. Configuración y Petición de Datos ---
            
            // Definición de parámetros: 1 año (365 días) en USD.
            const limit = 365;
            const tsym = 'USD';
            
            // Construcción de la URL de la API de CryptoCompare para historial diario.
            const url = `${CRYPTOCOMPARE_BASE_URL}/data/v2/histoday?fsym=${symbol}&tsym=${tsym}&limit=${limit}&api_key=${CRYPTOCOMPARE_API_KEY}`;
            
            // Ejecuta el fetch (petición de red) en el hilo del worker.
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error de red para ${symbol}`);
            
            const history = await response.json();
            if (history.Response === 'Error') throw new Error(history.Message);
            
            // Extrae el array de puntos de datos históricos.
            const dataPoints = history.Data.Data;
            
            if (!dataPoints || dataPoints.length === 0) {
                throw new Error(`No hay datos históricos para ${symbol}`);
            }

            // --- 2. Procesamiento CPU-intensivo: Cálculo de Estadísticas ---
            
            // Mapea los puntos de datos para obtener solo los valores 'high' y 'low' diarios.
            const prices = dataPoints.map(day => ({ high: day.high, low: day.low }));

            // Calcula el precio máximo del período utilizando 'reduce' en el campo 'high'.
            const maxPrice = prices.reduce((max, day) => Math.max(max, day.high), 0);
            
            // Calcula el precio mínimo del período utilizando 'reduce' en el campo 'low'.
            const minPrice = prices.reduce((min, day) => Math.min(min, day.low), Infinity);
            
            // Calcula el precio promedio: suma el promedio (high+low)/2 de cada día y lo divide por el total.
            const avgPrice = prices.reduce((sum, day) => sum + (day.high + day.low) / 2, 0) / prices.length;

            // --- 3. Envío del Resumen ---
            
            // Crea el objeto resumen con formato.
            const summary = {
                maxPrice: maxPrice.toFixed(2),
                minPrice: minPrice.toFixed(2),
                avgPrice: avgPrice.toFixed(2),
                symbol: symbol // Incluye el símbolo para que la UI sepa a qué activo pertenece
            };
            
            // Envía el resumen procesado al Facade (que lo despachará a uiSlice).
            self.postMessage({ type: 'HISTORY_SUCCESS', payload: summary });

        } catch (error) {
            // Manejo de errores y notificación al hilo principal.
            self.postMessage({ type: 'HISTORY_ERROR', payload: { message: error.message } });
        }
    }
};