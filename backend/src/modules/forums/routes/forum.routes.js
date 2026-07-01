import { Router } from 'express';
import { ForumController } from '../controllers/forum.controller.js';
import { authenticateToken } from '../../../config/auth.js';

const router = Router();

// POST /api/forums -> Create forum
router.post('/', authenticateToken, ForumController.create);

// GET /api/forums/:id -> Get single forum OR get forums by course (resolves dynamically)
router.get('/:id', authenticateToken, ForumController.getByIdOrCourse);

export default router;
