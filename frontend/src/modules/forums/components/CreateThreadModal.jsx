import React, { useState } from 'react';
import { X, PenLine } from 'lucide-react';
import { createThread } from '../services/forumService';

/**
 * CreateThreadModal – modal dialog for creating a new forum thread.
 *
 * Props:
 *   forumId   – string, the parent forum ID
 *   onClose   – fn()
 *   onCreated – fn(newThread)
 */
export default function CreateThreadModal({ forumId, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError('Thread title is required.'); return; }
    if (!content.trim()) { setError('Thread content is required.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const newThread = await createThread({ title: title.trim(), content: content.trim(), forumId });
      onCreated(newThread);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create thread. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Close on backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <PenLine className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">New Thread</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Thread Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question or topic?"
              maxLength={255}
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder-slate-400 transition-all"
            />
            <span className="text-xs text-slate-400 mt-1 float-right">{title.length}/255</span>
          </div>

          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your question or discussion topic in detail…"
              maxLength={10000}
              rows={5}
              className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 placeholder-slate-400 resize-none transition-all"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Creating…' : 'Create Thread'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
