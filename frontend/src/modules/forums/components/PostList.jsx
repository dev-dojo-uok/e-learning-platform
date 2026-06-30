import React from 'react';
import PostCard from './PostCard';
import { MessageSquare } from 'lucide-react';

/**
 * Builds a nested tree from a flat posts array using parentPostId.
 */
function buildPostTree(posts) {
  const map = {};
  const roots = [];

  posts.forEach((p) => { map[p.id] = { ...p, replies: [] }; });
  posts.forEach((p) => {
    if (p.parentPostId && map[p.parentPostId]) {
      map[p.parentPostId].replies.push(map[p.id]);
    } else {
      roots.push(map[p.id]);
    }
  });

  return roots;
}

/**
 * PostList – renders the full nested tree of posts for a thread.
 *
 * Props:
 *   posts    – flat array of post objects
 *   loading  – boolean
 *   error    – string | null
 *   onReply  – fn({ content, parentPostId })
 *   onEdit   – fn(postId, content)
 *   onDelete – fn(postId)
 */
export default function PostList({ posts = [], loading, error, onReply, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-slate-100 bg-slate-50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-sm font-medium text-red-600">{error}</p>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-indigo-300" />
        </div>
        <h3 className="text-sm font-semibold text-slate-600 mb-1">No replies yet</h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Be the first to reply to this thread!
        </p>
      </div>
    );
  }

  const tree = buildPostTree(posts);

  return (
    <div className="space-y-1">
      {tree.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          depth={0}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
