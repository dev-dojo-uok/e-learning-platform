import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Loader2,
  AlertCircle,
  BookOpen,
  CalendarDays,
  RefreshCw,
  Layers,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Lock,
} from 'lucide-react';

import useCourses from '../hooks/useCourses';
import { ModuleList, ModuleForm, useModules } from '../../modules';
import useAuthStore from '../../../store/useAuthStore';
import { Button } from '@/components/ui/button';
import { getForumsByCourse } from '../../forums/services/forumService';
import Modal from '@/components/Modal';
import api from '../../../lib/axios';
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

// ── Small detail row ─────────────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 flex-shrink-0 mt-0.5">
      <Icon className="h-4 w-4 text-primary" />
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
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  // ── Module State & Hook ──
  const {
    createModule,
    updateModule,
    deleteModule,
    loading: moduleActionLoading,
    error: moduleStoreError,
  } = useModules();

  const [toast, setToast] = useState(null); // { message, type }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState(null); // Null for create, object for edit
  const [moduleToDelete, setModuleToDelete] = useState(null);

  // Forums inline listing state
  const [forums, setForums] = useState([]);
  const [forumsLoading, setForumsLoading] = useState(true);

  // Enrollment State
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  const isEnrolled = isTeacherOrAdmin || enrolledCourses.some(e => (e.courseId === id || e.course?.id === id));

  const fetchForums = () => {
    setForumsLoading(true);
    getForumsByCourse(id)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.forums ?? [];
        setForums(list);
      })
      .catch((err) => console.error('Failed to load forums:', err))
      .finally(() => setForumsLoading(false));
  };

  useEffect(() => {
    if (id) {
      fetchCourseById(id);
      fetchForums();

      if (user && user.role === 'STUDENT') {
        setCheckingEnrollment(true);
        api.get(`/students/${user.id}/courses`)
          .then((res) => {
            setEnrolledCourses(res.data || []);
          })
          .catch((err) => console.error('Failed to check enrollment:', err))
          .finally(() => setCheckingEnrollment(false));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post('/enrollments', {
        studentId: user.id,
        courseId: id
      });
      setToast({ message: 'Successfully enrolled in the course!', type: 'success' });
      const res = await api.get(`/students/${user.id}/courses`);
      setEnrolledCourses(res.data || []);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to enroll in the course.', type: 'error' });
    } finally {
      setEnrolling(false);
    }
  };

  // ── Module Handlers ──
  const handleOpenAddModal = () => {
    setCurrentModule(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (module) => {
    setCurrentModule(module);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (currentModule) {
        await updateModule(currentModule._id, formData);
        setToast({ message: 'Module updated successfully.', type: 'success' });
      } else {
        await createModule({ ...formData, courseId: id });
        setToast({ message: 'Module created successfully.', type: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      setToast({ message: err.message || 'An error occurred.', type: 'error' });
    }
  };

  const handleDeleteModule = (moduleId) => {
    setModuleToDelete(moduleId);
  };

  const handleConfirmDeleteModule = async () => {
    if (!moduleToDelete) return;
    const moduleId = moduleToDelete;
    setModuleToDelete(null);

    try {
      await deleteModule(moduleId);
      setToast({ message: 'Module deleted successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete module.', type: 'error' });
    }
  };

  const course = selectedCourse?._id === id ? selectedCourse : null;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading && !course) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
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
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors self-start group"
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
    <div className="flex flex-col gap-6  mx-auto">
      {/* ── Back navigation ── */}
      <button
        type="button"
        id="back-to-courses-list-btn"
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors duration-150 self-start group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Courses
      </button>


      {/* ── Plain Page Header & Course Info ── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-3 flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {course?.title || 'Course Details'}
          </h1>
          {course?.description ? (
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {course.description}
            </p>
          ) : (
            <p className="text-slate-400 text-sm italic">No description provided for this course.</p>
          )}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Teacher: <span className="text-slate-800 font-bold">{course?.teacher?.name || 'Unknown'}</span></span>
            <span>•</span>
            <span>Created: {new Date(course?.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start">
          {user?.role === 'STUDENT' && !isEnrolled && (
            <Button
              id="enroll-course-btn"
              onClick={handleEnroll}
              disabled={enrolling || checkingEnrollment}
              
            >
              {enrolling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Enroll in Course'
              )}
            </Button>
          )}
          {isTeacherOrAdmin && <Button variant="outline" asChild>
            <Link
              to={`/courses/${id}/forums`}
              id="view-course-forums-btn"
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Manage Forums
            </Link>
          </Button>}
          {isTeacherOrAdmin && (
            <Button
              id="edit-course-btn"
              onClick={() => navigate(`/courses/edit/${id}`)}
            >
              <Pencil className="h-4 w-4" />
              Edit Course
            </Button>
          )}
          <Button
            variant="secondary"
            id="back-to-courses-btn"
            onClick={() => navigate('/courses')}
          >
            <ArrowLeft className="h-4 w-4" />
            Courses
          </Button>
        </div>
      </div>

      {/* ── Discussion Forums inline list ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Discussion Forums
          </h2>
        </div>

        {forumsLoading ? (
          <div className="space-y-2">
            <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
            <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
          </div>
        ) : forums.length === 0 ? (
          <div className="p-4 text-center border rounded-xl bg-slate-50/50 text-slate-400 text-sm">
            No forums created yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {forums.map((forum) => {
              const content = (
                <>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{forum.name || forum.title}</p>
                    {forum.description && (
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{forum.description}</p>
                    )}
                  </div>
                  {isEnrolled ? (
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                      <span className="text-xs font-semibold">Locked</span>
                    </div>
                  )}
                </>
              );

              if (!isEnrolled) {
                return (
                  <div
                    key={forum.id}
                    title="Enroll in the course to unlock discussion forums"
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-xl opacity-75 shadow-sm"
                  >
                    {content}
                  </div>
                );
              }

              return (
                <Link
                  key={forum.id}
                  to={`/courses/${id}/forums`}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted/30 transition-colors shadow-sm"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Module Management ── */}
      <section aria-labelledby="module-mgmt-heading">
        {/* <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6"> */}
          <ModuleList
            courseId={id}
            isEnrolled={isEnrolled}
            onAdd={handleOpenAddModal}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteModule}
          />
        {/* </div> */}
      </section>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentModule ? 'Edit Module' : 'Create Module'}
      >
        <ModuleForm
          initialData={currentModule}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
          loading={moduleActionLoading}
          error={moduleStoreError}
        />
      </Modal>



      {/* Delete Module Confirmation Dialog */}
      <AlertDialog open={!!moduleToDelete} onOpenChange={(open) => !open && setModuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this module? This action cannot be undone and will delete all associated study materials and quizzes inside it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteModule} className="bg-red-600 hover:bg-red-700">
              Delete Module
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Inline Toast Notification ───────────────────────────────────────────────
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


