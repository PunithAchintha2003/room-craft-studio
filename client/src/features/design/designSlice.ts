import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { Design, CreateDesignInput, UpdateDesignInput } from '@/types/design.types';

interface DesignState {
  designs: Design[];
  currentDesign: Design | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: DesignState = {
  designs: [],
  currentDesign: null,
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
  async ({ id, updates }: { id: string; updates: UpdateDesignInput }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/designs/${id}`, updates);
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
    setCurrentDesign: (state, action: PayloadAction<Design | null>) => {
      state.currentDesign = action.payload;
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
        state.error = null;
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

export const { setCurrentDesign } = designSlice.actions;
export default designSlice.reducer;
