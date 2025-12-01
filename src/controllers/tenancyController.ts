import { Request, Response } from 'express';
import tenancyService from '../services/tenancyService';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponseHandler } from '../utils/response';

/**
 * @route   POST /api/tenancies
 * @desc    Create a new tenancy
 * @access  Public (for now, can be changed to private with auth)
 */
export const createTenancy = asyncHandler(async (req: Request, res: Response) => {
  const tenancy = await tenancyService.createTenancy(req.body);
  ApiResponseHandler.created(res, { tenancy }, 'Tenancy created successfully');
});

/**
 * @route   GET /api/tenancies/:id
 * @desc    Get tenancy by ID
 * @access  Public (for now, can be changed to private with auth)
 */
export const getTenancyById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenancy = await tenancyService.getTenancyById(id);
  ApiResponseHandler.success(res, { tenancy });
});

/**
 * @route   GET /api/tenancies
 * @desc    Get all tenancies with pagination and filtering
 * @access  Public (for now, can be changed to private with auth)
 */
export const getTenancies = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const ownerId = req.query.ownerId as string | undefined;
  const tenantId = req.query.tenantId as string | undefined;
  const unitId = req.query.unitId as string | undefined;
  const status = req.query.status as 'active' | 'terminated' | 'pendingRenewal' | undefined;

  const result = await tenancyService.getTenancies(
    {
      ownerId,
      tenantId,
      unitId,
      status,
    },
    { page, limit }
  );

  ApiResponseHandler.successWithPagination(res, result.tenancies, result.pagination);
});

/**
 * @route   PUT /api/tenancies/:id
 * @desc    Update tenancy by ID
 * @access  Public (for now, can be changed to private with auth)
 */
export const updateTenancy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenancy = await tenancyService.updateTenancy(id, req.body);
  ApiResponseHandler.success(res, { tenancy }, 'Tenancy updated successfully');
});

/**
 * @route   DELETE /api/tenancies/:id
 * @desc    Delete tenancy by ID
 * @access  Public (for now, can be changed to private with auth)
 */
export const deleteTenancy = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await tenancyService.deleteTenancy(id);
  ApiResponseHandler.success(res, null, 'Tenancy deleted successfully');
});
