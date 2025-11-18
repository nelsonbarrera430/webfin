import * as strategies from '../patterns/strategy/BestPerformer.js';
// Importa todas las estrategias definidas en el archivo BestPerformer.js.
// Se usa un objeto "strategies" que contiene clases de estrategia (ej. BEST_PERFORMER).

self.onmessage = (e) => {
  // Listener principal del Web Worker.
  // Se ejecuta cada vez que el worker recibe un mensaje desde el hilo principal.
  const { type, payload } = e.data || {}; // Extrae tipo y payload del mensaje recibido.

  if (type === 'RUN') {
    // Si el mensaje recibido es de tipo 'RUN', significa que se debe ejecutar un análisis.
    const { strategyName, watchlist, marketData } = payload;
    // Extrae el nombre de la estrategia, la watchlist y los datos de mercado del payload.

    try {
      const StrategyClass = strategies[strategyName] || strategies.BEST_PERFORMER;
      // Obtiene la clase de estrategia según el nombre recibido.
      // Si no existe, usa por defecto la estrategia BEST_PERFORMER.

      const strategy = new StrategyClass();
      // Crea una instancia de la estrategia seleccionada.

      const report = strategy.analyze(watchlist, marketData);
      // Ejecuta el método analyze de la estrategia, pasando la watchlist y los datos de mercado.
      // Devuelve un reporte con los resultados del análisis.

      self.postMessage({ type: 'ANALYSIS_REPORT', payload: report });
      // Envía el reporte de análisis de vuelta al hilo principal.
    } catch (err) {
      // Si ocurre un error durante la ejecución del análisis:
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
