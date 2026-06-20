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
 * Validation rules for creating a course.
 */
export const validateCreateCourse = [
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
  
  body('teacherId')
    .trim()
    .notEmpty()
    .withMessage('Teacher ID is required')
    .isUUID()
    .withMessage('Teacher ID must be a valid UUID'),
  
  handleValidationErrors
];

/**
 * Validation rules for updating a course.
 */
export const validateUpdateCourse = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID()
    .withMessage('Course ID must be a valid UUID'),
  
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
  
  handleValidationErrors
];

/**
 * Validation rules for checking course ID format in path parameter.
 */
export const validateCourseId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID()
    .withMessage('Course ID must be a valid UUID'),
  
  handleValidationErrors
];
