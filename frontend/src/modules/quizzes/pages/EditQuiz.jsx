import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Save, Plus, Trash2, HelpCircle, 
  Clock, Award, Settings, Check, RefreshCw, Loader2
} from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

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
        const res = await axios.get(`/quizzes/${id}`);
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
        questionsJson: questions
      };

      await axios.put(`/quizzes/${id}`, payload);
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
        <Loader2 className="h-9 w-9 animate-spin text-indigo-500" />
        <p className="text-sm font-medium animate-pulse">Loading quiz details…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12 font-sans text-black animate-in fade-in duration-200">
      
      {/* Back button & Title */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate(`/courses/${courseId}`)}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors self-start group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Course Details
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">Edit Quiz</h1>
              <p className="text-xs text-slate-500 mt-0.5">Modify quiz questions, passing marks, and review rules</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl flex items-start gap-2">
          <span className="flex-1">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
        
        {/* SECTION 1: QUIZ SETTINGS CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Settings className="h-5 w-5 text-indigo-500" />
            <h2 className="text-base font-bold text-slate-800">Quiz Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quiz Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Midterm Assessment on Software Architecture"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-colors"
              />
            </div>

            {/* Time Limit toggle */}
            <div className="flex flex-col gap-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">Enforce Time Limit</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Auto-submits when time expires</span>
                </div>
                <input
                  type="checkbox"
                  checked={hasTimeLimit}
                  onChange={(e) => setHasTimeLimit(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                />
              </div>
              {hasTimeLimit && (
                <div className="flex items-center gap-2 mt-1 animate-in slide-in-from-top-2 duration-150">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(e.target.value)}
                    className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-sm text-center focus:ring-2 focus:ring-indigo-300"
                  />
                  <span className="text-xs font-semibold text-slate-600">Minutes</span>
                </div>
              )}
            </div>

            {/* Passing mark */}
            <div className="flex flex-col gap-2 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">Minimum Passing Score</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Passing threshold in percentage</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Award className="h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minPassMark}
                  onChange={(e) => setMinPassMark(e.target.value)}
                  className="w-20 px-2 py-1 rounded-lg border border-slate-300 text-sm text-center focus:ring-2 focus:ring-indigo-300"
                />
                <span className="text-xs font-semibold text-slate-600">%</span>
              </div>
            </div>

            {/* Allowed Attempts Limit */}
            <div className="flex flex-col gap-2 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-700">Allowed Attempts Limit</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Maximum times a student can take this quiz</span>
              </div>
              <input
                type="number"
                min="1"
                required
                value={attemptLimit}
                onChange={(e) => setAttemptLimit(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Open Date & Time */}
            <div className="flex flex-col gap-1.5 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
              <div className="flex flex-col mb-1">
                <span className="text-sm font-bold text-slate-700">Scheduled Open Date & Time</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Optional. Students can start the quiz only after this time</span>
              </div>
              <input
                type="datetime-local"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Close Date & Time */}
            <div className="flex flex-col gap-1.5 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
              <div className="flex flex-col mb-1">
                <span className="text-sm font-bold text-slate-700">Scheduled Closing Date & Time</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Optional. Students can start the quiz only before this time</span>
              </div>
              <input
                type="datetime-local"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Review Policy */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Review Policy</label>
              <select
                value={reviewPolicy}
                onChange={(e) => setReviewPolicy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300"
              >
                <option value="IMMEDIATE">Immediately after submission</option>
                <option value="LATER">After a specific date & time</option>
                <option value="NONE">No review allowed (score only)</option>
              </select>
            </div>

            {/* Review Publish Date */}
            {reviewPolicy === 'LATER' && (
              <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publish Review Answers At</label>
                <input
                  type="datetime-local"
                  required
                  value={reviewPublishTime}
                  onChange={(e) => setReviewPublishTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: QUESTIONS CARD */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Quiz Questions ({questions.length})</h2>
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => addQuestion('multiple_choice')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Multiple Choice
              </button>
              <button
                type="button"
                onClick={() => addQuestion('true_false')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add True/False
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {questions.map((q, qIdx) => (
              <div 
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4 relative animate-in fade-in"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-sm font-bold text-slate-700">Question {qIdx + 1}</span>
                  <div className="flex items-center gap-3">
                    {/* Points */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400 font-semibold uppercase">Points</span>
                      <input
                        type="number"
                        min="1"
                        value={q.points}
                        onChange={(e) => updateQuestionField(qIdx, 'points', Number(e.target.value))}
                        className="w-12 px-1 py-0.5 rounded border border-slate-300 text-xs text-center font-bold"
                      />
                    </div>
                    {/* Delete Question Button */}
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIdx)}
                      disabled={questions.length <= 1}
                      className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Question text */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Question Statement</label>
                  <input
                    type="text"
                    required
                    value={q.questionText}
                    onChange={(e) => updateQuestionField(qIdx, 'questionText', e.target.value)}
                    placeholder="e.g., Which protocol runs on top of TCP?"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300"
                  />
                </div>

                {/* Question Type Choice logic */}
                {q.type === 'multiple_choice' ? (
                  /* MULTIPLE CHOICE BUILDER */
                  <div className="flex flex-col gap-3 mt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Options & Correct Answer</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct_${q.id}`}
                            checked={q.correctAnswer === opt && opt.trim() !== ''}
                            onChange={() => updateQuestionField(qIdx, 'correctAnswer', opt)}
                            disabled={!opt.trim()}
                            className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                            title="Set as correct answer"
                          />
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateQuestionOption(qIdx, optIdx, val);
                              if (q.correctAnswer === opt) {
                                updateQuestionField(qIdx, 'correctAnswer', val);
                              }
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-300"
                          />
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">
                      * Mark the radio button next to the option that represents the correct answer.
                    </span>
                  </div>
                ) : (
                  /* TRUE/FALSE BUILDER */
                  <div className="flex flex-col gap-3 mt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Correct Option</label>
                    <div className="flex items-center gap-4">
                      {['True', 'False'].map((val) => (
                        <label key={val} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name={`correct_${q.id}`}
                            checked={q.correctAnswer === val}
                            onChange={() => updateQuestionField(qIdx, 'correctAnswer', val)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
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
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Updating Quiz…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
