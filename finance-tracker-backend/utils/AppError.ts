export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, isOperational = true, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(message, 400, true, details);
  }

  static unauthorized(message = 'Unauthorized', details?: unknown) {
    return new AppError(message, 401, true, details);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403, true);
  }

  static notFound(message = 'Not Found') {
    return new AppError(message, 404, true);
  }

  static conflict(message: string, details?: unknown) {
    return new AppError(message, 409, true, details);
  }

  static validation(message: string, details?: unknown) {
    return new AppError(message, 422, true, details);
  }

  static internal(message = 'Internal Server Error', details?: unknown) {
    return new AppError(message, 500, true, details);
  }
}
