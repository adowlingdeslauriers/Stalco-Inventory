import { Request, Response, NextFunction } from "express";
import { ApplicationError, NotFoundError } from "../utils/errors/errors.js";



export const errorHandler = (err: ApplicationError | any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApplicationError) {
    console.error(err);

    return res.status(err.statusCode).json({
      success: false,
      error: err.error,
      message: err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
      ...(err.details && { details: err.details })
    });
  }

  if (err.status === 429) {
    console.error('Rate Limit Exceeded:', err);

    return res.status(429).json({
      success: false,
      error: 'RateLimitExceeded',
      message: err.message || 'Too many requests, please try again later.'
    });
  }

  console.error('Unexpected Error:', err);
  res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: 'Internal Server Error',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Not Found - ${req.originalUrl}`));
};