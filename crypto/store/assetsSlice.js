import { createSlice } from '@reduxjs/toolkit';
// Importa la función createSlice de Redux Toolkit, que simplifica la creación de reducers y acciones.

const initialState = { assets: {} };
// Estado inicial del slice: un objeto vacío donde se almacenarán los activos (assets).

const assetsSlice = createSlice({
  name: 'assets',          // Nombre del slice, usado internamente por Redux.
  initialState,            // Estado inicial definido arriba.
  reducers: {              // Reducers: funciones que modifican el estado en respuesta a acciones.
    setAssets(state, action) {
      // Reducer para establecer la lista de activos en el estado.
      const map = {};       // Se crea un objeto temporal para mapear los activos por su id.
      action.payload.forEach(a => {
        // Recorre cada activo recibido en el payload (array de activos).
        if (a.id) map[a.id.toLowerCase()] = a;
        // Si el activo tiene id, se guarda en el map usando el id en minúsculas como clave.
      });
      state.assets = map;   // Finalmente, se asigna el objeto map al estado global de assets.
    }
  }
});

export const { setAssets } = assetsSlice.actions;
// Exporta la acción setAssets para poder despacharla desde otros módulos.

export default assetsSlice.reducer;
// Exporta el reducer del slice para integrarlo en el store principal.
