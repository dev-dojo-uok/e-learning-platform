import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Edit, Trash2, Loader2, Award, Calendar, 
  Users, CheckCircle, XCircle, ChevronRight, HelpCircle, MessageSquare
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
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
} from '../../../components/ui/alert-dialog';

export default function QuizDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Manual grading modal state
  const [gradingAttempt, setGradingAttempt] = useState(null);
  const [overrideScore, setOverrideScore] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Guard: Redirect if not teacher/admin
  useEffect(() => {
    if (!isTeacherOrAdmin) {
      navigate('/');
    }
  }, [isTeacherOrAdmin, navigate]);

  // Fetch quiz and attempts
  const fetchData = async () => {
    try {
      const [quizRes, attemptsRes] = await Promise.all([
        axios.get(`/quizzes/${id}`),
        axios.get(`/quizzes/${id}/attempts`)
      ]);
      setQuiz(quizRes.data);
      setAttempts(attemptsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load quiz statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && isTeacherOrAdmin) {
      fetchData();
    }
  }, [id, isTeacherOrAdmin]);

  // Delete Quiz Handler
  const handleDeleteQuiz = () => {
    setShowDeleteConfirm(true);
  };

  const performDeleteQuiz = async () => {
    setShowDeleteConfirm(false);
    try {
      await axios.delete(`/quizzes/${id}`);
      toast.success('Quiz deleted successfully.');
      navigate(`/courses/${quiz.courseId}`);
    } catch (err) {
      console.error(err);
      setError('Failed to delete quiz.');
      toast.error('Failed to delete quiz.');
    }
  };

  // Open grading modal
  const handleOpenGrading = (attempt) => {
    setGradingAttempt(attempt);
    setOverrideScore(attempt.score);
    setFeedbackText(attempt.teacherFeedback || '');
  };

  // Submit manual grade override
  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!gradingAttempt) return;

    setGradingLoading(true);
    try {
      await axios.put(`/quizzes/attempts/${gradingAttempt.id}/grade`, {
        score: Number(overrideScore),
        teacherFeedback: feedbackText.trim()
      });
      setGradingAttempt(null);
      fetchData(); // reload
      toast.success('Grade override applied successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to override grade.');
    } finally {
      setGradingLoading(false);
    }
  };

  // Calculate Metrics
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(att => att.score >= (quiz?.minPassMark || 50)).length;
  const passRate = totalAttempts > 0 ? ((passedAttempts / totalAttempts) * 100).toFixed(1) : '0.0';
  
  const averageScore = totalAttempts > 0 
    ? (attempts.reduce((sum, att) => sum + (att.score || 0), 0) / totalAttempts).toFixed(1) 
    : '0.0';

  const highestScore = totalAttempts > 0
    ? Math.max(...attempts.map(att => att.score || 0)).toFixed(1)
    : '0.0';

  if (!isTeacherOrAdmin) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500 font-sans">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-500" />
        <p className="text-sm font-medium animate-pulse">Loading dashboard statistics…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12 font-sans text-black animate-in fade-in duration-200">
      
      {/* Back nav & Header */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate(`/courses/${quiz?.courseId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors self-start group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Course Details
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{quiz?.title}</h1>
              <p className="text-xs text-slate-500 mt-0.5">Quiz Management Console & Student Submissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="edit-quiz-dashboard-btn"
              onClick={() => navigate(`/quizzes/edit/${id}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all border border-slate-200 shadow-sm"
            >
              <Edit className="h-4 w-4" />
              Edit Quiz
            </button>
            <button
              type="button"
              id="delete-quiz-dashboard-btn"
              onClick={handleDeleteQuiz}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              Delete Quiz
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl">
          {error}
        </div>
      )}

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total attempts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Submissions</span>
            <span className="text-xl font-extrabold text-slate-800">{totalAttempts}</span>
          </div>
        </div>

        {/* Avg score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Score</span>
            <span className="text-xl font-extrabold text-slate-800">{averageScore}%</span>
          </div>
        </div>

        {/* High score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Score</span>
            <span className="text-xl font-extrabold text-slate-800">{highestScore}%</span>
          </div>
        </div>

        {/* Pass rate */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pass Rate</span>
            <span className="text-xl font-extrabold text-slate-800">{passRate}%</span>
          </div>
        </div>
      </div>

      {/* QUIZ CONFIG RULES DETAIL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">Quiz Configurations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-slate-600 mt-1">
          <div>Time Limit: <span className="text-slate-800">{quiz?.hasTimeLimit ? `${quiz.timeLimitMinutes} Minutes` : 'None'}</span></div>
          <div>Passing Score: <span className="text-slate-800">{quiz?.minPassMark}%</span></div>
          <div>Review Answers Policy: <span className="text-indigo-600 font-bold">{quiz?.reviewPolicy}</span></div>
        </div>
      </div>

      {/* ATTEMPTS LIST TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Student Submission Log</h2>
        </div>

        {attempts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <Users className="h-10 w-10 text-slate-300 mb-2" />
            <p className="font-semibold text-slate-500">No student submissions yet.</p>
            <p className="text-xs text-slate-400 mt-0.5">As students attempt this quiz, their scores will populate here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs uppercase font-bold">
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Completed Date</th>
                  <th className="px-6 py-3 text-center">Score</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3">Teacher Feedback</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {attempts.map((att) => {
                  const passed = att.score >= (quiz?.minPassMark || 50);
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Student info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{att.student?.name}</span>
                          <span className="text-xs text-slate-400 font-normal">{att.student?.email}</span>
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(att.submittedAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      {/* Score */}
                      <td className="px-6 py-4 text-center font-bold text-slate-900">
                        {att.score?.toFixed(1)}%
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          {passed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                              Pass
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-red-800 bg-red-50 border border-red-200">
                              <XCircle className="h-3 w-3 text-red-500" />
                              Fail
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Feedback */}
                      <td className="px-6 py-4 max-w-xs truncate text-xs font-normal text-slate-500" title={att.teacherFeedback}>
                        {att.teacherFeedback || <span className="italic text-slate-300">No feedback given</span>}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            id={`review-attempt-btn-${att.id}`}
                            onClick={() => navigate(`/quizzes/attempts/${att.id}/review`)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Review Attempt
                          </button>
                          <button
                            type="button"
                            id={`grade-attempt-btn-${att.id}`}
                            onClick={() => handleOpenGrading(att)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Grade Override
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MANUAL GRADING & OVERRIDE DIALOG */}
      {gradingAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Grade Override & Feedback</h3>
              <button
                onClick={() => setGradingAttempt(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-xl font-medium leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="flex flex-col gap-4">
              <div className="text-xs text-slate-500 font-semibold leading-relaxed">
                Student: <span className="font-bold text-slate-700">{gradingAttempt.student?.name} ({gradingAttempt.student?.email})</span><br />
                Automatically Graded Score: <span className="font-bold text-slate-700">{gradingAttempt.score?.toFixed(1)}%</span>
              </div>

              {/* Override Score Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Assigned Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              {/* Feedback Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Teacher Feedback</label>
                <textarea
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Provide comments or notes regarding this student attempt…"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingAttempt(null)}
                  disabled={gradingLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={gradingLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-colors"
                >
                  {gradingLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save Grade'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This will delete all student attempts and remove it from the course module. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performDeleteQuiz} className="bg-red-600 hover:bg-red-700">
              Delete Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
