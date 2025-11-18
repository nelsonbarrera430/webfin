// Patrón Singleton para gestionar la API de autenticación y datos de usuario

// Instancia única
let instance = null;

export class ApiService {
    
    constructor(store) {
        // Prevenir múltiples instancias
        if (instance) {
            return instance;
        }

        this.store = store; // Referencia al store de Redux
        this.reqResBaseUrl = 'https://reqres.in/api';
        this.jsonPBaseUrl = 'https://jsonplaceholder.typicode.com';
        
        // El token se gestiona a través del authSlice
        
        // ¡NUEVO! Header requerido por ReqRes.in según la documentación
        this.reqResHeaders = {
            'Content-Type': 'application/json',
            'x-api-key': 'reqres-free-v1' // Añadido según tu documentación
        };

        instance = this;
    }

    /**
     * Maneja la respuesta de fetch, lanzando un error si no es OK.
     */
    async _handleResponse(response) {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Error ${response.status}`);
        }
        // DELETE no devuelve contenido, pero sí un 204
        if (response.status === 204) {
            return;
        }
        return response.json();
    }

    /**
     * Realiza el login contra ReqRes.in
     * (POST /api/login)
     */
    async login(email, password) {
        const url = `${this.reqResBaseUrl}/login`;
        const response = await fetch(url, {
            method: 'POST',
            headers: this.reqResHeaders, // Usar los headers actualizados
            body: JSON.stringify({ email, password }),
        });
        return this._handleResponse(response);
    }

    /**
     * Obtiene el perfil de un usuario de ReqRes.in
     * (GET /api/users/{id})
     */
    async getUserProfile(id) {
        const url = `${this.reqResBaseUrl}/users/${id}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: this.reqResHeaders, // Usar los headers actualizados
        });
        return this._handleResponse(response);
    }

    /**
     * Simula la carga de la watchlist desde JSONPlaceholder
     * (GET /users/{id}/posts)
     */
    async getWatchlist(userId) {
        const url = `${this.jsonPBaseUrl}/users/${userId}/posts`;
        const response = await fetch(url);
        return this._handleResponse(response);
    }
}