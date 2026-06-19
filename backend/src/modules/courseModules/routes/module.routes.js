import { Router } from 'express';
import { ModuleController } from '../controllers/module.controller.js';
import { authenticateToken, authorizeRole } from '../../../config/auth.js';
import {
  validateCreateModule,
  validateUpdateModule,
  validateModuleId,
  validateCourseIdParam
} from '../validations/module.validation.js';

const router = Router();

// Route for creating a new course module
router.route('/')
  .post(authenticateToken, authorizeRole(['TEACHER', 'ADMIN']), validateCreateModule, ModuleController.create);

// Route for retrieving all modules belonging to a specific course
router.route('/course/:courseId')
  .get(validateCourseIdParam, ModuleController.getByCourse);

// Routes for individual module operations by ID
router.route('/:id')
  .put(authenticateToken, authorizeRole(['TEACHER', 'ADMIN']), validateUpdateModule, ModuleController.update)
  .delete(authenticateToken, authorizeRole(['TEACHER', 'ADMIN']), validateModuleId, ModuleController.delete);

export default router;
