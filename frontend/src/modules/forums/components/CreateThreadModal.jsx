import React, { useState } from 'react';
import { createThread } from '../services/forumService';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

  return (
    <Modal isOpen={true} onClose={onClose} title="New Thread" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
            Thread Title *
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question or topic?"
            maxLength={255}
            className="w-full"
          />
          <span className="text-[10px] text-slate-400 mt-1 float-right">{title.length}/255</span>
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
            className="w-full text-sm bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
          />
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="text-white font-medium"
          >
            {submitting ? 'Creating…' : 'Create Thread'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
