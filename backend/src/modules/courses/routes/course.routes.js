import { Router } from 'express';
import { CourseController } from '../controllers/course.controller.js';
import {
  validateCreateCourse,
  validateUpdateCourse,
  validateCourseId
} from '../validations/course.validation.js';

const router = Router();

// Route for listing and creating courses
router.route('/')
  .get(CourseController.getAll)
  .post(validateCreateCourse, CourseController.create);

// Routes for individual course operations by ID
router.route('/:id')
  .get(validateCourseId, CourseController.getById)
  .put(validateUpdateCourse, CourseController.update)
  .delete(validateCourseId, CourseController.delete);

export default router;
