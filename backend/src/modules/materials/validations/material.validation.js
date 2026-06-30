import { body, param, validationResult } from 'express-validator';

/**
 * Supported material type values exposed by the API.
 * These map internally to the MaterialType enum in the Prisma schema.
 */
export const SUPPORTED_MATERIAL_TYPES = ['PDF', 'VIDEO', 'YOUTUBE', 'DOCUMENT', 'IMAGE', 'ZIP'];

/**
 * Maps API-level material type strings to the Prisma MaterialType enum values.
 *   PDF      → PDF
 *   VIDEO    → VIDEO_SRC
 *   YOUTUBE  → VIDEO_EMBED
 *   DOCUMENT → FILE
 *   IMAGE    → FILE
 *   ZIP      → FILE
 */
export const MATERIAL_TYPE_MAP = {
  PDF: 'PDF',
  VIDEO: 'VIDEO_SRC',
  YOUTUBE: 'VIDEO_EMBED',
  DOCUMENT: 'FILE',
  IMAGE: 'FILE',
  ZIP: 'FILE'
};

/**
 * Common middleware to format and return validation errors if any.
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * Validation rules for creating a material.
 */
export const validateCreateMaterial = [
  body('sectionId')
    .trim()
    .notEmpty()
    .withMessage('Section ID is required')
    .isUUID()
    .withMessage('Section ID must be a valid UUID'),

  body('title')
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Description must be a string'),

  body('type')
    .trim()
    .notEmpty()
    .withMessage('Material type is required')
    .isIn(SUPPORTED_MATERIAL_TYPES)
    .withMessage(`Material type must be one of: ${SUPPORTED_MATERIAL_TYPES.join(', ')}`),

  body('contentUrl')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Content URL must be a string')
    .isURL()
    .withMessage('Content URL must be a valid URL'),

  body('embedCode')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Embed code must be a string'),

  body('isGraded')
    .optional()
    .isBoolean()
    .withMessage('isGraded must be a boolean value')
    .toBoolean(),

  body('gradingWeight')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Grading weight must be a number between 0 and 100')
    .toFloat(),

  handleValidationErrors
];

/**
 * Validation rules for updating a material.
 */
export const validateUpdateMaterial = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Material ID is required')
    .isUUID()
    .withMessage('Material ID must be a valid UUID'),

  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty if provided')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Description must be a string'),

  body('type')
    .optional()
    .isIn(SUPPORTED_MATERIAL_TYPES)
    .withMessage(`Material type must be one of: ${SUPPORTED_MATERIAL_TYPES.join(', ')}`),

  body('contentUrl')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Content URL must be a string')
    .isURL()
    .withMessage('Content URL must be a valid URL'),

  body('embedCode')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Embed code must be a string'),

  body('isGraded')
    .optional()
    .isBoolean()
    .withMessage('isGraded must be a boolean value')
    .toBoolean(),

  body('gradingWeight')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Grading weight must be a number between 0 and 100')
    .toFloat(),

  handleValidationErrors
];

/**
 * Validation rules for checking material ID format in path parameter.
 */
export const validateMaterialId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Material ID is required')
    .isUUID()
    .withMessage('Material ID must be a valid UUID'),

  handleValidationErrors
];

/**
 * Validation rules for checking sectionId format in path parameter.
 */
export const validateSectionIdParam = [
  param('sectionId')
    .trim()
    .notEmpty()
    .withMessage('Section ID is required')
    .isUUID()
    .withMessage('Section ID must be a valid UUID'),

  handleValidationErrors
];
