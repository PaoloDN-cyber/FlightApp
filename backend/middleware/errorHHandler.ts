import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
    });
  }

  console.error('Errore non gestito:', err);
  res.status(500).json({
    error: true,
    message: 'Errore interno del server',
  });
}

