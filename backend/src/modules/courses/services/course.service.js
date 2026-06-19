import prisma from '../../../config/db.js';

export class CourseService {
  /**
   * Creates a new course.
   * Ensures that the teacher exists and has TEACHER or ADMIN privileges.
   */
  static async createCourse({ title, description, teacherId }) {
    // 1. Verify that teacher exists and has proper permissions
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      const error = new Error('Teacher with the specified ID does not exist.');
      error.statusCode = 404;
      throw error;
    }

    if (teacher.role !== 'TEACHER' && teacher.role !== 'ADMIN') {
      const error = new Error('Designated user is not authorized to teach courses (must be TEACHER or ADMIN).');
      error.statusCode = 403;
      throw error;
    }

    // 2. Create course and return it with basic teacher info
    return await prisma.course.create({
      data: {
        title,
        description: description || null,
        teacherId
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Retrieves all courses including basic teacher info.
   */
  static async getAllCourses() {
    return await prisma.course.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Retrieves a course by ID. Throws 404 if course is not found.
   */
  static async getCourseById(id) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    return course;
  }

  /**
   * Updates an existing course. Throws 404 if course is not found.
   */
  static async updateCourse(id, { title, description }) {
    // 1. Ensure course exists
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Build update payload dynamically
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;

    if (Object.keys(updateData).length === 0) {
      const error = new Error('At least one field (title or description) must be provided.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Update database record
    return await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  /**
   * Deletes a course. Throws 404 if course is not found.
   */
  static async deleteCourse(id) {
    // 1. Ensure course exists
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      const error = new Error('Course not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Perform deletion (cascade deletes sections/materials due to schema setup)
    return await prisma.course.delete({
      where: { id }
    });
  }
}
