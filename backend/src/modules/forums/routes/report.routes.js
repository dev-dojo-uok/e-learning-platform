import { Router } from 'express';
import { ReportController } from '../controllers/report.controller.js';
import { authenticateToken } from '../../../config/auth.js';

const router = Router();

// POST /api/reports -> Create a content report
router.post('/', authenticateToken, ReportController.create);

// GET /api/reports -> Get all content reports (Teachers/Admins)
router.get('/', authenticateToken, ReportController.getAll);

// PATCH /api/reports/:reportId/resolve -> Resolve content report
router.patch('/:reportId/resolve', authenticateToken, ReportController.resolve);

export default router;
