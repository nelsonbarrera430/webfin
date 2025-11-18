import { setSelectedAsset } from '../store/uiSlice.js';

export function renderSearch(store, facade) {
  const input = document.getElementById('searchInput');
  const resultsEl = document.getElementById('searchResults');

  let typingTimer = null;

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      facade.searchAssets(q);
    }, 250);
  });

  resultsEl.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    const id = li.getAttribute('data-id');
    store.dispatch(setSelectedAsset(id));
  });

  store.subscribe(() => {
    const { ui } = store.getState();
    resultsEl.innerHTML = '';
    ui.searchResults.forEach(r => {
      const li = document.createElement('li');
      li.textContent = `${r.name} (${r.symbol})`;
      li.setAttribute('data-id', r.id);
      resultsEl.appendChild(li);
    });
  });
}
