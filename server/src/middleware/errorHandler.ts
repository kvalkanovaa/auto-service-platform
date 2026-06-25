import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = err.statusCode ?? 500;
  let message = err.message ?? 'Internal Server Error';

  const mErr = err as AppError & {
    name?: string;
    errors?: Record<string, { message?: string }>;
  };
  if (mErr.name === 'ValidationError' && mErr.errors) {
    statusCode = 400;
    const first = Object.values(mErr.errors)[0];
    message = first?.message ?? message;
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const err: AppError = new Error(`Not Found — ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};
