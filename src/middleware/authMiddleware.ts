import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User, { UserDocument } from '../models/userModel.js';

declare global {
    namespace Express {
      interface Request {
        user?: UserDocument;
      }
    }
  }


const protect: RequestHandler = asyncHandler(async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin: RequestHandler = (req, res, next) => {
  if (req.user && (req.user as UserDocument).isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

export { protect, admin };
