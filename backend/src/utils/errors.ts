export class AppError extends Error {
  constructor(message: string, public statusCode: number = 500, public code: string = "INTERNAL_ERROR", public details?: any) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(resource + (id ? " with ID " + id : "") + " not found", 404, "NOT_FOUND", { resource, id });
  }
}
export class ValidationError extends AppError {
  constructor(message: string, details?: any) { super(message, 400, "VALIDATION_ERROR", details); }
}
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") { super(message, 401, "AUTH_ERROR"); }
}
export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") { super(message, 403, "AUTHZ_ERROR"); }
}
export class CreditLimitError extends AppError {
  constructor(name: string, limit: number, req: number) {
    super("Credit limit exceeded for " + name, 422, "CREDIT_LIMIT", { name, limit, req });
  }
}