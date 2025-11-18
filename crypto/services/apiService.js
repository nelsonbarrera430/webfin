// Singleton ApiService: Firebase Auth + Proxy (CoinGecko + JSONPlaceholder)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

class ApiService {
  constructor() {
    this.proxyBase = "http://localhost:3000/api"; // Proxy para todo
    this.token = null;

    const firebaseConfig = {
      apiKey: "AIzaSyAdY3VmV0bXqxhRPp8aDkY7zBpBD0aNCmY",
      authDomain: "webcrypto-ad10e.firebaseapp.com",
      projectId: "webcrypto-ad10e",
      storageBucket: "webcrypto-ad10e.firebasestorage.app",
      messagingSenderId: "239476340130",
      appId: "1:239476340130:web:e416d34c8691d911f3eefb"
    };
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
  }

  setToken(t) { this.token = t; }

  // Firebase login
  login(email, password) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(cred => {
        const user = { id: 5, email: cred.user.email };
        const token = "firebase_" + (cred.user.uid || "token");
        this.setToken(token);
        return { user, token };
      });
  }

  logout() { return signOut(this.auth).then(() => { this.token = null; }); }

  // JSONPlaceholder (via proxy)
  getUserProfile(id) {
    return fetch(`${this.proxyBase}/user/${id}`).then(r => r.json());
  }

  getWatchlist(id) {
    return fetch(`${this.proxyBase}/watchlist/${id}`).then(r => r.json());
  }

  // CoinGecko boot load (via proxy)
  async fetchAllAssets() {
    const url = `${this.proxyBase}/assets`;
    const res = await fetch(url);
    return res.json();
  }

  // CoinGecko precios y cambio 24h (via proxy)
  async fetchPrices(assetIds) {
    const ids = assetIds.join(",");
    const url = `${this.proxyBase}/price?ids=${ids}`;
    const res = await fetch(url);
    const data = await res.json();
    const prices = {};
    const changes24h = {};
    assetIds.forEach(id => {
      const entry = data[id];
      if (entry) {
        prices[id] = Number(entry.usd ?? 0);
        changes24h[id] = Number(entry.usd_24h_change ?? 0);
      }
    });
    return { prices, changes24h };
  }

  // CoinGecko histórico (via proxy)
  async fetchDailyHistory(assetId, days = 365) {
    const url = `${this.proxyBase}/history/${assetId}?days=${days}`;
    const res = await fetch(url);
    const data = await res.json();
    const candles = (data?.prices || []).map(([ts, price]) => ({
      date: new Date(ts).toISOString().slice(0, 10),
      price_close: Number(price)
    }));
    return candles;
  }
}

export const apiService = new ApiService();
