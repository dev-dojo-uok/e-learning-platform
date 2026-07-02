import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft, Eye, Pin, Lock, MessageSquare, Clock, AlertCircle,
} from 'lucide-react';
import {
  getThreadById,
  getPostsByThread,
  createPost,
  updatePost,
  deletePost,
  incrementThreadViews,
} from '../services/forumService';
import PostList from '../components/PostList';
import ReplyBox from '../components/ReplyBox';
import useAuthStore from '../../../store/useAuthStore';

/**
 * ThreadDetailPage – /threads/:threadId
 *
 * Full thread view: header, OP content, all posts (nested),
 * and a top-level reply box.
 */
export default function ThreadDetailPage() {
  const { threadId } = useParams();
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingThread, setLoadingThread] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [threadError, setThreadError] = useState(null);
  const [postsError, setPostsError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // postId awaiting confirm

  // Load thread + posts
  useEffect(() => {
    if (!threadId) return;

    setLoadingThread(true);
    setThreadError(null);

    getThreadById(threadId)
      .then((data) => {
        setThread(data?.thread ?? data);
      })
      .catch((err) => {
        setThreadError(err.response?.data?.error || 'Failed to load thread.');
      })
      .finally(() => setLoadingThread(false));

    setLoadingPosts(true);
    setPostsError(null);

    getPostsByThread(threadId)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.posts ?? [];
        setPosts(list);
      })
      .catch((err) => {
        setPostsError(err.response?.data?.error || 'Failed to load posts.');
      })
      .finally(() => setLoadingPosts(false));

    // Silently increment views
    incrementThreadViews(threadId);
  }, [threadId]);

  // Post a top-level reply
  async function handleTopLevelReply(content) {
    const newPost = await createPost({ content, threadId });
    const post = newPost?.post ?? newPost;
    setPosts((prev) => [...prev, post]);
  }

  // Post a nested reply
  async function handleReply({ content, parentPostId }) {
    const newPost = await createPost({ content, threadId, parentPostId });
    const post = newPost?.post ?? newPost;
    setPosts((prev) => [...prev, post]);
  }

  // Edit a post
  const handleEdit = useCallback(async (postId, content) => {
    const updated = await updatePost(postId, { content });
    const post = updated?.post ?? updated;
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, content: post.content, updatedAt: post.updatedAt } : p)));
  }, []);

  // Delete a post (with confirmation)
  const handleDelete = useCallback((postId) => {
    setDeleteConfirm(postId);
  }, []);

  async function confirmDelete() {
    if (!deleteConfirm) return;
    try {
      await deletePost(deleteConfirm);
      setPosts((prev) => prev.filter((p) => p.id !== deleteConfirm));
    } catch (err) {
      // Graceful fail
    } finally {
      setDeleteConfirm(null);
    }
  }

  const createdDate = thread?.createdAt
    ? new Date(thread.createdAt).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const authorName =
    thread?.createdBy?.name ||
    thread?.author?.name ||
    thread?.user?.name ||
    'Anonymous';

  const avatarInitial = authorName.charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
        <Link to="/courses" className="hover:text-primary transition-colors font-medium">Courses</Link>
        <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
        {thread?.forum?.courseId && (
          <>
            <Link to={`/courses/${thread.forum.courseId}/forums`} className="hover:text-primary transition-colors font-medium">
              Forums
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
          </>
        )}
        {thread?.forumId && (
          <>
            <Link to={`/forums/${thread.forumId}/threads`} className="hover:text-primary transition-colors font-medium truncate max-w-[120px]">
              {thread?.forum?.name || thread?.forum?.title || 'Forum'}
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
          </>
        )}
        <span className="text-slate-700 font-semibold truncate max-w-[160px]">Thread</span>
      </div>

      {/* Thread loading state */}
      {loadingThread && (
        <div className="space-y-3">
          <div className="h-10 w-2/3 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
        </div>
      )}

      {/* Thread error */}
      {!loadingThread && threadError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {threadError}
        </div>
      )}

      {/* Thread content */}
      {!loadingThread && thread && (
        <div className="space-y-4">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {thread.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
            {thread.isLocked && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{thread.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-primary text-[9px] font-bold">
                {avatarInitial}
              </div>
              <span className="font-medium text-slate-700">{authorName}</span>
            </div>
            {createdDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {createdDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {thread.views ?? 0} views
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {posts.length} {posts.length === 1 ? 'reply' : 'replies'}
            </span>
          </div>

          {/* OP Content card */}
          {thread.content && (
            <div className="p-5 bg-muted/40 border border-border rounded-xl">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{thread.content}</p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
            </span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Posts */}
          <PostList
            posts={posts}
            loading={loadingPosts}
            error={postsError}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isForumOwner={isTeacherOrAdmin}
          />

          {/* Top-level reply box */}
          {!thread.isLocked ? (
            <div className="pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Your Reply</h3>
              <ReplyBox
                onSubmit={handleTopLevelReply}
                placeholder="Share your thoughts or answer…"
                disabled={!user}
              />
              {!user && (
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Please log in to reply.
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
              <Lock className="w-4 h-4 flex-shrink-0" />
              This thread is locked. No new replies can be posted.
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-base font-semibold text-slate-800 mb-1">Delete post?</h2>
            <p className="text-sm text-slate-500 mb-5">
              This action cannot be undone. The post will be permanently removed.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
