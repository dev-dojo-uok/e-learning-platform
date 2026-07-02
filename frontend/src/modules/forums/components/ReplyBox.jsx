import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      className={`rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all focus-within:ring-2 focus-within:ring-ring ${compact ? 'p-3' : 'p-4'}`}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || submitting}
        className={`w-full text-sm text-foreground placeholder-muted-foreground bg-transparent resize-none focus:outline-none ${compact ? 'min-h-[60px]' : 'min-h-[90px]'}`}
      />

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <span className="text-[10px] text-muted-foreground">
          {content.length} / 2000 characters
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || submitting || disabled}
            className="text-white gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Posting…' : 'Post Reply'}
          </Button>
        </div>
      </div>
    </form>
  );
}
