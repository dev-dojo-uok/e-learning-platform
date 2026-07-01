import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, BookOpen, Layers, MessageSquare } from 'lucide-react';
import { getForumsByCourse } from '../services/forumService';
import ForumList from '../components/ForumList';

/**
 * CourseForumsPage – /courses/:courseId/forums
 *
 * Shows all forums (course-level + module-level) for a given course,
 * grouped by module when applicable.
 */
export default function CourseForumsPage() {
  const { courseId } = useParams();

  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError(null);

    getForumsByCourse(courseId)
      .then((data) => {
        // API may return { forums: [...] } or a raw array
        const list = Array.isArray(data) ? data : data?.forums ?? [];
        setForums(list);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load forums.');
      })
      .finally(() => setLoading(false));
  }, [courseId]);

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
        <Link to="/courses" className="hover:text-indigo-600 transition-colors font-medium">
          Courses
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
        <span className="text-slate-700 font-semibold">Discussion Forums</span>
      </div>

      {/* Page header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-100">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Discussion Forums</h1>
          <p className="text-sm text-slate-500 mt-1">
            Engage with your peers, ask questions, and share ideas.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      {!loading && !error && (
        <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100">
          <div className="text-center">
            <p className="text-lg font-bold text-indigo-700">{forums.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total Forums</p>
          </div>
          <div className="w-px h-8 bg-indigo-100" />
          <div className="text-center">
            <p className="text-lg font-bold text-violet-700">{Object.keys(moduleGroups).length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Module Forums</p>
          </div>
          <div className="w-px h-8 bg-indigo-100" />
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700">{generalForums.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">General Forums</p>
          </div>
        </div>
      )}

      {/* General forums */}
      {(loading || generalForums.length > 0) && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-indigo-500" />
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
            <Layers className="w-4 h-4 text-violet-500" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Module Forums
            </h2>
          </div>

          <div className="space-y-6">
            {Object.values(moduleGroups).map(({ module, forums: mForums }) => (
              <div key={module.id}>
                <div className="flex items-center gap-2 mb-2 pl-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <h3 className="text-xs font-bold text-violet-700 uppercase tracking-wide">
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
    </div>
  );
}
