import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '@/services/api';
import { Design, CreateDesignInput, UpdateDesignInput, FurnitureItem } from '@/types/design.types';

interface DesignState {
  designs: Design[];
  currentDesign: Design | null;
  history: Design[];
  historyIndex: number;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: DesignState = {
  designs: [],
  currentDesign: null,
  history: [],
  historyIndex: -1,
  isLoading: false,
  isSaving: false,
  error: null,
};

const handleError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string; errors?: unknown } | undefined;
    const msg = data?.message ?? 'An unexpected error occurred';
    if (data?.errors && typeof data.errors === 'object') {
      // Flatten common `{ field: [messages...] }` shape into a readable line.
      try {
        const entries = Object.entries(data.errors as Record<string, unknown>)
          .flatMap(([field, v]) => {
            if (Array.isArray(v)) return v.map(m => `${field}: ${String(m)}`);
            if (v == null) return [];
            return [`${field}: ${String(v)}`];
          })
          .filter(Boolean);
        if (entries.length) return `${msg} — ${entries.join(' · ')}`;
      } catch {
        // fall through
      }
    }
    return msg;
  }
  return 'An unexpected error occurred';
};

export const fetchDesigns = createAsyncThunk(
  'design/fetchDesigns',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: { designs: Design[] } }>('/designs');
      return data.data.designs;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const fetchDesignById = createAsyncThunk(
  'design/fetchDesignById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: { design: Design } }>(`/designs/${id}`);
      return data.data.design;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const createDesign = createAsyncThunk(
  'design/createDesign',
  async (input: CreateDesignInput, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ data: { design: Design } }>('/designs', input);
      return data.data.design;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const updateDesign = createAsyncThunk(
  'design/updateDesign',
  async ({ id, input }: { id: string; input: UpdateDesignInput }, { rejectWithValue }) => {
    try {
      const { data } = await api.put<{ data: { design: Design } }>(`/designs/${id}`, input);
      return data.data.design;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const deleteDesign = createAsyncThunk(
  'design/deleteDesign',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/designs/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const duplicateDesign = createAsyncThunk(
  'design/duplicateDesign',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ data: { design: Design } }>(`/designs/${id}/duplicate`);
      return data.data.design;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
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
        const newItem = {
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
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDesigns.fulfilled, (state, action) => {
        state.isLoading = false;
        state.designs = action.payload;
      })
      .addCase(fetchDesigns.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDesignById.fulfilled, (state, action) => {
        state.currentDesign = action.payload;
        state.history = [action.payload];
        state.historyIndex = 0;
      })
      .addCase(createDesign.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createDesign.fulfilled, (state, action) => {
        state.isSaving = false;
        state.designs.unshift(action.payload);
        state.currentDesign = action.payload;
      })
      .addCase(createDesign.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      .addCase(updateDesign.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(updateDesign.fulfilled, (state, action) => {
        state.isSaving = false;
        const index = state.designs.findIndex(d => d._id === action.payload._id);
        if (index !== -1) {
          state.designs[index] = action.payload;
        }
        state.currentDesign = action.payload;
      })
      .addCase(updateDesign.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      .addCase(deleteDesign.fulfilled, (state, action) => {
        state.designs = state.designs.filter(d => d._id !== action.payload);
        if (state.currentDesign?._id === action.payload) {
          state.currentDesign = null;
        }
      })
      .addCase(duplicateDesign.fulfilled, (state, action) => {
        state.designs.unshift(action.payload);
      });
  },
});

export const {
  clearError,
  setCurrentDesign,
  updateCurrentDesign,
  undo,
  redo,
  addFurnitureToDesign,
  removeFurnitureFromDesign,
  updateFurnitureInDesign,
} = designSlice.actions;

export default designSlice.reducer;
