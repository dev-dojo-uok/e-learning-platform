import React, { useState } from 'react';
import { Pencil, Trash2, Reply, Clock } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import ReplyBox from './ReplyBox';
import { Button } from '@/components/ui/button';

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
 *   isForumOwner – boolean, true if current user is teacher/admin
 */
export default function PostCard({
  post,
  isNested = false,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
  isForumOwner = false,
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

  // Plain component: nesting visual depth gets clean left borders
  const indentClass = depth > 0 ? 'ml-6 border-l border-border pl-4' : 'border-b border-border py-5 last:border-b-0';

  const isTopLevel = depth === 0;
  const canEdit = isTopLevel && (isOwner || isForumOwner);
  const canDelete = isOwner || isForumOwner;

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
    <div className={`${indentClass} ${isNested ? 'mt-3' : 'mt-1'}`}>
      <div className="flex flex-col gap-2">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
              {avatarInitial}
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">{authorName}</span>
              {postedDate && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  {postedDate}
                  {post.updatedAt && post.updatedAt !== post.createdAt && (
                    <span className="text-muted-foreground italic ml-1">(edited)</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isEditing && (canEdit || canDelete) && (
            <div className="flex items-center gap-1">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsEditing(true)}
                  title="Edit post"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(post.id)}
                  title="Delete post"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-1 ml-11">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-sm text-foreground bg-background border border-input rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveEdit}
                  disabled={saving || !editContent.trim()}
                  size="sm"
                  className="text-white"
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setIsEditing(false); setEditContent(post.content); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>
          )}

          {/* Reply button */}
          {!isEditing && depth < 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyBox((v) => !v)}
              className="mt-2 text-muted-foreground hover:text-primary gap-1.5 h-auto py-1 pl-1 pr-2"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply
            </Button>
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
        <div className="mt-2">
          {post.replies.map((child) => (
            <PostCard
              key={child.id}
              post={child}
              isNested
              depth={depth + 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              isForumOwner={isForumOwner}
            />
          ))}
        </div>
      )}
    </div>
  );
}
