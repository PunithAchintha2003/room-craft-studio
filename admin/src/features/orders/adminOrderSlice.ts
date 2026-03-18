import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '@/services/api';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'failed'
  | 'refunded';

export interface AdminOrderItem {
  furnitureId: string;
  name: string;
  quantity: number;
  price: number;
  thumbnail: string;
}

export interface AdminOrder {
  _id: string;
  userId: string;
  orderNumber: string;
  items: AdminOrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  createdAt: string;
}

interface AdminOrderState {
  orders: AdminOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminOrderState = {
  orders: [],
  loading: false,
  error: null,
};

const handleError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (error.response?.data as any)?.message ?? 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};

export const fetchAdminOrders = createAsyncThunk(
  'adminOrders/fetchAdminOrders',
  async (params: { status?: OrderStatus } | undefined, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);

      const res = await api.get<{ data: { orders: AdminOrder[] } }>(
        `/orders/admin?${query.toString()}`
      );
      return res.data.data.orders;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const updateAdminOrderStatus = createAsyncThunk(
  'adminOrders/updateAdminOrderStatus',
  async (
    { orderId, status, note }: { orderId: string; status: OrderStatus; note?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch<{ data: AdminOrder }>(`/orders/${orderId}/status`, {
        status,
        note,
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

const adminOrderSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {
    clearAdminOrderError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action: PayloadAction<AdminOrder[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAdminOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdminOrderStatus.fulfilled, (state, action: PayloadAction<AdminOrder>) => {
        state.loading = false;
        const idx = state.orders.findIndex((o) => o._id === action.payload._id);
        if (idx !== -1) {
          state.orders[idx] = action.payload;
        }
      })
      .addCase(updateAdminOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAdminOrderError } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;

