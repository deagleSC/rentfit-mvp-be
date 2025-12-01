import { body, param, query, ValidationChain, CustomValidator } from 'express-validator';

// Custom validator to ensure either tenancyId or tenancyData is provided
const validateTenancyData: CustomValidator = (_value, { req }) => {
  const { tenancyId, tenancyData } = req.body;

  if (!tenancyId && !tenancyData) {
    throw new Error('Either tenancyId or tenancyData must be provided');
  }

  if (tenancyId && tenancyData) {
    throw new Error('Cannot provide both tenancyId and tenancyData. Provide only one.');
  }

  return true;
};

export const createAgreementValidator: ValidationChain[] = [
  body('tenancyId').optional().isMongoId().withMessage('Please provide a valid tenancy ID'),
  body('tenancyData')
    .optional()
    .isObject()
    .withMessage('tenancyData must be an object')
    .custom(validateTenancyData),
  body('tenancyData.ownerId')
    .if(body('tenancyData').exists())
    .notEmpty()
    .withMessage('Owner ID is required in tenancyData')
    .isMongoId()
    .withMessage('Please provide a valid owner ID'),
  body('tenancyData.tenantId')
    .if(body('tenancyData').exists())
    .notEmpty()
    .withMessage('Tenant ID is required in tenancyData')
    .isMongoId()
    .withMessage('Please provide a valid tenant ID'),
  body('tenancyData.unitId')
    .if(body('tenancyData').exists())
    .notEmpty()
    .withMessage('Unit ID is required in tenancyData')
    .isMongoId()
    .withMessage('Please provide a valid unit ID'),
  body('tenancyData.rent')
    .if(body('tenancyData').exists())
    .notEmpty()
    .withMessage('Rent information is required in tenancyData')
    .isObject()
    .withMessage('Rent must be an object'),
  body('tenancyData.rent.amount')
    .if(body('tenancyData.rent').exists())
    .notEmpty()
    .withMessage('Rent amount is required')
    .isNumeric()
    .withMessage('Rent amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Rent amount must be a positive number'),
  body('tenancyData.rent.cycle')
    .if(body('tenancyData.rent').exists())
    .optional()
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Rent cycle must be one of: monthly, quarterly, yearly'),
  body('tenancyData.rent.dueDateDay')
    .if(body('tenancyData.rent').exists())
    .optional()
    .isInt({ min: 1, max: 31 })
    .withMessage('Due date day must be between 1 and 31'),
  body('tenancyData.rent.utilitiesIncluded')
    .if(body('tenancyData.rent').exists())
    .optional()
    .isBoolean()
    .withMessage('Utilities included must be a boolean'),
  body('tenancyData.deposit')
    .if(body('tenancyData').exists())
    .optional()
    .isObject()
    .withMessage('Deposit must be an object'),
  body('tenancyData.deposit.amount')
    .if(body('tenancyData.deposit').exists())
    .optional()
    .isNumeric()
    .withMessage('Deposit amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Deposit amount must be a positive number'),
  body('tenancyData.deposit.status')
    .if(body('tenancyData.deposit').exists())
    .optional()
    .isIn(['upcoming', 'held', 'returned', 'disputed'])
    .withMessage('Deposit status must be one of: upcoming, held, returned, disputed'),
  // Ensure either tenancyId or tenancyData is provided
  body().custom(validateTenancyData),
  body('templateName')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Template name must be at most 200 characters'),
  body('stateCode')
    .optional()
    .isString()
    .isLength({ max: 10 })
    .withMessage('State code must be at most 10 characters'),
  body('clauses').optional().isArray().withMessage('Clauses must be an array'),
  body('clauses.*.text')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Clause text must be a non-empty string'),
  body('pdfUrl').optional().isURL().withMessage('PDF URL must be a valid URL'),
  body('version')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Version must be a positive integer')
    .toInt(),
  body('createdBy').optional().isMongoId().withMessage('Please provide a valid createdBy user ID'),
  body('status')
    .optional()
    .isIn(['draft', 'pending_signature', 'signed', 'cancelled'])
    .withMessage('Status must be one of: draft, pending_signature, signed, cancelled'),
  body('signers').optional().isArray().withMessage('Signers must be an array'),
  body('signers.*.userId')
    .optional()
    .isMongoId()
    .withMessage('Signer userId must be a valid Mongo ID'),
  body('signers.*.method')
    .optional()
    .isIn(['esign', 'otp', 'manual'])
    .withMessage('Signer method must be one of: esign, otp, manual'),
  body('signers.*.signedAt')
    .optional()
    .isISO8601()
    .withMessage('signedAt must be a valid ISO 8601 date')
    .toDate(),
];

export const updateAgreementValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid agreement ID'),
  body('templateName')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Template name must be at most 200 characters'),
  body('stateCode')
    .optional()
    .isString()
    .isLength({ max: 10 })
    .withMessage('State code must be at most 10 characters'),
  body('clauses').optional().isArray().withMessage('Clauses must be an array'),
  body('clauses.*.text')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('Clause text must be a non-empty string'),
  body('pdfUrl').optional().isURL().withMessage('PDF URL must be a valid URL'),
  body('version')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Version must be a positive integer')
    .toInt(),
  body('status')
    .optional()
    .isIn(['draft', 'pending_signature', 'signed', 'cancelled'])
    .withMessage('Status must be one of: draft, pending_signature, signed, cancelled'),
  body('signers').optional().isArray().withMessage('Signers must be an array'),
  body('signers.*.userId')
    .optional()
    .isMongoId()
    .withMessage('Signer userId must be a valid Mongo ID'),
  body('signers.*.method')
    .optional()
    .isIn(['esign', 'otp', 'manual'])
    .withMessage('Signer method must be one of: esign, otp, manual'),
  body('signers.*.signedAt')
    .optional()
    .isISO8601()
    .withMessage('signedAt must be a valid ISO 8601 date')
    .toDate(),
];

export const getAgreementByIdValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid agreement ID'),
];

export const deleteAgreementValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid agreement ID'),
];

export const getAgreementsValidator: ValidationChain[] = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('tenancyId').optional().isMongoId().withMessage('Please provide a valid tenancy ID'),
  query('tenantId').optional().isMongoId().withMessage('Please provide a valid tenant ID'),
  query('status')
    .optional()
    .isIn(['draft', 'pending_signature', 'signed', 'cancelled'])
    .withMessage('Status must be one of: draft, pending_signature, signed, cancelled'),
];

export const signAgreementValidator: ValidationChain[] = [
  param('id').isMongoId().withMessage('Please provide a valid agreement ID'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Please provide a valid user ID'),
  body('name')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Name must be at most 200 characters'),
  body('method')
    .optional()
    .isIn(['esign', 'otp', 'manual'])
    .withMessage('Signing method must be one of: esign, otp, manual'),
  body('meta').optional().isObject().withMessage('Meta must be an object'),
];
