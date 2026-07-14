import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ModuleForm – Reusable form for creating and editing a course module.
 *
 * Props:
 *  - initialData {Object|null} Existing module data. If null → create mode.
 *  - onSubmit    {Function}    Called with { title, description, order } on submit.
 *  - onCancel    {Function}    Called when user cancels form.
 *  - loading     {boolean}     True while the submit is in flight.
 *  - error       {string|null} External error message from the parent / store.
 */
const ModuleForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}) => {
  const isEditMode = Boolean(initialData);

  // ----------------------Form state -----------------------------------
  const [fields, setFields] = useState({
    title: '',
    description: '',
    order: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Populate fields when in edit mode or when initialData changes
  useEffect(() => {
    if (initialData) {
      setFields({
        title: initialData.title || '',
        description: initialData.description || '',
        order: initialData.order !== undefined ? String(initialData.order) : '',
      });
    } else {
      setFields({
        title: '',
        description: '',
        order: '',
      });
    }
  }, [initialData]);

  // -------------------------- Handlers -----------------------------------------

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

  // ---------------Validation ------------------------

  const validate = () => {
    const errors = {};
    if (!fields.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!fields.order.trim()) {
      errors.order = 'Order number is required';
    } else {
      const parsedOrder = Number(fields.order);
      if (isNaN(parsedOrder) || !Number.isInteger(parsedOrder)) {
        errors.order = 'Order must be an integer';
      } else if (parsedOrder <= 0) {
        errors.order = 'Order must be a positive number';
      }
    }
    return errors;
  };

  // ------------------------------- Submit ------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    onSubmit?.({
      title: fields.title.trim(),
      description: fields.description.trim(),
      order: parseInt(fields.order, 10),
    });
  };

  // ----------------------Render -------------------------------
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5"
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

      {/* Title */}
      <FormField
        id="module-title"
        label="Module Title"
        required
        error={validationErrors.title}
      >
        <input
          id="module-title"
          name="title"
          type="text"
          value={fields.title}
          onChange={handleChange}
          placeholder="e.g. Introduction to React Components"
          disabled={loading}
          className={inputClass(validationErrors.title)}
        />
      </FormField>

      {/*  Description  */}
      <FormField
        id="module-description"
        label="Description"
        error={validationErrors.description}
      >
        <textarea
          id="module-description"
          name="description"
          rows={3}
          value={fields.description}
          onChange={handleChange}
          placeholder="Describe what students will cover in this module…"
          disabled={loading}
          className={`${inputClass(validationErrors.description)} resize-none`}
        />
      </FormField>

      {/*  Order Number */}
      <FormField
        id="module-order"
        label="Order Number"
        required
        error={validationErrors.order}
      >
        <input
          id="module-order"
          name="order"
          type="number"
          min="1"
          step="1"
          value={fields.order}
          onChange={handleChange}
          placeholder="e.g. 1"
          disabled={loading}
          className={inputClass(validationErrors.order)}
        />
      </FormField>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          id="module-form-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : isEditMode ? (
            'Update Module'
          ) : (
            'Create Module'
          )}
        </Button>
      </div>
    </form>
  );
};

// ----------------Private helper components-------------------------

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

const inputClass = (hasError) =>
  [
    'w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-800 placeholder-slate-400',
    'bg-white outline-none transition-colors duration-150',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus:ring-2 focus:ring-offset-0',
    hasError
      ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
      : 'border-input focus:ring-primary/20 focus:border-primary',
  ].join(' ');

export default ModuleForm;
