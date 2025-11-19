import { Router } from 'express';
import {
  createUnit,
  getUnitById,
  getUnits,
  updateUnit,
  deleteUnit,
} from '../controllers/unitController';
import {
  createUnitValidator,
  updateUnitValidator,
  getUnitByIdValidator,
  deleteUnitValidator,
  getUnitsValidator,
} from '../validators/unitValidator';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

/**
 * @route   POST /api/units
 * @desc    Create a new unit
 * @access  Public
 */
router.post('/', ...createUnitValidator, handleValidationErrors, createUnit);

/**
 * @route   GET /api/units
 * @desc    Get all units with pagination and filtering
 * @access  Public
 */
router.get('/', ...getUnitsValidator, handleValidationErrors, getUnits);

/**
 * @route   GET /api/units/:id
 * @desc    Get unit by ID
 * @access  Public
 */
router.get('/:id', ...getUnitByIdValidator, handleValidationErrors, getUnitById);

/**
 * @route   PUT /api/units/:id
 * @desc    Update unit by ID
 * @access  Public
 */
router.put('/:id', ...updateUnitValidator, handleValidationErrors, updateUnit);

/**
 * @route   DELETE /api/units/:id
 * @desc    Delete unit by ID
 * @access  Public
 */
router.delete('/:id', ...deleteUnitValidator, handleValidationErrors, deleteUnit);

export default router;

