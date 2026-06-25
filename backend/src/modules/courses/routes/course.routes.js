import { Router } from 'express';
import { CourseController } from '../controllers/course.controller.js';
import { authenticateToken, authorizeRole, verifyCourseOwner } from '../../../config/auth.js';
import {
  validateCreateCourse,
  validateUpdateCourse,
  validateCourseId
} from '../validations/course.validation.js';

const router = Router();

// Route for listing and creating courses
router.route('/')
  .get(authenticateToken, CourseController.getAll)
  .post(authenticateToken, authorizeRole(['TEACHER', 'ADMIN']), validateCreateCourse, CourseController.create);

// Routes for individual course operations by ID
router.route('/:id')
  .get(authenticateToken, validateCourseId, verifyCourseOwner, CourseController.getById)
  .put(authenticateToken, authorizeRole(['TEACHER', 'ADMIN']), validateUpdateCourse, verifyCourseOwner, CourseController.update)
  .delete(authenticateToken, authorizeRole(['TEACHER', 'ADMIN']), validateCourseId, verifyCourseOwner, CourseController.delete);

export default router;
