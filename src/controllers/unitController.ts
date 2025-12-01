import { Request, Response } from 'express';
import unitService from '../services/unitService';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponseHandler } from '../utils/response';

/**
 * @route   POST /api/units
 * @desc    Create a new unit
 * @access  Public (for now, can be changed to private with auth)
 */
export const createUnit = asyncHandler(async (req: Request, res: Response) => {
  const unit = await unitService.createUnit(req.body);
  ApiResponseHandler.created(res, { unit }, 'Unit created successfully');
});

/**
 * @route   GET /api/units/:id
 * @desc    Get unit by ID
 * @access  Public (for now, can be changed to private with auth)
 */
export const getUnitById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const unit = await unitService.getUnitById(id);
  ApiResponseHandler.success(res, { unit });
});

/**
 * @route   GET /api/units
 * @desc    Get all units with pagination and filtering
 * @access  Public (for now, can be changed to private with auth)
 */
export const getUnits = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const ownerId = req.query.ownerId as string | undefined;
  const status = req.query.status as 'vacant' | 'occupied' | 'maintenance' | undefined;
  const city = req.query.city as string | undefined;
  const state = req.query.state as string | undefined;
  const minBeds = req.query.minBeds ? parseInt(req.query.minBeds as string) : undefined;
  const maxBeds = req.query.maxBeds ? parseInt(req.query.maxBeds as string) : undefined;
  const minArea = req.query.minArea ? parseInt(req.query.minArea as string) : undefined;
  const maxArea = req.query.maxArea ? parseInt(req.query.maxArea as string) : undefined;
  const search = req.query.search as string | undefined;

  const result = await unitService.getUnits(
    {
      ownerId,
      status,
      city,
      state,
      minBeds,
      maxBeds,
      minArea,
      maxArea,
      search,
    },
    { page, limit }
  );

  ApiResponseHandler.successWithPagination(res, result.units, result.pagination);
});

/**
 * @route   PUT /api/units/:id
 * @desc    Update unit by ID
 * @access  Public (for now, can be changed to private with auth)
 */
export const updateUnit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const unit = await unitService.updateUnit(id, req.body);
  ApiResponseHandler.success(res, { unit }, 'Unit updated successfully');
});

/**
 * @route   DELETE /api/units/:id
 * @desc    Delete unit by ID
 * @access  Public (for now, can be changed to private with auth)
 */
export const deleteUnit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await unitService.deleteUnit(id);
  ApiResponseHandler.success(res, null, 'Unit deleted successfully');
});
