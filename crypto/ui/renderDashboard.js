import { apiService } from '../services/apiService.js';
// Importa el servicio Singleton apiService, encargado de las peticiones de red.

import { setHistoricalSummary, setAnalysisReport } from '../store/uiSlice.js';
// Importa acciones de Redux Toolkit para actualizar el resumen histórico y el reporte de análisis en la UI.

export function renderDashboard(store) {
  // Función principal que renderiza el dashboard de criptomonedas.
  // Recibe el store de Redux como parámetro.

  const marketBody = document.getElementById('marketBody');
  // Referencia al cuerpo de la tabla de mercado (donde se listan los activos).

  const template = document.getElementById('marketRowTemplate');
  // Referencia al template HTML para cada fila de la tabla de mercado.

  const historicalSummary = document.getElementById('historicalSummary');
  // Referencia al contenedor donde se mostrará el resumen histórico.

  const analysisReport = document.getElementById('analysisReport');
  // Referencia al contenedor donde se mostrará el reporte de análisis.

  const runBestBtn = document.getElementById('runBestPerformer');
  // Referencia al botón que ejecuta la estrategia "Mejor Rendimiento 24h".

  const notificationsPanel = document.getElementById('notificationsPanel');
  // Referencia al panel donde se mostrarán las notificaciones.

  function renderMarket() {
    // Renderiza la tabla de mercado con precios y cambios en 24h.
    const { market } = store.getState();
    marketBody.innerHTML = ''; // Limpia la tabla antes de renderizar.
    Object.keys(market.prices).forEach(id => {
      const node = template.content.cloneNode(true); // Clona el template para cada activo.
      node.querySelector('.assetId').textContent = id; // Muestra el id del activo.
      const price = market.prices[id];
      node.querySelector('.price').textContent = price == null ? 'N/D' : Number(price).toFixed(2);
      // Muestra el precio, o "N/D" si no está disponible.
      const ch = market.changes24h[id];
      const cell = node.querySelector('.change24h');
      if (ch == null) {
        cell.textContent = 'N/D'; // Si no hay cambio, muestra "N/D".
        cell.style.color = 'inherit'; // Color neutro.
      } else {
        cell.textContent = `${Number(ch).toFixed(2)}%`; // Muestra el cambio en porcentaje.
        cell.style.color = ch >= 0 ? 'var(--ok)' : 'var(--danger)'; // Verde si sube, rojo si baja.
      }
      marketBody.appendChild(node); // Agrega la fila a la tabla.
    });
  }

  function renderNotifications() {
    // Renderiza las notificaciones en el panel.
    const { ui } = store.getState();
    notificationsPanel.innerHTML = ''; // Limpia el panel.
    ui.notifications.forEach(n => {
      const div = document.createElement('div');
      div.className = `notification ${n.type}`; // Clase según tipo (error, alerta, etc.).
      div.textContent = n.message; // Mensaje de la notificación.
      notificationsPanel.appendChild(div); // Agrega al panel.
    });
  }

  function renderHistoricalSummary() {
    // Renderiza el resumen histórico del activo seleccionado.
    const { ui } = store.getState();
    const s = ui.historicalSummary;
    if (!s || s.assetId !== ui.selectedAssetId) return; // Solo renderiza si coincide con el activo seleccionado.

    if (s.maxPrice == null) {
      // Si no hay datos históricos, muestra mensaje.
      historicalSummary.innerHTML = `<p>Histórico no disponible para ${s.assetId}.</p>`;
    } else {
      // Si hay datos, muestra max, min y promedio.
      historicalSummary.innerHTML = `
        <p><strong>Activo:</strong> ${s.assetId}</p>
        <p><strong>Max:</strong> ${s.maxPrice.toFixed(2)} USD</p>
        <p><strong>Min:</strong> ${s.minPrice.toFixed(2)} USD</p>
        <p><strong>Avg:</strong> ${s.avgPrice.toFixed(2)} USD</p>
      `;
    }
  }

  function renderAnalysisReport() {
    // Renderiza el reporte de análisis de portafolio.
    const { ui } = store.getState();
    const r = ui.analysisReport;
    if (!r) return; // Si no hay reporte, no hace nada.
    analysisReport.innerHTML = `
      <p><strong>Estrategia:</strong> ${r.strategy}</p>
      <p><strong>Mejor:</strong> ${r.best.id} (${Number(r.best.change ?? 0).toFixed(2)}%)</p>
    `;
  }

  store.subscribe(() => {
    // Se ejecuta cada vez que cambia el estado del store.
    const { ui } = store.getState();

    renderMarket();             // Actualiza la tabla de mercado.
    renderNotifications();      // Actualiza las notificaciones.
    renderHistoricalSummary();  // Actualiza el resumen histórico.
    renderAnalysisReport();     // Actualiza el reporte de análisis.

    // 🔁 Cargar resumen histórico si cambia el activo seleccionado
    if (ui.selectedAssetId && (!ui.historicalSummary || ui.historicalSummary.assetId !== ui.selectedAssetId)) {
      apiService.fetchDailyHistory(ui.selectedAssetId).then(candles => {
        // Llama al apiService para obtener datos históricos del activo seleccionado.
        if (!candles.length) {
          // Si no hay datos, despacha un resumen vacío.
          store.dispatch(setHistoricalSummary({ assetId: ui.selectedAssetId }));
          return;
        }
        const prices = candles.map(c => c.price_close); // Extrae precios de cierre.
        const summary = {
          assetId: ui.selectedAssetId,
          maxPrice: Math.max(...prices), // Precio máximo.
          minPrice: Math.min(...prices), // Precio mínimo.
          avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length // Promedio.
        };
        store.dispatch(setHistoricalSummary(summary)); // Actualiza el store con el resumen.
      });
    }
  });

  runBestBtn.addEventListener('click', () => {
    // Listener para el botón de "Mejor Rendimiento 24h".
    const state = store.getState();
    const watchlist = Object.keys(state.watchlist.items); // Obtiene la watchlist del usuario.
    const marketData = state.market;
    const best = watchlist.reduce((acc, id) => {
      // Recorre la watchlist para encontrar el activo con mayor cambio en 24h.
      const change = marketData.changes24h[id] ?? -Infinity;
      return change > (acc.change ?? -Infinity) ? { id, change } : acc;
    }, {});
    store.dispatch(setAnalysisReport({ strategy: 'BEST_PERFORMER', best }));
    // Despacha el reporte de análisis con la estrategia "BEST_PERFORMER".
  });
}
