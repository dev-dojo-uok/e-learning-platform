import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Clock, Award, Loader2, AlertTriangle, 
  ChevronLeft, ChevronRight, CheckCircle2, Inbox, HelpCircle
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
        const res = await axios.get(`/quizzes/${id}`);
        setQuiz(res.data);
        
        // Check if there is already an active (unsubmitted) attempt
        const attemptsRes = await axios.get(`/quizzes/${id}/attempts`);
        setAttempts(attemptsRes.data);
        const active = attemptsRes.data.find(att => att.submittedAt === null);
        if (active) {
          setAttempt(active);
          setAnswers(active.submittedAnswersJson || {});
          setQuizStarted(true);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz details.');
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

  // Start Attempt Handler
  const handleStartQuiz = async () => {
    setStarting(true);
    setError('');
    try {
      const res = await axios.post(`/quizzes/${id}/attempt`);
      setAttempt(res.data);
      setAttempts(prev => [...prev, res.data]);
      setAnswers(res.data.submittedAnswersJson || {});
      setQuizStarted(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Could not initialize quiz attempt. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  // Finalize attempts and forfeit remaining retakes handler
  const handleFinalizeQuiz = async () => {
    const submittedAttempts = attempts.filter(a => a.submittedAt !== null);
    if (submittedAttempts.length === 0) return;
    
    setFinalizing(true);
    setError('');
    const lastAttempt = submittedAttempts[submittedAttempts.length - 1];
    try {
      await axios.put(`/quizzes/attempts/${lastAttempt.id}/finalize`);
      // Reload attempts
      const attemptsRes = await axios.get(`/quizzes/${id}/attempts`);
      setAttempts(attemptsRes.data);
      toast.success('Quiz finalized successfully. Answer review is now unlocked.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to finalize quiz. Please try again.');
      toast.error('Failed to finalize quiz.');
    } finally {
      setFinalizing(false);
      setShowFinalizeConfirm(false);
    }
  };

  // Select Option Handler
  const handleSelectOption = async (questionId, option) => {
    const updatedAnswers = {
      ...answers,
      [questionId]: option
    };
    setAnswers(updatedAnswers);

    if (attempt?.id) {
      try {
        await axios.put(`/quizzes/attempts/${attempt.id}/draft`, {
          submittedAnswersJson: updatedAnswers
        });
      } catch (err) {
        console.error('Failed to sync draft answers:', err);
      }
    }
  };

  // Submit Handler
  const handleSubmitQuiz = () => {
    setShowSubmitConfirm(true);
  };

  // Auto-submit on time expiry
  const handleAutoSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const res = await axios.put(`/quizzes/attempts/${attempt.id}/submit`, {
        submittedAnswersJson: answers
      });
      setExpiredAttemptId(res.data.id);
      setShowTimeExpiredAlert(true);
    } catch (err) {
      console.error(err);
      setError('Time expired and automatic submission failed. Please contact your instructor.');
      setSubmitting(false);
    }
  };

  const submitQuiz = async (answersPayload) => {
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const res = await axios.put(`/quizzes/attempts/${attempt.id}/submit`, {
        submittedAnswersJson: answersPayload
      });
      // Redirect to review page
      navigate(`/quizzes/attempts/${res.data.id}/review`);
    } catch (err) {
      console.error(err);
      setError('An error occurred during submission. Please contact your instructor.');
      setSubmitting(false);
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
        <Loader2 className="h-9 w-9 animate-spin text-indigo-500" />
        <p className="text-sm font-medium animate-pulse">Preparing test sheet…</p>
      </div>
    );
  }

  if (error && !quizStarted) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto font-sans text-black">
        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors self-start group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Courses
        </button>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
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
      <div className="flex flex-col gap-6 max-w-2xl mx-auto font-sans text-black animate-in fade-in duration-200">
        <button
          type="button"
          onClick={() => navigate(`/courses/${quiz?.courseId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors self-start group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Course Details
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {/* Header Banner */}
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">{quiz?.title}</h1>
              <p className="text-xs text-slate-500 mt-1">Interactive Assessment Activity</p>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <Clock className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time Limit</span>
                  <span className="text-sm font-bold text-slate-800">
                    {quiz?.hasTimeLimit ? `${quiz.timeLimitMinutes} Mins` : 'No Limit'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <Award className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Passing Score</span>
                  <span className="text-sm font-bold text-slate-800">{quiz?.minPassMark}%</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Attempts</span>
                  <span className="text-sm font-bold text-slate-800">
                    {submittedAttempts.length} of {attemptLimit} used
                  </span>
                </div>
              </div>
            </div>

            {/* Availability info */}
            {(quiz?.openTime || quiz?.closeTime) && (
              <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl flex flex-col gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Availability Dates</span>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-xs">
                  {quiz.openTime && (
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-400">Open Date</span>
                      <span className="font-bold text-slate-700">{formatDateTime(quiz.openTime)}</span>
                    </div>
                  )}
                  {quiz.closeTime && (
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-400">Closing Date</span>
                      <span className="font-bold text-slate-700">{formatDateTime(quiz.closeTime)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Previous Attempts Log */}
            {submittedAttempts.length > 0 && (
              <div className="p-4 bg-slate-50/50 border border-slate-200 rounded-xl flex flex-col gap-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Previous Attempts</span>
                <div className="flex flex-col gap-2">
                  {submittedAttempts.map((att, idx) => {
                    const passed = att.score >= (quiz?.minPassMark || 50);
                    return (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-white border border-slate-150 rounded-xl text-xs shadow-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-slate-800">Attempt {idx + 1}</span>
                          <span className="text-[9px] text-slate-400">
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
                            <span className="font-extrabold text-slate-800">{att.score?.toFixed(1)}%</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                              passed 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {passed ? 'Pass' : 'Fail'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/quizzes/attempts/${att.id}/review`)}
                            className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Finalize Quiz Option (Only for multi-attempt quizzes where they have attempts left and haven't finalized yet) */}
            {attemptLimit > 1 && submittedAttempts.length > 0 && submittedAttempts.length < attemptLimit && !isFinalized && (
              <div className="p-4 bg-amber-50/70 border border-amber-250 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-amber-800">Satisfied with your score?</span>
                  <span className="text-[11px] text-amber-750 leading-relaxed">
                    You have attempts remaining. You can finalize the quiz now to immediately unlock your answer review sheet. Doing so will forfeit all remaining attempts.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFinalizeConfirm(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap self-start sm:self-center shadow-sm"
                >
                  Finalize Quiz
                </button>
              </div>
            )}

            {/* Warning Banners */}
            {isFinalized && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-150">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">Quiz Finalized</span>
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
              <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-150">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">Quiz Not Open Yet</span>
                  <span className="text-xs">This quiz is scheduled to open on {formatDateTime(quiz.openTime)}.</span>
                </div>
              </div>
            )}

            {alreadyClosed && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-150">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">Quiz Closed</span>
                  <span className="text-xs">This quiz closed on {formatDateTime(quiz.closeTime)} and is no longer accepting new attempts.</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <div className="text-sm text-slate-600 leading-relaxed space-y-2">
              <p className="font-bold text-slate-700">Important Instructions:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>This quiz contains <span className="font-bold text-indigo-600">{questions.length} questions</span>.</li>
                {quiz?.hasTimeLimit && (
                  <li>Once you click <strong>Start Quiz</strong>, the timer of <span className="font-bold text-indigo-600">{quiz.timeLimitMinutes} minutes</span> will begin counting down. Leaving or refreshing the page will not pause the timer.</li>
                )}
                <li>Ensure a stable network connection before starting.</li>
                <li>Your answers will be automatically graded and saved.</li>
              </ul>
            </div>

            <button
              type="button"
              id="start-quiz-btn"
              disabled={starting || isBlocked}
              onClick={handleStartQuiz}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {starting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Starting Exam…
                </>
              ) : isBlocked ? (
                'Quiz Locked'
              ) : (
                'Start Quiz Assessment'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  // Render Exam Taking Screen
  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-5xl mx-auto pb-12 font-sans text-black animate-in fade-in duration-200">
      
      {/* LEFT COLUMN: ACTIVE QUESTION PANEL */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Banner with Timer */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Exam Session</span>
            <span className="text-sm font-extrabold text-slate-800 truncate max-w-xs">{quiz?.title}</span>
          </div>

          {quiz?.hasTimeLimit && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono font-bold ${
              timeLeft < 60 
                ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
                : 'bg-indigo-50 border-indigo-100 text-indigo-600'
            }`}>
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Question Box Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6 min-h-[300px] justify-between">
          <div>
            {/* Question title index */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                {currentQuestion?.points} Points
              </span>
            </div>

            {/* Question Text */}
            <p className="text-base font-bold text-slate-800 mt-4 leading-relaxed">
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
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-500' 
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(currentIdx - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                id="submit-quiz-btn"
                disabled={submitting}
                onClick={handleSubmitQuiz}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  'Finish Assessment'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: QUESTION GRID NAVIGATOR */}
      <div className="w-full md:w-64 flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
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
                      ? 'border-indigo-500 bg-indigo-600 text-white shadow-md' 
                      : isAnswered 
                        ? 'border-slate-300 bg-slate-100 text-slate-700' 
                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-indigo-600 border border-indigo-500 rounded" />
              <span>Current Question</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-slate-100 border border-slate-300 rounded" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-white border border-slate-200 rounded" />
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
            }}>
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
