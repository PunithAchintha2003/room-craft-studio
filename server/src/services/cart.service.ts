import { Cart } from '../models/cart.model';
import { Furniture } from '../models/furniture.model';
import { Design } from '../models/design.model';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';

const TAX_RATE = 0.1; // 10% tax

export class CartService {
  // Get cart for user (create if doesn't exist)
  static async getOrCreateCart(userId: string) {
    let cart = await Cart.findOne({ userId }).populate('items.furnitureId');
    
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    
    return cart;
  }

  // Add item to cart
  static async addItem(userId: string, furnitureId: string, quantity: number, selectedColor?: string) {
    const furniture = await Furniture.findById(furnitureId);
    if (!furniture) {
      throw new AppError('Furniture item not found', 404);
    }

    // Check stock
    if (furniture.stock < quantity) {
      throw new AppError(`Insufficient stock. Only ${furniture.stock} available`, 400);
    }

    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.furnitureId.toString() === furnitureId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (furniture.stock < newQuantity) {
        throw new AppError(`Insufficient stock. Only ${furniture.stock} available`, 400);
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
      if (selectedColor) {
        cart.items[existingItemIndex].selectedColor = selectedColor;
      }
    } else {
      // Add new item
      cart.items.push({
        furnitureId: new mongoose.Types.ObjectId(furnitureId),
        quantity,
        selectedColor: selectedColor || furniture.defaultColor,
        priceSnapshot: furniture.price,
      });
    }

    await cart.save();
    await cart.populate('items.furnitureId');
    
    return cart;
  }

  // Update cart item
  static async updateItem(userId: string, furnitureId: string, quantity: number, selectedColor?: string) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.furnitureId.toString() === furnitureId
    );

    if (itemIndex < 0) {
      throw new AppError('Item not found in cart', 404);
    }

    // Check stock
    const furniture = await Furniture.findById(furnitureId);
    if (!furniture) {
      throw new AppError('Furniture item not found', 404);
    }

    if (furniture.stock < quantity) {
      throw new AppError(`Insufficient stock. Only ${furniture.stock} available`, 400);
    }

    cart.items[itemIndex].quantity = quantity;
    if (selectedColor) {
      cart.items[itemIndex].selectedColor = selectedColor;
    }

    await cart.save();
    await cart.populate('items.furnitureId');
    
    return cart;
  }

  // Remove item from cart
  static async removeItem(userId: string, furnitureId: string) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = cart.items.filter(
      (item) => item.furnitureId.toString() !== furnitureId
    );

    await cart.save();
    await cart.populate('items.furnitureId');
    
    return cart;
  }

  // Clear cart
  static async clearCart(userId: string) {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = [];
    await cart.save();
    
    return cart;
  }

  // Add all furniture from a design to cart
  static async addDesignToCart(userId: string, designId: string) {
    const design = await Design.findById(designId);
    if (!design) {
      throw new AppError('Design not found', 404);
    }

    const cart = await this.getOrCreateCart(userId);
    let addedCount = 0;

    for (const designItem of design.furniture) {
      const furniture = await Furniture.findById(designItem.furnitureId);
      if (!furniture || furniture.stock < 1) {
        continue; // Skip items that don't exist or are out of stock
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.furnitureId.toString() === designItem.furnitureId.toString()
      );

      if (existingItemIndex >= 0) {
        // Increment quantity if not exceeding stock
        if (furniture.stock >= cart.items[existingItemIndex].quantity + 1) {
          cart.items[existingItemIndex].quantity += 1;
          addedCount++;
        }
      } else {
        // Add new item
        cart.items.push({
          furnitureId: designItem.furnitureId,
          quantity: 1,
          selectedColor: designItem.color || furniture.defaultColor,
          priceSnapshot: furniture.price,
        });
        addedCount++;
      }
    }

    await cart.save();
    await cart.populate('items.furnitureId');
    
    return { cart, addedCount };
  }

  // Validate cart items (stock and prices)
  static async validateCart(userId: string) {
    const cart = await Cart.findOne({ userId }).populate('items.furnitureId');
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const issues: string[] = [];
    const validItems = [];

    for (const item of cart.items) {
      const furniture = item.furnitureId as any;
      
      if (!furniture) {
        issues.push(`Item no longer available`);
        continue;
      }

      if (furniture.stock < item.quantity) {
        issues.push(`${furniture.name}: Only ${furniture.stock} in stock (you have ${item.quantity} in cart)`);
      }

      if (furniture.price !== item.priceSnapshot) {
        issues.push(`${furniture.name}: Price changed from $${item.priceSnapshot} to $${furniture.price}`);
        item.priceSnapshot = furniture.price; // Update price
      }

      validItems.push(item);
    }

    if (issues.length > 0) {
      cart.items = validItems;
      await cart.save();
    }

    return { cart, issues };
  }
}
