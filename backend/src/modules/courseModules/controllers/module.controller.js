import { ModuleService } from '../services/module.service.js';

export class ModuleController {
  /**
   * Handles creating a new course module.
   */
  static async create(req, res, next) {
    try {
      const { courseId, title, sortOrder } = req.body;
      const module = await ModuleService.createModule({ courseId, title, sortOrder });
      return res.status(201).json(module);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles retrieving all modules belonging to a specific course.
   */
  static async getByCourse(req, res, next) {
    try {
      const { courseId } = req.params;
      const modules = await ModuleService.getModulesByCourse(courseId);
      return res.status(200).json(modules);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles updating a course module by its ID.
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, sortOrder } = req.body;
      const module = await ModuleService.updateModule(id, { title, sortOrder });
      return res.status(200).json(module);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles deleting a course module by its ID.
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await ModuleService.deleteModule(id);
      return res.status(200).json({ message: 'Course module deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
