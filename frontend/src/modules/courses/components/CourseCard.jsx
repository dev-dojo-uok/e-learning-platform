import React from 'react';
import { Eye, Pencil, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      {/*  Thumbnail  */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex-shrink-0">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <BookOpen
              className="h-16 w-16 text-muted-foreground/60"
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* Category badge */}
        {category && (
          <Badge variant="secondary" className="absolute top-3 left-3 shadow-sm bg-white/95 text-slate-800 border-border hover:bg-white/95">
            {category}
          </Badge>
        )}
      </div>

      {/*  Card body  */}
      <div className="flex flex-col flex-1 p-5 gap-2">
        <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
          {title || 'Untitled Course'}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed flex-1">
          {truncatedDescription || 'No description provided.'}
        </p>
      </div>

      {/*  Actions  */}
      <div className="flex items-center gap-2 px-5 pb-5 pt-3 border-t border-slate-100">
        {/* View */}
        <Button
          id={`course-view-${course?._id}`}
          aria-label={`View ${title}`}
          onClick={() => onView?.(course)}
          className="flex-1 text-white"
          size="sm"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>

        {/* Edit */}
        <Button
          id={`course-edit-${course?._id}`}
          aria-label={`Edit ${title}`}
          onClick={() => onEdit?.(course)}
          className="flex-1"
          variant="secondary"
          size="sm"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>

        {/* Delete */}
        <Button
          id={`course-delete-${course?._id}`}
          aria-label={`Delete ${title}`}
          onClick={() => onDelete?.(course?._id)}
          variant="destructive"
          size="sm"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;
