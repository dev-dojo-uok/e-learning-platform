import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Upload, CheckCircle, Clock, AlertCircle, Star, ChevronDown, ChevronUp, X } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';

axios.defaults.withCredentials = true;
const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

async function apiFetch(path, method = 'GET', data = null) {
  const config = { method, url: `${API}${path}` };
  if (data) config.data = data;
  const response = await axios(config);
  return response.data;
}

function StatusBadge({ status }) {
  const map = {
    SUBMITTED: { color: 'bg-blue-500/20 text-blue-400', icon: <Clock size={12} />, label: 'Submitted' },
    GRADED:    { color: 'bg-green-500/20 text-green-400', icon: <CheckCircle size={12} />, label: 'Graded' },
    LATE:      { color: 'bg-red-500/20 text-red-400', icon: <AlertCircle size={12} />, label: 'Late' },
  };
  const s = map[status] || map.SUBMITTED;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
      {s.icon} {s.label}
    </span>
  );
}

function SubmitModal({ assignment, onClose, onSuccess }) {
  const [fileUrl, setFileUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      await apiFetch(`/api/assignments/${assignment.id}/submit`, 'POST', { fileUrl, notes });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">Submit Assignment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <p className="text-slate-400 text-sm mb-4">{assignment.title}</p>
        {error && <p className="text-red-400 text-sm mb-3 bg-red-500/10 p-3 rounded-lg">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1">File URL</label>
            <input type="url" placeholder="https://drive.google.com/..." value={fileUrl}
              onChange={e => setFileUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1">Notes (optional)</label>
            <textarea placeholder="Any notes for your teacher..." value={notes}
              onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-700">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium disabled:opacity-50">
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

function GradeModal({ submission, totalMarks, onClose, onSuccess }) {
  const [grade, setGrade] = useState(submission.grade ?? '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGrade() {
    setLoading(true);
    setError('');
    try {
      await apiFetch(`/api/assignments/submissions/${submission.id}/grade`, 'PUT', { grade: parseFloat(grade), feedback });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg">Grade Submission</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>
        <p className="text-slate-400 text-sm mb-4">Student: <span className="text-white">{submission.student?.name}</span></p>
        {error && <p className="text-red-400 text-sm mb-3 bg-red-500/10 p-3 rounded-lg">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1">Grade <span className="text-slate-500">(out of {totalMarks})</span></label>
            <input type="number" min="0" max={totalMarks} value={grade} onChange={e => setGrade(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1">Feedback (optional)</label>
            <textarea placeholder="Write feedback for the student..." value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-700">Cancel</button>
          <button onClick={handleGrade} disabled={loading || grade === ''}
            className="flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Grade'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentView({ courseId }) {
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitTarget, setSubmitTarget] = useState(null);
  const [expanded, setExpanded] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [a, s] = await Promise.all([
        apiFetch(`/api/assignments/course/${courseId}`),
        apiFetch('/api/assignments/my-submissions')
      ]);
      setAssignments(a);
      setMySubmissions(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [courseId]);

  const submissionMap = Object.fromEntries(mySubmissions.map(s => [s.assignmentId, s]));

  if (loading) return <div className="text-slate-400 text-sm p-6">Loading assignments...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-white font-semibold text-base">My Assignments</h3>
      {assignments.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">No assignments yet for this course.</div>
      )}
      {assignments.map(a => {
        const sub = submissionMap[a.id];
        const isOverdue = new Date() > new Date(a.dueDate) && !sub;
        const isOpen = expanded === a.id;
        return (
          <div key={a.id} className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30"
              onClick={() => setExpanded(isOpen ? null : a.id)}>
              <div className="flex items-center gap-3">
                <ClipboardList size={18} className="text-indigo-400 shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{a.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Due: {new Date(a.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{a.totalMarks} marks
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {sub ? <StatusBadge status={sub.status} />
                  : isOverdue ? <span className="text-red-400 text-xs font-medium">Overdue</span>
                  : <span className="text-slate-400 text-xs">Not submitted</span>}
                {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </div>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-slate-700/50 pt-4 space-y-3">
                {a.description && <p className="text-slate-400 text-sm">{a.description}</p>}
                {sub ? (
                  <div className="bg-slate-900/60 rounded-lg p-3 space-y-2">
                    <p className="text-slate-300 text-xs font-medium">Your Submission</p>
                    {sub.fileUrl && (
                      <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-400 text-xs hover:underline block">
                        View submitted file ↗
                      </a>
                    )}
                    {sub.notes && <p className="text-slate-400 text-xs">Notes: {sub.notes}</p>}
                    {sub.status === 'GRADED' && (
                      <div className="mt-2 pt-2 border-t border-slate-700">
                        <p className="text-green-400 text-sm font-bold flex items-center gap-1">
                          <Star size={14} /> {sub.grade} / {a.totalMarks}
                        </p>
                        {sub.feedback && <p className="text-slate-400 text-xs mt-1">Feedback: {sub.feedback}</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => setSubmitTarget(a)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg font-medium">
                    <Upload size={14} /> Submit Assignment
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      {submitTarget && (
        <SubmitModal assignment={submitTarget} onClose={() => setSubmitTarget(null)} onSuccess={load} />
      )}
    </div>
  );
}

function TeacherView({ courseId }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [gradeTarget, setGradeTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', totalMarks: 100 });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const a = await apiFetch(`/api/assignments/course/${courseId}`);
      setAssignments(a);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function loadSubmissions(assignmentId) {
    try {
      const s = await apiFetch(`/api/assignments/${assignmentId}/submissions`);
      setSubmissions(prev => ({ ...prev, [assignmentId]: s }));
    } catch (e) { console.error(e); }
  }

  async function handleCreate() {
    setCreating(true);
    setError('');
    try {
      await apiFetch('/api/assignments', 'POST', { ...form, courseId });
      setShowCreate(false);
      setForm({ title: '', description: '', dueDate: '', totalMarks: 100 });
      load();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally { setCreating(false); }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this assignment? All submissions will also be deleted.')) return;
    try {
      await apiFetch(`/api/assignments/${id}`, 'DELETE');
      load();
    } catch (e) { alert(e.response?.data?.error || e.message); }
  }

  useEffect(() => { load(); }, [courseId]);

  const toggle = (id) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!submissions[id]) loadSubmissions(id);
  };

  if (loading) return <div className="text-slate-400 text-sm p-6">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-base">Assignments & Grading Dashboard</h3>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg font-medium">
          + New Assignment
        </button>
      </div>

      {showCreate && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <h4 className="text-white text-sm font-medium">Create New Assignment</h4>
          {error && <p className="text-red-400 text-xs bg-red-500/10 p-2 rounded">{error}</p>}
          <input placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none" />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-slate-400 text-xs block mb-1">Due Date *</label>
              <input type="datetime-local" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div className="w-32">
              <label className="text-slate-400 text-xs block mb-1">Total Marks</label>
              <input type="number" value={form.totalMarks} onChange={e => setForm(p => ({ ...p, totalMarks: parseFloat(e.target.value) }))}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-slate-600 text-slate-300 text-sm rounded-lg hover:bg-slate-700">Cancel</button>
            <button onClick={handleCreate} disabled={creating || !form.title || !form.dueDate}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg font-medium disabled:opacity-50">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-sm">No assignments yet. Create one above!</div>
      )}

      {assignments.map(a => {
        const isOpen = expanded === a.id;
        const subs = submissions[a.id] || [];
        const graded = subs.filter(s => s.status === 'GRADED').length;
        return (
          <div key={a.id} className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700/30" onClick={() => toggle(a.id)}>
              <div className="flex items-center gap-3">
                <ClipboardList size={18} className="text-indigo-400 shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{a.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Due: {new Date(a.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{a.totalMarks} marks · {a._count?.submissions ?? 0} submissions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={e => { e.stopPropagation(); handleDelete(a.id); }}
                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-500/30 hover:bg-red-500/10">
                  Delete
                </button>
                {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </div>
            {isOpen && (
              <div className="border-t border-slate-700/50">
                <div className="flex gap-6 px-4 py-3 bg-slate-900/40">
                  <div className="text-center">
                    <p className="text-white text-lg font-bold">{subs.length}</p>
                    <p className="text-slate-500 text-xs">Total</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-400 text-lg font-bold">{graded}</p>
                    <p className="text-slate-500 text-xs">Graded</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-400 text-lg font-bold">{subs.length - graded}</p>
                    <p className="text-slate-500 text-xs">Pending</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {subs.length === 0 && <p className="text-slate-500 text-sm text-center py-6">No submissions yet.</p>}
                  {subs.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-white text-sm font-medium">{s.student?.name}</p>
                        <p className="text-slate-500 text-xs">{s.student?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={s.status} />
                          {s.fileUrl && (
                            <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-400 text-xs hover:underline">View file ↗</a>
                          )}
                        </div>
                        {s.notes && <p className="text-slate-500 text-xs mt-1">"{s.notes}"</p>}
                      </div>
                      <div className="text-right">
                        {s.status === 'GRADED' ? (
                          <div>
                            <p className="text-green-400 text-sm font-bold">{s.grade}/{a.totalMarks}</p>
                            <button onClick={() => setGradeTarget({ submission: s, totalMarks: a.totalMarks })}
                              className="text-slate-400 text-xs hover:text-white mt-1">Edit grade</button>
                          </div>
                        ) : (
                          <button onClick={() => setGradeTarget({ submission: s, totalMarks: a.totalMarks })}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs rounded-lg border border-green-500/30">
                            <Star size={12} /> Grade
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {gradeTarget && (
        <GradeModal
          submission={gradeTarget.submission}
          totalMarks={gradeTarget.totalMarks}
          onClose={() => setGradeTarget(null)}
          onSuccess={() => { loadSubmissions(gradeTarget.submission.assignmentId); setGradeTarget(null); }}
        />
      )}
    </div>
  );
}

export default function AssignmentsModule({ courseId }) {
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  return (
    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 min-h-64">
      {isTeacher ? <TeacherView courseId={courseId} /> : <StudentView courseId={courseId} />}
    </div>
  );
}