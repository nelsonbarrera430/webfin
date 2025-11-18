import { CRYPTOCOMPARE_API_KEY, CRYPTOCOMPARE_BASE_URL } from './config.js';

let pollInterval;
let symbolsToPoll = []; // Almacena los símbolos que debe vigilar
const POLLING_RATE = 10000; // 30 segundos

/**
 * Normaliza la respuesta de 'pricemulti'
 * (p.ej., { "BTC": { "USD": 50000 }, ... })
 */
function normalizePriceData(apiData) {
    const prices = {};
    for (const [symbol, values] of Object.entries(apiData)) {
        if (values.USD) {
            prices[symbol] = values.USD;
        }
    }
    return prices;
}

async function fetchMarketData() {
    if (symbolsToPoll.length === 0) {
        // Esto ya no es un warning, es el estado normal hasta que se inicializa.
        return; 
    }

    try {
        const fsyms = symbolsToPoll.join(',');
        const tsyms = 'USD';
        
        const url = `${CRYPTOCOMPARE_BASE_URL}/data/pricemulti?fsyms=${fsyms}&tsyms=${tsyms}&api_key=${CRYPTOCOMPARE_API_KEY}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error de red en el polling');
        
        const data = await response.json();
        if (data.Response === 'Error') throw new Error(data.Message);

        const normalizedPrices = normalizePriceData(data);
        
        if (Object.keys(normalizedPrices).length > 0) {
            self.postMessage({ type: 'MARKET_UPDATE', payload: normalizedPrices });
        }

    } catch (error) {
        console.error('Error en Market Poll Worker:', error.message);
        self.postMessage({ type: 'MARKET_ERROR', payload: { message: error.message } });
    }
}

self.onmessage = (e) => {
    if (e.data.type === 'START_POLLING') {
        if (pollInterval) clearInterval(pollInterval);
        
        // **FIX PARA EL TYPEERROR:**
        // Comprobamos si 'e.data.payload' existe antes de intentar leer 'symbols'.
        // Si no existe, 'symbolsToPoll' se queda como un array vacío [].
        if (e.data.payload && e.data.payload.symbols) {
            symbolsToPoll = e.data.payload.symbols;
        }
        
        if (symbolsToPoll && symbolsToPoll.length > 0) {
            // No llamamos a fetchMarketData() inmediatamente,
            // porque main.js ya tiene los precios.
            // Solo iniciamos el *próximo* tick.
            pollInterval = setInterval(fetchMarketData, POLLING_RATE);
            console.log(`Market Poll Worker: Iniciado. Vigilando ${symbolsToPoll.length} símbolos.`);
        }
    }
    
    if (e.data.type === 'STOP_POLLING') {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }
};