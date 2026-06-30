import { CourseService } from '../services/course.service.js';

export class CourseController {
  /**
   * Handles creating a new course.
   */
  static async create(req, res, next) {
    try {
      const { title, description } = req.body;
      const course = await CourseService.createCourse({ title, description, teacherId: req.user.id });
      return res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles retrieving all courses.
   */
  static async getAll(req, res, next) {
    try {
      let courses;
      if (req.user?.role === 'TEACHER') {
        courses = await CourseService.getCoursesByTeacher(req.user.id);
      } else {
        courses = await CourseService.getAllCourses();
      }
      return res.status(200).json(courses);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles retrieving a course by its ID.
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;
      const course = await CourseService.getCourseById(id);
      return res.status(200).json(course);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles updating a course by its ID.
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const existingCourse = await CourseService.getCourseById(id);
      if (req.user?.role !== 'ADMIN' && existingCourse.teacherId !== req.user?.id) {
        return res.status(403).json({ error: 'You are not allowed to update this course.' });
      }

      const { title, description } = req.body;
      const course = await CourseService.updateCourse(id, { title, description });
      return res.status(200).json(course);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles deleting a course by its ID.
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      const existingCourse = await CourseService.getCourseById(id);
      if (req.user?.role !== 'ADMIN' && existingCourse.teacherId !== req.user?.id) {
        return res.status(403).json({ error: 'You are not allowed to delete this course.' });
      }

      await CourseService.deleteCourse(id);
      return res.status(200).json({ message: 'Course deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
