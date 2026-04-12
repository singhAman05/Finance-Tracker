import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

type PgLikeError = {
  code?: string;
  message?: string;
  details?: string;
};

function mapDbError(err: PgLikeError): AppError | null {
  if (!err.code) return null;
  switch (err.code) {
    case '23505':
      return AppError.conflict('Resource already exists', err.details || err.message);
    case '23503':
      return AppError.badRequest('Related resource not found', err.details || err.message);
    case '23514':
      return AppError.validation('Constraint validation failed', err.details || err.message);
    case 'P0001':
      return AppError.badRequest(err.message || 'Operation rejected by database');
    default:
      return null;
  }
}

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  const pgMapped = mapDbError(err as PgLikeError);
  if (pgMapped) {
    res.status(pgMapped.statusCode).json({
      success: false,
      message: pgMapped.message,
      ...(pgMapped.details ? { details: pgMapped.details } : {}),
    });
    return;
  }

  logger.error('Unhandled server error', {
    error: err instanceof Error ? { message: err.message, stack: err.stack } : String(err),
  });

  res.status(500).json({ success: false, message: 'Internal Server Error' });
};
