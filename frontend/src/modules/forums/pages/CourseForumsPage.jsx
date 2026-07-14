import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, BookOpen, Layers, MessageSquare, X, ShieldAlert, Flag, CheckCircle, Trash2 } from 'lucide-react';
import { getForumsByCourse, createForum, getReports, resolveReport, deletePost } from '../services/forumService';
import { getModulesByCourse } from '../../courseModule/services/moduleService';
import useAuthStore from '../../../store/useAuthStore';
import { toast } from 'sonner';
import ForumList from '../components/ForumList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Modal from '@/components/Modal';

/**
 * CourseForumsPage – /courses/:courseId/forums
 *
 * Shows all forums (course-level + module-level) for a given course,
 * grouped by module when applicable. Also allows teachers to create forums.
 */
export default function CourseForumsPage() {
  const { courseId } = useParams();
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const [forums, setForums] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Forum creation states
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Moderation reports states
  const [showReports, setShowReports] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchForums = () => {
    setLoading(true);
    setError(null);
    getForumsByCourse(courseId)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.forums ?? [];
        setForums(list);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load forums.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!courseId) return;
    fetchForums();

    // Fetch modules for dropdown list
    getModulesByCourse(courseId)
      .then((data) => {
        setModules(data || []);
      })
      .catch((err) => {
        console.error('Failed to load course modules:', err);
      });
  }, [courseId]);

  const handleCreateForum = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createForum({
        name: title.trim(),
        description: description.trim(),
        courseId,
        moduleId: selectedModuleId || undefined,
      });
      setTitle('');
      setDescription('');
      setSelectedModuleId('');
      setShowCreate(false);
      fetchForums();
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create forum.');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenReports = async () => {
    setShowReports(true);
    setLoadingReports(true);
    try {
      const data = await getReports();
      setReports(data || []);
    } catch (err) {
      toast.error('Failed to load moderation reports.');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await resolveReport(reportId);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'RESOLVED' } : r))
      );
      toast.success('Report resolved successfully.');
    } catch (err) {
      toast.error('Failed to resolve report.');
    }
  };

  const handleDeleteReportedPost = async (reportId, postId) => {
    if (!window.confirm('Are you sure you want to delete this reported post? This cannot be undone.')) return;
    try {
      await deletePost(postId);
      await resolveReport(reportId);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'RESOLVED', post: null } : r))
      );
      toast.success('Post deleted and report resolved.');
    } catch (err) {
      toast.error('Failed to delete post.');
    }
  };

  // Group forums: general (no moduleId) vs module-specific
  const generalForums = forums.filter((f) => !f.moduleId);
  const moduleForums = forums.filter((f) => f.moduleId);
 
  // Group module forums by module
  const moduleGroups = moduleForums.reduce((acc, forum) => {
    const key = forum.moduleId;
    if (!acc[key]) {
      acc[key] = {
        module: forum.module ?? { id: key, title: `Module ${key}` },
        forums: [],
      };
    }
    acc[key].forums.push(forum);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/courses" className="hover:text-primary transition-colors font-medium">
          Courses
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
        <span className="text-slate-700 font-semibold">Discussion Forums</span>
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Discussion Forums</h1>
            <p className="text-sm text-slate-500 mt-1">
              Engage with your peers, ask questions, and share ideas.
            </p>
          </div>
        </div>
        {isTeacherOrAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={handleOpenReports}
              className="flex items-center gap-1.5 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-800 text-amber-700"
            >
              <ShieldAlert className="w-4 h-4" />
              Flagged Content
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              + New Forum
            </Button>
          </div>
        )}
      </div>

      {/* Stats bar */}
      {!loading && !error && (
        <div className="flex items-center gap-6 p-4 bg-muted border border-border rounded-xl">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{forums.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total Forums</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{Object.keys(moduleGroups).length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Module Forums</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700 dark:text-slate-400">{generalForums.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">General Forums</p>
          </div>
        </div>
      )}

      {/* General forums */}
      {(loading || generalForums.length > 0) && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              General Forums
            </h2>
          </div>
          <ForumList forums={generalForums} loading={loading} error={error} />
        </section>
      )}

      {/* Module forums – grouped */}
      {!loading && Object.values(moduleGroups).length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Module Forums
            </h2>
          </div>

          <div className="space-y-6">
            {Object.values(moduleGroups).map(({ module, forums: mForums }) => (
              <div key={module.id}>
                <div className="flex items-center gap-2 mb-2 pl-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                    {module.title}
                  </h3>
                </div>
                <ForumList forums={mForums} loading={false} error={null} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state when nothing loaded */}
      {!loading && !error && forums.length === 0 && (
        <ForumList forums={[]} loading={false} error={null} />
      )}

      {/* Forum Creation Modal */}
      {showCreate && (
        <Modal isOpen={true} onClose={() => setShowCreate(false)} title="Create Discussion Forum" size="md">
          {createError && (
            <p className="text-destructive text-xs bg-destructive/10 p-2.5 rounded border border-destructive/20 mb-4">
              {createError}
            </p>
          )}
          <form onSubmit={handleCreateForum} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="forum-title">Title *</Label>
              <Input
                id="forum-title"
                placeholder="e.g. Module 1 Discussion"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="forum-desc">Description</Label>
              <textarea
                id="forum-desc"
                placeholder="What is this forum for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="forum-module">Module association (optional)</Label>
              <select
                id="forum-module"
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input"
              >
                <option value="">General (Course-Level)</option>
                {modules.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title} (Module {m.order})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2 border-t border-border mt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={creating || !title.trim()} className="flex-1 text-white">
                {creating ? 'Creating...' : 'Create Forum'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Moderation Reports Modal */}
      {showReports && (
        <Modal isOpen={true} onClose={() => setShowReports(false)} title="Forum Flagged Content" size="lg">
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Below are the reports submitted by students and teachers flagging posts or threads for review.
            </p>

            {loadingReports ? (
              <div className="space-y-2 py-4">
                <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
                <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                <CheckCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">No flagged reports</p>
                <p className="text-xs text-slate-400">All forum content is clean!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-xl border border-border bg-white space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="space-y-0.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          report.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {report.status}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Reported by <span className="font-semibold text-slate-700">{report.user?.name}</span> ({report.user?.email})
                        </p>
                      </div>

                      {report.status === 'PENDING' && (
                        <div className="flex items-center gap-1.5">
                          {report.postId && report.post && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteReportedPost(report.id, report.postId)}
                              className="text-xs h-7 gap-1 px-2.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Post
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleResolveReport(report.id)}
                            className="text-xs h-7 gap-1 px-2.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Resolve
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-100 space-y-1">
                      <p className="font-bold text-slate-700 uppercase tracking-wide text-[9px]">Reason</p>
                      <p className="text-slate-600 font-medium italic">"{report.reason}"</p>
                    </div>

                    {report.postId && (
                      <div className="border-l-2 border-red-200 pl-3 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reported Post Content</p>
                        {report.post ? (
                          <>
                            <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                              {report.post.content}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              By {report.post.creator?.name} in thread:{" "}
                              <Link to={`/threads/${report.post.thread?.id}`} className="text-primary hover:underline font-semibold">
                                {report.post.thread?.title}
                              </Link>
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400 italic">This post has been deleted.</p>
                        )}
                      </div>
                    )}

                    {report.threadId && (
                      <div className="border-l-2 border-red-200 pl-3 space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reported Thread</p>
                        {report.thread ? (
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            Title:{" "}
                            <Link to={`/threads/${report.thread.id}`} className="text-primary hover:underline font-bold">
                              {report.thread.title}
                            </Link>
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 italic">This thread has been deleted.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-border mt-4 flex justify-end">
              <Button onClick={() => setShowReports(false)} className="px-5 text-white">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
