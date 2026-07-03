import React from 'react';
import { BookOpen, User, Calendar, Award, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

/**
 * EnrolledCourseCard – Displays a course enrolled by the student.
 *
 * Props:
 *  - enrollment {Object} Enrollment data with course and createdAt fields.
 */
/**
 * EnrolledCourseCard – Displays a course enrolled by the student.
 *
 * Props:
 *  - enrollment  {Object}   Enrollment data with course and enrolledAt fields.
 *  - onUnenroll  {Function} Optional. Called with the enrollment object when
 *                           the student clicks the Unenroll button.
 *  - unenrolling {boolean}  Optional. When true, shows a spinner on the Unenroll
 *                           button and disables it to prevent duplicate requests.
 */
const EnrolledCourseCard = ({ enrollment, onUnenroll, unenrolling = false }) => {
  const { course, enrolledAt } = enrollment || {};
  const { id, _id, title, description, category, thumbnail, teacher } = course || {};
  const courseId = id || _id;
  const teacherName = teacher?.name || 'Unknown Teacher';
  const enrollmentDate = enrolledAt
    ? new Date(enrolledAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown Date';

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
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <BookOpen
              className="h-16 w-16 text-muted-foreground/60"
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* Category badge */}
        {category && (
          <Badge
            variant="secondary"
            className="absolute top-3 left-3 shadow-sm bg-white/95 text-slate-800 border-border hover:bg-white/95"
          >
            {category}
          </Badge>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
          {title || 'Untitled Course'}
        </h3>

        <div className="space-y-1.5 mt-1">
          {/* Teacher */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <User className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              Teacher: <span className="text-slate-800 font-semibold">{teacherName}</span>
            </span>
          </div>

          {/* Enrollment Date */}
          <div className="flex items-center gap-2 text-xs text-slate-450 font-medium">
            <Calendar className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500">
              Enrolled: <span className="text-slate-700 font-semibold">{enrollmentDate}</span>
            </span>
          </div>
        </div>

        {/* ── Progress Tracker (Placeholder) ── */}
        <div className="mt-2 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-slate-400" />
              Progress
            </span>
            <span>0%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 mt-auto flex flex-col gap-2">
        <Button
          id={`course-continue-${courseId}`}
          aria-label={`Continue learning ${title}`}
          asChild={!unenrolling}
          disabled={unenrolling}
          className="w-full text-white cursor-pointer"
          size="sm"
        >
          {unenrolling ? (
            <span>Continue Learning</span>
          ) : (
            <Link to={`/courses/${courseId}`}>
              Continue Learning
            </Link>
          )}
        </Button>

        {/* Unenroll button – rendered only when a handler is provided */}
        {onUnenroll && (
          <Button
            id={`course-unenroll-${courseId}`}
            aria-label={`Unenroll from ${title}`}
            variant="destructive"
            size="sm"
            className="w-full cursor-pointer"
            onClick={() => onUnenroll(enrollment)}
            disabled={unenrolling}
          >
            {unenrolling ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Unenrolling…
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Unenroll
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnrolledCourseCard;
