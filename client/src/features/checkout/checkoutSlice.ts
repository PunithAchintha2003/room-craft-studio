import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CheckoutState {
  step: CheckoutStep;
  shippingAddress: ShippingAddress | null;
  billingAddress: ShippingAddress | null;
  useSameAddress: boolean;
  clientSecret: string | null;
  paymentIntentId: string | null;
  orderId: string | null;
  orderNumber: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  step: 'cart',
  shippingAddress: null,
  billingAddress: null,
  useSameAddress: true,
  clientSecret: null,
  paymentIntentId: null,
  orderId: null,
  orderNumber: null,
  loading: false,
  error: null,
};

// Thunks
export const createPaymentIntent = createAsyncThunk(
  'checkout/createPaymentIntent',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/payment/create-intent`,
        { orderId },
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment intent');
    }
  }
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCheckoutStep: (state, action: PayloadAction<CheckoutStep>) => {
      state.step = action.payload;
    },
    setShippingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      state.shippingAddress = action.payload;
    },
    setBillingAddress: (state, action: PayloadAction<ShippingAddress | null>) => {
      state.billingAddress = action.payload;
    },
    setUseSameAddress: (state, action: PayloadAction<boolean>) => {
      state.useSameAddress = action.payload;
      if (action.payload) {
        state.billingAddress = null;
      }
    },
    setOrderId: (state, action: PayloadAction<string>) => {
      state.orderId = action.payload;
    },
    setOrderNumber: (state, action: PayloadAction<string>) => {
      state.orderNumber = action.payload;
    },
    resetCheckout: (state) => {
      state.step = 'cart';
      state.shippingAddress = null;
      state.billingAddress = null;
      state.useSameAddress = true;
      state.clientSecret = null;
      state.paymentIntentId = null;
      state.orderId = null;
      state.orderNumber = null;
      state.error = null;
    },
    resetCheckoutError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create payment intent
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createPaymentIntent.fulfilled,
        (state, action: PayloadAction<{ clientSecret: string; paymentIntentId: string }>) => {
          state.loading = false;
          state.clientSecret = action.payload.clientSecret;
          state.paymentIntentId = action.payload.paymentIntentId;
        }
      )
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCheckoutStep,
  setShippingAddress,
  setBillingAddress,
  setUseSameAddress,
  setOrderId,
  setOrderNumber,
  resetCheckout,
  resetCheckoutError,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
