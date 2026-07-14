import { Router } from 'express';
import multer from 'multer';
import { AssignmentController } from '../controllers/assignment.controller.js';
import { authenticateToken, authorizeRole, verifyAssignmentAccess, verifyCourseEnrollment } from '../../../config/auth.js';
import {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateAssignmentId,
  validateSubmission,
  validateGrade
} from '../validations/assignment.validation.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// ─── ASSIGNMENT ROUTES ───────────────────────────────────────────────────────

// Create assignment (Teacher/Admin only)
router.post(
  '/',
  authenticateToken,
  authorizeRole(['TEACHER', 'ADMIN']),
  validateCreateAssignment,
  AssignmentController.create
);

// Get all assignments for a course (Authenticated and enrolled only)
router.get(
  '/course/:courseId',
  authenticateToken,
  verifyCourseEnrollment,
  AssignmentController.getByCourse
);

// Get student's own submissions across all assignments (Student)
router.get(
  '/my-submissions',
  authenticateToken,
  authorizeRole(['STUDENT']),
  AssignmentController.getMyAllSubmissions
);

// Get single assignment by ID
router.get(
  '/:id',
  authenticateToken,
  validateAssignmentId,
  verifyAssignmentAccess,
  AssignmentController.getById
);

// Update assignment (Teacher/Admin only)
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['TEACHER', 'ADMIN']),
  validateUpdateAssignment,
  verifyAssignmentAccess,
  AssignmentController.update
);

// Delete assignment (Teacher/Admin only)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['TEACHER', 'ADMIN']),
  validateAssignmentId,
  verifyAssignmentAccess,
  AssignmentController.delete
);

// ─── SUBMISSION ROUTES ───────────────────────────────────────────────────────

// Student submits an assignment
router.post(
  '/:id/submit',
  authenticateToken,
  authorizeRole(['STUDENT']),
  verifyAssignmentAccess,
  upload.single('file'),
  validateSubmission,
  AssignmentController.submit
);

// Teacher views all submissions for an assignment
router.get(
  '/:id/submissions',
  authenticateToken,
  authorizeRole(['TEACHER', 'ADMIN']),
  validateAssignmentId,
  verifyAssignmentAccess,
  AssignmentController.getSubmissions
);

// Student views their own submission
router.get(
  '/:id/my-submission',
  authenticateToken,
  authorizeRole(['STUDENT']),
  validateAssignmentId,
  verifyAssignmentAccess,
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