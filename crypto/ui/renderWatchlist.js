import { setSelectedAsset, addNotification } from '../store/uiSlice.js';

export function renderWatchlist(store) {
  const listEl = document.getElementById('watchlistList');

  function render() {
    const { watchlist } = store.getState();
    listEl.innerHTML = '';
    Object.keys(watchlist.items).forEach(id => {
      const li = document.createElement('li');
      li.textContent = id;
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => {
        store.dispatch(setSelectedAsset(id));
        store.dispatch(addNotification({ id: crypto.randomUUID(), type: 'info', message: `Seleccionado ${id}` }));
      });
      listEl.appendChild(li);
    });
  }

  store.subscribe(render);
}
