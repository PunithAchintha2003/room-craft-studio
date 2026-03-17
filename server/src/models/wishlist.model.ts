import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem {
  furnitureId: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    furnitureId: {
      type: Schema.Types.ObjectId,
      ref: 'Furniture',
      required: [true, 'Furniture ID is required'],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    items: {
      type: [wishlistItemSchema],
      default: [],
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

// Prevent duplicate furniture items in wishlist
wishlistSchema.index({ userId: 1, 'items.furnitureId': 1 });

export const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema);
