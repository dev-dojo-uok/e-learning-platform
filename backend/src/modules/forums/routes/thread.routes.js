import { Router } from 'express';
import { ThreadController } from '../controllers/thread.controller.js';
import { authenticateToken } from '../../../config/auth.js';

const router = Router();

// POST /api/threads -> Create thread
router.post('/', authenticateToken, ThreadController.create);

// GET /api/threads/forum/:forumId -> Get all threads in forum
router.get('/forum/:forumId', authenticateToken, ThreadController.getByForum);

// GET /api/threads/:threadId -> Get single thread with details
router.get('/:threadId', authenticateToken, ThreadController.getById);

// PATCH /api/threads/:threadId/pin -> Pin/unpin thread
router.patch('/:threadId/pin', authenticateToken, ThreadController.updatePin);

// PATCH /api/threads/:threadId/lock -> Lock/unlock thread
router.patch('/:threadId/lock', authenticateToken, ThreadController.updateLock);

// PATCH /api/threads/:threadId/views -> Increment view count
router.patch('/:threadId/views', authenticateToken, ThreadController.incrementViews);

export default router;
