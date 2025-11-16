import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  getCurrentUser,
  changePassword,
} from '../controllers/authController';
import {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} from '../validators/authValidator';
import { authenticate } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', ...registerValidator, handleValidationErrors, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', ...loginValidator, handleValidationErrors, login);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Private
 */
router.post('/refresh-token', authenticate, refreshToken);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticate,
  ...changePasswordValidator,
  handleValidationErrors,
  changePassword
);

export default router;
