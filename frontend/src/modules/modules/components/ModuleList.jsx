import React, { useEffect } from 'react';
import { Loader2, PlusCircle, InboxIcon } from 'lucide-react';
import ModuleCard from './ModuleCard';
import useModules from '../hooks/useModules';
import useAuthStore from '../../../store/useAuthStore';

/**
 * ModuleList – Renders all modules for a course.
 *
 * Props:
 *  - courseId {string}   The course ID to fetch modules for.
 *  - onAdd    {Function} Callback to open creation form.
 *  - onEdit   {Function} Callback when Edit is clicked on a card.
 *  - onDelete {Function} Callback when Delete is clicked on a card.
 */
const ModuleList = ({ courseId, onAdd, onEdit, onDelete, onView }) => {
  const { modules, loading, error, fetchModules } = useModules();
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (courseId) {
      fetchModules(courseId);
    }
  }, [courseId, fetchModules]);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading && modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 animate-in fade-in duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium tracking-wide">Loading modules…</p>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 w-full rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error && modules.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
        <span className="font-semibold">Error:</span> {error}
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!modules || modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 gap-4 text-center animate-in fade-in duration-300">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50">
          <InboxIcon className="h-8 w-8 text-indigo-300" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-600">No modules found.</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Start structuring this course by adding learning chapters or sections.
          </p>
        </div>
        {isTeacherOrAdmin && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-150 shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Create your first module
          </button>
        )}
      </div>
    );
  }

  // ── Render list ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* List Header containing the title and "Add Module" button */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-800">
          Course Structure ({modules.length} Module{modules.length !== 1 ? 's' : ''})
        </h3>
        {isTeacherOrAdmin && (
          <button
            type="button"
            id="add-module-header-btn"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <PlusCircle className="h-4 w-4" />
            Add Module
          </button>
        )}
      </div>

      {/* Grid: 1 col on mobile, 2 col on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => (
          <ModuleCard
            key={module._id}
            module={module}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>
    </div>
  );
};

export default ModuleList;
