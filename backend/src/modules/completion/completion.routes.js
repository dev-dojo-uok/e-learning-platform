import { Router } from 'express';
import { CompletionController } from './controllers/completion.controller.js';
import { authenticateToken } from '../../config/auth.js';

const router = Router();

router.route('/course/:courseId/progress')
  .get(
    authenticateToken,
    async (req, res, next) => {
      try {
        const studentId = req.user.id;
        const { courseId } = req.params;
        const progress = await CompletionController.getCourseProgress(studentId, courseId);
        res.status(200).json(progress);
      } catch (error) {
        next(error);
      }
    }
  );

export default router;
