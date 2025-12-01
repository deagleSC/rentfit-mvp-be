import { Request, Response } from 'express';
import agreementService from '../services/agreementService';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponseHandler } from '../utils/response';

/**
 * @route   POST /api/agreements
 * @desc    Create a new agreement
 * @access  Public (can be secured later with auth)
 */
export const createAgreement = asyncHandler(async (req: Request, res: Response) => {
  const agreement = await agreementService.createAgreement(req.body);
  ApiResponseHandler.created(res, { agreement }, 'Agreement created successfully');
});

/**
 * @route   GET /api/agreements/:id
 * @desc    Get agreement by ID
 * @access  Public (can be secured later with auth)
 */
export const getAgreementById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const agreement = await agreementService.getAgreementById(id);
  ApiResponseHandler.success(res, { agreement });
});

/**
 * @route   GET /api/agreements
 * @desc    Get agreements with pagination and filtering
 * @access  Public (can be secured later with auth)
 */
export const getAgreements = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const tenancyId = req.query.tenancyId as string | undefined;
  const tenantId = req.query.tenantId as string | undefined;
  const status = req.query.status as any;

  const result = await agreementService.getAgreements(
    {
      tenancyId,
      tenantId,
      status,
    },
    { page, limit }
  );

  ApiResponseHandler.successWithPagination(res, result.agreements, result.pagination);
});

/**
 * @route   PUT /api/agreements/:id
 * @desc    Update agreement by ID
 * @access  Public (can be secured later with auth)
 */
export const updateAgreement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const agreement = await agreementService.updateAgreement(id, req.body);
  ApiResponseHandler.success(res, { agreement }, 'Agreement updated successfully');
});

/**
 * @route   DELETE /api/agreements/:id
 * @desc    Delete agreement by ID
 * @access  Public (can be secured later with auth)
 */
export const deleteAgreement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await agreementService.deleteAgreement(id);
  ApiResponseHandler.success(res, null, 'Agreement deleted successfully');
});

/**
 * @route   POST /api/agreements/:id/sign
 * @desc    Sign an agreement
 * @access  Public (can be secured later with auth)
 */
export const signAgreement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, name, method, meta } = req.body;
  const agreement = await agreementService.signAgreement(id, userId, {
    name,
    method,
    meta,
  });
  ApiResponseHandler.success(res, { agreement }, 'Agreement signed successfully');
});
