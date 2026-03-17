import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service';
import { sendSuccess } from '../utils/response.util';

export class CartController {
  // GET /api/cart
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const cart = await CartService.getOrCreateCart(userId);
      
      sendSuccess(res, cart, 'Cart retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /api/cart/items
  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { furnitureId, quantity = 1, selectedColor } = req.body;

      if (!furnitureId) {
        return res.status(400).json({ success: false, message: 'Furniture ID is required' });
      }

      const cart = await CartService.addItem(userId, furnitureId, quantity, selectedColor);
      
      sendSuccess(res, cart, 'Item added to cart successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/cart/items/:furnitureId
  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { furnitureId } = req.params;
      const { quantity, selectedColor } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Valid quantity is required' });
      }

      const cart = await CartService.updateItem(userId, furnitureId, quantity, selectedColor);
      
      sendSuccess(res, cart, 'Cart item updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/cart/items/:furnitureId
  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { furnitureId } = req.params;

      const cart = await CartService.removeItem(userId, furnitureId);
      
      sendSuccess(res, cart, 'Item removed from cart successfully');
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/cart
  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const cart = await CartService.clearCart(userId);
      
      sendSuccess(res, cart, 'Cart cleared successfully');
    } catch (error) {
      next(error);
    }
  }

  // POST /api/cart/design/:designId
  static async addDesignToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { designId } = req.params;

      const result = await CartService.addDesignToCart(userId, designId);
      
      sendSuccess(res, result, `${result.addedCount} items added to cart from design`);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/cart/validate
  static async validateCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await CartService.validateCart(userId);
      
      sendSuccess(res, result, 'Cart validated');
    } catch (error) {
      next(error);
    }
  }
}
