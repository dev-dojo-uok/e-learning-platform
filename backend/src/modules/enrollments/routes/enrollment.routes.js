import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller.js';
import { authenticateToken } from '../../../config/auth.js';
import {
  validateEnroll,
  validateIdParam,
  validateStudentIdParam,
  validateCourseIdParam
} from '../validations/enrollment.validation.js';

const router = Router();

// POST: /api/enrollments
router.post(
  '/enrollments',
  authenticateToken,
  validateEnroll,
  EnrollmentController.enroll
);

// DELETE: /api/enrollments/:id
router.delete(
  '/enrollments/:id',
  authenticateToken,
  validateIdParam,
  EnrollmentController.remove
);

// GET: /api/students/:studentId/courses
router.get(
  '/students/:studentId/courses',
  authenticateToken,
  validateStudentIdParam,
  EnrollmentController.getStudentCourses
);

// GET: /api/courses/:courseId/students
router.get(
  '/courses/:courseId/students',
  authenticateToken,
  validateCourseIdParam,
  EnrollmentController.getCourseStudents
);

export default router;
