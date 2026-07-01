import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Award, CheckCircle, XCircle, Loader2, AlertCircle, 
  HelpCircle, MessageSquare, Calendar
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import { Button } from '@/components/ui/button';

export default function ReviewQuiz() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch Attempt
  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${backendBase}/quizzes/attempts/${attemptId}`);
        setAttempt(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz review details.');
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchAttempt();
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500 font-sans">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Loading score report…</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="flex flex-col gap-6 max-w-2xl mx-auto font-sans text-foreground animate-in fade-in">
        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors self-start group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Courses
        </button>
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error || 'Attempt record not found.'}</span>
        </div>
      </div>
    );
  }

  const { quiz, score, teacherFeedback, submittedAnswersJson } = attempt;
  const questions = quiz?.questionsJson || [];
  const minPassMark = quiz?.minPassMark || 50;
  const passed = score >= minPassMark;

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  // Determine if review answers are available based on the returned questions content
  const isReviewAvailable = questions.length > 0 && (questions[0].correctAnswer !== undefined || questions[0].correctOption !== undefined);
  const showAnswersReview = isReviewAvailable || isTeacher;

  // Formatting date helper
  const formatPublishTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-12 font-sans text-foreground animate-in fade-in duration-200">
      
      {/* Back nav */}
      <button
        type="button"
        onClick={() => {
          if (isTeacher) {
            navigate(`/quizzes/${quiz?.id}/manage`);
          } else {
            navigate(`/courses/${quiz?.courseId}`);
          }
        }}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors self-start group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        {isTeacher ? 'Back to Quiz Dashboard' : 'Back to Course Details'}
      </button>

      {/* Teacher context banner */}
      {isTeacher && (
        <div className="p-4 bg-muted border border-border rounded-xl flex items-center justify-between text-xs text-foreground animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Reviewing student submission from <span className="font-bold">{attempt.student?.name}</span> ({attempt.student?.email})</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold tracking-wide uppercase text-[10px]">Instructor View</span>
        </div>
      )}

      {/* HEADER SCORE CARD */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted text-primary flex items-center justify-center flex-shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">Quiz Results</h1>
              <p className="text-xs text-muted-foreground mt-1">Activity: {quiz?.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {passed ? (
              <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Passed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider text-red-800 bg-red-50 border border-red-200">
                <XCircle className="h-4 w-4 text-red-500" />
                Failed
              </span>
            )}
          </div>
        </div>

        {/* Score Details */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-border">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Your Score</span>
            <span className={`text-2xl font-extrabold ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
              {score?.toFixed(1)}%
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Passing Score</span>
            <span className="text-2xl font-extrabold text-foreground">{minPassMark}%</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Questions</span>
            <span className="text-2xl font-extrabold text-foreground">{questions.length} Total</span>
          </div>
        </div>

        {/* Teacher Feedback */}
        {teacherFeedback && (
          <div className="p-6 bg-muted/10 border-b border-border flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">Teacher Feedback</span>
              <p className="text-sm text-muted-foreground mt-1 italic leading-relaxed whitespace-pre-wrap">{teacherFeedback}</p>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED ANSWERS REVIEW */}
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-bold text-foreground">Submission Review</h2>

        {!showAnswersReview ? (
          /* Case: Detailed answers stripped/not visible based on Review Policy */
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col gap-3 items-center justify-center text-center py-16">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-1" />
            <h3 className="font-bold text-foreground">Answer Review Restricted</h3>
            
            {quiz?.reviewPolicy === 'NONE' ? (
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed mt-1">
                The instructor has disabled detailed answer reviews for this quiz. Only your final score is available.
              </p>
            ) : (
              <div className="flex flex-col items-center gap-1.5 mt-1">
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                  Answers and question breakdowns will become visible after the scheduled release time.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-xl text-xs font-bold text-muted-foreground mt-2">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Release: {formatPublishTime(quiz?.reviewPublishTime)}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Case: Answers visible */
          <div className="flex flex-col gap-6">
            {questions.map((q, idx) => {
              const studentAns = submittedAnswersJson?.[q.id];
              const correctAns = q.correctAnswer !== undefined ? q.correctAnswer : q.correctOption;
              const isCorrect = studentAns !== undefined && String(studentAns).trim().toLowerCase() === String(correctAns).trim().toLowerCase();

              return (
                <div key={q.id} className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col gap-4">
                  {/* Title Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Question {idx + 1}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isCorrect 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {isCorrect ? `+${q.points} Points` : '0 Points'}
                    </span>
                  </div>

                  {/* Question */}
                  <p className="text-sm font-bold text-foreground leading-relaxed">{q.questionText}</p>

                  {/* Options List */}
                  <div className="flex flex-col gap-2.5 mt-2">
                    {q.options?.map((option, optIdx) => {
                      const isStudentSelected = studentAns === option;
                      const isOptionCorrect = correctAns === option;
                      
                      let optionStyle = 'border-border bg-card text-foreground';
                      let icon = null;

                      if (isOptionCorrect) {
                        optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                        icon = <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />;
                      } else if (isStudentSelected && !isCorrect) {
                        optionStyle = 'border-red-400 bg-red-50 text-red-800 font-bold';
                        icon = <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{option}</span>
                          {icon}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Feedback or correct answer text indicator */}
                  <div className="text-[10px] text-muted-foreground mt-1 font-semibold flex items-center gap-1">
                    <span>Your Selection: </span>
                    <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                      {studentAns || 'No answer submitted'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
