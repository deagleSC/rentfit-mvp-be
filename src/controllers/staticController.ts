import { Request, Response } from 'express';
import staticService from '../services/staticService';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponseHandler } from '../utils/response';

// ==================== COUNTRY CONTROLLERS ====================

/**
 * @route   POST /api/static/countries
 * @desc    Create multiple countries
 * @access  Public
 */
export const createCountry = asyncHandler(async (req: Request, res: Response) => {
  if (!Array.isArray(req.body)) {
    const error: any = new Error('Request body must be an array');
    error.statusCode = 400;
    throw error;
  }
  if (req.body.length === 0) {
    const error: any = new Error('Array cannot be empty');
    error.statusCode = 400;
    throw error;
  }
  const countries = await staticService.createCountries(req.body);
  ApiResponseHandler.created(
    res,
    { countries, count: countries.length },
    `${countries.length} countr${countries.length === 1 ? 'y' : 'ies'} created successfully`
  );
});

/**
 * @route   GET /api/static/countries/:id
 * @desc    Get country by ID
 * @access  Public
 */
export const getCountryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const country = await staticService.getCountryById(id);
  ApiResponseHandler.success(res, { country });
});

/**
 * @route   GET /api/static/countries
 * @desc    Get all countries with pagination and filtering
 * @access  Public
 */
export const getCountries = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const search = req.query.search as string | undefined;

  const result = await staticService.getCountries(
    {
      isActive,
      search,
    },
    { page, limit }
  );

  ApiResponseHandler.successWithPagination(res, result.data, result.pagination);
});

/**
 * @route   PUT /api/static/countries/:id
 * @desc    Update country by ID
 * @access  Public
 */
export const updateCountry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const country = await staticService.updateCountry(id, req.body);
  ApiResponseHandler.success(res, { country }, 'Country updated successfully');
});

/**
 * @route   DELETE /api/static/countries/:id
 * @desc    Delete country by ID
 * @access  Public
 */
export const deleteCountry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await staticService.deleteCountry(id);
  ApiResponseHandler.success(res, null, 'Country deleted successfully');
});

// ==================== STATE CONTROLLERS ====================

/**
 * @route   POST /api/static/states
 * @desc    Create multiple states
 * @access  Public
 */
export const createState = asyncHandler(async (req: Request, res: Response) => {
  if (!Array.isArray(req.body)) {
    const error: any = new Error('Request body must be an array');
    error.statusCode = 400;
    throw error;
  }
  if (req.body.length === 0) {
    const error: any = new Error('Array cannot be empty');
    error.statusCode = 400;
    throw error;
  }
  const states = await staticService.createStates(req.body);
  ApiResponseHandler.created(
    res,
    { states, count: states.length },
    `${states.length} state${states.length === 1 ? '' : 's'} created successfully`
  );
});

/**
 * @route   GET /api/static/states/:id
 * @desc    Get state by ID
 * @access  Public
 */
export const getStateById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const state = await staticService.getStateById(id);
  ApiResponseHandler.success(res, { state });
});

/**
 * @route   GET /api/static/states
 * @desc    Get all states with pagination and filtering
 * @access  Public
 */
export const getStates = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const countryId = req.query.countryId as string | undefined;
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const search = req.query.search as string | undefined;

  const result = await staticService.getStates(
    {
      countryId,
      isActive,
      search,
    },
    { page, limit }
  );

  ApiResponseHandler.successWithPagination(res, result.data, result.pagination);
});

/**
 * @route   PUT /api/static/states/:id
 * @desc    Update state by ID
 * @access  Public
 */
export const updateState = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const state = await staticService.updateState(id, req.body);
  ApiResponseHandler.success(res, { state }, 'State updated successfully');
});

/**
 * @route   DELETE /api/static/states/:id
 * @desc    Delete state by ID
 * @access  Public
 */
export const deleteState = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await staticService.deleteState(id);
  ApiResponseHandler.success(res, null, 'State deleted successfully');
});

// ==================== CITY CONTROLLERS ====================

/**
 * @route   POST /api/static/cities
 * @desc    Create multiple cities
 * @access  Public
 */
export const createCity = asyncHandler(async (req: Request, res: Response) => {
  if (!Array.isArray(req.body)) {
    const error: any = new Error('Request body must be an array');
    error.statusCode = 400;
    throw error;
  }
  if (req.body.length === 0) {
    const error: any = new Error('Array cannot be empty');
    error.statusCode = 400;
    throw error;
  }
  const cities = await staticService.createCities(req.body);
  ApiResponseHandler.created(
    res,
    { cities, count: cities.length },
    `${cities.length} cit${cities.length === 1 ? 'y' : 'ies'} created successfully`
  );
});

/**
 * @route   GET /api/static/cities/:id
 * @desc    Get city by ID
 * @access  Public
 */
export const getCityById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const city = await staticService.getCityById(id);
  ApiResponseHandler.success(res, { city });
});

/**
 * @route   GET /api/static/cities
 * @desc    Get all cities with pagination and filtering
 * @access  Public
 */
export const getCities = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 100;
  const stateId = req.query.stateId as string | undefined;
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const search = req.query.search as string | undefined;

  const result = await staticService.getCities(
    {
      stateId,
      isActive,
      search,
    },
    { page, limit }
  );

  ApiResponseHandler.successWithPagination(res, result.data, result.pagination);
});

/**
 * @route   PUT /api/static/cities/:id
 * @desc    Update city by ID
 * @access  Public
 */
export const updateCity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const city = await staticService.updateCity(id, req.body);
  ApiResponseHandler.success(res, { city }, 'City updated successfully');
});

/**
 * @route   DELETE /api/static/cities/:id
 * @desc    Delete city by ID
 * @access  Public
 */
export const deleteCity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await staticService.deleteCity(id);
  ApiResponseHandler.success(res, null, 'City deleted successfully');
});
