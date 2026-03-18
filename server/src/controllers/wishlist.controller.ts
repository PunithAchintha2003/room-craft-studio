import { Request, Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlist.service';
import { sendSuccess } from '../utils/response.util';

export class WishlistController {
  // GET /api/wishlist
  static async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const wishlist = await WishlistService.getOrCreateWishlist(userId);
      
      sendSuccess(res, wishlist, 'Wishlist retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /api/wishlist/items/:furnitureId
  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const furnitureId = Array.isArray(req.params.furnitureId) ? req.params.furnitureId[0] : req.params.furnitureId;

      const wishlist = await WishlistService.addItem(userId, furnitureId);
      
      sendSuccess(res, wishlist, 'Item added to wishlist successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/wishlist/items/:furnitureId
  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const furnitureId = Array.isArray(req.params.furnitureId) ? req.params.furnitureId[0] : req.params.furnitureId;

      const wishlist = await WishlistService.removeItem(userId, furnitureId);
      
      sendSuccess(res, wishlist, 'Item removed from wishlist successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/wishlist/check/:furnitureId
  static async checkItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const furnitureId = Array.isArray(req.params.furnitureId) ? req.params.furnitureId[0] : req.params.furnitureId;

      const isInWishlist = await WishlistService.isInWishlist(userId, furnitureId);
      
      sendSuccess(res, { isInWishlist }, 'Wishlist checked successfully');
    } catch (error) {
      next(error);
    }
  }
}
