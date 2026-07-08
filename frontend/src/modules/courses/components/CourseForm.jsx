import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [selectedThumbnail, setSelectedThumbnail] = useState('auto');
  const [customThumbnail, setCustomThumbnail] = useState(null);

  const [validationErrors, setValidationErrors] = useState({});

  // Populate fields when in edit mode or when initialData changes
  useEffect(() => {
    if (initialData) {
      let desc = initialData.description || '';
      let thumb = 'auto';
      let custom = null;
      const match = desc.match(/<!--thumbnail: (.*?)-->/);
      if (match) {
        const val = match[1];
        if (val.startsWith('data:image')) {
          thumb = 'custom';
          custom = val;
        } else {
          thumb = val;
        }
        desc = desc.replace(/<!--thumbnail: (.*?)-->/, '').trim();
      }
      setFields({
        title: initialData.title || '',
        description: desc,
      });
      setSelectedThumbnail(thumb);
      setCustomThumbnail(custom);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize with canvas to keep the Base64 footprint small (~15-20KB)
        const canvas = document.createElement('canvas');
        const max_width = 400;
        const scale = max_width / img.width;
        canvas.width = max_width;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setCustomThumbnail(compressedDataUrl);
        
        // Clear thumbnail validation error
        if (validationErrors.thumbnail) {
          setValidationErrors((prev) => {
            const next = { ...prev };
            delete next.thumbnail;
            return next;
          });
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const validate = () => {
    const errors = {};
    if (!fields.title.trim()) errors.title = 'Title is required';
    if (!fields.description.trim()) errors.description = 'Description is required';
    if (selectedThumbnail === 'custom' && !customThumbnail) {
      errors.thumbnail = 'Please upload a thumbnail image';
    }
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

    let thumbnailVal = selectedThumbnail;
    if (selectedThumbnail === 'custom' && customThumbnail) {
      thumbnailVal = customThumbnail;
    }

    const descWithTag = thumbnailVal === 'auto'
      ? fields.description.trim()
      : `${fields.description.trim()}\n\n<!--thumbnail: ${thumbnailVal}-->`;

    // Pass plain object — the page component adds teacherId before calling the store
    onSubmit?.({
      title: fields.title.trim(),
      description: descWithTag,
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

      {/* ── Thumbnail Selection ── */}
      <FormField
        id="course-thumbnail"
        label="Course Thumbnail Image"
        error={validationErrors.thumbnail}
      >
        <select
          id="course-thumbnail"
          name="thumbnail"
          value={selectedThumbnail}
          onChange={(e) => setSelectedThumbnail(e.target.value)}
          disabled={loading}
          className={inputClass(validationErrors.thumbnail)}
        >
          <option value="auto">Auto-detect from title/category</option>
          <option value="custom">Upload custom image...</option>
          <option value="web-development">Web Development</option>
          <option value="react">React JS</option>
          <option value="database">Database Systems</option>
          <option value="programming">Programming & Software</option>
          <option value="ui-ux">UI/UX Design</option>
          <option value="cybersecurity">Cybersecurity</option>
          <option value="data-science">Data Science</option>
        </select>
      </FormField>

      {/* ── Custom Image Upload Field ── */}
      {selectedThumbnail === 'custom' && (
        <FormField
          id="course-custom-image"
          label="Upload Image File"
          required={!customThumbnail}
          error={validationErrors.thumbnail}
        >
          <input
            id="course-custom-image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
            className={inputClass(validationErrors.thumbnail)}
          />
          {customThumbnail && (
            <div className="mt-3 relative w-48 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center">
              <img
                src={customThumbnail}
                alt="Uploaded thumbnail preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </FormField>
      )}

      <div className="pt-2">
        <Button
          id="course-form-submit"
          type="submit"
          disabled={loading}
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
        </Button>
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
