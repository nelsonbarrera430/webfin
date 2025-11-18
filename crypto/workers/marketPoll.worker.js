import { CRYPTOCOMPARE_API_KEY, CRYPTOCOMPARE_BASE_URL } from './config.js';

// workers/marketPoll.worker.js
// Tarea: Feed de Precios en Vivo mediante Polling (Worker 2).
// Patrón: Sujeto (Observer), que emite datos periódicamente al hilo principal.

let pollInterval; // Referencia al ID del setInterval para control (iniciar/detener).
let symbolsToPoll = []; // Array que contiene los símbolos de la Watchlist a vigilar (ej. ['BTC', 'ETH']).
const POLLING_RATE = 5000; // Tasa de Polling: 5000ms (5 segundos).

/**
 * Normaliza la respuesta de la API 'pricemulti' de CryptoCompare.
 * La API devuelve: { "BTC": { "USD": 50000 }, ... }
 * Lo convierte a: { "BTC": 50000, ... } para el Redux Store.
 * @param {object} apiData - Datos JSON brutos de la API.
 * @returns {object} Datos de precios normalizados.
 */
function normalizePriceData(apiData) {
    const prices = {};
    for (const [symbol, values] of Object.entries(apiData)) {
        if (values.USD) {
            // Almacena el precio en USD.
            prices[symbol] = values.USD;
        }
    }
    return prices;
}

/**
 * Función asíncrona que realiza la petición de red para obtener los precios.
 * Se ejecuta periódicamente mediante setInterval.
 */
async function fetchMarketData() {
    // Si no hay símbolos para vigilar (ej. Watchlist vacía), no hace nada.
    if (symbolsToPoll.length === 0) {
        return; 
    }

    try {
        // Une los símbolos en una cadena separada por comas para la URL.
        const fsyms = symbolsToPoll.join(',');
        const tsyms = 'USD';
        
        // Construye la URL para obtener múltiples precios simultáneamente.
        const url = `${CRYPTOCOMPARE_BASE_URL}/data/pricemulti?fsyms=${fsyms}&tsyms=${tsyms}&api_key=${CRYPTOCOMPARE_API_KEY}`;
        
        // Realiza el fetch en el hilo del Worker (polling).
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error de red en el polling');
        
        const data = await response.json();
        if (data.Response === 'Error') throw new Error(data.Message);

        // Procesa y normaliza los datos.
        const normalizedPrices = normalizePriceData(data);
        
        // Si se recibieron datos válidos, los envía al hilo principal.
        // El Facade (Observer) escuchará este mensaje y despachará a marketSlice.
        if (Object.keys(normalizedPrices).length > 0) {
            self.postMessage({ type: 'MARKET_UPDATE', payload: normalizedPrices });
        }

    } catch (error) {
        console.error('Error en Market Poll Worker:', error.message);
        self.postMessage({ type: 'MARKET_ERROR', payload: { message: error.message } });
    }
}

// --- Lógica del Web Worker (Manejo de Mensajes) ---

self.onmessage = (e) => {
    // 1. Comando para INICIAR el polling (lo activa el WorkerFacade después del login).
    if (e.data.type === 'START_POLLING') {
        // Si el polling ya estaba activo, se reinicia para usar los nuevos símbolos.
        if (pollInterval) clearInterval(pollInterval);
        
        // **ACTUALIZA** la lista de símbolos a vigilar (obtenida de la Watchlist).
        if (e.data.payload && e.data.payload.symbols) {
            symbolsToPoll = e.data.payload.symbols;
        }
        
        // Solo inicia el intervalo si hay símbolos para vigilar.
        if (symbolsToPoll && symbolsToPoll.length > 0) {
            // Inicia el ciclo de polling, llamando a fetchMarketData cada 5 segundos.
            pollInterval = setInterval(fetchMarketData, POLLING_RATE);
            console.log(`Market Poll Worker: Iniciado. Vigilando ${symbolsToPoll.length} símbolos.`);
        }
    }
    
    // 2. Comando para DETENER el polling (utilizado, por ejemplo, al cerrar sesión).
    if (e.data.type === 'STOP_POLLING') {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
            console.log('Market Poll Worker: Detenido.');
        }
    }
};