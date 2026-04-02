import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../utils/response';
import { PartyService } from '../services/party.service';

export class PartyController {
  static async create(req: Request, res: Response) {
    const party = await PartyService.create(req.body, req.auth.userId);
    successResponse(res, party, 201);
  }
  static async getById(req: Request, res: Response) {
    const party = await PartyService.findById(req.params.id);
    successResponse(res, party);
  }
  static async getAll(req: Request, res: Response) {
    const { page = 1, limit = 20, search, healthScore } = req.query;
    const result = await PartyService.findAll({ search, healthScore }, { page: Number(page), limit: Number(limit) });
    paginatedResponse(res, result.parties, result.total, Number(page), Number(limit));
  }
  static async update(req: Request, res: Response) {
    const party = await PartyService.update(req.params.id, req.body);
    successResponse(res, party);
  }
  static async delete(req: Request, res: Response) {
    await PartyService.softDelete(req.params.id);
    successResponse(res, { message: 'Deleted' });
  }
  static async getTop(req: Request, res: Response) {
    const parties = await PartyService.getTopParties(Number(req.query.limit) || 10, req.query.period as string);
    successResponse(res, parties);
  }
  static async addCommunication(req: Request, res: Response) {
    const comm = await PartyService.addCommunication({ ...req.body, created_by: req.auth.userId });
    successResponse(res, comm, 201);
  }
  static async addAddress(req: Request, res: Response) {
    const addr = await PartyService.addAddress(req.body);
    successResponse(res, addr, 201);
  }
  static async setRate(req: Request, res: Response) {
    const rate = await PartyService.setRate(req.body.party_id, req.body.product_id, req.body.rate_paise);
    successResponse(res, rate);
  }
}