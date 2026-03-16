import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import designReducer from '@/features/design/designSlice';
import furnitureReducer from '@/features/furniture/furnitureSlice';
import editorReducer from '@/features/editor/editorSlice';
import dashboardReducer from '@/features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    design: designReducer,
    furniture: furnitureReducer,
    editor: editorReducer,
    dashboard: dashboardReducer,
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
