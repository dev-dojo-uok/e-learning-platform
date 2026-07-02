import { PostService } from '../services/post.service.js';

export class PostController {
  /**
   * Handles creating a new post/reply.
   */
  static async create(req, res, next) {
    try {
      const { threadId, parentPostId, content } = req.body;

      if (!threadId) {
        return res.status(400).json({ error: 'Thread ID is required.' });
      }
      if (!content) {
        return res.status(400).json({ error: 'Post content is required.' });
      }

      const post = await PostService.createPost({
        threadId,
        parentPostId,
        content,
        createdBy: req.user.id
      });

      return res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles retrieving all posts in a thread.
   */
  static async getByThread(req, res, next) {
    try {
      const { threadId } = req.params;

      if (!threadId) {
        return res.status(400).json({ error: 'Thread ID is required.' });
      }

      const posts = await PostService.getPostsByThread(threadId);
      return res.status(200).json(posts);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles updating a post's content.
   * Only the creator can edit their post.
   */
  static async update(req, res, next) {
    try {
      const { postId } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Post content is required.' });
      }

      // Check ownership
      const post = await PostService.getPostById(postId);
      if (post.createdBy !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only edit your own posts.' });
      }

      const updatedPost = await PostService.updatePost(postId, { content });
      return res.status(200).json(updatedPost);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles deleting a post.
   * Only the creator, or an instructor/admin can delete the post.
   */
  static async delete(req, res, next) {
    try {
      const { postId } = req.params;

      // Check ownership or role
      const post = await PostService.getPostById(postId);
      const isCreator = post.createdBy === req.user.id;
      const isPrivileged = req.user.role === 'TEACHER' || req.user.role === 'ADMIN';

      if (!isCreator && !isPrivileged) {
        return res.status(403).json({ error: 'Access denied. You can only delete your own posts.' });
      }

      await PostService.deletePost(postId);
      return res.status(200).json({ message: 'Post deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
