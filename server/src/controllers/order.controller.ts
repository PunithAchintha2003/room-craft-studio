import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { OrderStatus } from '../models/order.model';
import { successResponse } from '../utils/response.util';

export class OrderController {
  // POST /api/orders
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const { shippingAddress, billingAddress } = req.body;

      if (!shippingAddress) {
        return res.status(400).json({ success: false, message: 'Shipping address is required' });
      }

      const order = await OrderService.createOrderFromCart(userId, shippingAddress, billingAddress);
      
      successResponse(res, order, 'Order created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders
  static async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const status = req.query.status as OrderStatus | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await OrderService.getUserOrders(userId, status, page, limit);
      
      successResponse(res, result, 'Orders retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders/:orderId
  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const { orderId } = req.params;

      const order = await OrderService.getOrderById(orderId, userId);
      
      successResponse(res, order, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // GET /api/orders/number/:orderNumber
  static async getOrderByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const { orderNumber } = req.params;

      const order = await OrderService.getOrderByNumber(orderNumber, userId);
      
      successResponse(res, order, 'Order retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/orders/:orderId/cancel
  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!._id;
      const { orderId } = req.params;

      const order = await OrderService.cancelOrder(orderId, userId);
      
      successResponse(res, order, 'Order cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/orders/:orderId/status (Admin only - will be protected)
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const { status, note } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }

      const order = await OrderService.updateOrderStatus(orderId, status as OrderStatus, note);
      
      successResponse(res, order, 'Order status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
