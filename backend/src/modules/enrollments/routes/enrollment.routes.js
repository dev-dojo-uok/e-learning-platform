import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller.js';
import { authenticateToken, authorizeRole, verifyCourseOwner } from '../../../config/auth.js';
import {
  validateEnroll,
  validateIdParam,
  validateStudentIdParam,
  validateCourseIdParam
} from '../validations/enrollment.validation.js';

const enrollmentRoutes = Router();
const studentEnrollmentRoutes = Router();
const courseEnrollmentRoutes = Router();

// POST: /api/enrollments
enrollmentRoutes.post(
  '/',
  authenticateToken,
  validateEnroll,
  EnrollmentController.enroll
);

// DELETE: /api/enrollments/:id
enrollmentRoutes.delete(
  '/:id',
  authenticateToken,
  validateIdParam,
  EnrollmentController.remove
);

// GET: /api/students/:studentId/courses
studentEnrollmentRoutes.get(
  '/:studentId/courses',
  authenticateToken,
  validateStudentIdParam,
  EnrollmentController.getStudentCourses
);

// GET: /api/courses/:courseId/students
courseEnrollmentRoutes.get(
  '/:courseId/students',
  authenticateToken,
  authorizeRole(['TEACHER', 'ADMIN']),
  validateCourseIdParam,
  verifyCourseOwner,
  EnrollmentController.getCourseStudents
);

export { enrollmentRoutes, studentEnrollmentRoutes, courseEnrollmentRoutes };
