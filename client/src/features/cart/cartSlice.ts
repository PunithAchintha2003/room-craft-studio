import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface CartItem {
  _id?: string;
  furnitureId: {
    _id: string;
    name: string;
    thumbnail: string;
    price: number;
    category: string;
    stock: number;
    [key: string]: any;
  };
  quantity: number;
  selectedColor?: string;
  priceSnapshot: number;
}

export type ICartItem = CartItem;

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addingItem: boolean;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  addingItem: false,
};

// Thunks
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get<{ data: Cart }>('/cart');
    return data.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch cart'
    );
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    {
      furnitureId,
      quantity = 1,
      selectedColor,
    }: { furnitureId: string; quantity?: number; selectedColor?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post<{ data: Cart }>(
        '/cart/items',
        { furnitureId, quantity, selectedColor }
      );
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (
    {
      furnitureId,
      quantity,
      selectedColor,
    }: { furnitureId: string; quantity: number; selectedColor?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.patch<{ data: Cart }>(
        `/cart/items/${furnitureId}`,
        { quantity, selectedColor }
      );
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (furnitureId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.delete<{ data: Cart }>(`/cart/items/${furnitureId}`);
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.delete<{ data: Cart }>('/cart');
    return data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
  }
});

export const addDesignToCart = createAsyncThunk(
  'cart/addDesignToCart',
  async (designId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ data: { cart: Cart; addedCount: number } }>(
        `/cart/design/${designId}`,
        {}
      );
      return data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add design to cart');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add to cart
    builder
      .addCase(addToCart.pending, (state) => {
        state.addingItem = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.addingItem = false;
        state.cart = action.payload;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.addingItem = false;
        state.error = action.payload as string;
      });

    // Update cart item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove from cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Clear cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add design to cart
    builder
      .addCase(addDesignToCart.pending, (state) => {
        state.addingItem = true;
        state.error = null;
      })
      .addCase(addDesignToCart.fulfilled, (state, action: PayloadAction<{ cart: Cart; addedCount: number }>) => {
        state.addingItem = false;
        state.cart = action.payload.cart;
      })
      .addCase(addDesignToCart.rejected, (state, action) => {
        state.addingItem = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetCartError } = cartSlice.actions;
export default cartSlice.reducer;
