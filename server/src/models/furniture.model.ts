import mongoose, { Document, Schema } from 'mongoose';
import { FurnitureCategory } from '../types/design.types';

export interface IFurniture extends Document {
  name: string;
  category: FurnitureCategory;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
  thumbnail: string;
  thumbnailAlt?: string;
  images: string[];
  description: string;
  specifications: Map<string, string>;
  model3D: {
    url: string;
    format: 'gltf' | 'glb';
  };
  defaultColor: string;
  isColorizable: boolean;
  price: number;
  stock: number;
  averageRating: number;
  reviewCount: number;
  tags: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const furnitureSchema = new Schema<IFurniture>(
  {
    name: {
      type: String,
      required: [true, 'Furniture name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['chair', 'table', 'sofa', 'bed', 'storage'],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    dimensions: {
      width: {
        type: Number,
        required: [true, 'Width is required'],
        min: [0.1, 'Width must be at least 0.1 meters'],
        max: [5, 'Width cannot exceed 5 meters'],
      },
      length: {
        type: Number,
        required: [true, 'Length is required'],
        min: [0.1, 'Length must be at least 0.1 meters'],
        max: [5, 'Length cannot exceed 5 meters'],
      },
      height: {
        type: Number,
        required: [true, 'Height is required'],
        min: [0.1, 'Height must be at least 0.1 meters'],
        max: [3, 'Height cannot exceed 3 meters'],
      },
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
      trim: true,
    },
    thumbnailAlt: {
      type: String,
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters'],
    },
    images: {
      type: [String],
      default: function() {
        return [this.thumbnail];
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
    model3D: {
      url: {
        type: String,
        required: [true, '3D model URL is required'],
        trim: true,
      },
      format: {
        type: String,
        required: [true, '3D model format is required'],
        enum: {
          values: ['gltf', 'glb'],
          message: '{VALUE} is not a valid 3D model format',
        },
      },
    },
    defaultColor: {
      type: String,
      required: [true, 'Default color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format'],
      default: '#8B4513',
    },
    isColorizable: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
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

furnitureSchema.index({ category: 1, price: 1 });
furnitureSchema.index({ stock: 1 });
furnitureSchema.index({ featured: 1, createdAt: -1 });
furnitureSchema.index({ averageRating: -1 });
furnitureSchema.index({ tags: 1 });

export const Furniture = mongoose.model<IFurniture>('Furniture', furnitureSchema);
