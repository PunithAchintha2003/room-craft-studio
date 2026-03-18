import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '@/services/api';
import { Furniture, FurnitureCategory } from '@/types/design.types';

interface FurnitureState {
  furniture: Furniture[];
  selectedCategory: FurnitureCategory | 'all';
  searchTerm: string;
  isLoading: boolean;
  isSaving: boolean;
  deletingId: string | null;
  error: string | null;
}

const initialState: FurnitureState = {
  furniture: [],
  selectedCategory: 'all',
  searchTerm: '',
  isLoading: false,
  isSaving: false,
  deletingId: null,
  error: null,
};

const handleError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};

export const fetchFurniture = createAsyncThunk(
  'furniture/fetchFurniture',
  async (category: FurnitureCategory | undefined, { rejectWithValue }) => {
    try {
      const params = category ? { category } : {};
      const { data } = await api.get<{ data: { furniture: Furniture[] } }>('/furniture', { params });
      return data.data.furniture;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const searchFurniture = createAsyncThunk(
  'furniture/searchFurniture',
  async (
    { search, category }: { search?: string; category?: FurnitureCategory },
    { rejectWithValue }
  ) => {
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (category) params.category = category;
      
      const { data } = await api.get<{ data: { furniture: Furniture[] } }>('/furniture/search', { params });
      return data.data.furniture;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export interface UpdateThumbnailPayload {
  formData: FormData;
  furnitureId: string;
}

export const updateFurnitureThumbnail = createAsyncThunk(
  'furniture/updateFurnitureThumbnail',
  async (
    { furnitureId, formData }: UpdateThumbnailPayload,
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.patch<{ data: { furniture: Furniture } }>(
        `/furniture/${furnitureId}/thumbnail`,
        formData
      );
      return data.data.furniture;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export interface CreateFurnitureInput {
  name: string;
  category: FurnitureCategory;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  thumbnail: string;
  thumbnailAlt?: string;
  model3D: {
    url: string;
    format: 'gltf' | 'glb';
  };
  defaultColor: string;
  isColorizable: boolean;
  price: number;
  stock: number;
}

export type UpdateFurnitureInput = Partial<CreateFurnitureInput>;

export const createFurniture = createAsyncThunk(
  'furniture/createFurniture',
  async (input: CreateFurnitureInput, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ data: { furniture: Furniture } }>('/furniture', input);
      return data.data.furniture;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const updateFurniture = createAsyncThunk(
  'furniture/updateFurniture',
  async (
    { id, input }: { id: string; input: UpdateFurnitureInput },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.put<{ data: { furniture: Furniture } }>(`/furniture/${id}`, input);
      return data.data.furniture;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const deleteFurniture = createAsyncThunk(
  'furniture/deleteFurniture',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/furniture/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

const furnitureSlice = createSlice({
  name: 'furniture',
  initialState,
  reducers: {
    setSelectedCategory(state, action) {
      state.selectedCategory = action.payload;
    },
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFurniture.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFurniture.fulfilled, (state, action) => {
        state.isLoading = false;
        state.furniture = action.payload;
      })
      .addCase(fetchFurniture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(searchFurniture.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchFurniture.fulfilled, (state, action) => {
        state.isLoading = false;
        state.furniture = action.payload;
      })
      .addCase(searchFurniture.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateFurnitureThumbnail.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.furniture.findIndex((f) => f._id === updated._id);
        if (index !== -1) {
          state.furniture[index] = updated;
        }
      })
      .addCase(createFurniture.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createFurniture.fulfilled, (state, action) => {
        state.isSaving = false;
        state.furniture.push(action.payload);
      })
      .addCase(createFurniture.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      .addCase(updateFurniture.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateFurniture.fulfilled, (state, action) => {
        state.isSaving = false;
        const updated = action.payload;
        const index = state.furniture.findIndex((f) => f._id === updated._id);
        if (index !== -1) {
          state.furniture[index] = updated;
        }
      })
      .addCase(updateFurniture.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      .addCase(deleteFurniture.pending, (state, action) => {
        state.deletingId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteFurniture.fulfilled, (state, action) => {
        state.deletingId = null;
        state.furniture = state.furniture.filter((f) => f._id !== action.payload);
      })
      .addCase(deleteFurniture.rejected, (state, action) => {
        state.deletingId = null;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedCategory, setSearchTerm, clearError } = furnitureSlice.actions;
export default furnitureSlice.reducer;
