import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import notificationReducer from '@/features/notifications/notificationSlice';
import designReducer from '@/features/design/designSlice';
import furnitureReducer from '@/features/furniture/furnitureSlice';
import viewer3DReducer from '@/features/viewer3D/viewer3DSlice';
import cartReducer from '@/features/cart/cartSlice';
import orderReducer from '@/features/order/orderSlice';
import wishlistReducer from '@/features/wishlist/wishlistSlice';
import checkoutReducer from '@/features/checkout/checkoutSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    design: designReducer,
    furniture: furnitureReducer,
    viewer3D: viewer3DReducer,
    cart: cartReducer,
    orders: orderReducer,
    wishlist: wishlistReducer,
    checkout: checkoutReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
