// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ApplicationError, NotFoundError } from "../utils/errors/errors.js"

export const errorHandler = (err: ApplicationError | any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApplicationError) {
    // Log the error internally
    console.error(err);

    return res.status(err.statusCode).json({
      success: false,
      error: err.error,
      message: err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
      ...(err.details && { details: err.details })
    });
  }

  // Handle programming or unknown errors
  console.error('Unexpected Error:', err);
  res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: 'Internal Server Error',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
};

// Not found middleware to catch undefined routes
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Not Found - ${req.originalUrl}`));
};
