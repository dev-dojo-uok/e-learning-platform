import React, { useState, useEffect } from 'react';
import { Loader2, Upload, Link as LinkIcon, AlertCircle } from 'lucide-react';
import useMaterials from '../hooks/useMaterials';

const MAX_FILE_SIZE_MB = 20;

const ALLOWED_EXTENSIONS_MAP = {
  PDF: ['.pdf'],
  DOCUMENT: ['.doc', '.docx'],
  IMAGE: ['.jpg', '.jpeg', '.png', '.webp'],
  ZIP: ['.zip']
};

const ALLOWED_MIME_MAP = {
  PDF: ['application/pdf'],
  DOCUMENT: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  IMAGE: ['image/jpeg', 'image/png', 'image/webp'],
  ZIP: ['application/zip', 'application/x-zip-compressed']
};

const MaterialUpload = ({ moduleId, onSuccess }) => {
  const { uploadMaterial, uploading, uploadProgress, error: storeError, clearError } = useMaterials();

  // Tabs: 'file' | 'link'
  const [activeTab, setActiveTab] = useState('file');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PDF');
  const [file, setFile] = useState(null);
  
  // Link states
  const [contentUrl, setContentUrl] = useState('');
  const [embedCode, setEmbedCode] = useState('');

  const [validationError, setValidationError] = useState('');

  // Switch default types when active tab changes
  useEffect(() => {
    if (activeTab === 'file') {
      setType('PDF');
      setContentUrl('');
      setEmbedCode('');
    } else {
      setType('VIDEO');
      setFile(null);
    }
    setValidationError('');
    clearError();
  }, [activeTab, clearError]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setValidationError('');
    clearError();
  };

  const validateForm = () => {
    if (!title.trim()) {
      return 'Title is required.';
    }

    if (activeTab === 'file') {
      if (!file) {
        return 'Please choose a file to upload.';
      }

      // Check extension
      const ext = `.${file.name.split('.').pop()}`.toLowerCase();
      const allowedExts = ALLOWED_EXTENSIONS_MAP[type] || [];
      if (!allowedExts.includes(ext)) {
        return `Unsupported file type for type ${type}. Expected: ${allowedExts.join(', ')}`;
      }

      // Check size (20MB)
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        return `File exceeds maximum size of ${MAX_FILE_SIZE_MB} MB.`;
      }
    } else {
      if (type === 'VIDEO' && !contentUrl.trim()) {
        return 'Video URL is required.';
      }
      if (type === 'YOUTUBE' && !embedCode.trim()) {
        return 'YouTube URL or Embed code is required.';
      }
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    const errorMsg = validateForm();
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    try {
      const materialData = {
        title: title.trim(),
        description: description.trim(),
        type,
        contentUrl: type === 'VIDEO' ? contentUrl.trim() : undefined,
        embedCode: type === 'YOUTUBE' ? embedCode.trim() : undefined,
      };

      await uploadMaterial(moduleId, materialData, file);
      
      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      setContentUrl('');
      setEmbedCode('');
      
      onSuccess?.('Material uploaded successfully.');
    } catch (err) {
      // Surfaced in storeError
    }
  };

  const getAcceptAttribute = () => {
    const mimes = ALLOWED_MIME_MAP[type] || [];
    const exts = ALLOWED_EXTENSIONS_MAP[type] || [];
    return [...mimes, ...exts].join(',');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-shrink-0">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <h3 className="text-base font-bold text-slate-800">Add Learning Material</h3>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === 'file'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              activeTab === 'link'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            Link URL / Embed
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          
          {/* Validation/API error display */}
          {(validationError || storeError) && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{validationError || storeError}</span>
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="material-title" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="material-title"
              type="text"
              required
              disabled={uploading}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setValidationError('');
              }}
              placeholder="e.g. Slide deck on Microservices"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="material-desc" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description (Optional)
            </label>
            <textarea
              id="material-desc"
              rows={2}
              disabled={uploading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some notes about this material…"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-colors resize-none"
            />
          </div>

          {/* Type Selector */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="material-type" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Resource Type
            </label>
            <select
              id="material-type"
              disabled={uploading}
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setValidationError('');
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-colors"
            >
              {activeTab === 'file' ? (
                <>
                  <option value="PDF">PDF Document</option>
                  <option value="DOCUMENT">Word Document (.doc, .docx)</option>
                  <option value="IMAGE">Image File (JPG, PNG, WebP)</option>
                  <option value="ZIP">ZIP Archive File</option>
                </>
              ) : (
                <>
                  <option value="VIDEO">Video Link (MP4/WEBM URL)</option>
                  <option value="YOUTUBE">YouTube Link or Embed Code</option>
                </>
              )}
            </select>
          </div>

          {/* Tab Content Fields */}
          {activeTab === 'file' ? (
            /* File upload field */
            <div className="flex flex-col gap-1.5 animate-in fade-in duration-150">
              <label htmlFor="material-file" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select File <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="material-file"
                  type="file"
                  disabled={uploading}
                  onChange={handleFileChange}
                  accept={getAcceptAttribute()}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 file:hover:bg-slate-200 cursor-pointer file:cursor-pointer"
                />
              </div>
              <p className="text-slate-400 text-[10px] mt-0.5">
                Maximum size allowed: {MAX_FILE_SIZE_MB} MB. Allowed formats: {ALLOWED_EXTENSIONS_MAP[type]?.join(', ')}
              </p>
            </div>
          ) : (
            /* Link inputs */
            <div className="animate-in fade-in duration-150">
              {type === 'VIDEO' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="material-video-url" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Video Source URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="material-video-url"
                    type="url"
                    required
                    disabled={uploading}
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    placeholder="https://example.com/lecture-video.mp4"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-colors"
                  />
                </div>
              )}
              {type === 'YOUTUBE' && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="material-embed-code" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    YouTube URL or Embed Iframe <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="material-embed-code"
                    rows={2}
                    required
                    disabled={uploading}
                    value={embedCode}
                    onChange={(e) => setEmbedCode(e.target.value)}
                    placeholder="https://www.youtube.com/embed/... or full <iframe> code"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-colors resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Progress bar */}
          {uploading && (
            <div className="flex flex-col gap-1 pt-2 animate-in fade-in duration-200">
              <div className="flex justify-between items-center text-xs font-semibold text-indigo-600">
                <span>Uploading material…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 mt-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Material
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MaterialUpload;
