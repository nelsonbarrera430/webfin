import { setLoginSuccess, logout as logoutAction } from '../store/authSlice.js';
// Importa las acciones del slice de autenticación:
// - setLoginSuccess: para guardar usuario y token tras login.
// - logoutAction: para limpiar el estado de autenticación al cerrar sesión.

export function renderAuth(store, apiService) {
  // Función que renderiza la lógica de autenticación en la UI.
  // Recibe el store de Redux y el servicio apiService (Singleton).

  const loginBtn = document.getElementById('loginBtn');
  // Obtiene referencia al botón de login en el DOM.

  const logoutBtn = document.getElementById('logoutBtn');
  // Obtiene referencia al botón de logout en el DOM.

  // Listener para el botón de login
  loginBtn.addEventListener('click', async () => {
    loginBtn.disabled = true; // Desactiva el botón mientras se procesa el login.
    try {
      const email = prompt('Email:') || 'demo@webcrypto.local';
      // Pide al usuario su email, si no lo da usa uno por defecto.

      const password = prompt('Password:') || 'demopass123';
      // Pide al usuario su contraseña, si no lo da usa una por defecto.

      const data = await apiService.login(email, password);
      // Llama al método login del apiService (Firebase Auth + Proxy).

      store.dispatch(setLoginSuccess(data));
      // Despacha la acción setLoginSuccess para guardar usuario y token en Redux.

      loginBtn.hidden = true;  // Oculta el botón de login tras éxito.
      logoutBtn.hidden = false; // Muestra el botón de logout.
    } catch (err) {
      // Si ocurre un error en el login, muestra alerta.
      alert('Login error: ' + (err.message || String(err)));
    } finally {
      loginBtn.disabled = false; // Reactiva el botón de login.
    }
  });

  // Listener para el botón de logout
  logoutBtn.addEventListener('click', async () => {
    await apiService.logout();
    // Llama al método logout del apiService (Firebase signOut).

    store.dispatch(logoutAction());
    // Despacha la acción logoutAction para limpiar el estado de autenticación.

    logoutBtn.hidden = true; // Oculta el botón de logout.
    loginBtn.hidden = false; // Muestra nuevamente el botón de login.
  });
}
