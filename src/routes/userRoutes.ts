import { Router } from 'express';
import {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  deactivateUser,
} from '../controllers/userController';
import {
  createUserValidator,
  updateUserValidator,
  getUserByIdValidator,
  deleteUserValidator,
  getUsersValidator,
} from '../validators/userValidator';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 */
router.post('/', ...createUserValidator, handleValidationErrors, createUser);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filtering
 * @access  Public
 */
router.get('/', ...getUsersValidator, handleValidationErrors, getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
router.get('/:id', ...getUserByIdValidator, handleValidationErrors, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Public
 */
router.put('/:id', ...updateUserValidator, handleValidationErrors, updateUser);

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user (soft delete)
 * @access  Public
 */
router.patch('/:id/deactivate', ...getUserByIdValidator, handleValidationErrors, deactivateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Public
 */
router.delete('/:id', ...deleteUserValidator, handleValidationErrors, deleteUser);

export default router;
