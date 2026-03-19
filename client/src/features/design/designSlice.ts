import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { Design, CreateDesignInput, UpdateDesignInput, FurnitureItem } from '@/types/design.types';

interface DesignState {
  designs: Design[];
  currentDesign: Design | null;
  history: Design[];
  historyIndex: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: DesignState = {
  designs: [],
  currentDesign: null,
  history: [],
  historyIndex: -1,
  loading: false,
  saving: false,
  error: null,
};

export const fetchDesigns = createAsyncThunk(
  'design/fetchDesigns',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/designs');
      return response.data.data.designs;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch designs');
    }
  }
);

export const fetchDesignById = createAsyncThunk(
  'design/fetchDesignById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/designs/${id}`);
      return response.data.data.design;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch design');
    }
  }
);

export const fetchPublicDesign = createAsyncThunk(
  'design/fetchPublicDesign',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/designs/public/${id}`);
      return response.data.data.design;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch design');
    }
  }
);

export const fetchPreviewDesign = createAsyncThunk(
  'design/fetchPreviewDesign',
  async (furnitureId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/designs/preview?furnitureId=${furnitureId}`);
      return response.data.data.design;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch preview design');
    }
  }
);

export const createDesign = createAsyncThunk(
  'design/createDesign',
  async (input: CreateDesignInput, { rejectWithValue }) => {
    try {
      const response = await api.post('/designs', input);
      return response.data.data.design;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to create design');
    }
  }
);

export const updateDesign = createAsyncThunk(
  'design/updateDesign',
  async ({ id, input }: { id: string; input: UpdateDesignInput }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/designs/${id}`, input);
      return response.data.data.design;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update design');
    }
  }
);

export const deleteDesign = createAsyncThunk(
  'design/deleteDesign',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/designs/${id}`);
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete design');
    }
  }
);

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    setCurrentDesign(state, action: PayloadAction<Design | null>) {
      state.currentDesign = action.payload;
      if (action.payload) {
        state.history = [action.payload];
        state.historyIndex = 0;
      } else {
        state.history = [];
        state.historyIndex = -1;
      }
    },
    updateCurrentDesign(state, action: PayloadAction<Partial<Design>>) {
      if (state.currentDesign) {
        const updated = { ...state.currentDesign, ...action.payload };
        state.currentDesign = updated;
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push(updated);
        state.historyIndex++;
        if (state.history.length > 50) {
          state.history.shift();
          state.historyIndex--;
        }
      }
    },
    undo(state) {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.currentDesign = state.history[state.historyIndex];
      }
    },
    redo(state) {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.currentDesign = state.history[state.historyIndex];
      }
    },
    addFurnitureToDesign(
      state,
      action: PayloadAction<{
        furnitureId: string;
        position: { x: number; y: number };
        rotation?: number;
        scale?: number;
        color?: string;
      }>
    ) {
      if (state.currentDesign) {
        const newItem: FurnitureItem = {
          id: `furniture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          furnitureId: action.payload.furnitureId,
          position: action.payload.position,
          rotation: action.payload.rotation ?? 0,
          scale: action.payload.scale ?? 1,
          color: action.payload.color,
        };
        state.currentDesign.furniture.push(newItem);
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({ ...state.currentDesign });
        state.historyIndex++;
      }
    },
    removeFurnitureFromDesign(state, action: PayloadAction<string>) {
      if (state.currentDesign) {
        state.currentDesign.furniture = state.currentDesign.furniture.filter(
          item => item.id !== action.payload
        );
        state.history = state.history.slice(0, state.historyIndex + 1);
        state.history.push({ ...state.currentDesign });
        state.historyIndex++;
      }
    },
    updateFurnitureInDesign(
      state,
      action: PayloadAction<{ id: string; updates: Partial<FurnitureItem> }>
    ) {
      if (state.currentDesign) {
        const index = state.currentDesign.furniture.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.currentDesign.furniture[index] = {
            ...state.currentDesign.furniture[index],
            ...action.payload.updates,
          };
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDesigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesigns.fulfilled, (state, action) => {
        state.loading = false;
        state.designs = action.payload;
      })
      .addCase(fetchDesigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDesignById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesignById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDesign = action.payload;
        state.history = [action.payload];
        state.historyIndex = 0;
      })
      .addCase(fetchDesignById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPublicDesign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicDesign.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDesign = action.payload;
      })
      .addCase(fetchPublicDesign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPreviewDesign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPreviewDesign.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDesign = action.payload;
      })
      .addCase(fetchPreviewDesign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createDesign.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createDesign.fulfilled, (state, action) => {
        state.saving = false;
        state.designs.push(action.payload);
        state.currentDesign = action.payload;
      })
      .addCase(createDesign.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(updateDesign.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateDesign.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.designs.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) {
          state.designs[index] = action.payload;
        }
        state.currentDesign = action.payload;
      })
      .addCase(updateDesign.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      .addCase(deleteDesign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDesign.fulfilled, (state, action) => {
        state.loading = false;
        state.designs = state.designs.filter((d) => d._id !== action.payload);
        if (state.currentDesign?._id === action.payload) {
          state.currentDesign = null;
        }
      })
      .addCase(deleteDesign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentDesign,
  updateCurrentDesign,
  undo,
  redo,
  addFurnitureToDesign,
  removeFurnitureFromDesign,
  updateFurnitureInDesign,
} = designSlice.actions;
export default designSlice.reducer;
