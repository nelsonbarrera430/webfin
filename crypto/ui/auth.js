// ui/auth.js
// Módulo para controlar la vista de autenticación (Login/Logout) y renderizar el perfil de usuario.

let onLoginSubmit = null; // Variable para almacenar la función de callback de inicio de sesión de main.js

// Función principal para inicializar los listeners de la vista de autenticación.
// Recibe 'loginCallback' (la función que dispara la lógica de login del apiService en main.js).
export function initAuthView(loginCallback) {
    onLoginSubmit = loginCallback;
        
    const loginForm = document.getElementById('login-form');
    const authStatus = document.getElementById('auth-status'); // Elemento para mostrar el estado del login
    
    // 1. Listener para el envío del formulario de inicio de sesión.
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto de recarga del formulario.
        authStatus.textContent = 'Iniciando sesión...'; // Muestra un mensaje de carga al usuario.
        
        // Captura las credenciales de los campos de input.
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Llama a la función de callback proporcionada por main.js (que inicia la secuencia de login).
        onLoginSubmit(email, password);
    });

    // 2. Manejo del Logout (simplificado).
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            // En una aplicación real con Redux, se despacharía una acción
            // para limpiar el estado y el token.
            // Aquí, se simula el logout recargando la página para volver a la vista de login.
            window.location.reload();
        });
    }
}

// Función para renderizar el perfil del usuario en la cabecera del dashboard.
export function renderUserProfile(user) {
    const container = document.getElementById('user-profile');
    // Utiliza la etiqueta <template> para clonar la estructura HTML del perfil.
    const template = document.getElementById('user-profile-template').content;
    const clone = template.cloneNode(true);
    
    // Asigna los datos del usuario (avatar y nombre) a los elementos clonados.
    clone.querySelector('img').src = user.avatar;
    clone.querySelector('span').textContent = `Hola, ${user.first_name}`;
    
    container.innerHTML = ''; // Limpia el contenedor antes de inyectar el nuevo contenido.
    container.appendChild(clone);
}