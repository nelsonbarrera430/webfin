import { apiService } from '../services/apiService.js';
import { setHistoricalSummary, setAnalysisReport } from '../store/uiSlice.js';

export function renderDashboard(store) {
  const marketBody = document.getElementById('marketBody');
  const template = document.getElementById('marketRowTemplate');
  const historicalSummary = document.getElementById('historicalSummary');
  const analysisReport = document.getElementById('analysisReport');
  const runBestBtn = document.getElementById('runBestPerformer');
  const notificationsPanel = document.getElementById('notificationsPanel');

  function renderMarket() {
    const { market } = store.getState();
    marketBody.innerHTML = '';
    Object.keys(market.prices).forEach(id => {
      const node = template.content.cloneNode(true);
      node.querySelector('.assetId').textContent = id;
      const price = market.prices[id];
      node.querySelector('.price').textContent = price == null ? 'N/D' : Number(price).toFixed(2);
      const ch = market.changes24h[id];
      const cell = node.querySelector('.change24h');
      if (ch == null) {
        cell.textContent = 'N/D';
        cell.style.color = 'inherit';
      } else {
        cell.textContent = `${Number(ch).toFixed(2)}%`;
        cell.style.color = ch >= 0 ? 'var(--ok)' : 'var(--danger)';
      }
      marketBody.appendChild(node);
    });
  }

  function renderNotifications() {
    const { ui } = store.getState();
    notificationsPanel.innerHTML = '';
    ui.notifications.forEach(n => {
      const div = document.createElement('div');
      div.className = `notification ${n.type}`;
      div.textContent = n.message;
      notificationsPanel.appendChild(div);
    });
  }

  function renderHistoricalSummary() {
    const { ui } = store.getState();
    const s = ui.historicalSummary;
    if (!s || s.assetId !== ui.selectedAssetId) return;

    if (s.maxPrice == null) {
      historicalSummary.innerHTML = `<p>Histórico no disponible para ${s.assetId}.</p>`;
    } else {
      historicalSummary.innerHTML = `
        <p><strong>Activo:</strong> ${s.assetId}</p>
        <p><strong>Max:</strong> ${s.maxPrice.toFixed(2)} USD</p>
        <p><strong>Min:</strong> ${s.minPrice.toFixed(2)} USD</p>
        <p><strong>Avg:</strong> ${s.avgPrice.toFixed(2)} USD</p>
      `;
    }
  }

  function renderAnalysisReport() {
    const { ui } = store.getState();
    const r = ui.analysisReport;
    if (!r) return;
    analysisReport.innerHTML = `
      <p><strong>Estrategia:</strong> ${r.strategy}</p>
      <p><strong>Mejor:</strong> ${r.best.id} (${Number(r.best.change ?? 0).toFixed(2)}%)</p>
    `;
  }

  store.subscribe(() => {
    const { ui } = store.getState();

    renderMarket();
    renderNotifications();
    renderHistoricalSummary();
    renderAnalysisReport();

    // 🔁 Cargar resumen histórico si cambia el activo seleccionado
    if (ui.selectedAssetId && (!ui.historicalSummary || ui.historicalSummary.assetId !== ui.selectedAssetId)) {
      apiService.fetchDailyHistory(ui.selectedAssetId).then(candles => {
        if (!candles.length) {
          store.dispatch(setHistoricalSummary({ assetId: ui.selectedAssetId }));
          return;
        }
        const prices = candles.map(c => c.price_close);
        const summary = {
          assetId: ui.selectedAssetId,
          maxPrice: Math.max(...prices),
          minPrice: Math.min(...prices),
          avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length
        };
        store.dispatch(setHistoricalSummary(summary));
      });
    }
  });

  runBestBtn.addEventListener('click', () => {
    const state = store.getState();
    const watchlist = Object.keys(state.watchlist.items);
    const marketData = state.market;
    const best = watchlist.reduce((acc, id) => {
      const change = marketData.changes24h[id] ?? -Infinity;
      return change > (acc.change ?? -Infinity) ? { id, change } : acc;
    }, {});
    store.dispatch(setAnalysisReport({ strategy: 'BEST_PERFORMER', best }));
  });
}
