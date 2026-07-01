import prisma from '../../../config/db.js';

export class PostService {
  /**
   * Creates a new post (reply to thread).
   * Supports nested replies using parentPostId.
   */
  static async createPost({ threadId, parentPostId, content, createdBy }) {
    // 1. Verify thread exists and is not locked
    const thread = await prisma.forumThread.findUnique({
      where: { id: threadId }
    });

    if (!thread) {
      const error = new Error('Thread not found.');
      error.statusCode = 404;
      throw error;
    }

    if (thread.isLocked) {
      const error = new Error('Cannot reply to a locked thread.');
      error.statusCode = 400;
      throw error;
    }

    // 2. If parentPostId is provided, verify it exists and belongs to the same thread
    if (parentPostId) {
      const parentPost = await prisma.forumPost.findFirst({
        where: { id: parentPostId, threadId }
      });

      if (!parentPost) {
        const error = new Error('Parent post not found in this thread.');
        error.statusCode = 404;
        throw error;
      }
    }

    // 3. Create post
    return await prisma.forumPost.create({
      data: {
        threadId,
        parentPostId: parentPostId || null,
        content,
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
   * Retrieves all posts in a thread.
   */
  static async getPostsByThread(threadId) {
    // Verify thread exists
    const threadExists = await prisma.forumThread.findUnique({
      where: { id: threadId }
    });

    if (!threadExists) {
      const error = new Error('Thread not found.');
      error.statusCode = 404;
      throw error;
    }

    return await prisma.forumPost.findMany({
      where: { threadId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        parentPost: {
          select: {
            id: true,
            createdBy: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  /**
   * Retrieves a single post by ID.
   */
  static async getPostById(id) {
    const post = await prisma.forumPost.findUnique({
      where: { id }
    });

    if (!post) {
      const error = new Error('Post not found.');
      error.statusCode = 404;
      throw error;
    }

    return post;
  }

  /**
   * Updates a post's content and sets isEdited to true.
   */
  static async updatePost(id, { content }) {
    try {
      return await prisma.forumPost.update({
        where: { id },
        data: {
          content,
          isEdited: true
        },
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
        const customError = new Error('Post not found.');
        customError.statusCode = 404;
        throw customError;
      }
      throw error;
    }
  }

  /**
   * Deletes a post.
   */
  static async deletePost(id) {
    try {
      return await prisma.forumPost.delete({
        where: { id }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        const customError = new Error('Post not found.');
        customError.statusCode = 404;
        throw customError;
      }
      throw error;
    }
  }
}
