import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    assets: {}, // Caché normalizado: { 'BTC': { id: '1182', symbol: 'BTC', name: 'Bitcoin' }, ... }
    status: 'inactive', // 'inactive' | 'loading' | 'succeeded'
};

const assetsSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        setAssetsLoading(state) {
            state.status = 'loading';
        },
        setAssetsSuccess(state, action) {
            // Recibe el objeto 'Data' de la API de CryptoCompare
            const apiData = action.payload;
            const normalizedAssets = {};
            
            for (const key in apiData) {
                const coin = apiData[key];
                // Usamos el SÍMBOLO (key) como ID principal en nuestra app
                normalizedAssets[coin.Symbol] = {
                    id: coin.Id,
                    symbol: coin.Symbol,
                    name: coin.CoinName,
                    imageUrl: `https://www.cryptocompare.com${coin.ImageUrl}`,
                };
            }
            
            state.assets = normalizedAssets;
            state.status = 'succeeded';
        },
    },
});

export const { setAssetsLoading, setAssetsSuccess } = assetsSlice.actions;
export default assetsSlice.reducer;