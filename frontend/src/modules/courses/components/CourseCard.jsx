import React from 'react';
import { Eye, Pencil, Trash2, BookOpen } from 'lucide-react';

/**
 * CourseCard – Displays a single course as a rich card.
 *
 * Props:
 *  - course   {Object}   Course data object.
 *  - onView   {Function} Called with the full course object when View is clicked.
 *  - onEdit   {Function} Called with the full course object when Edit is clicked.
 *  - onDelete {Function} Called with course._id when Delete is clicked.
 */
const CourseCard = ({ course, onView, onEdit, onDelete }) => {
  const { title, description, category, thumbnail } = course || {};

  // Truncate description to a readable length
  const truncatedDescription =
    description && description.length > 110
      ? `${description.slice(0, 110)}…`
      : description;

  return (
    <div className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* ── Thumbnail ── */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex-shrink-0">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-violet-100">
            <BookOpen
              className="h-16 w-16 text-indigo-300"
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* Category badge */}
        {category && (
          <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-indigo-700 border border-indigo-100 shadow-sm">
            {category}
          </span>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
          {title || 'Untitled Course'}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed flex-1">
          {truncatedDescription || 'No description provided.'}
        </p>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-2 px-5 pb-5 pt-3 border-t border-slate-100">
        {/* View */}
        <button
          type="button"
          id={`course-view-${course?._id}`}
          aria-label={`View ${title}`}
          onClick={() => onView?.(course)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>

        {/* Edit */}
        <button
          type="button"
          id={`course-edit-${course?._id}`}
          aria-label={`Edit ${title}`}
          onClick={() => onEdit?.(course)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>

        {/* Delete */}
        <button
          type="button"
          id={`course-delete-${course?._id}`}
          aria-label={`Delete ${title}`}
          onClick={() => onDelete?.(course?._id)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
