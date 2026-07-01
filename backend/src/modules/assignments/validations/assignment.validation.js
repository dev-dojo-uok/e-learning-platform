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
 * Validation for creating an assignment.
 */
export const validateCreateAssignment = [
  body('courseId')
    .trim().notEmpty().withMessage('Course ID is required')
    .isUUID().withMessage('Course ID must be a valid UUID'),

  body('title')
    .isString().withMessage('Title must be a string')
    .trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isString().withMessage('Description must be a string'),

  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid date (ISO 8601 format)'),

  body('totalMarks')
    .optional()
    .isFloat({ min: 1 }).withMessage('Total marks must be a positive number'),

  handleValidationErrors
];

/**
 * Validation for updating an assignment.
 */
export const validateUpdateAssignment = [
  param('id')
    .trim().notEmpty().withMessage('Assignment ID is required')
    .isUUID().withMessage('Assignment ID must be a valid UUID'),

  body('title')
    .optional()
    .isString().withMessage('Title must be a string')
    .trim().notEmpty().withMessage('Title cannot be empty if provided')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isString().withMessage('Description must be a string'),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid date (ISO 8601 format)'),

  body('totalMarks')
    .optional()
    .isFloat({ min: 1 }).withMessage('Total marks must be a positive number'),

  handleValidationErrors
];

/**
 * Validation for UUID params.
 */
export const validateAssignmentId = [
  param('id')
    .trim().notEmpty().withMessage('Assignment ID is required')
    .isUUID().withMessage('Assignment ID must be a valid UUID'),

  handleValidationErrors
];

/**
 * Validation for submitting an assignment.
 */
export const validateSubmission = [
  param('id')
    .trim().notEmpty().withMessage('Assignment ID is required')
    .isUUID().withMessage('Assignment ID must be a valid UUID'),

  body('fileUrl')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage('File URL must be a valid URL'),

  body('notes')
    .optional({ nullable: true, checkFalsy: true })
    .isString().withMessage('Notes must be a string'),

  handleValidationErrors
];

/**
 * Validation for grading a submission.
 */
export const validateGrade = [
  param('submissionId')
    .trim().notEmpty().withMessage('Submission ID is required')
    .isUUID().withMessage('Submission ID must be a valid UUID'),

  body('grade')
    .notEmpty().withMessage('Grade is required')
    .isFloat({ min: 0 }).withMessage('Grade must be a non-negative number'),

  body('feedback')
    .optional({ nullable: true, checkFalsy: true })
    .isString().withMessage('Feedback must be a string'),

  handleValidationErrors
];