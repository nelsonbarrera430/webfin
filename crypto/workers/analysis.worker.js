import * as strategies from '../patterns/strategy/BestPerformer.js';

self.onmessage = (e) => {
  const { type, payload } = e.data || {};
  if (type === 'RUN') {
    const { strategyName, watchlist, marketData } = payload;
    try {
      const StrategyClass = strategies[strategyName] || strategies.BEST_PERFORMER;
      const strategy = new StrategyClass();
      const report = strategy.analyze(watchlist, marketData);
      self.postMessage({ type: 'ANALYSIS_REPORT', payload: report });
    } catch (err) {
      self.postMessage({ type: 'ERROR', payload: { id: crypto.randomUUID(), type: 'error', message: err.message || String(err) } });
    }
  }
};
