import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/lib/axios';
import { ClipboardList, Upload, CheckCircle, Clock, AlertCircle, Star, ChevronDown, ChevronUp, X } from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

async function apiFetch(path, method = 'GET', data = null) {
  const cleanPath = path.startsWith('/api') ? path.substring(4) : path;
  const config = { method, url: cleanPath };
  if (data) config.data = data;
  const response = await api(config);
  return response.data;
}

function StatusBadge({ status }) {
  const map = {
    SUBMITTED: { color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30', icon: <Clock size={12} />, label: 'Submitted' },
    GRADED:    { color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30', icon: <CheckCircle size={12} />, label: 'Graded' },
    LATE:      { color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30', icon: <AlertCircle size={12} />, label: 'Late' },
  };
  const s = map[status] || map.SUBMITTED;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.color}`}>
      {s.icon} {s.label}
    </span>
  );
}

function SubmitModal({ assignment, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (notes) formData.append('notes', notes);

      await api.post(`/assignments/${assignment.id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onSuccess();
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground rounded-2xl border border-border w-full max-w-md p-6 shadow-lg animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-foreground">Submit Assignment</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm mb-4">{assignment.title}</p>
        {error && <p className="text-destructive text-sm mb-3 bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Submission File</Label>
            <Input type="file" onChange={e => setFile(e.target.files[0])} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <textarea placeholder="Any notes for your teacher..." value={notes}
              onChange={e => setNotes(e.target.value)} rows={3}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground rounded-2xl border border-border w-full max-w-md p-6 shadow-lg animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-foreground">Grade Submission</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </Button>
        </div>
        <p className="text-muted-foreground text-sm mb-4">Student: <span className="text-foreground font-semibold">{submission.student?.name}</span></p>
        {error && <p className="text-destructive text-sm mb-3 bg-destructive/10 p-3 rounded-lg border border-destructive/20">{error}</p>}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Grade <span className="text-muted-foreground">(out of {totalMarks})</span></Label>
            <Input type="number" min="0" max={totalMarks} value={grade} onChange={e => setGrade(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Feedback (optional)</Label>
            <textarea placeholder="Write feedback for the student..." value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleGrade} disabled={loading || grade === ''} className="flex-1">
            {loading ? 'Saving...' : 'Save Grade'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StudentView({ courseId }) {
  const [searchParams] = useSearchParams();
  const initialAssignmentId = searchParams.get('assignmentId');
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitTarget, setSubmitTarget] = useState(null);
  const [expanded, setExpanded] = useState(initialAssignmentId || null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [a, s] = await Promise.all([
        apiFetch(`/api/assignments/course/${courseId}`),
        apiFetch('/api/assignments/my-submissions')
      ]);
      setAssignments(a);
      setMySubmissions(s);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [courseId]);

  const submissionMap = Object.fromEntries(mySubmissions.map(s => [s.assignmentId, s]));

  if (loading) return <div className="text-muted-foreground text-sm p-6">Loading assignments...</div>;
  if (error) return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <div>
        <p className="font-semibold">Access Denied</p>
        <p className="text-xs mt-0.5">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-foreground font-semibold text-base">My Assignments</h3>
      {assignments.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-xl">No assignments yet for this course.</div>
      )}
      {assignments.map(a => {
        const sub = submissionMap[a.id];
        const isOverdue = new Date() > new Date(a.dueDate) && !sub;
        const isOpen = expanded === a.id;
        return (
          <div key={a.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-200">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20"
              onClick={() => setExpanded(isOpen ? null : a.id)}>
              <div className="flex items-center gap-3">
                <ClipboardList size={18} className="text-primary shrink-0" />
                <div>
                  <p className="text-foreground text-sm font-medium">{a.title}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Due: {new Date(a.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{a.totalMarks} marks
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {sub ? <StatusBadge status={sub.status} />
                  : isOverdue ? <span className="text-destructive text-xs font-semibold bg-destructive/10 px-2 py-0.5 rounded border border-destructive/20">Overdue</span>
                  : <span className="text-muted-foreground text-xs bg-muted px-2 py-0.5 rounded border border-border">Not submitted</span>}
                {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </div>
            </div>
            {isOpen && (
              <div className="px-4 pb-4 border-t border-border pt-4 space-y-3 bg-muted/10">
                {a.description && <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{a.description}</p>}
                {sub ? (
                  <div className="bg-card border border-border rounded-xl p-4 space-y-2.5">
                    <p className="text-foreground text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Submission</p>
                    {sub.fileUrl && (
                      <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="text-primary text-xs hover:underline inline-flex items-center gap-1 font-semibold">
                        View submitted file ↗
                      </a>
                    )}
                    {sub.notes && <p className="text-foreground text-xs bg-muted p-2 rounded-lg border">Notes: {sub.notes}</p>}
                    {sub.status === 'GRADED' && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <p className="text-green-600 dark:text-green-400 text-sm font-bold flex items-center gap-1">
                          <Star size={14} className="fill-green-600 dark:fill-green-400" /> Grade: {sub.grade} / {a.totalMarks}
                        </p>
                        {sub.feedback && <p className="text-muted-foreground text-xs mt-1">Feedback: {sub.feedback}</p>}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button size="sm" onClick={() => setSubmitTarget(a)} className="inline-flex items-center gap-1.5">
                    <Upload size={14} /> Submit Assignment
                  </Button>
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
  const [searchParams] = useSearchParams();
  const initialAssignmentId = searchParams.get('assignmentId');
  const sectionId = searchParams.get('sectionId');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(initialAssignmentId || null);
  const [gradeTarget, setGradeTarget] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', totalMarks: 100 });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (sectionId) {
      setShowCreate(true);
    }
  }, [sectionId]);

  const shouldCreate = searchParams.get('create') === 'true';
  const paramDueDate = searchParams.get('dueDate');

  useEffect(() => {
    if (shouldCreate) {
      setShowCreate(true);
      if (paramDueDate) {
        const dateObj = new Date(paramDueDate);
        const tzoffset = dateObj.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(dateObj.getTime() - tzoffset)).toISOString().slice(0, 16);
        setForm(p => ({ ...p, dueDate: localISOTime }));
      }
    }
  }, [shouldCreate, paramDueDate]);

  async function load() {
    setLoading(true);
    try {
      const a = await apiFetch(`/api/assignments/course/${courseId}`);
      setAssignments(a);
      if (initialAssignmentId) {
        loadSubmissions(initialAssignmentId);
      }
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
      await apiFetch('/api/assignments', 'POST', { ...form, courseId, sectionId });
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

  if (loading) return <div className="text-muted-foreground text-sm p-6">Loading dashboard...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-foreground font-semibold text-base">Assignments & Grading Dashboard</h3>
        <Button onClick={() => setShowCreate(!showCreate)} size="sm" variant={showCreate ? 'outline' : 'default'}>
          {showCreate ? 'Cancel' : '+ New Assignment'}
        </Button>
      </div>

      {showCreate && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
          <h4 className="text-foreground font-bold text-sm">Create New Assignment</h4>
          {error && <p className="text-destructive text-xs bg-destructive/10 p-2 rounded border border-destructive/20">{error}</p>}
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input placeholder="e.g. Midterm project report" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <textarea placeholder="Write guidelines or instructions..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input resize-none" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <Label>Due Date *</Label>
              <Input type="datetime-local" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div className="w-32 space-y-1.5">
              <Label>Total Marks</Label>
              <Input type="number" value={form.totalMarks} onChange={e => setForm(p => ({ ...p, totalMarks: parseFloat(e.target.value) }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !form.title || !form.dueDate} className="flex-1">
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      )}

      {assignments.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-xl">No assignments yet. Create one above!</div>
      )}

      {assignments.map(a => {
        const isOpen = expanded === a.id;
        const subs = submissions[a.id] || [];
        const graded = subs.filter(s => s.status === 'GRADED').length;
        return (
          <div key={a.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm transition-all duration-200">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20" onClick={() => toggle(a.id)}>
              <div className="flex items-center gap-3">
                <ClipboardList size={18} className="text-primary shrink-0" />
                <div>
                  <p className="text-foreground text-sm font-medium">{a.title}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Due: {new Date(a.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{a.totalMarks} marks · {a._count?.submissions ?? 0} submissions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="destructive" size="sm" onClick={e => { e.stopPropagation(); handleDelete(a.id); }}>
                  Delete
                </Button>
                {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
              </div>
            </div>
            {isOpen && (
              <div className="border-t border-border bg-muted/10">
                <div className="flex gap-6 px-4 py-3 bg-muted/40 border-b border-border">
                  <div className="text-center">
                    <p className="text-foreground text-lg font-bold">{subs.length}</p>
                    <p className="text-muted-foreground text-xs">Total</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-green-600 dark:text-green-400 text-lg font-bold">{graded}</p>
                    <p className="text-muted-foreground text-xs">Graded</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center">
                    <p className="text-amber-600 dark:text-amber-400 text-lg font-bold">{subs.length - graded}</p>
                    <p className="text-muted-foreground text-xs">Pending</p>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {subs.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No submissions yet.</p>}
                  {subs.map(s => (
                    <div key={s.id} className="flex items-center justify-between px-4 py-4 hover:bg-muted/10 transition-colors">
                      <div>
                        <p className="text-foreground text-sm font-medium">{s.student?.name}</p>
                        <p className="text-muted-foreground text-xs">{s.student?.email}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <StatusBadge status={s.status} />
                          {s.fileUrl && (
                            <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-primary text-xs font-semibold hover:underline inline-flex items-center gap-1">
                              View file ↗
                            </a>
                          )}
                        </div>
                        {s.notes && <p className="text-muted-foreground text-xs mt-1.5 italic bg-muted/50 p-1.5 rounded border border-border">"{s.notes}"</p>}
                      </div>
                      <div className="text-right">
                        {s.status === 'GRADED' ? (
                          <div>
                            <p className="text-green-600 dark:text-green-400 text-sm font-bold flex items-center justify-end gap-1">
                              <Star size={14} className="fill-green-600 dark:fill-green-400" /> {s.grade} / {a.totalMarks}
                            </p>
                            <Button variant="ghost" size="xs" onClick={() => setGradeTarget({ submission: s, totalMarks: a.totalMarks })} className="mt-1">
                              Edit grade
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setGradeTarget({ submission: s, totalMarks: a.totalMarks })} className="inline-flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900/30">
                            <Star size={12} /> Grade
                          </Button>
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

export default function AssignmentsModule({ courseId: propCourseId }) {
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';
  const [searchParams] = useSearchParams();
  const courseId = propCourseId || searchParams.get('courseId');

  return (
    <div className="p-6 bg-card text-card-foreground rounded-2xl border border-border shadow-sm min-h-64">
      {isTeacher ? <TeacherView courseId={courseId} /> : <StudentView courseId={courseId} />}
    </div>
  );
}