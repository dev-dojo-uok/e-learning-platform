import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, Loader2, Compass, CheckCircle2, XCircle } from 'lucide-react';
import { getMyEnrollments, removeEnrollment } from '@/modules/enrollment';
import EnrolledCourseCard from '../components/EnrolledCourseCard';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

// ── Inline Toast notification component (same pattern as CourseList.jsx) ──────
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

// ── MyEnrolledCourses page ────────────────────────────────────────────────────
export default function MyEnrolledCourses() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Unenroll state (mirrors the delete pattern in CourseList.jsx) ──────────
  const [enrollmentToRemove, setEnrollmentToRemove] = useState(null); // enrollment object
  const [unenrollingId, setUnenrollingId] = useState(null);           // enrollment id being deleted
  const [toast, setToast] = useState(null);                            // { message, type }

  // ── Fetch enrolled courses ────────────────────────────────────────────────
  const fetchEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyEnrollments();
      setEnrollments(data || []);
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load enrolled courses.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // ── Unenroll handlers ─────────────────────────────────────────────────────

  /**
   * Opens the confirmation dialog for the given enrollment.
   * Called when the student clicks the "Unenroll" button on a card.
   */
  const handleUnenrollRequest = (enrollment) => {
    setEnrollmentToRemove(enrollment);
  };

  /**
   * Confirmed by the student in the AlertDialog.
   * Calls the DELETE API, then removes the card from the list optimistically.
   */
  const handleConfirmUnenroll = async () => {
    if (!enrollmentToRemove) return;

    const target = enrollmentToRemove;
    setEnrollmentToRemove(null);       // close dialog immediately
    setUnenrollingId(target.id);       // show spinner on the card

    try {
      await removeEnrollment(target.id);
      // Remove from local state — no page refresh required
      setEnrollments((prev) => prev.filter((e) => e.id !== target.id));
      setToast({
        message: `Successfully unenrolled from "${target.course?.title || 'the course'}"`,
        type: 'success',
      });
    } catch (err) {
      console.error('Unenroll failed:', err);
      setToast({
        message:
          err.response?.data?.message ||
          err.message ||
          'Failed to unenroll. Please try again.',
        type: 'error',
      });
    } finally {
      setUnenrollingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">My Enrolled Courses</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {!loading && !error
                ? `${enrollments.length} course${enrollments.length !== 1 ? 's' : ''} in progress`
                : 'Your learning journey'}
            </p>
          </div>
        </div>

        <Button
          id="browse-courses-btn"
          onClick={() => navigate('/courses')}
          className="self-start sm:self-auto text-white cursor-pointer"
        >
          <Compass className="h-4 w-4" />
          Browse Courses
        </Button>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium tracking-wide">Loading your courses…</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 w-full rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && !loading && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Failed to load enrolled courses</p>
            <p className="text-xs mt-0.5 text-red-500">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEnrollments}
              className="mt-3 bg-white text-red-700 border-red-200 hover:bg-red-50 cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* ── Successful data loading & Empty state ── */}
      {!loading && !error && (
        enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
              <BookOpen className="h-10 w-10 text-muted-foreground/60" strokeWidth={1.5} />
            </div>
            <div className="text-center max-w-sm flex flex-col items-center">
              <p className="text-base font-semibold text-slate-800">You are not enrolled in any courses</p>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Explore the course catalogue to find modules that interest you and begin learning today.
              </p>
              <Button
                id="empty-browse-btn"
                onClick={() => navigate('/courses')}
                className="text-white cursor-pointer"
              >
                Browse Course Catalogue
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <EnrolledCourseCard
                key={enrollment.id}
                enrollment={enrollment}
                onUnenroll={handleUnenrollRequest}
                unenrolling={unenrollingId === enrollment.id}
              />
            ))}
          </div>
        )
      )}

      {/* ── Unenroll Confirmation Dialog (same pattern as CourseList.jsx) ── */}
      <AlertDialog
        open={!!enrollmentToRemove}
        onOpenChange={(open) => !open && setEnrollmentToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unenroll from Course?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unenroll from{' '}
              <span className="font-semibold text-slate-700">
                {enrollmentToRemove?.course?.title || 'this course'}
              </span>
              ? Your progress will be lost and you will need to re-enroll to regain access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              id="confirm-unenroll-btn"
              onClick={handleConfirmUnenroll}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Unenroll
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
