import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BookOpen, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import CourseTable from '../components/CourseTable';
import useCourses from '../hooks/useCourses';

// ── Inline Toast notification component ──────────────────────────────────────
const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-800',
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />,
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />,
    },
  };

  const { bg, text, icon } = config[type] || config.success;

  return (
    <div
      role="alert"
      className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg ${bg} ${text} text-sm font-medium animate-in slide-in-from-top-2 duration-300 max-w-sm`}
    >
      {icon}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

// ── CourseList page ───────────────────────────────────────────────────────────
export default function CourseList() {
  const navigate = useNavigate();
  const { courses, loading, error, fetchCourses, deleteCourse } = useCourses();
  const [toast, setToast] = useState(null); // { message, type }

  // Fetch on mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleView = (course) => {
    navigate(`/courses/${course._id}`);
  };

  const handleEdit = (course) => {
    navigate(`/courses/edit/${course._id}`);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this course? This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await deleteCourse(id);
      setToast({ message: 'Course deleted successfully.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete course. Please try again.', type: 'error' });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100">
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Courses</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {!loading && !error
                ? `${courses.length} course${courses.length !== 1 ? 's' : ''} total`
                : 'Manage your course catalogue'}
            </p>
          </div>
        </div>

        {/* Create button */}
        <button
          id="create-course-btn"
          type="button"
          onClick={() => navigate('/courses/create')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          Create Course
        </button>
      </div>

      {/* ── Error state ── */}
      {error && !loading && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Failed to load courses</p>
            <p className="text-xs mt-0.5 text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <CourseTable
        courses={courses}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
