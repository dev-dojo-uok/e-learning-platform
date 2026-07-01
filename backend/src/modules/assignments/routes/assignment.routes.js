import { Router } from 'express';
import { AssignmentController } from '../controllers/assignment.controller.js';
import { authenticateToken, authorizeRole } from '../../../config/auth.js';
import {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateAssignmentId,
  validateSubmission,
  validateGrade
} from '../validations/assignment.validation.js';

const router = Router();

// ─── ASSIGNMENT ROUTES ───────────────────────────────────────────────────────

// Create assignment (Teacher/Admin only)
router.post(
  '/',
  authenticateToken,
  authorizeRole(['TEACHER', 'ADMIN']),
  validateCreateAssignment,
  AssignmentController.create
);

// Get all assignments for a course (Public)
router.get(
  '/course/:courseId',
  AssignmentController.getByCourse
);

// Get student's own submissions across all assignments (Student)
router.get(
  '/my-submissions',
  authenticateToken,
  authorizeRole(['STUDENT']),
  AssignmentController.getMyAllSubmissions
);

// Get single assignment by ID (Public)
router.get(
  '/:id',
  validateAssignmentId,
  AssignmentController.getById
);

// Update assignment (Teacher/Admin only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['TEACHER', 'ADMIN']),
  validateUpdateAssignment,
  AssignmentController.update
);

// Delete assignment (Teacher/Admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['TEACHER', 'ADMIN']),
  validateAssignmentId,
  AssignmentController.delete
);

// ─── SUBMISSION ROUTES ───────────────────────────────────────────────────────

// Student submits an assignment
router.post(
  '/:id/submit',
  authenticateToken,
  authorizeRole(['STUDENT']),
  validateSubmission,
  AssignmentController.submit
);

// Teacher views all submissions for an assignment
router.get(
  '/:id/submissions',
  authenticateToken,
  authorizeRole(['TEACHER', 'ADMIN']),
  validateAssignmentId,
  AssignmentController.getSubmissions
);

// Student views their own submission
router.get(
  '/:id/my-submission',
  authenticateToken,
  authorizeRole(['STUDENT']),
  validateAssignmentId,
  AssignmentController.getMySubmission
);

// Teacher grades a submission
router.put(
  '/submissions/:submissionId/grade',
  authenticateToken,
  authorizeRole(['TEACHER', 'ADMIN']),
  validateGrade,
  AssignmentController.grade
);

export default router;