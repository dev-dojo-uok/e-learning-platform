import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, BookOpen, Layers } from 'lucide-react';

/**
 * ForumsIndex – landing page shown at /forums.
 * Prompts users to select a course to browse its forums.
 */
export default function ForumsIndex() {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center space-y-8">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-100">
          <MessageSquare className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Course Discussion Forums</h1>
        <p className="text-slate-500 mt-3 text-sm max-w-md mx-auto leading-relaxed">
          Ask questions, share insights, and collaborate with peers through structured
          course and module forums.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 flex gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Course Forums</h3>
            <p className="text-xs text-slate-500 mt-0.5">General discussion boards for each course.</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-violet-100 bg-violet-50/50 flex gap-3">
          <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Module Forums</h3>
            <p className="text-xs text-slate-500 mt-0.5">Topic-specific forums per course module.</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/courses"
        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
      >
        Browse Courses
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
