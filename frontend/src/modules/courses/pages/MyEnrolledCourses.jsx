import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, Loader2, Compass } from 'lucide-react';
import { getMyEnrollments, removeEnrollment } from '@/modules/enrollment';
import EnrolledCourseCard from '../components/EnrolledCourseCard';
import { Button } from '@/components/ui/button';
import useAuthStore from '../../../store/useAuthStore';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
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



// -------------------- MyEnrolledCourses page ----------------------------------------------------
export default function MyEnrolledCourses() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Guard: Redirect if not student
  useEffect(() => {
    if (user && user.role !== 'STUDENT') {
      navigate('/');
    }
  }, [user, navigate]);

  // -------------------- Unenroll state (mirrors the delete pattern in CourseList.jsx) -------------------------------------
  const [enrollmentToRemove, setEnrollmentToRemove] = useState(null); // enrollment object
  const [unenrollingId, setUnenrollingId] = useState(null);           // enrollment id being deleted

  // -------------------- Fetch enrolled courses ------------------------------------------------
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

  // -------------- Unenroll handlers -------------------------

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
      toast.success(`Successfully unenrolled from "${target.course?.title || 'the course'}"`);
    } catch (err) {
      console.error('Unenroll failed:', err);
      toast.error(
        err.response?.data?.message ||
        err.message ||
        'Failed to unenroll. Please try again.'
      );
    } finally {
      setUnenrollingId(null);
    }
  };

  // ---------------------- Render ----------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6">



      {/* Page Header */}
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

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-slate-500 py-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium tracking-wide">Loading your courses…</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[380px]"
              >
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="flex flex-col flex-1 p-5 gap-3">
                  <Skeleton className="h-5 w-3/4" />
                  <div className="space-y-2 mt-1">
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <div className="mt-auto space-y-1.5 pt-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                </div>
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 mt-auto flex flex-col gap-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
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

      {/*  Successful data loading & Empty state */}
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

      {/* Unenroll Confirmation Dialog (same pattern as CourseList.jsx) */}
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
