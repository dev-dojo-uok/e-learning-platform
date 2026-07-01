import React from 'react';
import ThreadCard from './ThreadCard';
import { MessageSquare } from 'lucide-react';

/**
 * ThreadList – renders a list of threads inside a forum.
 *
 * Props:
 *   threads – array of thread objects
 *   loading – boolean
 *   error   – string | null
 */
export default function ThreadList({ threads = [], loading, error }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-slate-100 bg-slate-50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-sm font-medium text-red-600">{error}</p>
      </div>
    );
  }

  if (!threads.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-indigo-300" />
        </div>
        <h3 className="text-sm font-semibold text-slate-600 mb-1">No threads yet</h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Be the first to start a discussion in this forum!
        </p>
      </div>
    );
  }

  // Sort: pinned threads float to top
  const sorted = [...threads].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="space-y-2">
      {sorted.map((thread) => (
        <ThreadCard key={thread.id} thread={thread} />
      ))}
    </div>
  );
}
