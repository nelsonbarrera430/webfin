// Módulo para controlar la vista de autenticación

let onLoginSubmit = null;

export function initAuthView(loginCallback) {
    onLoginSubmit = loginCallback;
    
    const loginForm = document.getElementById('login-form');
    const authStatus = document.getElementById('auth-status');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        authStatus.textContent = 'Iniciando sesión...';
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        onLoginSubmit(email, password);
    });

    // Manejo del Logout (simplificado)
    document.getElementById('logout-button').addEventListener('click', () => {
        // En una app real, despacharíamos una acción de Redux
        // Aquí, simplemente recargamos para simular el logout
        window.location.reload();
    });
}

export function renderUserProfile(user) {
    const container = document.getElementById('user-profile');
    const template = document.getElementById('user-profile-template').content;
    const clone = template.cloneNode(true);
    
    clone.querySelector('img').src = user.avatar;
    clone.querySelector('span').textContent = `Hola, ${user.first_name}`;
    
    container.innerHTML = ''; // Limpiar
    container.appendChild(clone);
}