// ui/dashboard.js
// Módulo para controlar la vista principal del dashboard.
// Contiene todos los listeners de eventos de la UI y las funciones de renderizado.

let handlers = {}; // Objeto que almacena los callbacks (handlers) pasados desde main.js

/**
 * Inicializa los listeners de eventos para el dashboard.
 * @param {object} eventHandlers - Objeto con los callbacks para la lógica de negocio (main.js).
 */
export function initDashboardView(eventHandlers) {
    handlers = eventHandlers; // Almacena los callbacks (onSearch, onLoadHistory, etc.)
    
    // --- 1. Listener para Búsqueda (con debounce simulado) ---
    let searchTimeout; // ID para el temporizador de debounce
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout); // Reinicia el temporizador en cada pulsación
            const query = e.target.value;
            
            if (query.length > 1) {
                // Espera 300ms antes de llamar al handler (Worker 3)
                searchTimeout = setTimeout(() => {
                    handlers.onSearch(query); // Llama al facade.searchAssets()
                }, 300); // Debounce de 300ms
            } else {
                renderSearchResults([]); // Limpia la lista si la búsqueda es demasiado corta
            }
        });
    }

    // --- 2. Listeners para botones de Workers (4 y 5) ---
    
    // Botón para cargar el resumen histórico (activa Worker 4)
    const loadHistoryBtn = document.getElementById('load-history-btn');
    if (loadHistoryBtn) {
        loadHistoryBtn.addEventListener('click', () => {
            handlers.onLoadHistory(); // Llama al facade.getHistoricalSummary()
        });
    }

    // Botón para ejecutar el análisis de portafolio (activa Worker 5)
    const runAnalysisBtn = document.getElementById('run-analysis-btn');
    if (runAnalysisBtn) {
        runAnalysisBtn.addEventListener('click', () => {
            handlers.onRunAnalysis(); // Llama al facade.runAnalysis()
        });
    }

    // --- 3. Listener de Clic para seleccionar un Activo de la búsqueda ---
    const searchResultsList = document.getElementById('search-results');
    if (searchResultsList) {
        searchResultsList.addEventListener('click', (e) => {
            // Verifica que el elemento clicado sea un <li> y que contenga el símbolo (ID)
            if (e.target.tagName === 'LI' && e.target.dataset.symbol) {
                // Llama al handler para despachar setSelectedAsset al store
                handlers.onAssetSelect(e.target.dataset.symbol);
                
                // Limpia la lista de resultados y el input de búsqueda después de seleccionar
                renderSearchResults([]); 
                if (searchInput) searchInput.value = '';
            }
        });
    }
}


// --- FUNCIONES DE RENDERIZADO ---

/**
 * Renderiza la lista de Watchlist en el panel lateral.
 * @param {string[]} watchlistSymbols - Array de símbolos (ej. ['BTC', 'ETH']).
 */
export function renderWatchlist(watchlistSymbols) {
    const container = document.getElementById('watchlist-items');
    if (!container) return; 

    container.innerHTML = ''; // Limpiar lista
    
    watchlistSymbols.forEach(symbol => {
        const item = document.createElement('div');
        item.className = 'watchlist-item';
        item.textContent = symbol;
        container.appendChild(item);
    });
}


/**
 * Renderiza el feed de precios en vivo (Datos de Worker 2 - marketPoll).
 * @param {object} prices - Datos de precios del marketSlice.
 * @param {object} assets - Caché de activos para obtener nombres completos.
 */
