export class BEST_PERFORMER {
  analyze(watchlist, marketData) {
    const ids = Array.isArray(watchlist) ? watchlist : Object.keys(watchlist || {});
    const changes = marketData?.changes24h || {};
    let best = null;
    ids.forEach(id => {
      const change = changes[id] ?? 0;
      if (!best || change > best.change) best = { id, change };
    });
    return { strategy: 'BEST_PERFORMER', best: best || { id: ids[0] || 'bitcoin', change: changes[ids[0]] ?? 0 } };
  }
}

export default BEST_PERFORMER;
