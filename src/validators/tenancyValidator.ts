import { body, param, query, ValidationChain } from 'express-validator';

// Validation for creating a tenancy
export const createTenancyValidator: ValidationChain[] = [
  body('unitId')
    .notEmpty()
    .withMessage('Unit ID is required')
    .isMongoId()
    .withMessage('Please provide a valid unit ID'),
  body('ownerId')
    .notEmpty()
    .withMessage('Owner ID is required')
    .isMongoId()
    .withMessage('Please provide a valid owner ID'),
  body('tenantId')
    .notEmpty()
    .withMessage('Tenant ID is required')
    .isMongoId()
    .withMessage('Please provide a valid tenant ID'),
  body('agreementId').optional().isMongoId().withMessage('Please provide a valid agreement ID'),
  body('rent.amount')
    .notEmpty()
    .withMessage('Rent amount is required')
    .isFloat({ min: 0 })
    .withMessage('Rent amount must be a non-negative number')
    .toFloat(),
  body('rent.cycle')
    .optional()
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Rent cycle must be one of: monthly, quarterly, yearly'),
  body('rent.dueDateDay')
    .optional()
    .isInt({ min: 1, max: 31 })
    .withMessage('Due date day must be between 1 and 31')
    .toInt(),
  body('rent.utilitiesIncluded')
    .optional()
    .isBoolean()
    .withMessage('Utilities included must be a boolean')
    .toBoolean(),
  body('deposit.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deposit amount must be a non-negative number')
    .toFloat(),
  body('deposit.status')
    .optional()
    .isIn(['upcoming', 'held', 'returned', 'disputed'])
    .withMessage('Deposit status must be one of: upcoming, held, returned, disputed'),
  body('status')
    .optional()
    .isIn(['active', 'terminated', 'pendingRenewal'])
    .withMessage('Status must be one of: active, terminated, pendingRenewal'),
];

// Validation for updating a tenancy
export const updateTenancyValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid tenancy ID'),
  body('agreement.agreementId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid agreement ID'),
  body('agreement.pdfUrl').optional().isURL().withMessage('PDF URL must be a valid URL'),
  body('agreement.version')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Version must be a positive integer')
    .toInt(),
  body('agreement.signedAt')
    .optional()
    .isISO8601()
    .withMessage('Signed date must be a valid ISO 8601 date')
    .toDate(),
  body('rent.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Rent amount must be a non-negative number')
    .toFloat(),
  body('rent.cycle')
    .optional()
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Rent cycle must be one of: monthly, quarterly, yearly'),
  body('rent.dueDateDay')
    .optional()
    .isInt({ min: 1, max: 31 })
    .withMessage('Due date day must be between 1 and 31')
    .toInt(),
  body('rent.utilitiesIncluded')
    .optional()
    .isBoolean()
    .withMessage('Utilities included must be a boolean')
    .toBoolean(),
  body('deposit.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Deposit amount must be a non-negative number')
    .toFloat(),
  body('deposit.status')
    .optional()
    .isIn(['upcoming', 'held', 'returned', 'disputed'])
    .withMessage('Deposit status must be one of: upcoming, held, returned, disputed'),
  body('payments').optional().isArray().withMessage('Payments must be an array'),
  body('payments.*.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Payment amount must be a non-negative number')
    .toFloat(),
  body('payments.*.date')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid ISO 8601 date')
    .toDate(),
  body('payments.*.method')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Payment method must be less than 50 characters'),
  body('payments.*.reference')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Payment reference must be less than 100 characters'),
  body('payments.*.receiptUrl').optional().isURL().withMessage('Receipt URL must be a valid URL'),
  body('evidence').optional().isArray().withMessage('Evidence must be an array'),
  body('evidence.*.type')
    .optional()
    .isIn(['photo', 'video', 'document'])
    .withMessage('Evidence type must be one of: photo, video, document'),
  body('evidence.*.url').optional().isURL().withMessage('Evidence URL must be a valid URL'),
  body('evidence.*.uploaderId')
    .optional()
    .isMongoId()
    .withMessage('Please provide a valid uploader ID'),
  body('status')
    .optional()
    .isIn(['active', 'terminated', 'pendingRenewal'])
    .withMessage('Status must be one of: active, terminated, pendingRenewal'),
];

// Validation for getting a tenancy by ID
export const getTenancyByIdValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid tenancy ID'),
];

// Validation for deleting a tenancy
export const deleteTenancyValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid tenancy ID'),
];

// Validation for query parameters (pagination, filtering)
export const getTenanciesValidator: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('ownerId').optional().isMongoId().withMessage('Please provide a valid owner ID'),
  query('tenantId').optional().isMongoId().withMessage('Please provide a valid tenant ID'),
  query('unitId').optional().isMongoId().withMessage('Please provide a valid unit ID'),
  query('status')
    .optional()
    .isIn(['active', 'terminated', 'pendingRenewal'])
    .withMessage('Status must be one of: active, terminated, pendingRenewal'),
];
