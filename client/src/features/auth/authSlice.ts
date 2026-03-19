import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import api from '@/services/api';
import { AuthState, LoginInput, RegisterInput, User, ApiError } from '@/types/auth.types';

const initialState: AuthState = {
  user: null,
  accessToken: Cookies.get('accessToken') || sessionStorage.getItem('accessToken') || null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

const handleAuthError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    return data?.message ?? 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (input: Omit<RegisterInput, 'confirmPassword'>, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ data: { user: User; accessToken: string } }>(
        '/auth/register',
        input
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (input: LoginInput, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ data: { user: User; accessToken: string } }>(
        '/auth/login',
        { email: input.email, password: input.password }
      );
      return { ...data.data, rememberMe: input.rememberMe };
    } catch (error) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    return rejectWithValue(handleAuthError(error));
  }
});

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: { user: User } }>('/auth/me');
      return data.data.user;
    } catch (error) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export interface UpdateProfileInput {
  name: string;
  email: string;
}

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (input: UpdateProfileInput, { rejectWithValue }) => {
    try {
      const { data } = await api.patch<{ data: { user: User } }>('/auth/profile', input);
      return data.data.user;
    } catch (error) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (input: ChangePasswordInput, { rejectWithValue }) => {
    try {
      await api.post('/auth/change-password', {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      });
    } catch (error) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setCredentials(state, action: PayloadAction<{ user: User; accessToken: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      Cookies.remove('accessToken');
      sessionStorage.removeItem('accessToken');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        Cookies.set('accessToken', action.payload.accessToken, { expires: 1 / 96 });
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        if (action.payload.rememberMe) {
          Cookies.set('accessToken', action.payload.accessToken, { expires: 7 });
        } else {
          sessionStorage.setItem('accessToken', action.payload.accessToken);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        Cookies.remove('accessToken');
        sessionStorage.removeItem('accessToken');
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
