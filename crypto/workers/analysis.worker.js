// Este worker simula la importación de estrategias.
// En un entorno real con Webpack, usaríamos imports dinámicos.
// Aquí, las definiremos localmente para simplicidad.

// --- Definición del Patrón Strategy DENTRO del worker ---
class BestPerformerStrategy {
    analyze(watchlist, marketData) {
        let best = { symbol: null, price: 0 };
        let worst = { symbol: null, price: Infinity };

        // 'watchlist' es { 'BTC': { notes: ... }, ... }
        // 'marketData' es { 'BTC': 50000, ... }
        
        for (const symbol in watchlist) {
            const price = marketData[symbol];
            if (price) {
                if (price > best.price) {
                    best = { symbol, price };
                }
                if (price < worst.price) {
                    worst = { symbol, price };
                }
            }
        }
        return {
            strategy: "Best/Worst Performer",
            bestPerformer: best,
            worstPerformer: worst
        };
    }
}
// En un futuro, se podrían añadir más...
// class VolatilityStrategy { ... }

const strategies = {
    BEST_PERFORMER: BestPerformerStrategy,
};

// --- Lógica del Worker ---

self.onmessage = (e) => {
    if (e.data.type === 'RUN_ANALYSIS') {
        const { strategyName, watchlist, marketData } = e.data.payload;
        
        try {
            const StrategyClass = strategies[strategyName];
            if (!StrategyClass) {
                throw new Error(`Estrategia '${strategyName}' no encontrada.`);
            }
            
            const strategy = new StrategyClass();
            
            // Simular trabajo CPU-intensivo
            // En un caso real, este análisis podría tardar segundos
            for (let i = 0; i < 1e7; i++) {} // Bloqueo simulado

            const report = strategy.analyze(watchlist, marketData);
            
            self.postMessage({ type: 'ANALYSIS_SUCCESS', payload: report });

        } catch (error) {
            self.postMessage({ type: 'ANALYSIS_ERROR', payload: { message: error.message } });
        }
    }
};