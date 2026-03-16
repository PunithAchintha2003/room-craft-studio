import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import api from '@/services/api';
import type {
  DashboardSummary,
  DesignDashboardSummary,
  FurnitureDashboardSummary,
} from '@/types/dashboard.types';

export type { TimeSeriesPoint, DesignDashboardSummary, FurnitureCategoryCount, FurnitureDashboardSummary, DashboardSummary } from '@/types/dashboard.types';

interface DashboardState {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  isLoading: false,
  error: null,
};

const handleError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? 'An unexpected error occurred';
  }
  return 'An unexpected error occurred';
};

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchDashboardSummary',
  async (_, { rejectWithValue }) => {
    try {
      const [designRes, furnitureRes] = await Promise.all([
        api.get<{ data: { summary: DesignDashboardSummary } }>('/designs/dashboard-summary'),
        api.get<{ data: { summary: FurnitureDashboardSummary } }>('/furniture/dashboard-summary'),
      ]);

      return {
        design: designRes.data.data.summary,
        furniture: furnitureRes.data.data.summary,
      } as DashboardSummary;
    } catch (error) {
      return rejectWithValue(handleError(error));
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;

export const selectDashboardSummary = (state: { dashboard: DashboardState }) => state.dashboard.summary;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) => state.dashboard.isLoading;
export const selectDashboardError = (state: { dashboard: DashboardState }) => state.dashboard.error;

export default dashboardSlice.reducer;

