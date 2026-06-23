import React from 'react';
import { X, Download, FileText, Video, FileArchive } from 'lucide-react';

/**
 * Helper to construct the absolute material asset URL.
 */
const getMaterialUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const serverOrigin = backendBase.replace('/api', '');
  return `${serverOrigin}/${url}`;
};

/**
 * MaterialViewer – Displays a preview modal for different material types.
 *
 * Props:
 *  - material {Object|null} The material object to preview.
 *  - isOpen   {boolean}     True to display the viewer modal.
 *  - onClose  {Function}    Close action callback.
 */
const MaterialViewer = ({ material, isOpen, onClose }) => {
  if (!isOpen || !material) return null;

  const fileUrl = getMaterialUrl(material.contentUrl);

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'PDF': return <FileText className="h-5 w-5 text-red-500" />;
      case 'VIDEO_SRC':
      case 'VIDEO_EMBED': return <Video className="h-5 w-5 text-indigo-500" />;
      case 'FILE': return <FileText className="h-5 w-5 text-blue-500" />;
      default: return <FileText className="h-5 w-5 text-slate-500" />;
    }
  };

  // Determine what preview to render based on backend material fields
  const renderPreview = () => {
    // 1. YouTube Embed
    if (material.type === 'VIDEO_EMBED' && material.embedCode) {
      if (material.embedCode.trim().startsWith('<iframe')) {
        return (
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <div 
              className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
              dangerouslySetInnerHTML={{ __html: material.embedCode }}
            />
          </div>
        );
      }
      return (
        <iframe
          src={material.embedCode}
          title={material.title}
          className="w-full aspect-video rounded-xl border-0 bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // 2. Video Source
    if ((material.type === 'VIDEO_SRC' || material.type === 'VIDEO') && fileUrl) {
      return (
        <video 
          src={fileUrl} 
          controls 
          className="w-full max-h-[65vh] rounded-xl bg-black outline-none"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    // 3. PDF Preview
    if (material.type === 'PDF' && fileUrl) {
      return (
        <iframe
          src={`${fileUrl}#toolbar=1`}
          title={material.title}
          className="w-full h-[65vh] rounded-xl border border-slate-200 bg-slate-50"
        />
      );
    }

    // 4. Image Preview
    const isImageFile = material.contentUrl && /\.(jpg|jpeg|png|webp|gif)$/i.test(material.contentUrl);
    if (isImageFile && fileUrl) {
      return (
        <div className="flex items-center justify-center p-4 bg-slate-50 rounded-xl max-h-[65vh] overflow-auto animate-in fade-in duration-200">
          <img
            src={fileUrl}
            alt={material.title}
            className="max-w-full max-h-[55vh] object-contain rounded-lg shadow-sm"
          />
        </div>
      );
    }

    // 5. Default Fallback (DOCX, ZIP, PPTX)
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center gap-4 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
          {material.contentUrl?.endsWith('.zip') ? (
            <FileArchive className="h-8 w-8" />
          ) : (
            <FileText className="h-8 w-8" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-slate-700">Preview not available</h4>
          <p className="text-sm text-slate-400 mt-1 max-w-sm">
            This file format cannot be viewed directly in the browser. Please download the file to view its contents.
          </p>
        </div>
        <a
          href={fileUrl}
          download
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 min-w-0">
            {getMaterialIcon(material.type)}
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-sm md:text-base truncate">
                {material.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Type: {material.type} • Uploaded: {new Date(material.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {material.contentUrl && (
              <a
                href={fileUrl}
                download
                title="Download"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Download className="h-5 w-5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-lg leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {material.description && (
            <p className="text-sm text-slate-600 mb-4 whitespace-pre-wrap leading-relaxed">
              {material.description}
            </p>
          )}
          {renderPreview()}
        </div>

      </div>
    </div>
  );
};

export default MaterialViewer;
