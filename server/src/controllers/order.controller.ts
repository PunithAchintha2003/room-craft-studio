import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { OrderStatus } from '../models/order.model';
import { sendSuccess } from '../utils/response.util';

export class OrderController {
  // POST /api/orders
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { shippingAddress, billingAddress } = req.body;

      if (!shippingAddress) {
        return res.status(400).json({ success: false, message: 'Shipping address is required' });
      }

      const order = await OrderService.createOrderFromCart(userId, shippingAddress, billingAddress);
      
      sendSuccess(res, order, 'Order created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders
  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const status = req.query.status as OrderStatus | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await OrderService.getUserOrders(userId, status, page, limit);
      
      sendSuccess(res, result, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders/admin (Admin: all orders)
  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as OrderStatus | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await OrderService.getAllOrders(status, page, limit);

      sendSuccess(res, result, 'All orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders/:orderId
  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;

      const order = await OrderService.getOrderById(orderId, userId);
      
      sendSuccess(res, order, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders/number/:orderNumber
  static async getOrderByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orderNumber = Array.isArray(req.params.orderNumber) ? req.params.orderNumber[0] : req.params.orderNumber;

      const order = await OrderService.getOrderByNumber(orderNumber, userId);
      
      sendSuccess(res, order, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/orders/:orderId/cancel
  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;

      const order = await OrderService.cancelOrder(orderId, userId);
      
      sendSuccess(res, order, 'Order cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/orders/:orderId/status (Admin only - will be protected)
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = Array.isArray(req.params.orderId) ? req.params.orderId[0] : req.params.orderId;
      const { status, note } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }

      const order = await OrderService.updateOrderStatus(orderId, status as OrderStatus, note);
      
      sendSuccess(res, order, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
