import { Router } from 'express';
import { QuizController } from './controllers/quiz.controller.js';
import { authenticateToken, authorizeRole, verifyCourseOwner, verifyQuizOwner, verifyAttemptOwner, verifyCourseEnrollment } from '../../config/auth.js';
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
    verifyCourseOwner,
    QuizController.create
  );

// Get Quizzes by Course ID (Authenticated Users)
router.route('/course/:courseId')
  .get(
    authenticateToken,
    validateCourseIdParam,
    verifyCourseEnrollment,
    QuizController.getByCourse
  );

// Quiz Attempts routes (placed before /:id routes to prevent routing conflict)
router.route('/attempts/:attemptId')
  .get(
    authenticateToken,
    validateAttemptIdParam,
    verifyAttemptOwner,
    QuizController.getAttemptById
  );

router.route('/attempts/:attemptId/submit')
  .put(
    authenticateToken,
    authorizeRole(['STUDENT']),
    verifyAttemptOwner,
    validateSubmitAttempt,
    QuizController.submitAttempt
  );

router.route('/attempts/:attemptId/draft')
  .put(
    authenticateToken,
    authorizeRole(['STUDENT']),
    verifyAttemptOwner,
    validateSubmitAttempt,
    QuizController.saveDraft
  );

router.route('/attempts/:attemptId/finalize')
  .put(
    authenticateToken,
    authorizeRole(['STUDENT']),
    validateAttemptIdParam,
    verifyAttemptOwner,
    QuizController.finalizeAttempt
  );

router.route('/attempts/:attemptId/grade')
  .put(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    validateGradeAttempt,
    verifyAttemptOwner,
    QuizController.gradeAttempt
  );

// Get, Update, and Delete Quiz by ID
router.route('/:id')
  .get(
    authenticateToken,
    validateQuizId,
    verifyQuizOwner,
    QuizController.getById
  )
  .put(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    validateUpdateQuiz,
    verifyQuizOwner,
    QuizController.update
  )
  .delete(
    authenticateToken,
    authorizeRole(['TEACHER', 'ADMIN']),
    validateQuizId,
    verifyQuizOwner,
    QuizController.delete
  );

// Start Quiz Attempt (Student)
router.route('/:id/attempt')
  .post(
    authenticateToken,
    authorizeRole(['STUDENT']),
    validateQuizId,
    verifyQuizOwner,
    QuizController.startAttempt
  );

// Get All Attempts for a Quiz (Authenticated Users)
router.route('/:id/attempts')
  .get(
    authenticateToken,
    validateQuizId,
    verifyQuizOwner,
    QuizController.getAttemptsByQuiz
  );

export default router;
