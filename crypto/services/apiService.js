// Singleton ApiService: Firebase Auth + Proxy (CoinGecko + JSONPlaceholder)
// Este servicio centraliza todas las peticiones de red y se usa como Singleton en la app.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"; 
// Importa la función para inicializar Firebase

import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; 
// Importa funciones de autenticación de Firebase: obtener auth, login y logout

class ApiService {
  constructor() {
    this.proxyBase = "http://localhost:3000/api"; // Proxy para todas las peticiones (CoinGecko + JSONPlaceholder simulados)
    this.token = null; // Token de sesión (se guarda tras login)

    const firebaseConfig = {
      apiKey: "AIzaSyAdY3VmV0bXqxhRPp8aDkY7zBpBD0aNCmY", // Clave pública de Firebase
      authDomain: "webcrypto-ad10e.firebaseapp.com",     // Dominio de autenticación
      projectId: "webcrypto-ad10e",                      // ID del proyecto
      storageBucket: "webcrypto-ad10e.firebasestorage.app", // Bucket de almacenamiento
      messagingSenderId: "239476340130",                 // ID de mensajería
      appId: "1:239476340130:web:e416d34c8691d911f3eefb" // ID de la aplicación
    };
    this.app = initializeApp(firebaseConfig); // Inicializa la app Firebase con la configuración
    this.auth = getAuth(this.app);            // Obtiene el objeto de autenticación
  }

  setToken(t) { this.token = t; } // Setter para guardar el token en memoria

  // Firebase login
  login(email, password) {
    // Usa Firebase Auth para iniciar sesión con email y password
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(cred => {
        // Si el login es exitoso, construye un objeto usuario simulado
        const user = { id: 5, email: cred.user.email };
        // Genera un token basado en el UID de Firebase
        const token = "firebase_" + (cred.user.uid || "token");
        this.setToken(token); // Guarda el token en la instancia
        return { user, token }; // Devuelve usuario y token
      });
  }

  logout() { 
    // Cierra sesión en Firebase y limpia el token
    return signOut(this.auth).then(() => { this.token = null; }); 
  }

  // JSONPlaceholder (via proxy)
  getUserProfile(id) {
    // Obtiene perfil de usuario desde el proxy (simulando JSONPlaceholder)
    return fetch(`${this.proxyBase}/user/${id}`).then(r => r.json());
  }

  getWatchlist(id) {
    // Obtiene la watchlist del usuario desde el proxy
    return fetch(`${this.proxyBase}/watchlist/${id}`).then(r => r.json());
  }

  // CoinGecko boot load (via proxy)
  async fetchAllAssets() {
    // Carga todos los activos de criptomonedas desde el proxy
    const url = `${this.proxyBase}/assets`;
    const res = await fetch(url);
    return res.json(); // Devuelve la lista completa de activos
  }

  // CoinGecko precios y cambio 24h (via proxy)
  async fetchPrices(assetIds) {
    // Carga precios y cambios 24h para una lista de activos
    const ids = assetIds.join(",");
    const url = `${this.proxyBase}/price?ids=${ids}`;
    const res = await fetch(url);
    const data = await res.json();

    const prices = {};     // Diccionario de precios
    const changes24h = {}; // Diccionario de cambios 24h

    assetIds.forEach(id => {
      const entry = data[id]; // Busca cada activo en la respuesta
      if (entry) {
        prices[id] = Number(entry.usd ?? 0);              // Precio en USD
        changes24h[id] = Number(entry.usd_24h_change ?? 0); // Cambio en 24h
      }
    });
    return { prices, changes24h }; // Devuelve ambos diccionarios
  }

  // CoinGecko histórico (via proxy)
  async fetchDailyHistory(assetId, days = 365) {
    // Carga histórico de precios para un activo en un rango de días
    const url = `${this.proxyBase}/history/${assetId}?days=${days}`;
    const res = await fetch(url);
    const data = await res.json();

    // Convierte los datos en velas (candles) con fecha y precio
    const candles = (data?.prices || []).map(([ts, price]) => ({
      date: new Date(ts).toISOString().slice(0, 10), // Fecha en formato YYYY-MM-DD
      price_close: Number(price)                     // Precio de cierre
    }));
    return candles; // Devuelve el array de velas
  }
}

// Exporta una única instancia (Singleton) de ApiService
export const apiService = new ApiService();
