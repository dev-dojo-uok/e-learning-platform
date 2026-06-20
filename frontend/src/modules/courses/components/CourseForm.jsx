import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * CourseForm – Reusable form for creating and editing a course.
 *
 * Props:
 *  - initialData {Object|null} Existing course data. If null → create mode.
 *  - onSubmit    {Function}    Called with a plain { title, description } object on submit.
 *  - loading     {boolean}     True while the submit is in flight.
 *  - error       {string|null} External error message from the parent / store.
 */
const CourseForm = ({ initialData = null, onSubmit, loading = false, error = null }) => {
  const isEditMode = Boolean(initialData);

  // ── Form state ───────────────────────────────────────────────────────────────
  const [fields, setFields] = useState({
    title: '',
    description: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Populate fields when in edit mode or when initialData changes
  useEffect(() => {
    if (initialData) {
      setFields({
        title: initialData.title || '',
        description: initialData.description || '',
      });
    }
  }, [initialData]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear validation error as user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const validate = () => {
    const errors = {};
    if (!fields.title.trim()) errors.title = 'Title is required';
    if (!fields.description.trim()) errors.description = 'Description is required';
    return errors;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Pass plain object — the page component adds teacherId before calling the store
    onSubmit?.({
      title: fields.title.trim(),
      description: fields.description.trim(),
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6"
    >
      {/* ── External API error banner ── */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── Title ── */}
      <FormField
        id="course-title"
        label="Title"
        required
        error={validationErrors.title}
      >
        <input
          id="course-title"
          name="title"
          type="text"
          value={fields.title}
          onChange={handleChange}
          placeholder="e.g. React Native Development"
          disabled={loading}
          className={inputClass(validationErrors.title)}
        />
      </FormField>

      {/* ── Description ── */}
      <FormField
        id="course-description"
        label="Description"
        required
        error={validationErrors.description}
      >
        <textarea
          id="course-description"
          name="description"
          rows={4}
          value={fields.description}
          onChange={handleChange}
          placeholder="Briefly describe what students will learn…"
          disabled={loading}
          className={`${inputClass(validationErrors.description)} resize-none`}
        />
      </FormField>

      {/* ── Submit button ── */}
      <div className="pt-2">
        <button
          id="course-form-submit"
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : isEditMode ? (
            'Update Course'
          ) : (
            'Create Course'
          )}
        </button>
      </div>
    </form>
  );
};

// ── Private helper components ────────────────────────────────────────────────

/**
 * FormField – Wraps a form control with a label and inline error message.
 */
const FormField = ({ id, label, required, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

/**
 * inputClass – Returns Tailwind classes for input/textarea elements.
 */
const inputClass = (hasError) =>
  [
    'w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400',
    'bg-white outline-none transition-colors duration-150',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus:ring-2 focus:ring-offset-0',
    hasError
      ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
      : 'border-slate-300 focus:ring-indigo-300 focus:border-indigo-400',
  ].join(' ');

export default CourseForm;
