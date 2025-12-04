import { Router } from 'express';
import {
  createAgreement,
  getAgreementById,
  getAgreements,
  updateAgreement,
  deleteAgreement,
  signAgreement,
} from '../controllers/agreementController';
import {
  createAgreementValidator,
  updateAgreementValidator,
  getAgreementByIdValidator,
  deleteAgreementValidator,
  getAgreementsValidator,
  signAgreementValidator,
} from '../validators/agreementValidator';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

/**
 * @route   POST /api/agreements
 * @desc    Create a new agreement
 * @access  Public
 */
router.post('/', ...createAgreementValidator, handleValidationErrors, createAgreement);

/**
 * @route   GET /api/agreements
 * @desc    Get agreements with pagination and filtering
 * @access  Public
 */
router.get('/', ...getAgreementsValidator, handleValidationErrors, getAgreements);

/**
 * @route   POST /api/agreements/:id/sign
 * @desc    Sign an agreement
 * @access  Public
 */
router.post('/:id/sign', ...signAgreementValidator, handleValidationErrors, signAgreement);

/**
 * @route   GET /api/agreements/:id
 * @desc    Get agreement by ID
 * @access  Public
 */
router.get('/:id', ...getAgreementByIdValidator, handleValidationErrors, getAgreementById);

/**
 * @route   PUT /api/agreements/:id
 * @desc    Update agreement by ID
 * @access  Public
 */
router.put('/:id', ...updateAgreementValidator, handleValidationErrors, updateAgreement);

/**
 * @route   DELETE /api/agreements/:id
 * @desc    Delete agreement by ID
 * @access  Public
 */
router.delete('/:id', ...deleteAgreementValidator, handleValidationErrors, deleteAgreement);

export default router;
