import { Request, Response } from 'express';
import authService from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponseHandler } from '../utils/response';

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  ApiResponseHandler.created(res, result, 'User registered successfully');
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  ApiResponseHandler.success(res, result, 'Login successful');
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return ApiResponseHandler.unauthorized(res, 'Authentication required');
  }

  const result = await authService.refreshToken(req.user.id);
  ApiResponseHandler.success(res, result, 'Token refreshed successfully');
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return ApiResponseHandler.unauthorized(res, 'Authentication required');
  }

  const user = await authService.getCurrentUser(req.user.id);
  ApiResponseHandler.success(res, { user });
});

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return ApiResponseHandler.unauthorized(res, 'Authentication required');
  }

  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  ApiResponseHandler.success(res, null, 'Password changed successfully');
});
