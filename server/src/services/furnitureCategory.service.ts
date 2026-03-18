import { FurnitureCategory, IFurnitureCategory } from '../models/furnitureCategory.model';
import { AppError } from '../utils/AppError';

const slugify = (label: string): string => {
  const cleaned = label
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
  return cleaned;
};

export const listCategories = async (): Promise<IFurnitureCategory[]> => {
  return FurnitureCategory.find({}).sort({ label: 1 });
};

export const createCategory = async (label: string): Promise<IFurnitureCategory> => {
  const slug = slugify(label);
  if (!slug) {
    throw new AppError('Category name is required.', 400);
  }

  const existing = await FurnitureCategory.findOne({ slug });
  if (existing) {
    return existing;
  }

  return FurnitureCategory.create({ slug, label: label.trim() });
};

export const ensureCategoryExists = async (slug: string): Promise<void> => {
  const normalized = String(slug ?? '').trim().toLowerCase();
  if (!normalized) {
    throw new AppError('Category is required.', 400);
  }
  const exists = await FurnitureCategory.exists({ slug: normalized });
  if (!exists) {
    throw new AppError(`Unknown category "${slug}". Add it first.`, 400);
  }
};

