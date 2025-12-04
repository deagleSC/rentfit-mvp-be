import { Router } from 'express';
import {
  createTenancy,
  getTenancyById,
  getTenancies,
  updateTenancy,
  deleteTenancy,
} from '../controllers/tenancyController';
import {
  createTenancyValidator,
  updateTenancyValidator,
  getTenancyByIdValidator,
  deleteTenancyValidator,
  getTenanciesValidator,
} from '../validators/tenancyValidator';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

/**
 * @route   POST /api/tenancies
 * @desc    Create a new tenancy
 * @access  Public
 */
router.post('/', ...createTenancyValidator, handleValidationErrors, createTenancy);

/**
 * @route   GET /api/tenancies
 * @desc    Get all tenancies with pagination and filtering
 * @access  Public
 */
router.get('/', ...getTenanciesValidator, handleValidationErrors, getTenancies);

/**
 * @route   GET /api/tenancies/:id
 * @desc    Get tenancy by ID
 * @access  Public
 */
router.get('/:id', ...getTenancyByIdValidator, handleValidationErrors, getTenancyById);

/**
 * @route   PUT /api/tenancies/:id
 * @desc    Update tenancy by ID
 * @access  Public
 */
router.put('/:id', ...updateTenancyValidator, handleValidationErrors, updateTenancy);

/**
 * @route   DELETE /api/tenancies/:id
 * @desc    Delete tenancy by ID
 * @access  Public
 */
router.delete('/:id', ...deleteTenancyValidator, handleValidationErrors, deleteTenancy);

export default router;
