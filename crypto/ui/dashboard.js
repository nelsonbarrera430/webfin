// dashboard/ui/dashboard.js
// Módulo para controlar el dashboard principal

let handlers = {};

export function initDashboardView(eventHandlers) {
    handlers = eventHandlers;
    
    // Listener para Búsqueda (con debounce simulado)
    let searchTimeout;
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value;
            if (query.length > 1) {
                searchTimeout = setTimeout(() => {
                    handlers.onSearch(query);
                }, 300); // Debounce de 300ms
            } else {
                renderSearchResults([]); // Limpiar si la query es corta
            }
        });
    }

    // Listeners para botones de workers
    const loadHistoryBtn = document.getElementById('load-history-btn');
    if (loadHistoryBtn) {
        loadHistoryBtn.addEventListener('click', () => {
            handlers.onLoadHistory();
        });
    }
    
    const runAnalysisBtn = document.getElementById('run-analysis-btn');
    if (runAnalysisBtn) {
        runAnalysisBtn.addEventListener('click', () => {
            handlers.onRunAnalysis();
        });
    }

    // ✅ CORRECCIÓN CRÍTICA: Listener para el clic en los resultados de búsqueda
    const searchResultsList = document.getElementById('search-results');
    if (searchResultsList) {
        searchResultsList.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (li && li.dataset.symbol) {
                // Llama al handler en main.js para seleccionar el activo
                handlers.onAssetSelect(li.dataset.symbol); 
                // Opcional: Limpiar los resultados y el input
                renderSearchResults([]); 
                if (searchInput) {
                    searchInput.value = li.dataset.symbol;
                }
            }
        });
    }
}

// Renderiza la lista de Watchlist en el panel lateral
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


// Renderiza el feed de precios (Worker 2)
export function renderPriceFeed(prices, assets) {
    const container = document.getElementById('price-feed');
    if (!container) return; 

    // Limpiamos el contenedor excepto el título (si lo hay)
    container.innerHTML = '<h3>Precios en Vivo</h3>'; 
    
    const fragment = document.createDocumentFragment();
    const templateEl = document.getElementById('price-feed-template');
    if (!templateEl) return;
    const template = templateEl.content;


    for (const [symbol, price] of Object.entries(prices)) {
        const assetInfo = assets[symbol]; 
        
        // Si 'assets' no ha cargado, usamos el SÍMBOLO como fallback (ej. "BTC")
        const assetName = assetInfo ? assetInfo.name : symbol;

        const clone = template.cloneNode(true);
        // CRÍTICO: Aseguramos que la tarjeta tenga el data-symbol para futuras actualizaciones
        const card = clone.querySelector('div'); // Asume que la tarjeta principal es un div
        if (card) {
             card.dataset.symbol = symbol;
        }

        // Se corrigieron las interpolaciones de string que faltaban en el código que me pasaste
        const strongEl = clone.querySelector('strong');
        if (strongEl) strongEl.textContent = assetName;

        const priceEl = clone.querySelector('.price');
        if (priceEl) priceEl.textContent = `$${price.toFixed(2)}`;
        
        const changeSpan = clone.querySelector('.change');
        const simulatedChange = Math.random() > 0.5 ? 1 : -1;
        changeSpan.textContent = simulatedChange > 0 ? '▲' : '▼';
        changeSpan.className = `change ${simulatedChange > 0 ? 'positive' : 'negative'}`;

        fragment.appendChild(clone);
    }
    container.appendChild(fragment);
}

// Renderiza los resultados de búsqueda (Worker 3)
export function renderSearchResults(results) {
    const list = document.getElementById('search-results');
    if (!list) return;

    list.innerHTML = '';
    if (results.length === 0) return;

    results.forEach(asset => {
        const li = document.createElement('li');
        // Se corrigió la interpolación de string
        li.textContent = `${asset.name} (${asset.symbol})`;
        li.dataset.symbol = asset.symbol;
        // El click listener ahora se maneja en initDashboardView
        list.appendChild(li);
    });
}

// Renderiza el resumen histórico (Worker 4)
export function renderHistoricalSummary(summary) {
    const container = document.getElementById('history-data');
    if (!container) return;

    if (!summary) {
        container.innerHTML = '<p>Cargando datos...</p>';
        return;
    }
    // Se corrigió la interpolación de string
    container.innerHTML = `
        <p><strong>${summary.symbol} (1 Año)</strong></p>
        <p>Máximo: $${summary.maxPrice}</p>
        <p>Mínimo: $${summary.minPrice}</p>
        <p>Promedio: $${summary.avgPrice}</p>
    `;
}

// Renderiza el reporte de análisis (Worker 5)
export function renderAnalysisReport(report) {
    const container = document.getElementById('analysis-report');
    if (!container) return;

    if (!report) {
        container.innerHTML = '<p>Ejecutando análisis...</p>';
        return;
    }
    // Se corrigió la interpolación de string
    container.innerHTML = `
        <p><strong>${report.strategy}</strong></p>
        <p>Mejor Rendimiento: ${report.bestPerformer.symbol} (@ $${report.bestPerformer.price.toFixed(2)})</p>
        <p>Peor Rendimiento: ${report.worstPerformer.symbol} (@ $${report.worstPerformer.price.toFixed(2)})</p>
    `;
}