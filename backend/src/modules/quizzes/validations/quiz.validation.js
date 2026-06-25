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
 * Validation rules for creating a quiz.
 */
export const validateCreateQuiz = [
  body('sectionId')
    .trim()
    .notEmpty()
    .withMessage('Section ID (sectionId) is required')
    .isUUID()
    .withMessage('Section ID must be a valid UUID'),

  body('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID (courseId) is required')
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

  body('hasTimeLimit')
    .optional()
    .isBoolean()
    .withMessage('hasTimeLimit must be a boolean value')
    .toBoolean(),

  body('timeLimitMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('timeLimitMinutes must be a non-negative integer')
    .toInt(),

  body('minPassMark')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('minPassMark must be a float between 0 and 100')
    .toFloat(),

  body('reviewPolicy')
    .optional()
    .trim()
    .isIn(['IMMEDIATE', 'LATER', 'NONE'])
    .withMessage('reviewPolicy must be one of: IMMEDIATE, LATER, NONE'),

  body('reviewPublishTime')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('reviewPublishTime must be a valid ISO8601 date string')
    .toDate(),

  body('attemptLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('attemptLimit must be an integer greater than or equal to 1')
    .toInt(),

  body('openTime')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('openTime must be a valid ISO8601 date string')
    .toDate(),

  body('closeTime')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('closeTime must be a valid ISO8601 date string')
    .toDate(),

  body('questionsJson')
    .notEmpty()
    .withMessage('questionsJson is required')
    .custom((value) => {
      // Must be an array of questions or parseable as one
      let parsed = value;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch (e) {
          throw new Error('questionsJson must be valid JSON');
        }
      }
      if (!Array.isArray(parsed)) {
        throw new Error('questionsJson must be an array of questions');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validation rules for updating a quiz.
 */
export const validateUpdateQuiz = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Quiz ID is required')
    .isUUID()
    .withMessage('Quiz ID must be a valid UUID'),

  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty if provided')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),

  body('hasTimeLimit')
    .optional()
    .isBoolean()
    .withMessage('hasTimeLimit must be a boolean value')
    .toBoolean(),

  body('timeLimitMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('timeLimitMinutes must be a non-negative integer')
    .toInt(),

  body('minPassMark')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('minPassMark must be a float between 0 and 100')
    .toFloat(),

  body('reviewPolicy')
    .optional()
    .trim()
    .isIn(['IMMEDIATE', 'LATER', 'NONE'])
    .withMessage('reviewPolicy must be one of: IMMEDIATE, LATER, NONE'),

  body('reviewPublishTime')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('reviewPublishTime must be a valid ISO8601 date string')
    .toDate(),

  body('attemptLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('attemptLimit must be an integer greater than or equal to 1')
    .toInt(),

  body('openTime')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('openTime must be a valid ISO8601 date string')
    .toDate(),

  body('closeTime')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('closeTime must be a valid ISO8601 date string')
    .toDate(),

  body('questionsJson')
    .optional()
    .custom((value) => {
      let parsed = value;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch (e) {
          throw new Error('questionsJson must be valid JSON');
        }
      }
      if (!Array.isArray(parsed)) {
        throw new Error('questionsJson must be an array of questions');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validation rules for checking ID format in path parameters.
 */
export const validateQuizId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Quiz ID is required')
    .isUUID()
    .withMessage('Quiz ID must be a valid UUID'),
  handleValidationErrors
];

export const validateCourseIdParam = [
  param('courseId')
    .trim()
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID()
    .withMessage('Course ID must be a valid UUID'),
  handleValidationErrors
];

export const validateAttemptIdParam = [
  param('attemptId')
    .trim()
    .notEmpty()
    .withMessage('Attempt ID is required')
    .isUUID()
    .withMessage('Attempt ID must be a valid UUID'),
  handleValidationErrors
];

/**
 * Validation rules for submitting a quiz attempt.
 */
export const validateSubmitAttempt = [
  param('attemptId')
    .trim()
    .notEmpty()
    .withMessage('Attempt ID is required')
    .isUUID()
    .withMessage('Attempt ID must be a valid UUID'),

  body('submittedAnswersJson')
    .notEmpty()
    .withMessage('submittedAnswersJson is required')
    .custom((value) => {
      let parsed = value;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch (e) {
          throw new Error('submittedAnswersJson must be valid JSON');
        }
      }
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('submittedAnswersJson must be an object mapping question IDs to answers');
      }
      return true;
    }),

  handleValidationErrors
];

/**
 * Validation rules for grading a quiz attempt manually.
 */
export const validateGradeAttempt = [
  param('attemptId')
    .trim()
    .notEmpty()
    .withMessage('Attempt ID is required')
    .isUUID()
    .withMessage('Attempt ID must be a valid UUID'),

  body('score')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('score must be a non-negative number')
    .toFloat(),

  body('teacherFeedback')
    .optional({ nullable: true })
    .isString()
    .withMessage('teacherFeedback must be a string'),

  handleValidationErrors
];
