import prisma from '../../../config/db.js';

export class ModuleService {
  /**
   * Creates a new course module (CourseSection).
   * Validates that the parent course exists before creation.
   */
  static async createModule({ courseId, title, sortOrder }) {
    // 1. Verify that the parent course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      const error = new Error('Course with the specified ID does not exist.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Create module and return it with parent course info
    return await prisma.courseSection.create({
      data: {
        courseId,
        title,
        sortOrder
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            teacherId: true
          }
        }
      }
    });
  }

  /**
   * Retrieves all modules belonging to a specific course, sorted by sortOrder.
   * Throws 404 if the parent course does not exist.
   */
  static async getModulesByCourse(courseId) {
    // 1. Verify that the parent course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      const error = new Error('Course with the specified ID does not exist.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Retrieve all modules sorted by sortOrder
    return await prisma.courseSection.findMany({
      where: { courseId },
      orderBy: {
        sortOrder: 'asc'
      }
    });
  }

  /**
   * Updates an existing course module. Throws 404 if the module is not found.
   */
  static async updateModule(id, { title, sortOrder }) {
    // 1. Ensure module exists
    const module = await prisma.courseSection.findUnique({
      where: { id }
    });

    if (!module) {
      const error = new Error('Course module not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Build update payload dynamically
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    if (Object.keys(updateData).length === 0) {
      const error = new Error('At least one field (title or sortOrder) must be provided.');
      error.statusCode = 400;
      throw error;
    }

    // 3. Update database record
    return await prisma.courseSection.update({
      where: { id },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            teacherId: true
          }
        }
      }
    });
  }

  /**
   * Deletes a course module. Throws 404 if the module is not found.
   * Related Material records are cascade-deleted per schema rules.
   */
  static async deleteModule(id) {
    // 1. Ensure module exists
    const module = await prisma.courseSection.findUnique({
      where: { id }
    });

    if (!module) {
      const error = new Error('Course module not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Perform deletion (cascade deletes related materials due to schema onDelete: Cascade)
    return await prisma.courseSection.delete({
      where: { id }
    });
  }
}
