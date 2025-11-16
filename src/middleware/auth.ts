import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';
import { asyncHandler, AppError } from './errorHandler';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Create an AppError with status code
 */
const createError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
};

/**
 * Extract token from request headers
 * Supports multiple formats:
 * - Authorization: Bearer <token>
 * - Authorization: bearer <token>
 * - Authorization: <token> (without Bearer prefix)
 */
const extractToken = (req: Request): string | null => {
  // Express normalizes headers to lowercase, so use 'authorization'
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Handle both string and string[] types
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;

  if (!headerValue) {
    return null;
  }

  // Trim whitespace
  const trimmedHeader = headerValue.trim();

  // Check for Bearer token format (case-insensitive)
  const bearerMatch = trimmedHeader.match(/^Bearer\s+(.+)$/i);
  if (bearerMatch && bearerMatch[1]) {
    return bearerMatch[1].trim();
  }

  // If no Bearer prefix, assume the entire value is the token
  // This handles cases where clients send just the token
  if (trimmedHeader.length > 0) {
    return trimmedHeader;
  }

  return null;
};

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    // Extract token from headers
    const token = extractToken(req);

    if (!token) {
      throw createError(
        'Authentication required. Please provide a token in the Authorization header as: Bearer <token>',
        401
      );
    }

    try {
      // Verify token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw createError('JWT secret is not configured', 500);
      }

      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        throw createError('User not found', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw createError('User account is deactivated', 401);
      }

      // Attach user to request
      req.user = {
        id: (user._id as mongoose.Types.ObjectId).toString(),
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      if (error instanceof Error) {
        // If it's already an AppError, rethrow it
        if ('statusCode' in error) {
          throw error;
        }

        // Handle JWT-specific errors
        if (error.name === 'JsonWebTokenError') {
          throw createError('Invalid token', 401);
        }
        if (error.name === 'TokenExpiredError') {
          throw createError('Token has expired', 401);
        }
      }
      throw error;
    }
  }
);

/**
 * Middleware to check if user has required role(s)
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(`Access denied. Required role: ${roles.join(' or ')}`, 403));
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token is provided
 * Useful for endpoints that work both with and without authentication
 */
export const optionalAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    // Extract token from headers
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return next();
      }

      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
      const user = (await User.findById(decoded.id).select('-password')) as IUser | null;

      if (user && user.isActive) {
        req.user = {
          id: (user._id as mongoose.Types.ObjectId).toString(),
          email: user.email,
          role: user.role,
        };
      }
    } catch (error) {
      // Silently fail for optional auth
    }

    next();
  }
);
