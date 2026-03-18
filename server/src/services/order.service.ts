import { Order, OrderStatus } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { Furniture } from '../models/furniture.model';
import { AppError } from '../utils/AppError';
import * as notificationService from '../services/notification.service';

export class OrderService {
  // Generate unique order number
  static generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `RCS-${year}-${random}`;
  }

  // Create order from cart
  static async createOrderFromCart(userId: string, shippingAddress: any, billingAddress?: any) {
    const cart = await Cart.findOne({ userId }).populate('items.furnitureId');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const furniture = item.furnitureId as any;
      if (!furniture) {
        throw new AppError(`Item not found`, 404);
      }
      if (furniture.stock < item.quantity) {
        throw new AppError(`${furniture.name}: Insufficient stock. Only ${furniture.stock} available`, 400);
      }
    }

    // Calculate shipping cost (free for orders over $500)
    const shippingCost = cart.subtotal >= 500 ? 0 : 50;

    // Prepare order items
    const orderItems = cart.items.map((item) => {
      const furniture = item.furnitureId as any;
      return {
        furnitureId: furniture._id,
        name: furniture.name,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        price: item.priceSnapshot,
        thumbnail: furniture.thumbnail,
      };
    });

    // Create order (payment will be added separately)
    const orderNumber = this.generateOrderNumber();
    const order = await Order.create({
      userId,
      orderNumber,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentDetails: {
        stripePaymentIntentId: `pending_${orderNumber}`, // Unique placeholder until real Stripe payment intent
        amount: cart.total + shippingCost,
        currency: 'usd',
        status: 'pending',
      },
      status: 'pending',
      subtotal: cart.subtotal,
      tax: cart.tax,
      shippingCost,
      total: cart.total + shippingCost,
    });

    return order;
  }

  // Update order payment details
  static async updatePaymentDetails(orderId: string, paymentIntentId: string, status: string, paymentMethod?: string) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    order.paymentDetails.stripePaymentIntentId = paymentIntentId;
    order.paymentDetails.status = status;
    if (paymentMethod) {
      order.paymentDetails.paymentMethod = paymentMethod;
    }

    await order.save();
    return order;
  }

  // Confirm order and update stock
  static async confirmOrder(orderId: string) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Update furniture stock
    for (const item of order.items) {
      const furniture = await Furniture.findById(item.furnitureId);
      if (furniture) {
        furniture.stock = Math.max(0, furniture.stock - item.quantity);
        await furniture.save();
      }
    }

    // Update order status
    order.status = 'confirmed';
    await order.save();

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId: order.userId },
      { $set: { items: [] } }
    );

    return order;
  }

  // Get user's orders
  static async getUserOrders(userId: string, status?: OrderStatus, page = 1, limit = 10) {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.furnitureId'),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get all orders (admin)
  static async getAllOrders(status?: OrderStatus, page = 1, limit = 10) {
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.furnitureId'),
      Order.countDocuments(query),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get order by ID
  static async getOrderById(orderId: string, userId: string) {
    const order = await Order.findOne({ _id: orderId, userId }).populate('items.furnitureId');
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  // Get order by order number
  static async getOrderByNumber(orderNumber: string, userId: string) {
    const order = await Order.findOne({ orderNumber, userId }).populate('items.furnitureId');
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  // Cancel order
  static async cancelOrder(orderId: string, userId: string) {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      throw new AppError('Cannot cancel order that has been shipped or delivered', 400);
    }

    if (['cancelled', 'refunded'].includes(order.status)) {
      throw new AppError('Order is already cancelled or refunded', 400);
    }

    // Restore stock
    for (const item of order.items) {
      await Furniture.findByIdAndUpdate(
        item.furnitureId,
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    await order.save();

    return order;
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    order.status = status;
    if (note) {
      order.notes = note;
    }
    await order.save();

    // Send user notifications for key status changes
    const userId = String(order.userId);
    if (status === 'confirmed') {
      await notificationService.createForUser(userId, {
        title: 'Order accepted',
        body: `Your order ${order.orderNumber} has been accepted and is being prepared.`,
        type: 'success',
      });
    }
    if (status === 'delivered') {
      await notificationService.createForUser(userId, {
        title: 'Order delivered',
        body: `Your furniture order ${order.orderNumber} has been marked as delivered.`,
        type: 'info',
      });
    }

    return order;
  }
}
