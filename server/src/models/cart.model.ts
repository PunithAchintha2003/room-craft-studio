import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  furnitureId: mongoose.Types.ObjectId;
  quantity: number;
  selectedColor?: string;
  priceSnapshot: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    furnitureId: {
      type: Schema.Types.ObjectId,
      ref: 'Furniture',
      required: [true, 'Furniture ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Quantity cannot exceed 10'],
      default: 1,
    },
    selectedColor: {
      type: String,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format'],
    },
    priceSnapshot: {
      type: Number,
      required: [true, 'Price snapshot is required'],
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
    },
    subtotal: {
      type: Number,
      default: 0,
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total cannot be negative'],
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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

// Calculate totals before saving
cartSchema.pre('save', function (next) {
  const TAX_RATE = 0.1; // 10% tax rate
  
  this.subtotal = this.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
  this.tax = this.subtotal * TAX_RATE;
  this.total = this.subtotal + this.tax;
  
  next();
});

// Index for efficient cart cleanup
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
