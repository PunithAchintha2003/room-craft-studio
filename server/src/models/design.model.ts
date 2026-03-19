import mongoose, { Document, Schema } from 'mongoose';
import { IRoomConfig, IFurnitureItem, IRoomOpening } from '../types/design.types';

export interface IDesign extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  room: IRoomConfig;
  furniture: IFurnitureItem[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const furnitureItemSchema = new Schema<IFurnitureItem>(
  {
    furnitureId: {
      type: String,
      required: [true, 'Furniture ID is required'],
      ref: 'Furniture',
    },
    position: {
      x: {
        type: Number,
        required: [true, 'X position is required'],
      },
      y: {
        type: Number,
        required: [true, 'Y position is required'],
      },
    },
    rotation: {
      type: Number,
      required: [true, 'Rotation is required'],
      min: [0, 'Rotation must be at least 0'],
      max: [360, 'Rotation cannot exceed 360'],
      default: 0,
    },
    scale: {
      type: Number,
      required: [true, 'Scale is required'],
      min: [0.5, 'Scale must be at least 0.5'],
      max: [2.0, 'Scale cannot exceed 2.0'],
      default: 1.0,
    },
    color: {
      type: String,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format'],
    },
  },
  { _id: false }
);

const roomOpeningSchema = new Schema<IRoomOpening>(
  {
    type: {
      type: String,
      enum: ['door', 'window'],
      required: [true, 'Opening type is required'],
    },
    wall: {
      type: String,
      enum: ['north', 'south', 'east', 'west'],
      required: [true, 'Opening wall is required'],
    },
    width: {
      type: Number,
      required: [true, 'Opening width is required'],
      min: [0.3, 'Opening width must be at least 0.3 meters'],
      max: [5, 'Opening width cannot exceed 5 meters'],
    },
    height: {
      type: Number,
      required: [true, 'Opening height is required'],
      min: [0.3, 'Opening height must be at least 0.3 meters'],
      max: [5, 'Opening height cannot exceed 5 meters'],
    },
    bottom: {
      type: Number,
      required: [true, 'Opening bottom offset is required'],
      min: [0, 'Bottom offset cannot be negative'],
      max: [5, 'Bottom offset cannot exceed 5 meters'],
      default: 0,
    },
    offset: {
      type: Number,
      required: [true, 'Opening offset along wall is required'],
      min: [0, 'Offset cannot be negative'],
    },
  },
  { _id: false }
);

const roomConfigSchema = new Schema<IRoomConfig>(
  {
    width: {
      type: Number,
      required: [true, 'Room width is required'],
      min: [1, 'Width must be at least 1 meter'],
      max: [20, 'Width cannot exceed 20 meters'],
    },
    length: {
      type: Number,
      required: [true, 'Room length is required'],
      min: [1, 'Length must be at least 1 meter'],
      max: [20, 'Length cannot exceed 20 meters'],
    },
    height: {
      type: Number,
      required: [true, 'Room height is required'],
      min: [2, 'Height must be at least 2 meters'],
      max: [5, 'Height cannot exceed 5 meters'],
    },
    wallColor: {
      type: String,
      required: [true, 'Wall color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format'],
      default: '#FFFFFF',
    },
    floorColor: {
      type: String,
      required: [true, 'Floor color is required'],
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format'],
      default: '#D3D3D3',
    },
    layout: {
      type: String,
      enum: ['rectangle', 'l-shape', 't-shape', 'u-shape', 'angled-bay'],
      default: 'rectangle',
    },
    cutoutPosition: {
      type: String,
      enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top', 'bottom', 'left', 'right'],
    },
    cutoutWidth: { type: Number, min: 0 },
    cutoutLength: { type: Number, min: 0 },
    wallTexture: {
      type: String,
    },
    floorTexture: {
      type: String,
    },
    wallTextureScale: {
      type: Number,
      min: [0.1, 'Texture scale must be at least 0.1'],
      max: [10, 'Texture scale cannot exceed 10'],
      default: 1,
    },
    floorTextureScale: {
      type: Number,
      min: [0.1, 'Texture scale must be at least 0.1'],
      max: [10, 'Texture scale cannot exceed 10'],
      default: 1,
    },
    openings: {
      type: [roomOpeningSchema],
      default: [],
    },
  },
  { _id: false }
);

const designSchema = new Schema<IDesign>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      ref: 'User',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Design name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    room: {
      type: roomConfigSchema,
      required: [true, 'Room configuration is required'],
    },
    furniture: {
      type: [furnitureItemSchema],
      default: [],
    },
    isPublic: {
      type: Boolean,
      default: false,
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

designSchema.index({ userId: 1, createdAt: -1 });
designSchema.index({ isPublic: 1, createdAt: -1 });

export const Design = mongoose.model<IDesign>('Design', designSchema);
