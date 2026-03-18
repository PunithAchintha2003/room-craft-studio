import { Furniture, IFurniture } from '../models/furniture.model';
import type { SortOrder } from 'mongoose';
import { AppError } from '../utils/AppError';
import { IFurnitureInput, FurnitureCategory } from '../types/design.types';
import { Design } from '../models/design.model';
import { ensureCategoryExists } from './furnitureCategory.service';

export const createFurniture = async (input: IFurnitureInput): Promise<IFurniture> => {
  await ensureCategoryExists(input.category);
  const furniture = await Furniture.create(input);
  return furniture;
};

export const getAllFurniture = async (category?: FurnitureCategory): Promise<IFurniture[]> => {
  const query = category ? { category } : {};
  const furniture = await Furniture.find(query).sort({ category: 1, name: 1 });
  return furniture;
};

export const getFurnitureById = async (furnitureId: string): Promise<IFurniture> => {
  const furniture = await Furniture.findById(furnitureId);

  if (!furniture) {
    throw new AppError('Furniture item not found', 404);
  }

  return furniture;
};

export const updateFurniture = async (
  furnitureId: string,
  input: Partial<IFurnitureInput>
): Promise<IFurniture> => {
  const furniture = await Furniture.findByIdAndUpdate(
    furnitureId,
    input,
    { new: true, runValidators: true }
  );

  if (!furniture) {
    throw new AppError('Furniture item not found', 404);
  }

  return furniture;
};

export interface UpdateThumbnailInput {
  url: string;
  thumbnailAlt?: string;
}

export const updateFurnitureThumbnail = async (
  furnitureId: string,
  input: UpdateThumbnailInput
): Promise<IFurniture> => {
  const update: { thumbnail: string; thumbnailAlt?: string } = {
    thumbnail: input.url,
  };
  if (input.thumbnailAlt !== undefined) {
    update.thumbnailAlt = input.thumbnailAlt;
  }
  const furniture = await Furniture.findByIdAndUpdate(
    furnitureId,
    update,
    { new: true, runValidators: true }
  );

  if (!furniture) {
    throw new AppError('Furniture item not found', 404);
  }

  return furniture;
};

export const deleteFurniture = async (furnitureId: string): Promise<void> => {
  const inUse = await Design.exists({ 'furniture.furnitureId': furnitureId });
  if (inUse) {
    throw new AppError(
      'Cannot delete furniture that is used in one or more designs. Remove it from those designs first.',
      400
    );
  }

  const furniture = await Furniture.findByIdAndDelete(furnitureId);

  if (!furniture) {
    throw new AppError('Furniture item not found', 404);
  }
};

export const searchFurniture = async (
  searchTerm: string,
  category?: FurnitureCategory,
  minPrice?: number,
  maxPrice?: number
): Promise<IFurniture[]> => {
  const query: Record<string, unknown> = {};

  if (searchTerm) {
    query.name = { $regex: searchTerm, $options: 'i' };
  }

  if (category) {
    query.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) {
      (query.price as Record<string, number>).$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      (query.price as Record<string, number>).$lte = maxPrice;
    }
  }

  const furniture = await Furniture.find(query).sort({ name: 1 });
  return furniture;
};

export interface FurnitureCategoryCount {
  category: FurnitureCategory;
  count: number;
}

export interface FurnitureDashboardSummary {
  totalFurnitureItems: number;
  furnitureByCategory: FurnitureCategoryCount[];
}

export const getFurnitureDashboardSummary = async (): Promise<FurnitureDashboardSummary> => {
  const totalFurnitureItems = await Furniture.countDocuments();

  const raw = await Furniture.aggregate<{ _id: FurnitureCategory; count: number }>([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const furnitureByCategory: FurnitureCategoryCount[] = raw.map((item) => ({
    category: item._id,
    count: item.count,
  }));

  return {
    totalFurnitureItems,
    furnitureByCategory,
  };
};

export const getFeaturedFurniture = async (limit = 8): Promise<IFurniture[]> => {
  const furniture = await Furniture.find({ featured: true })
    .sort({ createdAt: -1 })
    .limit(limit);
  return furniture;
};

export const getRelatedFurniture = async (furnitureId: string, limit = 4): Promise<IFurniture[]> => {
  const currentItem = await getFurnitureById(furnitureId);
  
  const furniture = await Furniture.find({
    _id: { $ne: furnitureId },
    category: currentItem.category,
  })
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(limit);
  
  return furniture;
};

export interface AdvancedSearchFilters {
  search?: string;
  category?: FurnitureCategory;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  tags?: string[];
}

export interface AdvancedSearchOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface AdvancedSearchResult {
  furniture: IFurniture[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const advancedSearch = async (
  filters: AdvancedSearchFilters,
  options: AdvancedSearchOptions
): Promise<AdvancedSearchResult> => {
  const query: Record<string, unknown> = {};

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined) {
      (query.price as Record<string, number>).$gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      (query.price as Record<string, number>).$lte = filters.maxPrice;
    }
  }

  if (filters.minRating !== undefined) {
    query.averageRating = { $gte: filters.minRating };
  }

  if (filters.inStock) {
    query.stock = { $gt: 0 };
  }

  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  const skip = (options.page - 1) * options.limit;
  const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
  const sortOptions: Record<string, SortOrder> = { [options.sortBy]: sortOrder };

  const [furniture, total] = await Promise.all([
    Furniture.find(query).sort(sortOptions).skip(skip).limit(options.limit),
    Furniture.countDocuments(query),
  ]);

  return {
    furniture,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      pages: Math.ceil(total / options.limit),
    },
  };
};

