import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import api from '@/services/api';
import { AuthState, LoginInput, User, ApiError } from '@/types/auth.types';

const initialState: AuthState = {
  user: null,
  accessToken: Cookies.get('designerAccessToken') || null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

const handleError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    return data?.message ?? 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};

export const designerLogin = createAsyncThunk(
  'auth/designerLogin',
  async (input: LoginInput, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ data: { user: User; accessToken: string } }>(
        '/auth/designer/login',
        input
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const designerLogout = createAsyncThunk(
  'auth/designerLogout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

export const fetchDesignerUser = createAsyncThunk(
  'auth/fetchDesignerUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: { user: User } }>('/auth/me');
      return data.data.user;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      Cookies.remove('designerAccessToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(designerLogin.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(designerLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        Cookies.set('designerAccessToken', action.payload.accessToken, { expires: 1 / 96 });
      })
      .addCase(designerLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(designerLogout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        Cookies.remove('designerAccessToken');
      })
      .addCase(fetchDesignerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchDesignerUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
