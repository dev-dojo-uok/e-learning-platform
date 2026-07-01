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
 * Validation rules for creating an enrollment.
 * Leaves format checks to service for 404 alignment.
 */
export const validateEnroll = [
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required'),
  
  body('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required'),
  
  handleValidationErrors
];

/**
 * Validation rules for checking ID parameters.
 */
export const validateIdParam = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('ID parameter is required'),
  handleValidationErrors
];

export const validateStudentIdParam = [
  param('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required'),
  handleValidationErrors
];

export const validateCourseIdParam = [
  param('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required'),
  handleValidationErrors
];
