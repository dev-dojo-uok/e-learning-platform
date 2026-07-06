import { EnrollmentService } from '../services/enrollment.service.js';

export class EnrollmentController {
  /**
   * Handles enrolling a student in a course.
   */
  static async enroll(req, res, next) {
    try {
      const { studentId, courseId } = req.body;
      const enrollment = await EnrollmentService.enrollStudent({ studentId, courseId }, req.user);
      return res.status(201).json({
        message: 'Student enrolled successfully',
        enrollment: {
          id: enrollment.id,
          studentId: enrollment.studentId,
          courseId: enrollment.courseId
        }
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          message: error.message,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Handles retrieving all courses enrolled by a student.
   */
  static async getStudentCourses(req, res, next) {
    try {
      const { studentId } = req.params;

      // Authorization guard: Students can only view their own enrollments
      if (req.user?.role === 'STUDENT' && req.user?.id !== studentId) {
        return res.status(403).json({
          message: 'Access denied. You can only view your own enrolled courses.',
          error: 'Access denied. You can only view your own enrolled courses.'
        });
      }

      const enrollments = await EnrollmentService.getStudentEnrolledCourses(studentId);
      return res.status(200).json(enrollments);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          message: error.message,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Handles retrieving all students enrolled in a course.
   */
  static async getCourseStudents(req, res, next) {
    try {
      const { courseId } = req.params;
      const enrollments = await EnrollmentService.getCourseEnrolledStudents(courseId);
      return res.status(200).json(enrollments);
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          message: error.message,
          error: error.message
        });
      }
      next(error);
    }
  }

  /**
   * Handles removing a student's enrollment.
   */
  static async remove(req, res, next) {
    try {
      const { id } = req.params;
      await EnrollmentService.removeEnrollment(id, req.user);
      return res.status(200).json({
        message: 'Enrollment removed successfully.'
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          message: error.message,
          error: error.message
        });
      }
      next(error);
    }
  }
}
