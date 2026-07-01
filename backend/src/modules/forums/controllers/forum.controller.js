import { ForumService } from '../services/forum.service.js';

export class ForumController {
  /**
   * Handles creating a new forum.
   */
  static async create(req, res, next) {
    try {
      const { courseId, moduleId, name, description } = req.body;

      if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required.' });
      }
      if (!name) {
        return res.status(400).json({ error: 'Forum name is required.' });
      }

      const forum = await ForumService.createForum({
        courseId,
        moduleId,
        name,
        description,
        createdBy: req.user.id
      });

      return res.status(201).json(forum);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles retrieving all forums for a course.
   */
  static async getByCourse(req, res, next) {
    try {
      const { courseId } = req.params;

      if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required.' });
      }

      const forums = await ForumService.getForumsByCourse(courseId);
      return res.status(200).json(forums);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles retrieving a single forum by ID.
   */
  static async getById(req, res, next) {
    try {
      const { forumId } = req.params;

      if (!forumId) {
        return res.status(400).json({ error: 'Forum ID is required.' });
      }

      const forum = await ForumService.getForumById(forumId);
      return res.status(200).json(forum);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles retrieving a single forum OR all forums of a course using a single ID parameter.
   * This resolves the route conflict between GET /api/forums/:forumId and GET /api/forums/:courseId.
   */
  static async getByIdOrCourse(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID parameter is required.' });
      }

      try {
        // 1. Try to fetch as a single forum
        const forum = await ForumService.getForumById(id);
        return res.status(200).json(forum);
      } catch (error) {
        // 2. If forum is not found, attempt to fetch forums for the course
        if (error.statusCode === 404) {
          const forums = await ForumService.getForumsByCourse(id);
          return res.status(200).json(forums);
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  }
}
