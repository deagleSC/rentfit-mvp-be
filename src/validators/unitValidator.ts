import { body, param, query, ValidationChain } from 'express-validator';

// Validation for creating a unit
export const createUnitValidator: ValidationChain[] = [
  body('ownerId')
    .notEmpty()
    .withMessage('Owner ID is required')
    .isMongoId()
    .withMessage('Please provide a valid owner ID'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('address.line1')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 1 must be less than 200 characters'),
  body('address.line2')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 must be less than 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  body('address.pincode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  body('geo.type')
    .optional()
    .equals('Point')
    .withMessage('Geo type must be "Point"'),
  body('geo.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of 2 numbers [longitude, latitude]')
    .custom((value) => {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error('Coordinates must be an array of 2 numbers');
      }
      const [lng, lat] = value;
      if (typeof lng !== 'number' || lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
  body('beds')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Beds must be a non-negative integer')
    .toInt(),
  body('areaSqFt')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Area must be a non-negative number')
    .toFloat(),
  body('status')
    .optional()
    .isIn(['vacant', 'occupied', 'maintenance'])
    .withMessage('Status must be one of: vacant, occupied, maintenance'),
];

// Validation for updating a unit
export const updateUnitValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid unit ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('address.line1')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 1 must be less than 200 characters'),
  body('address.line2')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address line 2 must be less than 200 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  body('address.pincode')
    .optional()
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  body('geo.type')
    .optional()
    .equals('Point')
    .withMessage('Geo type must be "Point"'),
  body('geo.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of 2 numbers [longitude, latitude]')
    .custom((value) => {
      if (!Array.isArray(value) || value.length !== 2) {
        throw new Error('Coordinates must be an array of 2 numbers');
      }
      const [lng, lat] = value;
      if (typeof lng !== 'number' || lng < -180 || lng > 180) {
        throw new Error('Longitude must be between -180 and 180');
      }
      if (typeof lat !== 'number' || lat < -90 || lat > 90) {
        throw new Error('Latitude must be between -90 and 90');
      }
      return true;
    }),
  body('photos')
    .optional()
    .isArray()
    .withMessage('Photos must be an array'),
  body('photos.*')
    .optional()
    .isURL()
    .withMessage('Each photo must be a valid URL'),
  body('beds')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Beds must be a non-negative integer')
    .toInt(),
  body('areaSqFt')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Area must be a non-negative number')
    .toFloat(),
  body('status')
    .optional()
    .isIn(['vacant', 'occupied', 'maintenance'])
    .withMessage('Status must be one of: vacant, occupied, maintenance'),
];

// Validation for getting a unit by ID
export const getUnitByIdValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid unit ID'),
];

// Validation for deleting a unit
export const deleteUnitValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid unit ID'),
];

// Validation for query parameters (pagination, filtering)
export const getUnitsValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('ownerId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid owner ID'),
  query('status')
    .optional()
    .isIn(['vacant', 'occupied', 'maintenance'])
    .withMessage('Status must be one of: vacant, occupied, maintenance'),
  query('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),
  query('state')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be between 1 and 100 characters'),
  query('minBeds')
    .optional()
    .isInt({ min: 0 })
    .withMessage('minBeds must be a non-negative integer')
    .toInt(),
  query('maxBeds')
    .optional()
    .isInt({ min: 0 })
    .withMessage('maxBeds must be a non-negative integer')
    .toInt(),
  query('minArea')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minArea must be a non-negative number')
    .toFloat(),
  query('maxArea')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxArea must be a non-negative number')
    .toFloat(),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

