import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, MessageSquare, Pin, Lock, Clock } from 'lucide-react';

/**
 * ThreadCard – displays a single forum thread in a list.
 *
 * Props:
 *   thread – { id, title, createdBy, views, isPinned, isLocked,
 *               createdAt, _count: { posts } }
 */
export default function ThreadCard({ thread }) {
  const createdDate = thread.createdAt
    ? new Date(thread.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const authorName =
    thread.createdBy?.name ||
    thread.author?.name ||
    thread.user?.name ||
    'Anonymous';

  return (
    <Link
      to={`/threads/${thread.id}`}
      className="group flex items-start gap-4 py-4 border-b border-border last:border-0 hover:bg-muted/10 px-2 rounded-lg transition-colors"
    >
      {/* Reply/post count bubble */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-muted group-hover:bg-primary/15 transition-colors">
        <span className="text-sm font-bold text-foreground group-hover:text-primary leading-none">
          {thread._count?.posts ?? 0}
        </span>
        <span className="text-[9px] text-muted-foreground font-medium mt-0.5">
          {(thread._count?.posts ?? 0) === 1 ? 'reply' : 'replies'}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {thread.isPinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
              <Pin className="w-2.5 h-2.5" />
              Pinned
            </span>
          )}
          {thread.isLocked && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 px-2 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" />
              Locked
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {thread.title}
        </h3>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {authorName}
          </span>
          {createdDate && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {createdDate}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {thread.views ?? 0} views
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {thread._count?.posts ?? 0} replies
          </span>
        </div>
      </div>
    </Link>
  );
}
