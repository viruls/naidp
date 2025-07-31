import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Validation errors
  if (err.message.includes('ValidationError') || err.message.includes('Invalid')) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: err.message
    });
  }

  // Not found errors
  if (err.message.includes('not found') || err.message.includes('Not found')) {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: err.message
    });
  }

  // Conflict errors
  if (err.message.includes('already exists') || err.message.includes('Conflict')) {
    return res.status(409).json({
      error: 'CONFLICT',
      message: err.message
    });
  }

  // Authorization errors
  if (err.message.includes('Unauthorized') || err.message.includes('Forbidden')) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Access denied'
    });
  }

  // Default error
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};