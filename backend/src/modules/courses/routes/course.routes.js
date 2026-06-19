import { Router } from 'express';
import { CourseController } from '../controllers/course.controller.js';
import { authenticateToken, authorizeRole } from '../../../config/auth.js';
import {
  validateCreateCourse,
  validateUpdateCourse,
  validateCourseId
} from '../validations/course.validation.js';

const router = Router();

// Route for listing and creating courses
router.route('/')
  .get(CourseController.getAll)
  .post(authenticateToken, authorizeRole(['TEACHER', 'ADMIN']), validateCreateCourse, CourseController.create);

// Routes for individual course operations by ID
router.route('/:id')
  .get(validateCourseId, CourseController.getById)
  .put(authenticateToken, authorizeRole(['TEACHER', 'ADMIN']), validateUpdateCourse, CourseController.update)
  .delete(authenticateToken, authorizeRole(['TEACHER', 'ADMIN']), validateCourseId, CourseController.delete);

export default router;
