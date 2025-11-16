import { body, param, query, ValidationChain } from 'express-validator';

// Validation for creating a user
export const createUserValidator: ValidationChain[] = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('role')
    .optional()
    .isIn(['tenant', 'landlord', 'admin'])
    .withMessage('Role must be one of: tenant, landlord, admin'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address must be less than 200 characters'),
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
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .toDate(),
  body('aadhaarNumber')
    .optional()
    .matches(/^\d{12}$/)
    .withMessage('Please provide a valid 12-digit Aadhaar number'),
  body('panNumber')
    .optional()
    .matches(/^[A-Z]{5}\d{4}[A-Z]{1}$/)
    .withMessage('Please provide a valid PAN number'),
];

// Validation for updating a user
export const updateUserValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number'),
  body('role')
    .optional()
    .isIn(['tenant', 'landlord', 'admin'])
    .withMessage('Role must be one of: tenant, landlord, admin'),
  body('isEmailVerified').optional().isBoolean().withMessage('isEmailVerified must be a boolean'),
  body('isPhoneVerified').optional().isBoolean().withMessage('isPhoneVerified must be a boolean'),
  body('profilePicture').optional().isURL().withMessage('Profile picture must be a valid URL'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Street address must be less than 200 characters'),
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
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .toDate(),
  body('aadhaarNumber')
    .optional()
    .matches(/^\d{12}$/)
    .withMessage('Please provide a valid 12-digit Aadhaar number'),
  body('panNumber')
    .optional()
    .matches(/^[A-Z]{5}\d{4}[A-Z]{1}$/)
    .withMessage('Please provide a valid PAN number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Validation for getting a user by ID
export const getUserByIdValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
];

// Validation for deleting a user
export const deleteUserValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid user ID'),
];

// Validation for query parameters (pagination, filtering)
export const getUsersValidator: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('role')
    .optional()
    .isIn(['tenant', 'landlord', 'admin'])
    .withMessage('Role must be one of: tenant, landlord, admin'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean').toBoolean(),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];
