import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Search,
  Loader2,
  AlertCircle,
  InboxIcon,
  CheckCircle2
} from 'lucide-react';
import { getCourseStudents } from '@/modules/enrollment';
import useCourses from '../hooks/useCourses';
import { Button } from '@/components/ui/button';
import useAuthStore from '../../../store/useAuthStore';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------- Format ISO date helper ---------------------------------------------------
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function TeacherEnrollmentManagement() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  // Guard: Redirect if not teacher/admin
  useEffect(() => {
    if (user && !isTeacherOrAdmin) {
      navigate('/');
    }
  }, [user, isTeacherOrAdmin, navigate]);

  // Course store hook to get the teacher's list of courses
  const {
    courses,
    selectedCourse,
    loading: courseDetailsLoading,
    error: courseError,
    fetchCourses,
    fetchCourseById
  } = useCourses();

  // Local state for enrolled students
  const [enrollments, setEnrollments] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  //---------------Fetch data -----------------------
  const loadEnrollments = useCallback(async () => {
    if (!courseId) return;
    setStudentsLoading(true);
    setStudentsError(null);
    try {
      const data = await getCourseStudents(courseId);
      setEnrollments(data || []);
    } catch (err) {
      console.error('Failed to load course students:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to load enrolled students.';
      setStudentsError(errMsg);
      toast.error(errMsg);
    } finally {
      setStudentsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    // Fetch all teacher courses to populate the selector dropdown
    fetchCourses();
  }, [fetchCourses]);

  // Fetch course details on mount/ID change
  useEffect(() => {
    if (courseId) {
      fetchCourseById(courseId);
    }
  }, [courseId, fetchCourseById]);

  // Guard & Load: Verify access and load enrollments once course details are loaded
  useEffect(() => {
    if (selectedCourse && selectedCourse._id === courseId && !courseDetailsLoading) {
      const isOwner = selectedCourse.teacherId === user?.id || selectedCourse.teacher?.id === user?.id;
      if (user?.role === 'TEACHER' && !isOwner) {
        navigate('/');
      } else {
        loadEnrollments();
      }
    }
  }, [selectedCourse, courseDetailsLoading, courseId, user, navigate, loadEnrollments]);

  // -------------------- Handlers -----------------
  const handleCourseChange = (newCourseId) => {
    if (newCourseId) {
      navigate(`/courses/${newCourseId}/enrollments`);
    }
  };

  // ------------------- Filter student list by search query ----------------
  const filteredEnrollments = searchQuery.trim()
    ? enrollments.filter((enrollment) => {
      const studentName = enrollment.student?.name?.toLowerCase() || '';
      const studentEmail = enrollment.student?.email?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return studentName.includes(query) || studentEmail.includes(query);
    })
    : enrollments;

  const course = selectedCourse?._id === courseId ? selectedCourse : null;
  const isPageLoading = courseDetailsLoading || (!course && !courseError) || (studentsLoading && enrollments.length === 0 && !studentsError && !courseError);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Back button */}
      <button
        type="button"
        id="back-to-course-details-btn"
        onClick={() => navigate(`/courses/${courseId}`)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors duration-150 self-start group cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Course Details
      </button>

      {/* Header and Select Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {course?.title || 'Enrollment Management'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500 font-medium">Manage student rosters</span>
              {!isPageLoading && !studentsError && !courseError && (
                <span className="flex items-center gap-1.5 bg-slate-100 rounded-full px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {enrollments.length} {enrollments.length === 1 ? 'student' : 'students'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Course Dropdown Selector */}
        {courses && courses.length > 0 && (
          <div className="flex flex-col gap-1 sm:min-w-[250px]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Switch Course
            </span>
            <Select value={courseId} onValueChange={handleCourseChange}>
              <SelectTrigger className="w-full border border-slate-200 bg-white text-black focus:ring-1 focus:ring-black rounded-xl h-10 px-3 text-left shadow-sm">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 text-black rounded-xl shadow-md max-h-60 overflow-y-auto">
                {courses.map((c) => (
                  <SelectItem
                    key={c._id}
                    value={c._id}
                    className="hover:bg-slate-100 focus:bg-slate-100 cursor-pointer"
                  >
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Course Loading Error state */}
      {courseError && !courseDetailsLoading && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 shadow-sm animate-in fade-in duration-200"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Failed to load course details</p>
            <p className="text-xs mt-0.5 text-red-500">{courseError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCourseById(courseId)}
              className="mt-3 bg-white text-red-700 border-red-200 hover:bg-red-50 cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* API Error state */}
      {studentsError && !isPageLoading && !courseError && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 shadow-sm"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Failed to load enrollments</p>
            <p className="text-xs mt-0.5 text-red-500">{studentsError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={loadEnrollments}
              className="mt-3 bg-white text-red-700 border-red-200 hover:bg-red-50 cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Controls & Search bar */}
      {!studentsError && !courseError && !isPageLoading && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name or email..."
              aria-label="Search students by name or email"
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isPageLoading && (
        <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 py-1">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium tracking-wide">Loading enrollment data...</span>
          </div>
          <div className="w-full overflow-x-auto rounded-xl border border-slate-200 mt-2">
            <table className="min-w-full divide-y divide-slate-200 bg-white">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success data state */}
      {!isPageLoading && !studentsError && !courseError && (
        enrollments.length === 0 ? (
          /* No enrolled students empty state */
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
              <InboxIcon className="h-10 w-10 text-muted-foreground/60" strokeWidth={1.5} />
            </div>
            <div className="text-center max-w-sm flex flex-col items-center">
              <p className="text-base font-semibold text-slate-800">No student enrollments</p>
              <p className="text-sm text-slate-500 mt-1">
                No students have enrolled in this course yet. Once students sign up, they will appear in this roster.
              </p>
            </div>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          /* No search results empty state */
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="text-center max-w-sm flex flex-col items-center">
              <p className="text-base font-semibold text-slate-800">No search results</p>
              <p className="text-sm text-slate-500 mt-1">
                No students match your query "<span className="font-semibold text-slate-700">{searchQuery}</span>". Try refining your search keywords.
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="mt-4 border border-slate-200 cursor-pointer"
              >
                Clear Search
              </Button>
            </div>
          </div>
        ) : (
          /* Enrolled students roster table */
          <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 bg-white">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Enrollment Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-slate-50/50 transition-colors duration-100">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-800">
                        {enrollment.student?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">
                        {enrollment.student?.email || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-500">
                        {formatDate(enrollment.enrolledAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="bg-emerald-100 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-none font-semibold text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                        Enrolled
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
