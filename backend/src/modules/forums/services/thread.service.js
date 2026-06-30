import prisma from '../../../config/db.js';

export class ThreadService {
  /**
   * Creates a new thread.
   * Ensures the forum exists.
   */
  static async createThread({ forumId, title, createdBy }) {
    // 1. Verify forum exists
    const forum = await prisma.forum.findUnique({
      where: { id: forumId }
    });

    if (!forum) {
      const error = new Error('Forum not found.');
      error.statusCode = 404;
      throw error;
    }

    // 2. Create thread
    return await prisma.forumThread.create({
      data: {
        forumId,
        title,
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
   * Retrieves all threads in a specific forum.
   */
  static async getThreadsByForum(forumId) {
    // Verify forum exists first
    const forumExists = await prisma.forum.findUnique({
      where: { id: forumId }
    });

    if (!forumExists) {
      const error = new Error('Forum not found.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.forumThread.findMany({
      where: { forumId },
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
            posts: true
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Retrieves a single thread by ID and automatically increments its view count.
   */
  static async getThreadById(id) {
    try {
      return await prisma.forumThread.update({
        where: { id },
        data: {
          views: {
            increment: 1
          }
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          forum: {
            select: {
              id: true,
              name: true,
              courseId: true
            }
          },
          _count: {
            select: {
              posts: true
            }
          }
        }
      });
    } catch (error) {
      // If record not found, Prisma throws P2025
      if (error.code === 'P2025') {
        const customError = new Error('Thread not found.');
        customError.statusCode = 404;
        throw customError;
      }
      throw error;
    }
  }

  /**
   * Sets the pin status of a thread.
   */
  static async updateThreadPin(id, isPinned) {
    try {
      return await prisma.forumThread.update({
        where: { id },
        data: { isPinned },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        const customError = new Error('Thread not found.');
        customError.statusCode = 404;
        throw customError;
      }
      throw error;
    }
  }

  /**
   * Sets the lock status of a thread.
   */
  static async updateThreadLock(id, isLocked) {
    try {
      return await prisma.forumThread.update({
        where: { id },
        data: { isLocked },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        const customError = new Error('Thread not found.');
        customError.statusCode = 404;
        throw customError;
      }
      throw error;
    }
  }

  /**
   * Manually increments view count of a thread.
   */
  static async incrementViews(id) {
    try {
      return await prisma.forumThread.update({
        where: { id },
        data: {
          views: {
            increment: 1
          }
        },
        select: {
          id: true,
          views: true
        }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        const customError = new Error('Thread not found.');
        customError.statusCode = 404;
        throw customError;
      }
      throw error;
    }
  }
}
