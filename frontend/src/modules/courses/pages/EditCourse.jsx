import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import CourseForm from '../components/CourseForm';
import useCourses from '../hooks/useCourses';
import useAuthStore from '../../../store/useAuthStore';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  // Guard: Redirect if not teacher/admin
  useEffect(() => {
    if (user && !isTeacherOrAdmin) {
      navigate('/');
    }
  }, [user, isTeacherOrAdmin, navigate]);

  const { selectedCourse, loading, error, fetchCourseById, updateCourse } = useCourses();

  // Guard: Redirect if teacher tries to edit another teacher's course
  useEffect(() => {
    if (selectedCourse && !loading) {
      const isOwner = selectedCourse.teacherId === user?.id || selectedCourse.teacher?.id === user?.id;
      if (user?.role === 'TEACHER' && !isOwner) {
        navigate('/');
      }
    }
  }, [selectedCourse, loading, user, navigate]);
  const [successMsg, setSuccessMsg] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Load the course on mount
  useEffect(() => {
    if (id) {
      fetchCourseById(id).catch(() => {
        setFetchError('Could not load course. It may have been deleted.');
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (formData) => {
    setSuccessMsg(null);
    try {
      await updateCourse(id, formData);
      setSuccessMsg('Course updated successfully!');
      setTimeout(() => navigate(`/courses/${id}`), 1200);
    } catch {
      // error surfaced via store's error state
    }
  };

  // -------------------------Loading skeleton while fetching the course---------------------------
  const isFetching = loading && !selectedCourse;

  // ------------------------ Guard: wrong course loaded (navigated from another)-------------------------
  const courseToEdit =
    selectedCourse && selectedCourse._id === id ? selectedCourse : null;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Back navigation  */}
      <button
        type="button"
        id="back-to-course-detail-btn"
        onClick={() => navigate(`/courses/${id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors duration-150 self-start group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Course Details
      </button>

      {/* Page header  */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-100">
          <Pencil className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Edit Course</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {courseToEdit?.title || 'Update course information'}
          </p>
        </div>
      </div>

      {/*  Fetch error  */}
      {fetchError && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Failed to load course</p>
            <p className="text-xs mt-0.5 text-red-500">{fetchError}</p>
          </div>
        </div>
      )}

      {/*  Success banner  */}
      {successMsg && (
        <div
          role="status"
          className="flex items-center gap-2.5 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
        >
          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/*  Card wrapper  */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {isFetching ? (
          /* Loading skeleton */
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading course…</p>
          </div>
        ) : (
          <CourseForm
            initialData={courseToEdit}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
