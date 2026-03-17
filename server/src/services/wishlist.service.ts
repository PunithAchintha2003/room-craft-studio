import { Wishlist } from '../models/wishlist.model';
import { Furniture } from '../models/furniture.model';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';

export class WishlistService {
  // Get or create wishlist for user
  static async getOrCreateWishlist(userId: string) {
    let wishlist = await Wishlist.findOne({ userId }).populate('items.furnitureId');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, items: [] });
    }
    
    return wishlist;
  }

  // Add item to wishlist
  static async addItem(userId: string, furnitureId: string) {
    const furniture = await Furniture.findById(furnitureId);
    if (!furniture) {
      throw new AppError('Furniture item not found', 404);
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    // Check if item already exists
    const exists = wishlist.items.some(
      (item) => item.furnitureId.toString() === furnitureId
    );

    if (exists) {
      throw new AppError('Item already in wishlist', 400);
    }

    wishlist.items.push({
      furnitureId: new mongoose.Types.ObjectId(furnitureId),
      addedAt: new Date(),
    });

    await wishlist.save();
    await wishlist.populate('items.furnitureId');
    
    return wishlist;
  }

  // Remove item from wishlist
  static async removeItem(userId: string, furnitureId: string) {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new AppError('Wishlist not found', 404);
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.furnitureId.toString() !== furnitureId
    );

    await wishlist.save();
    await wishlist.populate('items.furnitureId');
    
    return wishlist;
  }

  // Check if item is in wishlist
  static async isInWishlist(userId: string, furnitureId: string): Promise<boolean> {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return false;
    }

    return wishlist.items.some(
      (item) => item.furnitureId.toString() === furnitureId
    );
  }
}
