import { setSelectedAsset } from '../store/uiSlice.js';
// Importa la acción setSelectedAsset del slice de UI, que permite cambiar el activo seleccionado en la interfaz.

export function renderSearch(store, facade) {
  // Función que gestiona la lógica de búsqueda en la UI.
  // Recibe el store de Redux y el facade (que orquesta los workers).

  const input = document.getElementById('searchInput');
  // Referencia al campo de texto donde el usuario escribe la búsqueda.

  const resultsEl = document.getElementById('searchResults');
  // Referencia al contenedor (lista <ul>) donde se mostrarán los resultados de búsqueda.

  let typingTimer = null;
  // Temporizador usado para aplicar "debounce" (esperar un poco antes de ejecutar la búsqueda).

  input.addEventListener('input', () => {
    // Listener que se activa cada vez que el usuario escribe en el campo de búsqueda.
    const q = input.value.trim(); // Obtiene el texto escrito y elimina espacios.
    clearTimeout(typingTimer);    // Limpia cualquier temporizador previo.
    typingTimer = setTimeout(() => {
      facade.searchAssets(q);     // Llama al método del facade para ejecutar la búsqueda en el worker.
    }, 250);                      // Espera 250ms antes de lanzar la búsqueda (evita saturar la API).
  });

  resultsEl.addEventListener('click', (e) => {
    // Listener que se activa cuando el usuario hace clic en un resultado de búsqueda.
    const li = e.target.closest('li[data-id]'); // Busca el elemento <li> más cercano con atributo data-id.
    if (!li) return;                            // Si no se clicó sobre un resultado válido, no hace nada.
    const id = li.getAttribute('data-id');      // Obtiene el id del activo seleccionado.
    store.dispatch(setSelectedAsset(id));       // Despacha acción para actualizar el activo seleccionado en Redux.
  });

  store.subscribe(() => {
    // Se ejecuta cada vez que cambia el estado del store.
    const { ui } = store.getState();            // Obtiene el estado de la UI desde Redux.
    resultsEl.innerHTML = '';                   // Limpia la lista de resultados.
    ui.searchResults.forEach(r => {
      // Recorre los resultados de búsqueda y los renderiza como elementos <li>.
      const li = document.createElement('li');
      li.textContent = `${r.name} (${r.symbol})`; // Muestra nombre y símbolo del activo.
      li.setAttribute('data-id', r.id);           // Asigna el id como atributo data-id.
      resultsEl.appendChild(li);                  // Agrega el <li> a la lista de resultados.
    });
  });
}
