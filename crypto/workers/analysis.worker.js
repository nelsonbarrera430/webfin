// workers/analysis.worker.js
// Tarea: Ejecutar análisis complejos sobre la Watchlist del usuario.
// Patrón: Strategy (permite cambiar la lógica de análisis fácilmente).

// --- Definición del Patrón Strategy DENTRO del worker ---

/**
 * Strategy concreto: Identifica el activo con el precio Máximo y Mínimo.
 * En una aplicación real, esta estrategia podría calcular el mejor/peor rendimiento en 24h.
 */
class BestPerformerStrategy {
    /**
     * Ejecuta el análisis de la Watchlist.
     * @param {object} watchlist - Lista de activos a seguir (ej. { 'BTC': { notes: '...' } }).
     * @param {object} marketData - Precios actuales de los activos (ej. { 'BTC': 50000, 'ETH': 3000 }).
     * @returns {object} El reporte con los activos de mejor y peor rendimiento.
     */
    analyze(watchlist, marketData) {
        let best = { symbol: null, price: 0 };
        let worst = { symbol: null, price: Infinity };

        // Itera sobre los símbolos de la Watchlist del usuario.
        for (const symbol in watchlist) {
            // Obtiene el precio actual desde los datos de mercado.
            const price = marketData[symbol];
            
            if (price) {
                // Lógica para encontrar el precio más alto (Best Performer)
                if (price > best.price) {
                    best = { symbol, price };
                }
                // Lógica para encontrar el precio más bajo (Worst Performer)
                if (price < worst.price) {
                    worst = { symbol, price };
                }
            }
        }
        
        // Retorna el reporte estandarizado.
        return {
            strategy: "Best/Worst Performer (Precio Actual)",
            bestPerformer: best,
            worstPerformer: worst
        };
    }
}
// En un futuro, se podrían añadir más...
// class VolatilityStrategy { ... }


// Mapa de estrategias disponibles (Contexto del Patrón Strategy).
const strategies = {
    BEST_PERFORMER: BestPerformerStrategy,
};

// --- Lógica del Web Worker ---

self.onmessage = (e) => {
    // Solo actúa si se le ordena ejecutar un análisis.
    if (e.data.type === 'RUN_ANALYSIS') {
        const { strategyName, watchlist, marketData } = e.data.payload;
        
        try {
            // 1. Selecciona la clase de estrategia basándose en el nombre recibido.
            const StrategyClass = strategies[strategyName];
            
            if (!StrategyClass) {
                throw new Error(`Estrategia '${strategyName}' no encontrada.`);
            }
            
            // 2. Instancia la estrategia seleccionada (Patrón Strategy).
            const strategy = new StrategyClass();
            
            // 3. Simular trabajo CPU-intensivo (bloqueo artificial).
            // Esto demuestra que el hilo principal no se bloqueará.
            for (let i = 0; i < 1e7; i++) {} // Bloqueo simulado

            // 4. Ejecuta el análisis.
            const report = strategy.analyze(watchlist, marketData);
            
            // 5. Envía el resultado (reporte) de vuelta al Facade.
            self.postMessage({ type: 'ANALYSIS_SUCCESS', payload: report });

        } catch (error) {
            // Manejo de errores y notificación al hilo principal.
            self.postMessage({ type: 'ANALYSIS_ERROR', payload: { message: error.message } });
        }
    }
};