import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Edit, Trash2, Loader2, Award, 
  Users, CheckCircle, XCircle, ChevronRight, HelpCircle
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/Modal';

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
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Loading dashboard statistics…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12 font-sans text-foreground animate-in fade-in duration-200">
      
      {/* Back nav & Header */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate(`/courses/${quiz?.courseId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors self-start group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Course Details
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted text-primary flex items-center justify-center flex-shrink-0">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">{quiz?.title}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Quiz Management Console & Student Submissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              id="edit-quiz-dashboard-btn"
              onClick={() => navigate(`/quizzes/edit/${id}`)}
              variant="outline"
              className="gap-1.5 shadow-sm"
            >
              <Edit className="h-4 w-4" />
              Edit Quiz
            </Button>
            <Button
              type="button"
              id="delete-quiz-dashboard-btn"
              onClick={handleDeleteQuiz}
              variant="destructive"
              className="gap-1.5 text-white"
            >
              <Trash2 className="h-4 w-4" />
              Delete Quiz
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold rounded-xl">
          {error}
        </div>
      )}

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total attempts */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-muted text-primary flex items-center justify-center flex-shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Submissions</span>
            <span className="text-xl font-extrabold text-foreground">{totalAttempts}</span>
          </div>
        </div>

        {/* Avg score */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-muted text-primary flex items-center justify-center flex-shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Avg Score</span>
            <span className="text-xl font-extrabold text-foreground">{averageScore}%</span>
          </div>
        </div>

        {/* High score */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-muted text-primary flex items-center justify-center flex-shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Top Score</span>
            <span className="text-xl font-extrabold text-foreground">{highestScore}%</span>
          </div>
        </div>

        {/* Pass rate */}
        <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-muted text-primary flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Pass Rate</span>
            <span className="text-xl font-extrabold text-foreground">{passRate}%</span>
          </div>
        </div>
      </div>

      {/* QUIZ CONFIG RULES DETAIL */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col gap-3">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider pb-2 border-b border-border">Quiz Configurations</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-muted-foreground mt-1">
          <div>Time Limit: <span className="text-foreground">{quiz?.hasTimeLimit ? `${quiz.timeLimitMinutes} Minutes` : 'None'}</span></div>
          <div>Passing Score: <span className="text-foreground">{quiz?.minPassMark}%</span></div>
          <div>Review Answers Policy: <span className="text-primary font-bold">{quiz?.reviewPolicy}</span></div>
        </div>
      </div>

      {/* ATTEMPTS LIST TABLE */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/40">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Student Submission Log</h2>
        </div>

        {attempts.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center">
            <Users className="h-10 w-10 text-muted-foreground/60 mb-2" />
            <p className="font-semibold text-foreground">No student submissions yet.</p>
            <p className="text-xs text-muted-foreground mt-0.5">As students attempt this quiz, their scores will populate here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground text-xs uppercase font-bold">
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Completed Date</th>
                  <th className="px-6 py-3 text-center">Score</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3">Teacher Feedback</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-semibold text-foreground">
                {attempts.map((att) => {
                  const passed = att.score >= (quiz?.minPassMark || 50);
                  return (
                    <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                      {/* Student info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{att.student?.name}</span>
                          <span className="text-xs text-muted-foreground font-normal">{att.student?.email}</span>
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(att.submittedAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      {/* Score */}
                      <td className="px-6 py-4 text-center font-bold text-foreground">
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
                      <td className="px-6 py-4 max-w-xs truncate text-xs font-normal text-muted-foreground" title={att.teacherFeedback}>
                        {att.teacherFeedback || <span className="italic text-muted-foreground/60">No feedback given</span>}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            id={`review-attempt-btn-${att.id}`}
                            onClick={() => navigate(`/quizzes/attempts/${att.id}/review`)}
                            variant="secondary"
                            size="sm"
                            className="h-8 text-xs font-bold text-muted-foreground"
                          >
                            Review Attempt
                          </Button>
                          <Button
                            type="button"
                            id={`grade-attempt-btn-${att.id}`}
                            onClick={() => handleOpenGrading(att)}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-bold gap-1 text-primary"
                          >
                            Grade Override
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
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
        <Modal isOpen={true} onClose={() => setGradingAttempt(null)} title="Grade Override & Feedback" size="md">
          <form onSubmit={handleSaveGrade} className="flex flex-col gap-4">
            <div className="text-xs text-muted-foreground font-semibold leading-relaxed">
              Student: <span className="font-bold text-foreground">{gradingAttempt.student?.name} ({gradingAttempt.student?.email})</span><br />
              Automatically Graded Score: <span className="font-bold text-foreground">{gradingAttempt.score?.toFixed(1)}%</span>
            </div>

            {/* Override Score Input */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider">Assigned Score (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                required
                value={overrideScore}
                onChange={(e) => setOverrideScore(e.target.value)}
                className="w-full animate-none"
              />
            </div>

            {/* Feedback Input */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-foreground uppercase tracking-wider">Teacher Feedback</Label>
              <textarea
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Provide comments or notes regarding this student attempt…"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setGradingAttempt(null)}
                disabled={gradingLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={gradingLoading}
                className="text-white"
              >
                {gradingLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save Grade'
                )}
              </Button>
            </div>
          </form>
        </Modal>
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
            <AlertDialogAction onClick={performDeleteQuiz} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
