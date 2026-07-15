import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Clock, Award, Loader2, AlertTriangle, 
  ChevronLeft, ChevronRight, CheckCircle2, HelpCircle
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
import { Badge } from '@/components/ui/badge';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Active quiz-taking states
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  
  const timerRef = useRef(null);

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showTimeExpiredAlert, setShowTimeExpiredAlert] = useState(false);
  const [expiredAttemptId, setExpiredAttemptId] = useState(null);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  // Fetch Quiz info
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${backendBase}/quizzes/${id}`);
        setQuiz(res.data);
        
        // Check if there is already an active (unsubmitted) attempt
        const attemptsRes = await axios.get(`${backendBase}/quizzes/${id}/attempts`);
        setAttempts(attemptsRes.data);
        const active = attemptsRes.data.find(att => att.submittedAt === null);
        if (active) {
          setAttempt(active);
          setAnswers(active.submittedAnswersJson || {});
          setQuizStarted(true);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to load quiz details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id]);

  // Timer logic
  useEffect(() => {
    if (quizStarted && attempt && quiz?.hasTimeLimit && quiz?.timeLimitMinutes > 0) {
      // Calculate remaining time based on start time
      const startedAt = new Date(attempt.startedAt).getTime();
      const limitMs = quiz.timeLimitMinutes * 60 * 1000;
      const expireTime = startedAt + limitMs;

      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((expireTime - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
        }
      };

      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [quizStarted, attempt, quiz]);

  // Handle auto-saving drafts (every 10 seconds or on select)
  const saveDraftAnswers = async (updatedAnswers) => {
    if (!attempt) return;
    try {
      const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.put(`${backendBase}/quizzes/attempts/${attempt.id}/draft`, {
        submittedAnswersJson: updatedAnswers
      });
    } catch (err) {
      console.error('Failed to save draft answers:', err);
    }
  };

  const handleSelectOption = (questionId, option) => {
    const isSelected = answers[questionId] === option;
    let updated;
    if (isSelected) {
      updated = { ...answers };
      delete updated[questionId];
    } else {
      updated = { ...answers, [questionId]: option };
    }
    setAnswers(updated);
    saveDraftAnswers(updated);
  };

  const handleStartQuiz = async () => {
    setStarting(true);
    setError('');
    try {
      const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${backendBase}/quizzes/${id}/attempt`);
      const newAttempt = res.data?.attempt ?? res.data;
      setAttempt(newAttempt);
      setAnswers({});
      setQuizStarted(true);
      setCurrentIdx(0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start quiz attempt.');
    } finally {
      setStarting(false);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    if (!attempt) return;
    setSubmitting(true);
    setError('');
    try {
      const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.put(`${backendBase}/quizzes/attempts/${attempt.id}/submit`, {
        submittedAnswersJson: finalAnswers
      });
      clearInterval(timerRef.current);
      navigate(`/quizzes/attempts/${attempt.id}/review`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quiz.');
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (!attempt) return;
    try {
      const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.put(`${backendBase}/quizzes/attempts/${attempt.id}/submit`, {
        submittedAnswersJson: answers
      });
      setExpiredAttemptId(attempt.id);
      setShowTimeExpiredAlert(true);
    } catch (err) {
      console.error(err);
      navigate('/courses');
    }
  };

  const handleSubmitQuiz = () => {
    // Check if there are unanswered questions
    const questionsList = quiz?.questionsJson || [];
    const unansweredCount = questionsList.filter(q => answers[q.id] === undefined).length;
    
    if (unansweredCount > 0) {
      toast.warning(`You have ${unansweredCount} unanswered questions.`);
    }
    setShowSubmitConfirm(true);
  };

  const handleFinalizeQuiz = async () => {
    setFinalizing(true);
    try {
      const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const submitted = attempts.filter(a => a.submittedAt !== null);
      if (submitted.length === 0) {
        toast.error('No attempts found to finalize.');
        return;
      }
      
      const sorted = [...submitted].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      const latestAttempt = sorted[0];

      // Finalize the latest submitted attempt
      await axios.put(`${backendBase}/quizzes/attempts/${latestAttempt.id}/finalize`);
      toast.success('Quiz finalized and locked!');
      setShowFinalizeConfirm(false);
      
      // Update local attempts state so that UI updates reactively to finalized and locked state
      setAttempts(prev => prev.map(a => a.id === latestAttempt.id ? { ...a, isFinal: true } : a));
    } catch (err) {
      console.error(err);
      toast.error('Failed to finalize quiz.');
    } finally {
      setFinalizing(false);
    }
  };

  // Helper: Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500 font-sans">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Preparing test sheet…</p>
      </div>
    );
  }

  if (error && !quizStarted) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto font-sans text-foreground">
        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors self-start group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Courses
        </button>
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center gap-2">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const questions = quiz?.questionsJson || [];

  // Render Introduction Screen
  if (!quizStarted) {
    const submittedAttempts = attempts.filter(a => a.submittedAt !== null);
    const attemptLimit = quiz?.attemptLimit || 2;
    const limitReached = submittedAttempts.length >= attemptLimit;
    const isFinalized = attempts.some(a => a.isFinal === true);

    const now = new Date();
    const notYetOpen = quiz?.openTime && now < new Date(quiz.openTime);
    const alreadyClosed = quiz?.closeTime && now > new Date(quiz.closeTime);
    const isBlocked = isFinalized || limitReached || notYetOpen || alreadyClosed;

    const formatDateTime = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    };

    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto font-sans text-foreground animate-in fade-in duration-200">
        <button
          type="button"
          onClick={() => navigate(`/courses/${quiz?.courseId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors self-start group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Course Details
        </button>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
          {/* Header Banner */}
          <div className="p-6 bg-muted/40 border-b border-border flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted text-primary flex items-center justify-center flex-shrink-0">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">{quiz?.title}</h1>
              <p className="text-xs text-muted-foreground mt-1">Interactive Assessment Activity</p>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Time Limit</span>
                  <span className="text-sm font-bold text-foreground">
                    {quiz?.hasTimeLimit ? `${quiz.timeLimitMinutes} Mins` : 'No Limit'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center gap-3">
                <Award className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Passing Score</span>
                  <span className="text-sm font-bold text-foreground">{quiz?.minPassMark}%</span>
                </div>
              </div>

              <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Attempts</span>
                  <span className="text-sm font-bold text-foreground">
                    {submittedAttempts.length} of {attemptLimit} used
                  </span>
                </div>
              </div>
            </div>

            {/* Availability info */}
            {(quiz?.openTime || quiz?.closeTime) && (
              <div className="p-4 bg-muted/20 border border-border rounded-xl flex flex-col gap-2">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Availability Dates</span>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-xs">
                  {quiz.openTime && (
                    <div className="flex flex-col">
                      <span className="font-semibold text-muted-foreground">Open Date</span>
                      <span className="font-bold text-foreground">{formatDateTime(quiz.openTime)}</span>
                    </div>
                  )}
                  {quiz.closeTime && (
                    <div className="flex flex-col">
                      <span className="font-semibold text-muted-foreground">Closing Date</span>
                      <span className="font-bold text-foreground">{formatDateTime(quiz.closeTime)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Previous Attempts Log */}
            {submittedAttempts.length > 0 && (
              <div className="p-4 bg-muted/10 border border-border rounded-xl flex flex-col gap-3">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Your Previous Attempts</span>
                <div className="flex flex-col gap-2">
                  {submittedAttempts.map((att, idx) => {
                    const passed = att.score >= (quiz?.minPassMark || 50);
                    return (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl text-xs shadow-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-foreground">Attempt {idx + 1}</span>
                          <span className="text-[9px] text-muted-foreground font-normal">
                            Submitted: {new Date(att.submittedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-foreground">{att.score?.toFixed(1)}%</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              passed 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {passed ? 'Pass' : 'Fail'}
                            </span>
                          </div>
                          <Button
                            type="button"
                            onClick={() => navigate(`/quizzes/attempts/${att.id}/review`)}
                            variant="secondary"
                            size="sm"
                            className="h-7 text-[11px]"
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Finalize Quiz Option */}
            {attemptLimit > 1 && submittedAttempts.length > 0 && submittedAttempts.length < attemptLimit && !isFinalized && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-amber-800">Satisfied with your score?</span>
                  <span className="text-[11px] text-amber-700 leading-relaxed">
                    You have attempts remaining. You can finalize the quiz now to immediately unlock your answer review sheet. Doing so will forfeit all remaining attempts.
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowFinalizeConfirm(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold whitespace-nowrap self-start sm:self-center shadow-sm"
                >
                  Finalize Quiz
                </Button>
              </div>
            )}

            {/* Warning Banners */}
            {isFinalized && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-150">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">Quiz Finalized and Locked</span>
                  <span className="text-xs">You have finalized this quiz and unlocked detailed answers review. No further attempts can be started.</span>
                </div>
              </div>
            )}

            {limitReached && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-150">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">Attempt Limit Reached</span>
                  <span className="text-xs">You have completed {submittedAttempts.length} of {attemptLimit} allowed attempts. No further attempts can be started.</span>
                </div>
              </div>
            )}

            {notYetOpen && (
              <div className="p-4 bg-muted border border-border text-foreground rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-150">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">Quiz Not Open Yet</span>
                  <span className="text-xs">This quiz is scheduled to open on {formatDateTime(quiz.openTime)}.</span>
                </div>
              </div>
            )}

            {alreadyClosed && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-150">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">Quiz Closed</span>
                  <span className="text-xs">This quiz closed on {formatDateTime(quiz.closeTime)} and is no longer accepting new attempts.</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <div className="text-sm text-slate-600 leading-relaxed space-y-2">
              <p className="font-bold text-slate-700">Important Instructions:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>This quiz contains <span className="font-bold text-primary">{questions.length} questions</span>.</li>
                {quiz?.hasTimeLimit && (
                  <li>Once you click <strong>Start Quiz</strong>, the timer of <span className="font-bold text-primary">{quiz.timeLimitMinutes} minutes</span> will begin counting down. Leaving or refreshing the page will not pause the timer.</li>
                )}
                <li>Ensure a stable network connection before starting.</li>
                <li>Your answers will be automatically graded and saved.</li>
              </ul>
            </div>

            <Button
              type="button"
              id="start-quiz-btn"
              disabled={starting || isBlocked}
              onClick={handleStartQuiz}
              className="w-full text-white"
            >
              {starting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting Exam…
                </>
              ) : isFinalized ? (
                'Quiz Finalized and Locked'
              ) : isBlocked ? (
                'Quiz Locked'
              ) : (
                'Start Quiz Assessment'
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  // Render Exam Taking Screen
  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto pb-12 font-sans text-foreground animate-in fade-in duration-200">
      
      {/* LEFT COLUMN: ACTIVE QUESTION PANEL */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Banner with Timer */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Exam Session</span>
            <span className="text-sm font-extrabold text-foreground truncate max-w-xs">{quiz?.title}</span>
          </div>

          {quiz?.hasTimeLimit && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-bold ${
              timeLeft < 60 
                ? 'bg-destructive/10 border-destructive/20 text-destructive animate-pulse' 
                : 'bg-muted border-border text-primary'
            }`}>
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold rounded-xl flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Question Box Card */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col gap-6 min-h-[300px] justify-between">
          <div>
            {/* Question title index */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Question {currentIdx + 1} of {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <p className="text-base font-bold text-foreground mt-4 leading-relaxed">
              {currentQuestion?.questionText}
            </p>

            {/* Options Selection */}
            <div className="flex flex-col gap-3 mt-6">
              {currentQuestion?.options.map((option, optIdx) => {
                const isSelected = answers[currentQuestion.id] === option;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, option)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-150 flex items-center justify-between ${
                      isSelected 
                        ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' 
                        : 'border-border hover:border-slate-350 bg-card text-foreground hover:bg-muted/40'
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {answers[currentQuestion?.id] !== undefined && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleSelectOption(currentQuestion.id, answers[currentQuestion.id])}
                className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              >
                Clear Choice
              </Button>
            )}

            {currentIdx < questions.length - 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="gap-1.5"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                id="submit-quiz-btn"
                disabled={submitting}
                onClick={handleSubmitQuiz}
                className="gap-1.5 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Finish Assessment'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: QUESTION GRID NAVIGATOR */}
      <div className="w-full md:w-64 flex flex-col gap-6">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
            Navigator
          </h3>

          <div className="grid grid-cols-5 gap-2.5">
            {questions.map((q, idx) => {
              const isActive = currentIdx === idx;
              const isAnswered = answers[q.id] !== undefined;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-10 h-10 rounded-lg text-xs font-bold border flex items-center justify-center transition-all ${
                    isActive 
                      ? 'border-primary bg-primary text-white shadow-md' 
                      : isAnswered 
                        ? 'border-border bg-muted/60 text-muted-foreground' 
                        : 'border-border bg-card text-muted-foreground/60 hover:border-slate-350'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border text-[10px] font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-primary border border-primary/95 rounded" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-muted/60 border border-border rounded" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-card border border-border rounded" />
              <span>Unanswered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Answers?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your answers? You cannot change them after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowSubmitConfirm(false);
              submitQuiz(answers);
            }} className="text-white">
              Submit Answers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Expired Alert Dialog */}
      <AlertDialog open={showTimeExpiredAlert} onOpenChange={setShowTimeExpiredAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time Has Expired</AlertDialogTitle>
            <AlertDialogDescription>
              Your time has expired! Your quiz answers will be submitted automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowTimeExpiredAlert(false);
              navigate(`/quizzes/attempts/${expiredAttemptId}/review`);
            }}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finalize Confirmation Dialog */}
      <AlertDialog open={showFinalizeConfirm} onOpenChange={setShowFinalizeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize Quiz Submission?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to finalize this quiz and unlock the detailed answer sheet? 
              This will lock the quiz and forfeit your remaining attempts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleFinalizeQuiz} 
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={finalizing}
            >
              {finalizing ? 'Finalizing…' : 'Finalize & Unlock'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
