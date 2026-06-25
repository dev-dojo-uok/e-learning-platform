import { Router } from 'express';
import { QuizController } from './controllers/quiz.controller.js';
import { authenticateToken, authorizeRole } from '../../config/auth.js';
import {
  validateCreateQuiz,
  validateUpdateQuiz,
  validateQuizId,
  validateCourseIdParam,
  validateAttemptIdParam,
  validateSubmitAttempt,
  validateGradeAttempt
} from './validations/quiz.validation.js';

const router = Router();

// Create Quiz (Teacher/Admin)
router.route('/')
  .post(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    validateCreateQuiz,
    QuizController.create
  );

// Get Quizzes by Course ID (Authenticated Users)
router.route('/course/:courseId')
  .get(
    authenticateToken,
    validateCourseIdParam,
    QuizController.getByCourse
  );

// Quiz Attempts routes (placed before /:id routes to prevent routing conflict)
router.route('/attempts/:attemptId')
  .get(
    authenticateToken,
    validateAttemptIdParam,
    QuizController.getAttemptById
  );

router.route('/attempts/:attemptId/submit')
  .put(
    authenticateToken,
    authorizeRole(['STUDENT']),
    validateSubmitAttempt,
    QuizController.submitAttempt
  );

router.route('/attempts/:attemptId/grade')
  .put(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    validateGradeAttempt,
    QuizController.gradeAttempt
  );

// Get, Update, and Delete Quiz by ID
router.route('/:id')
  .get(
    authenticateToken,
    validateQuizId,
    QuizController.getById
  )
  .put(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    validateUpdateQuiz,
    QuizController.update
  )
  .delete(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    validateQuizId,
    QuizController.delete
  );

// Start Quiz Attempt (Student)
router.route('/:id/attempt')
  .post(
    authenticateToken,
    authorizeRole(['STUDENT']),
    validateQuizId,
    QuizController.startAttempt
  );

// Get All Attempts for a Quiz (Authenticated Users)
router.route('/:id/attempts')
  .get(
    authenticateToken,
    validateQuizId,
    QuizController.getAttemptsByQuiz
  );

export default router;
