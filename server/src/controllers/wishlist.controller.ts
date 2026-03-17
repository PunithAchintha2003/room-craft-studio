import { Request, Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlist.service';
import { successResponse } from '../utils/response.util';

export class WishlistController {
  // GET /api/wishlist
  static async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const wishlist = await WishlistService.getOrCreateWishlist(userId);
      
      successResponse(res, wishlist, 'Wishlist retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /api/wishlist/items/:furnitureId
  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const { furnitureId } = req.params;

      const wishlist = await WishlistService.addItem(userId, furnitureId);
      
      successResponse(res, wishlist, 'Item added to wishlist successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/wishlist/items/:furnitureId
  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const { furnitureId } = req.params;

      const wishlist = await WishlistService.removeItem(userId, furnitureId);
      
      successResponse(res, wishlist, 'Item removed from wishlist successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/wishlist/check/:furnitureId
  static async checkItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const { furnitureId } = req.params;

      const isInWishlist = await WishlistService.isInWishlist(userId, furnitureId);
      
      successResponse(res, { isInWishlist }, 'Wishlist checked successfully');
    } catch (error) {
      next(error);
    }
  }
}
