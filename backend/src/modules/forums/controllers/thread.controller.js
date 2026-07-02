import { ThreadService } from '../services/thread.service.js';

export class ThreadController {
  /**
   * Handles creating a new thread.
   */
  static async create(req, res, next) {
    try {
      const { forumId, title } = req.body;

      if (!forumId) {
        return res.status(400).json({ error: 'Forum ID is required.' });
      }
      if (!title) {
        return res.status(400).json({ error: 'Thread title is required.' });
      }

      const thread = await ThreadService.createThread({
        forumId,
        title,
        createdBy: req.user.id
      });

      return res.status(201).json(thread);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles retrieving all threads in a forum.
   */
  static async getByForum(req, res, next) {
    try {
      const { forumId } = req.params;

      if (!forumId) {
        return res.status(400).json({ error: 'Forum ID is required.' });
      }

      const threads = await ThreadService.getThreadsByForum(forumId);
      return res.status(200).json(threads);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles retrieving a single thread (automatically increments view count).
   */
  static async getById(req, res, next) {
    try {
      const { threadId } = req.params;

      if (!threadId) {
        return res.status(400).json({ error: 'Thread ID is required.' });
      }

      const thread = await ThreadService.getThreadById(threadId);
      return res.status(200).json(thread);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles pinning/unpinning a thread.
   * Only TEACHER or ADMIN roles are permitted.
   */
  static async updatePin(req, res, next) {
    try {
      const { threadId } = req.params;
      const { isPinned } = req.body;

      if (isPinned === undefined) {
        return res.status(400).json({ error: 'isPinned status (boolean) is required.' });
      }

      if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Only teachers or admins can pin threads.' });
      }

      const thread = await ThreadService.updateThreadPin(threadId, !!isPinned);
      return res.status(200).json(thread);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles locking/unlocking a thread.
   * Only TEACHER or ADMIN roles are permitted.
   */
  static async updateLock(req, res, next) {
    try {
      const { threadId } = req.params;
      const { isLocked } = req.body;

      if (isLocked === undefined) {
        return res.status(400).json({ error: 'isLocked status (boolean) is required.' });
      }

      if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Only teachers or admins can lock threads.' });
      }

      const thread = await ThreadService.updateThreadLock(threadId, !!isLocked);
      return res.status(200).json(thread);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles manual increment of thread view count.
   */
  static async incrementViews(req, res, next) {
    try {
      const { threadId } = req.params;

      if (!threadId) {
        return res.status(400).json({ error: 'Thread ID is required.' });
      }

      const result = await ThreadService.incrementViews(threadId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
