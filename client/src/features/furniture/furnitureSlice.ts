import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { Furniture, FurnitureCategory } from '@/types/design.types';

interface FurnitureState {
  furniture: Furniture[];
  selectedFurniture: Furniture | null;
  featuredFurniture: Furniture[];
  relatedFurniture: Furniture[];
  selectedCategory: FurnitureCategory | null;
  searchTerm: string;
  loading: boolean;
  error: string | null;
}

const initialState: FurnitureState = {
  furniture: [],
  selectedFurniture: null,
  featuredFurniture: [],
  relatedFurniture: [],
  selectedCategory: null,
  searchTerm: '',
  loading: false,
  error: null,
};

export const fetchFurniture = createAsyncThunk(
  'furniture/fetchFurniture',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/furniture');
      return response.data.data.furniture;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch furniture');
    }
  }
);

export const searchFurniture = createAsyncThunk(
  'furniture/searchFurniture',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/furniture/search?q=${query}`);
      return response.data.data.furniture;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to search furniture');
    }
  }
);

export const fetchFurnitureById = createAsyncThunk(
  'furniture/fetchFurnitureById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/furniture/${id}`);
      return response.data.data.furniture;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch furniture details');
    }
  }
);

export const fetchFeaturedFurniture = createAsyncThunk<
  Furniture[],
  number | undefined
>(
  'furniture/fetchFeaturedFurniture',
  async (limit, { rejectWithValue }) => {
    const count = limit ?? 8;
    try {
      const response = await api.get(`/furniture/featured?limit=${count}`);
      return response.data.data.furniture;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch featured furniture');
    }
  }
);

export const fetchRelatedFurniture = createAsyncThunk(
  'furniture/fetchRelatedFurniture',
  async ({ id, limit = 4 }: { id: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/furniture/${id}/related?limit=${limit}`);
      return response.data.data.furniture;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch related furniture');
    }
  }
);

const furnitureSlice = createSlice({
  name: 'furniture',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<FurnitureCategory | null>) => {
      state.selectedCategory = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFurniture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFurniture.fulfilled, (state, action) => {
        state.loading = false;
        state.furniture = action.payload;
      })
      .addCase(fetchFurniture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(searchFurniture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchFurniture.fulfilled, (state, action) => {
        state.loading = false;
        state.furniture = action.payload;
      })
      .addCase(searchFurniture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFurnitureById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFurnitureById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFurniture = action.payload;
      })
      .addCase(fetchFurnitureById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFeaturedFurniture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedFurniture.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredFurniture = action.payload;
      })
      .addCase(fetchFeaturedFurniture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRelatedFurniture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRelatedFurniture.fulfilled, (state, action) => {
        state.loading = false;
        state.relatedFurniture = action.payload;
      })
      .addCase(fetchRelatedFurniture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCategory, setSearchTerm } = furnitureSlice.actions;
export default furnitureSlice.reducer;
