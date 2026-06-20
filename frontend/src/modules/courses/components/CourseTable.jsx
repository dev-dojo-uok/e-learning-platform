import React from 'react';
import { Eye, Pencil, Trash2, BookOpen, Loader2, InboxIcon } from 'lucide-react';

/**
 * CourseTable – Displays a list of courses in a responsive table.
 *
 * Props:
 *  - courses  {Array}    List of course objects.
 *  - loading  {boolean}  True while courses are being fetched.
 *  - onView   {Function} Called with the full course object when View is clicked.
 *  - onEdit   {Function} Called with the full course object when Edit is clicked.
 *  - onDelete {Function} Called with course._id when Delete is clicked.
 */
const CourseTable = ({ courses = [], loading, onView, onEdit, onDelete }) => {
  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium tracking-wide">Loading courses…</p>
        {/* Skeleton rows */}
        <div className="w-full mt-4 space-y-3 px-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 w-full rounded-xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-50">
          <InboxIcon className="h-10 w-10 text-indigo-300" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-slate-600">No courses available</p>
          <p className="text-sm text-slate-400 mt-1">
            Create your first course to get started.
          </p>
        </div>
      </div>
    );
  }

  // ── Table ────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 bg-white">
        {/* Head */}
        <thead>
          <tr className="bg-slate-50">
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">
              Thumbnail
            </th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Title
            </th>
            <th className="hidden md:table-cell px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider max-w-xs">
              Description
            </th>
            <th className="hidden sm:table-cell px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-slate-100">
          {courses.map((course, idx) => (
            <CourseTableRow
              key={course._id || idx}
              course={course}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Private row sub-component ────────────────────────────────────────────────
const CourseTableRow = ({ course, onView, onEdit, onDelete }) => {
  const { _id, title, description, category, thumbnail } = course;

  const truncatedDesc =
    description && description.length > 80
      ? `${description.slice(0, 80)}…`
      : description;

  return (
    <tr className="hover:bg-slate-50 transition-colors duration-100">
      {/* Thumbnail */}
      <td className="px-4 py-3">
        <div className="w-12 h-10 rounded-lg overflow-hidden bg-indigo-50 flex items-center justify-center flex-shrink-0">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen className="h-5 w-5 text-indigo-300" strokeWidth={1.5} />
          )}
        </div>
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <span className="text-sm font-semibold text-slate-800 line-clamp-2">
          {title || '—'}
        </span>
      </td>

      {/* Description (hidden on mobile) */}
      <td className="hidden md:table-cell px-4 py-3 max-w-xs">
        <span className="text-sm text-slate-500 line-clamp-2">
          {truncatedDesc || '—'}
        </span>
      </td>

      {/* Category (hidden on xs) */}
      <td className="hidden sm:table-cell px-4 py-3">
        {category ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {category}
          </span>
        ) : (
          <span className="text-slate-400 text-sm">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1.5">
          {/* View */}
          <button
            type="button"
            id={`table-course-view-${_id}`}
            aria-label={`View ${title}`}
            onClick={() => onView?.(course)}
            title="View"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">View</span>
          </button>

          {/* Edit */}
          <button
            type="button"
            id={`table-course-edit-${_id}`}
            aria-label={`Edit ${title}`}
            onClick={() => onEdit?.(course)}
            title="Edit"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            id={`table-course-delete-${_id}`}
            aria-label={`Delete ${title}`}
            onClick={() => onDelete?.(_id)}
            title="Delete"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CourseTable;
