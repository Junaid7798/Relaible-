import { Response } from "express";
export function successResponse<T>(res: Response, data: T, code: number = 200, meta?: any) {
  return res.status(code).json({ success: true, data, meta: { ...meta, timestamp: new Date().toISOString() } });
}
export function errorResponse(res: Response, code: number, errCode: string, msg: string, details?: any) {
  return res.status(code).json({ success: false, error: { code: errCode, message: msg, details }, meta: { timestamp: new Date().toISOString() } });
}
export function paginatedResponse<T>(res: Response, data: T[], total: number, page: number, limit: number) {
  return successResponse(res, data, 200, { page, limit, total, timestamp: new Date().toISOString() });
}
