export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Risorsa') {
    super(`${resource} non trovata`, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Richiesta non valida') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Accesso non autorizzato') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Accesso vietato') {
    super(message, 403);
  }
}
