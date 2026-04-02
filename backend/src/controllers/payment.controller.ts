import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../utils/response';
import { PaymentService } from '../services/payment.service';
import { LedgerService } from '../services/ledger.service';
import { InvoiceService } from '../services/invoice.service';

export class PaymentController {
  static async create(req: Request, res: Response) {
    const payment = await PaymentService.create(req.body, req.auth.userId);
    successResponse(res, payment, 201);
  }
  static async getAll(req: Request, res: Response) {
    const { page = 1, limit = 20, unit_id, party_id } = req.query;
    const result = await PaymentService.findAll({ unitId: unit_id, partyId: party_id }, { page: Number(page), limit: Number(limit) });
    paginatedResponse(res, result.payments, result.total, Number(page), Number(limit));
  }
  static async delete(req: Request, res: Response) {
    await PaymentService.softDelete(req.params.id);
    successResponse(res, { message: 'Deleted' });
  }
}

export class LedgerController {
  static async getPartyLedger(req: Request, res: Response) {
    const { page = 1, limit = 20 } = req.query;
    const result = await LedgerService.getPartyLedger(req.params.partyId, { page: Number(page), limit: Number(limit) });
    successResponse(res, result);
  }
  static async getTotalOutstanding(req: Request, res: Response) {
    const result = await LedgerService.getTotalOutstanding(req.query.unit_id as string);
    successResponse(res, result);
  }
  static async getFollowUpList(req: Request, res: Response) {
    const list = await LedgerService.getFollowUpList(req.query.unit_id as string);
    successResponse(res, list);
  }
  static async recalculate(req: Request, res: Response) {
    const count = await LedgerService.recalculateAgeingStatuses();
    successResponse(res, { updated: count });
  }
}

export class InvoiceController {
  static async generate(req: Request, res: Response) {
    const invoice = await InvoiceService.generateForOrder(req.body.order_id);
    successResponse(res, invoice, 201);
  }
  static async getByOrder(req: Request, res: Response) {
    const invoice = await InvoiceService.getInvoiceByOrder(req.params.orderId);
    successResponse(res, invoice);
  }
  static async getAll(req: Request, res: Response) {
    const { page = 1, limit = 20, unit_id, date_from, date_to } = req.query;
    const result = await InvoiceService.findAll({ unitId: unit_id, dateFrom: date_from, dateTo: date_to }, Number(page), Number(limit));
    successResponse(res, result);
  }
}