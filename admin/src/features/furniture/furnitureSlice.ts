import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '@/services/api';
import { Furniture, FurnitureCategory } from '@/types/design.types';

interface FurnitureState {
  furniture: Furniture[];
  categories: FurnitureCategory[];
  selectedCategory: FurnitureCategory | 'all';
  searchTerm: string;
  isLoading: boolean;
  isSaving: boolean;
  isLoadingCategories: boolean;
  isCreatingCategory: boolean;
  deletingId: string | null;
  error: string | null;
}

const initialState: FurnitureState = {
  furniture: [],
  categories: [],
  selectedCategory: 'all',
  searchTerm: '',
  isLoading: false,
  isSaving: false,
  isLoadingCategories: false,
  isCreatingCategory: false,
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

export interface FurnitureCategoryDto {
  _id: string;
  slug: string;
  label: string;
}

export const fetchFurnitureCategories = createAsyncThunk(
  'furniture/fetchFurnitureCategories',
  async (_: void, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: { categories: FurnitureCategoryDto[] } }>(
        '/furniture/categories'
      );
      return data.data.categories.map((c) => c.slug);
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const createFurnitureCategory = createAsyncThunk(
  'furniture/createFurnitureCategory',
  async ({ label }: { label: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ data: { category: FurnitureCategoryDto } }>(
        '/furniture/categories',
        { label }
      );
      return data.data.category.slug;
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

export interface UpdateFurnitureInput extends Partial<CreateFurnitureInput> {}

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

export const createFurnitureWithAssets = createAsyncThunk(
  'furniture/createFurnitureWithAssets',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ data: { furniture: Furniture } }>(
        '/furniture/with-assets',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
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
      .addCase(fetchFurnitureCategories.pending, (state) => {
        state.isLoadingCategories = true;
      })
      .addCase(fetchFurnitureCategories.fulfilled, (state, action) => {
        state.isLoadingCategories = false;
        state.categories = action.payload;
      })
      .addCase(fetchFurnitureCategories.rejected, (state, action) => {
        state.isLoadingCategories = false;
        state.error = action.payload as string;
      })
      .addCase(createFurnitureCategory.pending, (state) => {
        state.isCreatingCategory = true;
        state.error = null;
      })
      .addCase(createFurnitureCategory.fulfilled, (state, action) => {
        state.isCreatingCategory = false;
        const slug = action.payload;
        if (!state.categories.includes(slug)) {
          state.categories = [...state.categories, slug].sort((a, b) => a.localeCompare(b));
        }
      })
      .addCase(createFurnitureCategory.rejected, (state, action) => {
        state.isCreatingCategory = false;
        state.error = action.payload as string;
      })
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
      .addCase(createFurnitureWithAssets.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createFurnitureWithAssets.fulfilled, (state, action) => {
        state.isSaving = false;
        state.furniture.push(action.payload);
      })
      .addCase(createFurnitureWithAssets.rejected, (state, action) => {
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
