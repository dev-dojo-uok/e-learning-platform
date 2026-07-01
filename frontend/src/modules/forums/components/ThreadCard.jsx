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
      className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200
        bg-white hover:shadow-md hover:-translate-y-[1px]
        ${thread.isPinned
          ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
          : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/10'
        }`}
    >
      {/* Reply/post count bubble */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-100 transition-colors">
        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700 leading-none">
          {thread._count?.posts ?? 0}
        </span>
        <span className="text-[9px] text-slate-400 font-medium mt-0.5">
          {(thread._count?.posts ?? 0) === 1 ? 'reply' : 'replies'}
        </span>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Badges row */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {thread.isPinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              <Pin className="w-2.5 h-2.5" />
              Pinned
            </span>
          )}
          {thread.isLocked && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              <Lock className="w-2.5 h-2.5" />
              Locked
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-2">
          {thread.title}
        </h3>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
          <span className="font-medium text-slate-600">
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
