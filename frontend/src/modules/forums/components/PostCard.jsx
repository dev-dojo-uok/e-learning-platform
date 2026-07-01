import React, { useState } from 'react';
import { Pencil, Trash2, Reply, Clock, CornerDownRight } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import ReplyBox from './ReplyBox';

/**
 * PostCard – renders a single forum post with edit/delete/reply controls.
 *
 * Props:
 *   post         – post object
 *   isNested     – boolean, true when this is a child reply
 *   onReply      – fn(parentPostId) called when reply submitted
 *   onEdit       – fn(postId, content)
 *   onDelete     – fn(postId)
 *   depth        – nesting depth (0 = top-level)
 */
export default function PostCard({
  post,
  isNested = false,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}) {
  const { user } = useAuthStore();
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [saving, setSaving] = useState(false);

  const isOwner = user && (user.id === post.userId || user.id === post.authorId);
  const postedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const authorName =
    post.author?.name || post.user?.name || post.createdBy?.name || 'Anonymous';

  const avatarInitial = authorName.charAt(0).toUpperCase();

  // Limit nesting visual depth to 3
  const indentClass = depth > 0 ? 'ml-6 border-l-2 border-slate-100 pl-4' : '';

  async function handleSaveEdit() {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      await onEdit(post.id, editContent.trim());
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleReplySubmit(content) {
    await onReply({ content, parentPostId: post.id });
    setShowReplyBox(false);
  }

  return (
    <div className={`${indentClass} ${isNested ? 'mt-3' : 'mt-4'}`}>
      <div
        className={`rounded-xl border p-4 transition-colors
          ${depth === 0
            ? 'bg-white border-slate-100 shadow-sm'
            : 'bg-slate-50/60 border-slate-100'
          }`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {avatarInitial}
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-800">{authorName}</span>
              {postedDate && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {postedDate}
                  {post.updatedAt && post.updatedAt !== post.createdAt && (
                    <span className="text-slate-300 italic ml-1">(edited)</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {isOwner && !isEditing && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Edit post"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Delete post"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-3 ml-11">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-sm text-slate-700 bg-white border border-indigo-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 min-h-[80px]"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim()}
                  className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => { setIsEditing(false); setEditContent(post.content); }}
                  className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
          )}

          {/* Reply button */}
          {!isEditing && depth < 3 && (
            <button
              onClick={() => setShowReplyBox((v) => !v)}
              className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors font-medium"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </button>
          )}
        </div>
      </div>

      {/* Inline reply box */}
      {showReplyBox && (
        <div className="mt-2 ml-6">
          <ReplyBox
            onSubmit={handleReplySubmit}
            onCancel={() => setShowReplyBox(false)}
            placeholder={`Replying to ${authorName}…`}
            compact
          />
        </div>
      )}

      {/* Nested children */}
      {post.replies && post.replies.length > 0 && (
        <div>
          {post.replies.map((child) => (
            <PostCard
              key={child.id}
              post={child}
              isNested
              depth={depth + 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
