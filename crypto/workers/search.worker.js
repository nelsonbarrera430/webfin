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
    if (e.data.type === 'FILTER_ASSETS') {
        const { query, allAssets } = e.data.payload;
        
        if (!query) {
            self.postMessage({ type: 'SEARCH_SUCCESS', payload: [] });
            return;
        }

        const lowerCaseQuery = query.toLowerCase();
        const results = [];
        
        // Iterar sobre el objeto de assets
        for (const symbol in allAssets) {
            const asset = allAssets[symbol];
            // Buscar por símbolo (ej. "BTC") o por nombre (ej. "Bitcoin")
            if (asset.symbol.toLowerCase().includes(lowerCaseQuery) || 
                asset.name.toLowerCase().includes(lowerCaseQuery)) {
                
                results.push({
                    symbol: asset.symbol,
                    name: asset.name
                });
            }
            // Limitar los resultados para no saturar la UI
            if (results.length >= 20) {
                break;
            }
        }
        
        self.postMessage({ type: 'SEARCH_SUCCESS', payload: results });
    }
};