import { Router } from 'express';
import {
  // Country controllers
  createCountry,
  getCountryById,
  getCountries,
  updateCountry,
  deleteCountry,
  // State controllers
  createState,
  getStateById,
  getStates,
  updateState,
  deleteState,
  // City controllers
  createCity,
  getCityById,
  getCities,
  updateCity,
  deleteCity,
} from '../controllers/staticController';
import {
  // Country validators
  createCountryValidator,
  updateCountryValidator,
  getCountryByIdValidator,
  deleteCountryValidator,
  getCountriesValidator,
  // State validators
  createStateValidator,
  updateStateValidator,
  getStateByIdValidator,
  deleteStateValidator,
  getStatesValidator,
  // City validators
  createCityValidator,
  updateCityValidator,
  getCityByIdValidator,
  deleteCityValidator,
  getCitiesValidator,
} from '../validators/staticValidator';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

// ==================== COUNTRY ROUTES ====================

/**
 * @route   POST /api/static/countries
 * @desc    Create a new country
 * @access  Public
 */
router.post('/countries', ...createCountryValidator, handleValidationErrors, createCountry);

/**
 * @route   GET /api/static/countries
 * @desc    Get all countries with pagination and filtering
 * @access  Public
 */
router.get('/countries', ...getCountriesValidator, handleValidationErrors, getCountries);

/**
 * @route   GET /api/static/countries/:id
 * @desc    Get country by ID
 * @access  Public
 */
router.get('/countries/:id', ...getCountryByIdValidator, handleValidationErrors, getCountryById);

/**
 * @route   PUT /api/static/countries/:id
 * @desc    Update country by ID
 * @access  Public
 */
router.put('/countries/:id', ...updateCountryValidator, handleValidationErrors, updateCountry);

/**
 * @route   DELETE /api/static/countries/:id
 * @desc    Delete country by ID
 * @access  Public
 */
router.delete('/countries/:id', ...deleteCountryValidator, handleValidationErrors, deleteCountry);

// ==================== STATE ROUTES ====================

/**
 * @route   POST /api/static/states
 * @desc    Create a new state
 * @access  Public
 */
router.post('/states', ...createStateValidator, handleValidationErrors, createState);

/**
 * @route   GET /api/static/states
 * @desc    Get all states with pagination and filtering
 * @access  Public
 */
router.get('/states', ...getStatesValidator, handleValidationErrors, getStates);

/**
 * @route   GET /api/static/states/:id
 * @desc    Get state by ID
 * @access  Public
 */
router.get('/states/:id', ...getStateByIdValidator, handleValidationErrors, getStateById);

/**
 * @route   PUT /api/static/states/:id
 * @desc    Update state by ID
 * @access  Public
 */
router.put('/states/:id', ...updateStateValidator, handleValidationErrors, updateState);

/**
 * @route   DELETE /api/static/states/:id
 * @desc    Delete state by ID
 * @access  Public
 */
router.delete('/states/:id', ...deleteStateValidator, handleValidationErrors, deleteState);

// ==================== CITY ROUTES ====================

/**
 * @route   POST /api/static/cities
 * @desc    Create a new city
 * @access  Public
 */
router.post('/cities', ...createCityValidator, handleValidationErrors, createCity);

/**
 * @route   GET /api/static/cities
 * @desc    Get all cities with pagination and filtering
 * @access  Public
 */
router.get('/cities', ...getCitiesValidator, handleValidationErrors, getCities);

/**
 * @route   GET /api/static/cities/:id
 * @desc    Get city by ID
 * @access  Public
 */
router.get('/cities/:id', ...getCityByIdValidator, handleValidationErrors, getCityById);

/**
 * @route   PUT /api/static/cities/:id
 * @desc    Update city by ID
 * @access  Public
 */
router.put('/cities/:id', ...updateCityValidator, handleValidationErrors, updateCity);

/**
 * @route   DELETE /api/static/cities/:id
 * @desc    Delete city by ID
 * @access  Public
 */
router.delete('/cities/:id', ...deleteCityValidator, handleValidationErrors, deleteCity);

export default router;

