import { setSelectedAsset, addNotification } from '../store/uiSlice.js';
// Importa acciones del slice de UI:
// - setSelectedAsset: cambia el activo seleccionado en la interfaz.
// - addNotification: agrega una notificación al panel de la UI.

export function renderWatchlist(store) {
  // Función que renderiza la lista de seguimiento (watchlist) en la UI.
  // Recibe el store de Redux como parámetro.

  const listEl = document.getElementById('watchlistList');
  // Referencia al elemento <ul> o <div> en el DOM donde se mostrará la watchlist.

  function render() {
    // Función interna que dibuja la watchlist en la interfaz.
    const { watchlist } = store.getState(); // Obtiene el estado actual de la watchlist desde Redux.
    listEl.innerHTML = '';                  // Limpia el contenido previo de la lista.

    Object.keys(watchlist.items).forEach(id => {
      // Recorre cada activo en la watchlist (por su id).
      const li = document.createElement('li'); // Crea un nuevo elemento <li>.
      li.textContent = id;                     // Muestra el id del activo como texto.
      li.style.cursor = 'pointer';             // Cambia el cursor a "pointer" para indicar que es clicable.

      li.addEventListener('click', () => {
        // Listener que se activa al hacer clic en un activo de la watchlist.
        store.dispatch(setSelectedAsset(id)); 
        // Despacha acción para actualizar el activo seleccionado en Redux.

        store.dispatch(addNotification({ 
          // Despacha acción para agregar una notificación informativa.
          id: crypto.randomUUID(),             // Genera un id único para la notificación.
          type: 'info',                        // Tipo de notificación (informativa).
          message: `Seleccionado ${id}`        // Mensaje que indica qué activo fue seleccionado.
        }));
      });

      listEl.appendChild(li); // Agrega el <li> al contenedor de la lista en la UI.
    });
  }

  store.subscribe(render);
  // Suscribe la función render al store de Redux.
  // Cada vez que el estado cambie, se vuelve a dibujar la watchlist en la interfaz.
}
