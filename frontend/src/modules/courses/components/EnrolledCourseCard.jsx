import React, { useState, useEffect } from 'react';
import { BookOpen, User, Calendar, Award, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { completionService } from '../../completion';


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

  // ── Completion Progress State ──
  const [progressData, setProgressData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    if (courseId) {
      setLoadingProgress(true);
      completionService.getCourseProgress(courseId)
        .then((data) => {
          setProgressData(data);
        })
        .catch((err) => {
          console.error("Failed to load progress for course", courseId, err);
        })
        .finally(() => {
          setLoadingProgress(false);
        });
    }
  }, [courseId]);

  // ── Derived Progress Metrics ──
  const totalQuizzes = progressData?.totalQuizzes || 0;
  const completedQuizzes = progressData?.completedQuizzes || 0;
  const totalAssignments = progressData?.totalAssignments || 0;
  const completedAssignments = progressData?.completedAssignments || 0;

  const totalTasks = totalQuizzes + totalAssignments;
  const completedTasks = completedQuizzes + completedAssignments;
  const remainingTasks = Math.max(0, totalTasks - completedTasks);
  const progressPercentage = progressData?.progressPercentage !== undefined
    ? progressData.progressPercentage
    : (totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100));

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

        {/* ── Live Progress Breakdown ── */}
        <div className="mt-2 p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-purple-50/40 border border-slate-100 shadow-2xs transition-all duration-300 hover:shadow-sm">
          {loadingProgress ? (
            <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-400 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#5C29C2' }} />
              <span>Loading progress...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Top row: Title & Percentage */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <div className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" style={{ color: '#5C29C2' }} />
                  <span>Course Progress</span>
                </div>
                <span style={{ color: '#5C29C2' }}>{progressPercentage}%</span>
              </div>

              {/* Progressive Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                    style={{ width: `${progressPercentage}%`, backgroundColor: '#5C29C2' }}
                  />
                </div>
              </div>

              {/* Completion Details Breakdown Badges */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-[11px] font-medium text-slate-600">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200/80 shadow-2xs flex-1 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#5C29C2' }} />
                  <span>Quizzes: <strong className="text-slate-800">{completedQuizzes}/{totalQuizzes}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200/80 shadow-2xs flex-1 justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span>Assignments: <strong className="text-slate-800">{completedAssignments}/{totalAssignments}</strong></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-100 mt-auto flex flex-col gap-2">
        <Button
          id={`course-continue-${courseId}`}
          aria-label={`Continue learning ${title}`}
          asChild
          className="w-full text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#000000' }}
          size="sm"
        >
          <Link to={`/courses/${courseId}`}>
            Continue Learning
          </Link>
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


