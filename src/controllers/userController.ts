import { Request, Response } from 'express';
import userService from '../services/userService';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponseHandler } from '../utils/response';

/**
 * @route   POST /api/users
 * @desc    Create a new user (supports tenant and landlord roles)
 * @access  Public (for now, can be changed to private with auth)
 */
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  ApiResponseHandler.created(res, { user }, 'User created successfully');
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public (for now, can be changed to private with auth)
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  ApiResponseHandler.success(res, { user });
});

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  Public (for now, can be changed to private with auth)
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const role = req.query.role as 'tenant' | 'landlord' | 'admin' | undefined;
  const isActive =
    req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
  const search = req.query.search as string | undefined;

  const result = await userService.getUsers({ role, isActive, search }, { page, limit });

  ApiResponseHandler.successWithPagination(res, result.users, result.pagination);
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Public (for now, can be changed to private with auth)
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.updateUser(id, req.body);
  ApiResponseHandler.success(res, { user }, 'User updated successfully');
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Public (for now, can be changed to private with auth)
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await userService.deleteUser(id);
  ApiResponseHandler.success(res, null, 'User deleted successfully');
});

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user (soft delete)
 * @access  Public (for now, can be changed to private with auth)
 */
export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.deactivateUser(id);
  ApiResponseHandler.success(res, { user }, 'User deactivated successfully');
});
