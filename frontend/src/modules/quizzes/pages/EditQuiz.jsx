import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Save, Plus, Trash2, HelpCircle, 
  Clock, Award, Settings, RefreshCw, Loader2
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  // Form states
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [hasTimeLimit, setHasTimeLimit] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [minPassMark, setMinPassMark] = useState(50);
  const [reviewPolicy, setReviewPolicy] = useState('IMMEDIATE');
  const [reviewPublishTime, setReviewPublishTime] = useState('');
  const [attemptLimit, setAttemptLimit] = useState(2);
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Guard: Redirect if not teacher/admin
  useEffect(() => {
    if (!isTeacherOrAdmin) {
      navigate('/');
    }
  }, [isTeacherOrAdmin, navigate]);

  // Fetch Quiz details
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${backendBase}/quizzes/${id}`);
        const data = res.data;
        setTitle(data.title);
        setCourseId(data.courseId);
        setHasTimeLimit(data.hasTimeLimit);
        setTimeLimitMinutes(data.timeLimitMinutes);
        setMinPassMark(data.minPassMark);
        setReviewPolicy(data.reviewPolicy || 'IMMEDIATE');
        if (data.reviewPublishTime) {
          // Format ISO to datetime-local local string format (YYYY-MM-DDTHH:MM)
          const date = new Date(data.reviewPublishTime);
          const offset = date.getTimezoneOffset() * 60000;
          const localISO = new Date(date.getTime() - offset).toISOString().substring(0, 16);
          setReviewPublishTime(localISO);
        }
        setAttemptLimit(data.attemptLimit || 2);
        if (data.openTime) {
          const date = new Date(data.openTime);
          const offset = date.getTimezoneOffset() * 60000;
          const localISO = new Date(date.getTime() - offset).toISOString().substring(0, 16);
          setOpenTime(localISO);
        }
        if (data.closeTime) {
          const date = new Date(data.closeTime);
          const offset = date.getTimezoneOffset() * 60000;
          const localISO = new Date(date.getTime() - offset).toISOString().substring(0, 16);
          setCloseTime(localISO);
        }
        setQuestions(data.questionsJson || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz details.');
      } finally {
        setLoading(false);
      }
    };

    if (id && isTeacherOrAdmin) {
      fetchQuiz();
    }
  }, [id, isTeacherOrAdmin]);

  // Add a new question template
  const addQuestion = (type = 'multiple_choice') => {
    setQuestions([
      ...questions,
      {
        id: 'q_' + Math.random().toString(36).substring(2, 9),
        type,
        questionText: '',
        options: type === 'multiple_choice' ? ['', '', '', ''] : ['True', 'False'],
        correctAnswer: type === 'multiple_choice' ? '' : 'True',
        points: 5
      }
    ]);
  };

  // Remove a question
  const removeQuestion = (index) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  // Update question title or points
  const updateQuestionField = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // Update question option
  const updateQuestionOption = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Quiz Title is required.');
      return;
    }

    // Questions validations
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} text is empty.`);
        return;
      }
      if (q.type === 'multiple_choice') {
        if (q.options.some(opt => !opt.trim())) {
          setError(`Question ${i + 1} has empty options.`);
          return;
        }
        if (!q.correctAnswer.trim()) {
          setError(`Please select the correct answer for Question ${i + 1}.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        hasTimeLimit,
        timeLimitMinutes: hasTimeLimit ? Number(timeLimitMinutes) : 0,
        minPassMark: Number(minPassMark),
        reviewPolicy,
        reviewPublishTime: reviewPolicy === 'LATER' && reviewPublishTime ? new Date(reviewPublishTime).toISOString() : null,
        attemptLimit: Number(attemptLimit),
        openTime: openTime ? new Date(openTime).toISOString() : null,
        closeTime: closeTime ? new Date(closeTime).toISOString() : null,
        questionsJson: questions.map(q => ({
          ...q,
          points: 1
        }))
      };

      const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.put(`${backendBase}/quizzes/${id}`, payload);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update quiz.');
    } finally {
      setSaving(false);
    }
  };

  if (!isTeacherOrAdmin) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500 font-sans">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">Loading quiz details…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 font-sans text-foreground animate-in fade-in duration-200">
      
      {/* Back button & Title */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate(`/courses/${courseId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors self-start group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Course Details
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted text-primary flex items-center justify-center">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-tight">Edit Quiz Activity</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Modify properties or quiz questions layout</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold rounded-xl flex items-start gap-2">
          <span className="flex-1">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
        
        {/* SECTION 1: QUIZ SETTINGS CARD */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Quiz Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Quiz Title</Label>
              <Input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Midterm Assessment on Software Architecture"
                className="w-full"
              />
            </div>

            {/* Time Limit toggle */}
            <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">Enforce Time Limit</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">Auto-submits when time expires</span>
                </div>
                <input
                  type="checkbox"
                  checked={hasTimeLimit}
                  onChange={(e) => setHasTimeLimit(e.target.checked)}
                  className="w-4 h-4 text-primary rounded focus:ring-ring border-border"
                />
              </div>
              {hasTimeLimit && (
                <div className="flex items-center gap-2 mt-1 animate-in slide-in-from-top-2 duration-150">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                    className="w-20 text-center"
                  />
                  <span className="text-xs font-semibold text-muted-foreground">Minutes</span>
                </div>
              )}
            </div>

            {/* Passing mark */}
            <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Minimum Passing Score</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Passing threshold in percentage</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={minPassMark}
                  onChange={(e) => setMinPassMark(e.target.value)}
                  className="w-20 text-center"
                />
                <span className="text-xs font-semibold text-muted-foreground">%</span>
              </div>
            </div>

            {/* Allowed Attempts Limit */}
            <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Allowed Attempts Limit</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Maximum times a student can take this quiz</span>
              </div>
              <Input
                type="number"
                min="1"
                required
                value={attemptLimit}
                onChange={(e) => setAttemptLimit(e.target.value)}
                className="w-full mt-2"
              />
            </div>

            {/* Open Date & Time */}
            <div className="flex flex-col gap-1.5 p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex flex-col mb-1">
                <span className="text-sm font-bold text-foreground">Scheduled Open Date & Time</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Optional. Students can start the quiz only after this time</span>
              </div>
              <Input
                type="datetime-local"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Close Date & Time */}
            <div className="flex flex-col gap-1.5 p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex flex-col mb-1">
                <span className="text-sm font-bold text-foreground">Scheduled Closing Date & Time</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Optional. Students can start the quiz only before this time</span>
              </div>
              <Input
                type="datetime-local"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Review Policy */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Student Review Policy</Label>
              <select
                value={reviewPolicy}
                onChange={(e) => setReviewPolicy(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="IMMEDIATE">Immediately after submission</option>
                <option value="LATER">After a specific date & time</option>
                <option value="NONE">No review allowed (score only)</option>
              </select>
            </div>

            {/* Review Publish Date */}
            {reviewPolicy === 'LATER' && (
              <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Publish Review Answers At</Label>
                <Input
                  type="datetime-local"
                  required
                  value={reviewPublishTime}
                  onChange={(e) => setReviewPublishTime(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: QUESTIONS CARD */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Quiz Questions ({questions.length})</h2>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('multiple_choice')}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Multiple Choice
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addQuestion('true_false')}
                className="gap-1.5 text-amber-600 hover:text-amber-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add True/False
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {questions.map((q, qIdx) => (
              <div 
                key={q.id}
                className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col gap-4 relative animate-in fade-in"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-sm font-bold text-foreground">Question {qIdx + 1}</span>
                  <div className="flex items-center gap-3">
                    {/* Delete Question Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeQuestion(qIdx)}
                      disabled={questions.length <= 1}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Question text */}
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Question Statement</Label>
                  <Input
                    type="text"
                    required
                    value={q.questionText}
                    onChange={(e) => updateQuestionField(qIdx, 'questionText', e.target.value)}
                    placeholder="e.g., Which protocol runs on top of TCP?"
                    className="w-full"
                  />
                </div>

                {/* Question Type Choice logic */}
                {q.type === 'multiple_choice' ? (
                  /* MULTIPLE CHOICE BUILDER */
                  <div className="flex flex-col gap-3 mt-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Options & Correct Answer</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          {/* Radio selection to set correct answer */}
                          <input
                            type="radio"
                            name={`correct_${q.id}`}
                            checked={q.correctAnswer === opt && opt.trim() !== ''}
                            onChange={() => updateQuestionField(qIdx, 'correctAnswer', opt)}
                            disabled={!opt.trim()}
                            className="w-4 h-4 text-primary border-border focus:ring-ring cursor-pointer"
                            title="Set as correct answer"
                          />
                          <Input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateQuestionOption(qIdx, optIdx, val);
                              // If this option was selected as correct, sync its text change
                              if (q.correctAnswer === opt) {
                                updateQuestionField(qIdx, 'correctAnswer', val);
                              }
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">
                      * Mark the radio button next to the option that represents the correct answer.
                    </span>
                  </div>
                ) : (
                  /* TRUE/FALSE BUILDER */
                  <div className="flex flex-col gap-3 mt-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Correct Option</Label>
                    <div className="flex items-center gap-4">
                      {['True', 'False'].map((val) => (
                        <label key={val} className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                          <input
                            type="radio"
                            name={`correct_${q.id}`}
                            checked={q.correctAnswer === val}
                            onChange={() => updateQuestionField(qIdx, 'correctAnswer', val)}
                            className="w-4 h-4 text-primary focus:ring-ring"
                          />
                          {val}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-6 py-2.5"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-white"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving Changes…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
