import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PlusCircle, CheckCircle2 } from 'lucide-react';
import CourseForm from '../components/CourseForm';
import useCourses from '../hooks/useCourses';
import useAuthStore from '../../../store/useAuthStore';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { createCourse, loading, error } = useCourses();
  const { user } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState(null);

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  // Guard: Redirect if not teacher/admin
  useEffect(() => {
    if (user && !isTeacherOrAdmin) {
      navigate('/');
    }
  }, [user, isTeacherOrAdmin, navigate]);

  const handleSubmit = async (formData) => {
    setSuccessMsg(null);
    try {
      // Inject the logged-in teacher's ID — required by the backend
      await createCourse({ ...formData, teacherId: user?.id });
      setSuccessMsg('Course created successfully!');
      setTimeout(() => navigate('/courses'), 1200);
    } catch {
      // error is surfaced via the store's error state (passed as prop to CourseForm)
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/*  Back navigation  */}
      <button
        type="button"
        id="back-to-courses-btn"
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors duration-150 self-start group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Courses
      </button>

      {/* Page header  */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100">
          <PlusCircle className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Create Course</h1>
          <p className="text-sm text-slate-500 mt-0.5">Fill in the details to publish a new course</p>
        </div>
      </div>

      {/* Success banner  */}
      {successMsg && (
        <div
          role="status"
          className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {/*  Card wrapper  */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <CourseForm
          initialData={null}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
}
