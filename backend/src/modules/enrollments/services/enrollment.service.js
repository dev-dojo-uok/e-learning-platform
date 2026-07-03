import prisma from '../../../config/db.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

export class EnrollmentService {
  /**
   * Enrolls a student in a course.
   * Ensures student and course exist, handles duplicate enrollments.
   */
  static async enrollStudent({ studentId, courseId }, user) {
    // 1. Verify student exists
    if (!isValidUuid(studentId)) {
      const error = new Error('Student not found.');
      error.statusCode = 404;
      throw error;
    }
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });
    if (!student) {
      const error = new Error('Student not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Verify course exists
    if (!isValidUuid(courseId)) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    // Authorization guard: Students can only enroll themselves
    if (user && user.role === 'STUDENT' && user.id !== studentId) {
      const error = new Error('Access denied. Students can only enroll themselves.');
      error.statusCode = 403;
      throw error;
    }

    // 3. Create enrollment
    try {
      return await prisma.enrollment.create({
        data: { studentId, courseId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              teacherId: true
            }
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      // Prisma unique constraint violation code is P2002
      if (error.code === 'P2002') {
        const customError = new Error('Student is already enrolled in this course.');
        customError.statusCode = 409;
        throw customError;
      }
      throw error;
    }
  }

  /**
   * Gets all courses enrolled by a student.
   * Includes course details.
   */
  static async getStudentEnrolledCourses(studentId) {
    // 1. Verify student exists
    if (!isValidUuid(studentId)) {
      const error = new Error('Student not found.');
      error.statusCode = 404;
      throw error;
    }
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });
    if (!student) {
      const error = new Error('Student not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Get enrollments with course details
    return await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });
  }

  /**
   * Gets all students enrolled in a course.
   * Includes student details.
   */
  static async getCourseEnrolledStudents(courseId) {
    // 1. Verify course exists
    if (!isValidUuid(courseId)) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });
    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Get enrollments with student details
    return await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });
  }

  /**
   * Removes an enrollment by its ID.
   */
  static async removeEnrollment(id, user) {
    // 1. Verify enrollment exists
    if (!isValidUuid(id)) {
      const error = new Error('Enrollment not found.');
      error.statusCode = 404;
      throw error;
    }
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: true
      }
    });
    if (!enrollment) {
      const error = new Error('Enrollment not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Verify authorization rules
    if (user) {
      const { id: userId, role } = user;
      if (role === 'STUDENT' && enrollment.studentId !== userId) {
        const error = new Error('Access denied. You can only remove your own enrollment.');
        error.statusCode = 403;
        throw error;
      }
      if (role === 'TEACHER' && enrollment.course.teacherId !== userId) {
        const error = new Error('Access denied. You do not own this course.');
        error.statusCode = 403;
        throw error;
      }
    }

    // 3. Delete enrollment
    return await prisma.enrollment.delete({
      where: { id }
    });
  }
}
