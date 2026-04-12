import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const status = err instanceof AppError ? err.statusCode : err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && err.stack ? { stack: err.stack } : {}),
  });
}
