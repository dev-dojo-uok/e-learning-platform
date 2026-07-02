import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, MessageSquare, Plus, Search, Pin } from 'lucide-react';
import { getThreadsByForum, getForumById } from '../services/forumService';
import ThreadList from '../components/ThreadList';
import CreateThreadModal from '../components/CreateThreadModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * ForumThreadsPage – /forums/:forumId/threads
 *
 * Displays all threads inside a forum with search filter,
 * pinned-first sorting, and a "Create Thread" CTA.
 */
export default function ForumThreadsPage() {
  const { forumId } = useParams();

  const [forum, setForum] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load forum metadata + threads
  useEffect(() => {
    if (!forumId) return;
    setLoading(true);
    setError(null);

    Promise.all([
      getForumById(forumId).catch(() => null),
      getThreadsByForum(forumId),
    ])
      .then(([forumData, threadData]) => {
        setForum(forumData?.forum ?? forumData);
        const list = Array.isArray(threadData)
          ? threadData
          : threadData?.threads ?? [];
        setThreads(list);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load threads.');
      })
      .finally(() => setLoading(false));
  }, [forumId]);

  function handleThreadCreated(newThread) {
    setThreads((prev) => [newThread, ...prev]);
    setShowModal(false);
  }

  // Client-side search filter
  const filteredThreads = searchQuery.trim()
    ? threads.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : threads;

  const pinnedCount = threads.filter((t) => t.isPinned).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/courses" className="hover:text-primary transition-colors font-medium">
          Courses
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
        {forum?.courseId && (
          <>
            <Link
              to={`/courses/${forum.courseId}/forums`}
              className="hover:text-primary transition-colors font-medium"
            >
              Forums
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
          </>
        )}
        <span className="text-slate-700 font-semibold truncate max-w-[160px]">
          {forum?.name || forum?.title || 'Forum'}
        </span>
      </div>

      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {forum?.name || forum?.title || (loading ? '…' : 'Forum')}
            </h1>
            {forum?.description && (
              <p className="text-sm text-slate-500 mt-1 max-w-md">{forum.description}</p>
            )}
          </div>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 text-white"
        >
          <Plus className="w-4 h-4" />
          New Thread
        </Button>
      </div>

      {/* Stats + Search bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Stats chips */}
        {!loading && !error && (
          <>
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1 text-xs font-medium text-slate-600">
              <MessageSquare className="w-3 h-3 text-primary" />
              {threads.length} {threads.length === 1 ? 'thread' : 'threads'}
            </div>
            {pinnedCount > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-50 rounded-full px-3 py-1 text-xs font-medium text-amber-700">
                <Pin className="w-3 h-3" />
                {pinnedCount} pinned
              </div>
            )}
          </>
        )}

        {/* Search */}
        <div className="flex-1 min-w-[180px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search threads…"
            className="pl-9 pr-4 py-2"
          />
        </div>
      </div>

      {/* Thread list */}
      <ThreadList
        threads={filteredThreads}
        loading={loading}
        error={error}
      />

      {/* No search results */}
      {!loading && !error && searchQuery && filteredThreads.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm text-slate-500">
            No threads matching "<span className="font-medium text-slate-700">{searchQuery}</span>"
          </p>
        </div>
      )}

      {/* Create Thread Modal */}
      {showModal && (
        <CreateThreadModal
          forumId={forumId}
          onClose={() => setShowModal(false)}
          onCreated={handleThreadCreated}
        />
      )}
    </div>
  );
}
