import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

/**
 * ModuleCard – Displays a single module.
 *
 * Props:
 *  - module   {Object}   The module object (contains _id, title, description, order).
 *  - onEdit   {Function} Callback when edit button is clicked.
 *  - onDelete {Function} Callback when delete button is clicked.
 */
const ModuleCard = ({ module, onEdit, onDelete, onView }) => {
  const { user } = useAuthStore();
  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  return (
    <div 
      onClick={() => onView?.(module)}
      className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4 cursor-pointer"
    >
      <div className="flex flex-col gap-1.5">
        {/* Header containing order badge and actions */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            Order: {module.order}
          </span>
          {isTeacherOrAdmin && (
            <div className="flex items-center gap-1 animate-in fade-in duration-200">
              <button
                type="button"
                id={`module-edit-btn-${module._id}`}
                aria-label={`Edit module ${module.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(module);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                title="Edit Module"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                id={`module-delete-btn-${module._id}`}
                aria-label={`Delete module ${module.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(module._id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                title="Delete Module"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2">
          {module.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 whitespace-pre-wrap">
          {module.description || (
            <span className="text-slate-400 italic">No description provided.</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ModuleCard;
