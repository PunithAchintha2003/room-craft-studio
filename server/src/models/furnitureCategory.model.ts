import mongoose, { Document, Schema } from 'mongoose';

export interface IFurnitureCategory extends Document {
  slug: string;
  label: string;
  createdAt: Date;
  updatedAt: Date;
}

const furnitureCategorySchema = new Schema<IFurnitureCategory>(
  {
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
      lowercase: true,
      minlength: [1, 'Slug must be at least 1 character'],
      maxlength: [64, 'Slug cannot exceed 64 characters'],
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be kebab-case'],
      unique: true,
      index: true,
    },
    label: {
      type: String,
      required: [true, 'Category label is required'],
      trim: true,
      minlength: [2, 'Label must be at least 2 characters'],
      maxlength: [64, 'Label cannot exceed 64 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret['__v'];
        return ret;
      },
    },
  }
);

furnitureCategorySchema.index({ label: 1 });

export const FurnitureCategory = mongoose.model<IFurnitureCategory>(
  'FurnitureCategory',
  furnitureCategorySchema
);

