import { createSlice } from '@reduxjs/toolkit';

// Define el estado inicial (initialState) del slice.
const initialState = {
    // assets: Objeto para almacenar la lista de criptomonedas normalizada (por su símbolo).
    assets: {}, // Caché normalizado: { 'BTC': { id: '1182', symbol: 'BTC', name: 'Bitcoin' }, ... }
    // status: Indica el estado de la carga de datos.
    status: 'inactive', // 'inactive' | 'loading' | 'succeeded'
};

// Crea un "slice" de Redux, que incluye el nombre, el estado inicial y los reducers.
const assetsSlice = createSlice({
    name: 'assets', // Nombre usado como prefijo para las acciones (ej: 'assets/setAssetsLoading')
    initialState, // Estado inicial definido arriba
    reducers: { // Objeto que define las funciones que manejan las acciones y modifican el estado.
        // Reducer para iniciar la carga de activos.
        setAssetsLoading(state) {
            state.status = 'loading'; // Mutación segura (gracias a Immer) para indicar que la carga está en curso.
        },
        // Reducer para guardar los activos una vez que la API ha respondido con éxito.
        setAssetsSuccess(state, action) {
            // Recibe el objeto 'Data' de la API de CryptoCompare
            const apiData = action.payload;
            const normalizedAssets = {}; // Objeto vacío para construir el estado normalizado.
            
            // Itera sobre el objeto de datos brutos de la API.
            for (const key in apiData) {
                const coin = apiData[key];
                // Usamos el SÍMBOLO (key) como ID principal en nuestra app
                // Normaliza los datos: convierte el array/objeto plano de la API en un objeto mapeado por clave (Symbol).
                normalizedAssets[coin.Symbol] = {
                    id: coin.Id, // ID único de CryptoCompare
                    symbol: coin.Symbol, // Símbolo de la moneda (Ej: BTC)
                    name: coin.CoinName, // Nombre completo (Ej: Bitcoin)
                    imageUrl: `https://www.cryptocompare.com${coin.ImageUrl}`, // Construye la URL completa de la imagen
                };
            }
            
            state.assets = normalizedAssets; // Reemplaza el caché de activos con los datos normalizados.
            state.status = 'succeeded'; // Cambia el estado a exitoso.
        },
    },
});

// Exporta las funciones de acción generadas automáticamente por createSlice.
export const { setAssetsLoading, setAssetsSuccess } = assetsSlice.actions;
// Exporta el reducer principal para ser combinado en la store de Redux.
export default assetsSlice.reducer;