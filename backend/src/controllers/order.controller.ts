import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../utils/response';
import { OrderService } from '../services/order.service';

export class OrderController {
  static async create(req: Request, res: Response) {
    const order = await OrderService.create(req.body, req.auth.userId);
    successResponse(res, order, 201);
  }
  static async getById(req: Request, res: Response) {
    const order = await OrderService.findById(req.params.id);
    successResponse(res, order);
  }
  static async getAll(req: Request, res: Response) {
    const { page = 1, limit = 20, unit_id, party_id, status, payment_mode } = req.query;
    const result = await OrderService.findAll({ unitId: unit_id, partyId: party_id, status, paymentMode: payment_mode }, { page: Number(page), limit: Number(limit) });
    paginatedResponse(res, result.orders, result.total, Number(page), Number(limit));
  }
  static async updateStatus(req: Request, res: Response) {
    const order = await OrderService.updateStatus(req.params.id, req.body.status);
    successResponse(res, order);
  }
  static async delete(req: Request, res: Response) {
    await OrderService.softDelete(req.params.id);
    successResponse(res, { message: 'Deleted' });
  }
}