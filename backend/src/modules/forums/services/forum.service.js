import prisma from '../../../config/db.js';

export class ForumService {
  /**
   * Creates a new forum.
   * Ensures that the associated course exists.
   */
  static async createForum({ courseId, moduleId, name, description, createdBy }) {
    // 1. Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      const error = new Error('Course with the specified ID does not exist.');
      error.statusCode = 404;
      throw error;
    }

    // 2. If moduleId is provided, verify it exists and belongs to the course
    if (moduleId) {
      const section = await prisma.courseSection.findFirst({
        where: { id: moduleId, courseId }
      });

      if (!section) {
        const error = new Error('Module section with the specified ID does not exist or does not belong to this course.');
        error.statusCode = 404;
        throw error;
      }
    }

    // 3. Create the forum
    return await prisma.forum.create({
      data: {
        courseId,
        moduleId: moduleId || null,
        name,
        description: description || null,
        createdBy
      },
      include: {
        creator: {
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
   * Retrieves all forums for a specific course.
   */
  static async getForumsByCourse(courseId) {
    return await prisma.forum.findMany({
      where: { courseId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            threads: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  /**
   * Retrieves a single forum by its ID.
   */
  static async getForumById(id) {
    const forum = await prisma.forum.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!forum) {
      const error = new Error('Forum not found.');
      error.statusCode = 404;
      throw error;
    }

    return forum;
  }
}
