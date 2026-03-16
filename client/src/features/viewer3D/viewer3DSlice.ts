import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Viewer3DState {
  viewMode: '2d' | '3d';
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  showStats: boolean;
  loadingModels: string[]; // Furniture IDs currently loading
  modelErrors: Record<string, string>; // Failed model loads
  shadowsEnabled: boolean;
  ambientLight: number;
  directionalLight: number;
}

const initialState: Viewer3DState = {
  viewMode: '2d',
  cameraPosition: [5, 4, 5],
  cameraTarget: [0, 0, 0],
  showStats: false,
  loadingModels: [],
  modelErrors: {},
  shadowsEnabled: true,
  ambientLight: 0.5,
  directionalLight: 1.0,
};

const viewer3DSlice = createSlice({
  name: 'viewer3D',
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<'2d' | '3d'>) => {
      state.viewMode = action.payload;
    },
    toggleViewMode: (state) => {
      state.viewMode = state.viewMode === '2d' ? '3d' : '2d';
    },
    setCameraPosition: (state, action: PayloadAction<[number, number, number]>) => {
      state.cameraPosition = action.payload;
    },
    setCameraTarget: (state, action: PayloadAction<[number, number, number]>) => {
      state.cameraTarget = action.payload;
    },
    resetCamera: (state) => {
      state.cameraPosition = [5, 4, 5];
      state.cameraTarget = [0, 0, 0];
    },
    toggleStats: (state) => {
      state.showStats = !state.showStats;
    },
    toggleShadows: (state) => {
      state.shadowsEnabled = !state.shadowsEnabled;
    },
    setModelLoading: (state, action: PayloadAction<string>) => {
      if (!state.loadingModels.includes(action.payload)) {
        state.loadingModels.push(action.payload);
      }
    },
    setModelLoaded: (state, action: PayloadAction<string>) => {
      state.loadingModels = state.loadingModels.filter((id) => id !== action.payload);
      // Clear any error for this model
      if (state.modelErrors[action.payload]) {
        delete state.modelErrors[action.payload];
      }
    },
    setModelError: (state, action: PayloadAction<{ id: string; error: string }>) => {
      state.loadingModels = state.loadingModels.filter((id) => id !== action.payload.id);
      state.modelErrors[action.payload.id] = action.payload.error;
    },
    clearModelErrors: (state) => {
      state.modelErrors = {};
    },
    setAmbientLight: (state, action: PayloadAction<number>) => {
      state.ambientLight = action.payload;
    },
    setDirectionalLight: (state, action: PayloadAction<number>) => {
      state.directionalLight = action.payload;
    },
    resetViewer3D: () => initialState,
  },
});

export const {
  setViewMode,
  toggleViewMode,
  setCameraPosition,
  setCameraTarget,
  resetCamera,
  toggleStats,
  toggleShadows,
  setModelLoading,
  setModelLoaded,
  setModelError,
  clearModelErrors,
  setAmbientLight,
  setDirectionalLight,
  resetViewer3D,
} = viewer3DSlice.actions;

export default viewer3DSlice.reducer;
