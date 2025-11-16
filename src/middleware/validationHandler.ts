import { Request, Response, NextFunction } from 'express';
import { validationResult, Result } from 'express-validator';
import { ApiResponseHandler } from '../utils/response';

/**
 * Middleware to handle validation errors
 * Should be used after validation chains
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors: Result = validationResult(req);

  if (!errors.isEmpty()) {
    ApiResponseHandler.validationError(res, 'Validation failed', errors.array());
    return;
  }

  next();
};
