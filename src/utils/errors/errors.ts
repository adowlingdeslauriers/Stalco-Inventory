// src/errors.ts

export class ApplicationError extends Error {
    statusCode: number;
    error: string;
    details: any;
  
    constructor(statusCode: number, message: string, error: string = 'ApplicationError', details: any = null) {
      super(message);
      this.statusCode = statusCode;
      this.error = error;
      this.details = details;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class NotFoundError extends ApplicationError {
    constructor(message: string = 'Resource not found') {
      super(404, message, 'NotFoundError');
    }
  }
  
  export class ConflictError extends ApplicationError {
    constructor(message: string = 'Resource conflict') {
      super(409, message, 'ConflictError');
    }
  }
  
  export class BadRequestError extends ApplicationError {
    constructor(message: string = 'Bad request') {
      super(400, message, 'BadRequestError');
    }
  }

  export class RateLimitError extends ApplicationError {
    constructor(message: string = 'Rate limit exceeded') {
      super(429, 'RateLimitError', message);
    }
  }
  