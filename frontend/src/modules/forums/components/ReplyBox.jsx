import React, { useState } from 'react';
import { Send } from 'lucide-react';

/**
 * ReplyBox – textarea + submit button for creating posts/replies.
 *
 * Props:
 *   onSubmit    – async fn(content: string)
 *   onCancel    – fn() optional
 *   placeholder – string
 *   compact     – boolean, smaller padding when nested
 *   disabled    – boolean
 */
export default function ReplyBox({
  onSubmit,
  onCancel,
  placeholder = 'Write your reply…',
  compact = false,
  disabled = false,
}) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-shadow focus-within:shadow-md focus-within:border-indigo-300 ${compact ? 'p-3' : 'p-4'}`}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || submitting}
        className={`w-full text-sm text-slate-700 placeholder-slate-400 bg-transparent resize-none focus:outline-none ${compact ? 'min-h-[60px]' : 'min-h-[90px]'}`}
      />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400">
          {content.length} / 2000 characters
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() || submitting || disabled}
            className="flex items-center gap-1.5 text-xs px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Posting…' : 'Post Reply'}
          </button>
        </div>
      </div>
    </form>
  );
}
