import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import api from '@/services/api';

export interface WishlistItem {
  furnitureId: {
    _id: string;
    name: string;
    thumbnail: string;
    price: number;
    category: string;
    stock: number;
    [key: string]: any;
  };
  addedAt: string;
}

export interface Wishlist {
  _id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

interface WishlistState {
  wishlist: Wishlist | null;
  loading: boolean;
  error: string | null;
}

const EMPTY_WISHLIST_ITEMS: WishlistItem[] = [];

/** Memoized selector: returns stable array reference to avoid unnecessary rerenders. */
export const selectWishlistItems = createSelector(
  (state: RootState) => state.wishlist.wishlist?.items,
  (items) => items ?? EMPTY_WISHLIST_ITEMS
);

const initialState: WishlistState = {
  wishlist: null,
  loading: false,
  error: null,
};

// Thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: Wishlist }>('/wishlist');
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (furnitureId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ data: Wishlist }>(`/wishlist/items/${furnitureId}`, {
        furnitureId,
      });
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (furnitureId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete<{ data: Wishlist }>(`/wishlist/items/${furnitureId}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

export const checkWishlistItem = createAsyncThunk(
  'wishlist/checkWishlistItem',
  async (furnitureId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: { isInWishlist: boolean } }>(
        `/wishlist/check/${furnitureId}`
      );
      return { furnitureId, isInWishlist: data.data.isInWishlist };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch wishlist
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<Wishlist>) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add to wishlist
    builder
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action: PayloadAction<Wishlist>) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove from wishlist
    builder
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<Wishlist>) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
