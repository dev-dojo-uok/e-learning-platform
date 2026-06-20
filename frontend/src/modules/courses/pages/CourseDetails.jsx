import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Loader2,
  AlertCircle,
  BookOpen,
  CalendarDays,
  RefreshCw,
  Layers,
} from 'lucide-react';
import useCourses from '../hooks/useCourses';

// ── Small detail row ─────────────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 flex-shrink-0 mt-0.5">
      <Icon className="h-4 w-4 text-indigo-500" />
    </div>
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-slate-800 break-words">
        {value || <span className="text-slate-400 italic">Not set</span>}
      </span>
    </div>
  </div>
);

// ── Format ISO date to locale string ─────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── CourseDetails page ────────────────────────────────────────────────────────
export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCourse, loading, error, fetchCourseById } = useCourses();

  useEffect(() => {
    if (id) fetchCourseById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const course = selectedCourse?._id === id ? selectedCourse : null;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading && !course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Loading course…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error && !course) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors self-start group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Courses
        </button>
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Failed to load course</p>
            <p className="text-xs mt-0.5 text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* ── Back navigation ── */}
      <button
        type="button"
        id="back-to-courses-list-btn"
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors duration-150 self-start group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Courses
      </button>


      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 flex-shrink-0">
            <BookOpen className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {course?.title || 'Course Details'}
            </h1>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            id="edit-course-btn"
            onClick={() => navigate(`/courses/edit/${id}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Course
          </button>
          <button
            type="button"
            id="back-to-courses-btn"
            onClick={() => navigate('/courses')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Courses
          </button>
        </div>
      </div>

      {/* ── Course Information card ── */}
      <section aria-labelledby="course-info-heading">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <h2
              id="course-info-heading"
              className="text-sm font-semibold text-slate-700 uppercase tracking-wider"
            >
              Course Information
            </h2>
          </div>

          {/* Detail rows */}
          <div className="px-6 py-2">
            <DetailRow
              icon={BookOpen}
              label="Title"
              value={course?.title}
            />

            {/* Description gets its own treatment for multi-line */}
            <div className="flex items-start gap-3 py-3 border-b border-slate-100">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 flex-shrink-0 mt-0.5">
                <BookOpen className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Description
                </span>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {course?.description || (
                    <span className="text-slate-400 italic">No description provided.</span>
                  )}
                </p>
              </div>
            </div>
            <DetailRow
              icon={CalendarDays}
              label="Created"
              value={formatDate(course?.createdAt)}
            />
            <DetailRow
              icon={RefreshCw}
              label="Last Updated"
              value={formatDate(course?.updatedAt)}
            />
          </div>
        </div>
      </section>

      {/* ── Module Management placeholder ── */}
      <section aria-labelledby="module-mgmt-heading">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <Layers className="h-4 w-4 text-violet-500" />
            <h2
              id="module-mgmt-heading"
              className="text-sm font-semibold text-slate-700 uppercase tracking-wider"
            >
              Module Management
            </h2>
          </div>

          {/* Placeholder content */}
          <div className="flex flex-col items-center justify-center py-14 px-6 gap-4 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50">
              <Layers className="h-8 w-8 text-violet-300" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-600">Coming Soon</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Modules will be managed here in future phases. You'll be able to create,
                reorder, and manage course content from this section.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-600 border border-violet-100">
              Phase 8 — Module Management
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