export function renderPriceFeed(prices, assets) {
    const container = document.getElementById('price-feed');
    if (!container) return;
    
    container.innerHTML = '<h3>Precios en Vivo</h3>'; 
    
    const fragment = document.createDocumentFragment();
    // Plantilla HTML para inyectar cada ítem de precio
    const template = document.getElementById('price-feed-template').content;

    for (const symbol in prices) {
        const data = prices[symbol]; 
        
        // Lógica para manejar diferentes formatos de datos de precios (inicial vs. polling)
        let price = null;
        let changeDirection = 0; // 0 por defecto si no se conoce el cambio (neutral)

        if (typeof data === 'object' && data !== null) {
            // Caso 1: El worker envía un objeto { price, change }
            price = data.price;
            changeDirection = data.change;
        } else if (typeof data === 'number') {
             // Caso 2: El worker solo envía el precio como número (ej. setInitialPrices)
            price = data;
        }

        // Obtiene el nombre completo del activo desde el caché de assets (Worker 1)
        const assetInfo = assets[symbol]; 
        const assetName = assetInfo ? assetInfo.name : symbol;

        const clone = template.cloneNode(true);

        const titleEl = clone.querySelector('strong');
        const priceEl = clone.querySelector('.price');
        const changeSpan = clone.querySelector('.change');

        if (titleEl) titleEl.textContent = assetName;
        
        // Formatea el precio a moneda ($XX.XX)
        if (priceEl) priceEl.textContent = `$${price ? Number(price).toFixed(2) : 'N/A'}`;
        
        // Lógica para mostrar flechas (▲/▼) y clases CSS de color (positive/negative)
        if (changeSpan) {
            if (changeDirection > 0) {
                changeSpan.textContent = '▲';
                changeSpan.className = 'change positive';
            } else if (changeDirection < 0) {
                changeSpan.textContent = '▼';
                changeSpan.className = 'change negative';
            } else {
                changeSpan.textContent = '-';
                changeSpan.className = 'change neutral';
            }
        }

        fragment.appendChild(clone);
    }
    container.appendChild(fragment);
}

/**
 * Renderiza la lista de resultados de la búsqueda (Datos de Worker 3 - search.worker).
 * @param {object[]} results - Array de activos que coinciden con la búsqueda.
 */
export function renderSearchResults(results) {
    const list = document.getElementById('search-results');
    if (!list) return;

    list.innerHTML = ''; // Limpiar resultados anteriores
    if (results.length === 0) return;

    results.forEach(asset => {
        const li = document.createElement('li');
        li.textContent = `${asset.name} (${asset.symbol})`;
        // Almacena el símbolo en el dataset para el handler de clic
        li.dataset.symbol = asset.symbol; 
        list.appendChild(li);
    });
}

/**
 * Renderiza el resumen histórico procesado (Datos de Worker 4 - historical.worker).
 * @param {object} summary - Objeto con maxPrice, minPrice, avgPrice.
 */
export function renderHistoricalSummary(summary) {
    const container = document.getElementById('history-data');
    if (!container) return; 

    if (!summary) {
        container.innerHTML = '<p>Selecciona un activo y haz clic en "Cargar Resumen Histórico".</p>';
        return;
    }
    
    // Función de ayuda para asegurar que el valor es un número antes de formatearlo
    const formatPrice = (price) => {
        return !isNaN(Number(price)) ? `$${Number(price).toFixed(2)}` : 'N/A';
    };

    // Inyecta el resumen estadístico
    container.innerHTML = `
        <p><strong>${summary.symbol} (1 Año)</strong></p>
        <p>Máximo: ${formatPrice(summary.maxPrice)}</p>
        <p>Mínimo: ${formatPrice(summary.minPrice)}</p>
        <p>Promedio: ${formatPrice(summary.avgPrice)}</p>
    `;
}

/**
 * Renderiza el reporte de análisis de portafolio (Datos de Worker 5 - analysis.worker).
 * @param {object} report - Resultado del análisis de estrategia.
 */
export function renderAnalysisReport(report) {
    const container = document.getElementById('analysis-report');
    if (!container) return;

    if (!report || !report.bestPerformer) {
        container.innerHTML = '<p>Ejecutando análisis...</p>';
        return;
    }
    
    // Inyecta el reporte de estrategia
    container.innerHTML = `
        <p><strong>${report.strategy}</strong></p>
        <p>Mejor Rendimiento: ${report.bestPerformer.symbol} (@ $${report.bestPerformer.price.toFixed(2)})</p>
        <p>Peor Rendimiento: ${report.worstPerformer.symbol} (@ $${report.worstPerformer.price.toFixed(2)})</p>
    `;
}