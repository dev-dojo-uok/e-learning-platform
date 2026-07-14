import api from '../../../lib/axios';

/**
 * Retrieves forums by course ID.
 * @param {string} courseId - The course ID.
 * @returns {Promise<Array>} List of forums.
 */
export async function getForumsByCourse(courseId) {
  try {
    const response = await api.get(`/forums/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Forum API Error:', error);
    throw error;
  }
}

/**
 * Retrieves a single forum by ID.
 * @param {string} forumId - The forum ID.
 * @returns {Promise<Object>} Forum data.
 */
export async function getForumById(forumId) {
  try {
    const response = await api.get(`/forums/${forumId}`);
    return response.data;
  } catch (error) {
    console.error('Forum API Error:', error);
    throw error;
  }
}

/**
 * Creates a new forum.
 * @param {Object} forumData - { title, description, courseId, moduleId }
 * @returns {Promise<Object>} Created forum.
 */
export async function createForum(forumData) {
  try {
    const response = await api.post('/forums', forumData);
    return response.data;
  } catch (error) {
    console.error('Forum API Error:', error);
    throw error;
  }
}

// ─── Thread API ──────────────────────────────────────────────────────────────

/**
 * Retrieves all threads in a forum.
 * @param {string} forumId - The forum ID.
 * @returns {Promise<Array>} List of threads.
 */
export async function getThreadsByForum(forumId) {
  try {
    const response = await api.get(`/threads/forum/${forumId}`);
    return response.data;
  } catch (error) {
    console.error('Thread API Error:', error);
    throw error;
  }
}

/**
 * Retrieves a single thread with its posts.
 * @param {string} threadId - The thread ID.
 * @returns {Promise<Object>} Thread with posts.
 */
export async function getThreadById(threadId) {
  try {
    const response = await api.get(`/threads/${threadId}`);
    return response.data;
  } catch (error) {
    console.error('Thread API Error:', error);
    throw error;
  }
}

/**
 * Creates a new thread.
 * @param {Object} threadData - { title, content, forumId }
 * @returns {Promise<Object>} Created thread.
 */
export async function createThread(threadData) {
  try {
    const response = await api.post('/threads', threadData);
    return response.data;
  } catch (error) {
    console.error('Thread API Error:', error);
    throw error;
  }
}

/**
 * Increments thread view count.
 * @param {string} threadId - The thread ID.
 */
export async function incrementThreadViews(threadId) {
  try {
    await api.patch(`/threads/${threadId}/views`);
  } catch (error) {
    // Silently fail — non-critical
  }
}

// ─── Post API ─────────────────────────────────────────────────────────────────

/**
 * Retrieves all posts in a thread.
 * @param {string} threadId - The thread ID.
 * @returns {Promise<Array>} List of posts.
 */
export async function getPostsByThread(threadId) {
  try {
    const response = await api.get(`/posts/thread/${threadId}`);
    return response.data;
  } catch (error) {
    console.error('Post API Error:', error);
    throw error;
  }
}

/**
 * Creates a new post (reply).
 * @param {Object} postData - { content, threadId, parentPostId? }
 * @returns {Promise<Object>} Created post.
 */
export async function createPost(postData) {
  try {
    const response = await api.post('/posts', postData);
    return response.data;
  } catch (error) {
    console.error('Post API Error:', error);
    throw error;
  }
}

/**
 * Edits an existing post.
 * @param {string} postId - The post ID.
 * @param {Object} data - { content }
 * @returns {Promise<Object>} Updated post.
 */
export async function updatePost(postId, data) {
  try {
    const response = await api.patch(`/posts/${postId}`, data);
    return response.data;
  } catch (error) {
    console.error('Post API Error:', error);
    throw error;
  }
}

/**
 * Deletes a post.
 * @param {string} postId - The post ID.
 * @returns {Promise<Object>} Deletion confirmation.
 */
export async function deletePost(postId) {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Post API Error:', error);
    throw error;
  }
}

// ─── Reports API ─────────────────────────────────────────────────────────────

/**
 * Creates a moderation report for a post or thread.
 * @param {Object} reportData - { reason, postId?, threadId? }
 */
export async function createReport(reportData) {
  try {
    const response = await api.post('/reports', reportData);
    return response.data;
  } catch (error) {
    console.error('Report API Error:', error);
    throw error;
  }
}

/**
 * Retrieves all content reports.
 */
export async function getReports() {
  try {
    const response = await api.get('/reports');
    return response.data;
  } catch (error) {
    console.error('Report API Error:', error);
    throw error;
  }
}

/**
 * Resolves a moderation report.
 * @param {string} reportId - The ID of the report to resolve.
 */
export async function resolveReport(reportId) {
  try {
    const response = await api.patch(`/reports/${reportId}/resolve`);
    return response.data;
  } catch (error) {
    console.error('Report API Error:', error);
    throw error;
  }
}

const forumService = {
  getForumsByCourse,
  getForumById,
  createForum,
  getThreadsByForum,
  getThreadById,
  createThread,
  incrementThreadViews,
  getPostsByThread,
  createPost,
  updatePost,
  deletePost,
  createReport,
  getReports,
  resolveReport,
};

export default forumService;
