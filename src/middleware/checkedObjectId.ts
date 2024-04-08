import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';

/**
 * Checks if the req.params.id is a valid Mongoose ObjectId.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @throws {Error} Throws an error if the ObjectId is invalid.
 */
function checkObjectId(req: Request, res: Response, next: NextFunction): void {
  if (!isValidObjectId(req.params.id)) {
    res.status(404);
    throw new Error(`Invalid ObjectId of: ${req.params.id}`);
  }
  next();
}

export default checkObjectId;
