import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, BookOpen, ChevronRight, Layers } from 'lucide-react';

/**
 * ForumCard – displays a single forum (course-level or module-level).
 *
 * Props:
 *   forum  – { id, title, description, moduleId?, module? }
 *   to     – React Router href target (defaults to /forums/:id/threads)
 */
export default function ForumCard({ forum, to }) {
  const href = to || `/forums/${forum.id}/threads`;
  const isModuleForum = Boolean(forum.moduleId);

  return (
    <Link
      to={href}
      className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200
        bg-white hover:shadow-md hover:-translate-y-[2px]
        ${isModuleForum
          ? 'border-violet-100 hover:border-violet-300 hover:bg-violet-50/30'
          : 'border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20'
        }`}
    >
      {/* Icon */}
      <div
        className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center
          ${isModuleForum
            ? 'bg-violet-100 text-violet-600'
            : 'bg-indigo-100 text-indigo-600'
          }`}
      >
        {isModuleForum ? (
          <Layers className="w-5 h-5" />
        ) : (
          <BookOpen className="w-5 h-5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 truncate transition-colors">
            {forum.title}
          </h3>
          {isModuleForum && forum.module?.title && (
            <span className="text-[10px] font-semibold bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full whitespace-nowrap">
              {forum.module.title}
            </span>
          )}
        </div>

        {forum.description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {forum.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {forum._count?.threads ?? 0} threads
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-1" />
    </Link>
  );
}
