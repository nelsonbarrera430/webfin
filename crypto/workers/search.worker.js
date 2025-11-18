// workers/search.worker.js
// Tarea: Búsqueda y Filtrado CPU-Intensivo (Worker 3).
// Su función es filtrar la lista completa de activos fuera del hilo principal.

/*
 * NOTA DE ARQUITECTURA:
 * La API de CryptoCompare no ofrece un endpoint de búsqueda de texto libre
 * ("search=...") como lo hacía CoinCap.
 *
 * Para cumplir el requisito de "descargar trabajo de CPU al worker",
 * este worker no hará 'fetch'. En su lugar, recibirá la lista completa
 * de assets (cargada por boot.worker.js) y el término de búsqueda.
 *
 * Su trabajo (CPU-intensivo) es FILTRAR esta lista (potencialmente
 * miles de items) fuera del hilo principal.
 */

self.onmessage = (e) => {
    // El worker solo procesa el mensaje si recibe la orden 'FILTER_ASSETS' del WorkerFacade.
    if (e.data.type === 'FILTER_ASSETS') {
        const { query, allAssets } = e.data.payload; // Recibe el término de búsqueda y el caché completo de activos.
        
        // Manejo de caso borde: si no hay término de búsqueda, devuelve un array vacío.
        if (!query) {
            self.postMessage({ type: 'SEARCH_SUCCESS', payload: [] });
            return;
        }

        // Normaliza la query a minúsculas para realizar una búsqueda insensible a mayúsculas.
        const lowerCaseQuery = query.toLowerCase();
        const results = [];
        
        // Iterar sobre el objeto de assets (allAssets) para realizar la búsqueda.
        for (const symbol in allAssets) {
            const asset = allAssets[symbol];
            
            // Lógica de Filtrado: Comprueba si el símbolo o el nombre del activo
            // incluyen el término de búsqueda normalizado.
            if (asset.symbol.toLowerCase().includes(lowerCaseQuery) || 
                asset.name.toLowerCase().includes(lowerCaseQuery)) {
                
                // Si hay coincidencia, añade un objeto simplificado a los resultados.
                results.push({
                    symbol: asset.symbol,
                    name: asset.name
                });
            }
            
            // Limitar los resultados para no saturar la UI y optimizar el rendimiento.
            if (results.length >= 10) {
                break; // Detiene la iteración si ya se encontraron 10 resultados.
            }
        }
        
        // Envía los resultados filtrados al Facade (que lo despachará a uiSlice).
        self.postMessage({ type: 'SEARCH_SUCCESS', payload: results });
    }
};