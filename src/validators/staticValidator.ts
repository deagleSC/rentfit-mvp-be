import { body, param, query, ValidationChain } from 'express-validator';

// ==================== COUNTRY VALIDATORS ====================

// Validation for creating countries (array only)
export const createCountryValidator: ValidationChain[] = [
  body()
    .isArray()
    .withMessage('Request body must be an array')
    .notEmpty()
    .withMessage('Array cannot be empty')
    .custom((value) => {
      // Validate each item in the array
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item.name || typeof item.name !== 'string' || item.name.trim().length < 2 || item.name.trim().length > 100) {
          throw new Error(`Item ${i}: Country name must be between 2 and 100 characters`);
        }
        if (!item.code || typeof item.code !== 'string' || !/^[A-Z]{2}$/.test(item.code.trim())) {
          throw new Error(`Item ${i}: Country code must be a 2-letter uppercase ISO code`);
        }
        if (item.phoneCode && (typeof item.phoneCode !== 'string' || item.phoneCode.trim().length > 10)) {
          throw new Error(`Item ${i}: Phone code must be less than 10 characters`);
        }
        if (item.isActive !== undefined && typeof item.isActive !== 'boolean') {
          throw new Error(`Item ${i}: isActive must be a boolean`);
        }
      }
      return true;
    }),
];

// Validation for updating a country
export const updateCountryValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid country ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Country name must be between 2 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Country code cannot be empty')
    .matches(/^[A-Z]{2}$/)
    .withMessage('Country code must be a 2-letter uppercase ISO code'),
  body('phoneCode')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Phone code must be less than 10 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
];

// Validation for getting a country by ID
export const getCountryByIdValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid country ID'),
];

// Validation for deleting a country
export const deleteCountryValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid country ID'),
];

// Validation for query parameters (pagination, filtering)
export const getCountriesValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Limit must be between 1 and 500')
    .toInt(),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

// ==================== STATE VALIDATORS ====================

// Validation for creating states (array only)
export const createStateValidator: ValidationChain[] = [
  body()
    .isArray()
    .withMessage('Request body must be an array')
    .notEmpty()
    .withMessage('Array cannot be empty')
    .custom((value) => {
      // Validate each item in the array
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item.name || typeof item.name !== 'string' || item.name.trim().length < 2 || item.name.trim().length > 100) {
          throw new Error(`Item ${i}: State name must be between 2 and 100 characters`);
        }
        if (item.code && (typeof item.code !== 'string' || item.code.trim().length > 10)) {
          throw new Error(`Item ${i}: State code must be less than 10 characters`);
        }
        if (!item.countryId || typeof item.countryId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(item.countryId)) {
          throw new Error(`Item ${i}: Please provide a valid country ID`);
        }
        if (item.isActive !== undefined && typeof item.isActive !== 'boolean') {
          throw new Error(`Item ${i}: isActive must be a boolean`);
        }
      }
      return true;
    }),
];

// Validation for updating a state
export const updateStateValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid state ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('State name must be between 2 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('State code must be less than 10 characters'),
  body('countryId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid country ID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
];

// Validation for getting a state by ID
export const getStateByIdValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid state ID'),
];

// Validation for deleting a state
export const deleteStateValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid state ID'),
];

// Validation for query parameters (pagination, filtering)
export const getStatesValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Limit must be between 1 and 500')
    .toInt(),
  query('countryId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid country ID'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

// ==================== CITY VALIDATORS ====================

// Validation for creating cities (array only)
export const createCityValidator: ValidationChain[] = [
  body()
    .isArray()
    .withMessage('Request body must be an array')
    .notEmpty()
    .withMessage('Array cannot be empty')
    .custom((value) => {
      // Validate each item in the array
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (!item.name || typeof item.name !== 'string' || item.name.trim().length < 2 || item.name.trim().length > 100) {
          throw new Error(`Item ${i}: City name must be between 2 and 100 characters`);
        }
        if (!item.stateId || typeof item.stateId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(item.stateId)) {
          throw new Error(`Item ${i}: Please provide a valid state ID`);
        }
        if (item.isActive !== undefined && typeof item.isActive !== 'boolean') {
          throw new Error(`Item ${i}: isActive must be a boolean`);
        }
      }
      return true;
    }),
];

// Validation for updating a city
export const updateCityValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid city ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('City name must be between 2 and 100 characters'),
  body('stateId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid state ID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
];

// Validation for getting a city by ID
export const getCityByIdValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid city ID'),
];

// Validation for deleting a city
export const deleteCityValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid city ID'),
];

// Validation for query parameters (pagination, filtering)
export const getCitiesValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Limit must be between 1 and 500')
    .toInt(),
  query('stateId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid state ID'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

