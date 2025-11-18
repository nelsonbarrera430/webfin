import { setLoginSuccess, logout as logoutAction } from '../store/authSlice.js';

export function renderAuth(store, apiService) {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  loginBtn.addEventListener('click', async () => {
    loginBtn.disabled = true;
    try {
      const email = prompt('Email:') || 'demo@webcrypto.local';
      const password = prompt('Password:') || 'demopass123';
      const data = await apiService.login(email, password);
      store.dispatch(setLoginSuccess(data));
      loginBtn.hidden = true;
      logoutBtn.hidden = false;
    } catch (err) {
      alert('Login error: ' + (err.message || String(err)));
    } finally {
      loginBtn.disabled = false;
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await apiService.logout();
    store.dispatch(logoutAction());
    logoutBtn.hidden = true;
    loginBtn.hidden = false;
  });
}
