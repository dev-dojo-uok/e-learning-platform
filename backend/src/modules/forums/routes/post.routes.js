import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { authenticateToken } from '../../../config/auth.js';

const router = Router();

// POST /api/posts -> Create post (reply to thread)
router.post('/', authenticateToken, PostController.create);

// GET /api/posts/thread/:threadId -> Get all posts in thread
router.get('/thread/:threadId', authenticateToken, PostController.getByThread);

// PATCH /api/posts/:postId -> Edit post
router.patch('/:postId', authenticateToken, PostController.update);

// DELETE /api/posts/:postId -> Delete post
router.delete('/:postId', authenticateToken, PostController.delete);

export default router;
