import type { FurnitureCategory } from './design.types';

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface DesignDashboardSummary {
  totalDesigns: number;
  designsPerDay: TimeSeriesPoint[];
}

export interface FurnitureCategoryCount {
  category: FurnitureCategory;
  count: number;
}

export interface FurnitureDashboardSummary {
  totalFurnitureItems: number;
  furnitureByCategory: FurnitureCategoryCount[];
}

export interface DashboardSummary {
  design: DesignDashboardSummary;
  furniture: FurnitureDashboardSummary;
}
