import { CRYPTOCOMPARE_API_KEY, CRYPTOCOMPARE_BASE_URL } from './config.js';

self.onmessage = async (e) => {
    if (e.data.type === 'GET_HISTORY') {
        const { symbol } = e.data.payload;
        
        try {
            // Pedir 365 días de historial diario
            const limit = 365;
            const tsym = 'USD';
            const url = `${CRYPTOCOMPARE_BASE_URL}/data/v2/histoday?fsym=${symbol}&tsym=${tsym}&limit=${limit}&api_key=${CRYPTOCOMPARE_API_KEY}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error de red para ${symbol}`);
            
            const history = await response.json();
            if (history.Response === 'Error') throw new Error(history.Message);
            
            const dataPoints = history.Data.Data;
            
            if (!dataPoints || dataPoints.length === 0) {
                throw new Error(`No hay datos históricos para ${symbol}`);
            }

            // Procesamiento CPU-intensivo: Calcular estadísticas
            // Usamos 'high' y 'low' del día, no 'close'
            const prices = dataPoints.map(day => ({ high: day.high, low: day.low }));

            const maxPrice = prices.reduce((max, day) => Math.max(max, day.high), 0);
            const minPrice = prices.reduce((min, day) => Math.min(min, day.low), Infinity);
            const avgPrice = prices.reduce((sum, day) => sum + (day.high + day.low) / 2, 0) / prices.length;

            const summary = {
                maxPrice: maxPrice.toFixed(2),
                minPrice: minPrice.toFixed(2),
                avgPrice: avgPrice.toFixed(2),
                symbol: symbol
            };
            
            self.postMessage({ type: 'HISTORY_SUCCESS', payload: summary });

        } catch (error) {
            self.postMessage({ type: 'HISTORY_ERROR', payload: { message: error.message } });
        }
    }
};