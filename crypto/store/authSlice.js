import { createSlice } from '@reduxjs/toolkit';

// Define el estado inicial (initialState) del slice de autenticación.
const initialState = {
    // user: Almacenará los datos del perfil del usuario (nombre, email, etc.) al iniciar sesión.
    user: null, // Almacenará { id, email, first_name, last_name, avatar }
    // token: Almacenará el token de sesión devuelto por el servidor tras el login.
    token: null,
    // status: Indica el estado actual del proceso de autenticación.
    status: 'inactive', // 'inactive' | 'loading' | 'succeeded' | 'failed'
};

// Crea un "slice" de Redux para la gestión de la autenticación.
const authSlice = createSlice({
    name: 'auth', // Nombre usado como prefijo para las acciones (ej: 'auth/setLoginLoading').
    initialState, // Estado inicial definido arriba.
    reducers: { // Objeto que define las funciones para actualizar el estado inmutablemente.
        
        // Reducer para indicar que el proceso de login ha comenzado.
        setLoginLoading(state) {
            state.status = 'loading'; // Mutación segura (gracias a Immer) para cambiar el estado.
        },
        
        // Reducer para gestionar un login exitoso.
        setLoginSuccess(state, action) {
            state.status = 'succeeded'; // Indica que la autenticación fue exitosa.
            // Asigna los datos del perfil del usuario recibidos en el payload de la acción.
            state.user = action.payload.user; // Espera { user: profileData }
            // Asigna el token de sesión recibido en el payload.
            state.token = action.payload.token;
        },
        
        // Reducer para gestionar un login fallido.
        setLoginFailed(state) {
            state.status = 'failed'; // Indica que la autenticación falló.
            state.user = null; // Limpia los datos de usuario.
            state.token = null; // Limpia el token.
        },
        
        // Reducer para realizar el cierre de sesión (Logout).
        setLogout(state) {
            state.status = 'inactive'; // Restablece el estado a inactivo.
            state.user = null; // Limpia los datos de usuario.
            state.token = null; // Limpia el token.
        },
    },
});

// Exporta las funciones de acción generadas automáticamente por createSlice.
export const { setLoginLoading, setLoginSuccess, setLoginFailed, setLogout } = authSlice.actions;
// Exporta el reducer principal para ser combinado en la store de Redux.
export default authSlice.reducer;