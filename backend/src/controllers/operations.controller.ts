import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../utils/response';
import { TripService } from '../services/trip.service';
import { StockService } from '../services/stock.service';
import { ExpenseService } from '../services/expense.service';
import { StaffService } from '../services/staff.service';
import { CashClosingService } from '../services/cashClosing.service';

export class TripController {
  static async create(req: Request, res: Response) {
    const trip = await TripService.create({ ...req.body, created_by: req.auth.userId });
    successResponse(res, trip, 201);
  }
  static async updateStatus(req: Request, res: Response) {
    const trip = await TripService.updateStatus(req.params.id, req.body.status, req.body);
    successResponse(res, trip);
  }
  static async getMyTrips(req: Request, res: Response) {
    const trips = await TripService.findByDriver(req.auth.userId, req.query.status as string);
    successResponse(res, trips);
  }
  static async getActive(req: Request, res: Response) {
    const trips = await TripService.findActive(req.query.unit_id as string);
    successResponse(res, trips);
  }
  static async getStats(req: Request, res: Response) {
    const stats = await TripService.getTripStats(req.query.unit_id as string, req.query.date_from as string, req.query.date_to as string);
    successResponse(res, stats);
  }
}

export class StockController {
  static async createMovement(req: Request, res: Response) {
    const movement = await StockService.createMovement({ ...req.body, created_by: req.auth.userId });
    successResponse(res, movement, 201);
  }
  static async getCurrent(req: Request, res: Response) {
    const stock = await StockService.getCurrentStock(req.query.unit_id as string);
    successResponse(res, stock);
  }
  static async getToday(req: Request, res: Response) {
    const movements = await StockService.getTodayMovements(req.query.unit_id as string);
    successResponse(res, movements);
  }
}

export class ExpenseController {
  static async create(req: Request, res: Response) {
    const expense = await ExpenseService.create({ ...req.body, created_by: req.auth.userId });
    successResponse(res, expense, 201);
  }
  static async getAll(req: Request, res: Response) {
    const { page = 1, limit = 20, unit_id, category, date_from, date_to } = req.query;
    const result = await ExpenseService.findAll({ unitId: unit_id, category, dateFrom: date_from, dateTo: date_to }, { page: Number(page), limit: Number(limit) });
    paginatedResponse(res, result.expenses, result.total, Number(page), Number(limit));
  }
  static async getSummary(req: Request, res: Response) {
    const summary = await ExpenseService.getSummary(req.query.unit_id as string, req.query.date_from as string, req.query.date_to as string);
    successResponse(res, summary);
  }
  static async delete(req: Request, res: Response) {
    await ExpenseService.softDelete(req.params.id);
    successResponse(res, { message: 'Deleted' });
  }
}

export class StaffController {
  static async create(req: Request, res: Response) {
    const staff = await StaffService.create(req.body);
    successResponse(res, staff, 201);
  }
  static async getAll(req: Request, res: Response) {
    const staff = await StaffService.findAll(req.query.unit_id as string);
    successResponse(res, staff);
  }
  static async markAttendance(req: Request, res: Response) {
    const result = await StaffService.markAttendance(req.body.date, req.body.entries, req.auth.userId);
    successResponse(res, result);
  }
  static async getAttendance(req: Request, res: Response) {
    const result = await StaffService.getAttendance(req.query.unit_id as string, req.query.date as string);
    successResponse(res, result);
  }
  static async giveAdvance(req: Request, res: Response) {
    const advance = await StaffService.giveAdvance(req.body, req.auth.userId);
    successResponse(res, advance, 201);
  }
  static async getPayroll(req: Request, res: Response) {
    const payroll = await StaffService.calculatePayroll(req.query.unit_id as string, req.query.month as string);
    successResponse(res, payroll);
  }
}

export class CashClosingController {
  static async calculateExpected(req: Request, res: Response) {
    const result = await CashClosingService.calculateExpected(req.query.unit_id as string, req.query.date as string);
    successResponse(res, result);
  }
  static async create(req: Request, res: Response) {
    const closing = await CashClosingService.create(req.body, req.auth.userId);
    successResponse(res, closing, 201);
  }
  static async getAll(req: Request, res: Response) {
    const closings = await CashClosingService.findAll({ unitId: req.query.unit_id, dateFrom: req.query.date_from, dateTo: req.query.date_to });
    successResponse(res, closings);
  }
  static async getStatus(req: Request, res: Response) {
    const status = await CashClosingService.getUnitStatus(req.query.date as string);
    successResponse(res, status);
  }
}