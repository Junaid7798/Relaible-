import { Request, Response } from 'express';
import { successResponse } from '../utils/response';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async login(req: Request, res: Response) {
    const { phone, password } = req.body;
    const result = await AuthService.login(phone, password);
    successResponse(res, result);
  }

  static async register(req: Request, res: Response) {
    // New user registration (before org creation)
    const result = await AuthService.register(req.body);
    successResponse(res, result, 201);
  }

  // Create organization (owner only, after registration)
  static async createOrganization(req: Request, res: Response) {
    const result = await AuthService.createOrganization(req.auth.userId, req.body);
    successResponse(res, result, 201);
  }

  // Create first site (after org creation)
  static async createSite(req: Request, res: Response) {
    const result = await AuthService.createSite(req.auth.orgId, req.auth.userId, req.body);
    successResponse(res, result, 201);
  }

  // Generate invite code
  static async createInvite(req: Request, res: Response) {
    const result = await AuthService.createInvite(req.auth.orgId, req.auth.userId, req.body);
    successResponse(res, result, 201);
  }

  // Validate invite (public - no auth required)
  static async validateInvite(req: Request, res: Response) {
    const result = await AuthService.validateInvite(req.params.code);
    successResponse(res, result);
  }

  // Accept invite (new user joins)
  static async acceptInvite(req: Request, res: Response) {
    const result = await AuthService.acceptInvite(req.params.code, req.body);
    successResponse(res, result, 201);
  }

  // Get user's sites
  static async getUserSites(req: Request, res: Response) {
    const sites = await AuthService.getUserSites(req.auth.userId);
    successResponse(res, sites);
  }

  // Update partner permissions (owner only)
  static async updatePartnerPermissions(req: Request, res: Response) {
    await AuthService.updatePartnerPermissions(req.params.userId, req.body);
    successResponse(res, { message: 'Permissions updated' });
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
    const users = await AuthService.getUsers(req.auth.orgId);
    successResponse(res, users);
  }
}
