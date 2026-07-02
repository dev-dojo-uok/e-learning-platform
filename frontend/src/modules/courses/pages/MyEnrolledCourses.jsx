import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, AlertCircle, Loader2, Compass } from 'lucide-react';
import { getMyEnrollments } from '@/modules/enrollment';
import EnrolledCourseCard from '../components/EnrolledCourseCard';
import { Button } from '@/components/ui/button';

export default function MyEnrolledCourses() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="flex flex-col gap-6">
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
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
