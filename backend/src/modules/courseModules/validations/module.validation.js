import { body, param, validationResult } from 'express-validator';

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
 * Validation rules for creating a course module.
 */
export const validateCreateModule = [
  body('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID()
    .withMessage('Course ID must be a valid UUID'),

  body('title')
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('sortOrder')
    .notEmpty()
    .withMessage('Sort order is required')
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
    .toInt(),

  handleValidationErrors
];

/**
 * Validation rules for updating a course module.
 */
export const validateUpdateModule = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Module ID is required')
    .isUUID()
    .withMessage('Module ID must be a valid UUID'),

  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty if provided')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),

  handleValidationErrors
];

/**
 * Validation rules for checking module ID format in path parameter.
 */
export const validateModuleId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Module ID is required')
    .isUUID()
    .withMessage('Module ID must be a valid UUID'),

  handleValidationErrors
];

/**
 * Validation rules for checking courseId format in path parameter.
 */
export const validateCourseIdParam = [
  param('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID()
    .withMessage('Course ID must be a valid UUID'),

  handleValidationErrors
];
