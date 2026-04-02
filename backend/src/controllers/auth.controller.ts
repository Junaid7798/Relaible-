import { Request, Response } from 'express';
import { successResponse, paginatedResponse } from '../utils/response';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { phone, password } = req.body;
    const result = await AuthService.login(phone, password);
    successResponse(res, result);
  }
  static async register(req: Request, res: Response) {
    const result = await AuthService.register(req.body);
    successResponse(res, result, 201);
  }
  static async refreshToken(req: Request, res: Response) {
    const result = await AuthService.refreshToken(req.body.refreshToken);
    successResponse(res, result);
  }
  static async changePassword(req: Request, res: Response) {
    await AuthService.changePassword(req.auth.userId, req.body.currentPassword, req.body.newPassword);
    successResponse(res, { message: 'Password changed' });
  }
  static async getUsers(req: Request, res: Response) {
    const users = await AuthService.getUsers(req.query.unit_id as string);
    successResponse(res, users);
  }
}