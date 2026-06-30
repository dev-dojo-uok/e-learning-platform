import React from 'react';
import ForumCard from './ForumCard';
import { MessageSquare } from 'lucide-react';

/**
 * ForumList – renders a grouped or flat list of forums.
 *
 * Props:
 *   forums  – array of forum objects
 *   loading – boolean
 *   error   – string | null
 */
export default function ForumList({ forums = [], loading, error }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-2xl border border-slate-100 bg-slate-50 animate-pulse"
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

  if (!forums.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-indigo-300" />
        </div>
        <h3 className="text-sm font-semibold text-slate-600 mb-1">No forums yet</h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Forums will appear here once they are created for this course.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {forums.map((forum) => (
        <ForumCard key={forum.id} forum={forum} />
      ))}
    </div>
  );
}
