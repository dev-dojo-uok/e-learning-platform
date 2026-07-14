import React, { useEffect } from 'react';
import { Loader2, PlusCircle, InboxIcon } from 'lucide-react';
import ModuleCard from './ModuleCard';
import useModules from '../hooks/useModules';
import useAuthStore from '../../../store/useAuthStore';
import { Button } from '@/components/ui/button';

/**
 * ModuleList – Renders all modules for a course.
 *
 * Props:
 *  - courseId {string}   The course ID to fetch modules for.
 *  - onAdd    {Function} Callback to open creation form.
 *  - onEdit   {Function} Callback when Edit is clicked on a card.
 *  - onDelete {Function} Callback when Delete is clicked on a card.
 */
const ModuleList = ({ courseId, isEnrolled, onAdd, onEdit, onDelete }) => {
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10">
          <InboxIcon className="h-8 w-8 text-primary/60" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-600">No modules found.</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Start structuring this course by adding learning chapters or sections.
          </p>
        </div>
        {isTeacherOrAdmin && (
          <Button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create your first module
          </Button>
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
          <Button
            id="add-module-header-btn"
            onClick={onAdd}
          >
            <PlusCircle className="h-4 w-4" />
            Add Module
          </Button>
        )}
      </div>

      {/* Stacked list */}
      <div className="flex flex-col gap-6">
        {modules.map((module) => (
          <ModuleCard
            key={module._id}
            module={module}
            courseId={courseId}
            isEnrolled={isEnrolled}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default ModuleList;
